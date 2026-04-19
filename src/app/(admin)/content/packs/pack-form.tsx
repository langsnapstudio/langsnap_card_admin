"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface Pack {
  id: string;
  title: string;
  is_free: boolean;
  thumbnail_emoji?: string;
  status: "published" | "draft";
  deck_id: string;
  card_count?: number;
}

export function PackForm({ pack, deckId }: { pack?: Pack; deckId: string }) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState(pack?.title ?? "");
  const [isFree, setIsFree] = useState(pack?.is_free ?? false);
  const [thumbnailEmoji, setThumbnailEmoji] = useState(pack?.thumbnail_emoji ?? "");
  const [status, setStatus] = useState<"published" | "draft">(pack?.status ?? "draft");

  const cardCount = pack?.card_count ?? 0;
  const canPublish = !pack || cardCount > 0;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!title.trim()) { toast.error("Title is required."); return; }
    if (!thumbnailEmoji.trim()) { toast.error("Thumbnail emoji is required."); return; }
    if (status === "published" && !canPublish) {
      toast.error("Cannot publish a pack with zero cards.");
      return;
    }
    setLoading(true);

    if (pack) {
      const { error } = await supabase.from("packs").update({
        title: title.trim(),
        is_free: isFree,
        thumbnail_emoji: thumbnailEmoji.trim(),
        status,
        updated_at: new Date().toISOString(),
      }).eq("id", pack.id);
      if (error) { toast.error(error.message); setLoading(false); return; }
    } else {
      const { data: maxPos } = await supabase
        .from("packs")
        .select("order_position")
        .eq("deck_id", deckId)
        .order("order_position", { ascending: false })
        .limit(1)
        .single();

      const { error } = await supabase.from("packs").insert({
        title: title.trim(),
        deck_id: deckId,
        energy_cost: 1,
        is_free: isFree,
        thumbnail_emoji: thumbnailEmoji.trim(),
        status,
        order_position: (maxPos?.order_position ?? -1) + 1,
      });
      if (error) { toast.error(error.message); setLoading(false); return; }
    }

    toast.success(pack ? "Pack updated." : "Pack created.");
    router.push(`/content/packs?deck_id=${deckId}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-lg space-y-5 rounded-lg border border-gray-200 bg-white p-6">
      <div className="space-y-1.5">
        <Label htmlFor="title">Pack title *</Label>
        <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Lv. 1" required />
      </div>

      <div className="space-y-1.5">
        <Label>Pricing</Label>
        <div className="flex gap-6">
          <label className="flex items-center gap-2 cursor-pointer text-sm">
            <input type="radio" name="pricing" value="free" checked={isFree} onChange={() => setIsFree(true)} className="accent-black" />
            Free
          </label>
          <label className="flex items-center gap-2 cursor-pointer text-sm">
            <input type="radio" name="pricing" value="premium" checked={!isFree} onChange={() => setIsFree(false)} className="accent-black" />
            Premium
          </label>
        </div>
      </div>

      <div className="rounded-md bg-gray-50 px-3 py-2 text-sm text-gray-500">
        {isFree ? <strong>Free</strong> : <>Energy cost: <strong>1</strong> (fixed for MVP)</>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="thumbnail-emoji">Thumbnail emoji *</Label>
        <div className="flex items-center gap-3">
          <Input
            id="thumbnail-emoji"
            value={thumbnailEmoji}
            onChange={(e) => setThumbnailEmoji(e.target.value)}
            placeholder="e.g. 📚"
            className="text-2xl w-24 text-center"
            maxLength={4}
          />
          {thumbnailEmoji && (
            <span className="text-5xl leading-none">{thumbnailEmoji}</span>
          )}
        </div>
        <p className="text-xs text-gray-400">Paste a system emoji to use as the pack thumbnail</p>
      </div>

      <div className="space-y-1.5">
        <Label>Status</Label>
        <div className="flex gap-6">
          <label className="flex items-center gap-2 cursor-pointer text-sm">
            <input type="radio" name="status" value="draft" checked={status === "draft"} onChange={() => setStatus("draft")} className="accent-black" />
            Draft
          </label>
          <label className="flex items-center gap-2 cursor-pointer text-sm">
            <input type="radio" name="status" value="published" checked={status === "published"}
              onChange={() => {
                if (!canPublish) { toast.error("Cannot publish a pack with zero cards."); return; }
                setStatus("published");
              }}
              className="accent-black" />
            Published
            {!canPublish && <span className="text-xs text-gray-400">(add cards first)</span>}
          </label>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={loading}>{loading ? "Saving…" : pack ? "Save changes" : "Create pack"}</Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
      </div>
    </form>
  );
}
