"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// owner_id and status come from column defaults; RLS and column grants reject anything else.
export async function createTicket(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();

  const supabase = await createClient();
  const { error } = await supabase.from("tickets").insert({ title, description });
  if (error) redirect(`/tickets?error=${encodeURIComponent(error.message)}`);

  revalidatePath("/tickets");
  redirect("/tickets");
}

const STATUSES = ["new", "in_progress", "done"];

// Only managers pass the update policy; for anyone else RLS matches zero rows.
export async function updateStatus(formData: FormData) {
  const id = Number(formData.get("id"));
  const status = String(formData.get("status"));
  if (!Number.isInteger(id) || !STATUSES.includes(status)) redirect("/tickets?error=Invalid%20status");

  const supabase = await createClient();
  const { data, error } = await supabase.from("tickets").update({ status }).eq("id", id).select("id");
  if (error || data.length === 0) redirect(`/tickets?error=${encodeURIComponent(error?.message ?? "Not allowed")}`);

  revalidatePath("/tickets");
  redirect("/tickets");
}
