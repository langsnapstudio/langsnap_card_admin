import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { DeckForm } from "../deck-form";

export default async function NewDeckPage({
  searchParams,
}: {
  searchParams: Promise<{ section_id?: string }>;
}) {
  const { section_id } = await searchParams;
  if (!section_id) notFound();

  const supabase = await createClient();
  const { data: section } = await supabase
    .from("sections")
    .select("id, name, language_id, languages(name, emoji_flag)")
    .eq("id", section_id)
    .single();
  if (!section) notFound();
  const lang = section.languages as unknown as { name: string; emoji_flag: string } | null;

  return (
    <div>
      <Breadcrumb
        items={[
          { label: "Languages", href: "/content/languages" },
          ...(lang ? [{ label: `${lang.emoji_flag} ${lang.name}`, href: `/content/sections?language_id=${section.language_id}` }] : []),
          { label: section.name, href: `/content/decks?section_id=${section_id}` },
          { label: "New deck" },
        ]}
      />
      <h1 className="text-2xl font-semibold mb-6">New Deck</h1>
      <DeckForm sectionId={section_id} />
    </div>
  );
}
