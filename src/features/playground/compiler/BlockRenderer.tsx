/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useMemo, useState } from "react";
import {
  StrategyBlock,
  BlockType,
  DisplayVariableConfig,
  interpolateVariable,
  DisplayPromptConfig,
  StrategySlide,
  PlaygroundContext,
} from "../";
import { Button, Input, Label } from "@/components/ui";
import { FormItem } from "@/components/ui";
import { WaitingForAssignment, NoAssignmentState } from "@/components/states";
import { AssignedItemCard } from "@/components/features/playground";
import {
  AssignmentItem,
  AssignmentMap,
} from "../domain/distribution-engine.types";

export interface BlockRendererProps {
  block: StrategyBlock;
  slide: StrategySlide;
  ctx: PlaygroundContext;
}

export function BlockRenderer({ slide, block, ctx }: BlockRendererProps) {
  const handleSubmit = (response: any) => {
    // Send event through context
    ctx.call.sendCustomEvent({
      type: `${ctx.slug}:submit-${slide.id}`,
      slideId: slide.id,
      value: { [ctx.userId]: response },
      accessor: "responses",
    });

    // // Store in slide-scoped structure
    const slideData = ctx.state[slide.id] || {};
    const existingResponses = slideData.responses || {};
    const responseKey = `${ctx.userId}-${crypto.randomUUID()}`;

    ctx.setState({
      ...ctx.state,
      [slide.id]: {
        ...slideData,
        responses: {
          ...existingResponses,
          [responseKey]: response,
        },
      },
    });
  };

  switch (block.type) {
    case BlockType.DISPLAY_PROMPT:
      return <DisplayPromptBlock block={block} />;

    case BlockType.COLLECT_INPUT:
      return (
        <CollectInputBlock
          block={block}
          onSubmit={handleSubmit}
          existingResponse={
            ctx.state?.responses?.[block.id]?.[ctx.userId || ""]
          }
        />
      );

    case BlockType.TIMER:
      return <TimerBlock block={block} />;

    case BlockType.POLL_VOTE:
      return (
        <PollVoteBlock
          block={block}
          onSubmit={handleSubmit}
          results={ctx.state?.responses?.[block.id]}
        />
      );

    case BlockType.HANDOUT:
      return <HandoutBlock slide={slide} ctx={ctx} />;

    case BlockType.DISPLAY_VARIABLE:
      return <DisplayVariableBlock block={block} ctx={ctx} />;
    default:
      return <div>Unknown block type: {block.type}</div>;
  }
}

/**
 * Display Prompt Block Component
 */
function DisplayPromptBlock({ block }: { block: StrategyBlock }) {
  const config = block.config as DisplayPromptConfig;

  return (
    <div className="space-y-6">
      <div className="text-lg font-bold">{config.title}</div>
      <p>{config.content}</p>
    </div>
  );
}

/**
 *  Display Variable Block Component
 */
function DisplayVariableBlock({
  block,

  ctx,
}: {
  block: StrategyBlock;

  ctx: PlaygroundContext;
}) {
  const config = block.config as DisplayVariableConfig;

  // Create variable context for interpolation
  const variableContext = {
    state: ctx.state || {},
    userId: ctx.userId || "",
    isHost: ctx.isHost || false,
    assignments: ctx.state?.assignments,
  };

  const resolvedContent = interpolateVariable(
    config.dataSource,

    variableContext
  );

  return (
    <div className="space-y-6">
      {config.title && <div className="text-lg font-bold">{config.title}</div>}
      <div className="whitespace-pre-wrap">{resolvedContent}</div>
    </div>
  );
}

/**
 * Collect Input Block Component
 */
function CollectInputBlock({
  block,
  onSubmit,
  existingResponse,
}: {
  block: StrategyBlock;
  onSubmit: (response: any) => void;
  existingResponse?: any;
}) {
  const config = block.config as any;
  const [value, setValue] = useState(existingResponse || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(value);
    setValue("");
  };

  if (config.inputType === "multipleChoice") {
    return (
      <div>
        <div>{config.question}</div>
        <div>
          <div className="space-y-2">
            {config.options?.map((option: string) => (
              <Button
                key={option}
                variant="outline"
                className="w-full"
                onClick={() => {
                  setValue(option);
                  onSubmit(option);
                }}
              >
                {option}
              </Button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>{config.question}</div>
      <div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormItem>
            <Label htmlFor={`input-${block.id}`}>Your response</Label>
            <Input
              id={`input-${block.id}`}
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              required={config.required}
              maxLength={config.maxLength}
            />
          </FormItem>
          <Button disabled={!value.trim()} type="submit">
            Submit
          </Button>
        </form>
      </div>
    </div>
  );
}

/**
 * Timer Block Component
 */
function TimerBlock({ block }: { block: StrategyBlock }) {
  const config = block.config as any;

  return (
    <div>
      <div>{config.title || "Timer"}</div>
      <div>
        <div className="text-center">
          <p className="text-4xl font-bold">{config.duration}s</p>
        </div>
      </div>
    </div>
  );
}

/**
 * Poll Vote Block Component
 */
function PollVoteBlock({
  block,
  onSubmit,
}: {
  block: StrategyBlock;
  onSubmit: (response: any) => void;
  results?: Record<string, any>;
}) {
  const config = block.config as any;

  return (
    <div>
      <div>{config.question}</div>
      <div>
        <div className="space-y-2">
          {config.options?.map((option: string) => (
            <Button
              key={option}
              variant="outline"
              className="w-full"
              onClick={() => onSubmit(option)}
            >
              {option}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Handout Block Component
 * Displays items assigned to the current participant
 */
function HandoutBlock({
  slide,
  ctx,
}: {
  slide: StrategySlide;
  ctx: PlaygroundContext;
}) {
  const assignments: AssignmentMap = useMemo(
    () => ctx.state?.[slide.id]?.assignments,
    [ctx.state, slide.id]
  );

  if (!assignments) {
    return <WaitingForAssignment />;
  }
  const assignedItems: AssignmentItem[] =
    assignments.assignments?.[ctx.userId || ""] || [];

  if (!assignedItems?.length) {
    return <NoAssignmentState />;
  }

  return (
    <div className="space-y-6">
      {assignedItems.map((item) => (
        <AssignedItemCard key={item.id} item={item} />
      ))}
    </div>
  );
}
