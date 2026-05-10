import { useConvexAuth } from '@convex-dev/auth/react'
import { useQuery } from 'convex/react'
import { Navigate } from 'react-router-dom'
import { api } from '../../convex/_generated/api'
import { FullScreenMessage } from '@/components/FullScreenMessage'
import { LandingPage } from '@/pages/LandingPage'

export function HomeRoute() {
  const { isAuthenticated, isLoading } = useConvexAuth()
  const profileResult = useQuery(
    api.profiles.getMyProfile,
    isAuthenticated ? {} : 'skip',
  )

  if (isLoading) {
    return <FullScreenMessage message="Checking session..." />
  }
  if (!isAuthenticated) {
    return <LandingPage />
  }
  if (profileResult === undefined) {
    return <FullScreenMessage message="Loading your profile..." />
  }
  if (profileResult === null) {
    return <Navigate replace to="/sign-in" />
  }

  return (
    <Navigate
      replace
      to={profileResult.profile.role === 'office' ? '/office' : '/field'}
    />
  )
}
