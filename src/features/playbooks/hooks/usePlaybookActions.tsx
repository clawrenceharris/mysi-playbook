import { useUser } from "@/providers";
import { usePlaybook, usePlaybooks } from "./";
import { PlaybookStrategies, Strategies } from "@/types";
import { useCallback, useEffect } from "react";
import { GeneratePlaybookInput, playbooksService } from "../domain";
import { useModal } from "@/lib/modals/ModalProvider";
import { PLAYBOOK_MODAL_TYPES } from "../components/modals";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { playbookKeys } from "../domain";

export const usePlaybookActions = (playbookId?: string) => {
  const {
    isUpdating,
    isDeleting,
    deletePlaybook: handleDeletePlaybook,
    updatePlaybookStrategy,
    refetch,
  } = usePlaybook(playbookId);
  const { user } = useUser();
  const { isLoading } = usePlaybooks({ userId: user.id });
  const { openModal, updateModalProps, currentModalType } = useModal();
  const queryClient = useQueryClient();

  // Update modal props when loading state changes
  useEffect(() => {
    if (currentModalType === PLAYBOOK_MODAL_TYPES.DELETE) {
      updateModalProps({ isLoading: isDeleting });
    }
  }, [isDeleting, currentModalType, updateModalProps]);

  useEffect(() => {
    if (currentModalType === PLAYBOOK_MODAL_TYPES.REPLACE_STRATEGY) {
      updateModalProps({ isLoading: isUpdating });
    }
  }, [isUpdating, currentModalType, updateModalProps]);

  useEffect(() => {
    if (currentModalType === PLAYBOOK_MODAL_TYPES.GENERATE) {
      updateModalProps({ isLoading });
    }
  }, [isLoading, currentModalType, updateModalProps]);

  const handleReplaceStrategy = useCallback(
    async (strategyToReplace: PlaybookStrategies, newStrategy: Strategies) => {
      const { category, steps, slug, title, description } = newStrategy;

      await updatePlaybookStrategy({
        strategyId: strategyToReplace.id,
        data: {
          playbook_id: playbookId,
          steps,
          slug,
          title,
          description,
          category: category || "",
        },
      });
    },
    [playbookId, updatePlaybookStrategy]
  );

  const handleGeneratePlaybook = useCallback(
    async (data: GeneratePlaybookInput) => {
      const { topic, virtual, course_name, contexts } = data;
      const r = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/playbook-generator`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contexts, topic, virtual, course_name }),
        }
      );
      return await r.json();
    },
    []
  );

  const replaceStrategy = useCallback(
    (strategy: PlaybookStrategies) => {
      if (!playbookId) return;
      openModal(PLAYBOOK_MODAL_TYPES.REPLACE_STRATEGY, {
        strategyToReplace: strategy,
        playbookId,
        onConfirm: handleReplaceStrategy,
        isLoading: isUpdating,
      });
    },
    [playbookId, handleReplaceStrategy, isUpdating, openModal]
  );

  const deletePlaybook = useCallback(() => {
    if (!playbookId) return;
    openModal(PLAYBOOK_MODAL_TYPES.DELETE, {
      playbookId,
      onConfirm: handleDeletePlaybook,
      isLoading: isDeleting,
    });
  }, [playbookId, handleDeletePlaybook, isDeleting, openModal]);

  const enhanceStrategy = useCallback(
    async (strategyId: string) => {
      try {
        await fetch(
          `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/playbook-generator`,
          {
            method: "POST",
            body: JSON.stringify({ strategyId }),
          }
        );
        refetch();
      } catch (error) {
        console.error(
          `An error occurred: ${error instanceof Error ? error.message : ""}`
        );
      }
    },
    [refetch]
  );

  const createPlaybook = useCallback(() => {
    openModal(PLAYBOOK_MODAL_TYPES.GENERATE, {
      onConfirm: handleGeneratePlaybook,
      isLoading,
    });
  }, [handleGeneratePlaybook, isLoading, openModal]);

  const favoritePlaybook = useMutation({
    mutationFn: async (playbookId: string) => {
      await playbooksService.favoritePlaybook(user.id, playbookId);
    },
    onSuccess: () => {
      // Invalidate playbooks queries to refresh favorite status
      queryClient.invalidateQueries({ queryKey: playbookKeys.all });
      queryClient.invalidateQueries({ queryKey: ["playbook", playbookId] });
    },
  });

  const unfavoritePlaybook = useMutation({
    mutationFn: async (playbookId: string) => {
      await playbooksService.unfavoritePlaybook(user.id, playbookId);
    },
    onSuccess: () => {
      // Invalidate playbooks queries to refresh favorite status
      queryClient.invalidateQueries({ queryKey: playbookKeys.all });
      queryClient.invalidateQueries({ queryKey: ["playbook", playbookId] });
    },
  });

  const toggleFavorite = useCallback(
    async (playbookId: string, isFavorited: boolean) => {
      if (isFavorited) {
        await unfavoritePlaybook.mutateAsync(playbookId);
      } else {
        await favoritePlaybook.mutateAsync(playbookId);
      }
    },
    [favoritePlaybook, unfavoritePlaybook]
  );

  return {
    enhanceStrategy,
    createPlaybook,
    replaceStrategy,
    deletePlaybook,
    favoritePlaybook: favoritePlaybook.mutateAsync,
    unfavoritePlaybook: unfavoritePlaybook.mutateAsync,
    toggleFavorite,
    isFavoriting: favoritePlaybook.isPending || unfavoritePlaybook.isPending,
  };
};
