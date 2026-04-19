import { LinkButton } from "@/components/ui/link-button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

interface DeletionRequest {
  id: string;
  display_name?: string;
  username?: string;
  email?: string;
  deletion_requested_at: string;
}

export function DeletionRequests({ deletions }: { deletions: DeletionRequest[] }) {
  if (!deletions.length) {
    return (
      <div className="rounded-lg border border-dashed border-gray-200 py-16 text-center">
        <p className="text-sm text-gray-500">No pending deletion requests.</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Requested</TableHead>
            <TableHead>Days remaining</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {deletions.map((d) => {
            const requested = new Date(d.deletion_requested_at);
            const daysRemaining = Math.max(
              0,
              30 - Math.floor((Date.now() - requested.getTime()) / 86400000)
            );
            return (
              <TableRow key={d.id}>
                <TableCell className="font-medium">
                  {d.display_name ?? d.username ?? "—"}
                  {d.username && <span className="ml-1 text-gray-400 font-normal">@{d.username}</span>}
                </TableCell>
                <TableCell className="text-gray-600">{d.email ?? "—"}</TableCell>
                <TableCell className="text-gray-600 text-sm">
                  {requested.toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <span className={daysRemaining <= 7 ? "text-red-600 font-medium" : "text-gray-700"}>
                    {daysRemaining} days
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <LinkButton href={`/users/${d.id}`} variant="ghost" size="sm">
                    Manage →
                  </LinkButton>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
