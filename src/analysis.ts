import { add_lib, EventLib } from "event_handler"
import { NthTickEventData } from "factorio:runtime"

export type EventHandlers = {
  [K in keyof typeof defines.events]?: (event: (typeof defines.events)[K]["_eventData"]) => void
}

export interface Analysis<T extends object = object> extends EventHandlers {
  nth_tick_period?: number

  on_nth_tick?(event: NthTickEventData): void

  exportData(): T

  constructor: {
    name: string
  }

  on_init?(): void
}

const initialAnalyses: Record<string, Analysis> = {}

declare const global: {
  analyses?: Record<string, Analysis>
}

function getAnalyses(): Record<string, Analysis> {
  if (!global.analyses) {
    global.analyses = initialAnalyses
  }
  return global.analyses
}

export function addAnalysis(analysis: Analysis): void {
  const lib: EventLib = {
    events: {},
    on_nth_tick: {},
  }
  const analysisName = analysis.constructor.name
  script.register_metatable("analysis:" + analysisName, getmetatable(analysis)!)
  if (initialAnalyses[analysisName]) {
    error("analysis already exists: " + analysisName)
  }
  initialAnalyses[analysisName] = analysis

  for (const [name, id] of pairs(defines.events)) {
    if (analysis[name]) {
      lib.events![id] = (event: any) => {
        getAnalyses()[analysisName][name]!(event)
      }
    }
  }
  if (analysis.on_nth_tick) {
    assert(analysis.nth_tick_period, "on_nth_tick requires nth_tick_period")
    lib.on_nth_tick![analysis.nth_tick_period!] = (event: NthTickEventData) => {
      getAnalyses()[analysisName].on_nth_tick!(event)
    }
  }

  if (analysis.on_init) {
    lib.on_init = () => {
      getAnalyses()[analysisName].on_init!()
    }
  }

  add_lib(lib)
}

declare const __DebugAdapter:
  | {
      breakpoint(this: void): void
    }
  | undefined
add_lib({
  on_init() {
    getAnalyses()
  },
  on_load() {
    __DebugAdapter?.breakpoint()
  },
  events: {
    [defines.events.on_game_created_from_scenario]: () => {
      getAnalyses()
    },
  },
})

function getOutFileName(s: string): string {
  const lowerCamelCase = s[0].toLowerCase() + s.slice(1)
  if (lowerCamelCase.endsWith("Analysis")) {
    return lowerCamelCase.slice(0, -"Analysis".length)
  }
  return lowerCamelCase
}

export function exportAllAnalyses(): void {
  for (const [name, datum] of pairs(global.analyses!)) {
    const outname = `analysis/${getOutFileName(name)}.json`
    log(`Exporting ${name}`)
    const data = game.table_to_json(datum.exportData())
    game.write_file(outname, data)
  }
  log("Exported analysis data to script-output/analysis/*.json")
}
