"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function credentials(formData: FormData) {
  return {
    email: String(formData.get("email") ?? "").trim(),
    password: String(formData.get("password") ?? ""),
  };
}

function back(key: "error" | "message", text: string): never {
  redirect(`/login?${key}=${encodeURIComponent(text)}`);
}

export async function signIn(formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(credentials(formData));
  if (error) back("error", error.message);
  redirect("/tickets");
}

export async function signUp(formData: FormData) {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp(credentials(formData));
  if (error) back("error", error.message);
  // With email confirmation on, Supabase returns no session until the link is clicked.
  if (!data.session) back("message", "Check your email to confirm the account.");
  redirect("/tickets");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
