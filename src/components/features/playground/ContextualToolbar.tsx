import React from "react";
import { BlockPalette } from "./BlockPalette";
import { ConfigurationPanel } from "./ConfigurationPanel";
import { usePlayground } from "@/providers";
import { BlockType, StrategyBlock } from "@/features/playground";

export interface ContextualToolbarProps {
  onBlockAdd: (blockType: BlockType) => void;
  onBlockUpdate: (blockId: string, updates: Partial<StrategyBlock>) => void;
}

export function ContextualToolbar({
  onBlockAdd,
  onBlockUpdate,
}: ContextualToolbarProps) {
  const { selectedBlock, selectBlock } = usePlayground();

  return (
    <div className="h-full w-full flex flex-col p-3">
      {selectedBlock ? (
        <ConfigurationPanel
          block={selectedBlock}
          onBlockUpdate={onBlockUpdate}
          onClose={() => selectBlock(null)}
        />
      ) : (
        <BlockPalette onBlockAdd={onBlockAdd} />
      )}
    </div>
  );
}
