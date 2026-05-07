import { useConvexAuth } from '@convex-dev/auth/react'
import { useQuery } from 'convex/react'
import { Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { api } from '../convex/_generated/api'
import { AppHeader } from '@/components/AppHeader'
import { EmailPasswordAuth } from '@/EmailPasswordAuth'
import { OnboardingPage } from '@/pages/OnboardingPage'
import { OfficeCreateJobPage } from '@/pages/OfficeCreateJobPage'
import { OfficeJobDetailPage } from '@/pages/OfficeJobDetailPage'
import { OfficeJobsPage } from '@/pages/OfficeJobsPage'
import { TechnicianJobDetailPage } from '@/pages/TechnicianJobDetailPage'
import { TechnicianJobsPage } from '@/pages/TechnicianJobsPage'

function FullScreenMessage({ message }: { message: string }) {
  return (
    <main className="flex min-h-svh items-center justify-center p-6">
      <p className="text-sm text-muted-foreground">{message}</p>
    </main>
  )
}

function AuthScreen() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-4 p-4">
      <div className="text-center">
        <h1 className="text-xl font-semibold">Vilvetti</h1>
        <p className="text-sm text-muted-foreground">
          Sign in to manage office and field workflows.
        </p>
      </div>
      <EmailPasswordAuth />
    </main>
  )
}

function RootEntryRoute() {
  const { isAuthenticated, isLoading } = useConvexAuth()
  const profileResult = useQuery(
    api.profiles.getMyProfile,
    isAuthenticated ? {} : 'skip',
  )

  if (isLoading) {
    return <FullScreenMessage message="Checking session..." />
  }
  if (!isAuthenticated) {
    return <AuthScreen />
  }
  if (profileResult === undefined) {
    return <FullScreenMessage message="Loading your profile..." />
  }
  if (profileResult === null) {
    return <OnboardingPage />
  }

  return (
    <Navigate
      replace
      to={profileResult.profile.role === 'office' ? '/office' : '/field'}
    />
  )
}

function RoleLayout({ role }: { role: 'office' | 'technician' }) {
  const { isAuthenticated, isLoading } = useConvexAuth()
  const profileResult = useQuery(
    api.profiles.getMyProfile,
    isAuthenticated ? {} : 'skip',
  )

  if (isLoading) {
    return <FullScreenMessage message="Checking session..." />
  }
  if (!isAuthenticated) {
    return <Navigate replace to="/" />
  }
  if (profileResult === undefined) {
    return <FullScreenMessage message="Loading your profile..." />
  }
  if (profileResult === null) {
    return <Navigate replace to="/" />
  }

  if (profileResult.profile.role !== role) {
    return <Navigate replace to={role === 'office' ? '/field' : '/office'} />
  }

  return (
    <div className="min-h-svh bg-muted/20">
      <AppHeader displayName={profileResult.profile.displayName} role={role} />
      <Outlet />
    </div>
  )
}

export default function App() {
  const convexUrl = import.meta.env.VITE_CONVEX_URL

  if (!convexUrl) {
    return (
      <main className="flex min-h-svh flex-col items-center justify-center gap-4 p-6 text-center">
        <h1 className="text-xl font-semibold">Vilvetti</h1>
        <p className="max-w-md text-sm text-muted-foreground">
          Set `VITE_CONVEX_URL` to enable authentication and app routes.
        </p>
      </main>
    )
  }

  return (
    <Routes>
      <Route element={<RootEntryRoute />} path="/" />

      <Route element={<RoleLayout role="office" />} path="/office">
        <Route element={<OfficeJobsPage />} index />
        <Route element={<OfficeCreateJobPage />} path="jobs/new" />
        <Route element={<OfficeJobDetailPage />} path="jobs/:id" />
      </Route>

      <Route element={<RoleLayout role="technician" />} path="/field">
        <Route element={<TechnicianJobsPage />} index />
        <Route element={<TechnicianJobDetailPage />} path="jobs/:id" />
      </Route>

      <Route element={<Navigate replace to="/" />} path="*" />
    </Routes>
  )
}
