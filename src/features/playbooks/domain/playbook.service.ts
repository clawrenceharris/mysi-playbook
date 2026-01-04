import { PlaybookStrategies, Playbooks, PlaybookStrategiesUpdate } from "@/types/tables";
import { PlaybookRepository } from "../data/playbooks.repository";
import { supabase } from "@/lib/supabase/client";
import { PlaybookListQuery, PlaybookWithStrategies } from ".";

/**
 * Service layer for playbook business logic
 * Handles playbook operations, strategies, favorites, and publishing
 */
export class PlaybookService {
  constructor(private repository: PlaybookRepository) {}

  /**
   * List playbooks with optional filtering and pagination
   */
  async list(query: PlaybookListQuery): Promise<Playbooks[]> {
    return this.repository.list(query);
  }

  /**
   * Get all playbooks owned by a user
   */
  async getAllByUser(userId: string): Promise<Playbooks[]> {
    return this.list({ userId, scope: "mine" });
  }

  /**
   * Get all published playbooks
   */
  async getPublished(userId: string): Promise<Playbooks[]> {
    return this.list({ userId, scope: "published" });
  }

  /**
   * Get all favorited playbooks for a user
   */
  async getFavorites(userId: string): Promise<Playbooks[]> {
    return this.list({ userId, scope: "favorites" });
  }

  /**
   * Get a playbook with its associated strategies
   */
  async getPlaybookWithStrategies(
    playbookId: string
  ): Promise<PlaybookWithStrategies> {
    const playbook = (await this.repository.getById(playbookId)) as Playbooks;
    if (!playbook) {
      throw new Error(`Playbook with id ${playbookId} not found`);
    }
    const strategies = await this.repository.getPlaybookStrategies(playbookId);
    return { ...playbook, strategies: strategies as PlaybookStrategies[] };
  }

  /**
   * Delete a playbook
   */
  async deletePlaybook(playbookId: string): Promise<void> {
    return this.repository.delete(playbookId);
  }

  /**
   * Favorite a playbook for a user
   */
  async favoritePlaybook(userId: string, playbookId: string): Promise<void> {
    return this.repository.addFavorite(userId, playbookId);
  }

  /**
   * Unfavorite a playbook for a user
   */
  async unfavoritePlaybook(userId: string, playbookId: string): Promise<void> {
    return this.repository.removeFavorite(userId, playbookId);
  }

  /**
   * Check if a playbook is favorited by a user
   */
  async isFavorited(userId: string, playbookId: string): Promise<boolean> {
    return this.repository.isFavorited(userId, playbookId);
  }

  /**
   * Delete a strategy from a playbook
   */
  async deletePlaybookStrategy(strategyId: string): Promise<void> {
    return this.repository.deletePlaybookStrategy(strategyId);
  }

  /**
   * Update a playbook strategy
   */
  async updatePlaybookStrategy(
    strategyId: string,
    data: PlaybookStrategiesUpdate
  ): Promise<PlaybookStrategies> {
    return this.repository.updatePlaybookStrategy(strategyId, data);
  }

  /**
   * Reorder strategies by updating their phases
   */
  async reorderStrategies(
    strategies: { id: string; phase: PlaybookStrategies["phase"] }[]
  ): Promise<void> {
    await Promise.all(
      strategies.map((strategy) =>
        this.repository.updatePlaybookStrategy(strategy.id, {
          phase: strategy.phase,
        } as PlaybookStrategiesUpdate)
      )
    );
  }
}

/**
 * Factory function to create a PlaybookService instance
 * Enables dependency injection for testing
 */
export function createPlaybookService(
  repository: PlaybookRepository = new PlaybookRepository(supabase)
): PlaybookService {
  return new PlaybookService(repository);
}

/**
 * Singleton instance for backward compatibility
 */
export const playbooksService = createPlaybookService();
