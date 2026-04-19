"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileUpload } from "@/components/ui/file-upload";
import { ColorPicker } from "@/components/ui/color-picker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { CardPreview } from "@/components/ui/card-preview";
import type { CardColor, SubCategory } from "@/types";

interface Card {
  id: string;
  word: string;
  pinyin: string;
  zhuyin?: string;
  meaning: string;
  part_of_speech: string;
  audio_url?: string;
  illustration_url?: string;
  card_color?: CardColor;
  sub_category_id?: string;
  tags?: string[];
  example_sentence_1?: string;
  example_sentence_1_pinyin?: string;
  example_sentence_1_zhuyin?: string;
  example_sentence_1_meaning?: string;
  example_sentence_1_part_of_speech?: string;
  example_sentence_2?: string;
  example_sentence_2_pinyin?: string;
  example_sentence_2_zhuyin?: string;
  example_sentence_2_meaning?: string;
  example_sentence_2_part_of_speech?: string;
  status: "published" | "draft";
}

interface CardFormProps {
  card?: Card;
  packId: string;
  supportsZhuyin: boolean;
  subCategories: SubCategory[];
}

const PARTS_OF_SPEECH = ["n.", "v.", "adj.", "adv.", "phrase", "pron.", "prep.", "conj.", "interj.", "measure word"];

