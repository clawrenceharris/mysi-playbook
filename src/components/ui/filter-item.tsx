import React, { useMemo } from "react";
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Toggle,
} from "./";
import { ValueOf } from "next/dist/shared/lib/constants";
import { X } from "lucide-react";

interface FilterItemProps {
  options: { value: string; label: string }[];
  onToggle?: (value: string) => void;
  value?: ValueOf<{ label: string; value: string }>;
  Icon: React.ComponentType<{ className?: string }>;
  name: string;
}

export const FilterItem = ({
  options,
  onToggle,
  value,
  Icon,
  name,
}: FilterItemProps) => {
  console.log({ value });
  const selectedValueLabel = useMemo(() => {
    return options.find((opt) => opt.value === value)?.label || "";
  }, [options, value]);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="text-muted-foreground" asChild>
        <Button variant="outline">
          <Icon className="size-4 " />

          <span className="text-sm font-medium">{name}</span>
          {selectedValueLabel && (
            <span className="text-primary-400">{selectedValueLabel}</span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        side="bottom"
        className="border-none bg-transparent pb-8 shadow-none"
      >
        {options.map((option) => (
          <DropdownMenuItem
            className="hover:bg-transparent!"
            key={option.value}
          >
            <Toggle
              className="shadow-lg hover:text-primary-400"
              pressed={value === option.value}
              onPressedChange={() => onToggle?.(option.value)}
              size="lg"
            >
              {option.label}
              {value === option.value && (
                <X className="text-muted-foreground" />
              )}
            </Toggle>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
