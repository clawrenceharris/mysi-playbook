"use client";
import { AppSidebar, SidebarProvider } from "@/components/ui";
import React from "react";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "8rem",
        } as React.CSSProperties
      }
    >
      <AppSidebar />
      <main>{children}</main>
    </SidebarProvider>
  );
}
