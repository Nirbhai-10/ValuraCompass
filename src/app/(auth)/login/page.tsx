import Link from "next/link";
import { loginAction } from "./actions";
import { CompassLogo } from "@/components/logo";

export default function LoginPage({ searchParams }: { searchParams: { error?: string; message?: string } }) {
  const error = searchParams?.error;
  const message = searchParams?.message;
  return (
    <main className="min-h-screen grid place-items-center p-6">
      <div className="card w-full max-w-md">
        <div className="card-header flex items-center gap-3">
          <CompassLogo />
          <div className="border-l border-line-200 pl-3">
            <p className="text-sm font-semibold">Compass</p>
            <p className="text-xs text-ink-500">Sign in to your account</p>
          </div>
        </div>
        <form action={loginAction} className="card-body space-y-4">
          {message ? <div className="text-xs text-brand-deep bg-brand-mint/50 p-2 rounded-button">{message}</div> : null}
          {error ? <div className="text-xs text-severity-critical bg-red-50 p-2 rounded-button">{error}</div> : null}
          <div>
            <label className="label">Email</label>
            <input className="input" name="email" type="email" required autoComplete="email" />
          </div>
          <div>
            <label className="label">Password</label>
            <input className="input" name="password" type="password" required autoComplete="current-password" />
          </div>
          <button className="btn-primary w-full" type="submit">Sign in</button>
          <p className="text-xs text-ink-500 text-center">
            No account? <Link href="/signup" className="link">Create one</Link>
          </p>
          <p className="text-[11px] text-ink-500 text-center">
            Demo: advisor@valura.ai / demo1234 · client@valura.ai / demo1234
          </p>
        </form>
      </div>
    </main>
  );
}
