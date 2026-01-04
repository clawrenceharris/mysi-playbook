"use client";

import { SessionCard, SessionFilters } from "@/components/features/sessions";
import { EmptyState, ErrorState } from "@/components/states";
import { Button, SearchBar, Skeleton } from "@/components/ui";
import { useSessionFilters, useSessions } from "@/features/sessions/hooks";
import { useSessionActions } from "@/features/sessions/hooks";
import { useUser } from "@/providers";
import { Plus } from "lucide-react";
import { useSessionSearch } from "@/features/sessions/hooks";
import { cn } from "@/lib/utils";

export default function SessionsPage() {
  const { user } = useUser();
  const { isLoading, sessions, error } = useSessions(user.id);
  const { createSession } = useSessionActions();
  const { filters, setFilters, filteredSessions, availableCourses } =
    useSessionFilters(Object.values(sessions));

  // Search
  const sessionsSearch = useSessionSearch(Object.values(sessions));

  const visibleSessions = sessionsSearch.hasSearched
    ? filteredSessions.filter((pb) =>
        sessionsSearch.results.some((r) => r.id === pb.id)
      )
    : filteredSessions;

  if (isLoading) {
    return (
      <>
        <div className="header">
          <Skeleton className="w-60 h-7 rounded-full" />
          <Skeleton className="w-20 h-7 rounded-full" />
        </div>

        <div className="container">
          <Skeleton className="w-full max-w-140 h-10 rounded-full" />
          <div className="flex items-center gap-3">
            <Skeleton className="w-20 h-8 rounded-full" />
            <Skeleton className="w-20 h-8 rounded-full" />
            <Skeleton className="w-20 h-8 rounded-full" />

            <Skeleton className="w-20 h-8 rounded-full" />
          </div>
          <div className="grid cols-auto grid-cols-2 md:grid-cols-3 gap-6 max-w-[500px] md:max-w-[750px] w-full">
            <Skeleton className="h-50 w-full max-w-[250px] rounded-xl" />
            <Skeleton className="h-50 w-full ma-w-[250px] rounded-xl" />
            <Skeleton className="h-50 w-full max-w-[250px] rounded-xl" />
            <Skeleton className="h-50 w-full  max-w-[250px] rounded-xl" />
            <Skeleton className="h-50 w-full max-w-[250px] rounded-xl" />
            <Skeleton className="h-50 w-full max-w-[250px] rounded-xl" />
          </div>
        </div>
      </>
    );
  }
  if (error) {
    return <ErrorState variant="card" />;
  }
  return (
    <>
      <header className="header">
        <div className="header-top">
          <h1>Sessions</h1>
          <div className="flex gap-4 items-center">
            <Button
              className="bg-secondary-foreground hover:bg-muted"
              variant="ghost"
              onClick={() => createSession()}
            >
              <Plus />
              Create Session
            </Button>
          </div>
        </div>
        <div className="header-bottom">
          <SearchBar
            value={sessionsSearch.query}
            onChange={sessionsSearch.search}
            onClear={sessionsSearch.clearResults}
          />
          <SessionFilters
            filters={filters}
            onFilterChange={setFilters}
            availableCourses={availableCourses}
          />
        </div>
      </header>

      <div className="container pt-6">
        <div
          className={cn(
            "rounded-xl overflow-auto",
            visibleSessions.length > 0 ? "faded-col" : ""
          )}
        >
          {visibleSessions.length === 0 ? (
            <div className="h-full max-h-20 m-auto">
              <EmptyState
                variant="inline"
                message="No sessions match your search or filters."
                actionLabel={
                  sessionsSearch.hasSearched ? "Clear Search" : "Clear Filters"
                }
                className="border-none"
                onAction={() => {
                  if (sessionsSearch.hasSearched) sessionsSearch.clearResults();
                  else setFilters({});
                }}
              />
            </div>
          ) : (
            <div className="grid py-7 justify-items-center grid-cols-[repeat(auto-fill,minmax(350px,1fr))] gap-4">
              {visibleSessions.map((session) => (
                <SessionCard key={session.id} session={session} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
