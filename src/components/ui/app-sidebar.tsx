"use client";
import React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import { useUser } from "@/providers";
import { HomeIcon, PlaybookIcon, SessionIcon } from "../icons";

const items: {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  {
    title: "Home",
    href: "/",
    icon: HomeIcon,
  },

  {
    title: "Playbooks",
    href: "/playbooks",
    icon: PlaybookIcon,
  },
  {
    title: "Sessions",
    href: "/sessions",
    icon: SessionIcon,
  },
];

export const AppSidebar = () => {
  const pathname = usePathname();
  const { profile } = useUser();
  const { isMobile } = useSidebar();
  return (
    <Sidebar
      collapsible="none"
      className="flex flex-col h-screen border-none bg-gray-800 transition-all duration-300"
    >
      <SidebarHeader className="flex items-center">
        <Image
          onClick={() => {
            window.location.href = "/";
          }}
          src="/logo.png"
          alt="MySI Logo"
          width={90}
          height={90}
          className="cursor-pointer"
        />
      </SidebarHeader>

      <SidebarContent className="justify-center">
        <SidebarMenu className="flex flex-col gap-6 items-center">
          {items.map(({ title, href, icon: Icon }) => {
            const isActive = pathname === href;
            return (
              <SidebarMenuItem key={title}>
                <SidebarMenuButton
                  asChild
                  className={cn(
                    "flex justify-center flex-col text-white [&_path]:stroke-white  items-center gap-3 px-4 py-5 rounded-xl text-sm font-medium transition-all",
                    "hover:bg-gray-700/40",
                    isMobile ? "size-15" : "size-24",
                    isActive
                      ? "bg-gray-700/40 text-primary-400 [&_path]:stroke-primary-400 font-semibold"
                      : ""
                  )}
                >
                  <Link href={href}>
                    <Icon className="min-w-[25px] min-h-[25px] transition-transform" />
                    {!isMobile && (
                      <span className="hidden md:inline">{title}</span>
                    )}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>

      {/* Footer / Profile */}

      <SidebarFooter className="px-3 py-5">
        <button
          className="
              w-full flex flex-col items-center gap-3 p-3 rounded-xl
              
              
              bg-black/20
              shadow-sm hover:shadow-md hover:border-primary-300
              transition-all duration-300
            "
        >
          <div
            className="
                flex items-center justify-center
                w-10 h-10 rounded-full bg-primary-400 text-white font-semibold flex-shrink-0
              "
          >
            {`${profile.first_name?.charAt(0)}${profile.last_name?.charAt(0)}`}
          </div>
        </button>
      </SidebarFooter>
    </Sidebar>
  );
};
