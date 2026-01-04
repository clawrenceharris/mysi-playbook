"use client";
import { useState, useEffect, useContext, createContext } from "react";
import {
  Call,
  StreamCall,
  StreamVideoClient,
  useStreamVideoClient,
} from "@stream-io/video-react-sdk";
import { toast } from "sonner";
import { Sessions } from "@/types/tables";
import { useAuth } from "@/features/auth/hooks";
import { getUserErrorMessage } from "@/utils";
import { EmptyState, ErrorState, LoadingState } from "@/components/states";
import { useSessions } from "@/features/sessions/hooks";

interface SessionCallContextType {
  isLoading: boolean;
  error: string | null;
  setActiveCall: (call: Call) => void;

  /**
   * The active call for the session (could be the main call or a breakout call)
   */
  activeCall: Call;
  /**
   * The main (primary) call for the session
   */
  mainCall: Call;
  session: Sessions;
  client: StreamVideoClient;
  isCreatingRooms: boolean;
  myBreakoutRoom: BreakoutRoom | null;
  createNewCall: () => void;
  leaveBreakoutRoom: (breakoutCall: Call) => void;
  endBreakoutRooms: (breakoutCall: Call) => void;
  joinBreakoutRoom: (myBreakoutRoom: BreakoutRoom) => void;
  createBreakoutRooms: (rooms: BreakoutRoom[]) => void;
}

interface SessionCallProviderProps {
  children: React.ReactNode;
  session: Sessions;
}

