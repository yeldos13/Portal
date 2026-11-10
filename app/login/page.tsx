import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signIn, signUp } from "./actions";

// Per-user page: render on each request instead of prerendering.
export const instant = false;

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect("/tickets");

  const { error, message } = await searchParams;

  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-6 px-4 py-12">
      <h1 className="text-2xl font-semibold">Client Portal</h1>
      <form className="flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm">
          Email
          <input name="email" type="email" required autoComplete="email" className="rounded border border-zinc-300 px-3 py-2" />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Password
          <input name="password" type="password" required minLength={6} autoComplete="current-password" className="rounded border border-zinc-300 px-3 py-2" />
        </label>
        {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
        {message && <p role="status" className="text-sm text-green-700">{message}</p>}
        <div className="flex gap-2">
          <button formAction={signIn} className="flex-1 rounded bg-zinc-900 px-3 py-2 text-white">Sign in</button>
          <button formAction={signUp} className="flex-1 rounded border border-zinc-300 px-3 py-2">Create account</button>
        </div>
      </form>
    </main>
  );
}
