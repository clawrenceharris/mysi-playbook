import { Sessions } from "@/types/tables";
import { useSearch } from "@/hooks/useSearch";

export function useSessionSearch(sessions: Sessions[]) {
  const search = useSearch<Sessions>({
    data: sessions,
    filter: (s, q) =>
      (!!s.topic && s.topic.toLowerCase().includes(q.toLowerCase())) ||
      (!!s.course_name &&
        s.course_name.toLowerCase().includes(q.toLowerCase())) ||
      (!!s.description &&
        s.description.toLowerCase().includes(q.toLowerCase())),
    minQueryLength: 1,
    debounceMs: 200,
  });

  return search;
}
