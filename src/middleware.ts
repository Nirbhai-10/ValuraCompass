import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

export const config = {
  matcher: ["/app/:path*"],
};

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("compass_session")?.value;
  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  try {
    const secret = new TextEncoder().encode(process.env.AUTH_SECRET ?? "");
    await jwtVerify(token, secret);
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/login", req.url));
  }
}
