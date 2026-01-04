"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
} from "react";
import { createPortal } from "react-dom";
import { Dialog } from "@/components/ui";
import { modalRegistry } from "./registry";
import type { ModalType, ModalProps, ModalState } from "./types";

interface ModalContextType {
  openModal: <T extends ModalProps>(type: ModalType, props: T) => void;
  updateModalProps: <T extends ModalProps>(updates: Partial<T>) => void;
  closeModal: () => void;
  isOpen: boolean;
  currentModalType: ModalType | null;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

interface ModalProviderProps {
  children: React.ReactNode;
}

export function ModalProvider({ children }: ModalProviderProps) {
  const [modalState, setModalState] = useState<ModalState>({
    type: null,
    props: null,
  });

  const closeModal = useCallback(() => {
    setModalState({ type: null, props: null });
  }, []);

  const updateModalProps = useCallback(
    <T extends ModalProps>(updates: Partial<T>) => {
      console.log("ModalProvider: updateModalProps called with", updates);
      setModalState((prev) => {
        if (!prev.type || !prev.props) return prev;
        const newProps = { ...prev.props, ...updates } as ModalProps;
        console.log("ModalProvider: updating modal props", newProps);
        return {
          ...prev,
          props: newProps,
        };
      });
    },
    []
  );

  const openModal = useCallback(
    <T extends ModalProps>(type: ModalType, props: T) => {
      console.log("openModal");
      console.log(type);
      console.log(props);
      if (!modalRegistry.has(type)) {
        console.error(`Modal type "${type}" is not registered.`);
        return;
      }
      // #region agent log
      fetch(
        "http://127.0.0.1:7242/ingest/64a3f3e8-235c-40b2-ad71-c3a7282cd6ca",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            location: "ModalProvider.tsx:openModal",
            message: "openModal called",
            data: {
              type,
              props: JSON.stringify(props),
              isLoading: props.isLoading,
            },
            timestamp: Date.now(),
            sessionId: "debug-session",
            runId: "run1",
            hypothesisId: "A",
          }),
        }
      ).catch(() => {});
      // #endregion
      setModalState({ type, props });
    },
    []
  );

  const value = useMemo<ModalContextType>(
    () => ({
      openModal,
      updateModalProps,
      closeModal,
      isOpen: modalState.type !== null,
      currentModalType: modalState.type,
    }),
    [openModal, updateModalProps, closeModal, modalState.type]
  );

  // Render the modal component
  const modalContent =
    modalState.type && modalState.props
      ? (() => {
          const Component = modalRegistry.getComponent(modalState.type);
          if (!Component) {
            console.error(
              `No component found for modal type: ${modalState.type}`
            );
            return null;
          }
          // #region agent log
          console.log(
            "ModalProvider: Rendering modal",
            modalState.type,
            "with props",
            modalState.props
          );
          console.log(
            "ModalProvider: isLoading in props",
            modalState.props.isLoading
          );
          fetch(
            "http://127.0.0.1:7242/ingest/64a3f3e8-235c-40b2-ad71-c3a7282cd6ca",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                location: "ModalProvider.tsx:render",
                message: "Rendering modal with props",
                data: {
                  type: modalState.type,
                  isLoading: modalState.props.isLoading,
                },
                timestamp: Date.now(),
                sessionId: "debug-session",
                runId: "run1",
                hypothesisId: "B",
              }),
            }
          ).catch(() => {});
          // #endregion
          // Modal components render DialogContent which includes DialogPortal,
          // so we need to wrap in Dialog root
          return (
            <Dialog open={true} onOpenChange={closeModal}>
              <Component {...modalState.props} />
            </Dialog>
          );
        })()
      : null;

  const modalPortal =
    modalState.type && modalContent
      ? createPortal(modalContent, document.body)
      : null;

  return (
    <ModalContext.Provider value={value}>
      {children}
      {modalPortal}
    </ModalContext.Provider>
  );
}

export function useModal() {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useModal must be used within ModalProvider");
  }
  return context;
}
