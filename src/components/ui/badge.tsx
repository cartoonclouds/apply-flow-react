import { cn } from "@/lib/utils";
import React from "react";

type BadgeProps = React.HTMLAttributes<HTMLSpanElement>;

function Badge({ className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold whitespace-nowrap",
        className,
      )}
      {...props}
    />
  );
}

export default Badge;
