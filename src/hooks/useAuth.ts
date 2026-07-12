import { useSyncExternalStore } from 'react'
import { getStoredUsername, subscribeSession } from '../config/api'

function subscribe(listener: () => void) {
  const unsub = subscribeSession(listener)
  // pick up sign-in/out from other tabs too
  window.addEventListener('storage', listener)
  return () => {
    unsub()
    window.removeEventListener('storage', listener)
  }
}

/** Community session state: signed-in username (null when signed out). */
export default function useAuth() {
  const username = useSyncExternalStore(subscribe, getStoredUsername)
  return { username, signedIn: username !== null }
}
