import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { LinkButton } from "@/components/ui/link-button";
import { Plus } from "lucide-react";
import { DecksSortable } from "./decks-sortable";
import { DecksFilter } from "./decks-filter";
import Link from "next/link";

type RawDeck = {
  id: string;
  title: string;
  supporting_title?: string;
  cover_image_url?: string;
  status: string;
  order_position: number;
  section_id: string;
  pack_count: { count: number }[] | null;
  packs: { cards: { count: number }[] }[] | null;
};

type CrossDeck = {
  id: string;
  title: string;
  status: string;
  section_id: string;
  word_count: number;
  sections: {
    id: string;
    name: string;
    language_id: string;
    languages: { id: string; name: string; emoji_flag: string } | null;
  } | null;
};

export default async function DecksPage({
  searchParams,
}: {
  searchParams: Promise<{ section_id?: string; status?: string; language_id?: string }>;
}) {
  const { section_id, status, language_id } = await searchParams;
  const supabase = await createClient();

  // ── Section-scoped view ──────────────────────────────────────────────
  if (section_id) {
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
            ...(lang
              ? [{ label: `${lang.emoji_flag} ${lang.name}`, href: `/content/sections?language_id=${section.language_id}` }]
              : []),
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
            <p className="text-sm text-gray-500">
              No decks{status ? ` with status "${status}"` : ""} yet.
            </p>
            {!status && (
              <LinkButton
                href={`/content/decks/new?section_id=${section_id}`}
                size="sm"
                className="mt-4"
              >
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

  // ── Cross-section view ───────────────────────────────────────────────
  const [{ data: languages }, sectionFilter] = await Promise.all([
    supabase.from("languages").select("id, name, emoji_flag").order("name"),
    language_id
      ? supabase.from("sections").select("id").eq("language_id", language_id)
      : Promise.resolve({ data: null as null | { id: string }[] }),
  ]);

  let q = supabase
    .from("decks")
    .select(
      "id, title, status, section_id, order_position, sections(id, name, language_id, languages(id, name, emoji_flag)), packs(cards(count))"
    )
    .order("section_id")
    .order("order_position");

  if (status === "published" || status === "draft") q = q.eq("status", status);

  if (language_id) {
    const sectionIds = (sectionFilter.data ?? []).map((s) => s.id);
    if (!sectionIds.length) {
      q = q.eq("id", "00000000-0000-0000-0000-000000000000"); // force empty
    } else {
      q = q.in("section_id", sectionIds);
    }
  }

  const { data: rawCross } = await q;

  const decks: CrossDeck[] = ((rawCross ?? []) as unknown as Array<{
    id: string;
    title: string;
    status: string;
    section_id: string;
    sections: { id: string; name: string; language_id: string; languages: { id: string; name: string; emoji_flag: string } | null } | null;
    packs: { cards: { count: number }[] }[] | null;
  }>).map((d) => ({
    id: d.id,
    title: d.title,
    status: d.status,
    section_id: d.section_id,
    sections: d.sections,
    word_count: (d.packs ?? []).reduce((sum, p) => sum + (p.cards?.[0]?.count ?? 0), 0),
  }));

  return (
    <div>
      <Breadcrumb
        items={[
          { label: "Languages", href: "/content/languages" },
          { label: "All Decks" },
        ]}
      />
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">All Decks</h1>
      </div>

      <DecksFilter
        languages={languages ?? []}
        languageId={language_id ?? ""}
        status={status ?? ""}
      />

      {!decks.length ? (
        <div className="rounded-lg border border-dashed border-gray-200 py-16 text-center">
          <p className="text-sm text-gray-500">No decks found.</p>
        </div>
      ) : (
        <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Deck
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Language
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Section
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Words
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Status
                </th>
                <th />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {decks.map((d) => {
                const lang = d.sections?.languages;
                return (
                  <tr key={d.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{d.title}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {lang ? `${lang.emoji_flag} ${lang.name}` : "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {d.sections ? (
                        <Link
                          href={`/content/decks?section_id=${d.sections.id}`}
                          className="hover:underline"
                        >
                          {d.sections.name}
                        </Link>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{d.word_count}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          d.status === "published"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {d.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/content/decks/${d.id}/edit?section_id=${d.section_id}`}
                        className="text-sm text-gray-500 hover:text-gray-900"
                      >
                        Edit →
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
