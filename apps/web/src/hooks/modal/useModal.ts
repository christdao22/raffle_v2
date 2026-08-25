import { useCallback, useState } from "react";

export interface UseModalReturn<T = any> {
  isOpen: boolean;
  data: T | null;
  openModal: (modalData?: T) => void;
  closeModal: () => void;
  toggleModal: () => void;
}

export function useModal<T = any>(initialState = false): UseModalReturn<T> {
  const [isOpen, setIsOpen] = useState(initialState);
  const [data, setData] = useState<T | null>(null);

  const openModal = useCallback((modalData?: T) => {
    if (modalData !== undefined) {
      setData(modalData);
    }
    setIsOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
  }, []);

  const toggleModal = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  return {
    isOpen,
    data,
    openModal,
    closeModal,
    toggleModal,
  };
}
