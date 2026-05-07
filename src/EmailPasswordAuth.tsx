import { useAuthActions, useConvexAuth } from '@convex-dev/auth/react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

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
      <div className="flex flex-col items-center gap-3 p-4">
        <p className="text-sm text-muted-foreground">You are signed in.</p>
        <Button onClick={() => void signOut()} type="button" variant="outline">
          Sign out
        </Button>
      </div>
    )
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">
          {mode === 'signIn' ? 'Sign in' : 'Create account'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <form
          className="space-y-3"
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
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              autoComplete="email"
              id="email"
              name="email"
              required
              type="email"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              autoComplete={
                mode === 'signUp' ? 'new-password' : 'current-password'
              }
              id="password"
              minLength={8}
              name="password"
              required
              type="password"
            />
          </div>
          <input name="flow" type="hidden" value={mode} />
          <Button className="w-full" type="submit">
            {mode === 'signIn' ? 'Sign in' : 'Sign up'}
          </Button>
        </form>
        <Button
          className="w-full"
          onClick={() => {
            setMode((m) => (m === 'signIn' ? 'signUp' : 'signIn'))
            setError(null)
          }}
          type="button"
          variant="outline"
        >
          {mode === 'signIn'
            ? 'Need an account? Sign up'
            : 'Already have an account? Sign in'}
        </Button>
        {error ? (
          <p className="text-destructive text-center text-xs">{error}</p>
        ) : null}
      </CardContent>
    </Card>
  )
}
