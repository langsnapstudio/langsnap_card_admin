"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import type { Language } from "@/types";

export function LanguageForm({ language }: { language?: Language }) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(language?.name ?? "");
  const [emojiFlag, setEmojiFlag] = useState(language?.emoji_flag ?? "");
  const [supportsPinyin, setSupportsPinyin] = useState(language?.supports_pinyin ?? false);
  const [supportsZhuyin, setSupportsZhuyin] = useState(language?.supports_zhuyin ?? false);
  const [status, setStatus] = useState<"published" | "draft">(language?.status ?? "draft");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !emojiFlag.trim()) {
      toast.error("Name and emoji flag are required.");
      return;
    }
    setLoading(true);

    const payload = {
      name: name.trim(),
      emoji_flag: emojiFlag.trim(),
      supports_pinyin: supportsPinyin,
      supports_zhuyin: supportsZhuyin,
      status,
      updated_at: new Date().toISOString(),
    };

    const { error } = language
      ? await supabase.from("languages").update(payload).eq("id", language.id)
      : await supabase.from("languages").insert(payload);

    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(language ? "Language updated." : "Language created.");
    router.push("/content/languages");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-lg space-y-5 rounded-lg border border-gray-200 bg-white p-6">
      <div className="space-y-1.5">
        <Label htmlFor="name">Name *</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Mandarin Chinese (Taiwan)"
          required
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="emoji">Emoji flag *</Label>
        <Input
          id="emoji"
          value={emojiFlag}
          onChange={(e) => setEmojiFlag(e.target.value)}
          placeholder="🇹🇼"
          required
        />
      </div>
      <div className="space-y-3">
        <Label>Reading systems</Label>
        <div className="flex items-center gap-3">
          <Switch id="pinyin" checked={supportsPinyin} onCheckedChange={setSupportsPinyin} />
          <Label htmlFor="pinyin" className="font-normal">Supports Pinyin</Label>
        </div>
        <div className="flex items-center gap-3">
          <Switch id="zhuyin" checked={supportsZhuyin} onCheckedChange={setSupportsZhuyin} />
          <Label htmlFor="zhuyin" className="font-normal">Supports Zhuyin</Label>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Switch
          id="status"
          checked={status === "published"}
          onCheckedChange={(v) => setStatus(v ? "published" : "draft")}
        />
        <Label htmlFor="status" className="font-normal">
          {status === "published" ? "Published" : "Draft"}
        </Label>
      </div>
      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={loading}>
          {loading ? "Saving…" : language ? "Save changes" : "Create language"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
