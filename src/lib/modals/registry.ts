import type { ModalType, ModalComponent, ModalRegistryEntry } from './types';

/**
 * Modal registry service
 * Maps modal types to their React components
 */
class ModalRegistryService {
  private registry: Map<ModalType, ModalComponent<any>> = new Map();

  /**
   * Register a modal component for a given type
   */
  register<T>(type: ModalType, component: ModalComponent<T>): void {
    if (this.registry.has(type)) {
      console.warn(`Modal type "${type}" is already registered. Overwriting.`);
    }
    this.registry.set(type, component as ModalComponent<any>);
  }

  /**
   * Register multiple modals at once
   */
  registerMany(entries: ModalRegistryEntry[]): void {
    entries.forEach((entry) => this.register(entry.type, entry.component));
  }

  /**
   * Get modal component for a type
   */
  getComponent(type: ModalType): ModalComponent<any> | undefined {
    return this.registry.get(type);
  }

  /**
   * Check if a modal type is registered
   */
  has(type: ModalType): boolean {
    return this.registry.has(type);
  }

  /**
   * Clear all registrations (useful for testing)
   */
  clear(): void {
    this.registry.clear();
  }

  /**
   * Get all registered modal types
   */
  getRegisteredTypes(): ModalType[] {
    return Array.from(this.registry.keys());
  }
}

// Singleton instance
export const modalRegistry = new ModalRegistryService();

