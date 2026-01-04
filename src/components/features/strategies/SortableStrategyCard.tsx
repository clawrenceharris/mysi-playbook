import { useSortable } from "@dnd-kit/sortable";
import React from "react";
import { CSS } from "@dnd-kit/utilities";

import { cn } from "@/lib/utils";
import { PlaybookStrategies } from "@/types/tables";
import { StrategyCard } from "./";

interface SortableStrategyCardProps {
  strategy: PlaybookStrategies;
  onEnhanceClick: () => Promise<void>;
  onReplaceClick: () => void;
  onSaveClick?: () => void;
  isSaved?: boolean;
}

export function SortableStrategyCard({
  strategy,
  onReplaceClick,
  onEnhanceClick,
  onSaveClick,
  isSaved = false,
}: SortableStrategyCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    index,
    isDragging,
  } = useSortable({ id: strategy.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <StrategyCard
      style={style}
      phase={index === 0 ? "warmup" : index === 1 ? "workout" : "closer"}
      strategy={strategy}
      onReplaceClick={onReplaceClick}
      onEnhanceClick={onEnhanceClick}
      onSaveClick={onSaveClick}
      isSaved={isSaved}
      ref={setNodeRef}
      className={cn(isDragging ? "ring-2 ring-primary-500" : "")}
    >
      <button
        ref={setActivatorNodeRef}
        {...attributes}
        {...listeners}
        aria-label="Drag to reorder"
        className="absolute z-9 -top-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full
                     bg-white text-foreground shadow border border-border
                     cursor-grab active:cursor-grabbing touch-none"
      />
    </StrategyCard>
  );
}
