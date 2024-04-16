declare global {
  /** @noSelf */
  interface DebugAdapter {
    breakpoint(): void
  }
  const __DebugAdapter: DebugAdapter
}
export {}
