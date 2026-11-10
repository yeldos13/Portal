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
