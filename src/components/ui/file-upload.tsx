"use client";

import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Upload, X, Play } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  bucket: string;
  accept: string;
  maxSizeMb: number;
  value?: string;
  onChange: (url: string) => void;
  onClear?: () => void;
  label?: string;
  type?: "image" | "audio";
}

export function FileUpload({
  bucket,
  accept,
  maxSizeMb,
  value,
  onChange,
  onClear,
  label = "Upload file",
  type = "image",
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  async function handleFile(file: File) {
    if (file.size > maxSizeMb * 1024 * 1024) {
      toast.error(`File must be under ${maxSizeMb}MB.`);
      return;
    }
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const { error } = await supabase.storage.from(bucket).upload(path, file);
    if (error) {
      toast.error(`Upload failed: ${error.message}`);
      setUploading(false);
      return;
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    onChange(data.publicUrl);
    setUploading(false);
    toast.success("Uploaded.");
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  return (
    <div className="space-y-2">
      {value ? (
        <div className="relative inline-block">
          {type === "image" ? (
            <img
              src={value}
              alt="Uploaded"
              className="h-24 w-24 rounded-lg object-cover border border-gray-200"
            />
          ) : (
            <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
              <Play className="h-4 w-4 text-gray-500" />
              <audio controls src={value} className="h-8 max-w-xs" />
            </div>
          )}
          {onClear && (
            <button
              type="button"
              onClick={onClear}
              className="absolute -right-2 -top-2 rounded-full bg-white border border-gray-200 p-0.5 shadow hover:bg-gray-50"
            >
              <X className="h-3 w-3 text-gray-500" />
            </button>
          )}
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="mt-1 block text-xs text-gray-500 hover:text-gray-700 underline"
          >
            Replace
          </button>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-200 py-6 px-4 text-center transition-colors hover:border-gray-300 hover:bg-gray-50",
            uploading && "opacity-50 pointer-events-none"
          )}
          onClick={() => inputRef.current?.click()}
        >
          <Upload className="h-5 w-5 text-gray-400 mb-1" />
          <p className="text-sm text-gray-500">{uploading ? "Uploading…" : label}</p>
          <p className="text-xs text-gray-400 mt-0.5">or drag and drop · max {maxSizeMb}MB</p>
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}
