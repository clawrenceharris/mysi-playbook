import React from "react";
import { Loader2 } from "lucide-react";

export function LoadingState({
  variant = "page",
  size = 50,
}: {
  variant?: "container" | "page";
  size?: number;
}) {
  if (variant === "page") {
    return (
      <div className="h-screen w-screen text-primary-300 flex items-center justify-center">
        <Loader2 size={size} className="animate-spin" />
      </div>
    );
  }
  return (
    <div className="h-full w-full items-center flex justify-center relative">
      <div className="absolute text-primary-300">
        <Loader2 size={size} className="animate-spin" />
      </div>
    </div>
  );
}
