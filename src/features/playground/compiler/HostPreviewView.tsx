"use client";

import React from "react";
import type {
  ImprovedStrategy,
  StrategySlide,
  PlaygroundContext,
} from "../domain/playground.types";
import { BlockRenderer } from "./BlockRenderer";
import { useParticipantManager } from "./ParticipantManagerContext";
import { PlayfieldStrategyLayout } from "@/components/features/playfield";
import { PlaygroundUpdateEvent } from "../domain/activity-event-handler";
import { BlockHostControl } from "./BlockHostControl";

export interface HostPreviewViewProps {
  strategy: ImprovedStrategy;
  slide: StrategySlide;
}

function isEventObject(
  event: unknown
): event is { type: string } & Record<string, unknown> {
  return (
    typeof event === "object" &&
    event !== null &&
    "type" in event &&
    typeof event.type === "string"
  );
}

export function HostPreviewView({ strategy, slide }: HostPreviewViewProps) {
  const participantManager = useParticipantManager();
  const participants = participantManager.getParticipants();

  // Use React state to track shared state and trigger re-renders
  const [sharedState, setSharedState] = React.useState(
    participantManager.getSharedState()
  );

  // Poll for state changes from participants
  React.useEffect(() => {
    const interval = setInterval(() => {
      const latestState = participantManager.getSharedState();
      setSharedState(latestState);
    }, 100); // Poll every 100ms

    return () => clearInterval(interval);
  }, [participantManager]);

  const handleCustomEvent = (event: PlaygroundUpdateEvent) => {
    console.log("Mock host event sent:", {
      event,
      ctx,
    });

    if (!isEventObject(event)) return;

    const eventType = event.type;

    // Handle slide-scoped state updates
    if (eventType.includes("slide-state-update")) {
      const { slideId, accessor, value } = event;
      const slideData = sharedState[slideId as string] || {};

      const newState = {
        ...sharedState,
        [slideId as string]: {
          ...slideData,
          [accessor as string]: value,
        },
      };
      console.log({ value, accessor, newState });
      participantManager.updateSharedState(newState);
      setSharedState(newState);

      return;
    }

    if (eventType.includes("assignments-cleared")) {
      const { slideId } = event;
      const newAssignments = { ...sharedState.assignments };
      delete newAssignments[slideId as string];

      const newState = {
        ...sharedState,
        assignments: newAssignments,
      };
      participantManager.updateSharedState(newState);
      setSharedState(newState);
    }
  };

  // Create host context with isHost: true
  const ctx: PlaygroundContext = {
    userId: "host",
    isHost: true,
    state: sharedState,
    setState: (newState) => {
      participantManager.updateSharedState(newState);
      setSharedState(newState);
    },
    mockParticipants: participants,
    call: {
      sendCustomEvent: handleCustomEvent,
    },
    slug: strategy.slug,
    phase: strategy.metadata?.phase ?? 0,
  };

  return (
    <PlayfieldStrategyLayout
      className="shadow-none"
      strategy={{ ...strategy, ...strategy.metadata }}
      ctx={ctx}
    >
      {slide.blocks
        .sort((a, b) => a.order - b.order)
        .map((block) => (
          <div key={block.id} className="space-y-2">
            <BlockRenderer slide={slide} block={block} ctx={ctx} />

            <BlockHostControl block={block} slide={slide} ctx={ctx} />
          </div>
        ))}
    </PlayfieldStrategyLayout>
  );
}
