import { useAuthActions } from '@convex-dev/auth/react'
import { Link, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'

type AppHeaderProps = {
  role: 'office' | 'technician'
  displayName: string
}

export function AppHeader({ role, displayName }: AppHeaderProps) {
  const location = useLocation()
  const { signOut } = useAuthActions()
  const homePath = role === 'office' ? '/office' : '/field'

  return (
    <header className="border-b bg-background">
      <div className="mx-auto flex w-full max-w-3xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <div>
          <p className="font-semibold">Vilvetti</p>
          <p className="text-xs text-muted-foreground">{displayName}</p>
        </div>
        <nav className="flex items-center gap-2">
          <Button
            asChild
            size="sm"
            variant={
              location.pathname.startsWith(homePath) ? 'default' : 'outline'
            }
          >
            <Link to={homePath}>
              {role === 'office' ? 'Office' : 'My jobs'}
            </Link>
          </Button>
          {role === 'office' ? (
            <Button
              asChild
              size="sm"
              variant={
                location.pathname.startsWith('/office/jobs/new')
                  ? 'default'
                  : 'outline'
              }
            >
              <Link to="/office/jobs/new">New job</Link>
            </Button>
          ) : null}
          <Button
            onClick={() => void signOut()}
            size="sm"
            type="button"
            variant="outline"
          >
            Sign out
          </Button>
        </nav>
      </div>
    </header>
  )
}