export function CardForm({ card, packId, supportsZhuyin, subCategories }: CardFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  const [word, setWord] = useState(card?.word ?? "");
  const [pinyin, setPinyin] = useState(card?.pinyin ?? "");
  const [zhuyin, setZhuyin] = useState(card?.zhuyin ?? "");
  const [meaning, setMeaning] = useState(card?.meaning ?? "");
  const [pos, setPos] = useState(card?.part_of_speech ?? "");
  const [audioUrl, setAudioUrl] = useState(card?.audio_url ?? "");
  const [illustrationUrl, setIllustrationUrl] = useState(card?.illustration_url ?? "");
  const [cardColor, setCardColor] = useState<CardColor | undefined>(card?.card_color);
  const [subCategoryId, setSubCategoryId] = useState<string>(card?.sub_category_id ?? "");
  const [tags, setTags] = useState(card?.tags?.join(", ") ?? "");
  const [status, setStatus] = useState<"published" | "draft">(card?.status ?? "draft");

  const [ex1, setEx1] = useState(card?.example_sentence_1 ?? "");
  const [ex1Pinyin, setEx1Pinyin] = useState(card?.example_sentence_1_pinyin ?? "");
  const [ex1Zhuyin, setEx1Zhuyin] = useState(card?.example_sentence_1_zhuyin ?? "");
  const [ex1Meaning, setEx1Meaning] = useState(card?.example_sentence_1_meaning ?? "");
  const [ex1Pos, setEx1Pos] = useState(card?.example_sentence_1_part_of_speech ?? "");

  const [ex2, setEx2] = useState(card?.example_sentence_2 ?? "");
  const [ex2Pinyin, setEx2Pinyin] = useState(card?.example_sentence_2_pinyin ?? "");
  const [ex2Zhuyin, setEx2Zhuyin] = useState(card?.example_sentence_2_zhuyin ?? "");
  const [ex2Meaning, setEx2Meaning] = useState(card?.example_sentence_2_meaning ?? "");
  const [ex2Pos, setEx2Pos] = useState(card?.example_sentence_2_part_of_speech ?? "");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!word.trim() || !pinyin.trim() || !meaning.trim() || !pos) {
      toast.error("Word, pinyin, meaning, and part of speech are required.");
      return;
    }
    setLoading(true);

    const payload = {
      word: word.trim(),
      pinyin: pinyin.trim(),
      zhuyin: zhuyin.trim() || null,
      meaning: meaning.trim(),
      part_of_speech: pos,
      audio_url: audioUrl || null,
      illustration_url: illustrationUrl || null,
      card_color: cardColor ?? null,
      sub_category_id: subCategoryId || null,
      tags: tags.trim() ? tags.split(",").map((t) => t.trim()).filter(Boolean) : null,
      example_sentence_1: ex1.trim() || null,
      example_sentence_1_pinyin: ex1Pinyin.trim() || null,
      example_sentence_1_zhuyin: ex1Zhuyin.trim() || null,
      example_sentence_1_meaning: ex1Meaning.trim() || null,
      example_sentence_1_part_of_speech: ex1Pos || null,
      example_sentence_2: ex2.trim() || null,
      example_sentence_2_pinyin: ex2Pinyin.trim() || null,
      example_sentence_2_zhuyin: ex2Zhuyin.trim() || null,
      example_sentence_2_meaning: ex2Meaning.trim() || null,
      example_sentence_2_part_of_speech: ex2Pos || null,
      status,
      updated_at: new Date().toISOString(),
    };

    if (card) {
      const { error } = await supabase.from("cards").update(payload).eq("id", card.id);
      if (error) { toast.error(error.message); setLoading(false); return; }
    } else {
      const { data: maxPos } = await supabase
        .from("cards")
        .select("order_position")
        .eq("pack_id", packId)
        .order("order_position", { ascending: false })
        .limit(1)
        .single();

      const { error } = await supabase.from("cards").insert({
        ...payload,
        pack_id: packId,
        order_position: (maxPos?.order_position ?? -1) + 1,
      });
      if (error) { toast.error(error.message); setLoading(false); return; }
    }

    toast.success(card ? "Card updated." : "Card created.");
    router.push(`/content/cards?pack_id=${packId}`);
    router.refresh();
  }

  function field(label: string, required: boolean, children: React.ReactNode) {
    return (
      <div className="space-y-1.5">
        <Label className={required ? "after:content-['*'] after:ml-0.5 after:text-red-500" : ""}>{label}</Label>
        {children}
      </div>
    );
  }

  const subCategoryName = subCategories.find((sc) => sc.id === subCategoryId)?.name;

  return (
    <div className="flex gap-8 items-start">
    <form onSubmit={handleSubmit} className="flex-1 max-w-2xl space-y-6">
      <div className="rounded-lg border border-gray-200 bg-white p-6 space-y-5">
        <h2 className="text-base font-semibold">Core fields</h2>

        {field("Word", true, <Input value={word} onChange={(e) => setWord(e.target.value)} placeholder="e.g. 狗" required />)}
        {field("Pinyin", true, <Input value={pinyin} onChange={(e) => setPinyin(e.target.value)} placeholder="e.g. gou3" required />)}
        {supportsZhuyin && field("Zhuyin", false, <Input value={zhuyin} onChange={(e) => setZhuyin(e.target.value)} placeholder="e.g. ㄍㄡˇ" />)}
        {field("Meaning", true, <Input value={meaning} onChange={(e) => setMeaning(e.target.value)} placeholder="e.g. Dog" required />)}

        {field("Part of speech", true,
          <Select value={pos} onValueChange={(v) => setPos(v ?? "")} required>
            <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
            <SelectContent>
              {PARTS_OF_SPEECH.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
            </SelectContent>
          </Select>
        )}

        {field("Sub-category", false,
          <Select value={subCategoryId} onValueChange={(v) => setSubCategoryId(v ?? "")}>
            <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="">None</SelectItem>
              {subCategories.map((sc) => <SelectItem key={sc.id} value={sc.id}>{sc.name}</SelectItem>)}
            </SelectContent>
          </Select>
        )}

        {field("Tags", false,
          <Input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="e.g. HSK 1, TOCFL Band A (comma-separated)" />
        )}
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6 space-y-5">
        <h2 className="text-base font-semibold">Media</h2>

        {field("Audio (MP3 or M4A)", false,
          <FileUpload
            bucket="card-audio"
            accept="audio/mpeg,audio/mp4,audio/x-m4a,.mp3,.m4a"
            maxSizeMb={10}
            value={audioUrl}
            onChange={setAudioUrl}
            onClear={() => setAudioUrl("")}
            label="Upload audio file"
            type="audio"
          />
        )}

        {field("Illustration (PNG, JPG, WebP)", false,
          <FileUpload
            bucket="card-illustrations"
            accept="image/png,image/jpeg,image/webp"
            maxSizeMb={5}
            value={illustrationUrl}
            onChange={setIllustrationUrl}
            onClear={() => setIllustrationUrl("")}
            label="Upload illustration"
          />
        )}

        <div className="space-y-2">
          <Label>Card colour override</Label>
          <p className="text-xs text-gray-400">Leave unset for no colour override</p>
          <ColorPicker value={cardColor} onChange={setCardColor} />
          {cardColor && (
            <button type="button" onClick={() => setCardColor(undefined)} className="text-xs text-gray-400 hover:text-gray-600 underline">
              Reset to pack colour
            </button>
          )}
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6 space-y-5">
        <h2 className="text-base font-semibold">Example sentence 1</h2>
        {field("Chinese text", false, <Input value={ex1} onChange={(e) => setEx1(e.target.value)} placeholder="Chinese sentence" />)}
        {field("Pinyin", false, <Input value={ex1Pinyin} onChange={(e) => setEx1Pinyin(e.target.value)} />)}
        {supportsZhuyin && field("Zhuyin", false, <Input value={ex1Zhuyin} onChange={(e) => setEx1Zhuyin(e.target.value)} />)}
        {field("English translation", false, <Input value={ex1Meaning} onChange={(e) => setEx1Meaning(e.target.value)} />)}
        {field("Part of speech", false,
          <Select value={ex1Pos} onValueChange={(v) => setEx1Pos(v ?? "")}>
            <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="">—</SelectItem>
              {PARTS_OF_SPEECH.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
            </SelectContent>
          </Select>
        )}
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6 space-y-5">
        <h2 className="text-base font-semibold">Example sentence 2</h2>
        {field("Chinese text", false, <Input value={ex2} onChange={(e) => setEx2(e.target.value)} placeholder="Chinese sentence" />)}
        {field("Pinyin", false, <Input value={ex2Pinyin} onChange={(e) => setEx2Pinyin(e.target.value)} />)}
        {supportsZhuyin && field("Zhuyin", false, <Input value={ex2Zhuyin} onChange={(e) => setEx2Zhuyin(e.target.value)} />)}
        {field("English translation", false, <Input value={ex2Meaning} onChange={(e) => setEx2Meaning(e.target.value)} />)}
        {field("Part of speech", false,
          <Select value={ex2Pos} onValueChange={(v) => setEx2Pos(v ?? "")}>
            <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="">—</SelectItem>
              {PARTS_OF_SPEECH.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
            </SelectContent>
          </Select>
        )}
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6 space-y-1.5">
        <Label>Status</Label>
        <div className="flex gap-6">
          <label className="flex items-center gap-2 cursor-pointer text-sm">
            <input type="radio" name="status" value="draft" checked={status === "draft"} onChange={() => setStatus("draft")} className="accent-black" />
            Draft
          </label>
          <label className="flex items-center gap-2 cursor-pointer text-sm">
            <input type="radio" name="status" value="published" checked={status === "published"} onChange={() => setStatus("published")} className="accent-black" />
            Published
          </label>
        </div>
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={loading}>{loading ? "Saving…" : card ? "Save changes" : "Create card"}</Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
      </div>
    </form>

    <CardPreview
      word={word}
      pinyin={pinyin}
      zhuyin={zhuyin}
      meaning={meaning}
      pos={pos}
      cardColor={cardColor}
      illustrationUrl={illustrationUrl}
      subCategoryName={subCategoryName}
      tags={tags}
      ex1={ex1}
      ex1Pinyin={ex1Pinyin}
      ex1Zhuyin={ex1Zhuyin}
      ex1Meaning={ex1Meaning}
      ex2={ex2}
      ex2Pinyin={ex2Pinyin}
      ex2Zhuyin={ex2Zhuyin}
      ex2Meaning={ex2Meaning}
      supportsZhuyin={supportsZhuyin}
    />
    </div>
  );
}
