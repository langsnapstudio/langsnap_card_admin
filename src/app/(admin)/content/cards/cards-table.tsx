"use client";

import { useState } from "react";
import { arrayMove } from "@dnd-kit/sortable";
import { SortableList } from "@/components/ui/sortable-list";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LinkButton } from "@/components/ui/link-button";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Music, Image as ImageIcon } from "lucide-react";

interface Card {
  id: string;
  word: string;
  pinyin: string;
  meaning: string;
  part_of_speech: string;
  audio_url?: string;
  illustration_url?: string;
  status: string;
  order_position: number;
}

export function CardsTable({ cards: initial, packId }: { cards: Card[]; packId: string }) {
  const [cards, setCards] = useState(initial);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);
  const supabase = createClient();

  async function handleReorder(activeId: string, overId: string) {
    const oldIndex = cards.findIndex((c) => c.id === activeId);
    const newIndex = cards.findIndex((c) => c.id === overId);
    const reordered = arrayMove(cards, oldIndex, newIndex);
    setCards(reordered);
    await Promise.all(
      reordered.map((c, i) => supabase.from("cards").update({ order_position: i }).eq("id", c.id))
    );
    toast.success("Order saved.");
  }

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleAll() {
    setSelected((prev) =>
      prev.size === cards.length ? new Set() : new Set(cards.map((c) => c.id))
    );
  }

  async function bulkSetStatus(status: "published" | "draft") {
    if (!selected.size) return;
    setBulkLoading(true);
    const ids = Array.from(selected);
    const { error } = await supabase
      .from("cards")
      .update({ status, updated_at: new Date().toISOString() })
      .in("id", ids);
    setBulkLoading(false);
    if (error) { toast.error(error.message); return; }
    setCards((prev) => prev.map((c) => (selected.has(c.id) ? { ...c, status } : c)));
    setSelected(new Set());
    toast.success(`${ids.length} card(s) ${status === "published" ? "published" : "unpublished"}.`);
  }

  return (
    <div className="space-y-3">
      {selected.size > 0 && (
        <div className="flex items-center gap-3 rounded-lg bg-blue-50 border border-blue-100 px-4 py-2.5">
          <span className="text-sm text-blue-700">{selected.size} selected</span>
          <Button size="sm" onClick={() => bulkSetStatus("published")} disabled={bulkLoading}>
            Publish
          </Button>
          <Button size="sm" variant="outline" onClick={() => bulkSetStatus("draft")} disabled={bulkLoading}>
            Unpublish
          </Button>
          <button onClick={() => setSelected(new Set())} className="ml-auto text-xs text-blue-500 hover:underline">
            Clear selection
          </button>
        </div>
      )}

      <div className="rounded-lg border border-gray-200 bg-white divide-y divide-gray-100">
        <div className="flex items-center gap-3 px-4 py-2 text-xs font-medium text-gray-500 border-b border-gray-100">
          <input
            type="checkbox"
            checked={selected.size === cards.length && cards.length > 0}
            onChange={toggleAll}
            className="rounded"
          />
          <span className="w-5" />
          <span className="w-40">Word</span>
          <span className="w-32">Pinyin</span>
          <span className="flex-1">Meaning</span>
          <span className="w-16">PoS</span>
          <span className="w-16 text-center">Audio</span>
          <span className="w-16 text-center">Image</span>
          <span className="w-20">Status</span>
          <span className="w-16" />
        </div>

        <SortableList
          items={cards}
          onReorder={handleReorder}
          renderItem={(card, dragHandle) => (
            <div className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50">
              <input
                type="checkbox"
                checked={selected.has(card.id)}
                onChange={() => toggleSelect(card.id)}
                className="rounded"
                onClick={(e) => e.stopPropagation()}
              />
              {dragHandle}
              <span className="w-40 font-medium truncate text-sm">{card.word}</span>
              <span className="w-32 text-gray-500 text-sm truncate">{card.pinyin}</span>
              <span className="flex-1 text-sm truncate">{card.meaning}</span>
              <span className="w-16 text-gray-400 text-xs">{card.part_of_speech}</span>
              <span className="w-16 text-center">
                {card.audio_url ? <Music className="h-4 w-4 text-green-500 mx-auto" /> : <span className="text-gray-200">—</span>}
              </span>
              <span className="w-16 text-center">
                {card.illustration_url ? <ImageIcon className="h-4 w-4 text-green-500 mx-auto" /> : <span className="text-gray-200">—</span>}
              </span>
              <span className="w-20">
                <Badge variant={card.status === "published" ? "default" : "secondary"} className="text-xs">
                  {card.status}
                </Badge>
              </span>
              <LinkButton href={`/content/cards/${card.id}/edit?pack_id=${packId}`} variant="ghost" size="sm">
                Edit
              </LinkButton>
            </div>
          )}
        />
      </div>
    </div>
  );
}
