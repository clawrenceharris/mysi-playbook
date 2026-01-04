import React, { useCallback, useMemo, useState } from "react";
import { Button } from "@/components/ui";
import { X } from "lucide-react";

import {
  HandoutConfig,
  PollVoteConfig,
  CollectInputConfig,
  DisplayPromptConfig,
  VariableDisplayConfig,
} from "./";

import {
  BlockConfig,
  BlockType,
  StrategyBlock,
  DisplayPromptConfig as DisplayPromptConfigType,
  CollectInputConfig as CollectInputConfigType,
  PollVoteConfig as PollVoteConfigType,
  HandoutConfig as HandoutConfigType,
  DisplayVariableConfig as VariableDisplayConfigType,
} from "@/features/playground";
import { cn } from "@/lib/utils";

export interface ConfigurationPanelProps {
  block: StrategyBlock;
  onBlockUpdate?: (id: string, updates: Partial<StrategyBlock>) => void;
  onClose?: () => void;
  className?: string;
}

export function ConfigurationPanel({
  onBlockUpdate,
  onClose,
  block,
  className,
}: ConfigurationPanelProps) {
  const [config, setConfig] = useState<BlockConfig>(block.config);
  const handleSave = () => {
    if (!config) return;
    onBlockUpdate?.(block.id, { config });
    onClose?.();
  };
  const handleChange = useCallback((newConfig: Partial<BlockConfig>) => {
    setConfig((prev) => ({ ...prev, ...newConfig }));
  }, []);

  const renderConfig = useMemo(() => {
    switch (block.type) {
      case BlockType.DISPLAY_PROMPT:
        return (
          <DisplayPromptConfig
            config={config as DisplayPromptConfigType}
            onChange={handleChange}
          />
        );
      case BlockType.COLLECT_INPUT:
        return (
          <CollectInputConfig
            config={config as CollectInputConfigType}
            onChange={handleChange}
          />
        );
      case BlockType.TIMER:
        return (
          <div className="text-muted-foreground">
            Timer configuration coming soon...
          </div>
        );
      case BlockType.POLL_VOTE:
        return (
          <PollVoteConfig
            config={config as PollVoteConfigType}
            onChange={handleChange}
          />
        );
      case BlockType.HANDOUT:
        return (
          <HandoutConfig
            config={config as HandoutConfigType}
            onChange={handleChange}
          />
        );
      case BlockType.DISPLAY_VARIABLE:
        return (
          <VariableDisplayConfig
            onChange={handleChange}
            config={config as VariableDisplayConfigType}
          />
        );

      default:
        return <div className="text-muted-foreground">Unknown block type</div>;
    }
  }, [block.type, config, handleChange]);

  return (
    <div className="relative flex-1 overflow-auto">
      <div className="sticky bg-white z-9 top-0 flex flex-row   items-center justify-between space-y-0 pb-2">
        <Button
          variant="default"
          size="icon"
          onClick={onClose}
          aria-label="Close"
          className="h-6 w-6"
        >
          <X className="h-4 w-4" />
        </Button>
        <Button variant="primary" onClick={handleSave} aria-label="Close">
          Apply Changes
        </Button>
      </div>
      <div
        data-testid="configuration-panel"
        className={cn("h-full", className)}
      >
        <div className="pt-2">
          <div className="mb-4">
            <p className="text-sm text-muted-foreground">
              {block?.type
                .replace("-", " ")
                .replace(/\b\w/g, (l) => l.toUpperCase())}
            </p>
          </div>

          {renderConfig}
        </div>
      </div>
    </div>
  );
}
