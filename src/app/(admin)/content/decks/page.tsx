import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { LinkButton } from "@/components/ui/link-button";
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
    (() => {
      let q = supabase
        .from("decks")
        .select("*, pack_count:packs(count), packs(cards(count))")
        .eq("section_id", section_id)
        .order("order_position");
      if (status === "published" || status === "draft") q = q.eq("status", status);
      return q;
    })(),
  ]);

  if (!section) notFound();
  const lang = section.languages as unknown as { name: string; emoji_flag: string } | null;

  type RawDeck = {
    id: string;
    title: string;
    supporting_title?: string;
    cover_image_url?: string;
    status: string;
    order_position: number;
    pack_count: { count: number }[] | null;
    packs: { cards: { count: number }[] }[] | null;
  };

  const rawDecks: RawDeck[] = (decksQuery.data as RawDeck[]) ?? [];
  const decks = rawDecks.map((d) => ({
    ...d,
    word_count: (d.packs ?? []).reduce(
      (sum, p) => sum + (p.cards?.[0]?.count ?? 0),
      0
    ),
  }));

  const statusOptions = [
    { label: "All", value: "" },
    { label: "Published", value: "published" },
    { label: "Draft", value: "draft" },
  ];

  return (
    <div>
      <Breadcrumb
        items={[
          { label: "Languages", href: "/content/languages" },
          ...(lang ? [{ label: `${lang.emoji_flag} ${lang.name}`, href: `/content/sections?language_id=${section.language_id}` }] : []),
          { label: section.name },
        ]}
      />
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Decks — {section.name}</h1>
        <LinkButton href={`/content/decks/new?section_id=${section_id}`} size="sm">
          <Plus className="mr-2 h-4 w-4" />
          New deck
        </LinkButton>
      </div>

      <div className="flex gap-2 mb-5">
        {statusOptions.map((opt) => (
          <a
            key={opt.value}
            href={`/content/decks?section_id=${section_id}${opt.value ? `&status=${opt.value}` : ""}`}
            className={`px-3 py-1 rounded-full text-sm border transition-colors ${
              (status ?? "") === opt.value
                ? "bg-black text-white border-black"
                : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
            }`}
          >
            {opt.label}
          </a>
        ))}
      </div>

      {!decks.length ? (
        <div className="rounded-lg border border-dashed border-gray-200 py-16 text-center">
          <p className="text-sm text-gray-500">No decks{status ? ` with status "${status}"` : ""} yet.</p>
          {!status && (
            <LinkButton href={`/content/decks/new?section_id=${section_id}`} size="sm" className="mt-4">
              Create first deck
            </LinkButton>
          )}
        </div>
      ) : (
        <DecksSortable decks={decks} sectionId={section_id} />
      )}
    </div>
  );
}
