import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { CardForm } from "../card-form";
import type { SubCategory } from "@/types";

export default async function NewCardPage({
  searchParams,
}: {
  searchParams: Promise<{ pack_id?: string }>;
}) {
  const { pack_id } = await searchParams;
  if (!pack_id) notFound();

  const supabase = await createClient();
  const [{ data: pack }, { data: subCategories }] = await Promise.all([
    supabase
      .from("packs")
      .select("id, title, deck_id, decks(title, section_id, sections(name, language_id, languages(name, emoji_flag, supports_zhuyin)))")
      .eq("id", pack_id)
      .single(),
    supabase.from("sub_categories").select("*").order("order_position"),
  ]);
  if (!pack) notFound();

  const deck = pack.decks as unknown as { title: string; section_id: string; sections: { name: string; language_id: string; languages: { name: string; emoji_flag: string; supports_zhuyin: boolean } | null } | null } | null;
  const section = deck?.sections;
  const lang = section?.languages;

  const deckSubCats = (subCategories ?? []).filter((sc: SubCategory) => {
    return true;
  });

  const { data: deckSubCategories } = await supabase
    .from("sub_categories")
    .select("*")
    .eq("deck_id", pack.deck_id)
    .order("order_position");

  return (
    <div>
      <Breadcrumb
        items={[
          { label: "Languages", href: "/content/languages" },
          ...(lang && section ? [{ label: `${lang.emoji_flag} ${lang.name}`, href: `/content/sections?language_id=${section.language_id}` }] : []),
          ...(section && deck ? [{ label: section.name, href: `/content/decks?section_id=${deck.section_id}` }] : []),
          ...(deck ? [{ label: deck.title, href: `/content/packs?deck_id=${pack.deck_id}` }] : []),
          { label: pack.title, href: `/content/cards?pack_id=${pack_id}` },
          { label: "New card" },
        ]}
      />
      <h1 className="text-2xl font-semibold mb-6">New Card</h1>
      <CardForm
        packId={pack_id}
        supportsZhuyin={lang?.supports_zhuyin ?? false}
        subCategories={deckSubCategories ?? []}
      />
    </div>
  );
}
