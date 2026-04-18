"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export function SettingsForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const supabase = createClient();

  async function handleEmailChange(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!email.trim()) return;
    setEmailLoading(true);
    const { error } = await supabase.auth.updateUser({ email: email.trim() });
    setEmailLoading(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Confirmation sent to new email address.");
    setEmail("");
  }

  async function handlePasswordChange(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!password.trim()) return;
    setPasswordLoading(true);
    const { error } = await supabase.auth.updateUser({ password: password.trim() });
    setPasswordLoading(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Password updated.");
    setPassword("");
  }

  return (
    <div className="max-w-lg space-y-6">
      <form
        onSubmit={handleEmailChange}
        className="space-y-4 rounded-lg border border-gray-200 bg-white p-6"
      >
        <h2 className="text-base font-semibold">Change email</h2>
        <div className="space-y-1.5">
          <Label htmlFor="new-email">New email address</Label>
          <Input
            id="new-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <Button type="submit" disabled={emailLoading} size="sm">
          {emailLoading ? "Saving…" : "Update email"}
        </Button>
      </form>

      <form
        onSubmit={handlePasswordChange}
        className="space-y-4 rounded-lg border border-gray-200 bg-white p-6"
      >
        <h2 className="text-base font-semibold">Change password</h2>
        <div className="space-y-1.5">
          <Label htmlFor="new-password">New password</Label>
          <Input
            id="new-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
          />
        </div>
        <Button type="submit" disabled={passwordLoading} size="sm">
          {passwordLoading ? "Saving…" : "Update password"}
        </Button>
      </form>
    </div>
  );
}
