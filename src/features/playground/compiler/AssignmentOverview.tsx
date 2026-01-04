import React from "react";
import type { AssignmentMap } from "../domain/distribution-engine.types";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";

export interface AssignmentOverviewProps {
  assignmentMap: AssignmentMap;
}

export function AssignmentOverview({ assignmentMap }: AssignmentOverviewProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Badge variant="default">Assigned</Badge>
        <span className="text-sm text-muted-foreground">
          {assignmentMap.items.length} items →{" "}
          {assignmentMap.participants.length} participants
        </span>
      </div>

      <div className="space-y-2">
        {assignmentMap.participants.map((participant) => {
          const assignedItems = assignmentMap.assignments[participant.id] || [];

          return (
            <div
              key={participant.id}
              className="flex items-center gap-3 p-2 border rounded"
            >
              <Avatar>{participant.name[0]}</Avatar>
              <span className="font-medium">{participant.name}</span>
              <span className="text-muted-foreground">→</span>
              <div className="flex gap-1 flex-wrap">
                {assignedItems.length > 0 ? (
                  assignedItems.map((item) => (
                    <span
                      key={item.id}
                      className="text-sm px-2 py-1 bg-secondary rounded"
                    >
                      {typeof item.content === "string"
                        ? item.content.substring(0, 30)
                        : JSON.stringify(item.content).substring(0, 30)}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-muted-foreground">
                    No assignment
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
