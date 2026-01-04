import { useEffect, useMemo, useState } from "react";
import { usePlaybook } from "./";
import { useSessions } from "@/features/sessions/hooks";

export const usePlaybookState = (playbookId: string) => {
  const { isUpdating, playbook } = usePlaybook(playbookId);
  const [isSaving, setIsSaving] = useState(false);
  const { sessions } = useSessions();

  useEffect(() => {
    if (isUpdating) setIsSaving(true);
    if (!isUpdating) {
      setTimeout(() => {
        setIsSaving(false);
      }, 900);
    }
  }, [isUpdating]);

  const lastUpdate = useMemo(() => {
    if (!playbook) return null;
    const lastUpdatedStrategy = playbook.strategies.find(
      (s) =>
        s.updated_at &&
        playbook.updated_at &&
        new Date(s.updated_at) > new Date(playbook.updated_at)
    );
    return lastUpdatedStrategy?.updated_at || playbook.updated_at;
  }, [playbook]);

  const hasSession = useMemo(
    () => Object.values(sessions).some((s) => s.playbook_id === playbookId),
    [playbookId, sessions]
  );
  return { isSaving, hasSession, lastUpdate };
};
