"use client";

import React, { createContext, useContext, useMemo } from "react";
import { ParticipantStateManager } from "./ParticipantStateManager";

const ParticipantManagerContext = createContext<
  ParticipantStateManager | undefined
>(undefined);

export function ParticipantManagerProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const manager = useMemo(() => new ParticipantStateManager(), []);

  return (
    <ParticipantManagerContext.Provider value={manager}>
      {children}
    </ParticipantManagerContext.Provider>
  );
}

export function useParticipantManager(): ParticipantStateManager {
  const context = useContext(ParticipantManagerContext);
  if (!context) {
    throw new Error(
      "useParticipantManager must be used within a ParticipantManagerProvider"
    );
  }
  return context;
}
