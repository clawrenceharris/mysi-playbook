import React from "react";
import {
  ContextMenuItem,
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
} from "@/components/ui";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { StrategySlide } from "@/features/playground/domain";
import { cn } from "@/lib/utils";
import { Plus, Copy, Trash2, GripVertical } from "lucide-react";
import {
  restrictToFirstScrollableAncestor,
  restrictToWindowEdges,
} from "@dnd-kit/modifiers";

export interface SlideSequenceSidebarProps {
  slides: StrategySlide[];
  currentSlideId: string;
  onSlideSelect: (slideId: string) => void;
  onSlideAdd: (afterSlideId?: string) => void;
  onSlideDelete: (slideId: string) => void;
  onSlideReorder: (slideId: string, newIndex: number) => void;
  onSlideDuplicate: (slideId: string) => void;
}

interface SortableSlideItemProps {
  slide: StrategySlide;
  isSelected: boolean;
  onSelect: (slideId: string) => void;
  onDuplicate: (slideId: string) => void;
  onDelete: (slideId: string) => void;
  onInsertBefore?: (slideId: string) => void;
  onInsertAfter?: (slideId: string) => void;
}

function SortableSlideItem({
  slide,
  isSelected,
  onSelect,
  onDuplicate,
  onDelete,
  onInsertBefore,
  onInsertAfter,
}: SortableSlideItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: slide.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onSelect(slide.id);
    }
  };

  const handleDuplicate = () => {
    onDuplicate(slide.id);
  };

  const handleDelete = () => {
    onDelete(slide.id);
  };

  const handleInsertBefore = () => {
    onInsertBefore?.(slide.id);
  };

  const handleInsertAfter = () => {
    onInsertAfter?.(slide.id);
  };

  return (
    <div
      onKeyDown={handleKeyDown}
      ref={setNodeRef}
      style={style}
      {...attributes}
    >
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <div
            data-testid={`slide-${slide.id}`}
            data-draggable="true"
            className={cn(
              "border rounded-md transition-colors  hover:ring-2 relative",
              isSelected
                ? "slide-selected ring-2 ring-primary-300"
                : "ring-gray-200",
              isDragging && "opacity-50"
            )}
            onClick={() => onSelect(slide.id)}
            role="button"
            tabIndex={0}
          >
            <div className="p-3 flex items-center gap-2">
              <div
                {...listeners}
                data-testid={`drag-handle-${slide.id}`}
                className="cursor-grab active:cursor-grabbing p-1 hover:bg-accent rounded"
              >
                <GripVertical className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="text-sm font-medium flex-1">{slide.title}</div>
            </div>
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent data-testid="slide-context-menu">
          {onInsertBefore && (
            <ContextMenuItem
              data-testid="insert-before-button"
              onClick={handleInsertBefore}
            >
              <Plus className="mr-2 h-4 w-4" />
              Insert Before
            </ContextMenuItem>
          )}
          {onInsertAfter && (
            <ContextMenuItem
              data-testid="insert-after-button"
              onClick={handleInsertAfter}
            >
              <Plus className="mr-2 h-4 w-4" />
              Insert After
            </ContextMenuItem>
          )}
          <ContextMenuItem
            data-testid="duplicate-slide-button"
            onClick={handleDuplicate}
          >
            <Copy className="mr-2 h-4 w-4" />
            Duplicate
          </ContextMenuItem>
          <ContextMenuItem
            data-testid="delete-slide-button"
            onClick={handleDelete}
            className="text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    </div>
  );
}

export function SlideSequenceSidebar({
  slides,
  currentSlideId,
  onSlideSelect,
  onSlideAdd,
  onSlideDelete,
  onSlideReorder,
  onSlideDuplicate,
}: SlideSequenceSidebarProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = slides.findIndex((slide) => slide.id === active.id);
      const newIndex = slides.findIndex((slide) => slide.id === over?.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        onSlideReorder(active.id as string, newIndex);
      }
    }
  };

  const slideIds = slides.map((slide) => slide.id);

  return (
    <div className="flex py-8 overflow-x-hidden overflow-y-auto  h-full flex-col gap-2 p-1">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToFirstScrollableAncestor, restrictToWindowEdges]}
      >
        <SortableContext
          items={slideIds}
          strategy={verticalListSortingStrategy}
        >
          {slides.map((slide) => (
            <div key={slide.id} className="mx-4">
              <SortableSlideItem
                slide={slide}
                isSelected={slide.id === currentSlideId}
                onSelect={onSlideSelect}
                onDuplicate={onSlideDuplicate}
                onDelete={onSlideDelete}
                onInsertBefore={(slideId) => onSlideAdd(slideId)}
                onInsertAfter={(slideId) => onSlideAdd(slideId)}
              />
            </div>
          ))}
        </SortableContext>
      </DndContext>
    </div>
  );
}
