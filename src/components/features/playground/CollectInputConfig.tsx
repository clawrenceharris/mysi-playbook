import React from "react";
import { Label, Input } from "@/components/ui";
import type { CollectInputConfig as CollectInputConfigType } from "@/features/playground/domain/playground.types";

export interface CollectInputConfigProps {
  config: CollectInputConfigType;
  onChange: (config: CollectInputConfigType) => void;
}

export function CollectInputConfig({
  config,
  onChange,
}: CollectInputConfigProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="question">Question</Label>
        <Input
          id="question"
          value={config.content || ""}
          onChange={(e) => onChange({ ...config, content: e.target.value })}
        />
      </div>
    </div>
  );
}
