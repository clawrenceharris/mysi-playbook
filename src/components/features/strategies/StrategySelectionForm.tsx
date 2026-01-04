"use client";

import React, { useState } from "react";
import {
  Combobox,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui";

import { useStrategies } from "@/features/strategies/hooks";
import { EmptyState, LoadingState } from "@/components/states";
import { StrategyCard } from ".";
import { PlaybookStrategies, Strategies } from "@/types/tables";
import { ControllerRenderProps, useFormContext } from "react-hook-form";

interface StrategySelectionFieldProps {
  strategyToReplace: PlaybookStrategies;
}
export const StrategySelectionForm = ({
  strategyToReplace,
}: StrategySelectionFieldProps) => {
  const { control } = useFormContext<{ strategy: Strategies }>();
  const { strategies, isLoading: strategiesLoading } = useStrategies();

  const [selectedStrategy, setSelectedStrategy] = useState<Strategies | null>(
    () => {
      if (!strategies) return null;
      return (
        strategies.find(
          (strategy) => strategy.slug === strategyToReplace.slug
        ) ?? null
      );
    }
  );

  if (strategiesLoading) {
    return <LoadingState variant="container" />;
  }
  if (!strategies) {
    return <EmptyState />;
  }
  const handleStrategyReplace = (
    id: string,
    field: ControllerRenderProps<
      {
        strategy: Strategies;
      },
      "strategy"
    >
  ) => {
    if (id === strategyToReplace.id) return;
    const strategy = strategies.find((strategy) => strategy.id === id);
    if (!strategy) return;
    setSelectedStrategy(strategy);
    field.onChange(strategy);
  };

  return (
    <>
      <FormField
        control={control}
        name="strategy"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Strategy</FormLabel>
            <FormControl>
              <Combobox
                items={strategies.map((item) => ({
                  value: item.id,
                  label: item.title,
                }))}
                placeholder="Select a Strategy"
                onSelect={(value) => {
                  handleStrategyReplace(value, field);
                }}
              />
            </FormControl>
          </FormItem>
        )}
      />

      {selectedStrategy && (
        <HoverCard>
          <HoverCardTrigger>
            <StrategyCard
              strategy={selectedStrategy}
              showsSteps={false}
              headerClassName="rounded-xl"
              phase={strategyToReplace.phase}
              showActionButtons={false}
            />
          </HoverCardTrigger>
          <HoverCardContent
            side="top"
            className="w-[400px] p-0 rounded-2xl"
            align="center"
          >
            <StrategyCard
              headerClassName="hidden"
              showActionButtons={false}
              phase={strategyToReplace.phase}
              strategy={selectedStrategy}
            />
          </HoverCardContent>
        </HoverCard>
      )}
    </>
  );
};
