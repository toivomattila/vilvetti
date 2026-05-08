/** Vite `import.meta.glob` — used by convex-test in `*.test.ts` under Vitest. */
interface ImportMeta {
  glob(
    pattern: string | readonly string[],
    options?: { eager?: boolean },
  ): Record<string, () => Promise<unknown>>
}
