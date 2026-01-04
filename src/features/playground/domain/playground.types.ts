/* eslint-disable @typescript-eslint/no-explicit-any */

import { StrategyState } from "@/types/playbook";
import { MockParticipant } from "../compiler";
import { PlaygroundUpdateEvent } from "./activity-event-handler";
import { PlaybookStrategies } from "@/types/tables";

// Slide type enumeration
export enum SlideType {
  CONTENT = "content",
  INTERACTION = "interaction",
  TIMER = "timer",
  MIXED = "mixed",
  HANDOUT = "handout",
}

// Specific block configurations
export interface DisplayPromptConfig extends BlockConfig {
  content: string;
}

export interface DisplayVariableConfig extends BlockConfig {
  title?: string;
  dataSource: import("./data-reference").DataReference;
}
export type InputType = "text" | "multipleChoice" | "rating" | "file";
export interface HandoutConfig extends BlockConfig {
  dataSource: import("./data-reference").DataReference;
  distributionMode: DistributionMode;
  mismatchHandling: MismatchHandling;
  showAuthor: boolean;
  content?: string;
  allowParticipantResponse: boolean;
  responsePrompt?: string;
  allowReassignment: boolean;
  showDistributionPreview: boolean;
}

export interface PlaygroundContext {
  userId: string;
  isHost: boolean;
  state: StrategyState;
  setState: (newState: StrategyState) => void;
  mockParticipants: MockParticipant[];
  call: {
    sendCustomEvent: (event: PlaygroundUpdateEvent) => void;
  };
  slug: string;
  phase: PlaybookStrategies["phase"];
}
export interface CollectInputConfig extends BlockConfig {
  title?: string;
  content?: string;
  inputType: InputType;
  options?: string[];
  required: boolean;
  maxLength?: number;
  timeout?: number;
}

export interface TimerConfig extends BlockConfig {
  duration: number; // in seconds
  displayStyle: "countdown" | "progress" | "hidden";
  autoAdvance: boolean;
  title?: string;
}

export interface PollVoteConfig extends BlockConfig {
  question: string;
  options: string[];
  allowMultiple: boolean;
  showResults: "immediate" | "afterVoting" | "manual";
  anonymous: boolean;
}

// Block definition interface
export interface BlockDefinition {
  type: BlockType;
  title: string;
  description: string;
  icon: React.ComponentType;
  category: BlockCategory;
}
export type DistributionMode =
  | "one-per-participant"
  | "round-robin"
  | "random"
  | "exclude-own";

export type MismatchHandling = "auto" | "manual" | "strict";
export type AssignmentDisplayMode = "list" | "cards" | "grid";

// Slide transition configuration
export interface SlideTransition {
  type: "auto" | "manual" | "timer";
  delay?: number; // For auto transitions (milliseconds)
  condition?: string; // For conditional transitions
}

/**
 * Configuration for exporting an activity from playground to playfield
 */
export interface PlayfieldStrategyConfig {
  slug: string;
  title: string;
  description?: string;
  autoAdvancePhases?: boolean;
  requireAllResponses?: boolean;
  enableLateJoin?: boolean;
  preserveStateOnRestart?: boolean;
}
// Slide timing configuration
export interface SlideTiming {
  estimatedDuration: number; // in seconds
  maxDuration?: number; // in seconds
  showTimer: boolean;
}

// Core block types
export enum BlockType {
  DISPLAY_PROMPT = "display-prompt",
  COLLECT_INPUT = "collect-input",
  TIMER = "timer",
  POLL_VOTE = "poll-vote",
  HANDOUT = "handout",
  DISPLAY_VARIABLE = "display-variable",
}

export type BlockCategory = "display" | "interaction" | "facilitation";

// Base block configuration interface
export interface BlockConfig {
  title?: string;
  [key: string]: any;
}
export interface StrategyExportConfig {
  slug: string;
  title: string;
}
// Updated StrategyBlock without position requirements
export interface StrategyBlock {
  id: string;
  type: BlockType;
  order: number; // Simple integer ordering within slide
  config: BlockConfig;
}

// Strategy slide interface
export interface StrategySlide {
  timing: SlideTiming;
  transitions: SlideTransition;
  id: string;
  title: string;
  type: SlideType;
  blocks: StrategyBlock[];
  order: number; // Position in slide sequence
}

// Improved strategy interface (slide-centric)
export interface ImprovedStrategy {
  slug: string;
  id: string;
  title: string;
  slides: StrategySlide[];
  // Cross-slide state storage for passing data between slides (e.g., student inputs)
  sharedState?: Record<string, any>;
  metadata: {
    phase: PlaybookStrategies["phase"];
    estimatedDuration?: number;
    participantCount?: number;
  };
}

// Note: SlideTemplate interface moved to slide-templates.ts for better organization

// Slide navigation state
export interface SlideNavigationState {
  currentSlideId: string | null;
  previousSlideId: string | null;
  canGoBack: boolean;
  canGoForward: boolean;
  totalSlides: number;
  currentIndex: number;
}
