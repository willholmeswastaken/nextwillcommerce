"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";

export function SignOutButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <Button
      variant="secondary"
      disabled={pending}
      onClick={() => {
        startTransition(async () => {
          await authClient.signOut();
          router.push("/");
          router.refresh();
        });
      }}
    >
      {pending ? "Signing out…" : "Sign out"}
    </Button>
  );
}
