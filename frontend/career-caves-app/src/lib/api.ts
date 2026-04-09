export interface Listing {
  listing_id?: number;
  id?: number;
  user_id?: number;
  title: string;
  price_per_day: number;
  category?: string | null;
  image_url?: string | null;
}

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000').trim();

async function parseJsonResponse<T>(response: Response): Promise<T> {
  const rawBody = await response.text();
  let payload: { data?: T; error?: string };

  try {
    payload = JSON.parse(rawBody) as { data?: T; error?: string };
  } catch {
    const preview = rawBody.slice(0, 120).replace(/\s+/g, ' ').trim();
    throw new Error(`Expected JSON from API but received non-JSON response (${response.status} ${response.statusText}): ${preview}`);
  }

  if (!response.ok) {
    throw new Error(payload.error ?? 'Request failed');
  }

  if (payload.data === undefined) {
    throw new Error('Response did not include data');
  }

  return payload.data;
}

// listingsRouter.get('/', async (_req, res) => {
export async function getListings(): Promise<Listing[]> {
  const response = await fetch(`${apiBaseUrl}/api/listings`);
  return parseJsonResponse<Listing[]>(response);
}

// listingsRouter.post('/', async (req, res) => {
// user_id is set to 1 for now since we don't have login set up, but we'll want to include it in the future when we do
export async function createListing(input: {
  user_id: number;
  title: string;
  pricePerDay: number;
  category?: string;
  image?: File;
}): Promise<Listing> {
  // Use multipart/form-data so we can send both text fields and an optional image file.
  const formData = new FormData();
  formData.append('user_id', String(input.user_id));
  formData.append('title', input.title);
  formData.append('pricePerDay', String(input.pricePerDay));

  if (input.category) {
    formData.append('category', input.category);
  }

  if (input.image) {
    formData.append('image', input.image);
  }

  // The backend creates the listing, uploads the image (if provided), and returns the created row.
  const response = await fetch(`${apiBaseUrl}/api/listings`, {
    method: 'POST',
    body: formData,
  });

  // parseJsonResponse throws on non-2xx and returns payload.data on success.
  return parseJsonResponse<Listing>(response);
}

// listingsRouter.patch('/:id', ...)
export async function updateListing(
  listingId: number,
  input: {
    user_id: number;
    title: string;
    pricePerDay: number;
    category?: string;
    image?: File;
  },
): Promise<Listing> {
  const formData = new FormData();
  formData.append('user_id', String(input.user_id));
  formData.append('title', input.title);
  formData.append('pricePerDay', String(input.pricePerDay));

  if (input.category) {
    formData.append('category', input.category);
  }

  if (input.image) {
    formData.append('image', input.image);
  }

  const response = await fetch(`${apiBaseUrl}/api/listings/${listingId}`, {
    method: 'PATCH',
    body: formData,
  });

  return parseJsonResponse<Listing>(response);
}
