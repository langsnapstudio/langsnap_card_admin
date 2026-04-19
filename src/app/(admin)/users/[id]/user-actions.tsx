"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function UserActions({ userId }: { userId: string }) {
  const [loading, setLoading] = useState<"restore" | "delete" | null>(null);
  const router = useRouter();
  const supabase = createClient();

  async function restore() {
    if (!confirm("Restore this account? The deletion request will be cancelled.")) return;
    setLoading("restore");
    const { error } = await supabase
      .from("users")
      .update({ account_status: "active", deletion_requested_at: null })
      .eq("id", userId);
    setLoading(null);
    if (error) { toast.error(error.message); return; }
    toast.success("Account restored.");
    router.refresh();
  }

  async function permanentDelete() {
    if (!confirm("Permanently delete this account now? This cannot be undone.")) return;
    setLoading("delete");
    const { error } = await supabase
      .from("users")
      .update({ account_status: "deleted" })
      .eq("id", userId);
    setLoading(null);
    if (error) { toast.error(error.message); return; }
    toast.success("Account marked as deleted.");
    router.push("/users");
    router.refresh();
  }

  return (
    <div className="flex gap-3">
      <Button size="sm" variant="outline" onClick={restore} disabled={!!loading}>
        {loading === "restore" ? "Restoring…" : "Restore account"}
      </Button>
      <Button size="sm" variant="destructive" onClick={permanentDelete} disabled={!!loading}>
        {loading === "delete" ? "Deleting…" : "Delete now"}
      </Button>
    </div>
  );
}
