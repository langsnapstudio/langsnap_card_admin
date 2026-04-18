import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/link-button";
import { Users, BookOpen, Package, TrendingUp } from "lucide-react";

async function getDashboardStats(supabase: Awaited<ReturnType<typeof createClient>>) {
  const [
    { count: totalUsers },
    { count: freeUsers },
    { count: premiumUsers },
    { count: totalPacksRedeemed },
  ] = await Promise.all([
    supabase.from("users").select("*", { count: "exact", head: true }),
    supabase.from("users").select("*", { count: "exact", head: true }).eq("plan", "free"),
    supabase.from("users").select("*", { count: "exact", head: true }).eq("plan", "premium"),
    supabase.from("user_pack_redemptions").select("*", { count: "exact", head: true }),
  ]);

  return {
    totalUsers: totalUsers ?? 0,
    freeUsers: freeUsers ?? 0,
    premiumUsers: premiumUsers ?? 0,
    totalPacksRedeemed: totalPacksRedeemed ?? 0,
  };
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const stats = await getDashboardStats(supabase).catch(() => ({
    totalUsers: 0,
    freeUsers: 0,
    premiumUsers: 0,
    totalPacksRedeemed: 0,
  }));

  const statCards = [
    { label: "Total users", value: stats.totalUsers, icon: Users },
    { label: "Free users", value: stats.freeUsers, icon: Users },
    { label: "Premium users", value: stats.premiumUsers, icon: TrendingUp },
    { label: "Total packs redeemed", value: stats.totalPacksRedeemed, icon: Package },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold">Dashboard</h1>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {statCards.map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">{label}</CardTitle>
              <Icon className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{value.toLocaleString()}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div>
        <h2 className="mb-4 text-base font-semibold">Quick links</h2>
        <div className="flex flex-wrap gap-3">
          <LinkButton href="/content/decks/new" variant="outline" size="sm">
            <BookOpen className="mr-2 h-4 w-4" />
            Create new deck
          </LinkButton>
          <LinkButton href="/content/packs/new" variant="outline" size="sm">
            <Package className="mr-2 h-4 w-4" />
            Create new pack
          </LinkButton>
          <LinkButton href="/content/decks?status=draft" variant="outline" size="sm">
            View unpublished decks
          </LinkButton>
          <LinkButton href="/users?tab=deletion-requests" variant="outline" size="sm">
            View pending deletion requests
          </LinkButton>
        </div>
      </div>
    </div>
  );
}
