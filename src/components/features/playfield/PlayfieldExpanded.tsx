import { EmptyState, LoadingState } from "@/components/states";
import { Button } from "@/components/ui";
import { useStreamCall } from "@/hooks";
import { cn } from "@/lib/utils";
import { usePlayfield } from "@/providers";
import { getCardBackgroundColor, getCardIcon } from "@/utils";
import { useCallStateHooks } from "@stream-io/video-react-sdk";
import { AnimatePresence, motion } from "framer-motion";

const emojis = ["❤️", "👍", "😎", "🤔"];

export default function PlayfieldExpanded() {
  const {
    reactions,
    isLoading,
    strategy,
    ctx,
    endStrategy,
    layout: { reset },
  } = usePlayfield();
  const { useParticipants } = useCallStateHooks();
  const participants = useParticipants();
  const call = useStreamCall();
  const handleEndClick = () => {
    endStrategy();
    reset();
  };
  const isHost = call.isCreatedByMe;
  if (isLoading) {
    return <LoadingState />;
  }
  return (
    <motion.div
      layout
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.95, opacity: 0 }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
      className="flex w-full h-full min-h-[340px] max-w-2xl mx-auto overflow-hidden bg-background/95 backdrop-blur-xl  rounded-2xl shadow-2xl"
    >
      {strategy ? (
        <div className="relative w-full flex flex-col justify-between h-full flex-1">
          <AnimatePresence mode="sync">
            {reactions.map(({ userId, id, emoji }) => (
              <motion.span
                key={id}
                initial={{ y: 0, opacity: 1, scale: 1 }}
                animate={{
                  y: -120 - Math.random() * 80,
                  opacity: 0,
                  scale: 1.5,
                  x: (Math.random() - 0.5) * 60,
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 2, ease: "easeOut" }}
                className="absolute w-20 h-20 text-center line-clamp-1 text-secondary-500 bottom-0 right-9 text-2xl"
              >
                <span className="center-all rounded-full w-10 h-10   bg-white  shadow-md">
                  {emoji}
                </span>

                <p className="text-xs">
                  {participants
                    .find((p) => p.userId === userId)
                    ?.name.slice(0, 5)}
                </p>
              </motion.span>
            ))}
          </AnimatePresence>

          <div
            className={cn(
              `relative w-full flex text-background items-center p-5 gap-3 rounded-tl-2xl rounded-tr-2xl`,
              `${getCardBackgroundColor(ctx.phase)}`
            )}
          >
            <div className="min-w-[40px] min-h-[40px] bg-foreground/20 rounded-full flex items-center justify-center">
              {getCardIcon(ctx.phase)}
            </div>

            <div className="w-full">
              <div>
                <h2 className="font-bold text-xl">{strategy.title} </h2>
              </div>
              <div className="flex items-center  justify-between">
                <span className="uppercase font-light text-background/70 text-sm">
                  {ctx.phase}
                </span>
              </div>
            </div>
            {emojis.map((e) => (
              <Button
                key={e}
                onClick={() => call.sendCustomEvent({ type: `reaction:${e}` })}
                variant={"tertiary"}
                size={"icon"}
              >
                {e}
              </Button>
            ))}
          </div>
          <div className="p-6 space-y-4">
            <strategy.Component ctx={ctx} />
            <div className="flex gap-3 w-full justify-between">
              {isHost && (
                <>
                  <Button variant={"link"} onClick={handleEndClick}>
                    End Activity
                  </Button>
                  <strategy.HostControls ctx={ctx} />
                </>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="h-full flex flex-col justify-center items-center">
          {isHost ? (
            <EmptyState message="No Strategy has been started yet. Start one by clicking 'Queue Strategy' in the Agenda tab." />
          ) : (
            <EmptyState message="No Strategy has been started yet. When the host starts one, you will see it here." />
          )}
        </div>
      )}
    </motion.div>
  );
}
