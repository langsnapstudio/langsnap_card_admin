import { LanguageForm } from "../language-form";

export default function NewLanguagePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">New Language</h1>
      <LanguageForm />
    </div>
  );
}
