import * as React from "react";

import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      spellCheck
      className={cn(
        "text-foreground focus-visible:border-ring  focus-visible:border-2 focus-visible:ring-ring/50 shadow-sm  placeholder:text-muted-foreground selection:bg-primary-500 border-2 border-transparent flex w-full min-w-0 rounded-full bg-input px-3 py-3 text-base transition-[color,box-shadow,border] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm autofill:border-ring autofill:bg-primary-200 autofill:text-foreground",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        className
      )}
      {...props}
    />
  );
}

export { Input };
