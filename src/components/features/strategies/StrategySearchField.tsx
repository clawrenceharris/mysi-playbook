"use client";

import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  InputHTMLAttributes,
} from "react";
import { X, AlertCircle, Loader2 } from "lucide-react";
import { Button, Input } from "@/components/ui";
import { cn } from "@/lib/utils";
import { Strategies } from "@/types/tables";
import { useStrategySearch } from "@/features/strategies/hooks";

export interface StrategySearchFieldProps
  extends InputHTMLAttributes<HTMLInputElement> {
  onStrategySelect: (strategy: Strategies | null) => void;
  selectedStrategy: Strategies | null;
}

export const StrategySearchField = ({
  onStrategySelect,
  selectedStrategy,
  ...props
}: StrategySearchFieldProps) => {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const {
    results,
    isLoading,
    error,
    hasSearched,
    search,
    clearResults,
    retry,
  } = useStrategySearch();

  // Handle input changes and trigger search
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setQuery(value);
      search(value);
      setIsOpen(true);
    },
    [search]
  );

  // Handle media selection
  const handleMediaSelect = useCallback(
    (result: Strategies) => {
      onStrategySelect(result);
      setQuery(result.title);
      setIsOpen(false);
    },
    [onStrategySelect]
  );
  useEffect(() => {
    if (selectedStrategy && !query) {
      setQuery(selectedStrategy.title);
    }
  }, [selectedStrategy, query]);

  const handleClear = useCallback(() => {
    onStrategySelect(null);
    setQuery("");
    clearResults();
    setIsOpen(false);
    inputRef.current?.focus();
  }, [onStrategySelect, clearResults]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const showDropdown =
    isOpen &&
    (results.length > 0 ||
      isLoading ||
      error ||
      (hasSearched && query.length >= 3));

  return (
    <div className="relative w-full">
      <Input
        ref={inputRef}
        type="text"
        value={query}
        placeholder="Search SI strategies"
        onChange={handleInputChange}
        onFocus={() => {
          if (results.length > 0 || error) {
            setIsOpen(true);
          }
        }}
        className={cn(
          selectedStrategy?.id && "border-primary-300 bg-primary-50"
        )}
        aria-expanded={showDropdown ? "true" : "false"}
        aria-haspopup="listbox"
        aria-autocomplete="list"
        role="combobox"
        {...props}
      />

      {/* Clear Input */}
      {(query || selectedStrategy) && !props.disabled && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleClear}
          className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0 hover:bg-muted"
          aria-label="Clear selection"
        >
          <X className="h-3 w-3" />
        </Button>
      )}

      {/* Results Dropdown */}
      {showDropdown && (
        <div ref={dropdownRef} className="media-search-dropdown" role="listbox">
          {isLoading && (
            <div className="flex items-center justify-center p-4 text-sm text-muted-foreground">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            </div>
          )}

          {error && (
            <div className="p-4">
              <div className="flex items-center gap-2 text-sm text-destructive mb-2">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={retry}
                className="w-full"
              >
                Try Again
              </Button>
            </div>
          )}

          {!isLoading &&
            !error &&
            hasSearched &&
            results.length === 0 &&
            query.length >= 3 && (
              <div className="p-4 text-center text-sm text-muted-foreground">
                No strategy found for &quot;{query}&quot;
              </div>
            )}

          {!isLoading && !error && results.length > 0 && (
            <div className="py-1">
              {results.map((result) => (
                <div
                  key={result.id}
                  className="flex-1 cursor-pointer p-4 relative rounded-md border bg-primary-foreground hover:bg-muted"
                  onClick={() => handleMediaSelect(result)}
                >
                  <span>{result.title}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
