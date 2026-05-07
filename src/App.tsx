import { EmailPasswordAuth } from './EmailPasswordAuth'

export default function App() {
  const convexUrl = import.meta.env.VITE_CONVEX_URL

  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-6 p-6">
      <div className="flex flex-col items-center gap-1 text-center">
        <h1 className="text-lg font-medium text-foreground">Vilvetti</h1>
        <p className="text-sm text-muted-foreground">
          {convexUrl
            ? 'Email and password (Convex Auth).'
            : 'Set VITE_CONVEX_URL to enable auth.'}
        </p>
      </div>
      {convexUrl ? <EmailPasswordAuth /> : null}
    </main>
  )
}
