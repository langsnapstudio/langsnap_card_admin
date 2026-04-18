"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

interface Section {
  id: string;
  name: string;
  status: "published" | "draft";
  language_id: string;
}

export function SectionForm({
  section,
  languageId,
}: {
  section?: Section;
  languageId: string;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(section?.name ?? "");
  const [status, setStatus] = useState<"published" | "draft">(section?.status ?? "draft");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!name.trim()) { toast.error("Name is required."); return; }
    setLoading(true);

    if (section) {
      const { error } = await supabase
        .from("sections")
        .update({ name: name.trim(), status, updated_at: new Date().toISOString() })
        .eq("id", section.id);
      if (error) { toast.error(error.message); setLoading(false); return; }
    } else {
      const { data: maxPos } = await supabase
        .from("sections")
        .select("order_position")
        .eq("language_id", languageId)
        .order("order_position", { ascending: false })
        .limit(1)
        .single();

      const { error } = await supabase.from("sections").insert({
        name: name.trim(),
        language_id: languageId,
        status,
        order_position: (maxPos?.order_position ?? -1) + 1,
      });
      if (error) { toast.error(error.message); setLoading(false); return; }
    }

    toast.success(section ? "Section updated." : "Section created.");
    router.push(`/content/sections?language_id=${languageId}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-lg space-y-5 rounded-lg border border-gray-200 bg-white p-6">
      <div className="space-y-1.5">
        <Label htmlFor="name">Name *</Label>
        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Themes, HSK" required />
      </div>
      <div className="flex items-center gap-3">
        <Switch id="status" checked={status === "published"} onCheckedChange={(v) => setStatus(v ? "published" : "draft")} />
        <Label htmlFor="status" className="font-normal">{status === "published" ? "Published" : "Draft"}</Label>
      </div>
      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={loading}>{loading ? "Saving…" : section ? "Save changes" : "Create section"}</Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
      </div>
    </form>
  );
}
