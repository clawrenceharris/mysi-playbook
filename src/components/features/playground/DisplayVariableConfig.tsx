import React, { useCallback } from "react";
import { FormItem, Input, Label } from "@/components/ui";
import { DisplayVariableConfig as DisplayVariableConfigType } from "@/features/playground";
import { DataReferenceSelector, type SlideInfo } from "./DataReferenceSelector";
import { usePlayground } from "@/providers";
import { DataReference } from "@/features/playground/domain/data-reference";

export interface DisplayVariableConfigProps {
  config: DisplayVariableConfigType;
  onChange: (config: Partial<DisplayVariableConfigType>) => void;
}

export function DisplayVariableConfig({
  config,
  onChange,
}: DisplayVariableConfigProps) {
  const { slides } = usePlayground();

  const availableSlides: SlideInfo[] = slides.map((slide) => ({
    id: slide.id,
    title: slide.title,
    order: slide.order,
  }));

  const handleDataReferenceChange = useCallback(
    (reference: DataReference) => {
      onChange({ dataSource: reference });
    },
    [onChange]
  );

  return (
    <div className="space-y-4">
      <FormItem>
        <Label className="sr-only" htmlFor="title">
          Title
        </Label>
        <Input
          id="title"
          value={config.title}
          onChange={(e) => onChange({ title: e.target.value })}
          placeholder="Title (Optional)"
        />
      </FormItem>

      <DataReferenceSelector
        value={config.dataSource}
        onChange={handleDataReferenceChange}
        availableSlides={availableSlides}
        placeholder="Select data to display"
      />
    </div>
  );
}
