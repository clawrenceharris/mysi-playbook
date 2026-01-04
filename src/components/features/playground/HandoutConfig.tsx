import React, { useCallback } from "react";
import {
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Checkbox,
  FormItem,
} from "@/components/ui";
import {
  type HandoutConfig as HandoutConfigType,
  type DistributionMode,
  type MismatchHandling,
} from "@/features/playground";
import { DataReferenceSelector, type SlideInfo } from "./DataReferenceSelector";
import { usePlayground } from "@/providers";
import { DataReference } from "@/features/playground/domain/data-reference";

export interface HandoutConfigProps {
  config: HandoutConfigType;
  onChange: (config: Partial<HandoutConfigType>) => void;
}

export function HandoutConfig({ config, onChange }: HandoutConfigProps) {
  const { slides } = usePlayground();

  const availableSlides: SlideInfo[] = slides.map((slide) => ({
    id: slide.id,
    title: slide.title,
    order: slide.order,
  }));

  const handleDataReferenceChange = useCallback(
    (reference: DataReference) => {
      onChange({ dataSource: reference });
    },
    [onChange]
  );

  return (
    <div className="space-y-4">
      <DataReferenceSelector
        value={config.dataSource}
        onChange={handleDataReferenceChange}
        availableSlides={availableSlides}
        placeholder="Select data source for items to assign"
      />

      <FormItem>
        <Label htmlFor="distributionMode">Distribution Mode</Label>
        <Select
          value={config.distributionMode}
          onValueChange={(value) =>
            onChange({ distributionMode: value as DistributionMode })
          }
        >
          <SelectTrigger id="distributionMode">
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
        <p className="text-xs text-muted-foreground mt-1">
          {config.distributionMode === "one-per-participant" &&
            "Each participant gets exactly one item"}
          {config.distributionMode === "round-robin" &&
            "Items distributed evenly in order"}
          {config.distributionMode === "random" &&
            "Items shuffled before distribution"}
          {config.distributionMode === "exclude-own" &&
            "Participants won&apos;t receive their own items"}
        </p>
      </FormItem>

      <FormItem>
        <Label htmlFor="mismatchHandling">Mismatch Handling</Label>
        <Select
          value={config.mismatchHandling}
          onValueChange={(value) =>
            onChange({ mismatchHandling: value as MismatchHandling })
          }
        >
          <SelectTrigger id="mismatchHandling">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="auto">Auto (distribute evenly)</SelectItem>
            <SelectItem value="manual">Manual (prompt host)</SelectItem>
            <SelectItem value="strict">Strict (require exact match)</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground mt-1">
          How to handle when items don&apos;t match participant count
        </p>
      </FormItem>

      <div className="space-y-3 pt-2 border-t">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="showAuthor"
            checked={config.showAuthor}
            onCheckedChange={(checked) =>
              onChange({ showAuthor: checked as boolean })
            }
          />
          <Label htmlFor="showAuthor">Show author information</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="allowParticipantResponse"
            checked={config.allowParticipantResponse}
            onCheckedChange={(checked) =>
              onChange({ allowParticipantResponse: checked as boolean })
            }
          />
          <Label htmlFor="allowParticipantResponse">
            Allow participant responses
          </Label>
        </div>

        {config.allowParticipantResponse && (
          <FormItem className="ml-6">
            <Label htmlFor="responsePrompt">Response Prompt</Label>
            <Input
              id="responsePrompt"
              value={config.responsePrompt || ""}
              onChange={(e) => onChange({ responsePrompt: e.target.value })}
              placeholder="Enter your response..."
            />
          </FormItem>
        )}

        <div className="flex items-center space-x-2">
          <Checkbox
            id="allowReassignment"
            checked={config.allowReassignment}
            onCheckedChange={(checked) =>
              onChange({ allowReassignment: checked as boolean })
            }
          />
          <Label htmlFor="allowReassignment">Allow reassignment</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="showDistributionPreview"
            checked={config.showDistributionPreview}
            onCheckedChange={(checked) =>
              onChange({ showDistributionPreview: checked as boolean })
            }
          />
          <Label htmlFor="showDistributionPreview">
            Show distribution preview
          </Label>
        </div>
      </div>
    </div>
  );
}
