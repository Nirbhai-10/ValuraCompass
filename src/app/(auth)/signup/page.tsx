import Link from "next/link";
import { signupAction } from "./actions";
import { CompassLogo } from "@/components/logo";

export default function SignupPage({ searchParams }: { searchParams: { error?: string } }) {
  const error = searchParams?.error;
  return (
    <main className="min-h-screen grid place-items-center p-6">
      <div className="card w-full max-w-md">
        <div className="card-header flex items-center gap-3">
          <CompassLogo />
          <div>
            <p className="text-sm font-semibold">Create your account</p>
            <p className="text-xs text-ink-500">Sign up as an advisor or a self-serve client</p>
          </div>
        </div>
        <form action={signupAction} className="card-body space-y-4">
          {error ? <div className="text-xs text-severity-critical bg-red-50 p-2 rounded-button">{error}</div> : null}
          <div>
            <label className="label">Full name</label>
            <input className="input" name="name" required />
          </div>
          <div>
            <label className="label">Email</label>
            <input className="input" name="email" type="email" required />
          </div>
          <div>
            <label className="label">Password</label>
            <input className="input" name="password" type="password" required minLength={6} />
          </div>
          <div>
            <label className="label">I&apos;m signing up as</label>
            <div className="grid grid-cols-2 gap-2">
              <label className="card p-3 flex gap-2 items-center cursor-pointer has-[:checked]:border-brand-deep">
                <input type="radio" name="role" value="CLIENT" defaultChecked />
                <div>
                  <div className="text-sm font-medium">Self-serve client</div>
                  <div className="text-xs text-ink-500">Plan for my household</div>
                </div>
              </label>
              <label className="card p-3 flex gap-2 items-center cursor-pointer has-[:checked]:border-brand-deep">
                <input type="radio" name="role" value="ADVISOR" />
                <div>
                  <div className="text-sm font-medium">Advisor</div>
                  <div className="text-xs text-ink-500">Plan for households</div>
                </div>
              </label>
            </div>
          </div>
          <div>
            <label className="label">Firm name (advisors only)</label>
            <input className="input" name="firmName" placeholder="Optional for clients" />
          </div>
          <button className="btn-primary w-full" type="submit">Create account</button>
          <p className="text-xs text-ink-500 text-center">
            Already have one? <Link href="/login" className="link">Sign in</Link>
          </p>
        </form>
      </div>
    </main>
  );
}
