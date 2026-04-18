import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { SubCategoriesManager } from "./sub-categories-manager";

export default async function SubCategoriesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: deck }, { data: subCats }] = await Promise.all([
    supabase
      .from("decks")
      .select("id, title, section_id, sections(name, language_id, languages(name, emoji_flag))")
      .eq("id", id)
      .single(),
    supabase
      .from("sub_categories")
      .select("*, card_count:cards(count)")
      .eq("deck_id", id)
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
          { label: deck.title, href: `/content/decks?section_id=${deck.section_id}` },
          { label: "Sub-categories" },
        ]}
      />
      <h1 className="text-2xl font-semibold mb-6">Sub-categories — {deck.title}</h1>
      <SubCategoriesManager deckId={id} subCategories={subCats ?? []} />
    </div>
  );
}
