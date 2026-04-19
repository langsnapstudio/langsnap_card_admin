import { createClient } from "@/lib/supabase/server";
import { AvatarGrid } from "./avatar-grid";

export default async function AvatarsPage() {
  const supabase = await createClient();
  const { data: avatars } = await supabase
    .from("avatars")
    .select("id, name, image_url, is_default, status")
    .order("created_at");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Avatars</h1>
        <p className="text-sm text-gray-500 mt-1">
          Upload avatar images for users to choose from. The <strong>default</strong> avatar (★) is assigned to new users automatically.
        </p>
      </div>
      <AvatarGrid avatars={avatars ?? []} />
    </div>
  );
}
