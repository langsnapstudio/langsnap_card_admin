"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { read, utils } from "xlsx";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Upload, CheckCircle, XCircle, AlertCircle } from "lucide-react";

const REQUIRED_COLS = ["word", "pinyin", "meaning", "partOfSpeech"] as const;
const MAX_ROWS = 500;

interface Row {
  word: string;
  pinyin: string;
  meaning: string;
  partOfSpeech: string;
  zhuyin?: string;
  tags?: string;
  exampleSentence1?: string;
  exampleSentence1Pinyin?: string;
  exampleSentence1Zhuyin?: string;
  exampleSentence1Meaning?: string;
  exampleSentence1PartOfSpeech?: string;
  exampleSentence2?: string;
  exampleSentence2Pinyin?: string;
  exampleSentence2Zhuyin?: string;
  exampleSentence2Meaning?: string;
  exampleSentence2PartOfSpeech?: string;
  subCategory?: string;
}

interface ImportResult {
  imported: number;
  skipped: { rowNum: number; word?: string; reason: string }[];
}

export function BulkImport({
  packId,
  deckId,
  supportsZhuyin,
  existingWords,
  subCategories,
}: {
  packId: string;
  deckId: string;
  supportsZhuyin: boolean;
  existingWords: string[];
  subCategories: { id: string; name: string }[];
}) {
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [fileName, setFileName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const supabase = createClient();

  async function handleFile(file: File) {
    setFileName(file.name);
    setImporting(true);
    setResult(null);

    try {
      const buffer = await file.arrayBuffer();
      const wb = read(buffer, { type: "array" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rawRows = utils.sheet_to_json<Record<string, unknown>>(ws, { defval: "" });

      if (rawRows.length > MAX_ROWS) {
        toast.error(`File exceeds ${MAX_ROWS} rows. Please split into smaller files.`);
        setImporting(false);
        return;
      }

      const skipped: ImportResult["skipped"] = [];
      const toInsert: Record<string, unknown>[] = [];

      const subCatMap = Object.fromEntries(
        subCategories.map((sc) => [sc.name.toLowerCase(), sc.id])
      );

      for (let i = 0; i < rawRows.length; i++) {
        const row = rawRows[i] as Record<string, string>;
        const rowNum = i + 2;
        const word = String(row.word ?? "").trim();
        const pinyin = String(row.pinyin ?? "").trim();
        const meaning = String(row.meaning ?? "").trim();
        const partOfSpeech = String(row.partOfSpeech ?? "").trim();

        const missingRequired = REQUIRED_COLS.filter((col) => !String(row[col] ?? "").trim());
        if (missingRequired.length > 0) {
          skipped.push({ rowNum, word: word || undefined, reason: `Missing required fields: ${missingRequired.join(", ")}` });
          continue;
        }

        if (existingWords.includes(word)) {
          skipped.push({ rowNum, word, reason: "Duplicate: word already exists in this pack" });
          continue;
        }

        const subCatName = String(row.subCategory ?? "").trim();
        let subCategoryId: string | null = null;
        if (subCatName) {
          const subCatId = subCatMap[subCatName.toLowerCase()];
          if (!subCatId) {
            skipped.push({ rowNum, word, reason: `Sub-category "${subCatName}" not found in this deck` });
            continue;
          }
          subCategoryId = subCatId;
        }

        const tagsRaw = String(row.tags ?? "").trim();
        const tags = tagsRaw ? tagsRaw.split(",").map((t: string) => t.trim()).filter(Boolean) : null;

        toInsert.push({
          pack_id: packId,
          word,
          pinyin,
          meaning,
          part_of_speech: partOfSpeech,
          zhuyin: supportsZhuyin ? String(row.zhuyin ?? "").trim() || null : null,
          tags,
          sub_category_id: subCategoryId,
          example_sentence_1: String(row.exampleSentence1 ?? "").trim() || null,
          example_sentence_1_pinyin: String(row.exampleSentence1Pinyin ?? "").trim() || null,
          example_sentence_1_zhuyin: supportsZhuyin ? String(row.exampleSentence1Zhuyin ?? "").trim() || null : null,
          example_sentence_1_meaning: String(row.exampleSentence1Meaning ?? "").trim() || null,
          example_sentence_1_part_of_speech: String(row.exampleSentence1PartOfSpeech ?? "").trim() || null,
          example_sentence_2: String(row.exampleSentence2 ?? "").trim() || null,
          example_sentence_2_pinyin: String(row.exampleSentence2Pinyin ?? "").trim() || null,
          example_sentence_2_zhuyin: supportsZhuyin ? String(row.exampleSentence2Zhuyin ?? "").trim() || null : null,
          example_sentence_2_meaning: String(row.exampleSentence2Meaning ?? "").trim() || null,
          example_sentence_2_part_of_speech: String(row.exampleSentence2PartOfSpeech ?? "").trim() || null,
          status: "draft",
          order_position: existingWords.length + toInsert.length,
        });
      }

      if (toInsert.length > 0) {
        const { error } = await supabase.from("cards").insert(toInsert);
        if (error) {
          toast.error(`Import failed: ${error.message}`);
          setImporting(false);
          return;
        }
      }

      setResult({ imported: toInsert.length, skipped });
      if (toInsert.length > 0) router.refresh();
    } catch (err) {
      toast.error("Failed to parse file. Make sure it's a valid .xlsx file.");
    }

    setImporting(false);
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="rounded-lg border border-gray-200 bg-white p-6 space-y-4">
        <h2 className="text-base font-semibold">Required columns</h2>
        <div className="grid grid-cols-2 gap-2 text-sm">
          {["word", "pinyin", "meaning", "partOfSpeech"].map((col) => (
            <div key={col} className="font-mono text-xs bg-gray-50 rounded px-2 py-1">{col}</div>
          ))}
        </div>
        <h2 className="text-base font-semibold pt-2">Optional columns</h2>
        <div className="grid grid-cols-2 gap-2 text-sm">
          {[
            "zhuyin", "tags", "subCategory",
            "exampleSentence1", "exampleSentence1Pinyin", supportsZhuyin && "exampleSentence1Zhuyin",
            "exampleSentence1Meaning", "exampleSentence1PartOfSpeech",
            "exampleSentence2", "exampleSentence2Pinyin", supportsZhuyin && "exampleSentence2Zhuyin",
            "exampleSentence2Meaning", "exampleSentence2PartOfSpeech",
          ].filter(Boolean).map((col) => (
            <div key={String(col)} className="font-mono text-xs bg-gray-50 rounded px-2 py-1 text-gray-500">{col}</div>
          ))}
        </div>
        <p className="text-xs text-gray-400">Row 1 must be column headers exactly as listed. Max {MAX_ROWS} rows per file.</p>
      </div>

      <div
        className="rounded-lg border-2 border-dashed border-gray-200 p-10 text-center cursor-pointer hover:border-gray-300 hover:bg-gray-50 transition-colors"
        onClick={() => inputRef.current?.click()}
        onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
        onDragOver={(e) => e.preventDefault()}
      >
        <Upload className="h-8 w-8 text-gray-300 mx-auto mb-2" />
        <p className="text-sm text-gray-500">{importing ? "Importing…" : "Click or drag to upload an Excel file (.xlsx)"}</p>
        {fileName && <p className="text-xs text-gray-400 mt-1">{fileName}</p>}
      </div>
      <input ref={inputRef} type="file" accept=".xlsx" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ""; }} />

      {result && (
        <div className="rounded-lg border border-gray-200 bg-white p-6 space-y-4">
          <h2 className="text-base font-semibold">Import summary</h2>
          <div className="flex items-center gap-2 text-green-700">
            <CheckCircle className="h-5 w-5" />
            <span className="font-medium">{result.imported} card{result.imported !== 1 ? "s" : ""} imported</span>
          </div>
          {result.skipped.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-amber-600">
                <AlertCircle className="h-5 w-5" />
                <span className="font-medium">{result.skipped.length} row{result.skipped.length !== 1 ? "s" : ""} skipped</span>
              </div>
              <div className="rounded-lg bg-amber-50 border border-amber-100 divide-y divide-amber-100 max-h-60 overflow-y-auto">
                {result.skipped.map((s, i) => (
                  <div key={i} className="px-4 py-2 text-sm text-amber-800 flex gap-2">
                    <span className="text-amber-400 shrink-0">Row {s.rowNum}</span>
                    {s.word && <span className="font-medium">{s.word}</span>}
                    <span className="text-amber-700">— {s.reason}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          <Button size="sm" onClick={() => router.push(`/content/cards?pack_id=${packId}`)}>
            View cards →
          </Button>
        </div>
      )}
    </div>
  );
}
