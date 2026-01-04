"use client";

import { DialogContent } from "@/components/ui";
import { FormLayout } from "@/components/form";
import { CreateSessionForm } from "@/components/features/sessions";
import { createSessionSchema } from "@/features/sessions/domain";
import { zodResolver } from "@hookform/resolvers/zod";
import type { UpdateSessionModalProps } from "@/lib/modals/types";
import { useModal } from "@/lib/modals/ModalProvider";

export function UpdateSessionModal({
  sessionId,
  session,
  onConfirm,
  onUpdateStatus,
  isLoading = false,
}: UpdateSessionModalProps) {
  const { closeModal } = useModal();

  const handleSubmit = async (
    data: import("@/features/sessions/domain").CreateSessionInput
  ) => {
    console.log(
      "UpdateSessionModal: handleSubmit called with isLoading",
      isLoading
    );
    await onConfirm(sessionId, data);
    if (onUpdateStatus) {
      await onUpdateStatus(sessionId, "scheduled");
    }
  };

  console.log("UpdateSessionModal: render with isLoading", isLoading);

  return (
    <DialogContent
      title="Edit Session"
      description={`Edit your ${session.topic} session`}
      className="max-w-2xl"
    >
      <FormLayout
        resolver={zodResolver(createSessionSchema)}
        defaultValues={{
          status: "scheduled",
          topic: session.topic,
          course_name: session.course_name || "",
          start_date: session.scheduled_start.split("T")[0],
          start_time: session.scheduled_start.split("T")[1].slice(0, 5),
        }}
        isLoading={isLoading}
        onCancel={closeModal}
        onSuccess={closeModal}
        onSubmit={handleSubmit}
      >
        <CreateSessionForm />
      </FormLayout>
    </DialogContent>
  );
}
