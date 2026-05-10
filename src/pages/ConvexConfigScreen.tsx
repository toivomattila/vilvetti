export function ConvexConfigScreen() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-xl font-semibold">Vilvetti</h1>
      <p className="max-w-md text-sm text-muted-foreground">
        Set{' '}
        <code className="rounded bg-muted px-1 py-0.5">VITE_CONVEX_URL</code> to
        enable authentication and app routes.
      </p>
    </main>
  )
}
