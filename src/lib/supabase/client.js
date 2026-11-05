import { createBrowserClient } from '@supabase/ssr'
import { createUnconfiguredSupabaseClient, getSupabaseEnv } from './env'

let browserClient = null

export function createClient() {
  const { url, anonKey, isConfigured } = getSupabaseEnv()

  if (!isConfigured) {
    return createUnconfiguredSupabaseClient()
  }

  if (typeof window === 'undefined') {
    return createBrowserClient(url, anonKey)
  }

  if (!browserClient) {
    browserClient = createBrowserClient(url, anonKey)
  }

  return browserClient
}
