"use client";

import { useState } from "react";
import { arrayMove } from "@dnd-kit/sortable";
import { SortableList } from "@/components/ui/sortable-list";
import { Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/ui/link-button";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import Image from "next/image";

interface Deck {
  id: string;
  title: string;
  supporting_title?: string;
  cover_image_url?: string;
  status: string;
  order_position: number;
  pack_count: { count: number }[] | null;
}

export function DecksSortable({ decks: initial, sectionId }: { decks: Deck[]; sectionId: string }) {
  const [decks, setDecks] = useState(initial);
  const supabase = createClient();

  async function handleReorder(activeId: string, overId: string) {
    const oldIndex = decks.findIndex((d) => d.id === activeId);
    const newIndex = decks.findIndex((d) => d.id === overId);
    const reordered = arrayMove(decks, oldIndex, newIndex);
    setDecks(reordered);
    await Promise.all(
      reordered.map((d, i) => supabase.from("decks").update({ order_position: i }).eq("id", d.id))
    );
    toast.success("Order saved.");
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white divide-y divide-gray-100">
      <SortableList
        items={decks}
        onReorder={handleReorder}
        renderItem={(deck, dragHandle) => (
          <div className="flex items-center gap-3 px-4 py-3">
            {dragHandle}
            {deck.cover_image_url && (
              <img
                src={deck.cover_image_url}
                alt={deck.title}
                className="h-10 w-10 rounded-md object-cover flex-shrink-0"
              />
            )}
            <div className="flex-1 min-w-0">
              <div className="font-medium truncate">{deck.title}</div>
              {deck.supporting_title && (
                <div className="text-xs text-gray-400 truncate">{deck.supporting_title}</div>
              )}
            </div>
            <div className="text-sm text-gray-500">{deck.pack_count?.[0]?.count ?? 0} packs</div>
            <Badge variant={deck.status === "published" ? "default" : "secondary"} className="ml-2">
              {deck.status}
            </Badge>
            <div className="ml-2 flex gap-1">
              <LinkButton href={`/content/decks/${deck.id}/edit?section_id=${sectionId}`} variant="ghost" size="sm">
                Edit
              </LinkButton>
              <LinkButton href={`/content/packs?deck_id=${deck.id}`} variant="ghost" size="sm">
                Packs →
              </LinkButton>
            </div>
          </div>
        )}
      />
    </div>
  );
}
