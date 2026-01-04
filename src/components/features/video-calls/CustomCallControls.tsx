import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Tooltip,
  TooltipContent,
} from "@/components/ui";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { getUserErrorMessage } from "@/utils";
import { useCallStateHooks } from "@stream-io/video-react-sdk";
import {
  Camera,
  CameraOff,
  Link,
  LogOut,
  MicOff,
  MoreHorizontal,
  Notebook,
} from "lucide-react";
import { AudioVolumeIndicator, BreakoutCreator } from ".";
import { TooltipTrigger } from "@radix-ui/react-tooltip";
import { useSessionCall, useModal } from "@/providers";

interface CustomCallControlsProps {
  onPlaybookClick: () => void;
}

export default function CustomCallControls({
  onPlaybookClick,
}: CustomCallControlsProps) {
  const { activeCall: call } = useSessionCall();

  const { useMicrophoneState, useCameraState, useCallCreatedBy } =
    useCallStateHooks();

  const micState = useMicrophoneState();
  const camState = useCameraState();
  const { session } = useSessionCall();

  const createdBy = useCallCreatedBy();
  const {
    openModal: openBreakoutRoomsModal,
    closeModal: closeBreakoutRoomsModal,
  } = useModal();
  const handleCreateBreakoutRooms = () => {
    openBreakoutRoomsModal({
      title: "Create Breakout Rooms",
      description:
        "Ener the group size to divide breakout rooms assignements. There may be one rooms with uneven number of participants.",
      children: (
        <BreakoutCreator
          onClose={() => closeBreakoutRoomsModal}
          participants={call.state.remoteParticipants.filter(
            (p) => p.userId !== createdBy?.id
          )}
        />
      ),
    });
  };
  const handleMicClick = async () => {
    try {
      if (micState.isEnabled) call.microphone.disable();
      else call.microphone.enable();
    } catch (error) {
      toast(getUserErrorMessage(error));
      console.error(error);
    }
  };

  /**
   *  Copies the link to the Playfield session
   */
  const handleLinkClick = async () => {
    try {
      const link = `${window.location.origin}/session/playfield/${session.id}`;
      await navigator.clipboard.writeText(link);
      toast("Link copied to clipboard!");
    } catch {
      toast("Could not copy link");
    }
  };

  const handleCamClick = async () => {
    try {
      if (camState.isEnabled) call.camera.disable();
      else call.camera.enable();
    } catch (error) {
      toast(getUserErrorMessage(error));
      console.error(error);
    }
  };
  const handleEndBreakoutRooms = () => {
    call.update({
      custom: {
        rooms: [],
      },
    });
  };
  return (
    <div className="px-6 pt-5 pb-3 fixed shadow-black/20 bottom-0 left-1/2 -translate-x-1/2 flex items-center justify-center gap-6 bg-background rounded-t-xl">
      <button
        className={cn(
          "btn-muted",
          camState.isEnabled ? "bg-primary-100 text-primary-400" : "",
          !camState.hasBrowserPermission ? "bg-accent-100 text-accent-500" : ""
        )}
        onClick={handleCamClick}
      >
        {camState.isEnabled ? (
          <Camera />
        ) : !camState.hasBrowserPermission ? (
          <Tooltip>
            <TooltipTrigger>
              <MicOff className="text-accent-500" />
            </TooltipTrigger>
            <TooltipContent>Permissions not granted</TooltipContent>
          </Tooltip>
        ) : (
          <CameraOff />
        )}
      </button>
      <button
        className={cn(
          "btn-muted",
          micState.isEnabled ? "bg-primary-100" : "",
          !micState.hasBrowserPermission ? "bg-accent-100" : ""
        )}
        onClick={handleMicClick}
      >
        {micState.isEnabled ? (
          <AudioVolumeIndicator
            className={cn(
              "text-muted-foreground",
              micState.isEnabled ? "text-primary-400" : ""
            )}
          />
        ) : !micState.hasBrowserPermission ? (
          <Tooltip>
            <TooltipTrigger>
              <MicOff className="text-accent-500" />
            </TooltipTrigger>
            <TooltipContent>Permissions not granted</TooltipContent>
          </Tooltip>
        ) : (
          <MicOff />
        )}
      </button>

      <button
        aria-label="Open Agenda/Chat sidebar"
        className="btn-muted"
        onClick={onPlaybookClick}
      >
        <Notebook />
      </button>
      <button
        aria-label="Copy sharable link"
        className="btn-muted"
        onClick={handleLinkClick}
      >
        <Link />
      </button>

      {call.isCreatedByMe && (
        <DropdownMenu>
          <DropdownMenuTrigger className="btn-muted">
            <MoreHorizontal />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {!call.state.custom.rooms?.length ? (
              <DropdownMenuItem onClick={handleCreateBreakoutRooms}>
                Create Breakout rooms
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem onClick={handleEndBreakoutRooms}>
                End Breakout Rooms
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="btn-muted bg-destructive-100 text-destructive"
            onClick={() => call.leave()}
          >
            <LogOut />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem
            variant="destructive"
            onClick={() => call.endCall()}
          >
            Leave Call
          </DropdownMenuItem>
          <DropdownMenuItem variant="destructive">End Call</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
