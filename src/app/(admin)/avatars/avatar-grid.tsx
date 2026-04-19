"use client";

import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Upload, Star, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface Avatar {
  id: string;
  name: string;
  image_url: string;
  is_default: boolean;
  status: "published" | "draft";
}

export function AvatarGrid({ avatars: initial }: { avatars: Avatar[] }) {
  const [avatars, setAvatars] = useState(initial);
  const [uploading, setUploading] = useState(false);
  const [newName, setNewName] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  async function handleUpload(file: File) {
    if (!newName.trim()) { toast.error("Enter a name before uploading."); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error("File must be under 5MB."); return; }
    setUploading(true);

    const ext = file.name.split(".").pop();
    const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error: uploadError } = await supabase.storage.from("avatars").upload(path, file);
    if (uploadError) { toast.error(uploadError.message); setUploading(false); return; }

    const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(path);

    const { data, error } = await supabase
      .from("avatars")
      .insert({ name: newName.trim(), image_url: publicUrl, is_default: false, status: "published" })
      .select()
      .single();

    setUploading(false);
    if (error) { toast.error(error.message); return; }
    setAvatars((prev) => [...prev, data]);
    setNewName("");
    toast.success("Avatar uploaded.");
  }

  async function setDefault(id: string) {
    const { error } = await supabase.rpc("set_default_avatar", { avatar_id: id });
    if (error) {
      // Fallback: manual two-step update if RPC doesn't exist
      await supabase.from("avatars").update({ is_default: false }).neq("id", id);
      await supabase.from("avatars").update({ is_default: true }).eq("id", id);
    }
    setAvatars((prev) => prev.map((a) => ({ ...a, is_default: a.id === id })));
    toast.success("Default avatar set.");
  }

  async function toggleStatus(id: string, current: "published" | "draft") {
    const next = current === "published" ? "draft" : "published";
    const { error } = await supabase.from("avatars").update({ status: next }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    setAvatars((prev) => prev.map((a) => a.id === id ? { ...a, status: next } : a));
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this avatar?")) return;
    const { error } = await supabase.from("avatars").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    setAvatars((prev) => prev.filter((a) => a.id !== id));
    toast.success("Avatar deleted.");
  }

  return (
    <div className="space-y-6">
      {/* Upload row */}
      <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4">
        <Input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Avatar name (e.g. Fox, Panda)"
          className="max-w-xs"
        />
        <Button
          type="button"
          size="sm"
          disabled={uploading || !newName.trim()}
          onClick={() => fileRef.current?.click()}
        >
          <Upload className="mr-2 h-4 w-4" />
          {uploading ? "Uploading…" : "Upload image"}
        </Button>
        <p className="text-xs text-gray-400">PNG or WebP · max 5MB</p>
        <input
          ref={fileRef}
          type="file"
          accept="image/png,image/webp,image/jpeg"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleUpload(file);
            e.target.value = "";
          }}
        />
      </div>

      {/* Grid */}
      {avatars.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-200 py-16 text-center">
          <p className="text-sm text-gray-500">No avatars yet. Upload the first one above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {avatars.map((avatar) => (
            <div
              key={avatar.id}
              className={`relative group rounded-xl border-2 bg-white p-3 flex flex-col items-center gap-2 transition-colors ${
                avatar.is_default ? "border-black" : "border-gray-200 hover:border-gray-300"
              }`}
            >
              {/* Default star badge */}
              {avatar.is_default && (
                <div className="absolute -top-2 -right-2 bg-black rounded-full p-1">
                  <Star className="h-3 w-3 text-white fill-white" />
                </div>
              )}

              <img
                src={avatar.image_url}
                alt={avatar.name}
                className="w-16 h-16 rounded-full object-cover"
              />

              <p className="text-xs font-medium text-center truncate w-full text-center">{avatar.name}</p>

              <Badge
                variant={avatar.status === "published" ? "default" : "secondary"}
                className="text-xs"
              >
                {avatar.status}
              </Badge>

              {/* Actions — visible on hover */}
              <div className="flex gap-1 flex-wrap justify-center">
                {!avatar.is_default && (
                  <button
                    onClick={() => setDefault(avatar.id)}
                    className="text-xs text-gray-500 hover:text-black underline"
                    title="Set as default"
                  >
                    Set default
                  </button>
                )}
                <button
                  onClick={() => toggleStatus(avatar.id, avatar.status)}
                  className="text-xs text-gray-500 hover:text-black underline"
                >
                  {avatar.status === "published" ? "Unpublish" : "Publish"}
                </button>
                <button
                  onClick={() => handleDelete(avatar.id)}
                  className="text-xs text-red-400 hover:text-red-600"
                  title="Delete"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
