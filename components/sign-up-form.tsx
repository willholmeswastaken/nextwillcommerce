"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { mergeCartOnLoginAction } from "@/app/(auth)/actions";
import { useCartOptional } from "@/components/cart-provider";

export function SignUpForm() {
  const router = useRouter();
  const cart = useCartOptional();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        const name = String(form.get("name") ?? "");
        const email = String(form.get("email") ?? "");
        const password = String(form.get("password") ?? "");
        startTransition(async () => {
          setError(null);
          const { error: signUpError } = await authClient.signUp.email({
            name,
            email,
            password,
          });
          if (signUpError) {
            setError(signUpError.message ?? "Unable to create account");
            return;
          }
          const mergeResult = await mergeCartOnLoginAction();
          if (mergeResult.success) {
            cart?.setCart(mergeResult.data);
          }
          router.push("/account/orders");
          router.refresh();
        });
      }}
    >
      <div>
        <label htmlFor="name" className="mb-2 block text-sm font-medium">
          Name
        </label>
        <Input id="name" name="name" required />
      </div>
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
        <Input
          id="password"
          name="password"
          type="password"
          minLength={8}
          required
        />
      </div>
      {error ? (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-danger">
          {error}
        </p>
      ) : null}
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Creating account…" : "Create account"}
      </Button>
      <p className="text-center text-sm text-muted">
        Already have an account?{" "}
        <Link href="/sign-in" className="text-accent underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
