"use client";

import { useActionState } from "react";
import { checkoutAction } from "@/app/(shop)/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatMoney } from "@/lib/utils";
import type { ActionResult } from "@/app/server/lib/errors";
import type { CheckoutResult } from "@/app/server/features/checkout/checkout.service";

type State = ActionResult<CheckoutResult> | null;

async function submitCheckout(
  _prev: State,
  formData: FormData,
): Promise<State> {
  const email = String(formData.get("email") ?? "");
  return checkoutAction({ email });
}

export function CheckoutForm({
  subtotalCents,
  defaultEmail,
  usingStripe,
}: {
  subtotalCents: number;
  defaultEmail?: string;
  usingStripe: boolean;
}) {
  const [state, formAction, pending] = useActionState(submitCheckout, null);

  return (
    <form action={formAction} className="space-y-5">
      <div>
        <label htmlFor="email" className="mb-2 block text-sm font-medium">
          Email for receipt
        </label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          defaultValue={defaultEmail}
          placeholder="you@example.com"
        />
      </div>

      <div className="rounded-2xl border border-border bg-background/70 p-4 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-muted">Total due</span>
          <span className="text-lg font-semibold">
            {formatMoney(subtotalCents)}
          </span>
        </div>
        <p className="mt-2 text-xs text-muted">
          {usingStripe
            ? "You will be redirected to Stripe Checkout."
            : "Mock checkout is active (no STRIPE_SECRET_KEY). Order will be marked paid immediately."}
        </p>
      </div>

      {state && !state.success ? (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-danger">
          {state.error.message}
        </p>
      ) : null}

      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending
          ? "Processing…"
          : usingStripe
            ? "Pay with Stripe"
            : "Complete mock checkout"}
      </Button>
    </form>
  );
}
