"use client";

import { useRouter } from "next/navigation";

interface Language {
  id: string;
  name: string;
  emoji_flag: string;
}

export function DecksFilter({
  languages,
  languageId,
  status,
}: {
  languages: Language[];
  languageId: string;
  status: string;
}) {
  const router = useRouter();

  function navigate(newLangId: string, newStatus: string) {
    const p = new URLSearchParams();
    if (newLangId) p.set("language_id", newLangId);
    if (newStatus) p.set("status", newStatus);
    router.push(`/content/decks${p.toString() ? `?${p}` : ""}`);
  }

  return (
    <div className="flex flex-wrap gap-3 items-center mb-5">
      <select
        value={languageId}
        onChange={(e) => navigate(e.target.value, status)}
        className="px-3 py-1.5 rounded-md text-sm border border-gray-200 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-300"
      >
        <option value="">All languages</option>
        {languages.map((l) => (
          <option key={l.id} value={l.id}>
            {l.emoji_flag} {l.name}
          </option>
        ))}
      </select>

      {[
        { label: "All", value: "" },
        { label: "Published", value: "published" },
        { label: "Draft", value: "draft" },
      ].map((opt) => (
        <button
          key={opt.value}
          onClick={() => navigate(languageId, opt.value)}
          className={`px-3 py-1 rounded-full text-sm border transition-colors ${
            status === opt.value
              ? "bg-black text-white border-black"
              : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
