"use client";
import React, { useMemo } from "react";
import { PlaybookCard, PlaybookFilters } from "@/components/features/playbooks";
import { EmptyState, ErrorState } from "@/components/states";
import { Button, SearchBar, Skeleton } from "@/components/ui";
import { usePlaybookActions, usePlaybooks } from "@/features/playbooks/hooks";
import { usePlaybookFilters } from "@/features/playbooks/hooks";
import { useUser } from "@/providers";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { usePlaybookSearch } from "@/features/playbooks/hooks";

export default function PlaybooksPage() {
  const router = useRouter();
  const { user } = useUser();
  const query = useMemo(() => ({ userId: user.id }), [user.id]);
  const { data: playbooks = {}, isLoading, error } = usePlaybooks(query);
  const { createPlaybook } = usePlaybookActions();
  const { filters, setFilters, filteredPlaybooks, availableCourses } =
    usePlaybookFilters(Object.values(playbooks));

  // Search
  const playbooksSearch = usePlaybookSearch(Object.values(playbooks));

  const visiblePlaybooks = playbooksSearch.hasSearched
    ? filteredPlaybooks.filter((pb) =>
        playbooksSearch.results.some((r) => r.id === pb.id)
      )
    : filteredPlaybooks;

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
    return (
      <>
        <ErrorState
          variant="card"
          message="There was an error finding your Playbooks"
        />
      </>
    );
  }
  if (Object.keys(playbooks).length === 0) {
    return (
      <>
        <EmptyState
          actionLabel="Create Playbook"
          onAction={createPlaybook}
          variant="card"
          message="You don't have any Playbooks at the moment."
        />
      </>
    );
  }
  return (
    <>
      <header className="header ">
        <div className="header-top">
          <h1>Playbooks</h1>
          <Button
            className="bg-secondary-foreground hover:bg-muted"
            variant="ghost"
            onClick={() => router.push("/playbooks/create")}
          >
            <Plus />
            Create Playbook
          </Button>
        </div>
        <div className="header-bottom">
          <SearchBar
            value={playbooksSearch.query}
            onChange={playbooksSearch.search}
            onClear={playbooksSearch.clearResults}
          />
          <PlaybookFilters
            filters={filters}
            onFilterChange={setFilters}
            availableCourses={availableCourses}
          />
        </div>
      </header>
      <div className="container">
        {visiblePlaybooks.length === 0 ? (
          <EmptyState
            variant="inline"
            title="No Results"
            message="No playbooks match your search or filters."
            actionLabel={
              playbooksSearch.hasSearched ? "Clear Search" : "Clear Filters"
            }
            className="border-none"
            onAction={() => {
              if (playbooksSearch.hasSearched) playbooksSearch.clearResults();
              else setFilters({});
            }}
          />
        ) : (
          <div className="p-2 rounded-xl border overflow-auto">
            <div className="flex flex-col">
              {visiblePlaybooks.map((playbook) => (
                <PlaybookCard
                  key={playbook.id}
                  onNavigate={() => router.push(`/playbooks/${playbook.id}`)}
                  playbook={playbook}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
