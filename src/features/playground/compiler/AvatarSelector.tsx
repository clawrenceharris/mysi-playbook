import React from "react";
import { Plus } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { MockParticipant } from "./ParticipantStateManager";

interface AvatarSelectorProps {
  participants: MockParticipant[];
  currentParticipantId: string;
  onSelectParticipant: (participant: MockParticipant) => void;
  onAddParticipant: () => void;
}

export function AvatarSelector({
  participants,
  currentParticipantId,
  onSelectParticipant,
  onAddParticipant,
}: AvatarSelectorProps) {
  const currentParticipant = participants.find(
    (p) => p.id === currentParticipantId
  );

  return (
    <div className="flex items-center gap-2 p-4 border-b">
      <span className="text-sm font-medium">Viewing as:</span>
      <div className="flex gap-2 flex-wrap">
        {participants.map((participant) => (
          <button
            key={participant.id}
            onClick={() => onSelectParticipant(participant)}
            className={cn(
              "w-10 h-10 rounded-full border-2 transition-all",
              currentParticipantId === participant.id
                ? "border-primary-500 ring-2 ring-primary-200"
                : "border-border hover:border-primary-300"
            )}
          >
            <Avatar>
              <AvatarImage
                src={`/avatars/Number=${participant.avatarNumber}.png`}
                alt={participant.name}
              />
              <AvatarFallback>{participant.name[0]}</AvatarFallback>
            </Avatar>
          </button>
        ))}
        <Button
          variant="outline"
          size="icon"
          onClick={onAddParticipant}
          className="w-10 h-10 rounded-full"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>
      <span className="text-sm text-muted-foreground ml-auto">
        {currentParticipant?.name}
      </span>
    </div>
  );
}
