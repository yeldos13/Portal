import Link from "next/link";

const ACCOUNTS = [
  { email: "anna.client@example.com", role: "Client" },
  { email: "ben.client@example.com", role: "Client" },
  { email: "maria.manager@example.com", role: "Manager" },
];

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center gap-8 px-4 py-12">
      <div className="flex flex-col gap-3">
        <h1 className="text-3xl font-semibold">Client Portal</h1>
        <p className="text-zinc-700">
          Clients submit support tickets and see only their own. Managers see every ticket and update its status.
          Access is enforced in the database with Supabase row level security.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <h2 className="font-medium">Demo accounts</h2>
        <p className="text-sm text-zinc-700">
          Password for all: <code className="rounded bg-zinc-100 px-1.5 py-0.5">demo-portal-2026</code>
        </p>
        <ul className="flex flex-col divide-y divide-zinc-200 rounded border border-zinc-200 text-sm">
          {ACCOUNTS.map((a) => (
            <li key={a.email} className="flex flex-wrap justify-between gap-2 px-4 py-2">
              <span className="break-all">{a.email}</span>
              <span className="text-zinc-600">{a.role}</span>
            </li>
          ))}
        </ul>
      </div>

      <Link href="/login" className="self-start rounded bg-zinc-900 px-5 py-2.5 text-sm text-white">
        Sign in or create an account
      </Link>

      <p className="text-xs text-zinc-600">Built with Next.js, TypeScript, Tailwind CSS and Supabase.</p>
    </main>
  );
}
