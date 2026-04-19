import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/link-button";
import { Users, BookOpen, Package, TrendingUp, Zap, Activity } from "lucide-react";

type Range = "7d" | "30d" | "90d" | "all";

function rangeToInterval(range: Range) {
  if (range === "7d") return 7;
  if (range === "30d") return 30;
  if (range === "90d") return 90;
  return null;
}

async function getStats(
  supabase: Awaited<ReturnType<typeof createClient>>,
  range: Range
) {
  const days = rangeToInterval(range);
  const since = days ? new Date(Date.now() - days * 86400000).toISOString() : null;

  const todayUTC = new Date();
  todayUTC.setUTCHours(0, 0, 0, 0);

  let packsQuery = supabase.from("user_pack_redemptions").select("*", { count: "exact", head: true });
  if (since) packsQuery = packsQuery.gte("created_at", since);

  let wordsQuery = supabase.from("users").select("total_words_learned");
  if (since) wordsQuery = wordsQuery.gte("last_active_at", since);

  const [
    { count: totalUsers },
    { count: freeUsers },
    { count: premiumUsers },
    { count: activeToday },
    packsResult,
    wordsResult,
  ] = await Promise.all([
    supabase.from("users").select("*", { count: "exact", head: true }),
    supabase.from("users").select("*", { count: "exact", head: true }).eq("plan", "free"),
    supabase.from("users").select("*", { count: "exact", head: true }).eq("plan", "premium"),
    supabase.from("users").select("*", { count: "exact", head: true }).gte("last_active_at", todayUTC.toISOString()),
    packsQuery,
    wordsQuery,
  ]);

  const totalWordsLearned = (wordsResult.data ?? []).reduce(
    (sum: number, u: { total_words_learned?: number }) => sum + (u.total_words_learned ?? 0),
    0
  );

  return {
    totalUsers: totalUsers ?? 0,
    freeUsers: freeUsers ?? 0,
    premiumUsers: premiumUsers ?? 0,
    activeToday: activeToday ?? 0,
    totalPacksRedeemed: packsResult.count ?? 0,
    totalWordsLearned,
  };
}

async function getRetention(supabase: Awaited<ReturnType<typeof createClient>>) {
  try {
    const compute = async (days: number) => {
      const cutoff = new Date(Date.now() - days * 86400000).toISOString();
      const { data: cohort } = await supabase
        .from("users")
        .select("id, joined_at")
        .lte("joined_at", cutoff);
      if (!cohort?.length) return null;

      const { data: sessions } = await supabase
        .from("study_sessions")
        .select("user_id, created_at")
        .in("user_id", cohort.map((u) => u.id));

      if (!sessions) return null;

      const retained = cohort.filter((u) => {
        const target = new Date(u.joined_at).getTime() + days * 86400000;
        return sessions.some((s) => {
          const t = new Date(s.created_at).getTime();
          return s.user_id === u.id && Math.abs(t - target) < 86400000;
        });
      });

      return Math.round((retained.length / cohort.length) * 100);
    };

    const [d7, d30, d90] = await Promise.all([compute(7), compute(30), compute(90)]);
    return { d7, d30, d90 };
  } catch {
    return { d7: null, d30: null, d90: null };
  }
}

async function getPendingDeletions(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { count } = await supabase
    .from("users")
    .select("*", { count: "exact", head: true })
    .eq("account_status", "deactivated")
    .not("deletion_requested_at", "is", null);
  return count ?? 0;
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const { range: rawRange } = await searchParams;
  const range: Range = ["7d", "30d", "90d", "all"].includes(rawRange ?? "")
    ? (rawRange as Range)
    : "all";

  const supabase = await createClient();

  const [stats, retention, pendingDeletions] = await Promise.all([
    getStats(supabase, range).catch(() => ({
      totalUsers: 0, freeUsers: 0, premiumUsers: 0,
      activeToday: 0, totalPacksRedeemed: 0, totalWordsLearned: 0,
    })),
    getRetention(supabase),
    getPendingDeletions(supabase).catch(() => 0),
  ]);

  const rangeOptions: { label: string; value: Range }[] = [
    { label: "Last 7 days", value: "7d" },
    { label: "Last 30 days", value: "30d" },
    { label: "Last 90 days", value: "90d" },
    { label: "All time", value: "all" },
  ];

  function fmt(n: number) { return n.toLocaleString(); }
  function pct(n: number | null) { return n === null ? "—" : `${n}%`; }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <div className="flex gap-1.5">
          {rangeOptions.map((opt) => (
            <a
              key={opt.value}
              href={`/dashboard?range=${opt.value}`}
              className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                range === opt.value
                  ? "bg-black text-white border-black"
                  : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
              }`}
            >
              {opt.label}
            </a>
          ))}
        </div>
      </div>

      {/* Users */}
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Users</p>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard label="Total users" value={fmt(stats.totalUsers)} icon={Users} />
          <StatCard label="Active today" value={fmt(stats.activeToday)} icon={Activity} note="UTC" />
          <StatCard label="Free users" value={fmt(stats.freeUsers)} icon={Users} />
          <StatCard label="Premium users" value={fmt(stats.premiumUsers)} icon={TrendingUp} />
        </div>
      </div>

      {/* Engagement */}
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
          Engagement {range !== "all" && <span className="normal-case font-normal">({rangeOptions.find(o => o.value === range)?.label})</span>}
        </p>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
          <StatCard label="Total words learned" value={fmt(stats.totalWordsLearned)} icon={BookOpen} />
          <StatCard label="Packs redeemed" value={fmt(stats.totalPacksRedeemed)} icon={Package} />
        </div>
      </div>

      {/* Retention — always all-time cohort */}
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Retention</p>
        <p className="text-xs text-gray-400 mb-3">All-time cohort figures — not affected by date range filter</p>
        <div className="grid grid-cols-3 gap-4">
          <StatCard label="D7 retention" value={pct(retention.d7)} icon={Zap}
            note={retention.d7 === null ? "Needs study_sessions table" : undefined} />
          <StatCard label="D30 retention" value={pct(retention.d30)} icon={Zap}
            note={retention.d30 === null ? "Needs study_sessions table" : undefined} />
          <StatCard label="D90 retention" value={pct(retention.d90)} icon={Zap}
            note={retention.d90 === null ? "Needs study_sessions table" : undefined} />
        </div>
      </div>

      {/* Quick links */}
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Quick links</p>
        <div className="flex flex-wrap gap-3">
          <LinkButton href="/content/languages" variant="outline" size="sm">
            <BookOpen className="mr-2 h-4 w-4" />
            Manage content
          </LinkButton>
          <LinkButton href="/content/languages" variant="outline" size="sm">
            <Package className="mr-2 h-4 w-4" />
            New pack
          </LinkButton>
          <LinkButton href="/content/decks?status=draft" variant="outline" size="sm">
            View unpublished decks
          </LinkButton>
          <LinkButton
            href="/users?tab=deletions"
            variant="outline"
            size="sm"
            className={pendingDeletions > 0 ? "border-red-300 text-red-600 hover:border-red-400" : ""}
          >
            Deletion requests {pendingDeletions > 0 && `(${pendingDeletions})`}
          </LinkButton>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  note,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
  note?: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-500">{label}</CardTitle>
        <Icon className="h-4 w-4 text-gray-400" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {note && <p className="text-xs text-gray-400 mt-1">{note}</p>}
      </CardContent>
    </Card>
  );
}
