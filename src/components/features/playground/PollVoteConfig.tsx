import React from "react";
import { Label, Input, Checkbox } from "@/components/ui";
import {
  generateVariableName,
  PollVoteConfig as PollVoteConfigType,
} from "@/features/playground/domain";

export interface PollVoteConfigProps {
  config: PollVoteConfigType;
  onChange: (config: PollVoteConfigType) => void;
}

export function PollVoteConfig({ config, onChange }: PollVoteConfigProps) {
  const handleSaveToSharedStateChange = (checked: boolean) => {
    const updates: Partial<PollVoteConfigType> = {
      saveToSharedState: checked,
    };

    if (checked && !config.variableName) {
      updates.variableName = generateVariableName(config.question);
    }

    onChange({ ...config, ...updates });
  };

  const handleVariableNameChange = (value: string) => {
    onChange({ ...config, variableName: value });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="question">Question</Label>
        <Input
          id="question"
          value={config.question}
          onChange={(e) => onChange({ ...config, question: e.target.value })}
        />
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="saveToSharedState"
          checked={config.saveToSharedState || false}
          onCheckedChange={handleSaveToSharedStateChange}
        />
        <Label htmlFor="saveToSharedState">Save to shared state</Label>
      </div>

      {config.saveToSharedState && (
        <div className="space-y-2">
          <Label htmlFor="variableName">Variable Name</Label>
          <Input
            id="variableName"
            value={config.variableName || ""}
            onChange={(e) => handleVariableNameChange(e.target.value)}
          />
        </div>
      )}
    </div>
  );
}
