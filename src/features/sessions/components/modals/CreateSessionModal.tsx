'use client';

import React from 'react';
import { DialogContent } from '@/components/ui';
import { FormLayout } from '@/components/form';
import { CreateSessionForm } from '@/components/features/sessions';
import type { CreateSessionModalProps } from '@/lib/modals/types';
import { useModal } from '@/lib/modals/ModalProvider';
import type { CreateSessionInput } from '@/features/sessions/domain';

export function CreateSessionModal({
  onConfirm,
  isLoading = false,
}: CreateSessionModalProps) {
  const { closeModal } = useModal();

  // #region agent log
  React.useEffect(() => {
    console.log("CreateSessionModal: isLoading changed to", isLoading);
    fetch('http://127.0.0.1:7242/ingest/64a3f3e8-235c-40b2-ad71-c3a7282cd6ca',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'CreateSessionModal.tsx:render',message:'CreateSessionModal render',data:{isLoading},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
  }, [isLoading]);
  console.log("CreateSessionModal: render with isLoading", isLoading);
  // #endregion

  const handleSubmit = async (data: CreateSessionInput) => {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/64a3f3e8-235c-40b2-ad71-c3a7282cd6ca',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'CreateSessionModal.tsx:handleSubmit',message:'handleSubmit called',data:{isLoading},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
    // #endregion
    await onConfirm(data);
  };

  return (
    <DialogContent
      title="Create Session"
      description="Create and schedule a new SI session."
      className="max-w-2xl"
    >
      <FormLayout<CreateSessionInput>
        onCancel={closeModal}
        onSuccess={closeModal}
        onSubmit={handleSubmit}
        isLoading={isLoading}
      >
        <CreateSessionForm />
      </FormLayout>
    </DialogContent>
  );
}

