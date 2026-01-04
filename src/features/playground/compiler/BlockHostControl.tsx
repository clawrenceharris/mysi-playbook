import React from "react";
import {
  BlockType,
  PlaygroundContext,
  type StrategyBlock,
} from "../domain/playground.types";
import { Button } from "@/components/ui/button";
import { HandoutHostControl } from "./HandoutHostControl";

export interface BlockHostControlProps {
  block: StrategyBlock;
  slide: { id: string; title: string };
  ctx: PlaygroundContext;
}

/**
 * BlockHostControl renders host-specific controls for different block types
 */
export function BlockHostControl({ block, slide, ctx }: BlockHostControlProps) {
  const responses = ctx.state?.[slide.id]?.responses?.[block.id] || {};
  const responseCount = Object.keys(responses).length;

  switch (block.type) {
    case BlockType.COLLECT_INPUT:
      return (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {responseCount} responses
          </span>
        </div>
      );

    case BlockType.POLL_VOTE:
      return (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {responseCount} votes
          </span>
        </div>
      );

    case BlockType.TIMER:
      return (
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => {}}>
            Pause Timer
          </Button>
          <Button variant="ghost" size="sm" onClick={() => {}}>
            Skip Timer
          </Button>
        </div>
      );

    case BlockType.HANDOUT:
      return (
        <HandoutHostControl
          block={block}
          slide={slide}
          ctx={ctx}
          slug={ctx.slug}
        />
      );

    default:
      return null;
  }
}
