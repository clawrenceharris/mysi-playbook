import React from "react";
import { Brain, Dumbbell, Lightbulb } from "lucide-react";
import { PlaybookStrategies } from "@/types/tables";

export const getCardBackgroundColor = (phase: PlaybookStrategies["phase"]) => {
  switch (phase) {
    case "warmup":
      return "bg-success-500";
    case "workout":
      return "bg-secondary-500";
    case "closer":
      return "bg-accent-400";
    default:
      return "bg-success-500";
  }
};

export const getCardIcon = (phase: PlaybookStrategies["phase"]) => {
  switch (phase) {
    case "warmup":
      return <Brain />;
    case "workout":
      return <Dumbbell />;
    case "closer":
      return <Lightbulb />;

    default:
      return <Brain />;
  }
};
