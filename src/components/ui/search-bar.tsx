import React from "react";
import { Input } from "./input";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  className?: string;
  containerClassName?: string;
  value?: string;
  onChange?: (value: string) => void;
  onClear?: () => void;
  placeholder?: string;
}
export const SearchBar = ({
  className,
  containerClassName,
  value,
  placeholder,
  onChange,
  onClear,
}: SearchBarProps) => {
  return (
    <div className={cn("relative w-full max-w-2xl", containerClassName)}>
      <Input
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className={cn(className)}
        type="text"
        placeholder={placeholder || "Search..."}
      />
      <Search className="absolute text-muted-foreground right-10 top-1/2 -translate-y-1/2" />
      {value ? (
        <button
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onClear?.();
          }}
          aria-label="Clear search"
        >
          <X />
        </button>
      ) : (
        <span className="sr-only">Search</span>
      )}
    </div>
  );
};
