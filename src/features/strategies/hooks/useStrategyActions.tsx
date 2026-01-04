import { useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { strategiesService } from "../domain";
import { useUser } from "@/providers";

export const useStrategyActions = () => {
  const { user } = useUser();
  const queryClient = useQueryClient();

  const saveStrategy = useMutation({
    mutationFn: async (strategyId: string) => {
      await strategiesService.saveStrategy(user.id, strategyId);
    },
    onSuccess: () => {
      // Invalidate strategies queries to refresh saved status
      queryClient.invalidateQueries({ queryKey: ["strategies"] });
    },
  });

  const unsaveStrategy = useMutation({
    mutationFn: async (strategyId: string) => {
      await strategiesService.unsaveStrategy(user.id, strategyId);
    },
    onSuccess: () => {
      // Invalidate strategies queries to refresh saved status
      queryClient.invalidateQueries({ queryKey: ["strategies"] });
    },
  });

  const toggleSave = useCallback(
    async (strategyId: string, isSaved: boolean) => {
      if (isSaved) {
        await unsaveStrategy.mutateAsync(strategyId);
      } else {
        await saveStrategy.mutateAsync(strategyId);
      }
    },
    [saveStrategy, unsaveStrategy]
  );

  return {
    saveStrategy: saveStrategy.mutateAsync,
    unsaveStrategy: unsaveStrategy.mutateAsync,
    toggleSave,
    isSaving: saveStrategy.isPending || unsaveStrategy.isPending,
  };
};

