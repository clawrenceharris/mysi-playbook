'use client';

import { FormLayout } from '@/components/form';
import { DialogContent } from '@/components/ui';
import type { DeletePlaybookModalProps } from '@/lib/modals/types';
import { useModal } from '@/lib/modals/ModalProvider';

export function DeletePlaybookModal({
  playbookId,
  onConfirm,
  isLoading = false,
}: DeletePlaybookModalProps) {
  const { closeModal } = useModal();

  console.log("DeletePlaybookModal: render with isLoading", isLoading);

  return (
    <DialogContent
      title="Delete Playbook"
      description="Are you sure you want to delete this playbook? You can't undo this action."
      className="max-w-lg"
    >
      <FormLayout<{ confirm: boolean }>
        submitText="I'm sure"
        onSuccess={closeModal}
        onSubmit={async () => {
          await onConfirm(playbookId);
        }}
        onCancel={closeModal}
        isLoading={isLoading}
      />
    </DialogContent>
  );
}

