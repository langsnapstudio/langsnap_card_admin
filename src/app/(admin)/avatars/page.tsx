import { createClient } from "@/lib/supabase/server";
import { LinkButton } from "@/components/ui/link-button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus } from "lucide-react";

export default async function AvatarsPage() {
  const supabase = await createClient();
  const { data: packs } = await supabase
    .from("avatar_packs")
    .select("*, avatar_count:avatars(count)")
    .order("name");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Avatars</h1>
        <LinkButton href="/avatars/new" size="sm">
          <Plus className="mr-2 h-4 w-4" />
          New avatar pack
        </LinkButton>
      </div>

      {!packs?.length ? (
        <div className="rounded-lg border border-dashed border-gray-200 py-16 text-center">
          <p className="text-sm text-gray-500">No avatar packs yet.</p>
          <LinkButton href="/avatars/new" size="sm" className="mt-4">
            Create first pack
          </LinkButton>
        </div>
      ) : (
        <div className="rounded-lg border border-gray-200 bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pack name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Avatars</TableHead>
                <TableHead>Status</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {packs.map((pack) => (
                <TableRow key={pack.id}>
                  <TableCell className="font-medium">{pack.name}</TableCell>
                  <TableCell className="text-gray-600">{pack.category}</TableCell>
                  <TableCell className="text-gray-600">
                    {(pack.avatar_count as unknown as { count: number }[])?.[0]?.count ?? 0}
                  </TableCell>
                  <TableCell>
                    <Badge variant={pack.status === "published" ? "default" : "secondary"}>
                      {pack.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <LinkButton href={`/avatars/${pack.id}`} variant="ghost" size="sm">
                      Manage →
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
