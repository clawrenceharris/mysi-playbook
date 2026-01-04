'use client';

import { DialogContent } from '@/components/ui';
import { GeneratePlaybookForm } from '@/components/features/playbooks';
import type { GeneratePlaybookModalProps } from '@/lib/modals/types';
import { useModal } from '@/lib/modals/ModalProvider';

export function GeneratePlaybookModal({
  onConfirm,
  isLoading = false,
}: GeneratePlaybookModalProps) {
  const { closeModal } = useModal();

  return (
    <DialogContent
      title="Generate Playbook"
      description="Enter your course name and topic to generate a basic Playbook that you can build off of."
      className="max-w-2xl"
    >
      <GeneratePlaybookForm
        onSubmit={onConfirm}
        isLoading={isLoading}
        onCancel={closeModal}
      />
    </DialogContent>
  );
}

