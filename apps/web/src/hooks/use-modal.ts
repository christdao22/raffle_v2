import { useCallback, useState } from "react";

export interface ModalOptions<T = unknown> {
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info";
  data?: T;
  onConfirm?: (data?: T) => Promise<void> | void;
}

export function useModal<T = unknown>() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [config, setConfig] = useState<ModalOptions<T>>({});

  // Opens modal and dynamically injects text, variants, data, and callbacks
  const openModal = useCallback((options: ModalOptions<T> = {}) => {
    setConfig(options);
    setIsOpen(true);
  }, []);

  // Closes modal and resets internal state
  const closeModal = useCallback(() => {
    setIsOpen(false);
    setIsLoading(false);
  }, []);

  // Wraps onConfirm to automatically handle loading states & auto-closing
  const handleConfirm = useCallback(async () => {
    if (!config.onConfirm) {
      closeModal();
      return;
    }

    try {
      setIsLoading(true);
      await config.onConfirm(config.data);
      closeModal();
    } catch (error) {
      console.error("Modal confirmation error:", error);
      setIsLoading(false);
    }
  }, [config, closeModal]);

  return {
    isOpen,
    isLoading,
    closeModal,
    openModal,
    modalProps: {
      isOpen,
      isLoading,
      onClose: closeModal,
      onConfirm: handleConfirm,
      title: config.title,
      description: config.description,
      confirmText: config.confirmText,
      cancelText: config.cancelText,
      variant: config.variant,
      data: config.data,
    },
  };
}
