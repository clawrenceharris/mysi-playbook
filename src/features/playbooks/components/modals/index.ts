import { modalRegistry } from "@/lib/modals/registry";
import { DeletePlaybookModal } from "./DeletePlaybookModal";
import { ReplaceStrategyModal } from "./ReplaceStrategyModal";
import { GeneratePlaybookModal } from "./GeneratePlaybookModal";

/**
 * Modal type constants for playbooks
 */
export const PLAYBOOK_MODAL_TYPES = {
  DELETE: "playbook:delete",
  REPLACE_STRATEGY: "playbook:replace-strategy",
  GENERATE: "playbook:generate",
} as const;

/**
 * Register all playbook modals with the modal registry
 * This should be called during app initialization
 */
export function registerPlaybookModals() {
  modalRegistry.register(PLAYBOOK_MODAL_TYPES.DELETE, DeletePlaybookModal);
  modalRegistry.register(
    PLAYBOOK_MODAL_TYPES.REPLACE_STRATEGY,
    ReplaceStrategyModal
  );
  modalRegistry.register(PLAYBOOK_MODAL_TYPES.GENERATE, GeneratePlaybookModal);
}
