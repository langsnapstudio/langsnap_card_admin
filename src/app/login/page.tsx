import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <div className="flex min-h-full items-center justify-center">
      <div className="w-full max-w-sm space-y-6 rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold">Langsnap Card Admin</h1>
          <p className="text-sm text-gray-500">Sign in to continue</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
