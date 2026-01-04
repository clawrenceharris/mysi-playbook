/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Distribution mode determines how items are assigned to participants
 */
export type DistributionMode =
  | "one-per-participant"
  | "round-robin"
  | "random"
  | "exclude-own";

/**
 * Mismatch handling strategy when items and participants don't align
 */
export type MismatchHandling = "auto" | "manual" | "strict";

/**
 * Configuration for distribution algorithm
 */
export interface DistributionConfig {
  mode: DistributionMode;
  mismatchHandling: MismatchHandling;
  excludeOwnResponses: boolean;
  allowMultiplePerParticipant: boolean;
  allowEmptyAssignments: boolean;
}

/**
 * Map of assignments between items and participants
 */
export interface AssignmentMap {
  assignments: Record<string, AssignmentItem[]>;
  createdAt: number;
  items: AssignmentItem[];
  distributionMode: DistributionMode;
  participants: Participant[];
}

/**
 * Participant in a Playfield session
 */
export interface Participant {
  id: string;
  name: string;
  isHost: boolean;
}

/**
 * Item to be assigned to participants
 */
export interface AssignmentItem {
  id: string;
  content: any;
  authorId?: string;
  createdAt: number;
}

/**
 * Result of a distribution operation
 */
export interface DistributionResult {
  success: boolean;
  assignments?: AssignmentMap;
  warnings?: string[];
  errors?: string[];
}

/**
 * Result of distribution validation
 */
export interface ValidationResult {
  valid: boolean;
  warnings: string[];
  errors: string[];
  suggestions?: string[];
}

/**
 * Response to an assigned item
 */
export interface AssignmentResponse {
  id: string;
  participantId: string;
  assignedItemId: string;
  blockId: string;
  response: any;
  submittedAt: number;
}

/**
 * Distribution engine interface
 */
export interface DistributionEngine {
  distribute(
    items: AssignmentItem[],
    participants: Participant[],
    config: DistributionConfig
  ): DistributionResult;

  validate(
    items: AssignmentItem[],
    participants: Participant[],
    config: DistributionConfig
  ): ValidationResult;

  preview(
    items: AssignmentItem[],
    participants: Participant[],
    config: DistributionConfig
  ): AssignmentMap;
}
