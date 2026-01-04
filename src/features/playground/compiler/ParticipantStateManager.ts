/* eslint-disable @typescript-eslint/no-explicit-any */

import { StateAccessor } from "../domain";

/**
 * Mock participant for preview mode
 */
export interface MockParticipant {
  id: string;
  name: string;
  avatarNumber: number;
  isHost: boolean;
}

/**
 * State for individual participant
 * Supports slide-scoped structure where responses and assignments are organized by slide ID
 */
export interface ParticipantState {
  participantId: string;
  responses: Record<string, Record<string, any>>;
  customVariables: Record<string, any>;
  assignments: Record<string, string[]>;
}

/**
 * Manages multiple mock participants with independent state for preview mode
 */
export class ParticipantStateManager {
  private participants: MockParticipant[] = [];
  private participantStates: Map<string, ParticipantState> = new Map();
  private currentParticipantId: string = "";
  private sharedState: any = {};

  constructor() {
    // Initialize with 3 default participants
    for (let i = 1; i <= 3; i++) {
      this.addParticipant();
    }
    this.currentParticipantId = this.participants[0].id;
  }

  getParticipants(): MockParticipant[] {
    return this.participants;
  }

  getCurrentParticipantId(): string {
    return this.currentParticipantId;
  }

  addParticipant(): MockParticipant {
    const id = `participant-${crypto.randomUUID()}`;
    const participant: MockParticipant = {
      id,
      name: `Participant ${this.participants.length + 1}`,
      avatarNumber: (this.participants.length % 116) + 1,
      isHost: false,
    };

    this.participants.push(participant);
    this.participantStates.set(id, this.createEmptyState(id));

    return participant;
  }

  removeParticipant(id: string): void {
    this.participants = this.participants.filter((p) => p.id !== id);
    this.participantStates.delete(id);

    // If current participant was removed, switch to first available
    if (this.currentParticipantId === id && this.participants.length > 0) {
      this.currentParticipantId = this.participants[0].id;
    }
  }

  setCurrentParticipant(id: string): void {
    if (this.participantStates.has(id)) {
      this.currentParticipantId = id;
    }
  }

  getParticipantState(id: string): ParticipantState {
    return this.participantStates.get(id) || this.createEmptyState(id);
  }

  updateParticipantState(id: string, updates: Partial<ParticipantState>): void {
    const current = this.getParticipantState(id);
    this.participantStates.set(id, { ...current, ...updates });

    // Update shared state to reflect changes
    this.rebuildSharedState();
  }

  getSharedState(): any {
    return this.sharedState;
  }

  updateSharedState(updates: any): void {
    this.sharedState = { ...this.sharedState, ...updates };
  }

  getSlideState(slideId: string, accessor: StateAccessor): any {
    const slideData = this.sharedState[slideId];
    if (!slideData || typeof slideData !== "object") {
      return {};
    }
    return slideData[accessor] || {};
  }

  updateSlideState(slideId: string, accessor: StateAccessor, value: any): void {
    this.ensureSlideExists(this.sharedState, slideId);
    this.sharedState[slideId][accessor] = value;
  }

  private createEmptyState(participantId: string): ParticipantState {
    return {
      participantId,
      responses: {},
      customVariables: {},
      assignments: {},
    };
  }

  private aggregateStateField(
    fieldName: keyof Pick<ParticipantState, "responses" | "customVariables">
  ): Record<string, any> {
    const aggregated: Record<string, any> = {};

    this.participantStates.forEach((state) => {
      const fieldData = state[fieldName];

      if (fieldName === "responses") {
        this.aggregateResponses(aggregated, state, fieldData);
      } else {
        this.aggregateCustomVariables(aggregated, state, fieldData);
      }
    });

    return aggregated;
  }

  private aggregateResponses(
    aggregated: Record<string, any>,
    state: ParticipantState,
    responses: Record<string, Record<string, any>>
  ): void {
    Object.entries(responses).forEach(([slideId, blockResponses]) => {
      if (!aggregated[slideId]) {
        aggregated[slideId] = {};
      }
      Object.entries(blockResponses).forEach(([blockId, response]) => {
        const key = `${state.participantId}-${Date.now()}`;
        aggregated[slideId][key] = { [blockId]: response };
      });
    });
  }

  private aggregateCustomVariables(
    aggregated: Record<string, any>,
    state: ParticipantState,
    customVariables: Record<string, any>
  ): void {
    Object.entries(customVariables).forEach(([key, value]) => {
      if (!aggregated[key]) {
        aggregated[key] = {};
      }
      aggregated[key][`${state.participantId}-${Date.now()}`] = value;
    });
  }

  private rebuildSharedState(): void {
    const aggregatedResponses = this.aggregateStateField("responses");
    const aggregatedCustomVars = this.aggregateStateField("customVariables");

    const newState: Record<string, any> = {
      phase: this.sharedState.phase || "initial",
    };

    this.organizeResponsesBySlide(newState, aggregatedResponses);
    this.organizeAssignmentsBySlide(newState);
    Object.assign(newState, aggregatedCustomVars);

    this.sharedState = newState;
  }

  private organizeResponsesBySlide(
    state: Record<string, any>,
    aggregatedResponses: Record<string, any>
  ): void {
    Object.entries(aggregatedResponses).forEach(([slideId, responses]) => {
      this.ensureSlideExists(state, slideId);
      state[slideId].responses = responses;
    });
  }

  private organizeAssignmentsBySlide(state: Record<string, any>): void {
    this.participantStates.forEach((participantState) => {
      Object.entries(participantState.assignments).forEach(
        ([slideId, assignmentIds]) => {
          this.ensureSlideExists(state, slideId);
          if (!state[slideId].assignments) {
            state[slideId].assignments = {};
          }
          state[slideId].assignments[participantState.participantId] =
            assignmentIds;
        }
      );
    });
  }

  private ensureSlideExists(state: Record<string, any>, slideId: string): void {
    if (!state[slideId]) {
      state[slideId] = {};
    }
  }
}
