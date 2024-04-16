import { nil } from "factorio:runtime"

declare global {
  /** @noSelf */
  interface DebugAdapter {
    breakpoint(): void
  }
  const __DebugAdapter: DebugAdapter
}
