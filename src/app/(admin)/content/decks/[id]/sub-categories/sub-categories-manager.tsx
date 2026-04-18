"use client";

import { useState } from "react";
import { arrayMove } from "@dnd-kit/sortable";
import { SortableList } from "@/components/ui/sortable-list";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Trash2, Pencil, Check, X } from "lucide-react";

interface SubCategory {
  id: string;
  name: string;
  order_position: number;
  card_count: { count: number }[] | null;
}

export function SubCategoriesManager({
  deckId,
  subCategories: initial,
}: {
  deckId: string;
  subCategories: SubCategory[];
}) {
  const [items, setItems] = useState(initial);
  const [newName, setNewName] = useState("");
  const [adding, setAdding] = useState(false);
  const supabase = createClient();

  async function handleReorder(activeId: string, overId: string) {
    const oldIndex = items.findIndex((s) => s.id === activeId);
    const newIndex = items.findIndex((s) => s.id === overId);
    const reordered = arrayMove(items, oldIndex, newIndex);
    setItems(reordered);
    await Promise.all(
      reordered.map((s, i) => supabase.from("sub_categories").update({ order_position: i }).eq("id", s.id))
    );
    toast.success("Order saved.");
  }

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const name = newName.trim();
    if (!name) return;
    if (items.some((s) => s.name.toLowerCase() === name.toLowerCase())) {
      toast.error("Sub-category name must be unique within this deck.");
      return;
    }
    setAdding(true);
    const { data, error } = await supabase
      .from("sub_categories")
      .insert({ name, deck_id: deckId, order_position: items.length })
      .select()
      .single();
    setAdding(false);
    if (error) { toast.error(error.message); return; }
    setItems([...items, { ...data, card_count: null }]);
    setNewName("");
    toast.success("Sub-category added.");
  }

  async function handleDelete(id: string) {
    const item = items.find((s) => s.id === id);
    const count = item?.card_count?.[0]?.count ?? 0;
    if (count > 0) { toast.error("Cannot delete a sub-category with cards assigned."); return; }
    const { error } = await supabase.from("sub_categories").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    setItems(items.filter((s) => s.id !== id));
    toast.success("Sub-category deleted.");
  }

  async function handleRename(id: string, name: string) {
    if (!name.trim()) return;
    if (items.some((s) => s.id !== id && s.name.toLowerCase() === name.toLowerCase())) {
      toast.error("Sub-category name must be unique within this deck.");
      return;
    }
    const { error } = await supabase
      .from("sub_categories")
      .update({ name: name.trim() })
      .eq("id", id);
    if (error) { toast.error(error.message); return; }
    setItems(items.map((s) => (s.id === id ? { ...s, name: name.trim() } : s)));
    toast.success("Renamed.");
  }

  return (
    <div className="max-w-lg space-y-4">
      {items.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-white divide-y divide-gray-100">
          <SortableList
            items={items}
            onReorder={handleReorder}
            renderItem={(item, dragHandle) => (
              <SubCategoryRow
                item={item}
                dragHandle={dragHandle}
                onDelete={handleDelete}
                onRename={handleRename}
              />
            )}
          />
        </div>
      )}

      <form onSubmit={handleAdd} className="flex gap-2">
        <Input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="New sub-category name (e.g. Mammals)"
          className="flex-1"
        />
        <Button type="submit" size="sm" disabled={adding || !newName.trim()}>
          {adding ? "Adding…" : "Add"}
        </Button>
      </form>
    </div>
  );
}

function SubCategoryRow({
  item,
  dragHandle,
  onDelete,
  onRename,
}: {
  item: SubCategory;
  dragHandle: React.ReactNode;
  onDelete: (id: string) => void;
  onRename: (id: string, name: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(item.name);
  const cardCount = item.card_count?.[0]?.count ?? 0;

  function handleConfirmRename() {
    onRename(item.id, draft);
    setEditing(false);
  }

  function handleCancelRename() {
    setDraft(item.name);
    setEditing(false);
  }

  return (
    <div className="flex items-center gap-2 px-3 py-2.5">
      {dragHandle}
      {editing ? (
        <>
          <Input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className="h-7 flex-1 text-sm"
            autoFocus
            onKeyDown={(e) => { if (e.key === "Enter") handleConfirmRename(); if (e.key === "Escape") handleCancelRename(); }}
          />
          <button onClick={handleConfirmRename} className="text-green-600 hover:text-green-700 p-1"><Check className="h-4 w-4" /></button>
          <button onClick={handleCancelRename} className="text-gray-400 hover:text-gray-600 p-1"><X className="h-4 w-4" /></button>
        </>
      ) : (
        <>
          <span className="flex-1 text-sm font-medium">{item.name}</span>
          <span className="text-xs text-gray-400">{cardCount} cards</span>
          <button onClick={() => setEditing(true)} className="p-1 text-gray-400 hover:text-gray-600"><Pencil className="h-3.5 w-3.5" /></button>
          <button onClick={() => onDelete(item.id)} className="p-1 text-gray-400 hover:text-red-500" disabled={cardCount > 0}><Trash2 className="h-3.5 w-3.5" /></button>
        </>
      )}
    </div>
  );
}
