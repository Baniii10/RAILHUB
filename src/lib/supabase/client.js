import { createBrowserClient } from '@supabase/ssr'
import { createUnconfiguredSupabaseClient, getSupabaseEnv } from './env'

export function createClient() {
  const { url, anonKey, isConfigured } = getSupabaseEnv()

  if (!isConfigured) {
    return createUnconfiguredSupabaseClient()
  }

  return createBrowserClient(url, anonKey)
}
