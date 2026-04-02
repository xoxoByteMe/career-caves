import { Router } from 'express';
import multer from 'multer';
import { randomUUID } from 'node:crypto';
import { env } from '../lib/env';
import { supabaseAdmin } from '../lib/supabaseAdmin';

const listingsRouter = Router();
const listingImagesBucket = env.supabaseListingImagesBucket;
const allowedImageMimeTypes: Record<string, string> = {
  'image/gif': 'gif',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

async function rollbackListingCreation(listingId: number) {
  await supabaseAdmin.from('listings').delete().eq('listing_id', listingId);
}

listingsRouter.get('/', async (_req, res) => {
  const { data, error } = await supabaseAdmin
    .from('listings')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  // For each listing, check storage for an image
  const listings = await Promise.all(
    (data ?? []).map(async (listing: Record<string, unknown>) => {
      const listingId = listing.listing_id;
      const { data: files } = await supabaseAdmin.storage
        .from(listingImagesBucket)
        .list(`listings/${listingId}`);

      let image_url: string | null = null;
      if (files && files.length > 0) {
        const { data: { publicUrl } } = supabaseAdmin.storage
          .from(listingImagesBucket)
          .getPublicUrl(`listings/${listingId}/${files[0].name}`);
        image_url = publicUrl;
      }

      return { ...listing, image_url };
    }),
  );

  return res.json({ data: listings });
});

listingsRouter.post('/', upload.single('image'), async (req, res) => {
  const { title, pricePerDay, category, user_id } = req.body as {
    user_id?: string;
    title?: string;
    pricePerDay?: string;
    category?: string;
  };

  const parsedUserId = Number(user_id);
  const parsedPricePerDay = Number(pricePerDay);

  if (!title || Number.isNaN(parsedPricePerDay)) {
    return res.status(400).json({ error: 'title and pricePerDay are required' });
  }

  if (Number.isNaN(parsedUserId)) {
    return res.status(400).json({ error: 'user_id is required and must be a number' });
  }

  if (req.file) {
    if (req.file.size === 0) {
      return res.status(400).json({ error: 'Uploaded image file is empty' });
    }

    if (!allowedImageMimeTypes[req.file.mimetype]) {
      return res.status(400).json({
        error: 'Unsupported image type. Use JPEG, PNG, WebP, or GIF.',
      });
    }
  }

  // ── Step 1: Insert the listing row into the "listings" table ──
  // This creates the database record first so we have a listing_id to
  // organise the image under in storage. .select('*').single() returns
  // the newly created row so we can read listing_id immediately.
  const { data: listingData, error: listingError } = await supabaseAdmin
    .from('listings')
    .insert({
      title,
      price_per_day: parsedPricePerDay,
      category: category ?? null,
      user_id: parsedUserId,
    })
    .select('*')
    .single();

  if (listingError) {
    return res.status(400).json({ error: listingError.message });
  }

  let imageUrl: string | null = null;

  if (req.file) {
    const listingId = (listingData as { listing_id?: number; id?: number }).listing_id ?? (listingData as { id?: number }).id;

    if (!listingId) {
      return res.status(500).json({ error: 'Unable to resolve listing id for image upload' });
    }

    // ── Step 2: Build a unique storage path for the image ──
    // Images are stored in the Supabase Storage bucket at:
    //   listings/{listing_id}/{random-uuid}.{extension}
    // The UUID prevents filename collisions if multiple images are uploaded.
    const safeExtension = allowedImageMimeTypes[req.file.mimetype];
    const imagePath = `listings/${listingId}/${randomUUID()}.${safeExtension}`;

    // ── Step 3: Upload the raw image bytes to Supabase Storage ──
    // We call the Supabase Storage REST API directly with fetch() instead
    // of using the JS client's .upload() method. The JS client can corrupt
    // Node.js Buffer data during serialisation, so sending the raw bytes
    // via fetch with the correct Content-Type header avoids that issue.
    //
    // Required headers:
    //   - apikey: the service role key (needed by the Supabase API gateway)
    //   - Authorization: Bearer token for auth (same service role key)
    //   - Content-Type: the image MIME type (e.g. image/jpeg) so Supabase
    //     stores it with the correct type and browsers can render it
    //   - x-upsert: 'false' to prevent overwriting existing files
    const uploadUrl = `${env.supabaseUrl}/storage/v1/object/${encodeURIComponent(listingImagesBucket)}/${imagePath}`;
    const uploadRes = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        'apikey': env.supabaseServiceRoleKey,
        'Authorization': `Bearer ${env.supabaseServiceRoleKey}`,
        'Content-Type': req.file.mimetype,
        'x-upsert': 'false',
      },
      body: new Uint8Array(req.file.buffer),
    });

    // If the upload failed, roll back the listing row we created in Step 1
    // so we don't leave orphaned listings in the database.
    if (!uploadRes.ok) {
      const errText = await uploadRes.text();
      await rollbackListingCreation(listingId);

      if (errText.toLowerCase().includes('bucket not found')) {
        return res.status(400).json({
          error: `Storage bucket '${listingImagesBucket}' was not found. Create it in Supabase Dashboard > Storage or set SUPABASE_LISTING_IMAGES_BUCKET in backend .env.`,
        });
      }
      return res.status(400).json({ error: errText || 'Image upload failed' });
    }

    // ── Step 4: Generate the public URL for the uploaded image ──
    // Since the bucket is set to public in Supabase, getPublicUrl() returns
    // a URL like: https://<project>.supabase.co/storage/v1/object/public/caves-images/listings/27/abc.jpg
    // This URL can be used directly in <img> tags on the frontend.
    const {
      data: { publicUrl },
    } = supabaseAdmin.storage.from(listingImagesBucket).getPublicUrl(imagePath);
    imageUrl = publicUrl;

    // ── Step 5: Save the image URL to the "listingimages" table ──
    // This creates a row linking the listing_id to the public URL of the
    // image we just uploaded. The frontend GET /api/listings endpoint can
    // then look up images by listing_id (either via this table or by
    // listing files in the storage bucket directly).
    // If this insert fails, we clean up both the storage file and the
    // listing row to keep everything consistent.
    const { error: listingImageError } = await supabaseAdmin.from('listingimages').insert({
      listing_id: listingId,
      image_url: imageUrl,
    });

    if (listingImageError) {
      await supabaseAdmin.storage.from(listingImagesBucket).remove([imagePath]);
      await rollbackListingCreation(listingId);
      return res.status(400).json({ error: listingImageError.message });
    }
  }

  return res.status(201).json({ data: { ...listingData, image_url: imageUrl } });
});

export default listingsRouter;
