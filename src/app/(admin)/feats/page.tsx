import { createClient } from "@/lib/supabase/server";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FeatsTable } from "./feats-table";

export default async function FeatsPage() {
  const supabase = await createClient();
  const { data: feats } = await supabase
    .from("feats")
    .select("*")
    .order("feat_number");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Feats & Challenges</h1>
        <p className="mt-1 text-sm text-gray-500">
          Configure reward amounts and active state for each feat.
        </p>
      </div>
      {feats && feats.length > 0 ? (
        <FeatsTable feats={feats} />
      ) : (
        <p className="text-sm text-gray-500">No feats found in the database.</p>
      )}
    </div>
  );
}
