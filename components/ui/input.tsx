import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      // text-base (16px) avoids iOS Safari zoom-on-focus for inputs under 16px
      "flex h-11 w-full rounded-xl border border-border bg-card px-4 text-base outline-none transition focus:border-accent focus:ring-2 focus:ring-ring/30",
      className,
    )}
    {...props}
  />
));
Input.displayName = "Input";
