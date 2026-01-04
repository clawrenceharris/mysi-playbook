import React from "react";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
} from "@/components/ui";
import { cn } from "@/lib/utils";
import { PlaybookStrategies } from "@/types/tables";
import { getCardBackgroundColor, getCardIcon } from "@/utils";

interface VirtualStrategyCardProps {
  strategy: PlaybookStrategies;
  onAction?: () => void;
  description?: string;
  actionLabel?: string;
  showsDescription?: boolean;
}

export const VirtualStrategyCard = ({
  strategy,
  actionLabel,
  description,
  showsDescription = true,
  onAction,
}: VirtualStrategyCardProps) => {
  return (
    <Card className="strategy-card flex-1 p-0 relative rounded-2xl border border-border shadow-md bg-card text-card-foreground transition-transform">
      <CardHeader
        className={cn(
          `flex relative text-background items-center p-3 gap-6 rounded-tl-2xl rounded-tr-2xl`,
          `${getCardBackgroundColor(strategy.phase)}`
        )}
      >
        <div className="min-w-[40px] min-h-[40px] bg-foreground/20 rounded-full flex items-center justify-center">
          {getCardIcon(strategy.phase)}
        </div>
        <div className="w-full">
          <div>
            <h2 className="font-bold text-xl">{strategy.title} </h2>
          </div>
          <div className="flex items-center  justify-between">
            <span className="uppercase font-light text-background/70 text-sm">
              {strategy.phase}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {showsDescription && (
          <CardDescription>
            <p className="text-muted-foreground bg-muted text-center rounded-xl py-3 px-5 text-sm">
              {description || strategy.description}
            </p>
          </CardDescription>
        )}
      </CardContent>
      {onAction && actionLabel && (
        <CardFooter className="p-6 w-full flex justify-end">
          <Button onClick={onAction}>{actionLabel}</Button>
        </CardFooter>
      )}
    </Card>
  );
};
