"use client";

import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { useFormStatus } from "react-dom";
import { AlertCircle, LogIn, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginAction, type LoginState } from "@/lib/actions/auth";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full gap-2" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="size-4 animate-spin" aria-hidden /> กำลังเข้าสู่ระบบ...
        </>
      ) : (
        <>
          <LogIn className="size-4" aria-hidden /> เข้าสู่ระบบ
        </>
      )}
    </Button>
  );
}

export function LoginForm() {
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/admin";
  const [state, formAction] = useActionState<LoginState, FormData>(loginAction, {});

  return (
    <form action={formAction} className="mt-6 space-y-4">
      <input type="hidden" name="redirect" value={redirect} />

      {state.error && (
        <div
          role="alert"
          className="flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          <AlertCircle className="size-4 shrink-0" aria-hidden /> {state.error}
        </div>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="email">อีเมล</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required placeholder="admin@example.ac.th" />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="password">รหัสผ่าน</Label>
        <Input id="password" name="password" type="password" autoComplete="current-password" required placeholder="••••••••" />
      </div>

      <SubmitButton />
    </form>
  );
}
