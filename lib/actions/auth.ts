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

  redirect(safeRedirect(formData.get("redirect")));
}

/**
 * อนุญาตเฉพาะ path ภายในเว็บไซต์ — กัน open redirect ออกไปเว็บภายนอก
 * (next/navigation redirect() ยอมรับ absolute URL และ redirect ออกนอกได้)
 */
function safeRedirect(value: FormDataEntryValue | null): string {
  if (typeof value !== "string") return "/admin";
  // ต้องขึ้นต้นด้วย "/" เดี่ยว และไม่ใช่ "//" (protocol-relative) หรือมี "\" หลอกตา
  if (!value.startsWith("/") || value.startsWith("//") || value.includes("\\")) {
    return "/admin";
  }
  return value;
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
