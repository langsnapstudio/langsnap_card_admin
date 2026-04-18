import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { PackForm } from "../pack-form";

export default async function NewPackPage({
  searchParams,
}: {
  searchParams: Promise<{ deck_id?: string }>;
}) {
  const { deck_id } = await searchParams;
  if (!deck_id) notFound();

  const supabase = await createClient();
  const { data: deck } = await supabase
    .from("decks")
    .select("id, title, section_id, sections(name, language_id, languages(name, emoji_flag))")
    .eq("id", deck_id)
    .single();
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
          { label: deck.title, href: `/content/packs?deck_id=${deck_id}` },
          { label: "New pack" },
        ]}
      />
      <h1 className="text-2xl font-semibold mb-6">New Pack</h1>
      <PackForm deckId={deck_id} />
    </div>
  );
}
