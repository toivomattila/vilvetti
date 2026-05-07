import { useMutation } from 'convex/react'
import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../convex/_generated/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

type OnboardingMode = 'office' | 'technician'

export function OnboardingPage() {
  const navigate = useNavigate()
  const createOffice = useMutation(api.profiles.createOrganizationAndProfile)
  const joinAsTechnician = useMutation(
    api.profiles.joinOrganizationAsTechnician,
  )

  const [mode, setMode] = useState<OnboardingMode>('office')
  const [error, setError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setIsSaving(true)

    const formData = new FormData(event.currentTarget)
    const slug = String(formData.get('slug') ?? '')
    const displayName = String(formData.get('displayName') ?? '')

    try {
      if (mode === 'office') {
        const organizationName = String(formData.get('organizationName') ?? '')
        await createOffice({ organizationName, slug, displayName })
        navigate('/office', { replace: true })
      } else {
        await joinAsTechnician({ slug, displayName })
        navigate('/field', { replace: true })
      }
    } catch (mutationError) {
      setError(
        mutationError instanceof Error
          ? mutationError.message
          : 'Could not save your profile.',
      )
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <main className="flex min-h-svh items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-3">
          <CardTitle className="text-xl">Set up your profile</CardTitle>
          <Tabs
            value={mode}
            onValueChange={(value) => {
              setMode(value as OnboardingMode)
              setError(null)
            }}
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="office">Office</TabsTrigger>
              <TabsTrigger value="technician">Technician</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            {mode === 'office' ? (
              <div className="space-y-2">
                <Label htmlFor="organizationName">Organization name</Label>
                <Input
                  id="organizationName"
                  name="organizationName"
                  placeholder="Vilvetti Services"
                  required
                />
              </div>
            ) : null}
            <div className="space-y-2">
              <Label htmlFor="slug">
                {mode === 'office' ? 'Organization slug' : 'Join code'}
              </Label>
              <Input id="slug" name="slug" placeholder="vilvetti" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="displayName">Display name</Label>
              <Input
                id="displayName"
                name="displayName"
                placeholder="Your name"
                required
              />
            </div>
            {error ? <p className="text-destructive text-sm">{error}</p> : null}
            <Button className="w-full" disabled={isSaving} type="submit">
              {isSaving ? 'Saving...' : 'Continue'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  )
}
