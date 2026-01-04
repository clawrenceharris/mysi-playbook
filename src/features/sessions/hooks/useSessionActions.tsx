import { useCallback, useEffect } from "react";
import { Sessions } from "@/types";
import { useSessions } from "./";
import { useModal } from "@/lib/modals/ModalProvider";
import { SESSION_MODAL_TYPES } from "../components/modals";
import type { CreateSessionInput } from "../domain";
import { useUser } from "@/providers";
import { CreateSessionModalProps } from "@/lib/modals/types";

export const useSessionActions = (sessionId?: string) => {
  const {
    updateSession: handleUpdateSession,
    deleteSession: handleDeleteSession,
    isUpdating,
    isDeleting,
    sessions,
  } = useSessions(sessionId);
  const { isCreating, createSession: handleCreateSession } = useSessions();
  const { user } = useUser();

  const { openModal, updateModalProps, currentModalType } = useModal();

  // Update modal props when loading state changes
  useEffect(() => {
    if (currentModalType === SESSION_MODAL_TYPES.CREATE) {
      updateModalProps<CreateSessionModalProps>({ isLoading: isCreating });
    }
  }, [isCreating, currentModalType, updateModalProps]);

  useEffect(() => {
    if (currentModalType === SESSION_MODAL_TYPES.DELETE && sessionId) {
      updateModalProps({ isLoading: isDeleting });
    }
  }, [isDeleting, currentModalType, updateModalProps, sessionId]);

  useEffect(() => {
    if (currentModalType === SESSION_MODAL_TYPES.UPDATE && sessionId) {
      updateModalProps({ isLoading: isUpdating });
    }
  }, [isUpdating, currentModalType, updateModalProps, sessionId]);

  const updateSessionStatus = useCallback(
    async (status: Sessions["status"]) => {
      if (!sessionId) return;
      await handleUpdateSession({ sessionId, data: { status } });
    },
    [handleUpdateSession, sessionId]
  );

  const createSession = useCallback(() => {
    // #region agent log
    console.log(
      "useSessionActions: createSession called with isCreating",
      isCreating
    );
    fetch("http://127.0.0.1:7242/ingest/64a3f3e8-235c-40b2-ad71-c3a7282cd6ca", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        location: "useSessionActions.tsx:createSession",
        message: "createSession called",
        data: { isCreating },
        timestamp: Date.now(),
        sessionId: "debug-session",
        runId: "run1",
        hypothesisId: "A",
      }),
    }).catch(() => {});
    // #endregion
    const handleConfirm = async (data: CreateSessionInput) => {
      // #region agent log
      fetch(
        "http://127.0.0.1:7242/ingest/64a3f3e8-235c-40b2-ad71-c3a7282cd6ca",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            location: "useSessionActions.tsx:handleConfirm",
            message: "handleConfirm called",
            data: { isCreating },
            timestamp: Date.now(),
            sessionId: "debug-session",
            runId: "run1",
            hypothesisId: "E",
          }),
        }
      ).catch(() => {});
      // #endregion
      const { start_date, start_time, ...rest } = data;
      const scheduled_start = `${start_date.split("T")[0]}T${start_time}`;
      return await handleCreateSession({
        ...rest,
        scheduled_start,
        leader_id: user.id,
      });
    };

    console.log("useSessionActions: openModal with isLoading", isCreating);
    openModal<CreateSessionModalProps>(SESSION_MODAL_TYPES.CREATE, {
      onConfirm: handleConfirm,
      isLoading: isCreating,
    });
  }, [handleCreateSession, isCreating, openModal, user.id]);

  const deleteSession = useCallback(() => {
    if (!sessionId) return;
    openModal(SESSION_MODAL_TYPES.DELETE, {
      sessionId,
      onConfirm: handleDeleteSession,
      isLoading: isDeleting,
    });
  }, [sessionId, handleDeleteSession, isDeleting, openModal]);

  const updateSession = useCallback(() => {
    if (!sessionId) return;
    const session = sessions[sessionId];
    if (!session) return;

    const handleConfirm = async (
      sessionId: string,
      data: CreateSessionInput
    ) => {
      const { start_date, start_time, ...rest } = data;
      const startDateTime = `${start_date.split("T")[0]}T${start_time}`;
      await handleUpdateSession({
        sessionId,
        data: { ...rest, scheduled_start: startDateTime },
      });
    };

    const handleUpdateStatus = async (
      sessionId: string,
      status: Sessions["status"]
    ) => {
      await updateSessionStatus(status);
    };

    console.log(
      "useSessionActions: openModal UPDATE with isLoading",
      isUpdating
    );
    openModal(SESSION_MODAL_TYPES.UPDATE, {
      sessionId,
      session,
      onConfirm: handleConfirm,
      onUpdateStatus: handleUpdateStatus,
      isLoading: isUpdating,
    });
  }, [
    sessionId,
    sessions,
    handleUpdateSession,
    updateSessionStatus,
    isUpdating,
    openModal,
  ]);

  const startSession = async () => {
    try {
      if (!sessionId) return;
      const session = sessions[sessionId];
      if (!session) return;
      if (session.status !== "active") await updateSessionStatus("active");
      else if (session.status === "active") {
        updateSessionStatus("completed");
      }
    } catch {}
  };

  return {
    startSession,
    updateSessionStatus,
    updateSession,
    createSession,
    deleteSession,
  };
};
