import {
  BarChart3,
  Clock,
  FileText,
  GitBranch,
  MessageSquare,
  Users,
} from "lucide-react";
import { BlockCategory, BlockDefinition, BlockType } from ".";

export const blockDefinitions: BlockDefinition[] = [
  {
    type: BlockType.DISPLAY_PROMPT,
    title: "Display Prompt",
    description: "Show information to participants",
    category: "display",
    icon: MessageSquare,
  },
  {
    type: BlockType.COLLECT_INPUT,
    title: "Collect Input",
    description: "Gather responses from participants",
    category: "interaction",
    icon: FileText,
  },
  {
    type: BlockType.TIMER,
    title: "Timer",
    description: "Add delays or countdown timers",
    category: "facilitation",
    icon: Clock,
  },
  {
    type: BlockType.POLL_VOTE,
    title: "Poll/Vote",
    description: "Conduct polls and voting activities",
    category: "interaction",
    icon: BarChart3,
  },
  {
    type: BlockType.HANDOUT,
    title: "Handout",
    description: "Distribute items to participants for review",
    category: "facilitation",
    icon: Users,
  },
  {
    type: BlockType.DISPLAY_VARIABLE,
    title: "Variable Display",
    description: "Display dynamic information to students",
    category: "display",
    icon: GitBranch,
  },
];

export const blockTypeLabels: Record<BlockType, string> = {
  [BlockType.DISPLAY_PROMPT]: "Display Prompt",
  [BlockType.COLLECT_INPUT]: "Collect Input",
  [BlockType.POLL_VOTE]: "Poll/Vote",
  [BlockType.TIMER]: "Timer",
  [BlockType.HANDOUT]: "Handout",
  [BlockType.DISPLAY_VARIABLE]: "Variable Display",
};

export const blockCategoryLabels: Record<BlockCategory, string> = {
  display: "Display",
  interaction: "Interaction",
  facilitation: "Facilitation",
};
