import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva("btn", {
  variants: {
    variant: {
      default: "btn",
      primary: "btn-primary",
      destructive: "btn-destructive",
      tertiary: "btn-tertiary",
      outline: "btn-outline",
      secondary: "btn-secondary",
      ghost: "btn-ghost",
      muted: "btn-muted",

      link: "text-foreground bg-transparent",
    },
    size: {
      default: "h-9 px-4 py-2",
      sm: "h-8 rounded-full px-3 text-xs",
      lg: "h-10 rounded-full px-8",
      icon: "size-10 min-w-10 min-h-10 p-0 rounded-full",
    },
  },
  defaultVariants: {
    variant: "primary",
    size: "default",
  },
});

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
