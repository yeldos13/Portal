import { createClient } from "@/lib/supabase/server";
import { signOut } from "../login/actions";
import { createTicket, updateStatus } from "./actions";

// Per-user page: render on each request instead of prerendering.
export const instant = false;

const STATUS_LABEL = { new: "New", in_progress: "In progress", done: "Done" } as const;

export default async function TicketsPage({ searchParams }: PageProps<"/tickets">) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user!.id).single();
  const isManager = profile?.role === "manager";

  // RLS returns only own tickets for clients and all tickets for managers.
  const { data: tickets, error: loadError } = await supabase
    .from("tickets")
    .select("id, title, description, status, created_at, owner:profiles(email)")
    .order("created_at", { ascending: false });
  const { error } = await searchParams;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8">
      <header className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">{isManager ? "All tickets" : "My tickets"}</h1>
        <form action={signOut} className="flex items-center gap-3 text-sm">
          <span className="text-zinc-600">
            {user?.email}
            {isManager && " (manager)"}
          </span>
          <button className="rounded border border-zinc-300 px-3 py-1">Sign out</button>
        </form>
      </header>

      {error && <p role="alert" className="mt-4 text-sm text-red-600">{error}</p>}

      {!isManager && (
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
          <button className="self-start rounded bg-zinc-900 px-4 py-2 text-sm text-white">Submit</button>
        </form>
      )}

      {loadError && <p role="alert" className="mt-8 text-sm text-red-600">Could not load tickets.</p>}
      {tickets?.length === 0 && <p className="mt-8 text-sm text-zinc-600">No tickets yet.</p>}
      <ul className="mt-8 flex flex-col gap-3">
        {tickets?.map((t) => (
          <li key={t.id} className="rounded border border-zinc-200 p-4">
            <div className="flex items-start justify-between gap-4">
              <h3 className="font-medium">{t.title}</h3>
              {isManager ? (
                <form action={updateStatus} className="flex shrink-0 items-center gap-2">
                  <input type="hidden" name="id" value={t.id} />
                  <label className="sr-only" htmlFor={`status-${t.id}`}>Status</label>
                  <select id={`status-${t.id}`} name="status" defaultValue={t.status} className="rounded border border-zinc-300 px-2 py-1 text-sm">
                    {Object.entries(STATUS_LABEL).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                  <button className="rounded border border-zinc-300 px-2 py-1 text-sm">Save</button>
                </form>
              ) : (
                <span className="shrink-0 rounded bg-zinc-100 px-2 py-0.5 text-xs text-zinc-700">
                  {STATUS_LABEL[t.status as keyof typeof STATUS_LABEL]}
                </span>
              )}
            </div>
            {t.description && <p className="mt-1 text-sm text-zinc-600">{t.description}</p>}
            <p className="mt-2 text-xs text-zinc-500">
              {new Date(t.created_at).toLocaleDateString("en-GB")}
              {isManager && t.owner && ` · ${(t.owner as unknown as { email: string }).email}`}
            </p>
          </li>
        ))}
      </ul>
    </main>
  );
}
