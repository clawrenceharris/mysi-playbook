/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { createContext, useCallback, useContext, useState } from "react";
import { createPortal } from "react-dom";
import { Button, Dialog, DialogContent } from "@/components/ui";

interface ModalContent {
  title: string;
  description: string;
  children?: React.ReactNode;
  childProps?: { [key: string]: unknown };
  onClose?: () => void;
  onSubmit?: (data: any) => any | Promise<any>;

  showsSubmitButton?: boolean;
  submitText?: string;
}

interface ModalProviderProps {
  children: React.ReactNode;
}

interface ModalContextType {
  openModal: (opts: ModalContent) => void;
  closeModal: () => void;
  isOpen: boolean;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider = ({ children }: ModalProviderProps) => {
  const [modal, setModal] = useState<ModalContent | null>(null);
  const isOpen = modal !== null;
  const [isLoading, setIsLoading] = useState(false);
  const openModal = useCallback((opts: ModalContent) => {
    setModal(opts);
  }, []);

  const closeModal = useCallback(() => {
    modal?.onClose?.();
    setModal(null);
  }, [modal]);
  const handleSubmit = async (data: any) => {
    try {
      setIsLoading(true);
      await modal?.onSubmit?.(data);
      closeModal();
    } catch {
    } finally {
      setIsLoading(false);
    }
  };
  const modalPortal = isOpen
    ? createPortal(
        <Dialog open={isOpen} onOpenChange={closeModal}>
          <DialogContent title={modal.title} description={modal.description}>
            {modal.children &&
              (React.isValidElement(modal.children)
                ? React.cloneElement(modal.children, {
                    isLoading,
                    onSubmit: handleSubmit,
                  } as any)
                : modal.children)}

            {modal.showsSubmitButton && (
              <Button onClick={modal.onSubmit}>
                {modal.submitText || "Done"}
              </Button>
            )}
          </DialogContent>
        </Dialog>,
        document.body
      )
    : null;

  const value: ModalContextType = {
    openModal,
    closeModal,
    isOpen,
  };

  return (
    <ModalContext.Provider value={value}>
      {children}
      {modalPortal}
    </ModalContext.Provider>
  );
};

export const useModal = () => {
  const ctx = useContext(ModalContext);
  if (!ctx) throw new Error("useModal must be used within ModalProvider");
  return ctx;
};
