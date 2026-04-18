import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { LanguageForm } from "../../language-form";

export default async function EditLanguagePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: language } = await supabase
    .from("languages")
    .select("*")
    .eq("id", id)
    .single();

  if (!language) notFound();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Edit Language</h1>
      <LanguageForm language={language} />
    </div>
  );
}
