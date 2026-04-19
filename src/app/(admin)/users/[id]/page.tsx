import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/ui/link-button";
import { UserActions } from "./user-actions";
import { ArrowLeft } from "lucide-react";

export default async function UserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: user } = await supabase
    .from("users")
    .select("*")
    .eq("id", id)
    .single();

  if (!user) notFound();

  const daysRemaining = user.deletion_requested_at
    ? 30 - Math.floor((Date.now() - new Date(user.deletion_requested_at).getTime()) / 86400000)
    : null;

  return (
    <div className="space-y-6 max-w-2xl">
      <LinkButton href="/users" variant="ghost" size="sm" className="-ml-2">
        <ArrowLeft className="mr-1 h-4 w-4" /> Back to Users
      </LinkButton>

      {/* Profile card */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 flex gap-5 items-start">
        {user.avatar_url ? (
          <img src={user.avatar_url} alt={user.display_name} className="h-16 w-16 rounded-full object-cover" />
        ) : (
          <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center text-2xl font-bold text-gray-400">
            {(user.display_name ?? user.username ?? "?")[0].toUpperCase()}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-semibold">{user.display_name ?? "—"}</h1>
            <Badge variant={user.account_status === "active" ? "outline" : "destructive"}>
              {user.account_status}
            </Badge>
          </div>
          <p className="text-gray-500 text-sm">@{user.username}</p>
          <p className="text-gray-500 text-sm">{user.email}</p>
        </div>
      </div>

      {/* Plan */}
      <Section title="Plan">
        <Row label="Plan">
          <Badge variant={user.plan === "premium" ? "default" : "secondary"}>{user.plan}</Badge>
        </Row>
        {user.plan === "premium" && user.subscription_plan && (
          <Row label="Subscription">{user.subscription_plan}</Row>
        )}
        {user.plan === "premium" && user.subscription_renewal_date && (
          <Row label="Renews">{new Date(user.subscription_renewal_date).toLocaleDateString()}</Row>
        )}
      </Section>

      {/* Activity */}
      <Section title="Activity">
        <Row label="Joined">{user.joined_at ? new Date(user.joined_at).toLocaleDateString() : "—"}</Row>
        <Row label="Last active">{user.last_active_at ? new Date(user.last_active_at).toLocaleDateString() : "—"}</Row>
        <Row label="Streak">{user.streak ?? 0} days</Row>
        <Row label="Packs redeemed">{user.total_packs_redeemed ?? 0}</Row>
        <Row label="Cards reviewed">{user.total_cards_reviewed ?? 0}</Row>
      </Section>

      {/* Deletion request */}
      {user.account_status === "deactivated" && user.deletion_requested_at && (
        <Section title="Deletion request">
          <Row label="Requested">{new Date(user.deletion_requested_at).toLocaleDateString()}</Row>
          <Row label="Days remaining">
            <span className={daysRemaining !== null && daysRemaining <= 7 ? "text-red-600 font-medium" : ""}>
              {daysRemaining !== null ? `${Math.max(0, daysRemaining)} days` : "—"}
            </span>
          </Row>
          <div className="pt-2">
            <UserActions userId={id} />
          </div>
        </Section>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
      <div className="px-4 py-2.5 border-b border-gray-100 bg-gray-50">
        <h2 className="text-sm font-semibold text-gray-600">{title}</h2>
      </div>
      <div className="divide-y divide-gray-100">{children}</div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center px-4 py-3 gap-4">
      <span className="w-36 text-sm text-gray-500 flex-shrink-0">{label}</span>
      <span className="text-sm font-medium">{children}</span>
    </div>
  );
}
