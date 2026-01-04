import type {
  AssignmentItem,
  Participant,
  DistributionConfig,
  ValidationResult,
} from "./distribution-engine.types";

/**
 * Validate distribution feasibility and configuration
 */
export function validateDistribution(
  items: AssignmentItem[],
  participants: Participant[],
  config: DistributionConfig
): ValidationResult {
  const warnings: string[] = [];
  const errors: string[] = [];

  // Check for empty items
  if (items.length === 0) {
    errors.push("No items available for distribution");
  }

  // Check for empty participants
  if (participants.length === 0) {
    errors.push("No participants available for distribution");
  }

  // Check mismatch scenarios
  if (items.length > participants.length) {
    if (
      !config.allowMultiplePerParticipant &&
      config.mismatchHandling === "strict"
    ) {
      errors.push(
        `More items (${items.length}) than participants (${participants.length}). ` +
          `Enable "Allow multiple per participant" or change mismatch handling.`
      );
    } else {
      warnings.push(
        `Some participants will receive multiple items (${items.length} items, ${participants.length} participants)`
      );
    }
  }

  if (items.length < participants.length) {
    if (!config.allowEmptyAssignments && config.mismatchHandling === "strict") {
      errors.push(
        `Fewer items (${items.length}) than participants (${participants.length}). ` +
          `Enable "Allow empty assignments" or change mismatch handling.`
      );
    } else {
      warnings.push(
        `Some participants will not receive items (${items.length} items, ${participants.length} participants)`
      );
    }
  }

  // Validate exclude-own mode
  if (config.mode === "exclude-own") {
    const participantsWithoutEligibleItems = participants.filter((p) => {
      const eligibleItems = items.filter((item) => item.authorId !== p.id);
      return eligibleItems.length === 0;
    });

    if (participantsWithoutEligibleItems.length > 0) {
      warnings.push(
        `${participantsWithoutEligibleItems.length} participant(s) have no eligible items ` +
          `(all items were created by them)`
      );
    }
  }

  return {
    valid: errors.length === 0,
    warnings,
    errors,
    suggestions:
      errors.length > 0
        ? [
            "Consider changing distribution mode",
            "Adjust mismatch handling settings",
            "Ensure sufficient items are collected before distribution",
          ]
        : undefined,
  };
}
