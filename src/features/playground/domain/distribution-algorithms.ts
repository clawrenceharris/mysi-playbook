import type {
  AssignmentItem,
  Participant,
  DistributionConfig,
  AssignmentMap,
} from "./distribution-engine.types";

/**
 * Distribute one item per participant
 */
export function distributeOnePerParticipant(
  items: AssignmentItem[],
  participants: Participant[],
  config: DistributionConfig
): AssignmentMap {
  const assignments: Record<string, AssignmentItem[]> = {};

  participants.forEach((participant, index) => {
    if (items[index]) {
      assignments[participant.id] = [items[index]];
    } else if (config.allowEmptyAssignments) {
      assignments[participant.id] = [];
    }
  });

  return {
    assignments,
    items,

    createdAt: Date.now(),
    distributionMode: "one-per-participant",
    participants,
  };
}

/**
 * Distribute items in round-robin fashion
 */
export function distributeRoundRobin(
  items: AssignmentItem[],
  participants: Participant[],
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _config: DistributionConfig
): AssignmentMap {
  const assignments: Record<string, AssignmentItem[]> = {};

  // Initialize empty arrays
  participants.forEach((p) => {
    assignments[p.id] = [];
  });

  // Distribute items
  items.forEach((item, index) => {
    const participantIndex = index % participants.length;
    const participant = participants[participantIndex];

    assignments[participant.id].push(item);
  });

  return {
    assignments,
    items,
    createdAt: Date.now(),
    distributionMode: "round-robin",
    participants: participants,
  };
}

/**
 * Distribute items randomly
 */
export function distributeRandom(
  items: AssignmentItem[],
  participants: Participant[],
  config: DistributionConfig
): AssignmentMap {
  // Shuffle items first
  const shuffledItems = [...items].sort(() => Math.random() - 0.5);

  // Then use round-robin on shuffled items
  return {
    ...distributeRoundRobin(shuffledItems, participants, config),
    distributionMode: "random",
  };
}

/**
 * Distribute items excluding own responses (Snowball pattern)
 */
export function distributeExcludeOwn(
  items: AssignmentItem[],
  participants: Participant[],
  config: DistributionConfig
): AssignmentMap {
  const assignments: Record<string, AssignmentItem[]> = {};

  participants.forEach((participant) => {
    // Get items not created by this participant
    const eligibleItems = items.filter(
      (item) => item.authorId !== participant.id
    );

    if (eligibleItems.length > 0) {
      // Randomly select one
      const randomIndex = Math.floor(Math.random() * eligibleItems.length);
      const selectedItem = eligibleItems[randomIndex];

      assignments[participant.id] = [selectedItem];
    } else if (config.allowEmptyAssignments) {
      assignments[participant.id] = [];
    }
  });

  return {
    assignments,
    items,
    createdAt: Date.now(),
    distributionMode: "exclude-own",
    participants: participants,
  };
}
