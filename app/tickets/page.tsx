import { createClient } from "@/lib/supabase/server";
import { signOut } from "../login/actions";

// Per-user page: render on each request instead of prerendering.
export const instant = false;

export default async function TicketsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8">
      <header className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Tickets</h1>
        <form action={signOut} className="flex items-center gap-3 text-sm">
          <span className="text-zinc-600">{user?.email}</span>
          <button className="rounded border border-zinc-300 px-3 py-1">Sign out</button>
        </form>
      </header>
    </main>
  );
}
