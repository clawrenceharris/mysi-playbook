import React, { useEffect } from "react";
import {
  DataReference,
  StateAccessor,
  DataTransformer,
} from "@/features/playground/domain/data-reference";
import type { StrategyState } from "@/types/playbook";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export interface SlideInfo {
  id: string;
  title: string;
  order: number;
}

export interface DataReferenceSelectorProps {
  value: DataReference | null;
  onChange: (reference: DataReference) => void;
  availableSlides: SlideInfo[];
  placeholder?: string;
  disabled?: boolean;
  previewState?: StrategyState;
}

const ACCESSOR_OPTIONS: { value: StateAccessor; label: string }[] = [
  { value: "responses", label: "Responses" },
  { value: "assignments", label: "Assignments" },
  { value: "assignmentResponses", label: "Assignment Responses" },
];

const TRANSFORMER_OPTIONS: { value: DataTransformer; label: string }[] = [
  { value: "all", label: "All" },
  { value: "currentUser", label: "Current User" },
  { value: "count", label: "Count" },
  { value: "excludeCurrentUser", label: "Exclude Current User" },
];

export function DataReferenceSelector({
  value,
  onChange,
  availableSlides,
  placeholder,
  disabled,
}: DataReferenceSelectorProps) {
  const sortedSlides = [...availableSlides].sort((a, b) => a.order - b.order);

  // Update onChange when any part changes
  useEffect(() => {
    if (value?.slideId && value?.accessor && value?.transformer) {
      onChange(value);
    }
  }, [onChange, value]);

  const handleSlideSelect = (slideId: string) => {
    // When slide changes, keep existing accessor/transformer or use defaults
    const newReference: DataReference = {
      slideId,
      accessor: value?.accessor || "responses",
      transformer: value?.transformer || "all",
    };
    onChange(newReference);
  };

  const handleAccessorSelect = (accessor: StateAccessor) => {
    if (!value?.slideId) return;

    const newReference: DataReference = {
      slideId: value.slideId,
      accessor,
      transformer: value.transformer || "all",
    };
    onChange(newReference);
  };

  const handleTransformerSelect = (transformer: DataTransformer) => {
    if (!value?.slideId || !value?.accessor) return;

    const newReference: DataReference = {
      slideId: value.slideId,
      accessor: value.accessor,
      transformer,
    };
    onChange(newReference);
  };
  console.log(value?.slideId);
  return (
    <div className="space-y-3">
      {/* Slide Selection */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Slide</Label>
        <Select
          value={value?.slideId || ""}
          onValueChange={handleSlideSelect}
          disabled={disabled}
        >
          <SelectTrigger>
            <SelectValue placeholder={placeholder || "Select slide"} />
          </SelectTrigger>
          <SelectContent>
            {sortedSlides.map((slide) => (
              <SelectItem key={slide.id} value={slide.id}>
                <div className="flex items-center">
                  <span>{slide.title}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Accessor Selection (only show if slide is selected) */}
      {value?.slideId && (
        <div className="space-y-2">
          <Label className="text-sm font-medium">Data Type</Label>
          <Select
            value={value.accessor || ""}
            onValueChange={handleAccessorSelect}
            disabled={disabled}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select data type" />
            </SelectTrigger>
            <SelectContent>
              {ACCESSOR_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Transformer Selection (only show if accessor is selected) */}
      {value?.slideId && value?.accessor && (
        <div className="space-y-2">
          <Label className="text-sm font-medium">Transform</Label>
          <Select
            value={value.transformer || ""}
            onValueChange={handleTransformerSelect}
            disabled={disabled}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select transform" />
            </SelectTrigger>
            <SelectContent>
              {TRANSFORMER_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}