function NoCallState({ onCreate }: { onCreate: () => void }) {
  const { user } = useAuth();
  if (!user) {
    return (
      <EmptyState
        variant="card"
        title="The host didn't start this virtual call yet."
        message="Once the call is started you will be redirected"
      />
    );
  }
  return (
    <EmptyState
      variant="card"
      title="Virtual Meeting not created yet."
      actionLabel={"Create Meeting"}
      onAction={onCreate}
    />
  );
}
function SessionCallProvider({ children, session }: SessionCallProviderProps) {
  const client = useStreamVideoClient();
  const { updateSession } = useSessions(session.leader_id);
  const { user } = useAuth();
  const [mainCall, setMainCall] = useState<Call | null>(null);
  const [activeCall, setActiveCall] = useState<Call | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);
  const [showNotification, setShowNotification] = useState(false);

  const [myBreakoutRoom, setMyBreakoutRoom] = useState<BreakoutRoom | null>(
    null
  );
  const {
    leaveBreakoutRoom,
    endBreakoutRooms,
    joinBreakoutRoom,
    createBreakoutRooms,
    isCreatingRooms,
  } = useBreakoutRooms(mainCall, {
    onJoinBreakoutRoom: (call) => setActiveCall(call),
    onLeaveBreakoutRoom: () => setActiveCall(mainCall),
  });

  useEffect(() => {
    if (!activeCall) return;
    const unsubscribe = activeCall.on("call.updated", (e) => {
      const endTime = e.call.custom?.endingBreakoutsAt;
      if (!endTime) return;

      const timeLeft = endTime - Date.now();
      if (timeLeft <= 0) {
        leaveBreakoutRoom(activeCall);
        return;
      }

      // show notification
      setShowNotification(true);
      setCountdown(Math.ceil(timeLeft / 1000));

      const interval = setInterval(() => {
        const remaining = endTime - Date.now();
        if (remaining <= 0) {
          clearInterval(interval);
          leaveBreakoutRoom(activeCall);
        } else {
          setCountdown(Math.ceil(remaining / 1000));
        }
      }, 1000);
      return () => clearInterval(interval);
    });

    return () => unsubscribe();
  }, [activeCall, leaveBreakoutRoom]);

  useEffect(() => {
    if (!mainCall) return;

    function findMyBreakoutRoom(call: Call): BreakoutRoom | null {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const myRoom = call.state.custom.rooms?.find((r: any) =>
        r.members.includes(mainCall?.currentUserId)
      );
      console.log({ rooms: call.state.custom.rooms });

      if (myRoom) {
        // Join breakout
        return myRoom;
      }
      return null;
    }

    const unsubscribe1 = mainCall.on("call.updated", () => {
      setMyBreakoutRoom(findMyBreakoutRoom(mainCall));
    });
    const unsubscribe2 = mainCall.on("call.session_participant_joined", () => {
      setMyBreakoutRoom(findMyBreakoutRoom(mainCall));
    });
    const unsubscribe3 = mainCall.on("call.created", (e) => {
      if (mainCall.state.settings) {
        e.call.settings = mainCall.state.settings;
      }
    });
    return () => {
      unsubscribe1();
      unsubscribe2();
      unsubscribe3();
    };
  }, [mainCall]);
  useEffect(() => {
    async function loadMainCall() {
      try {
        setIsLoading(true);

        if (!client || !session.call_id) return;

        const { calls } = await client.queryCalls({
          filter_conditions: { id: session.call_id },
        });

        if (calls.length > 0) {
          const call = calls[0];

          await call.get();

          setMainCall(call);
          setActiveCall(call);
        }
      } catch (error) {
        setError(getUserErrorMessage(error));
      } finally {
        setIsLoading(false);
      }
    }
    loadMainCall();
  }, [client, session.call_id]);

  async function createNewCall(): Promise<Call | null> {
    if (!user || !client) {
      return null;
    }
    try {
      setIsLoading(true);

      const { topic, description, scheduled_start, course_name } = session;

      const id = crypto.randomUUID();

      const newCall = client.call("default", id);

      await newCall.getOrCreate({
        data: {
          starts_at: new Date(scheduled_start).toISOString(),
          members: [
            {
              user_id: user.id,
              role: "admin",
            },
          ],
          custom: {
            topic,
            description,
            course_name,
            title: `${course_name ? course_name + ":" : ""} ${topic}`,
          },
        },
      });

      return newCall;
    } catch (error) {
      toast(getUserErrorMessage(error));
      setError(getUserErrorMessage(error));
      return null;
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return <LoadingState />;
  }

  if (error || !client) {
    return <ErrorState variant="card" message={error} />;
  }

  if (!activeCall || !mainCall) {
    return (
      <main>
        <NoCallState
          onCreate={async () => {
            try {
              const call = await createNewCall();
              updateSession.mutate({
                id: session.id,
                data: { call_id: call?.id || null },
              });
            } catch (error) {
              console.error(error);
              toast("Could not create call");
            }
          }}
        />
      </main>
    );
  }

  const value = {
    isLoading,
    error,
    activeCall,
    mainCall,
    myBreakoutRoom,
    session,
    client,
    setActiveCall,
    createNewCall,
    leaveBreakoutRoom,
    endBreakoutRooms,
    joinBreakoutRoom,
    createBreakoutRooms,
    isCreatingRooms,
  };
  return (
    <SessionCallContext.Provider value={value}>
      <StreamCall call={activeCall}>
        {showNotification && (
          <div
            className="fixed bottom-4 left-1/2 transform -translate-x-1/2 
                  bg-gray-900 text-white px-4 py-2 rounded-xl shadow-lg"
          >
            Breakout rooms ending in {countdown} seconds...
          </div>
        )}
        {children}
      </StreamCall>
    </SessionCallContext.Provider>
  );
}
const SessionCallContext = createContext<SessionCallContextType | undefined>(
  undefined
);

function useSessionCall() {
  const context = useContext(SessionCallContext);
  if (!context)
    throw new Error(
      "useSessionCall must be used within a SessionCallProvider."
    );
  return context;
}

export interface BreakoutRoom {
  id: string;
  members: { userId: string; sessionId: string; name: string }[];
}

