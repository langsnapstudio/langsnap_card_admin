import { createClient } from "@/lib/supabase/server";
import { LinkButton } from "@/components/ui/link-button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";

export default async function LanguagesPage() {
  const supabase = await createClient();
  const { data: languages } = await supabase
    .from("languages")
    .select("*")
    .order("name");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Languages</h1>
        <LinkButton href="/content/languages/new" size="sm">
          <Plus className="mr-2 h-4 w-4" />
          New language
        </LinkButton>
      </div>

      {!languages?.length ? (
        <div className="rounded-lg border border-dashed border-gray-200 py-16 text-center">
          <p className="text-sm text-gray-500">No languages yet.</p>
          <LinkButton href="/content/languages/new" size="sm" className="mt-4">
            Create first language
          </LinkButton>
        </div>
      ) : (
        <div className="rounded-lg border border-gray-200 bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Language</TableHead>
                <TableHead>Reading systems</TableHead>
                <TableHead>Status</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {languages.map((lang) => (
                <TableRow key={lang.id}>
                  <TableCell className="font-medium">
                    {lang.emoji_flag} {lang.name}
                  </TableCell>
                  <TableCell className="text-gray-500 text-sm">
                    {[lang.supports_pinyin && "Pinyin", lang.supports_zhuyin && "Zhuyin"]
                      .filter(Boolean)
                      .join(", ") || "—"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={lang.status === "published" ? "default" : "secondary"}>
                      {lang.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <LinkButton href={`/content/languages/${lang.id}/edit`} variant="ghost" size="sm">
                      Edit
                    </LinkButton>
                    <LinkButton href={`/content/sections?language_id=${lang.id}`} variant="ghost" size="sm">
                      Sections →
                    </LinkButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
