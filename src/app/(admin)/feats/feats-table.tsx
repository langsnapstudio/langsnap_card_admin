"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import type { Feat } from "@/types";

export function FeatsTable({ feats: initial }: { feats: Feat[] }) {
  const [feats, setFeats] = useState(initial);
  const supabase = createClient();

  async function updateFeat(id: string, patch: Partial<Feat>) {
    const { error } = await supabase.from("feats").update(patch).eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    setFeats((prev) => prev.map((f) => (f.id === id ? { ...f, ...patch } : f)));
    toast.success("Feat updated.");
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">#</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Requirement</TableHead>
            <TableHead className="w-32">Reward (energy)</TableHead>
            <TableHead className="w-24">Active</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {feats.map((feat) => (
            <FeatRow key={feat.id} feat={feat} onUpdate={updateFeat} />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function FeatRow({
  feat,
  onUpdate,
}: {
  feat: Feat;
  onUpdate: (id: string, patch: Partial<Feat>) => void;
}) {
  const [reward, setReward] = useState(String(feat.reward_amount));
  const [dirty, setDirty] = useState(false);

  function handleRewardChange(v: string) {
    setReward(v);
    setDirty(true);
  }

  function handleRewardBlur() {
    const parsed = parseInt(reward, 10);
    if (!dirty || isNaN(parsed) || parsed < 0) return;
    onUpdate(feat.id, { reward_amount: parsed });
    setDirty(false);
  }

  return (
    <TableRow>
      <TableCell className="text-gray-500">{feat.feat_number}</TableCell>
      <TableCell className="font-medium">{feat.name}</TableCell>
      <TableCell className="text-sm text-gray-600">{feat.requirement_description}</TableCell>
      <TableCell>
        <Input
          type="number"
          min={0}
          value={reward}
          onChange={(e) => handleRewardChange(e.target.value)}
          onBlur={handleRewardBlur}
          className="h-8 w-20"
        />
      </TableCell>
      <TableCell>
        <Switch
          checked={feat.is_active}
          onCheckedChange={(v) => onUpdate(feat.id, { is_active: v })}
        />
      </TableCell>
    </TableRow>
  );
}
