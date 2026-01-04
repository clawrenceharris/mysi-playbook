import React, { useMemo } from "react";
import type {
  StrategyBlock,
  HandoutConfig,
  PlaygroundContext,
} from "../domain/playground.types";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { interpolateVariable } from "../domain/variable-resolver";
import {
  distributeOnePerParticipant,
  distributeRoundRobin,
  distributeRandom,
  distributeExcludeOwn,
} from "../domain/distribution-algorithms";
import type {
  AssignmentItem,
  Participant,
  DistributionConfig,
  AssignmentMap,
  DistributionMode,
} from "../domain/distribution-engine.types";
import { AssignmentOverview } from "./AssignmentOverview";

export interface HandoutHostControlProps {
  block: StrategyBlock;
  slide: { id: string; title: string };
  ctx: PlaygroundContext;
  slug: string;
}

export function HandoutHostControl({
  block,
  slide,
  ctx,
  slug,
}: HandoutHostControlProps) {
  const config = block.config as HandoutConfig;
  const assignments = useMemo(
    () => ctx.state?.[slide.id]?.assignments,
    [ctx.state, slide.id]
  );

  const executeDistribution = (
    items: AssignmentItem[],
    participants: Participant[],
    distributionConfig: DistributionConfig
  ) => {
    let assignmentMap: AssignmentMap;
    // Execute distribution based on mode
    switch (config.distributionMode) {
      case "one-per-participant":
        assignmentMap = distributeOnePerParticipant(
          items,
          participants,
          distributionConfig
        );
        break;
      case "round-robin":
        assignmentMap = distributeRoundRobin(
          items,
          participants,
          distributionConfig
        );
        break;
      case "random":
        assignmentMap = distributeRandom(
          items,
          participants,
          distributionConfig
        );
        break;
      case "exclude-own":
        assignmentMap = distributeExcludeOwn(
          items,
          participants,
          distributionConfig
        );
        break;
      default:
        assignmentMap = distributeOnePerParticipant(
          items,
          participants,
          distributionConfig
        );
    }

    // Send event to create assignments
    ctx.call.sendCustomEvent({
      type: `${slug}:slide-state-update`,
      slideId: slide.id,
      accessor: "assignments",
      value: { ...assignmentMap },
    });
  };

  const handleAssign = () => {
    // Get items from data source
    const rawItems = interpolateVariable(config.dataSource, {
      state: ctx.state,
      userId: ctx.userId,
      isHost: true,
    });
    console.log({ rawItems });

    const items: AssignmentItem[] = Object.entries(rawItems)
      .map(([key, value]) =>
        typeof value === "string"
          ? ({
              content: value,
              authorId: key,
              id: crypto.randomUUID(),
            } as AssignmentItem)
          : null
      )
      .filter(Boolean) as AssignmentItem[];
    console.log({ items });

    
    if (items.length === 0) {
      return;
    }

    const participants: Participant[] = ctx.mockParticipants;
    console.log({ participants });
    

    const distributionConfig: DistributionConfig = {
      mode: config.distributionMode,
      mismatchHandling: config.mismatchHandling,
      excludeOwnResponses: config.distributionMode === "exclude-own",
      allowMultiplePerParticipant: true,
      allowEmptyAssignments: true,
    };
    executeDistribution(items, participants, distributionConfig);
  };

  const handleClearAndReassign = () => {
    ctx.call?.sendCustomEvent({
      type: `${slug}:slide-state-update`,
      slideId: slide.id,
      accessor: "assignments",
      value: null,
    });
  };

  if (!assignments) {
    return (
      <>
        <div className="flex items-center gap-2">
          <Select
            onValueChange={(value) =>
              (config.distributionMode = value as DistributionMode)
            }
            defaultValue={config.distributionMode}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="one-per-participant">
                One per participant
              </SelectItem>
              <SelectItem value="round-robin">Round robin</SelectItem>
              <SelectItem value="random">Random</SelectItem>
              <SelectItem value="exclude-own">Exclude own</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="ghost" size="sm" onClick={handleAssign}>
            Assign
          </Button>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <AssignmentOverview assignmentMap={assignments} />
        <Button variant="ghost" size="sm" onClick={handleClearAndReassign}>
          Clear & Reassign
        </Button>
      </div>
    </>
  );
}
