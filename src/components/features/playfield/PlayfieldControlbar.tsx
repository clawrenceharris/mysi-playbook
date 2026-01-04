import { usePlaybook } from "@/features/playbooks/hooks";
import { PlayfieldDefinition } from "@/types/playbook";
import { useMemo } from "react";
import { LoadingState } from "@/components/states";
import { PlaybookStrategies, Sessions } from "@/types/tables";
import { Button } from "@/components/ui";
import { getCardBackgroundColor, getCardIcon } from "@/utils";
import { cn } from "@/lib/utils";
import { Play, Squircle, X } from "lucide-react";
import { usePlayfield } from "@/providers";
import { useStreamCall } from "@/hooks";

interface PlayfieldPreviewProps {
  strategyDef: PlayfieldDefinition;
  session: Sessions;
  onJoin: () => void;
  onLeave: () => void;
  onEnd: () => void;
}

function StrategyInfo({ strategy }: { strategy: PlaybookStrategies }) {
  return (
    <div className="flex items-center gap-2 md:gap-4 w-full">
      <div className="icon-ghost mr-1">{getCardIcon(strategy.phase)}</div>
      <div className="w-full">
        <h2 className="font-bold text-xl">{strategy.title} </h2>

        <div className="flex items-center  justify-between">
          <span className="uppercase font-light text-background/70 text-sm">
            {strategy.phase}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function PlayfieldControlbar({
  strategyDef,
  session,
  onJoin,
  onLeave,
  onEnd,
}: PlayfieldPreviewProps) {
  const { playbook, isLoading } = usePlaybook(session.playbook_id);
  const strategy = useMemo(
    () => playbook?.strategies.find((s) => s.slug === strategyDef.slug),
    [playbook?.strategies, strategyDef.slug]
  );
  const {
    layout: { state },
  } = usePlayfield();
  const call = useStreamCall();
  if (isLoading) return <LoadingState variant="container" />;
  if (!strategy) return null;
  if (state === "expanded") {
    return (
      <div
        className={cn(
          "center-all",
          "fixed z-999  top-25 left-0 text-background py-4 px-1 md:px-5 shadow-black/20 flex-1 shadow-md rounded-r-2xl gap-6 hover:shadow-lg transition-shadow duration-200",
          getCardBackgroundColor(strategy.phase)
        )}
      >
        <Button
          variant="tertiary"
          size="icon"
          aria-label="Leave Playfield"
          className="text-foreground hover:scale-[1.02] hover:bg-background/80"
          onClick={onLeave}
        >
          <X className="scale-x-[-1]" />
        </Button>
        {call.isCreatedByMe && (
          <Button
            variant="tertiary"
            size="icon"
            aria-label="End Playfield for everyone"
            className="text-destructive-500 hover:scale-[1.02] hover:bg-destructive-100"
            onClick={onEnd}
          >
            <Squircle fill="var(--color-destructive-500)" />
          </Button>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "center-all",
        "flex fixed z-999 top-3 md:top-5 left-0 text-background  p-2 md:px-5 shadow-black/20 flex-1 shadow-md rounded-r-2xl justify-between  items-center gap-8 hover:shadow-lg transition-shadow duration-200",
        getCardBackgroundColor(strategy.phase)
      )}
    >
      <StrategyInfo strategy={strategy} />
      <div className="flex items-center gap-2">
        {call.isCreatedByMe && (
          <Button
            variant="tertiary"
            size="icon"
            className="text-destructive-500 hover:scale-[1.02] hover:bg-destructive-100"
            onClick={onEnd}
          >
            <Squircle fill="var(--color-destructive-500)" />
          </Button>
        )}
        <Button
          variant="tertiary"
          size="icon"
          aria-label="Start Playfield"
          className="text-primary-400 hover:scale-[1.02] hover:bg-primary-100"
          onClick={onJoin}
        >
          <Play fill="var(--color-primary-400)" />
        </Button>
      </div>
    </div>
  );
}
