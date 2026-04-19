"use client";

import { useState } from "react";
import { CARD_COLOR_PRESETS } from "@/types";
import type { CardColor } from "@/types";
import { toToneMarks } from "@/lib/pinyin";

const DARK_COLORS = new Set<CardColor>([
  "emerald-card",
  "deep-blue-card",
  "indigo-card",
  "black-card",
]);

function getHex(color?: CardColor) {
  if (!color) return "#F4F0E8";
  return CARD_COLOR_PRESETS.find((p) => p.token === color)?.hex ?? "#F4F0E8";
}

interface CardPreviewProps {
  word: string;
  pinyin: string;
  zhuyin?: string;
  meaning: string;
  pos: string;
  cardColor?: CardColor;
  illustrationUrl?: string;
  subCategoryName?: string;
  tags?: string;
  ex1?: string;
  ex1Pinyin?: string;
  ex1Zhuyin?: string;
  ex1Meaning?: string;
  ex2?: string;
  ex2Pinyin?: string;
  ex2Zhuyin?: string;
  ex2Meaning?: string;
  supportsZhuyin?: boolean;
}

export function CardPreview({
  word,
  pinyin,
  zhuyin,
  meaning,
  pos,
  cardColor,
  illustrationUrl,
  subCategoryName,
  tags,
  ex1,
  ex1Pinyin,
  ex1Zhuyin,
  ex1Meaning,
  ex2,
  ex2Pinyin,
  ex2Zhuyin,
  ex2Meaning,
  supportsZhuyin,
}: CardPreviewProps) {
  const [side, setSide] = useState<"front" | "back">("front");
  const bg = getHex(cardColor);
  const isDark = cardColor ? DARK_COLORS.has(cardColor) : false;
  const textColor = isDark ? "#ffffff" : "#1a1a1a";
  const mutedColor = isDark ? "rgba(255,255,255,0.65)" : "rgba(0,0,0,0.45)";

  const tagList = tags
    ? tags.split(",").map((t) => t.trim()).filter(Boolean)
    : [];

  return (
    <div className="sticky top-6 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Preview</p>
        <div className="flex rounded-lg border border-gray-200 overflow-hidden text-xs">
          <button
            type="button"
            onClick={() => setSide("front")}
            className={`px-3 py-1 transition-colors ${side === "front" ? "bg-black text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}
          >
            Front
          </button>
          <button
            type="button"
            onClick={() => setSide("back")}
            className={`px-3 py-1 transition-colors ${side === "back" ? "bg-black text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}
          >
            Back
          </button>
        </div>
      </div>

      {/* Card shell — roughly phone card ratio */}
      <div
        className="w-64 rounded-2xl overflow-hidden shadow-lg mx-auto"
        style={{ backgroundColor: bg, minHeight: "340px" }}
      >
        {side === "front" ? (
          <div className="flex flex-col items-center justify-center h-full p-6 gap-3" style={{ minHeight: "340px" }}>
            {illustrationUrl && (
              <img
                src={illustrationUrl}
                alt="illustration"
                className="w-24 h-24 object-contain rounded-xl"
              />
            )}
            <div className="text-center space-y-1">
              <div
                className="font-bold leading-none"
                style={{ fontSize: word.length > 4 ? "2.5rem" : "3.5rem", color: textColor }}
              >
                {word || <span style={{ color: mutedColor }}>字</span>}
              </div>
              <div className="text-base font-medium" style={{ color: mutedColor }}>
                {pinyin ? toToneMarks(pinyin) : <span style={{ opacity: 0.5 }}>pīnyīn</span>}
              </div>
              {supportsZhuyin && zhuyin && (
                <div className="text-sm" style={{ color: mutedColor }}>{zhuyin}</div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col p-5 gap-3" style={{ minHeight: "340px" }}>
            {/* Meaning */}
            <div>
              <div className="text-xl font-bold leading-snug" style={{ color: textColor }}>
                {meaning || <span style={{ color: mutedColor }}>Meaning</span>}
              </div>
              {pos && (
                <span
                  className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.08)", color: textColor }}
                >
                  {pos}
                </span>
              )}
            </div>

            {/* Pills */}
            {(subCategoryName || tagList.length > 0) && (
              <div className="flex flex-wrap gap-1.5">
                {subCategoryName && (
                  <span
                    className="text-xs px-2 py-0.5 rounded-full border"
                    style={{ borderColor: isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.2)", color: textColor }}
                  >
                    {subCategoryName}
                  </span>
                )}
                {tagList.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-2 py-0.5 rounded-full border"
                    style={{ borderColor: isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.2)", color: textColor }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Example sentences */}
            {(ex1 || ex2) && (
              <div className="space-y-2 mt-auto pt-2 border-t" style={{ borderColor: isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.1)" }}>
                {ex1 && (
                  <div>
                    <p className="text-sm font-medium" style={{ color: textColor }}>{ex1}</p>
                    {ex1Pinyin && <p className="text-xs" style={{ color: mutedColor }}>{toToneMarks(ex1Pinyin)}</p>}
                    {supportsZhuyin && ex1Zhuyin && <p className="text-xs" style={{ color: mutedColor }}>{ex1Zhuyin}</p>}
                    {ex1Meaning && <p className="text-xs italic" style={{ color: mutedColor }}>{ex1Meaning}</p>}
                  </div>
                )}
                {ex2 && (
                  <div>
                    <p className="text-sm font-medium" style={{ color: textColor }}>{ex2}</p>
                    {ex2Pinyin && <p className="text-xs" style={{ color: mutedColor }}>{toToneMarks(ex2Pinyin)}</p>}
                    {supportsZhuyin && ex2Zhuyin && <p className="text-xs" style={{ color: mutedColor }}>{ex2Zhuyin}</p>}
                    {ex2Meaning && <p className="text-xs italic" style={{ color: mutedColor }}>{ex2Meaning}</p>}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <p className="text-center text-xs text-gray-400">
        {side === "front" ? "Tap to flip →" : "← Tap to flip"}
      </p>
    </div>
  );
}
