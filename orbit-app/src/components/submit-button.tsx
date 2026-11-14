"use client";

import { useFormStatus } from "react-dom";
import { clsx } from "clsx";
import { buttonClass } from "./ui";

// Submit button that shows a pending label and blocks double-clicks while the
// server action runs.
export function SubmitButton({
  children,
  pendingLabel = "Saving…",
  className,
  disabled,
}: {
  children: React.ReactNode;
  pendingLabel?: string;
  className?: string;
  disabled?: boolean;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending || disabled}
      aria-busy={pending}
      className={clsx(buttonClass("primary"), "w-full disabled:opacity-70", className)}
    >
      {pending ? pendingLabel : children}
    </button>
  );
}
