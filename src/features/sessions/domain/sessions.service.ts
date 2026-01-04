import { SessionsRepository } from "../data";
import { Sessions, SessionsInsert, SessionsUpdate } from "@/types/tables";
import { supabase } from "@/lib/supabase/client";

/**
 * Service layer for session business logic
 * Handles session CRUD operations and user-specific queries
 */
export class SessionsService {
  constructor(private repository: SessionsRepository) {}

  /**
   * Get a session by ID
   */
  async getSessionById(id: string): Promise<Sessions | null> {
    return await this.repository.getById(id);
  }

  /**
   * Create a new session
   */
  async createSession(data: SessionsInsert): Promise<Sessions> {
    return await this.repository.create<SessionsInsert>(data);
  }

  /**
   * Create a new session (alias for createSession)
   */
  async addSession(data: SessionsInsert): Promise<Sessions> {
    return await this.repository.create(data);
  }

  /**
   * Update an existing session
   */
  async updateSession(id: string, data: SessionsUpdate): Promise<Sessions> {
    return await this.repository.update(id, data);
  }

  /**
   * Delete a session
   */
  async deleteSession(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  /**
   * Get all sessions for a user (by leader_id)
   */
  async getAllByUser(userId: string): Promise<Sessions[]> {
    return await this.repository.getAllBy("leader_id", userId);
  }
}

/**
 * Factory function to create a SessionsService instance
 * Enables dependency injection for testing
 */
export function createSessionsService(
  repository: SessionsRepository = new SessionsRepository(supabase)
): SessionsService {
  return new SessionsService(repository);
}

/**
 * Singleton instance for backward compatibility
 */
export const sessionsService = createSessionsService();
