import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { DeckForm } from "../../deck-form";

export default async function EditDeckPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ section_id?: string }>;
}) {
  const { id } = await params;
  const { section_id } = await searchParams;

  const supabase = await createClient();
  const { data: deck } = await supabase
    .from("decks")
    .select("*, pack_count:packs(count)")
    .eq("id", id)
    .single();
  if (!deck) notFound();

  const secId = section_id ?? deck.section_id;
  const { data: section } = await supabase
    .from("sections")
    .select("id, name, language_id, languages(name, emoji_flag)")
    .eq("id", secId)
    .single();
  const lang = section?.languages as unknown as { name: string; emoji_flag: string } | null;

  const deckWithCount = {
    ...deck,
    pack_count: (deck.pack_count as unknown as { count: number }[])?.[0]?.count ?? 0,
  };

  return (
    <div>
      <Breadcrumb
        items={[
          { label: "Languages", href: "/content/languages" },
          ...(lang && section ? [{ label: `${lang.emoji_flag} ${lang.name}`, href: `/content/sections?language_id=${section.language_id}` }] : []),
          ...(section ? [{ label: section.name, href: `/content/decks?section_id=${secId}` }] : []),
          { label: deck.title, href: `/content/decks?section_id=${secId}` },
          { label: "Edit" },
        ]}
      />
      <h1 className="text-2xl font-semibold mb-6">Edit Deck</h1>
      <DeckForm deck={deckWithCount} sectionId={secId} />
    </div>
  );
}
