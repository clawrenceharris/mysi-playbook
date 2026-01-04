import { Playbooks, Sessions } from "@/types";
import type { ReactNode } from "react";

/**
 * Base modal type - all modal types extend this pattern
 * Use namespaced strings like 'feature:action' to avoid conflicts
 */
export type ModalType = string;

/**
 * Props interface for delete playbook modal
 */
export interface DeletePlaybookModalProps {
  playbookId: string;
  onConfirm: (playbookId: string) => Promise<void>;
  isLoading?: boolean;
}

/**
 * Props interface for replace strategy modal
 */
export interface ReplaceStrategyModalProps {
  strategyToReplace: import("@/types/tables").PlaybookStrategies;
  playbookId: string;
  onConfirm: (
    strategyToReplace: import("@/types/tables").PlaybookStrategies,
    newStrategy: import("@/types/tables").Strategies
  ) => Promise<void>;
  isLoading?: boolean;
}

/**
 * Props interface for generate playbook modal
 */
export interface GeneratePlaybookModalProps {
  onConfirm: (
    data: import("@/features/playbooks/domain").GeneratePlaybookInput
  ) => Promise<Playbooks>;
  isLoading?: boolean;
}

/**
 * Props interface for delete session modal
 */
export interface DeleteSessionModalProps {
  sessionId: string;
  onConfirm: (sessionId: string) => Promise<void> | void;
  isLoading?: boolean;
}

/**
 * Props interface for create session modal
 */
export interface CreateSessionModalProps {
  onConfirm: (
    data: import("@/features/sessions/domain").CreateSessionInput
  ) => Promise<Sessions>;
  isLoading?: boolean;
}

/**
 * Props interface for update session modal
 */
export interface UpdateSessionModalProps {
  sessionId: string;
  session: import("@/types/tables").Sessions;
  onConfirm: (
    sessionId: string,
    data: import("@/features/sessions/domain").CreateSessionInput
  ) => Promise<void>;
  onUpdateStatus?: (
    sessionId: string,
    status: import("@/types/tables").Sessions["status"]
  ) => Promise<void>;
  isLoading?: boolean;
}

/**
 * Union type of all modal props
 * Add new modal props types here as you create them
 */
export type ModalProps =
  | DeletePlaybookModalProps
  | ReplaceStrategyModalProps
  | GeneratePlaybookModalProps
  | DeleteSessionModalProps
  | CreateSessionModalProps
  | UpdateSessionModalProps;

/**
 * Modal component type - receives props and renders modal content
 */
export type ModalComponent<T = unknown> = (props: T) => ReactNode;

/**
 * Registry entry for a modal type
 */
export interface ModalRegistryEntry {
  type: ModalType;
  component: ModalComponent<unknown>;
}

/**
 * Type-safe modal state in context
 */
export interface ModalState {
  type: ModalType | null;
  props: ModalProps | null;
}
