import { modalRegistry } from "@/lib/modals/registry";
import { DeleteSessionModal } from "./DeleteSessionModal";
import { CreateSessionModal } from "./CreateSessionModal";
import { UpdateSessionModal } from "./UpdateSessionModal";

/**
 * Modal type constants for sessions
 */
export const SESSION_MODAL_TYPES = {
  DELETE: "session:delete",
  CREATE: "session:create",
  UPDATE: "session:update",
} as const;

/**
 * Register all session modals with the modal registry
 * This should be called during app initialization
 */
export function registerSessionModals() {
  modalRegistry.register(SESSION_MODAL_TYPES.DELETE, DeleteSessionModal);
  modalRegistry.register(SESSION_MODAL_TYPES.CREATE, CreateSessionModal);
  modalRegistry.register(SESSION_MODAL_TYPES.UPDATE, UpdateSessionModal);
}
