import { useAuthActions, useConvexAuth } from '@convex-dev/auth/react'
import { useState } from 'react'

export function EmailPasswordAuth() {
  const { isLoading, isAuthenticated } = useConvexAuth()
  const { signIn, signOut } = useAuthActions()
  const [mode, setMode] = useState<'signIn' | 'signUp'>('signIn')
  const [error, setError] = useState<string | null>(null)

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Checking session…</p>
  }

  if (isAuthenticated) {
    return (
      <div className="flex flex-col items-center gap-3">
        <p className="text-sm text-muted-foreground">You are signed in.</p>
        <button
          type="button"
          className="rounded-md border border-border bg-background px-3 py-1.5 text-sm font-medium text-foreground hover:bg-muted"
          onClick={() => void signOut()}
        >
          Sign out
        </button>
      </div>
    )
  }

  return (
    <div className="flex w-full max-w-sm flex-col gap-3">
      <form
        className="flex flex-col gap-2"
        onSubmit={(event) => {
          event.preventDefault()
          setError(null)
          const form = event.currentTarget
          const formData = new FormData(form)
          void signIn('password', formData).catch((err: unknown) => {
            setError(err instanceof Error ? err.message : 'Sign-in failed')
          })
        }}
      >
        <label
          className="text-xs font-medium text-muted-foreground"
          htmlFor="email"
        >
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="border-input rounded-md border bg-background px-3 py-2 text-sm"
        />
        <label
          className="text-xs font-medium text-muted-foreground"
          htmlFor="password"
        >
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete={mode === 'signUp' ? 'new-password' : 'current-password'}
          required
          minLength={8}
          className="border-input rounded-md border bg-background px-3 py-2 text-sm"
        />
        <input name="flow" type="hidden" value={mode} />
        <button
          type="submit"
          className="bg-primary text-primary-foreground mt-1 rounded-md px-3 py-2 text-sm font-medium hover:opacity-90"
        >
          {mode === 'signIn' ? 'Sign in' : 'Sign up'}
        </button>
      </form>
      <button
        type="button"
        className="text-xs text-muted-foreground underline-offset-2 hover:underline"
        onClick={() => {
          setMode((m) => (m === 'signIn' ? 'signUp' : 'signIn'))
          setError(null)
        }}
      >
        {mode === 'signIn'
          ? 'Need an account? Sign up'
          : 'Already have an account? Sign in'}
      </button>
      {error ? (
        <p className="text-destructive text-center text-xs">{error}</p>
      ) : null}
    </div>
  )
}
