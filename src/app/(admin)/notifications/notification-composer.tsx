"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const TITLE_MAX = 50;
const BODY_MAX = 150;

export function NotificationComposer() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [deepLink, setDeepLink] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleSend(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (title.length > TITLE_MAX || body.length > BODY_MAX) return;
    if (!title.trim() || !body.trim()) {
      toast.error("Title and body are required.");
      return;
    }
    setLoading(true);

    const { count: reach } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true })
      .eq("account_status", "active");

    const { error } = await supabase.from("push_notifications").insert({
      title: title.trim(),
      body: body.trim(),
      audience: "all",
      deep_link: deepLink.trim() || null,
      sent_at: new Date().toISOString(),
      estimated_reach: reach ?? 0,
    });

    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Notification logged. Integrate with Expo Push API to deliver.");
    setTitle("");
    setBody("");
    setDeepLink("");
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSend}
      className="max-w-lg space-y-5 rounded-lg border border-gray-200 bg-white p-6"
    >
      <h2 className="text-base font-semibold">Compose notification</h2>
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="notif-title">Title *</Label>
          <span className={`text-xs ${title.length > TITLE_MAX ? "text-red-500" : "text-gray-400"}`}>
            {title.length}/{TITLE_MAX}
          </span>
        </div>
        <Input
          id="notif-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={TITLE_MAX}
          required
        />
      </div>
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="notif-body">Body *</Label>
          <span className={`text-xs ${body.length > BODY_MAX ? "text-red-500" : "text-gray-400"}`}>
            {body.length}/{BODY_MAX}
          </span>
        </div>
        <Textarea
          id="notif-body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          maxLength={BODY_MAX}
          rows={3}
          required
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="deep-link">Deep link (optional)</Label>
        <Input
          id="deep-link"
          value={deepLink}
          onChange={(e) => setDeepLink(e.target.value)}
          placeholder="/learn or /profile/challenges"
        />
      </div>
      <div className="flex items-center gap-3 rounded-md bg-gray-50 px-3 py-2 text-sm text-gray-600">
        Audience: <strong>All users</strong>
      </div>
      <Button
        type="submit"
        disabled={loading || title.length > TITLE_MAX || body.length > BODY_MAX}
      >
        {loading ? "Sending…" : "Send now"}
      </Button>
    </form>
  );
}
