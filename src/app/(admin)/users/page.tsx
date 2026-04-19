import { createClient } from "@/lib/supabase/server";
import { UserSearch } from "./user-search";
import { DeletionRequests } from "./deletion-requests";

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab } = await searchParams;
  const activeTab = tab === "deletions" ? "deletions" : "search";

  const supabase = await createClient();
  const { data: deletions } = await supabase
    .from("users")
    .select("id, display_name, username, email, deletion_requested_at")
    .eq("account_status", "deactivated")
    .not("deletion_requested_at", "is", null)
    .order("deletion_requested_at");

  const deletionCount = deletions?.length ?? 0;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Users</h1>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200">
        <a
          href="/users"
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
            activeTab === "search"
              ? "border-black text-black"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Search
        </a>
        <a
          href="/users?tab=deletions"
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors flex items-center gap-2 ${
            activeTab === "deletions"
              ? "border-black text-black"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Deletion Requests
          {deletionCount > 0 && (
            <span className="rounded-full bg-red-500 text-white text-xs px-1.5 py-0.5 leading-none">
              {deletionCount}
            </span>
          )}
        </a>
      </div>

      {activeTab === "search" ? (
        <UserSearch />
      ) : (
        <DeletionRequests deletions={deletions ?? []} />
      )}
    </div>
  );
}
