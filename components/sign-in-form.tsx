"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { mergeCartOnLoginAction } from "@/app/(auth)/actions";
import { useCartOptional } from "@/components/cart-provider";
import { safeRedirectPath } from "@/lib/safe-redirect";

export function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const cart = useCartOptional();
  const next = safeRedirectPath(searchParams.get("next"), "/account/orders");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        const email = String(form.get("email") ?? "");
        const password = String(form.get("password") ?? "");
        startTransition(async () => {
          setError(null);
          const { error: signInError } = await authClient.signIn.email({
            email,
            password,
          });
          if (signInError) {
            setError(signInError.message ?? "Unable to sign in");
            return;
          }
          const mergeResult = await mergeCartOnLoginAction();
          if (mergeResult.success) {
            cart?.setCart(mergeResult.data);
          } else {
            await cart?.refresh();
          }
          router.push(next);
          router.refresh();
        });
      }}
    >
      <div>
        <label htmlFor="email" className="mb-2 block text-sm font-medium">
          Email
        </label>
        <Input id="email" name="email" type="email" required />
      </div>
      <div>
        <label htmlFor="password" className="mb-2 block text-sm font-medium">
          Password
        </label>
        <Input id="password" name="password" type="password" required />
      </div>
      {error ? (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-danger">
          {error}
        </p>
      ) : null}
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Signing in…" : "Sign in"}
      </Button>
      <p className="text-center text-sm text-muted">
        No account?{" "}
        <Link href="/sign-up" className="text-accent underline">
          Create one
        </Link>
      </p>
    </form>
  );
}
