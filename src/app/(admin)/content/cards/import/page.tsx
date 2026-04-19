import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { BulkImport } from "./bulk-import";

export default async function ImportCardsPage({
  searchParams,
}: {
  searchParams: Promise<{ pack_id?: string }>;
}) {
  const { pack_id } = await searchParams;
  if (!pack_id) notFound();

  const supabase = await createClient();
  const [{ data: pack }, { data: existingWords }] = await Promise.all([
    supabase
      .from("packs")
      .select("id, title, deck_id, decks(title, section_id, sections(name, language_id, languages(name, emoji_flag, supports_zhuyin)))")
      .eq("id", pack_id)
      .single(),
    supabase.from("cards").select("word").eq("pack_id", pack_id),
  ]);
  if (!pack) notFound();

  const { data: subCategories } = await supabase
    .from("sub_categories")
    .select("id, name")
    .eq("deck_id", pack.deck_id)
    .order("order_position");

  const deck = pack.decks as unknown as { title: string; section_id: string; sections: { name: string; language_id: string; languages: { name: string; emoji_flag: string; supports_zhuyin: boolean } | null } | null } | null;
  const section = deck?.sections;
  const lang = section?.languages;

  return (
    <div>
      <Breadcrumb
        items={[
          { label: "Languages", href: "/content/languages" },
          ...(lang && section ? [{ label: `${lang.emoji_flag} ${lang.name}`, href: `/content/sections?language_id=${section.language_id}` }] : []),
          ...(section && deck ? [{ label: section.name, href: `/content/decks?section_id=${deck.section_id}` }] : []),
          ...(deck ? [{ label: deck.title, href: `/content/packs?deck_id=${pack.deck_id}` }] : []),
          { label: pack.title, href: `/content/cards?pack_id=${pack_id}` },
          { label: "Bulk import" },
        ]}
      />
      <h1 className="text-2xl font-semibold mb-2">Bulk Import — {pack.title}</h1>
      <p className="text-sm text-gray-500 mb-6">
        Upload an Excel file (.xlsx). All imported cards are created as drafts. Max 500 rows.
      </p>
      <BulkImport
        packId={pack_id}
        deckId={pack.deck_id}
        supportsZhuyin={lang?.supports_zhuyin ?? false}
        existingWords={(existingWords ?? []).map((c: { word: string }) => c.word)}
        subCategories={subCategories ?? []}
      />
    </div>
  );
}
