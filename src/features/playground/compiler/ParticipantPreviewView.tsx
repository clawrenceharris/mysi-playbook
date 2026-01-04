"use client";

import React, { useState } from "react";
import type {
  ImprovedStrategy,
  PlaygroundContext,
  StrategySlide,
} from "../domain/playground.types";
import { AvatarSelector } from "./AvatarSelector";
import { BlockRenderer } from "./BlockRenderer";
import { useParticipantManager } from "./ParticipantManagerContext";
import type { MockParticipant } from "./ParticipantStateManager";
import { PlayfieldStrategyLayout } from "@/components/features/playfield";

export interface ParticipantPreviewViewProps {
  strategy: ImprovedStrategy;
  slide: StrategySlide;
}

export function ParticipantPreviewView({
  strategy,
  slide,
}: ParticipantPreviewViewProps) {
  const participantManager = useParticipantManager();
  const [currentParticipantId, setCurrentParticipantId] = useState(
    participantManager.getCurrentParticipantId()
  );

  const participants = participantManager.getParticipants();

  // Use React state to track shared state and trigger re-renders
  const [sharedState, setSharedState] = React.useState(
    participantManager.getSharedState()
  );

  // Poll for state changes
  React.useEffect(() => {
    const interval = setInterval(() => {
      const latestState = participantManager.getSharedState();
      setSharedState(latestState);
    }, 100); // Poll every 100ms

    return () => clearInterval(interval);
  }, [participantManager]);

  const handleSelectParticipant = (participant: MockParticipant) => {
    participantManager.setCurrentParticipant(participant.id);
    setCurrentParticipantId(participant.id);
  };

  const handleAddParticipant = () => {
    const newParticipant = participantManager.addParticipant();
    participantManager.setCurrentParticipant(newParticipant.id);
    setCurrentParticipantId(newParticipant.id);
  };

  // Create participant-specific context with mock call for event handling
  const ctx: PlaygroundContext = {
    userId: currentParticipantId,
    isHost: false,
    state: sharedState,
    setState: (newState) => {
      participantManager.updateSharedState(newState);
      setSharedState(newState);
    },
    mockParticipants: participants,
    call: {
      sendCustomEvent: (event: unknown) => {
        console.log("Mock event sent:", event);
      },
    },
    slug: strategy.slug,
    phase: strategy.metadata?.phase || "warmup",
  };

  return (
    <div className="space-y-4">
      <AvatarSelector
        participants={participants}
        currentParticipantId={currentParticipantId}
        onSelectParticipant={handleSelectParticipant}
        onAddParticipant={handleAddParticipant}
      />
      <PlayfieldStrategyLayout
        className="shadow-none"
        ctx={{
          userId: currentParticipantId,
        }}
        strategy={{
          title: strategy.title,
          phase: strategy.metadata.phase,
        }}
      >
        {slide.blocks
          .sort((a, b) => a.order - b.order)
          .map((block) => (
            <BlockRenderer
              slide={slide}
              key={block.id}
              block={block}
              ctx={ctx}
            />
          ))}
      </PlayfieldStrategyLayout>
    </div>
  );
}
