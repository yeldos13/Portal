// Checks RLS through the public API with the anon key only, using the seed accounts.
// Run against a freshly seeded database: npm run test:rls
import { test } from "node:test";
import assert from "node:assert/strict";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
assert.ok(url && anonKey, "Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY (see .env.example)");

const PASSWORD = "demo-portal-2026";
const ANNA = "11111111-1111-1111-1111-111111111111";
const BEN = "22222222-2222-2222-2222-222222222222";

async function signIn(email) {
  const client = createClient(url, anonKey, { auth: { persistSession: false } });
  const { error } = await client.auth.signInWithPassword({ email, password: PASSWORD });
  assert.ifError(error);
  return client;
}

const anna = await signIn("anna.client@example.com");
const ben = await signIn("ben.client@example.com");
const maria = await signIn("maria.manager@example.com");

test("client sees only own tickets", async () => {
  const { data, error } = await anna.from("tickets").select("owner_id");
  assert.ifError(error);
  assert.ok(data.length > 0);
  assert.ok(data.every((t) => t.owner_id === ANNA));
});

test("client cannot read another client's ticket by id", async () => {
  const { data: own } = await anna.from("tickets").select("id").limit(1).single();
  const { data, error } = await ben.from("tickets").select("id").eq("id", own.id);
  assert.ifError(error);
  assert.equal(data.length, 0);
});

test("client cannot change status, even on own ticket", async () => {
  const { data: before } = await anna.from("tickets").select("id, status").limit(1).single();
  const next = before.status === "done" ? "new" : "done";
  await anna.from("tickets").update({ status: next }).eq("id", before.id);
  const { data: after } = await anna.from("tickets").select("status").eq("id", before.id).single();
  assert.equal(after.status, before.status);
});

test("client cannot create a ticket for someone else", async () => {
  const { error } = await anna.from("tickets").insert({ title: "Spoofed", owner_id: BEN });
  assert.ok(error);
});

test("client cannot promote themselves to manager", async () => {
  const { error } = await anna.from("profiles").update({ role: "manager" }).eq("id", ANNA);
  assert.ok(error);
  const { data } = await anna.from("profiles").select("role").eq("id", ANNA).single();
  assert.equal(data.role, "client");
});

test("manager sees tickets of all clients", async () => {
  const { data, error } = await maria.from("tickets").select("owner_id");
  assert.ifError(error);
  const owners = new Set(data.map((t) => t.owner_id));
  assert.ok(owners.has(ANNA) && owners.has(BEN));
});

test("anonymous visitor reads nothing", async () => {
  const anon = createClient(url, anonKey, { auth: { persistSession: false } });
  const { data, error } = await anon.from("tickets").select("id");
  assert.ok(error || data.length === 0);
});
