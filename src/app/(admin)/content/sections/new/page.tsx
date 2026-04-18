import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { SectionForm } from "../section-form";

export default async function NewSectionPage({
  searchParams,
}: {
  searchParams: Promise<{ language_id?: string }>;
}) {
  const { language_id } = await searchParams;
  if (!language_id) notFound();

  const supabase = await createClient();
  const { data: language } = await supabase
    .from("languages")
    .select("id, name, emoji_flag")
    .eq("id", language_id)
    .single();
  if (!language) notFound();

  return (
    <div>
      <Breadcrumb
        items={[
          { label: "Languages", href: "/content/languages" },
          { label: `${language.emoji_flag} ${language.name}`, href: `/content/sections?language_id=${language_id}` },
          { label: "New section" },
        ]}
      />
      <h1 className="text-2xl font-semibold mb-6">New Section</h1>
      <SectionForm languageId={language_id} />
    </div>
  );
}
