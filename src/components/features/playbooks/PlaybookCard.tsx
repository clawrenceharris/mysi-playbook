import { DeleteIcon, PencilEditIcon, PlaybookIcon } from "@/components/icons";
import {
  Button,
  Card,
  CardTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui";
import { Playbooks } from "@/types";
import { MoreVertical, StarIcon } from "lucide-react";
import moment from "moment";
import React from "react";
import { usePlaybookActions } from "@/features/playbooks/hooks";
import { useUser } from "@/providers";

interface PlaybookCardProps {
  playbook: Playbooks;
  onNavigate?: () => void;
}

export const PlaybookCard = ({ playbook, onNavigate }: PlaybookCardProps) => {
  const { toggleFavorite, isFavoriting } = usePlaybookActions();
  const { user } = useUser();

  const handleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await toggleFavorite(playbook.id, !!playbook.favorite);
    } catch (error) {
      console.error("Failed to toggle favorite:", error);
    }
  };
  return (
    <Card
      onClick={onNavigate}
      key={playbook.id}
      className="group w-full flex-col  bg-background shadow-none justify-center cursor-pointer flex hover:bg-secondary-foreground transition-all duration-200"
    >
      <div className="flex-col md:flex-row  w-full flex justify-between">
        <div className="flex flex-1 gap-3 items-center">
          <div className="flex-1">
            <div className="rounded-sm size-18 flex items-center justify-center  [&_path]:stroke-muted-foreground bg-primary-foreground border ">
              <PlaybookIcon className="group-hover:scale-[1.2] transition-all duration-200" />
            </div>
          </div>

          <div className="flex flex-col w-full md:flex-row gap-4 justify-between">
            <div>
              <CardTitle className="text-md font-semibold">
                {playbook.topic}
              </CardTitle>
              <span className="text-xs">
                {[
                  playbook.course_name || "",
                  moment(playbook.created_at).fromNow(),
                ]
                  .filter((item) => Boolean(item))
                  .join(" • ")}
              </span>
            </div>

            <div className="flex gap-2 items-center">
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  onNavigate?.();
                }}
                className="shadow-sm border-1 bg-primary-foreground"
                variant="outline"
              >
                <PencilEditIcon />
                Edit
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    className="shadow-sm border-1 bg-primary-foreground"
                    onClick={(e) => e.stopPropagation()}
                    variant="outline"
                    size="icon"
                  >
                    <MoreVertical />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem
                    onClick={handleFavorite}
                    disabled={isFavoriting}
                  >
                    <StarIcon /> {playbook.favorite ? "Unfavorite" : "Favorite"}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      // TODO: handle delete action
                    }}
                  >
                    <DeleteIcon /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
