"use client";

import * as React from "react";
import * as TogglePrimitive from "@radix-ui/react-toggle";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const toggleVariants = cva(
  "inline-flex items-center cursor-pointer justify-center gap-2 rounded-full text-sm font-medium transition-[color,box-shadow] outline-none whitespace-nowrap " +
    "hover:bg-muted hover:text-muted-foreground " +
    "disabled:pointer-events-none disabled:opacity-50 " +
    "data-[state=on]:border-primary-400" +
    "data-[state=on]:bg-primary-100 data-[state=on]:text-primary-400 " +
    "[&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0 " +
    "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] " +
    "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "bg-primary-foreground border-2 shadow-xs hover:bg-secondary-foreground",
        outline:
          "border border-2 bg-transparent shadow-xs hover:bg-secondary-foreground",
      },
      size: {
        default: "h-9 px-2 min-w-9",
        sm: "h-8 px-1.5 min-w-8",
        lg: "h-9 px-4 min-w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function Toggle({
  className,
  variant,
  size,
  ...props
}: React.ComponentProps<typeof TogglePrimitive.Root> &
  VariantProps<typeof toggleVariants>) {
  return (
    <TogglePrimitive.Root
      data-slot="toggle"
      className={cn(toggleVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Toggle, toggleVariants };
