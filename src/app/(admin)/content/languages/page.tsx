import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
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
        <Button asChild size="sm">
          <Link href="/content/languages/new">
            <Plus className="mr-2 h-4 w-4" />
            New language
          </Link>
        </Button>
      </div>

      {!languages?.length ? (
        <div className="rounded-lg border border-dashed border-gray-200 py-16 text-center">
          <p className="text-sm text-gray-500">No languages yet.</p>
          <Button asChild size="sm" className="mt-4">
            <Link href="/content/languages/new">Create first language</Link>
          </Button>
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
                  <TableCell className="text-right">
                    <Button asChild variant="ghost" size="sm">
                      <Link href={`/content/languages/${lang.id}/edit`}>Edit</Link>
                    </Button>
                    <Button asChild variant="ghost" size="sm">
                      <Link href={`/content/sections?language_id=${lang.id}`}>Sections →</Link>
                    </Button>
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
