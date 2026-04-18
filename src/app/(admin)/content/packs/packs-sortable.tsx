"use client";

import { useState } from "react";
import { arrayMove } from "@dnd-kit/sortable";
import { SortableList } from "@/components/ui/sortable-list";
import { Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/ui/link-button";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { CARD_COLOR_PRESETS } from "@/types";

interface Pack {
  id: string;
  title: string;
  is_free: boolean;
  card_color: string;
  thumbnail_url?: string;
  status: string;
  order_position: number;
  card_count: { count: number }[] | null;
}

export function PacksSortable({ packs: initial, deckId }: { packs: Pack[]; deckId: string }) {
  const [packs, setPacks] = useState(initial);
  const supabase = createClient();

  async function handleReorder(activeId: string, overId: string) {
    const oldIndex = packs.findIndex((p) => p.id === activeId);
    const newIndex = packs.findIndex((p) => p.id === overId);
    const reordered = arrayMove(packs, oldIndex, newIndex);
    setPacks(reordered);
    await Promise.all(
      reordered.map((p, i) => supabase.from("packs").update({ order_position: i }).eq("id", p.id))
    );
    toast.success("Order saved.");
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white divide-y divide-gray-100">
      <SortableList
        items={packs}
        onReorder={handleReorder}
        renderItem={(pack, dragHandle) => {
          const colorPreset = CARD_COLOR_PRESETS.find((c) => c.token === pack.card_color);
          const cardCount = pack.card_count?.[0]?.count ?? 0;
          return (
            <div className="flex items-center gap-3 px-4 py-3">
              {dragHandle}
              <div
                className="h-8 w-8 rounded-md border border-gray-200 flex-shrink-0"
                style={{ backgroundColor: colorPreset?.hex ?? "#FAFAFA" }}
                title={colorPreset?.label}
              />
              {pack.thumbnail_url && (
                <img src={pack.thumbnail_url} alt={pack.title} className="h-8 w-8 rounded object-cover flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <div className="font-medium">{pack.title}</div>
                <div className="text-xs text-gray-400">{cardCount} cards · {pack.is_free ? "Free" : "Premium"}</div>
              </div>
              <Badge variant={pack.status === "published" ? "default" : "secondary"}>
                {pack.status}
              </Badge>
              <div className="ml-2 flex gap-1">
                <LinkButton href={`/content/packs/${pack.id}/edit?deck_id=${deckId}`} variant="ghost" size="sm">
                  Edit
                </LinkButton>
                <LinkButton href={`/content/cards?pack_id=${pack.id}`} variant="ghost" size="sm">
                  Cards →
                </LinkButton>
              </div>
            </div>
          );
        }}
      />
    </div>
  );
}
