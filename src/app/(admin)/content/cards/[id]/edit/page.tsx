import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { CardForm } from "../../card-form";

export default async function EditCardPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ pack_id?: string }>;
}) {
  const { id } = await params;
  const { pack_id } = await searchParams;

  const supabase = await createClient();
  const { data: card } = await supabase.from("cards").select("*").eq("id", id).single();
  if (!card) notFound();

  const packId = pack_id ?? card.pack_id;
  const [{ data: pack }, { data: deckSubCategories }] = await Promise.all([
    supabase
      .from("packs")
      .select("id, title, deck_id, decks(title, section_id, sections(name, language_id, languages(name, emoji_flag, supports_zhuyin)))")
      .eq("id", packId)
      .single(),
    supabase
      .from("sub_categories")
      .select("*")
      .eq("deck_id", card.pack_id)
      .order("order_position"),
  ]);

  if (!pack) notFound();
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
          { label: pack.title, href: `/content/cards?pack_id=${packId}` },
          { label: card.word },
          { label: "Edit" },
        ]}
      />
      <h1 className="text-2xl font-semibold mb-6">Edit Card — {card.word}</h1>
      <CardForm
        card={card}
        packId={packId}
        supportsZhuyin={lang?.supports_zhuyin ?? false}
        subCategories={deckSubCategories ?? []}
      />
    </div>
  );
}
