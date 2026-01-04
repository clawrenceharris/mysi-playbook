"use client";
import { useUser } from "@/providers";
import {
  useSessionActions,
  useSessionFilters,
  useSessions,
} from "@/features/sessions/hooks";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, CardContent } from "@/components/ui";
import { cn } from "@/lib/utils";
import { PlaybookIcon, SessionIcon } from "@/components/icons";
import { SessionCard } from "@/components/features/sessions";

export default function Dashboard() {
  const { user, profile } = useUser();
  const router = useRouter();
  const { createSession } = useSessionActions();
  const { sessions = [] } = useSessions(user.id);

  const { filteredSessions, setFilters } = useSessionFilters(
    Object.values(sessions)
  );
  useEffect(() => {
    setFilters({ status: "scheduled", course: "", timeRange: "" });
  }, [setFilters]);
  const handleCreatePlaybook = () => {
    router.push("/playbooks/create");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-400 to-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden faded-col">
        {/* Content */}
        <div className="relative px-6 py-12 sm:px-10 sm:py-16 lg:py-20 max-w-7xl mx-auto">
          {/* Welcome Header */}
          <div className="mb-10 space-y-3">
            <h1 className="text-white text-5xl">
              Welcome, {profile.first_name}
            </h1>
            <p className="text-lg sm:text-xl text-white max-w-2xl">
              Let&apos;s get started with your next session.
            </p>
          </div>

          {/* Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
            <HomeCard
              title="Create a Playbook"
              description="Build engaging SI strategies and activities for your next session"
              icon={<PlaybookIcon />}
              onClick={handleCreatePlaybook}
              buttonText={"Create"}
            />
            <HomeCard
              title="Schedule a Session"
              description="Plan and organize your upcoming SI sessions with students"
              icon={<SessionIcon />}
              onClick={createSession}
              buttonText={"Schedule"}
              variant="secondary"
            />
          </div>
        </div>
      </div>
      <section className="container">
        <h2>Upcoming Sessions</h2>
        <div className="flex flex-wrap gap-4">
          {filteredSessions.map((session) => (
            <SessionCard key={session.id} session={session} />
          ))}
        </div>
      </section>
    </div>
  );
}

interface HomeCardProps {
  icon: ReactNode;
  variant?: "primary" | "secondary";
  buttonText: string;
  onClick: () => void;
  description: string;
  title: string;
}
const HomeCard = ({
  icon,
  variant = "primary",
  buttonText,
  onClick,
  description,
  title,
}: HomeCardProps) => {
  return (
    <Card
      onClick={onClick}
      className={cn(
        "relative group  cursor-pointer hover:shadow-2xl hover:-translate-y-1  transition-all duration-300",
        variant === "primary"
          ? "hover:bg-primary-400  hover:shadow-primary-400"
          : "hover:bg-secondary-400  hover:shadow-secondary-400"
      )}
    >
      <CardContent className="p-6 space-y-4">
        <div
          className={cn(
            "w-12 h-12 [&_svg]:size-8 group-hover:to-white group-hover:from-white [&_path]:stroke-white  rounded-xl bg-gradient-to-br  flex items-center justify-center shadow-lg  group-hover:scale-110 transition-transform duration-300",
            variant === "primary"
              ? "from-primary-400 to-primary-500 shadow-primary-400/30 group-hover:[&_path]:stroke-primary-400"
              : "from-secondary-400 to-secondary-600 shadow-secondary-400/30 group-hover:[&_path]:stroke-secondary-400 "
          )}
        >
          {icon}
        </div>
        <div className="space-y-2 ">
          <h3 className="text-xl font-bold text-foreground group-hover:text-white">
            {title}
          </h3>
          <p className="text-muted-foreground group-hover:text-white">
            {description}
          </p>
        </div>
        <Button
          onClick={onClick}
          variant={variant}
          size="lg"
          className={cn(
            "w-full hover:scale-[1.02] text-white group-hover:bg-white",
            variant === "primary"
              ? "group-hover:text-primary-400"
              : "group-hover:text-secondary-400"
          )}
        >
          {buttonText}
        </Button>
      </CardContent>
    </Card>
  );
};
