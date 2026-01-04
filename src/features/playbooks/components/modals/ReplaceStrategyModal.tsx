'use client';

import { FormLayout } from '@/components/form';
import { DialogContent } from '@/components/ui';
import { StrategySelectionForm } from '@/components/features/strategies';
import type { ReplaceStrategyModalProps } from '@/lib/modals/types';
import { useModal } from '@/lib/modals/ModalProvider';
import type { Strategies } from '@/types/tables';

export function ReplaceStrategyModal({
  strategyToReplace,
  playbookId,
  onConfirm,
  isLoading = false,
}: ReplaceStrategyModalProps) {
  const { closeModal } = useModal();

  const handleSubmit = async (data: { strategy: Strategies }) => {
    await onConfirm(strategyToReplace, data.strategy);
  };

  return (
    <DialogContent
      title="Replace Strategy"
      description="Select a strategy to add in replacement"
      className="max-w-2xl"
    >
      <FormLayout<{ strategy: Strategies }>
        onCancel={closeModal}
        onSubmit={handleSubmit}
        submitText="Replace"
        onSuccess={closeModal}
        isLoading={isLoading}
      >
        <StrategySelectionForm strategyToReplace={strategyToReplace} />
      </FormLayout>
    </DialogContent>
  );
}

