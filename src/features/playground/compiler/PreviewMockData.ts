import type { Participant } from "../domain/distribution-engine.types";

/**
 * Generate mock participants for preview mode
 */
export function generateMockParticipants(count: number = 3): Participant[] {
  const participants: Participant[] = [];

  for (let i = 0; i < count; i++) {
    participants.push({
      id: `preview-participant-${i + 1}`,
      name: `Participant ${i + 1}`,
      isHost: false,
    });
  }

  return participants;
}

/**
 * Get a specific mock participant by index
 */
export function getMockParticipant(index: number): Participant {
  return {
    id: `preview-participant-${index + 1}`,
    name: `Participant ${index + 1}`,
    isHost: false,
  };
}

/**
 * Get the preview user (the user viewing the preview)
 */
export function getPreviewUser(): Participant {
  return {
    id: "preview-user",
    name: "You (Preview)",
    isHost: false,
  };
}
