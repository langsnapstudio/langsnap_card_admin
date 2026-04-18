import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";
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
        <Button asChild size="sm">
          <Link href="/avatars/new">
            <Plus className="mr-2 h-4 w-4" />
            New avatar pack
          </Link>
        </Button>
      </div>

      {!packs?.length ? (
        <div className="rounded-lg border border-dashed border-gray-200 py-16 text-center">
          <p className="text-sm text-gray-500">No avatar packs yet.</p>
          <Button asChild size="sm" className="mt-4">
            <Link href="/avatars/new">Create first pack</Link>
          </Button>
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
                    <Button asChild variant="ghost" size="sm">
                      <Link href={`/avatars/${pack.id}`}>Manage →</Link>
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
