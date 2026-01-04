import { Strategies } from "@/types/tables";
import { StrategiesRepository } from "../data";
import { supabase } from "@/lib/supabase/client";

/**
 * Service layer for strategy business logic
 * Handles strategy queries and lookups
 */
export class StrategiesService {
  constructor(private repository: StrategiesRepository) {}

  /**
   * Get a strategy by ID
   */
  async getStrategyById(id: string): Promise<Strategies | null> {
    return await this.repository.getById(id);
  }

  /**
   * Get a strategy by slug
   */
  async getStrategyBySlug(slug: string): Promise<Strategies | null> {
    return await this.repository.getSingleBy("slug", slug);
  }

  /**
   * Get all strategies
   */
  async getAll(): Promise<Strategies[]> {
    return await this.repository.getAll();
  }

  /**
   * Save a strategy for a user
   */
  async saveStrategy(userId: string, strategyId: string): Promise<void> {
    return this.repository.addSavedStrategy(userId, strategyId);
  }

  /**
   * Unsave a strategy for a user
   */
  async unsaveStrategy(userId: string, strategyId: string): Promise<void> {
    return this.repository.removeSavedStrategy(userId, strategyId);
  }

  /**
   * Check if a strategy is saved by a user
   */
  async isSaved(userId: string, strategyId: string): Promise<boolean> {
    return this.repository.isSaved(userId, strategyId);
  }
}

/**
 * Factory function to create a StrategiesService instance
 * Enables dependency injection for testing
 */
export function createStrategiesService(
  repository: StrategiesRepository = new StrategiesRepository(supabase)
): StrategiesService {
  return new StrategiesService(repository);
}

/**
 * Singleton instance for backward compatibility
 */
export const strategiesService = createStrategiesService();
