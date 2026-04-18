import { createClient } from "@/lib/supabase/server";
import { NotificationComposer } from "./notification-composer";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function NotificationsPage() {
  const supabase = await createClient();
  const { data: notifications } = await supabase
    .from("push_notifications")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-semibold">Push Notifications</h1>
        <p className="mt-1 text-sm text-gray-500">
          Send manual broadcast notifications to all users.
        </p>
      </div>

      <NotificationComposer />

      <div>
        <h2 className="mb-4 text-base font-semibold">Sent notifications</h2>
        {!notifications?.length ? (
          <p className="text-sm text-gray-500">No notifications sent yet.</p>
        ) : (
          <div className="rounded-lg border border-gray-200 bg-white">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Body</TableHead>
                  <TableHead>Sent at</TableHead>
                  <TableHead>Reach</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {notifications.map((n) => (
                  <TableRow key={n.id}>
                    <TableCell className="font-medium">{n.title}</TableCell>
                    <TableCell className="text-gray-600 max-w-xs truncate">{n.body}</TableCell>
                    <TableCell className="text-gray-500 text-sm whitespace-nowrap">
                      {n.sent_at ? new Date(n.sent_at).toLocaleString() : "—"}
                    </TableCell>
                    <TableCell className="text-gray-500 text-sm">
                      {n.estimated_reach ?? "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
