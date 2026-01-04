import React, { useState } from "react";
import { Button } from "@/components/ui";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { StrategyBlock } from "@/features/playground/domain/playground.types";
import { InlineBlockEditor } from "./InlineBlockEditor";
import { GripVertical, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { VariableMetadata } from "@/features/playground/domain/variable-extraction";

export interface DraggableBlockItemProps {
  block: StrategyBlock;
  onUpdate: (updates: Partial<StrategyBlock>) => void;
  onDelete: () => void;
  onSelect: () => void;
  onDeselect: () => void;
  availableVariables?: VariableMetadata[];
}

export function DraggableBlockItem({
  block,
  onUpdate,
  onDelete,
  onSelect,
  onDeselect,
  availableVariables = [],
}: DraggableBlockItemProps) {
  const [isEditing, setIsEditing] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <div
        data-testid={`block-${block.id}`}
        data-draggable="true"
        className={cn("mb-2 group relative", isDragging && "opacity-50")}
      >
        {/* Drag Handle - positioned absolutely */}
        <div
          {...listeners}
          data-testid={`drag-handle-${block.id}`}
          className="absolute left-2 top-1/2 transform -translate-y-1/2 z-10 cursor-grab active:cursor-grabbing p-1 hover:bg-accent rounded opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </div>

        {/* Delete Button - positioned absolutely */}
        <div className="absolute right-2 top-1/2 -translate-y-1/2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="muted"
            size="icon"
            onClick={onDelete}
            className="h-8 w-8 p-0 text-destructive hover:bg-destructive-100"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        {/* Block Content with padding for handles */}
        <div className="pl-10 pr-12">
          <InlineBlockEditor
            block={block}
            onUpdate={onUpdate}
            onSelect={onSelect}
            onDeselect={onDeselect}
            isEditing={isEditing}
            onEditingChange={setIsEditing}
            availableVariables={availableVariables}
          />
        </div>
      </div>
    </div>
  );
}
