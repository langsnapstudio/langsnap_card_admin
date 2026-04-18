import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { LinkButton } from "@/components/ui/link-button";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
import { DecksSortable } from "./decks-sortable";

export default async function DecksPage({
  searchParams,
}: {
  searchParams: Promise<{ section_id?: string; status?: string }>;
}) {
  const { section_id, status } = await searchParams;
  if (!section_id) notFound();

  const supabase = await createClient();
  const [{ data: section }, decksQuery] = await Promise.all([
    supabase
      .from("sections")
      .select("id, name, language_id, languages(name, emoji_flag)")
      .eq("id", section_id)
      .single(),
    supabase
      .from("decks")
      .select("*, pack_count:packs(count)")
      .eq("section_id", section_id)
      .order("order_position"),
  ]);

  if (!section) notFound();
  const lang = section.languages as unknown as { name: string; emoji_flag: string } | null;
  const decks = decksQuery.data ?? [];

  return (
    <div>
      <Breadcrumb
        items={[
          { label: "Languages", href: "/content/languages" },
          ...(lang ? [{ label: `${lang.emoji_flag} ${lang.name}`, href: `/content/sections?language_id=${section.language_id}` }] : []),
          { label: section.name, href: `/content/sections?language_id=${section.language_id}` },
        ]}
      />
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Decks — {section.name}</h1>
        <LinkButton href={`/content/decks/new?section_id=${section_id}`} size="sm">
          <Plus className="mr-2 h-4 w-4" />
          New deck
        </LinkButton>
      </div>

      {!decks.length ? (
        <div className="rounded-lg border border-dashed border-gray-200 py-16 text-center">
          <p className="text-sm text-gray-500">No decks yet.</p>
          <LinkButton href={`/content/decks/new?section_id=${section_id}`} size="sm" className="mt-4">
            Create first deck
          </LinkButton>
        </div>
      ) : (
        <DecksSortable decks={decks} sectionId={section_id} />
      )}
    </div>
  );
}
