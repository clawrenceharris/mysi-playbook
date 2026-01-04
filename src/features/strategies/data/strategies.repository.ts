import { BaseRepository } from "@/repositories/base.repository";
import { Strategies } from "@/types/tables";
import { SupabaseClient } from "@supabase/supabase-js";

/**
 * Repository for strategies data operations using Supabase
 * Contains only database access logic, no business rules
 */
export class StrategiesRepository extends BaseRepository<Strategies> {
  constructor(client: SupabaseClient) {
    super(client, "strategies");
  }

  async addSavedStrategy(userId: string, strategyId: string) {
    const { error } = await this.client
      .from("saved_strategies")
      .insert({ user_id: userId, strategy_id: strategyId });
    if (error) throw error;
  }

  async removeSavedStrategy(userId: string, strategyId: string) {
    const { error } = await this.client
      .from("saved_strategies")
      .delete()
      .eq("user_id", userId)
      .eq("strategy_id", strategyId);
    if (error) throw error;
  }

  async isSaved(userId: string, strategyId: string): Promise<boolean> {
    const { data, error } = await this.client
      .from("saved_strategies")
      .select("id")
      .eq("user_id", userId)
      .eq("strategy_id", strategyId)
      .single();
    if (error && error.code !== "PGRST116") throw error; // PGRST116 is "no rows returned"
    return !!data;
  }
}
