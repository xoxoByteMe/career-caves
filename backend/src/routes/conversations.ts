import { Router } from "express";
import { supabaseAdmin } from "../lib/supabaseAdmin";
import { requireAuth } from "../middleware/requireAuth";

const conversationsRouter = Router();

async function getNumericUserId(supabaseUuid: string): Promise<number | null> {
  const { data, error } = await supabaseAdmin
    .from("users")
    .select("user_id")
    .eq("supabase_uid", supabaseUuid)
    .single();

  if (error || !data) return null;
  return (data as { user_id: number }).user_id;
}

conversationsRouter.get("/", requireAuth, async (req, res) => {
  try {
    const supabaseUser = res.locals.user as { id: string };
    const currentUserId = await getNumericUserId(supabaseUser.id);

    if (!currentUserId) {
      return res.status(401).json({ error: "User not found" });
    }

    const { data, error } = await supabaseAdmin
  .from("conversations")
  .select(`
    conversation_id,
    listing_id,
    user1_id,
    user2_id,
    created_at,
    listings (
      title
    )
  `)
  .or(`user1_id.eq.${currentUserId},user2_id.eq.${currentUserId}`)
  .order("created_at", { ascending: false });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    const conversationRows = (data ?? []) as Array<{
  conversation_id: number;
  listing_id: number;
  user1_id: number;
  user2_id: number;
  created_at?: string | null;
  listings?: { title?: string | null } | Array<{ title?: string | null }> | null;
}>;

const otherUserIds = Array.from(
  new Set(
    conversationRows.map((conversation) =>
      conversation.user1_id === currentUserId ? conversation.user2_id : conversation.user1_id,
    ),
  ),
);

let usersById = new Map<number, { name: string | null; email: string | null }>();

if (otherUserIds.length > 0) {
  const { data: usersData } = await supabaseAdmin
    .from("users")
    .select("user_id, name, email")
    .in("user_id", otherUserIds);

  usersById = new Map(
    ((usersData ?? []) as Array<{ user_id: number; name: string | null; email: string | null }>).map(
      (user) => [user.user_id, { name: user.name, email: user.email }],
    ),
  );
}

const conversations = conversationRows.map((conversation) => {
  const otherUserId =
    conversation.user1_id === currentUserId ? conversation.user2_id : conversation.user1_id;

  const otherUser = usersById.get(otherUserId) ?? { name: null, email: null };

  const listingTitle = Array.isArray(conversation.listings)
    ? (conversation.listings[0]?.title ?? null)
    : (conversation.listings?.title ?? null);

  return {
  ...conversation,
  current_user_id: currentUserId,
  other_user_id: otherUserId,
  other_user_name: otherUser.name,
  other_user_email: otherUser.email,
  listing_title: listingTitle,
};
});

    return res.json({ data: conversations });
  } catch (error) {
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Failed to load conversations",
    });
  }
});

conversationsRouter.post("/", requireAuth, async (req, res) => {
  try {
    const { listing_id, other_user_id } = req.body as {
      listing_id?: number;
      other_user_id?: number;
    };

    const supabaseUser = res.locals.user as { id: string };
    const currentUserId = await getNumericUserId(supabaseUser.id);

    if (!listing_id || !other_user_id) {
      return res.status(400).json({ error: "listing_id and other_user_id are required" });
    }

    if (!currentUserId) {
      return res.status(401).json({ error: "User not found" });
    }

    const user1_id = Math.min(currentUserId, other_user_id);
    const user2_id = Math.max(currentUserId, other_user_id);

    const { data: existing, error: findError } = await supabaseAdmin
      .from("conversations")
      .select("*")
      .eq("listing_id", listing_id)
      .eq("user1_id", user1_id)
      .eq("user2_id", user2_id)
      .maybeSingle();

    if (findError) {
      return res.status(500).json({ error: findError.message });
    }

    if (existing) {
      return res.json({ data: existing });
    }

    const { data, error } = await supabaseAdmin
      .from("conversations")
      .insert({
        listing_id,
        user1_id,
        user2_id,
      })
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(201).json({ data });
  } catch (error) {
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Failed to create conversation",
    });
  }
});

export default conversationsRouter;