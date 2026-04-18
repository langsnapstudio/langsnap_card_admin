import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { LinkButton } from "@/components/ui/link-button";
import { Badge } from "@/components/ui/badge";
import { Plus, Layers } from "lucide-react";
import { PacksSortable } from "./packs-sortable";
import { CARD_COLOR_PRESETS } from "@/types";

export default async function PacksPage({
  searchParams,
}: {
  searchParams: Promise<{ deck_id?: string }>;
}) {
  const { deck_id } = await searchParams;
  if (!deck_id) notFound();

  const supabase = await createClient();
  const [{ data: deck }, { data: packs }] = await Promise.all([
    supabase
      .from("decks")
      .select("id, title, section_id, sections(name, language_id, languages(name, emoji_flag))")
      .eq("id", deck_id)
      .single(),
    supabase
      .from("packs")
      .select("*, card_count:cards(count)")
      .eq("deck_id", deck_id)
      .order("order_position"),
  ]);

  if (!deck) notFound();
  const section = deck.sections as unknown as { name: string; language_id: string; languages: { name: string; emoji_flag: string } | null } | null;
  const lang = section?.languages;

  return (
    <div>
      <Breadcrumb
        items={[
          { label: "Languages", href: "/content/languages" },
          ...(lang && section ? [{ label: `${lang.emoji_flag} ${lang.name}`, href: `/content/sections?language_id=${section.language_id}` }] : []),
          ...(section ? [{ label: section.name, href: `/content/decks?section_id=${deck.section_id}` }] : []),
          { label: deck.title },
        ]}
      />
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Packs — {deck.title}</h1>
        <div className="flex gap-2">
          <LinkButton href={`/content/decks/${deck_id}/sub-categories`} variant="outline" size="sm">
            <Layers className="mr-2 h-4 w-4" />
            Sub-categories
          </LinkButton>
          <LinkButton href={`/content/packs/new?deck_id=${deck_id}`} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            New pack
          </LinkButton>
        </div>
      </div>

      {!packs?.length ? (
        <div className="rounded-lg border border-dashed border-gray-200 py-16 text-center">
          <p className="text-sm text-gray-500">No packs yet.</p>
          <LinkButton href={`/content/packs/new?deck_id=${deck_id}`} size="sm" className="mt-4">
            Create first pack
          </LinkButton>
        </div>
      ) : (
        <PacksSortable packs={packs} deckId={deck_id} />
      )}
    </div>
  );
}
