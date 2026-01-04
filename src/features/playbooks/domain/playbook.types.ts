import { PlaybookStrategies, Playbooks } from "@/types/tables";

export type PlaybookWithStrategies = {
  strategies: PlaybookStrategies[];
} & Playbooks;

export type PlaybookScope = "mine" | "favorites" | "published" | "all";

export type PlaybookListQuery = {
  userId: string; // required for mine/favorites
  scope?: PlaybookScope;
  search?: string;
  courseName?: string;
  sort?: "updated_desc" | "created_desc";
  limit?: number;
  offset?: number;
};
