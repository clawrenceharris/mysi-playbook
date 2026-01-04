/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Button,
  Badge,
  Card,
  CardContent,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui";
import { StrategyBlock } from "@/features/playground/domain/playground.types";
import { Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import { ConfigurationPanel } from "./ConfigurationPanel";
import type { VariableMetadata } from "@/features/playground/domain/variable-extraction";

export interface InlineBlockEditorProps {
  block: StrategyBlock;
  onUpdate: (updates: Partial<StrategyBlock>) => void;
  onSelect: () => void;
  onDeselect: () => void;
  isEditing: boolean;
  onEditingChange: (editing: boolean) => void;
  availableVariables?: VariableMetadata[];
}

interface BlockFieldConfig {
  key: string;
  label: string;
  type: "text" | "textarea" | "select";
  options?: string[];
  editable: boolean;
}

const BLOCK_FIELD_CONFIGS: Record<string, BlockFieldConfig[]> = {
  "display-prompt": [
    { key: "title", label: "Title", type: "text", editable: true },
    { key: "content", label: "Content", type: "textarea", editable: true },
  ],
  "collect-input": [
    { key: "question", label: "Question", type: "text", editable: true },
    {
      key: "inputType",
      label: "Input Type",
      type: "select",
      options: ["text", "multipleChoice", "rating"],
      editable: false,
    },
  ],
  "poll-vote": [
    { key: "question", label: "Question", type: "text", editable: true },
  ],
  timer: [
    { key: "title", label: "Title", type: "text", editable: true },
    {
      key: "duration",
      label: "Duration (seconds)",
      type: "text",
      editable: false,
    },
  ],
  "assignment-display": [
    { key: "dataSource", label: "Data Source", type: "text", editable: true },
    {
      key: "distributionMode",
      label: "Distribution Mode",
      type: "select",
      options: ["one-per-participant", "round-robin", "random", "exclude-own"],
      editable: false,
    },
  ],
};

export function InlineBlockEditor({
  block,
  onUpdate,
  onSelect,
  onDeselect,
  isEditing,
  onEditingChange,
  availableVariables = [],
}: InlineBlockEditorProps) {
  const [editValues, setEditValues] = useState(block.config);
  const containerRef = useRef<HTMLDivElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);
  const [showConfigDialog, setShowConfigDialog] = useState(false);

  const fieldConfigs = BLOCK_FIELD_CONFIGS[block.type] || [];
  const editableFields = fieldConfigs.filter((field) => field.editable);
  const hasEditableFields = editableFields.length > 0;

  useEffect(() => {
    setEditValues(block.config);
  }, [block.config]);

  const handleSave = useCallback(() => {
    onUpdate({ config: editValues });
    onEditingChange(false);
  }, [editValues, onEditingChange, onUpdate]);
  useEffect(() => {
    if (isEditing && firstInputRef.current) {
      firstInputRef.current.focus();
    }
  }, [isEditing]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        if (isEditing) {
          handleSave();
          onDeselect();
        }
      }
    };

    if (isEditing) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [handleSave, isEditing, onDeselect]);

  const handleConfigClick = () => {
    if (hasEditableFields) {
      setShowConfigDialog(true);
    }
  };

  const formatDisplayValue = (field: BlockFieldConfig, value: any) => {
    if (field.type === "select" && field.options) {
      return field.options.find((option) => option === value) || value;
    }
    return value || "";
  };

  const getDisplayLabel = (field: BlockFieldConfig) => {
    if (field.key === "inputType") {
      const value = block.config[field.key];
      const labels: Record<string, string> = {
        text: "Text Input",
        multipleChoice: "Multiple Choice",
        rating: "Rating",
      };
      return labels[value] || value;
    }
    if (field.key === "distributionMode") {
      const value = block.config[field.key];
      const labels: Record<string, string> = {
        "one-per-participant": "One per participant",
        "round-robin": "Round robin",
        random: "Random",
        "exclude-own": "Exclude own",
      };
      return labels[value] || value;
    }
    return formatDisplayValue(field, block.config[field.key]);
  };

  return (
    <Card
      onClick={onSelect}
      ref={containerRef}
      data-testid={`inline-block-${block.id}`}
      className={cn(
        "rounded-lg space-y-9 bg-background hover:border-primary-200 transition-colors group",
        hasEditableFields && "cursor-pointer"
      )}
    >
      <Popover open={showConfigDialog} onOpenChange={setShowConfigDialog}>
        <CardContent className="flex p-4  items-start justify-between">
          <div className="flex-1 min-w-0">
            {/* Block Type Badge */}
            <div className="flex items-center justify-between gap-2 mb-2">
              <Badge variant="outline" className="text-xs">
                {block.type}
              </Badge>
              {hasEditableFields && (
                <PopoverTrigger asChild>
                  <Button
                    data-testid="configure-button"
                    variant="muted"
                    size="icon"
                    onClick={handleConfigClick}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
              )}
            </div>

            {/* Block Content */}
            <div className="space-y-1">
              {fieldConfigs.map((field) => {
                const value = block.config[field.key];
                if (!value) return null;

                return (
                  <div key={field.key}>
                    {field.key === "title" || field.key === "question" ? (
                      <div className="font-medium text-sm">{value}</div>
                    ) : field.key === "content" ? (
                      <div className="text-sm text-muted-foreground">
                        {value}
                      </div>
                    ) : (
                      <div className="text-xs text-muted-foreground">
                        {field.label}: {getDisplayLabel(field)}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>

        <PopoverContent>
          <ConfigurationPanel
            block={block}
            onClose={() => setShowConfigDialog(false)}
            onBlockUpdate={(id, updates) => {
              onUpdate(updates);
            }}
            availableVariables={availableVariables}
          />
        </PopoverContent>
      </Popover>
    </Card>
  );
}
