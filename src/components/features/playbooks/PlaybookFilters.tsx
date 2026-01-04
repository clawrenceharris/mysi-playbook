"use client";
import React from "react";
import { FilterItem, Toggle } from "@/components/ui";
import { Book } from "lucide-react";
import { ValueOf } from "next/dist/shared/lib/constants";
import { StarIcon } from "@/components/icons";

interface PlaybookFiltersProps {
  onFilterChange: (filters: PlaybookFilterState) => void;
  filters: PlaybookFilterState;
  availableCourses?: string[];
}

export interface PlaybookFilterState {
  recent?: boolean;
  course?: string;
  favorite?: boolean;
}

export const PlaybookFilters = ({
  onFilterChange,
  filters,
  availableCourses = [],
}: PlaybookFiltersProps) => {
  const handleToggle = (
    key: keyof PlaybookFilterState,
    value: ValueOf<PlaybookFilterState>
  ) => {
    const newFilter = filters[key] === value ? "" : value;
    onFilterChange({ ...filters, [key]: newFilter });
  };
  return (
    <div className="flex flex-wrap gap-6">
      <Toggle
        className="text-muted-foreground shadow-none hover:bg-border transition-[background] duration-200"
        pressed={filters.favorite === true}
        onPressedChange={() => handleToggle("favorite", !filters.favorite)}
        size="lg"
        variant="outline"
      >
        <StarIcon />
        Favorites
      </Toggle>

      {availableCourses.length > 0 && (
        <FilterItem
          name="Courses"
          Icon={Book}
          options={availableCourses.map((c) => ({ label: c, value: c }))}
          onToggle={(value) => handleToggle("course", value)}
          value={filters.course}
        />
      )}
    </div>
  );
};
