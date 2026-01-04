"use client";
import React, { useCallback, useEffect, useMemo, useState } from "react";

import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Skeleton,
} from "@/components/ui";
import {
  DndContext,
  closestCenter,
  useSensor,
  useSensors,
  PointerSensor,
  DragOverlay,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  rectSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { ErrorState } from "@/components/states";

import {
  restrictToFirstScrollableAncestor,
  restrictToWindowEdges,
} from "@dnd-kit/modifiers";
import { useIsMobile } from "@/hooks/useIsMobile";

import moment from "moment";
import {
  CardGhost,
  SortableStrategyCard,
} from "@/components/features/strategies";
import { Check, MoreVertical, Plus } from "lucide-react";
import {
  usePlaybook,
  usePlaybookActions,
  usePlaybookState,
} from "@/features/playbooks/hooks";
import { PlaybookStrategies } from "@/types";
import { useSessionActions } from "@/features/sessions/hooks";
import { useStrategyActions, useStrategies } from "@/features/strategies/hooks";
import { DeleteIcon, PlaybookIcon, PlusIcon } from "@/components/icons";
const phaseOrder = { warmup: 0, workout: 1, closer: 2 };

export default function PlaybookPage({ playbookId }: { playbookId: string }) {
  const isMobile = useIsMobile();

  const { createSession } = useSessionActions();
  const { playbook, reorderStrategies, isLoading } = usePlaybook(playbookId);
  const [strategies, setStrategies] = useState<PlaybookStrategies[]>([]);

  const [activeId, setActiveId] = useState<string | null>(null);
  const { replaceStrategy, deletePlaybook, enhanceStrategy } =
    usePlaybookActions(playbookId);
  const { toggleSave } = useStrategyActions();
  const { strategies: allStrategies } = useStrategies();

  // Map playbook strategies to their base strategy IDs for save functionality
  const strategyIdMap = useMemo(() => {
    const map = new Map<string, string>();
    if (allStrategies && strategies.length > 0) {
      strategies.forEach((ps) => {
        const baseStrategy = allStrategies.find((s) => s.slug === ps.slug);
        if (baseStrategy) {
          map.set(ps.id, baseStrategy.id);
        }
      });
    }
    return map;
  }, [allStrategies, strategies]);

  const getSavedStatus = useCallback(
    (strategy: PlaybookStrategies) => {
      const baseStrategyId = strategyIdMap.get(strategy.id);
      if (!baseStrategyId) return false;
      // We'd need to check saved status, but for now return false
      // This could be enhanced with a query for saved strategies
      return false;
    },
    [strategyIdMap]
  );

  const handleSaveStrategy = useCallback(
    async (strategy: PlaybookStrategies) => {
      const baseStrategyId = strategyIdMap.get(strategy.id);
      if (!baseStrategyId) return;
      const isSaved = getSavedStatus(strategy);
      await toggleSave(baseStrategyId, isSaved);
    },
    [strategyIdMap, getSavedStatus, toggleSave]
  );

  const { lastUpdate, hasSession, isSaving } = usePlaybookState(playbookId);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );
  useEffect(() => {
    if (playbook) {
      setStrategies(playbook.strategies);
    }
  }, [playbook]);
  const sortedStrategies = useMemo(
    () => strategies.sort((a, b) => phaseOrder[a.phase] - phaseOrder[b.phase]),
    [strategies]
  );

  const handleReorderStrategies = useCallback(
    (oldIndex: number, newIndex: number) => {
      const next = arrayMove(sortedStrategies, oldIndex, newIndex).map(
        (c, i) => ({
          ...c,
          phase: Object.keys(phaseOrder)[i] as PlaybookStrategies["phase"],
        })
      );
      reorderStrategies({ playbookId, strategies: next });
      setStrategies(next);
    },
    [sortedStrategies, reorderStrategies, playbookId]
  );
  if (isLoading) {
    return (
      <>
        <header className="header flex-col z-99 md:items-start shadow-md justify-between">
          <div className="space-y-2">
            <Skeleton className="h-7 w-60 rounded-full" />
            <Skeleton className="h-4 w-30 rounded-full" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="size-9 rounded-full" />
            <Skeleton className="size-9 rounded-full" />
          </div>
        </header>

        <div className="container flex flex-col gap-4 mt-4 max-w-[1080px] mx-auto">
          <div className="flex flex-col lg:flex-row gap-4  w-full ">
            <Skeleton className="h-[400px] mx-auto w-full max-w-[380px] rounded-2xl" />
            <Skeleton className="h-[400px] mx-auto w-full max-w-[380px] rounded-2xl" />
            <Skeleton className="h-[400px] mx-auto w-full max-w-[380px] rounded-2xl" />
          </div>
        </div>
      </>
    );
  }

  if (!playbook) {
    return (
      <ErrorState variant="card" message="This lesson could not be found." />
    );
  }

  return (
    <>
      <header className="header flex-col items-start">
        <div className="header-bottom space-y-5">
          <div className="flex items-center gap-3">
            <div className="size-20 group rounded-sm flex items-center justify-center  [&_path]:stroke-muted-foreground bg-primary-foreground border ">
              <PlaybookIcon className="group-hover:scale-[1.2] transition-all duration-200" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-semibold gap-3 flex items-center">
                  {playbook.topic}
                </h1>
              </div>
              <div className="flex gap-3 items-center">
                {lastUpdate && (
                  <p className="text-muted-foreground text-sm">
                    {isSaving
                      ? "Saving..."
                      : `Saved ${moment(lastUpdate)
                          .fromNow()
                          .replace("a few seconds ago", "just now")}`}
                  </p>
                )}
                {hasSession && (
                  <span className="text-success-500 flex items-center gap-1 rounded-full pl-1 pr-2 py-1 text-xs bg-success-100">
                    <Check
                      size={15}
                      className="p-0.5 bg-success-500 text-white border-white  rounded-full"
                    />{" "}
                    Session Created{" "}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 justify-end">
            <Button onClick={createSession}>
              <Plus /> Create Session
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="icon" variant="outline" onClick={deletePlaybook}>
                  <MoreVertical />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>
                  <PlusIcon /> Publish
                </DropdownMenuItem>
                <DropdownMenuItem variant="destructive">
                  <DeleteIcon /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
      <div className="container">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          modifiers={[restrictToFirstScrollableAncestor, restrictToWindowEdges]}
          onDragStart={({ active }) => {
            setActiveId(String(active.id));
            document.body.style.overscrollBehavior = "contain";
            document.body.style.cursor = "grabbing";
          }}
          onDragEnd={({ active, over }) => {
            document.body.style.overscrollBehavior = "";
            document.body.style.cursor = "";
            setActiveId(null);

            if (!over || active.id === over.id) return;
            const oldIndex = strategies.findIndex((c) => c.id === active.id);
            const newIndex = strategies.findIndex((c) => c.id === over.id);
            handleReorderStrategies(oldIndex, newIndex);
          }}
          onDragCancel={() => {
            document.body.style.overscrollBehavior = "";
            document.body.style.cursor = "";
            setActiveId(null);
          }}
        >
          <SortableContext
            items={strategies}
            strategy={
              isMobile ? verticalListSortingStrategy : rectSortingStrategy
            }
          >
            <ul className="flex flex-col xl:flex-row gap-6  w-full  mx-auto">
              {sortedStrategies.map((strategy) => (
                <SortableStrategyCard
                  onReplaceClick={() => replaceStrategy(strategy)}
                  key={strategy.id}
                  onEnhanceClick={async () => enhanceStrategy(strategy.id)}
                  onSaveClick={() => handleSaveStrategy(strategy)}
                  isSaved={getSavedStatus(strategy)}
                  strategy={strategy}
                />
              ))}
            </ul>
          </SortableContext>

          {/*This lifts the dragged card out of the layout for buttery effect */}
          <DragOverlay dropAnimation={{ duration: 150 }}>
            {activeId ? (
              <CardGhost
                phase={strategies.find((c) => c.id === activeId)!.phase}
              />
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </>
  );
}
