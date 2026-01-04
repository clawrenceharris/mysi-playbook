import { SessionsUpdate } from "@/types/tables";
import { sessionsService } from "../domain";
import { useMutation, useQuery } from "@tanstack/react-query";

export function useSession(sessionId?: string | null) {
  const sessionQuery = useQuery({
    queryKey: ["session", sessionId],
    queryFn: async () => {
      if (!sessionId) return null;
      return await sessionsService.getSessionById(sessionId);
    },
    enabled: !!sessionId,
  });
  const deleteSession = useMutation({
    mutationFn: async () => {
      if (!sessionId) return null;

      return await sessionsService.deleteSession(sessionId);
    },
    onSuccess: () => {
      sessionQuery.refetch();
    },
  });
  const updateSession = useMutation({
    mutationFn: async (data: SessionsUpdate) => {
      if (!sessionId) return null;
      return await sessionsService.updateSession(sessionId, data);
    },
    onSuccess: () => {
      sessionQuery.refetch();
    },
  });
  return {
    session: sessionQuery.data,
    refetch: sessionQuery.refetch,
    deleteSession: deleteSession.mutateAsync,
    updateSession: updateSession.mutateAsync,
    isLoading: sessionQuery.isLoading,
    isDeleting: deleteSession.isPending,
    isUpdating: updateSession.isPending,
    error: sessionQuery.error,
  };
}
