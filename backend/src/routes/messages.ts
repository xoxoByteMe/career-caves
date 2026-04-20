import { Router } from "express";
import { supabaseAdmin } from "../lib/supabaseAdmin";

const messagesRouter = Router();

messagesRouter.get("/:conversationId", async (req, res) => {
  try {
    const conversationId = Number(req.params.conversationId);

    if (Number.isNaN(conversationId)) {
      return res.status(400).json({ error: "Invalid conversation id" });
    }

    const { data, error } = await supabaseAdmin
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.json({ data: data ?? [] });
  } catch (error) {
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Failed to load messages",
    });
  }
});

messagesRouter.post("/", async (req, res) => {
  try {
    const { conversation_id, sender_id, body } = req.body as {
      conversation_id?: number;
      sender_id?: number;
      body?: string;
    };

    if (!conversation_id || !sender_id || !body?.trim()) {
      return res.status(400).json({ error: "conversation_id, sender_id, and body are required" });
    }

    const { data, error } = await supabaseAdmin
      .from("messages")
      .insert({
        conversation_id,
        sender_id,
        body: body.trim(),
      })
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(201).json({ data });
  } catch (error) {
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Failed to send message",
    });
  }
});

export default messagesRouter;