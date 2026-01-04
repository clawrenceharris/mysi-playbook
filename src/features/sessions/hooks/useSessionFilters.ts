import { useMemo, useState } from "react";
import { Sessions } from "@/types/tables";
import { SessionFilterState } from "@/components/features/sessions/SessionFilters";

export function useSessionFilters(sessions: Sessions[]) {
  const [filters, setFilters] = useState<SessionFilterState>({});

  const filteredSessions = useMemo(() => {
    return sessions.filter((session) => {
      // Status filter
      if (filters.status && !filters.status.includes(session.status)) {
        return false;
      }

      // Course filter
      if (filters.course && session.course_name) {
        if (filters.course !== session.course_name) {
          return false;
        }
      }

      // Time range filter
      if (filters.timeRange === "this-week" && session.scheduled_start) {
        const sessionDate = new Date(session.scheduled_start);
        const now = new Date();
        const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        if (sessionDate < now || sessionDate > weekFromNow) {
          return false;
        }
      }

      return true;
    });
  }, [sessions, filters]);

  const availableCourses = useMemo(() => {
    const courses = new Set<string>();
    sessions.forEach((session) => {
      if (session.course_name) {
        courses.add(session.course_name);
      }
    });
    return Array.from(courses).sort();
  }, [sessions]);

  return {
    filters,
    setFilters,
    filteredSessions,
    availableCourses,
  };
}
