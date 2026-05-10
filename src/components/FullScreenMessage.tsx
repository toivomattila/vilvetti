export function FullScreenMessage({ message }: { message: string }) {
  return (
    <main className="flex min-h-svh items-center justify-center p-6">
      <p className="text-sm text-muted-foreground">{message}</p>
    </main>
  )
}
