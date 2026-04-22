"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { checkPassword, createSession, setSessionCookie } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { z } from "zod";

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function loginAction(formData: FormData): Promise<void> {
  const parsed = LoginSchema.safeParse({
    email: String(formData.get("email") ?? "").toLowerCase().trim(),
    password: String(formData.get("password") ?? ""),
  });
  if (!parsed.success) redirect("/login?error=" + encodeURIComponent("Please provide a valid email and password."));
  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (!user) redirect("/login?error=" + encodeURIComponent("Incorrect email or password."));
  const ok = await checkPassword(parsed.data.password, user.passwordHash);
  if (!ok) redirect("/login?error=" + encodeURIComponent("Incorrect email or password."));
  const token = await createSession({
    userId: user.id,
    role: user.role,
    firmId: user.firmId,
    email: user.email,
    name: user.name,
  });
  await setSessionCookie(token);
  await audit({ actorUserId: user.id, kind: "AUTH", action: "RUN", reason: "login" });
  redirect("/app");
}
