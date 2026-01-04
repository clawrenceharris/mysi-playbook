import { motion, AnimatePresence } from "framer-motion";
import {
  BreakoutRoomButton,
  CustomCallControls,
  ParticipantListView,
  SIView,
} from "../video-calls";
import { useCallStateHooks } from "@stream-io/video-react-sdk";
import { PlayfieldExpanded, PlayfieldControlbar, PlayfieldSidebar } from "./";
import { CompiledActivityErrorBoundary } from "./CompiledActivityErrorBoundary";
import { useEffect, useState } from "react";

import { PlaybookStrategies, Sessions } from "@/types/tables";
import { usePlayfield, useSessionCall } from "@/providers";
import { isCompiledActivity } from "@/activities/registry";

interface PlayfieldLayoutProps {
  session: Sessions;
}

export default function PlayfieldLayout({ session }: PlayfieldLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("agenda");
  const { useParticipants } = useCallStateHooks();
  const participants = useParticipants();
  const { activeCall, myBreakoutRoom, leaveBreakoutRoom, joinBreakoutRoom } =
    useSessionCall();
  const {
    strategy,
    startStrategy,
    endStrategy,
    layout: { state, reset, expandPlayfield },
  } = usePlayfield();

  //When the strategy start button from the Playbook is clicked
  const handleStrategyClick = (strategy: PlaybookStrategies) => {
    startStrategy(strategy); //start the Playfield strategy
    setSidebarOpen(false);
  };

  //When the user joins the playfield
  const handleJoinClick = async () => {
    expandPlayfield();
    setSidebarOpen(false);
  };

  useEffect(() => {
    if (!strategy) {
      reset();
    }
  }, [reset, strategy]);

  // Check if current strategy is compiled
  const isCompiled = strategy ? isCompiledActivity(strategy.slug) : false;

  return (
    <div className="p-10 h-full w-full flex">
      {myBreakoutRoom ? (
        <BreakoutRoomButton
          onLeave={() => leaveBreakoutRoom(activeCall)}
          isJoined={myBreakoutRoom.id === activeCall?.id}
          onJoin={() => joinBreakoutRoom(myBreakoutRoom)}
        />
      ) : (
        strategy && (
          <PlayfieldControlbar
            strategyDef={strategy}
            session={session}
            onJoin={handleJoinClick}
            onLeave={reset}
            onEnd={endStrategy}
          />
        )
      )}

      <PlayfieldSidebar
        onStrategyClick={handleStrategyClick}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenChange={setSidebarOpen}
        open={sidebarOpen}
        session={session}
      />

      <AnimatePresence mode="wait">
        {state === "idle" && (
          <motion.div
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full  h-full flex-col flex  items-center justify-center"
          >
            <SIView />
          </motion.div>
        )}

        {state === "expanded" && (
          <motion.div
            key="expanded"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="flex  w-full h-full p-10 items-center flex-col justify-center gap-6"
          >
            {isCompiled ? (
              <CompiledActivityErrorBoundary
                activitySlug={strategy?.slug}
                onReset={reset}
              >
                <PlayfieldExpanded />
              </CompiledActivityErrorBoundary>
            ) : (
              <PlayfieldExpanded />
            )}
            <ParticipantListView participants={participants} />
          </motion.div>
        )}
      </AnimatePresence>
      <CustomCallControls
        onPlaybookClick={() => {
          setSidebarOpen(true);
        }}
      />
    </div>
  );
}
