import React from "react";
import { Combobox } from "@/components/ui";
import { VariableMetadata } from "@/features/playground";
import { Check, Hash, Star, Text } from "lucide-react";

export interface VariableReferenceFieldProps {
  onChange: (value: string) => void;
  availableVariables?: VariableMetadata[];
  placeholder?: string;
  value?: string;
}

export function VariableReferenceField({
  availableVariables = [],
  onChange,
  value = "",
}: VariableReferenceFieldProps) {
  const variableMetadata: VariableMetadata[] = availableVariables;

  const getTypeIcon = (type: string): React.ReactNode => {
    switch (type) {
      case "text":
        return <Text />;
      case "number":
        return <Hash />;
      case "multiple_choice":
        return <Check />;
      case "rating":
        return <Star />;
      default:
        return null;
    }
  };

  return (
    <div className="relative">
      <div className="flex items-center justify-between">
        {variableMetadata.length > 0 && (
          <Combobox
            defaultValue={value}
            items={variableMetadata.map((variable) => ({
              label: variable.name,
              value: variable.name,
              icon: getTypeIcon(variable.type),
            }))}
            onSelect={(value) => onChange(value)}
            placeholder="Add variable..."
          />
        )}
      </div>
    </div>
  );
}
