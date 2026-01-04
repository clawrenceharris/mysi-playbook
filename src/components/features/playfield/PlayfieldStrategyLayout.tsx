import React, { useState } from "react";
import { Button } from "@/components/ui";
import { cn } from "@/lib/utils";
import { getCardBackgroundColor, getCardIcon } from "@/utils";
import { StreamVideoParticipant } from "@stream-io/video-react-sdk";
import { AnimatePresence, motion } from "framer-motion";
import { PlaybookStrategies } from "@/types/tables";
const emojis = ["❤️", "👍", "😎", "🤔"];

interface PlayfieldStrategyLayoutProps {
  children: React.ReactNode;
  className?: string;
  ctx: {
    userId: string;
  };
  strategy: {
    title: string;
    phase: PlaybookStrategies["phase"];
  };
  participants?: StreamVideoParticipant[];
}
export function PlayfieldStrategyLayout({
  strategy,
  ctx,
  participants = [],
  className,
  children,
}: PlayfieldStrategyLayoutProps) {
  const [reactions, setReactions] = useState<
    { userId: string; emoji: string; id: string }[]
  >([]);
  return (
    <div
      className={cn(
        "w-full max-w-2xl mx-auto  shadow-2xl rounded-2xl",
        className
      )}
    >
      <div
        className={cn(
          `flex  text-background items-center p-5 gap-3 rounded-tl-2xl rounded-tr-2xl`,
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
        {emojis.map((emoji) => (
          <Button
            key={emoji}
            onClick={() =>
              setReactions([
                {
                  emoji,
                  id: crypto.randomUUID(),
                  userId: ctx.userId,
                },
              ])
            }
            variant={"tertiary"}
            size={"icon"}
          >
            {emoji}
          </Button>
        ))}
      </div>
      <motion.div
        layout
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
        className={cn(
          "flex  min-h-[250px]  overflow-hidden bg-background/95  border-b border-x backdrop-blur-xl  rounded-b-2xl"
        )}
      >
        <div className="relative w-full flex flex-col justify-between h-full flex-1">
          <div className="p-6 space-y-4">{children}</div>
        </div>
        <AnimatePresence mode="sync">
          {reactions.map(({ userId, id, emoji }) => (
            <motion.span
              key={id}
              initial={{ y: 0, opacity: 1, scale: 1 }}
              animate={{
                y: -200 - Math.random() * 80,
                opacity: 0,
                scale: 1.5,
                x: (Math.random() - 0.5) * 60,
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2, ease: "easeOut" }}
              className="absolute w-20 h-20 text-center line-clamp-1 text-secondary-500 bottom-0 right-9 text-2xl"
            >
              <span className="center-all z-9 rounded-full w-10 h-10   bg-white  shadow-md">
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
      </motion.div>
    </div>
  );
}
