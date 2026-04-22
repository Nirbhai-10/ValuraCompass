"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createSession, hashPassword, setSessionCookie } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { z } from "zod";

const SignupSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["CLIENT", "ADVISOR"]),
  firmName: z.string().optional(),
});

export async function signupAction(formData: FormData): Promise<void> {
  const parsed = SignupSchema.safeParse({
    name: String(formData.get("name") ?? "").trim(),
    email: String(formData.get("email") ?? "").toLowerCase().trim(),
    password: String(formData.get("password") ?? ""),
    role: String(formData.get("role") ?? "CLIENT"),
    firmName: String(formData.get("firmName") ?? "").trim() || undefined,
  });
  if (!parsed.success) redirect("/signup?error=" + encodeURIComponent("Please check the fields."));

  const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (existing) redirect("/signup?error=" + encodeURIComponent("An account with that email already exists."));

  let firmId: string | null = null;
  if (parsed.data.role === "ADVISOR") {
    const firm = await prisma.firm.create({
      data: { name: parsed.data.firmName || `${parsed.data.name}'s Practice` },
    });
    firmId = firm.id;
  }

  const user = await prisma.user.create({
    data: {
      email: parsed.data.email,
      passwordHash: await hashPassword(parsed.data.password),
      name: parsed.data.name,
      role: parsed.data.role,
      firmId,
    },
  });

  const token = await createSession({
    userId: user.id,
    role: user.role,
    firmId: user.firmId,
    email: user.email,
    name: user.name,
  });
  await setSessionCookie(token);
  await audit({ actorUserId: user.id, kind: "AUTH", action: "CREATE", reason: "signup" });

  redirect("/app/onboarding");
}
