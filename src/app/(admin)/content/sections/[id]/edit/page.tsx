import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { SectionForm } from "../../section-form";

export default async function EditSectionPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ language_id?: string }>;
}) {
  const { id } = await params;
  const { language_id } = await searchParams;

  const supabase = await createClient();
  const [{ data: section }, { data: language }] = await Promise.all([
    supabase.from("sections").select("*").eq("id", id).single(),
    language_id
      ? supabase.from("languages").select("id, name, emoji_flag").eq("id", language_id).single()
      : Promise.resolve({ data: null }),
  ]);

  if (!section) notFound();
  const langId = language_id ?? section.language_id;

  return (
    <div>
      <Breadcrumb
        items={[
          { label: "Languages", href: "/content/languages" },
          ...(language ? [{ label: `${language.emoji_flag} ${language.name}`, href: `/content/sections?language_id=${langId}` }] : []),
          { label: section.name, href: `/content/sections?language_id=${langId}` },
          { label: "Edit" },
        ]}
      />
      <h1 className="text-2xl font-semibold mb-6">Edit Section</h1>
      <SectionForm section={section} languageId={langId} />
    </div>
  );
}
