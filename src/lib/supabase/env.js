export const MISSING_SUPABASE_ENV_MESSAGE =
  'Konfigurasi Supabase belum diatur. Tambahkan NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_ANON_KEY pada file .env.local.'

export function getSupabaseEnv() {
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ||
    'https://youqixjjsdhgmkzdjjck.supabase.co'
  const anonKey =
    (
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY
    )?.trim() ||
    'sb_publishable_SuiQ5-bcUKMUiqQWZpBT-Q_iYYLydQD'

  const hasValidUrl =
    (url.startsWith('https://') || url.startsWith('http://')) &&
    !url.includes('your-project') &&
    !url.includes('<')

  const hasValidKey =
    anonKey.length > 0 &&
    !anonKey.includes('your-anon-key') &&
    !anonKey.includes('<')

  return {
    url,
    anonKey,
    isConfigured: Boolean(hasValidUrl && hasValidKey),
  }
}

function createUnconfiguredQueryBuilder() {
  const result = Promise.resolve({
    data: null,
    error: new Error(MISSING_SUPABASE_ENV_MESSAGE),
  })

  const builder = new Proxy(
    {},
    {
      get(_target, prop) {
        if (prop === 'then') return result.then.bind(result)
        if (prop === 'catch') return result.catch.bind(result)
        if (prop === 'finally') return result.finally.bind(result)
        return () => builder
      },
    }
  )

  return builder
}

export function createUnconfiguredSupabaseClient() {
  return {
    auth: {
      async getUser() {
        return { data: { user: null }, error: null }
      },
      onAuthStateChange() {
        return {
          data: {
            subscription: {
              unsubscribe() {},
            },
          },
        }
      },
      async signInWithPassword() {
        return {
          data: { user: null, session: null },
          error: new Error(MISSING_SUPABASE_ENV_MESSAGE),
        }
      },
      async signUp() {
        return {
          data: { user: null, session: null },
          error: new Error(MISSING_SUPABASE_ENV_MESSAGE),
        }
      },
      async exchangeCodeForSession() {
        return {
          data: { user: null, session: null },
          error: new Error(MISSING_SUPABASE_ENV_MESSAGE),
        }
      },
      async signOut() {
        return { error: null }
      },
    },
    from() {
      return createUnconfiguredQueryBuilder()
    },
    rpc() {
      return createUnconfiguredQueryBuilder()
    },
  }
}
