import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { LinkButton } from "@/components/ui/link-button";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
import { SectionsSortable } from "./sections-sortable";

export default async function SectionsPage({
  searchParams,
}: {
  searchParams: Promise<{ language_id?: string }>;
}) {
  const { language_id } = await searchParams;
  if (!language_id) notFound();

  const supabase = await createClient();
  const [{ data: language }, { data: sections }] = await Promise.all([
    supabase.from("languages").select("id, name, emoji_flag").eq("id", language_id).single(),
    supabase
      .from("sections")
      .select("*, deck_count:decks(count)")
      .eq("language_id", language_id)
      .order("order_position"),
  ]);

  if (!language) notFound();

  return (
    <div>
      <Breadcrumb
        items={[
          { label: "Languages", href: "/content/languages" },
          { label: `${language.emoji_flag} ${language.name}` },
        ]}
      />
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Sections</h1>
        <LinkButton href={`/content/sections/new?language_id=${language_id}`} size="sm">
          <Plus className="mr-2 h-4 w-4" />
          New section
        </LinkButton>
      </div>

      {!sections?.length ? (
        <div className="rounded-lg border border-dashed border-gray-200 py-16 text-center">
          <p className="text-sm text-gray-500">No sections yet.</p>
          <LinkButton href={`/content/sections/new?language_id=${language_id}`} size="sm" className="mt-4">
            Create first section
          </LinkButton>
        </div>
      ) : (
        <SectionsSortable sections={sections} languageId={language_id} />
      )}
    </div>
  );
}
