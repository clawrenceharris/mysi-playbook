import React from "react";
import {
  Button,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui";
import { FileText, Play, Plus } from "lucide-react";
import { usePlayground } from "@/providers";
import { PlaybookStrategies } from "@/types/tables";

export type ToolbarContext =
  | "slide-empty"
  | "slide-content"
  | "block-selected"
  | "text-editing";

export interface FormattingAction {
  type: "bold" | "italic" | "heading" | "list" | "link";
  value?: string;
}

export interface ContextualToolbarProps {
  onTemplateClick: () => void;
  onPreviewClick: () => void;
  onPhaseChange: (phase: PlaybookStrategies["phase"]) => void;
  onSlideAdd: () => void;
}

export function PlaygroundMenubar({
  onPreviewClick,
  onPhaseChange,
  onTemplateClick,
  onSlideAdd,
}: ContextualToolbarProps) {
  const { setTitle, slides, title } = usePlayground();
  return (
    <div className="p-3 bg-white border-b rounded-t-xl w-full items-center justify-between flex">
      <div className="flex gap-2 items-center">
        <Button
          data-testid="add-slide-button"
          variant="outline"
          size="icon"
          onClick={() => onSlideAdd()}
          title="Add new slide"
        >
          <Plus />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => onTemplateClick()}
          title="Load activity template"
        >
          <FileText />
        </Button>
        <Button
          onClick={() => onPreviewClick()}
          variant="outline"
          size="icon"
          className="disabled:cursor-not-allowed"
          disabled={slides.length === 0}
          title="Preview activity"
        >
          <Play />
        </Button>
        <Input
          value={title}
          className="!bg-transparent !p-3 border-1 shadow-none"
          placeholder="Enter Strategy Ttle"
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>
      <Select onValueChange={onPhaseChange} defaultValue={"0"}>
        <SelectTrigger className="!bg-transparent border-1 shadow-none">
          <SelectValue placeholder="warmup" />
        </SelectTrigger>
        <SelectContent>
          {[0, 1, 2].map((positon) => (
            <SelectItem value={positon.toString()} key={positon}>
              {positon === 1 ? "workout" : positon === 2 ? "closer" : "warmup"}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
