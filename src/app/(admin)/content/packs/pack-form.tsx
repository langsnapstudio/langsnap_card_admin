"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { FileUpload } from "@/components/ui/file-upload";
import { ColorPicker } from "@/components/ui/color-picker";
import { toast } from "sonner";
import type { CardColor } from "@/types";

interface Pack {
  id: string;
  title: string;
  is_free: boolean;
  card_color: CardColor;
  thumbnail_url?: string;
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
  const [cardColor, setCardColor] = useState<CardColor | undefined>(pack?.card_color);
  const [thumbnailUrl, setThumbnailUrl] = useState(pack?.thumbnail_url ?? "");
  const [status, setStatus] = useState<"published" | "draft">(pack?.status ?? "draft");

  const cardCount = pack?.card_count ?? 0;
  const canPublish = !pack || cardCount > 0;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!title.trim()) { toast.error("Title is required."); return; }
    if (!cardColor) { toast.error("Card colour is required."); return; }
    if (!thumbnailUrl) { toast.error("Thumbnail image is required."); return; }
    if (status === "published" && !canPublish) {
      toast.error("Cannot publish a pack with zero cards.");
      return;
    }
    setLoading(true);

    if (pack) {
      const { error } = await supabase.from("packs").update({
        title: title.trim(),
        is_free: isFree,
        card_color: cardColor,
        thumbnail_url: thumbnailUrl,
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
        card_color: cardColor,
        thumbnail_url: thumbnailUrl,
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

      <div className="flex items-center gap-3">
        <Switch id="is-free" checked={isFree} onCheckedChange={setIsFree} />
        <Label htmlFor="is-free" className="font-normal">{isFree ? "Free" : "Premium"}</Label>
      </div>

      <div className="rounded-md bg-gray-50 px-3 py-2 text-sm text-gray-500">
        Energy cost: <strong>1</strong> (fixed for MVP)
      </div>

      <div className="space-y-2">
        <Label>Card colour *</Label>
        <ColorPicker value={cardColor} onChange={setCardColor} />
      </div>

      <div className="space-y-1.5">
        <Label>Thumbnail illustration *</Label>
        <FileUpload
          bucket="pack-thumbnails"
          accept="image/png,image/jpeg,image/webp"
          maxSizeMb={5}
          value={thumbnailUrl}
          onChange={setThumbnailUrl}
          onClear={() => setThumbnailUrl("")}
          label="Upload thumbnail (PNG, JPG, WebP)"
        />
      </div>

      <div className="flex items-center gap-3">
        <Switch
          id="status"
          checked={status === "published"}
          onCheckedChange={(v) => {
            if (v && !canPublish) { toast.error("Cannot publish a pack with zero cards."); return; }
            setStatus(v ? "published" : "draft");
          }}
        />
        <Label htmlFor="status" className="font-normal">
          {status === "published" ? "Published" : "Draft"}
          {!canPublish && <span className="ml-2 text-xs text-gray-400">(add cards first)</span>}
        </Label>
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={loading}>{loading ? "Saving…" : pack ? "Save changes" : "Create pack"}</Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
      </div>
    </form>
  );
}
