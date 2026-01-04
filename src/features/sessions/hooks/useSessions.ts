import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { sessionsService } from "../domain";
import { Sessions, SessionsInsert, SessionsUpdate } from "@/types/tables";
import { useUser } from "@/providers";

export function useSessions(sessionId?: string | null) {
  const queryClient = useQueryClient();
  const { user } = useUser();
  const sessionsQuery = useQuery({
    queryKey: ["sessions", user.id],
    queryFn: async () => {
      const sessions = await sessionsService.getAllByUser(user.id);
      return sessions.reduce((acc, session) => {
        acc[session.id] = session;
        return acc;
      }, {} as { [sessionId: string]: Sessions });
    },
    enabled: !!user.id,
  });

  const createSession = useMutation({
    mutationFn: async (data: SessionsInsert) =>
      await sessionsService.addSession(data),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["sessions", user.id] }),
  });

  const updateSession = useMutation({
    mutationFn: async (vars: { sessionId: string; data: SessionsUpdate }) => {
      const { sessionId, data } = vars;
      return await sessionsService.updateSession(sessionId, data);
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["sessions", user.id] }),
  });

  const deleteSession = useMutation({
    mutationFn: async (id: string) => await sessionsService.deleteSession(id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["sessions", user.id] }),
  });

  return {
    sessions: sessionsQuery.data || {},

    refetch: sessionsQuery.refetch,
    isDeleting: deleteSession.isPending,
    isCreating: createSession.isPending,
    isUpdating: updateSession.isPending,
    isLoading: sessionsQuery.isLoading,
    error: sessionsQuery.error,

    createSession: createSession.mutateAsync,
    updateSession: updateSession.mutateAsync,
    deleteSession: deleteSession.mutateAsync,
  };
}
