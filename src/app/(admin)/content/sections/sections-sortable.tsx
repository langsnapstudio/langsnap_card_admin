"use client";

import { useState } from "react";
import { arrayMove } from "@dnd-kit/sortable";
import { SortableList } from "@/components/ui/sortable-list";
import { Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/ui/link-button";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

interface Section {
  id: string;
  name: string;
  status: string;
  order_position: number;
  deck_count: { count: number }[] | null;
}

export function SectionsSortable({
  sections: initial,
  languageId,
}: {
  sections: Section[];
  languageId: string;
}) {
  const [sections, setSections] = useState(initial);
  const supabase = createClient();

  async function handleReorder(activeId: string, overId: string) {
    const oldIndex = sections.findIndex((s) => s.id === activeId);
    const newIndex = sections.findIndex((s) => s.id === overId);
    const reordered = arrayMove(sections, oldIndex, newIndex);
    setSections(reordered);

    await Promise.all(
      reordered.map((s, i) =>
        supabase.from("sections").update({ order_position: i }).eq("id", s.id)
      )
    );
    toast.success("Order saved.");
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white divide-y divide-gray-100">
      <SortableList
        items={sections}
        onReorder={handleReorder}
        renderItem={(section, dragHandle) => (
          <div className="flex items-center gap-3 px-4 py-3">
            {dragHandle}
            <div className="flex-1 font-medium">{section.name}</div>
            <div className="text-sm text-gray-500">
              {section.deck_count?.[0]?.count ?? 0} decks
            </div>
            <Badge variant={section.status === "published" ? "default" : "secondary"} className="ml-2">
              {section.status}
            </Badge>
            <div className="ml-2 flex gap-1">
              <LinkButton href={`/content/sections/${section.id}/edit?language_id=${languageId}`} variant="ghost" size="sm">
                Edit
              </LinkButton>
              <LinkButton href={`/content/decks?section_id=${section.id}`} variant="ghost" size="sm">
                Decks →
              </LinkButton>
            </div>
          </div>
        )}
      />
    </div>
  );
}
