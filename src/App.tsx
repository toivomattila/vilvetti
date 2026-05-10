import { useConvexAuth } from '@convex-dev/auth/react'
import { useQuery } from 'convex/react'
import { Link, Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { api } from '../convex/_generated/api'
import { AppHeader } from '@/components/AppHeader'
import { FullScreenMessage } from '@/components/FullScreenMessage'
import { EmailPasswordAuth } from '@/EmailPasswordAuth'
import { ConvexConfigScreen } from '@/pages/ConvexConfigScreen'
import { HomeRoute } from '@/pages/HomeRoute'
import { LandingPage } from '@/pages/LandingPage'
import { OnboardingPage } from '@/pages/OnboardingPage'
import { OfficeJobFormPage } from '@/pages/OfficeJobFormPage'
import { OfficeJobDetailPage } from '@/pages/OfficeJobDetailPage'
import { OfficeJobsPage } from '@/pages/OfficeJobsPage'
import { TechnicianJobDetailPage } from '@/pages/TechnicianJobDetailPage'
import { TechnicianJobsPage } from '@/pages/TechnicianJobsPage'
import { Button } from '@/components/ui/button'

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
      <Button asChild className="text-muted-foreground" variant="link">
        <Link to="/">← Back to home</Link>
      </Button>
    </main>
  )
}

function SignInEntryRoute() {
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
    return <Navigate replace to="/sign-in" />
  }
  if (profileResult === undefined) {
    return <FullScreenMessage message="Loading your profile..." />
  }
  if (profileResult === null) {
    return <Navigate replace to="/sign-in" />
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

  return (
    <Routes>
      <Route element={convexUrl ? <HomeRoute /> : <LandingPage />} path="/" />
      <Route
        element={convexUrl ? <SignInEntryRoute /> : <ConvexConfigScreen />}
        path="/sign-in"
      />

      {convexUrl ? (
        <Route element={<RoleLayout role="office" />} path="/office">
          <Route element={<OfficeJobsPage />} index />
          <Route element={<OfficeJobFormPage />} path="jobs/new" />
          <Route element={<OfficeJobFormPage />} path="jobs/:jobId/edit" />
          <Route element={<OfficeJobDetailPage />} path="jobs/:id" />
        </Route>
      ) : null}
      {convexUrl ? (
        <Route element={<RoleLayout role="technician" />} path="/field">
          <Route element={<TechnicianJobsPage />} index />
          <Route element={<TechnicianJobDetailPage />} path="jobs/:id" />
        </Route>
      ) : null}

      <Route element={<Navigate replace to="/" />} path="*" />
    </Routes>
  )
}
