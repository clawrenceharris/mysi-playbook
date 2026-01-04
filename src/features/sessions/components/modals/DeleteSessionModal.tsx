'use client';

import { FormLayout } from '@/components/form';
import { DialogContent } from '@/components/ui';
import type { DeleteSessionModalProps } from '@/lib/modals/types';
import { useModal } from '@/lib/modals/ModalProvider';

export function DeleteSessionModal({
  sessionId,
  onConfirm,
  isLoading = false,
}: DeleteSessionModalProps) {
  const { closeModal } = useModal();

  console.log("DeleteSessionModal: render with isLoading", isLoading);

  return (
    <DialogContent
      title="Delete Session"
      description="Are you sure you want to delete this session? You can't undo this action."
      className="max-w-lg"
    >
      <FormLayout<{ confirm: boolean }>
        submitText="I'm sure"
        onSuccess={closeModal}
        onSubmit={async () => {
          await onConfirm(sessionId);
        }}
        onCancel={closeModal}
        isLoading={isLoading}
      />
    </DialogContent>
  );
}

