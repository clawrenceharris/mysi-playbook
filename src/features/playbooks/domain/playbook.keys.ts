import { PlaybookListQuery } from "./playbook.types";

export const playbookKeys = {
  all: ["playbooks"] as const,
  lists: () => [...playbookKeys.all, "list"] as const,
  list: (q: PlaybookListQuery) => [...playbookKeys.lists(), q] as const,
};
