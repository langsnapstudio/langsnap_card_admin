"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { FileUpload } from "@/components/ui/file-upload";
import { toast } from "sonner";

interface Deck {
  id: string;
  title: string;
  supporting_title?: string;
  cover_image_url?: string;
  status: "published" | "draft";
  section_id: string;
  pack_count?: number;
}

export function DeckForm({ deck, sectionId }: { deck?: Deck; sectionId: string }) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState(deck?.title ?? "");
  const [supportingTitle, setSupportingTitle] = useState(deck?.supporting_title ?? "");
  const [coverImageUrl, setCoverImageUrl] = useState(deck?.cover_image_url ?? "");
  const [status, setStatus] = useState<"published" | "draft">(deck?.status ?? "draft");

  const packCount = deck?.pack_count ?? 0;
  const canPublish = !deck || packCount > 0;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!title.trim()) { toast.error("Title is required."); return; }
    if (!coverImageUrl) { toast.error("Cover image is required."); return; }
    if (status === "published" && !canPublish) {
      toast.error("Cannot publish a deck with zero packs.");
      return;
    }
    setLoading(true);

    if (deck) {
      const { error } = await supabase.from("decks").update({
        title: title.trim(),
        supporting_title: supportingTitle.trim() || null,
        cover_image_url: coverImageUrl,
        status,
        updated_at: new Date().toISOString(),
      }).eq("id", deck.id);
      if (error) { toast.error(error.message); setLoading(false); return; }
    } else {
      const { data: maxPos } = await supabase
        .from("decks")
        .select("order_position")
        .eq("section_id", sectionId)
        .order("order_position", { ascending: false })
        .limit(1)
        .single();

      const { error } = await supabase.from("decks").insert({
        title: title.trim(),
        supporting_title: supportingTitle.trim() || null,
        cover_image_url: coverImageUrl,
        section_id: sectionId,
        status,
        order_position: (maxPos?.order_position ?? -1) + 1,
      });
      if (error) { toast.error(error.message); setLoading(false); return; }
    }

    toast.success(deck ? "Deck updated." : "Deck created.");
    router.push(`/content/decks?section_id=${sectionId}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-lg space-y-5 rounded-lg border border-gray-200 bg-white p-6">
      <div className="space-y-1.5">
        <Label htmlFor="title">Title *</Label>
        <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Animals" required />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="supporting">Supporting title</Label>
        <Input id="supporting" value={supportingTitle} onChange={(e) => setSupportingTitle(e.target.value)} placeholder="Chinese characters for the deck theme" />
      </div>
      <div className="space-y-1.5">
        <Label>Cover image *</Label>
        <FileUpload
          bucket="deck-covers"
          accept="image/png,image/jpeg,image/webp"
          maxSizeMb={5}
          value={coverImageUrl}
          onChange={setCoverImageUrl}
          onClear={() => setCoverImageUrl("")}
          label="Upload cover image (PNG, JPG, WebP)"
        />
      </div>
      <div className="flex items-center gap-3">
        <Switch
          id="status"
          checked={status === "published"}
          disabled={!canPublish && status !== "published"}
          onCheckedChange={(v) => {
            if (v && !canPublish) { toast.error("Cannot publish a deck with zero packs."); return; }
            setStatus(v ? "published" : "draft");
          }}
        />
        <Label htmlFor="status" className="font-normal">
          {status === "published" ? "Published" : "Draft"}
          {!canPublish && <span className="ml-2 text-xs text-gray-400">(add packs first)</span>}
        </Label>
      </div>
      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={loading}>{loading ? "Saving…" : deck ? "Save changes" : "Create deck"}</Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
      </div>
    </form>
  );
}
