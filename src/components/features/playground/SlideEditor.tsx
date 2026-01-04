import React, { useMemo } from "react";
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
import { StrategySlide, StrategyBlock, BlockType } from "@/features/playground";
import { BlockInsertionPoint, DraggableBlockItem } from "./";

export interface SlideEditorProps {
  slide: StrategySlide;
  allSlides?: StrategySlide[];
  onSlideUpdate?: (id: string, updates: Partial<StrategySlide>) => void;
  onBlockAdd?: (blockType: BlockType, position?: number) => void;
  onBlockUpdate?: (blockId: string, updates: Partial<StrategyBlock>) => void;
  onBlockDelete?: (blockId: string) => void;
  onBlockReorder?: (blockId: string, newPosition: number) => void;
  onBlockSelect?: (blockId: string | null) => void;
}

function EmptySlideState() {
  return (
    <div className="text-center py-8 text-muted-foreground">
      <div className="text-lg font-medium">This slide is empty</div>
      <div className="text-sm">Add your first block to get started</div>
    </div>
  );
}

export function SlideEditor({
  slide,
  allSlides = [],
  onSlideUpdate,
  onBlockAdd,
  onBlockUpdate,
  onBlockDelete,
  onBlockReorder,
  onBlockSelect,
}: SlideEditorProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Extract available variables from previous slides
  const availableVariables = useMemo(() => {
    if (allSlides.length === 0) return [];

    const currentSlideIndex = allSlides.findIndex((s) => s.id === slide.id);
    if (currentSlideIndex === -1) return [];

    // Only get variables from slides before the current one
    const previousSlides = allSlides.slice(0, currentSlideIndex + 1);
    return [];
    // Return the variables as-is (they're already in VariableMetadata format)
  }, [allSlides, slide.id]);

  const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onSlideUpdate?.(slide.id, { title: event.target.value });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = slide.blocks.findIndex(
        (block) => block.id === active.id
      );
      const newIndex = slide.blocks.findIndex((block) => block.id === over?.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        onBlockReorder?.(active.id as string, newIndex);
      }
    }
  };

  const sortedBlocks = slide.blocks.sort((a, b) => a.order - b.order);
  const blockIds = sortedBlocks.map((block) => block.id);

  return (
    <div className="flex flex-col h-full">
      {/* Slide Header */}
      <div className="border-b py-2 px-4">
        <h2
          className="p-3 rounded-lg"
          contentEditable
          suppressContentEditableWarning
          onChange={handleTitleChange}
        >
          {slide.title}
        </h2>
      </div>

      {/* Slide Content */}
      <div className="flex-1 p-6">
        {slide.blocks.length === 0 ? (
          <div>
            <EmptySlideState />
            <BlockInsertionPoint
              position={0}
              onInsert={(blockType, position) =>
                onBlockAdd?.(blockType, position)
              }
            />
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <div className="space-y-0">
              {/* Insertion point at the beginning */}
              <BlockInsertionPoint
                position={0}
                onInsert={(blockType, position) =>
                  onBlockAdd?.(blockType, position)
                }
              />

              <SortableContext
                items={blockIds}
                strategy={verticalListSortingStrategy}
              >
                {sortedBlocks.map((block, index) => (
                  <React.Fragment key={block.id}>
                    <DraggableBlockItem
                      block={block}
                      onDeselect={() => onBlockSelect?.(null)}
                      onSelect={() => onBlockSelect?.(block.id)}
                      onUpdate={(updates) => onBlockUpdate?.(block.id, updates)}
                      onDelete={() => onBlockDelete?.(block.id)}
                      availableVariables={availableVariables}
                    />
                    {/* Insertion point after each block */}
                    <BlockInsertionPoint
                      position={index + 1}
                      onInsert={(blockType, position) =>
                        onBlockAdd?.(blockType, position)
                      }
                    />
                  </React.Fragment>
                ))}
              </SortableContext>
            </div>
          </DndContext>
        )}
      </div>
    </div>
  );
}
