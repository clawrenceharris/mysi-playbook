import { useMemo, useState } from "react";
import { Playbooks } from "@/types/tables";
import { PlaybookFilterState } from "@/components/features/playbooks";

export function usePlaybookFilters(playbooks: Playbooks[]) {
  const [filters, setFilters] = useState<PlaybookFilterState>({});

  const filteredPlaybooks = useMemo(() => {
    return playbooks.filter((playbook) => {
      // Status filter
      if (filters.favorite && !playbook.favorite) {
        return false;
      }

      // Course filter
      if (filters.course && !playbook.course_name) {
        return false;
      }
      if (filters.course && filters.course !== playbook.course_name) {
        return false;
      }

      // Recent filter
      if (filters.recent && playbook.created_at) {
        const sessionDate = new Date(playbook.created_at);
        const now = new Date();
        const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        if (sessionDate < lastWeek && sessionDate > now) {
          return false;
        }
      }

      return true;
    });
  }, [playbooks, filters]);

  const availableCourses = useMemo(() => {
    const courses = new Set<string>();
    playbooks.forEach((session) => {
      if (session.course_name) {
        courses.add(session.course_name);
      }
    });
    return Array.from(courses).sort();
  }, [playbooks]);

  return {
    filters,
    setFilters,
    filteredPlaybooks,
    availableCourses,
  };
}
