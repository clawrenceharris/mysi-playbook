import { useQuery } from "@tanstack/react-query";
import { playbookKeys, PlaybookListQuery, playbooksService } from "../domain";

export function usePlaybooks(query: PlaybookListQuery) {
  return useQuery({
    queryKey: playbookKeys.list(query),
    queryFn: () => playbooksService.list(query),
    enabled: !!query.userId,
    staleTime: 30_000,
  });
}

export const useMyPlaybooks = (userId: string) =>
  usePlaybooks({ userId, scope: "mine" });

export const useFavoritePlaybooks = (userId: string) =>
  usePlaybooks({ userId, scope: "favorites" });

export const usePublishedPlaybooks = (userId: string) =>
  usePlaybooks({ userId, scope: "published" });
