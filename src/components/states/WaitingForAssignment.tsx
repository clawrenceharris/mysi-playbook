import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Clock } from "lucide-react";

export interface WaitingForAssignmentProps {
  message?: string;
}

export function WaitingForAssignment({
  message,
}: WaitingForAssignmentProps = {}) {
  return (
    <Card className="shadow-none">
      <CardContent className="flex flex-col items-center justify-center py-12 space-y-4">
        <div className="icon-ghost">
          <Clock className="h-8 w-8 text-muted-foreground" />
        </div>
        <div className="text-center space-y-2">
          <h3 className="heading-md">Waiting for Assignments</h3>
          <p className="text-muted-foreground">
            {message || "The host will distribute assignments shortly"}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
