import { createContext, useContext } from 'react'

/** Carries the mailing-list modal opener so any component can summon it. */
export const ModalContext = createContext<() => void>(() => {})

export function useOpenModal() {
  return useContext(ModalContext)
}
