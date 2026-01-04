/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ImprovedStrategy } from "../domain/playground.types";
import type { Participant } from "../domain/distribution-engine.types";
import { generateMockParticipants } from "./PreviewMockData";
import { slugify } from "@/lib/utils";

export interface EventLogEntry {
  timestamp: number;
  event: any;
}

export interface PreviewState {
  [key: string]: any;
  phase: string;
}

const EVENT_CHANNEL = "event" as const;

export class PreviewExecutionEngine {
  private strategy: ImprovedStrategy;
  private state: PreviewState = { phase: "" };
  private eventLog: EventLogEntry[] = [];
  private eventListeners: Map<string, Array<(event: any) => void>> = new Map();
  private mockParticipants: Participant[] = [];

  constructor(activity: ImprovedStrategy) {
    this.strategy = activity;
    this.state = { phase: `${this.strategy.slug}:start` };
    // Generate mock participants for preview
    this.mockParticipants = generateMockParticipants(3);
  }

  getMockParticipants(): Participant[] {
    return [...this.mockParticipants];
  }

  start() {
    // Initialize state with first phase
    const firstPhase =
      this.strategy.slides.length > 0
        ? slugify(this.strategy.slides[0].title)
        : "";

    // Initialize slide-scoped state structure
    const slideStates: Record<string, any> = {};
    this.strategy.slides.forEach((slide) => {
      slideStates[slide.id] = {
        responses: {},
        assignments: {},
        assignmentResponses: [],
      };
    });

    this.state = {
      phase: firstPhase,
      ...slideStates,
      ...this.strategy.sharedState,
    };

    // Log start event
    this.logEvent({
      type: `${this.strategy.slug}:start`,
      phase: firstPhase,
    });
  }

  getState(): PreviewState {
    return { ...this.state };
  }

  on(event: string, callback: (event: any) => void) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  sendEvent(event: any) {
    this.logEvent(event);

    // Notify listeners
    const listeners = this.eventListeners.get(EVENT_CHANNEL) || [];
    listeners.forEach((callback) => callback(event));
  }

  getEventLog(): EventLogEntry[] {
    return [...this.eventLog];
  }

  setState(updates: any) {
    this.state = {
      ...this.state,
      ...updates,
    };

    // Notify listeners of state change
    const listeners = this.eventListeners.get(EVENT_CHANNEL) || [];
    listeners.forEach((callback) => callback({ type: "state-update" }));
  }

  private logEvent(event: any) {
    this.eventLog.push({
      timestamp: Date.now(),
      event,
    });
  }
}
