import React from "react";
import { Card, CardContent } from "@/components/ui/card";

import type { AssignmentItem } from "@/features/playground/domain/distribution-engine.types";

export interface AssignedItemCardProps {
  item: AssignmentItem;
}

export function AssignedItemCard({ item }: AssignedItemCardProps) {
  const renderContent = () => {
    if (typeof item.content === "string") {
      return <p className="text-foreground">{item.content}</p>;
    }
    if (typeof item.content === "object" && item.content !== null) {
      return <p className="text-foreground">{JSON.stringify(item.content)}</p>;
    }
    return <p className="text-muted-foreground">No content</p>;
  };

  return (
    <Card className="shadow-none">
      <CardContent className="pt-6 space-y-4">
        <div className="space-y-2">{renderContent()}</div>
      </CardContent>
    </Card>
  );
}
