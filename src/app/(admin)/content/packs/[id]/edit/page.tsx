import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { PackForm } from "../../pack-form";

export default async function EditPackPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ deck_id?: string }>;
}) {
  const { id } = await params;
  const { deck_id } = await searchParams;

  const supabase = await createClient();
  const { data: pack } = await supabase
    .from("packs")
    .select("*, card_count:cards(count)")
    .eq("id", id)
    .single();
  if (!pack) notFound();

  const deckId = deck_id ?? pack.deck_id;
  const { data: deck } = await supabase
    .from("decks")
    .select("id, title, section_id, sections(name, language_id, languages(name, emoji_flag))")
    .eq("id", deckId)
    .single();

  const section = deck?.sections as unknown as { name: string; language_id: string; languages: { name: string; emoji_flag: string } | null } | null;
  const lang = section?.languages;

  const packWithCount = {
    ...pack,
    card_count: (pack.card_count as unknown as { count: number }[])?.[0]?.count ?? 0,
  };

  return (
    <div>
      <Breadcrumb
        items={[
          { label: "Languages", href: "/content/languages" },
          ...(lang && section && deck ? [{ label: `${lang.emoji_flag} ${lang.name}`, href: `/content/sections?language_id=${section.language_id}` }] : []),
          ...(section && deck ? [{ label: section.name, href: `/content/decks?section_id=${deck.section_id}` }] : []),
          ...(deck ? [{ label: deck.title, href: `/content/packs?deck_id=${deckId}` }] : []),
          { label: pack.title },
          { label: "Edit" },
        ]}
      />
      <h1 className="text-2xl font-semibold mb-6">Edit Pack</h1>
      <PackForm pack={packWithCount} deckId={deckId} />
    </div>
  );
}
