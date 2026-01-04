import React, { useState, useRef, useEffect } from "react";
import { Button, Card, CardContent } from "@/components/ui";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { blockDefinitions, BlockType } from "@/features/playground";

export interface BlockInsertionPointProps {
  position: number;
  onInsert: (blockType: BlockType, position: number) => void;
  suggestedBlocks?: string[];
}

export function BlockInsertionPoint({
  position,
  onInsert,
}: BlockInsertionPointProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(event.target as Node)
      ) {
        setShowPicker(false);
      }
    };

    if (showPicker) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showPicker]);

  const handleInsertClick = () => {
    setShowPicker(true);
  };

  const handleBlockSelect = (blockType: BlockType) => {
    onInsert(blockType, position);
    setShowPicker(false);
  };

  return (
    <div className="relative">
      {/* Insertion Area */}
      <div
        data-testid={`insertion-area-${position}`}
        className="h-8 flex items-center justify-center group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Insertion Line */}
        <div className="w-full h-px bg-border opacity-0 group-hover:opacity-100 transition-opacity" />

        {/* Plus Button */}
        <Button
          data-testid={`insertion-point-${position}`}
          variant="outline"
          size="sm"
          className={cn(
            "absolute bg-background border-2 border-dashed border-primary/50 rounded-full w-8 h-8 p-0 transition-opacity",
            isHovered || showPicker ? "opacity-100" : "opacity-0"
          )}
          onClick={handleInsertClick}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Block Picker */}
      {showPicker && (
        <div
          ref={pickerRef}
          data-testid="block-picker"
          className="absolute top-full left-1/2 transform -translate-x-1/2 z-50 mt-2"
        >
          <Card className="w-64 shadow-lg">
            <CardContent className="p-2">
              <div className="space-y-1">
                {blockDefinitions.map((block) => (
                  <Button
                    key={block.type}
                    variant="ghost"
                    className="w-full justify-start text-left h-auto p-3"
                    onClick={() => handleBlockSelect(block.type)}
                  >
                    <div>
                      <div className="font-medium">{block.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {block.description}
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
