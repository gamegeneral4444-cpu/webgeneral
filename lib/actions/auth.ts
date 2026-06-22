"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { loginSchema } from "@/lib/validations";

export type LoginState = { error?: string };

export async function loginAction(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง" };
  }

  let supabase;
  try {
    supabase = await createClient();
  } catch {
    return { error: "ยังไม่ได้เชื่อมต่อ Supabase กรุณาตั้งค่า environment variables" };
  }

  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) {
    return { error: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" };
  }

  const redirectTo = (formData.get("redirect") as string) || "/admin";
  redirect(redirectTo);
}

export async function logoutAction() {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
  } catch {
    /* ignore */
  }
  redirect("/login");
}
