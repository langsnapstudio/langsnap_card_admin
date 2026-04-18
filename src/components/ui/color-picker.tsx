"use client";

import { CARD_COLOR_PRESETS, type CardColor } from "@/types";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface ColorPickerProps {
  value: CardColor | undefined;
  onChange: (color: CardColor) => void;
}

export function ColorPicker({ value, onChange }: ColorPickerProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {CARD_COLOR_PRESETS.map(({ token, hex, label }) => {
        const isSelected = value === token;
        const isDark = ["indigo-card", "black-card", "emerald-card", "deep-blue-card"].includes(token);
        return (
          <button
            key={token}
            type="button"
            title={label}
            onClick={() => onChange(token)}
            className={cn(
              "h-8 w-8 rounded-md border-2 transition-all hover:scale-110",
              isSelected ? "border-gray-800 shadow-md scale-110" : "border-gray-200"
            )}
            style={{ backgroundColor: hex }}
          >
            {isSelected && (
              <Check
                className={cn("h-4 w-4 mx-auto", isDark ? "text-white" : "text-gray-800")}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
