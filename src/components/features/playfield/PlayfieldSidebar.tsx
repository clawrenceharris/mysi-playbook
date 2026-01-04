import { EmptyState, LoadingState } from "@/components/states";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui";
import { usePlaybook } from "@/features/playbooks/hooks";
import { PlaybookStrategies, Sessions } from "@/types/tables";
import { VirtualStrategyCard } from "../strategies";
import { useStreamCall } from "@/hooks";
import { registry } from "@/activities/registry";

interface PlayfieldSidebarProps {
  session: Sessions;
  onTabChange: (tab: string) => void;
  open: boolean;
  activeTab: string;
  onOpenChange: (open: boolean) => void;
  onStrategyClick: (strategy: PlaybookStrategies) => void;
}
export default function PlayfieldSidebar({
  session,
  open,
  onOpenChange,
  onTabChange,
  onStrategyClick,
  activeTab,
}: PlayfieldSidebarProps) {
  const { playbook, isLoading: loadingLesson } = usePlaybook(
    session?.playbook_id
  );
  const call = useStreamCall();
  const isHost = call.isCreatedByMe;
  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="p-6 z-9999 overflow-auto" side="left">
          <SheetDescription className="sr-only">
            Access the agenda, activities and chat for this session
          </SheetDescription>
          <SheetHeader>
            <div className="flex justify-between items-center"></div>
            <div className="flex items-center justify-between">
              <SheetTitle className="text-md font-semibold">
                {`${session?.course_name ? session.course_name + ":" : ""}`}{" "}
                <span className="font-light">{session?.topic}</span>
              </SheetTitle>
            </div>
            {session?.scheduled_start && (
              <div className="text-sm text-muted-foreground">
                {new Date(session.scheduled_start).toDateString()}
              </div>
            )}
          </SheetHeader>

          <Tabs value={activeTab} onValueChange={onTabChange}>
            <TabsList className="w-full mb-10">
              <TabsTrigger value="agenda">Agenda</TabsTrigger>
              <TabsTrigger value="chat">Chat</TabsTrigger>
            </TabsList>

            <TabsContent value="agenda">
              {loadingLesson ? (
                <LoadingState size={40} />
              ) : playbook?.strategies && playbook.strategies.length > 0 ? (
                <ul className="space-y-6">
                  {playbook.strategies.map((s) => (
                    <li key={s.id}>
                      <VirtualStrategyCard
                        strategy={s}
                        description={
                          s.slug in registry
                            ? "This strategy is set up for Playfield"
                            : undefined
                        }
                        actionLabel={
                          s.slug in registry && isHost
                            ? "Queue Strategy"
                            : undefined
                        }
                        onAction={() => {
                          onStrategyClick(s);
                        }}
                      />
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="h-full flex flex-col justify-center items-center">
                  <EmptyState message="No agenda has been created." />
                </div>
              )}
            </TabsContent>
          </Tabs>
        </SheetContent>
      </Sheet>
    </>
  );
}
