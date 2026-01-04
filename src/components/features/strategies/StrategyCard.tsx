import React, { forwardRef, HTMLAttributes, ReactNode } from "react";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui";
import { PlaybookStrategies, Strategies } from "@/types/tables";
import { cn } from "@/lib/utils";
import { getCardBackgroundColor, getCardIcon } from "@/utils";
import { Bookmark, ListRestart, Wand2 } from "lucide-react";
import clsx from "clsx";

interface StrategyCardProps extends HTMLAttributes<HTMLDivElement> {
  strategy: Strategies | PlaybookStrategies;
  phase?: PlaybookStrategies["phase"];
  onClick?: () => void;
  children?: ReactNode;
  headerClassName?: string;
  onEnhanceClick?: () => void;
  showActionButtons?: boolean;
  onReplaceClick?: () => void;
  showsSteps?: boolean;
  onSaveClick?: () => void;
  isSaved?: boolean;
}

export const CardGhost = ({
  phase,
}: {
  phase: PlaybookStrategies["phase"];
}) => {
  return (
    <div className="rounded-2xl border bg-card text-card-foreground shadow-lg p-4 opacity-90 transform-gpu">
      <div
        className={`h-10 ${getCardBackgroundColor(phase)} rounded-md mb-3`}
      />
      <div className="space-y-2">
        <div className="h-3 bg-muted rounded" />
        <div className="h-3 bg-muted rounded" />
        <div className="h-3 bg-muted rounded" />
      </div>
    </div>
  );
};

// eslint-disable-next-line react/display-name
export const StrategyCard = forwardRef<HTMLDivElement, StrategyCardProps>(
  (
      {
        onClick,
        headerClassName,
        showActionButtons = true,
        onReplaceClick,
        onEnhanceClick,
        phase,
        showsSteps = true,
        children,
        strategy,
        className,
        onSaveClick,
        isSaved = false,
        ...props
      }: StrategyCardProps,
      ref
    ) => {
    return (
      <Card
        ref={ref}
        onClick={onClick}
        className={cn(
          `strategy-card p-0 relative rounded-2xl border border-border shadow-md
                     bg-card text-card-foreground transition-transform mx-auto w-full max-w-[480px]`,
          className
        )}
        {...props}
      >
        <CardHeader
          className={cn(
            ` relative text-background items-center p-3 gap-3 rounded-tl-2xl rounded-tr-2xl`,
            `${phase && getCardBackgroundColor(phase)}`,
            headerClassName
          )}
        >
          <div className="flex gap-4 items-center">
            <div className="icon-ghost bg-foreground/20 rounded-full flex items-center justify-center">
              {phase && getCardIcon(phase)}
            </div>
            <div className="w-full">
              <div>
                <CardTitle
                  title={strategy.title}
                  className="font-bold text-xl line-clamp-1"
                >
                  {strategy.title}
                </CardTitle>
                <span className="uppercase font-light text-background/70 text-sm">
                  {phase}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between">
            {showActionButtons && (
              <div className="flex">
                <Tooltip>
                  <TooltipContent>Replace</TooltipContent>
                  <TooltipTrigger asChild>
                    <Button
                      className="rounded-full"
                      variant={"ghost"}
                      size={"icon"}
                      aria-label="Replace strategy"
                      onClick={onReplaceClick}
                    >
                      <ListRestart />
                    </Button>
                  </TooltipTrigger>
                </Tooltip>

                <Tooltip>
                  <TooltipContent>{isSaved ? "Unsave" : "Save"}</TooltipContent>
                  <TooltipTrigger asChild>
                    <Button
                      className="rounded-full"
                      variant={"ghost"}
                      size={"icon"}
                      aria-label={isSaved ? "Unsave strategy" : "Save strategy"}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSaveClick?.();
                      }}
                    >
                      <Bookmark
                        className={cn(isSaved && "fill-current")}
                      />
                    </Button>
                  </TooltipTrigger>
                </Tooltip>
                <Tooltip>
                  <TooltipContent color="white">AI Enhance</TooltipContent>
                  <TooltipTrigger asChild>
                    <Button
                      className="rounded-full"
                      variant={"ghost"}
                      onClick={onEnhanceClick}
                      size={"icon"}
                      aria-label="Enhance with AI"
                    >
                      <Wand2 />
                    </Button>
                  </TooltipTrigger>
                </Tooltip>
              </div>
            )}
          </div>
        </CardHeader>
        {showsSteps && (
          <CardContent className="p-6">
            <ol className="text-foreground/80 space-y-4">
              {strategy.steps.map((s: string, i: number) => (
                <li className="flex items-center gap-1 " key={i}>
                  <div
                    className={`text-pr min-w-7 min-h-7  rounded-full items-center justify-center flex ${clsx(
                      {
                        "text-success-500 bg-success-100": phase === "warmup",
                        "text-secondary-500 bg-secondary-100":
                          phase === "workout",
                        "text-accent-400 bg-accent-100": phase === "closer",
                      }
                    )}`}
                  >
                    <span>{i + 1}</span>
                  </div>

                  <p className="p-3 rounded-md max-w-sm">{s}</p>
                </li>
              ))}
            </ol>
          </CardContent>
        )}
        {children}
      </Card>
    );
  }
);
