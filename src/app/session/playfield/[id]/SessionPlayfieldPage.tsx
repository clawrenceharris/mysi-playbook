"use client";

import { ErrorState, LoadingState } from "@/components/states";
import { useSession } from "@/features/sessions/hooks";

import { Sessions } from "@/types/tables";

import PlayfieldLayout from "@/components/features/playfield/PlayfieldLayout";
import {
  PlayfieldProvider,
  usePlayfield,
  SessionCallProvider,
  useSessionCall,
} from "@/providers";
import { cn } from "@/lib/utils";
import { PlayfieldLobbyView } from "@/components/features/video-calls";
import { PlayfieldProfile } from "@/hooks";
import { updateUserProfile } from "@/app/actions";
import { toast } from "sonner";
import { useState } from "react";
import { CallingState, useCallStateHooks } from "@stream-io/video-react-sdk";

interface SessionPlayfieldPageProps {
  id: string;
}

export default function SessionPlayfieldPage({
  id,
}: SessionPlayfieldPageProps) {
  const { session, error, isLoading: sessionLoading } = useSession(id);
  if (sessionLoading) {
    return <LoadingState />;
  }

  if (error || !session) {
    return (
      <main>
        <ErrorState
          variant="card"
          message="Failed to find this session. Please come back later and try again."
        />
      </main>
    );
  }
  return (
    <SessionCallProvider session={session}>
      <PlayfieldProvider>
        <MeetingScreen session={session} />
      </PlayfieldProvider>
    </SessionCallProvider>
  );
}
function MeetingScreen({ session }: { session: Sessions }) {
  const { strategy } = usePlayfield();
  const { mainCall, client } = useSessionCall();
  const [hasJoined, setHasJoined] = useState(false);
  const { useCallCallingState } = useCallStateHooks();
  const callingState = useCallCallingState();
  const handleJoin = async ({ name, image }: PlayfieldProfile) => {
    try {
      if (!client.state.connectedUser) {
        return;
      }

      const user = client.state.connectedUser;
      await updateUserProfile({
        user,
        name,
        image,
      });
      setHasJoined(true);

      if (callingState !== CallingState.JOINED) await mainCall.join();
    } catch (error) {
      console.error(error);
      setHasJoined(false);

      toast("An unexpected error occured while joining");
    }
  };

  return (
    <main
      className={cn(
        "relative w-full h-screen overflow-hidden",
        "transition-all duration-200",
        strategy && hasJoined ? "bg-black/50 backdrop-blur-4xl" : ""
      )}
    >
      <div className=" flex w-full flex-col h-full mx-auto max-w-4xl overflow-hidden">
        {hasJoined ? (
          <PlayfieldLayout session={session} />
        ) : (
          <PlayfieldLobbyView onJoin={handleJoin} />
        )}
      </div>
    </main>
  );
}
