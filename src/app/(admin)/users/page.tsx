import { UserSearch } from "./user-search";

export default function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; q?: string }>;
}) {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Users</h1>
      <UserSearch />
    </div>
  );
}
