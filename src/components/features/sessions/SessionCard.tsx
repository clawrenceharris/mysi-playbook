import { DeleteIcon, PencilEditIcon, SessionIcon } from "@/components/icons";
import {
  Button,
  Card,
  CardFooter,
  CardHeader,
  CardTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui";
import { useSessionActions } from "@/features/sessions/hooks";
import { Sessions } from "@/types/tables";
import { Ban, MoreVertical } from "lucide-react";

interface SessionCardProps {
  session: Sessions;
}
export const SessionCard = ({ session }: SessionCardProps) => {
  const { updateSession, deleteSession, updateSessionStatus, startSession } =
    useSessionActions(session.id);

  const handleUpdateStatus = (status: Sessions["status"]) => {
    updateSessionStatus(status);
  };

  const statusColor: Record<Sessions["status"], string> = {
    scheduled: "bg-primary-50 text-primary-500",
    active: "bg-success-100 text-success-500",
    completed: "bg-gray-200 text-muted-foreground",
    canceled: "bg-destructive-100 text-destructive-500",
  };

  return (
    <Card className="overflow-hidden shadow-none border-2 flex justify-between w-full flex-col transition-shadow duration-200">
      <CardHeader>
        <div className="flex items-center mb-3 justify-between">
          <CardTitle className="text-md gap-1 flex items-center font-semibold">
            {session.course_name && <span>{session.course_name + ":"}</span>}
            <span className="text-muted-foreground font-normal">
              {session.topic}
            </span>
          </CardTitle>
          <span
            className={`text-xs max-w-20 flex items-center justify-center px-2 py-1 rounded-full font-medium capitalize ${
              statusColor[session.status]
            }`}
          >
            {session.status?.replace("_", " ")}
          </span>
        </div>
        {session.scheduled_start && (
          <div className="text-sm text-muted-foreground">
            {new Date(session.scheduled_start).toDateString()}
          </div>
        )}
      </CardHeader>

      <CardFooter className="flex gap-4 justify-end">
        <div className="flex gap-0.5 items-center">
          <Button
            variant={session.status === "active" ? "destructive" : "primary"}
            disabled={session.status === "canceled"}
            onClick={() => startSession()}
          >
            {session.status === "active" ? "End Session" : "Start Session"}
          </Button>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild className="cursor-pointer">
            <Button variant={"outline"} size="icon" onClick={updateSession}>
              <MoreVertical />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent avoidCollisions align="start" className="z-999">
            {session.status !== "canceled" && session.status != "completed" && (
              <>
                <DropdownMenuItem onClick={updateSession}>
                  <PencilEditIcon /> Update
                </DropdownMenuItem>
                <DropdownMenuSeparator />

                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => handleUpdateStatus("canceled")}
                >
                  <Ban /> Cancel Session
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}
            {(session.status === "completed" ||
              session.status === "canceled") && (
              <>
                <DropdownMenuItem onClick={updateSession}>
                  <SessionIcon /> Reschedule
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}

            <DropdownMenuItem variant="destructive" onClick={deleteSession}>
              <DeleteIcon /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardFooter>
    </Card>
  );
};
