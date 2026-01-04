import { useStrategies } from "./useStrategies";
import { Strategies } from "@/types/tables";
import { useSearch } from "@/hooks/useSearch";

export interface UseMediaSearchResult {
  results: Strategies[];
  isLoading: boolean;
  error: string | null;
  hasSearched: boolean;
  query: string;
  search: (query: string) => void;
  clearResults: () => void;
  retry: () => void;
}

/**
 * Hook for strategy search, now backed by the generic `useSearch`
 */
export function useStrategySearch(): UseMediaSearchResult {
  const { strategies = [] } = useStrategies();

  const search = useSearch<Strategies>({
    data: strategies,
    filter: (s, q) => s.title.toLowerCase().includes(q.toLowerCase()),
    minQueryLength: 3,
  });

  return {
    results: search.results,
    isLoading: search.isLoading,
    error: search.error,
    hasSearched: search.hasSearched,
    query: search.query,
    search: search.search,
    clearResults: search.clearResults,
    retry: search.retry,
  };
}

