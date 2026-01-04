import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { playbooksService } from "../domain/playbook.service";
import { PlaybookStrategies, PlaybookStrategiesUpdate } from "@/types/tables";

export function usePlaybook(playbookId?: string) {
  const queryClient = useQueryClient();

  const playbookQuery = useQuery({
    queryKey: ["playbook", playbookId],
    queryFn: async () => {
      if (playbookId)
        return await playbooksService.getPlaybookWithStrategies(playbookId);
    },
    enabled: !!playbookId,
  });
  const updatePlaybookStrategy = useMutation({
    mutationFn: async (vars: {
      strategyId: string;
      data: PlaybookStrategiesUpdate;
    }) => playbooksService.updatePlaybookStrategy(vars.strategyId, vars.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["playbook", playbookId] });
    },
    onError: (error) => {
      console.error("Failed to update playbook strategy:", error);
    },
  });

  const deletePlaybook = useMutation({
    mutationFn: async (playbookId: string) =>
      playbooksService.deletePlaybook(playbookId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["playbook", playbookId] });
    },
  });
  const reorderStrategies = useMutation({
    mutationFn: async (vars: {
      playbookId: string;
      strategies: { id: string; phase: PlaybookStrategies["phase"] }[];
    }) => playbooksService.reorderStrategies(vars.strategies),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["playbook", playbookId] });
    },
  });

  return {
    playbook: playbookQuery.data,
    isLoading: playbookQuery.isLoading,
    error: playbookQuery.error,
    deletePlaybook: deletePlaybook.mutateAsync,
    isDeleting: deletePlaybook.isPending,
    updatePlaybookStrategy: updatePlaybookStrategy.mutateAsync,
    isUpdating:
      updatePlaybookStrategy.isPending ||
      updatePlaybookStrategy.isPending ||
      reorderStrategies.isPending,
    reorderStrategies: reorderStrategies.mutateAsync,
    refetch: playbookQuery.refetch,
  };
}
