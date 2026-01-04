"use client";
import React from "react";
import { FilterItem } from "@/components/ui";
import { Book, Calendar, Clock } from "lucide-react";

interface SessionFiltersProps {
  onFilterChange: (filters: SessionFilterState) => void;
  filters: SessionFilterState;
  availableCourses?: string[];
}

export interface SessionFilterState {
  status?: string;
  course?: string;
  timeRange?: string;
}

const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "scheduled", label: "Scheduled" },
  { value: "completed", label: "Completed" },
  { value: "canceled", label: "Canceled" },
];

const TIME_RANGE_OPTIONS = [
  { value: "this-week", label: "This Week" },
  { value: "this-month", label: "This Month" },
];

export const SessionFilters = ({
  onFilterChange,
  filters,
  availableCourses = [],
}: SessionFiltersProps) => {
  const handleToggle = (key: keyof SessionFilterState, value: string) => {
    const newFilter = filters[key] === value ? "" : value;
    onFilterChange({ ...filters, [key]: newFilter });
  };
  return (
    <div className="flex flex-wrap gap-6">
      <FilterItem
        name="Status"
        Icon={Clock}
        options={STATUS_OPTIONS}
        onToggle={(value) => handleToggle("status", value)}
        value={
          STATUS_OPTIONS.find((opt) => opt.value === filters.status)?.value
        }
      />

      <FilterItem
        name="Time Range"
        Icon={Calendar}
        options={TIME_RANGE_OPTIONS}
        onToggle={(value) => handleToggle("timeRange", value)}
        value={
          TIME_RANGE_OPTIONS.find((opt) => opt.value === filters.timeRange)
            ?.value
        }
      />

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
