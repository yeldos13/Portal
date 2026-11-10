import { createClient } from "@/lib/supabase/server";
import { signOut } from "../login/actions";
import { createTicket } from "./actions";

// Per-user page: render on each request instead of prerendering.
export const instant = false;

const STATUS_LABEL = { new: "New", in_progress: "In progress", done: "Done" } as const;

export default async function TicketsPage({ searchParams }: PageProps<"/tickets">) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: tickets, error: loadError } = await supabase
    .from("tickets")
    .select("id, title, description, status, created_at")
    .order("created_at", { ascending: false });
  const { error } = await searchParams;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8">
      <header className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Tickets</h1>
        <form action={signOut} className="flex items-center gap-3 text-sm">
          <span className="text-zinc-600">{user?.email}</span>
          <button className="rounded border border-zinc-300 px-3 py-1">Sign out</button>
        </form>
      </header>

      <form action={createTicket} className="mt-8 flex flex-col gap-3 rounded border border-zinc-200 p-4">
        <h2 className="font-medium">New ticket</h2>
        <label className="flex flex-col gap-1 text-sm">
          Title
          <input name="title" required minLength={3} maxLength={120} className="rounded border border-zinc-300 px-3 py-2" />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Description
          <textarea name="description" rows={3} maxLength={2000} className="rounded border border-zinc-300 px-3 py-2" />
        </label>
        {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
        <button className="self-start rounded bg-zinc-900 px-4 py-2 text-sm text-white">Submit</button>
      </form>

      {loadError && <p role="alert" className="mt-8 text-sm text-red-600">Could not load tickets.</p>}
      {tickets?.length === 0 && <p className="mt-8 text-sm text-zinc-600">No tickets yet.</p>}
      <ul className="mt-8 flex flex-col gap-3">
        {tickets?.map((t) => (
          <li key={t.id} className="rounded border border-zinc-200 p-4">
            <div className="flex items-start justify-between gap-4">
              <h3 className="font-medium">{t.title}</h3>
              <span className="shrink-0 rounded bg-zinc-100 px-2 py-0.5 text-xs text-zinc-700">
                {STATUS_LABEL[t.status as keyof typeof STATUS_LABEL]}
              </span>
            </div>
            {t.description && <p className="mt-1 text-sm text-zinc-600">{t.description}</p>}
            <p className="mt-2 text-xs text-zinc-500">{new Date(t.created_at).toLocaleDateString("en-GB")}</p>
          </li>
        ))}
      </ul>
    </main>
  );
}
