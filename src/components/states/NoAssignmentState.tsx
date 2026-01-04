import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Inbox } from "lucide-react";

export function NoAssignmentState() {
  return (
    <Card className="shadow-none">
      <CardContent className="flex flex-col items-center justify-center py-12 space-y-4">
        <div className="icon-ghost">
          <Inbox className="h-8 w-8 text-muted-foreground" />
        </div>
        <div className="text-center space-y-2">
          <h3 className="heading-md">No Assignments</h3>
          <p className="text-muted-foreground">
            You don&apos;t have any items assigned at this time
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
