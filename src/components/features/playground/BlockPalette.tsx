import { PaletteBlockItem } from "./";
import {
  BlockCategory,
  blockCategoryLabels,
  BlockType,
  blockDefinitions,
} from "@/features/playground";
import { Separator } from "@/components/ui";

export interface BlockPaletteProps {
  onBlockAdd: (blockType: BlockType) => void;
}

export function BlockPalette({ onBlockAdd }: BlockPaletteProps) {
  return (
    <>
      <div className=" mb-4">
        <h2>Blocks</h2>
        <span className="text-xs text-muted-foreground">
          Select a block to add to the slide
        </span>
      </div>
      <div className="flex flex-col gap-7  justify-between">
        {Object.keys(blockCategoryLabels).map((category, i) => (
          <div key={category}>
            {i !== 0 && <Separator className="my-2" />}
            <h4 className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
              {blockCategoryLabels[category as BlockCategory]}
            </h4>
            <div className="flex flex-col gap-2">
              {blockDefinitions
                .filter((block) => block.category === category)
                .map((block) => (
                  <PaletteBlockItem
                    onClick={() => onBlockAdd(block.type)}
                    key={block.type}
                    title={block.title}
                    description={block.description}
                    icon={block.icon}
                  />
                ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
