import { Router } from "express";
import { supabaseAdmin } from "../lib/supabaseAdmin";

const conversationsRouter = Router();

conversationsRouter.post("/", async (req, res) => {
  try {
    const { listing_id, current_user_id, other_user_id } = req.body as {
      listing_id?: number;
      current_user_id?: number;
      other_user_id?: number;
    };

    if (!listing_id || !current_user_id || !other_user_id) {
      return res.status(400).json({ error: "listing_id, current_user_id, and other_user_id are required" });
    }

    const user1_id = Math.min(current_user_id, other_user_id);
    const user2_id = Math.max(current_user_id, other_user_id);

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