const END_DELAY = 5000; // 5 seconds
interface UseBreakoutRoomsOptions {
  onJoinBreakoutRoom?: (breakoutCall: Call) => void;
  onLeaveBreakoutRoom?: (breakoutCall: Call) => void;
}
function useBreakoutRooms(
  mainCall: Call | null,
  options?: UseBreakoutRoomsOptions
) {
  const client = useStreamVideoClient();

  const [isJoining, setIsJoining] = useState(false);
  const [isCreatingRooms, setIsCreatingRooms] = useState(false);
  const joinBreakoutRoom = async (myBreakoutRoom: BreakoutRoom) => {
    if (!client || !mainCall) return;

    try {
      setIsJoining(true);
      // Clean up main call
      await mainCall?.leave();

      // Join breakout
      const breakoutCall = client.call("default", myBreakoutRoom.id);
      options?.onJoinBreakoutRoom?.(breakoutCall);

      breakoutCall.join({
        data: {
          custom: {
            ...mainCall.state.custom,
          },
          settings_override: {
            video: {
              target_resolution: {
                width: 2560,
                height: 1440,
                bitrate: 5000000,
              },

              camera_default_on: false,
            },
            audio: {
              default_device: "speaker",
              mic_default_on: false,
            },
          },
        },
      });
    } catch (error) {
      console.error(error);
      toast(getUserErrorMessage(error));
    } finally {
      setIsJoining(false);
    }
  };

  /**
   *  Ends all breakout room calls and participants are rejoined to the main call
   */
  async function endBreakoutRooms(breakoutCall: Call) {
    const endTime = Date.now() + END_DELAY;
    await breakoutCall.update({
      custom: {
        ...breakoutCall.state.custom,
        endingBreakoutsAt: endTime,
      },
    });

    // after countdown, clear the rooms
    setTimeout(async () => {
      await breakoutCall.update({
        custom: {
          rooms: [],
          endingBreakoutsAt: null,
        },
      });
    }, END_DELAY + 1000); // +1s buffer
  }
  const leaveBreakoutRoom = async (breakoutCall: Call) => {
    if (!client || !mainCall) return;

    try {
      options?.onLeaveBreakoutRoom?.(breakoutCall);

      // Clean up main call
      await breakoutCall?.leave();
      // Join breakout
      await mainCall?.join();
    } catch (error) {
      toast("Error occured while leaving this Breakout room");
      console.error(error);
    }
  };
  async function createBreakoutRooms(rooms: BreakoutRoom[]) {
    if (!client || !mainCall) {
      throw new Error("Video client or call cannot be null");
    }
    try {
      setIsCreatingRooms(true);

      //Create breakout calls
      const breakouts = await Promise.all(
        rooms.map(async ({ members }, index) => {
          const breakoutId = `${mainCall.id}-breakout-${index + 1}`;

          const newCall = client.call("default", breakoutId);

          await newCall.getOrCreate({
            data: {
              custom: {
                course_name: mainCall.state.custom.title,
                mainCall: mainCall.id,

                breakoutIndex: index + 1,
                members: members.map((m) => m.userId),
              },
              members: members.map((p) => ({
                user_id: p.userId,
                role: "user",
              })),
            },
          });

          return {
            breakoutId,
            mainCall,
            members,
          };
        })
      );

      // Notify all participants via the main call
      await mainCall.update({
        custom: {
          rooms: breakouts.map((b) => ({
            id: b.breakoutId,
            members: b.members.map((m) => m.userId),
          })),
        },
      });

      return breakouts;
    } catch (error) {
      console.error(error);
      toast("Failed to create Breakout rooms. Please try again later");
    } finally {
      setIsCreatingRooms(false);
    }
  }

  return {
    isJoining,
    isCreatingRooms,
    createBreakoutRooms,
    joinBreakoutRoom,
    endBreakoutRooms,
    leaveBreakoutRoom,
  };
}

export { useSessionCall, SessionCallProvider };
