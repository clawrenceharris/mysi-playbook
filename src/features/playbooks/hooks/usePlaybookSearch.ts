import { Playbooks } from "@/types/tables";
import { useSearch } from "@/hooks/useSearch";

export function usePlaybookSearch(playbooks: Playbooks[]) {
  const search = useSearch<Playbooks>({
    data: playbooks,
    filter: (p, q) =>
      (!!p.topic && p.topic.toLowerCase().includes(q.toLowerCase())) ||
      (!!p.course_name &&
        p.course_name.toLowerCase().includes(q.toLowerCase())),
    debounceMs: 200,
  });

  return search;
}
