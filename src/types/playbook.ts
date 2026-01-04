import type { Call, CustomVideoEvent } from "@stream-io/video-react-sdk";
import { PlaybookStrategies } from "./tables";

/**
 * Slide-scoped data structure for a single slide
 */

export interface StrategyState {
  phase: string;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}
export interface VirtualPlaybookContext extends PlayfieldContext {
  call: Call;
}
export interface PlayfieldContext {
  call: Call;
  userId: string;
  state: StrategyState;
  setState: (next: StrategyState) => void;
  isHost: boolean;
  slug: string;
  phase: PlaybookStrategies["phase"];
  mockParticipants?: import("@/features/playground/domain/distribution-engine.types").Participant[];
}
export interface PlayfieldDefinition {
  slug: string;
  title: string;
  phases: string[];
  start: (ctx: PlayfieldContext) => void;
  handleEvent: (event: CustomVideoEvent, ctx: PlayfieldContext) => void;
  Component: React.FC<{ ctx: PlayfieldContext }>;
  HostControls: React.FC<{ ctx: PlayfieldContext }>;
}
