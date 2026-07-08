import { Suspense } from "react";
import { SignInForm } from "@/components/sign-in-form";

export default function SignInPage() {
  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-16 sm:px-6">
      <div className="rounded-[2rem] border border-border bg-card p-8 shadow-[0_18px_50px_-34px_rgba(20,17,15,0.4)]">
        <h1 className="text-2xl font-semibold tracking-tight">Sign in</h1>
        <p className="mt-2 text-sm text-muted">
          Optional accounts — guest checkout still works without signing in.
        </p>
        <div className="mt-6">
          <Suspense fallback={<div className="h-40 animate-pulse rounded-xl bg-border/50" />}>
            <SignInForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
