import { createContext, useContext } from 'react'
import { SiteFlags, cachedFlags } from '../config/siteFlags'

/** Carries the page feature flags; App fetches them and provides the value. */
export const FlagsContext = createContext<SiteFlags>(cachedFlags())

export function useFlags() {
  return useContext(FlagsContext)
}
