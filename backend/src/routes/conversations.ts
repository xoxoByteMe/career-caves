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