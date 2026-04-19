import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { LinkButton } from "@/components/ui/link-button";
import { Plus, Upload } from "lucide-react";
import { CardsTable } from "./cards-table";

export default async function CardsPage({
  searchParams,
}: {
  searchParams: Promise<{ pack_id?: string }>;
}) {
  const { pack_id } = await searchParams;
  if (!pack_id) notFound();

  const supabase = await createClient();
  const [{ data: pack }, { data: cards }] = await Promise.all([
    supabase
      .from("packs")
      .select("id, title, deck_id, decks(title, section_id, sections(name, language_id, languages(name, emoji_flag), supports_pinyin:languages(supports_pinyin), supports_zhuyin:languages(supports_zhuyin)))")
      .eq("id", pack_id)
      .single(),
    supabase
      .from("cards")
      .select("id, word, pinyin, meaning, part_of_speech, audio_url, illustration_url, status, order_position")
      .eq("pack_id", pack_id)
      .order("order_position"),
  ]);

  if (!pack) notFound();
  const deck = pack.decks as unknown as { title: string; section_id: string; sections: { name: string; language_id: string; languages: { name: string; emoji_flag: string } | null } | null } | null;
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
          { label: pack.title },
        ]}
      />
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Cards — {pack.title}</h1>
        <div className="flex gap-2">
          <LinkButton href={`/content/cards/import?pack_id=${pack_id}`} variant="outline" size="sm">
            <Upload className="mr-2 h-4 w-4" />
            Bulk import
          </LinkButton>
          <LinkButton href={`/content/cards/new?pack_id=${pack_id}`} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            New card
          </LinkButton>
        </div>
      </div>

      {!cards?.length ? (
        <div className="rounded-lg border border-dashed border-gray-200 py-16 text-center">
          <p className="text-sm text-gray-500">No cards yet.</p>
          <div className="flex gap-3 justify-center mt-4">
            <LinkButton href={`/content/cards/new?pack_id=${pack_id}`} size="sm">New card</LinkButton>
            <LinkButton href={`/content/cards/import?pack_id=${pack_id}`} variant="outline" size="sm">Bulk import</LinkButton>
          </div>
        </div>
      ) : (
        <CardsTable cards={cards} packId={pack_id} />
      )}
    </div>
  );
}
