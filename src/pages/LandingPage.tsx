import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Building2,
  CalendarDays,
  CircleCheck,
  ClipboardCheck,
  Shield,
  Users,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const features = [
  {
    title: 'Office visibility',
    description:
      'Create jobs, track status from scheduling through closeout, and keep everyone aligned without scattered spreadsheets.',
    icon: Building2,
  },
  {
    title: 'Field-ready worklists',
    description:
      'Technicians see the day’s appointments, open the right job fast, and submit structured closeouts from the job site.',
    icon: CalendarDays,
  },
  {
    title: 'Controlled access',
    description:
      'Separate office and technician roles with invite codes so your org stays tidy as the team grows.',
    icon: Shield,
  },
] as const

const steps = [
  {
    title: 'Office sets the schedule',
    body: 'Dispatch jobs with clear appointments and status so the field always knows what is next.',
    icon: Users,
  },
  {
    title: 'Technicians execute',
    body: 'Pick a day, run the list, and capture photos and closeout details in one guided flow.',
    icon: ClipboardCheck,
  },
  {
    title: 'Close the loop',
    body: 'Track progress toward invoicing with consistent job records across office and field.',
    icon: CircleCheck,
  },
] as const

export function LandingPage() {
  const hasBackend = Boolean(import.meta.env.VITE_CONVEX_URL)

  return (
    <div className="flex min-h-svh flex-col bg-background">
      <header className="border-b bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-4">
          <Link className="font-semibold tracking-tight" to="/">
            Vilvetti
          </Link>
          <div className="flex items-center gap-2">
            {hasBackend ? (
              <Button asChild size="sm">
                <Link to="/sign-in">Sign in</Link>
              </Button>
            ) : (
              <span className="text-xs text-muted-foreground">
                Configure backend to sign in
              </span>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="border-b bg-muted/30 px-4 py-16 sm:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-medium text-muted-foreground">
              Field service operations
            </p>
            <h1 className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl">
              One place for office dispatch and technician closeouts
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-pretty text-muted-foreground sm:text-lg">
              Vilvetti connects your back office with crews in the field so jobs
              move cleanly from booking to done—with fewer phone tags and
              clearer handoffs.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              {hasBackend ? (
                <>
                  <Button asChild size="lg">
                    <Link to="/sign-in">
                      Get started
                      <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline">
                    <a href="#features">See how it works</a>
                  </Button>
                </>
              ) : (
                <p className="max-w-md text-sm text-muted-foreground">
                  Set{' '}
                  <code className="rounded bg-muted px-1 py-0.5">
                    VITE_CONVEX_URL
                  </code>{' '}
                  in your environment to enable sign-in and the live app.
                </p>
              )}
            </div>
          </div>
        </section>

        <section className="px-4 py-16" id="features">
          <div className="mx-auto max-w-5xl">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                Built for teams that live in the calendar and on the road
              </h2>
              <p className="mt-3 text-muted-foreground">
                Whether you run the board from the office or turn wrenches on
                site, Vilvetti keeps the same job story in sync.
              </p>
            </div>
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {features.map(({ title, description, icon: Icon }) => (
                <Card className="shadow-sm" key={title}>
                  <CardHeader className="space-y-3">
                    <div className="flex size-10 items-center justify-center rounded-lg border bg-muted/50">
                      <Icon aria-hidden className="size-5 text-foreground" />
                    </div>
                    <CardTitle className="text-lg">{title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t bg-muted/20 px-4 py-16">
          <div className="mx-auto max-w-5xl">
            <h2 className="text-center text-2xl font-semibold tracking-tight sm:text-3xl">
              How teams use Vilvetti
            </h2>
            <ol className="mt-12 grid gap-8 sm:grid-cols-3">
              {steps.map(({ title, body, icon: Icon }, index) => (
                <li className="relative flex flex-col gap-3" key={title}>
                  <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Step {index + 1}
                  </span>
                  <div className="flex size-10 items-center justify-center rounded-lg border bg-background shadow-sm">
                    <Icon aria-hidden className="size-5" />
                  </div>
                  <h3 className="text-lg font-semibold">{title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {body}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {hasBackend ? (
          <section className="px-4 py-16">
            <div className="bg-card mx-auto max-w-2xl rounded-xl border p-8 text-center shadow-sm">
              <h2 className="text-xl font-semibold sm:text-2xl">
                Ready to streamline your jobs?
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Create an account or sign in to open the office or technician
                workspace.
              </p>
              <Button asChild className="mt-6" size="lg">
                <Link to="/sign-in">Sign in to Vilvetti</Link>
              </Button>
            </div>
          </section>
        ) : null}
      </main>

      <footer className="border-t py-8 text-center text-xs text-muted-foreground">
        <p>© {new Date().getFullYear()} Vilvetti</p>
      </footer>
    </div>
  )
}
