import { CheckIcon, ChevronsUpDownIcon } from "lucide-react";
import {
  Button,
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./";
import { cn } from "@/lib/utils";
import React, { useState } from "react";

interface ComboxProps {
  items: { value: string; label: string; icon?: React.ReactNode }[];
  placeholder?: string;
  defaultValue?: string;
  onSelect: (value: string) => void;
}

export function Combobox({
  items,
  onSelect,
  defaultValue: value,
  placeholder,
}: ComboxProps) {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className="w-[200px] justify-between"
        >
          {(value &&
            items.find((framework) => framework.value === value)?.label) ||
            placeholder}
          <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder={placeholder} />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              {items.map((item) => (
                <CommandItem
                  key={item.value}
                  value={item.value}
                  className="justify-between"
                  onSelect={(currentValue) => {
                    onSelect(currentValue);
                    setOpen(false);
                  }}
                >
                  <div className="center-all gap-2">
                    {item.icon}

                    {item.label}
                  </div>
                  <CheckIcon
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === item.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
