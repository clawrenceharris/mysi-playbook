import { BaseRepository } from "@/repositories/base.repository";
import {
  PlaybookStrategies,
  PlaybookStrategiesUpdate,
  Playbooks,
} from "@/types/tables";
import { SupabaseClient } from "@supabase/supabase-js";
import { PlaybookListQuery } from "../domain";

/**
 * Repository for playbooks (lesson plans) data operations using Supabase
 * Contains only database access logic, no business rules
 */
export class PlaybookRepository extends BaseRepository<Playbooks> {
  constructor(client: SupabaseClient) {
    super(client, "playbooks");
  }

  async list(q: PlaybookListQuery): Promise<Playbooks[]> {
    const scope = q.scope ?? "mine";

    // Base select (for non-join scopes)
    let query = this.client.from("playbooks").select("*");

    if (scope === "mine") {
      query = query.eq("owner", q.userId);
    }

    if (scope === "published") {
      query = query.eq("published", true);
      // optionally: show only published by user or by anyone depending on your product
      // query = query.eq("owner", q.userId); // if "my published"
    }

    // Favorites scope uses a different FROM clause and returns nested shape
    if (scope === "favorites") {
      const favQuery = this.client
        .from("playbook_favorites")
        .select("playbooks(*)")
        .eq("user_id", q.userId);

      // filters/sort must be applied carefully with nested selects.
      // simplest: pull favorites then filter client-side for v1, OR build a view/RPC.
      // For now, do minimal and normalize:
      const { data, error } = await favQuery;
      if (error) throw error;
      const favorites = (
        (data ?? [])
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .map((row: any) => row.playbooks)
          .filter(Boolean) as Playbooks[]
      ).map((pb) => ({ ...pb, favorite: true }));
      return favorites;
    }

    // Common filters (non-favorites)
    if (q.search) query = query.ilike("topic", `%${q.search}%`);
    if (q.courseName) query = query.eq("course_name", q.courseName);

    // Sort
    if (q.sort === "created_desc")
      query = query.order("created_at", { ascending: false });
    else query = query.order("updated_at", { ascending: false });

    // Pagination
    if (typeof q.limit === "number") {
      const from = q.offset ?? 0;
      const to = from + q.limit - 1;
      query = query.range(from, to);
    }

    const { data, error } = await query;
    if (error) throw error;
    const playbooks = data ?? [];

    // Fetch favorite status for all playbooks if userId is provided
    if (q.userId && playbooks.length > 0) {
      const playbookIds = playbooks.map((pb) => pb.id);
      const { data: favorites, error: favError } = await this.client
        .from("playbook_favorites")
        .select("playbook_id")
        .eq("user_id", q.userId)
        .in("playbook_id", playbookIds);

      if (favError) throw favError;
      const favoritedIds = new Set(
        (favorites ?? []).map((f: { playbook_id: string }) => f.playbook_id)
      );

      return playbooks.map((pb) => ({
        ...pb,
        favorite: favoritedIds.has(pb.id),
      }));
    }

    return playbooks;
  }

  async addFavorite(userId: string, playbookId: string) {
    const { error } = await this.client
      .from("playbook_favorites")
      .insert({ user_id: userId, playbook_id: playbookId });
    if (error) throw error;
  }

  async removeFavorite(userId: string, playbookId: string) {
    const { error } = await this.client
      .from("playbook_favorites")
      .delete()
      .eq("user_id", userId)
      .eq("playbook_id", playbookId);
    if (error) throw error;
  }

  async isFavorited(userId: string, playbookId: string): Promise<boolean> {
    const { data, error } = await this.client
      .from("playbook_favorites")
      .select("id")
      .eq("user_id", userId)
      .eq("playbook_id", playbookId)
      .single();
    if (error && error.code !== "PGRST116") throw error; // PGRST116 is "no rows returned"
    return !!data;
  }

  async deletePlaybookStrategy(strategyId: string): Promise<void> {
    const { error } = await this.client
      .from("playbook_strategies")
      .delete()
      .eq("id", strategyId);
    if (error) throw error;
  }

  // your existing methods…
  async getPlaybookStrategies(
    playbookId: string
  ): Promise<PlaybookStrategies[]> {
    const { error, data } = await this.client
      .from("playbook_strategies")
      .select()
      .eq("playbook_id", playbookId);

    if (error) throw error;
    return data ?? [];
  }

  async updatePlaybookStrategy(
    strategyId: string,
    data: PlaybookStrategiesUpdate
  ) {
    const { error, data: strategy } = await this.client
      .from("playbook_strategies")
      .update<PlaybookStrategiesUpdate>(data)
      .eq("id", strategyId)
      .select()
      .single();

    if (error) throw error;
    return strategy;
  }
}
