import { add_lib, EventLib } from "event_handler"
import { NthTickEventData } from "factorio:runtime"

export type EventHandlers = {
  [K in keyof typeof defines.events]?: (event: (typeof defines.events)[K]["_eventData"]) => void
}

export interface Datum<T> extends EventHandlers {
  nth_tick_period?: number

  on_nth_tick?(event: NthTickEventData): void

  exportData(): T

  constructor: {
    name: string
  }
}

declare const __DebugAdapter: {
  breakpoint(this: void): void
}

const initialDatums: Record<string, Datum<unknown>> = {}

declare const global: {
  analysisDatums: Record<string, Datum<unknown>>
}

function getDatums() {
  if (!global.analysisDatums) {
    global.analysisDatums = initialDatums
  }
  return global.analysisDatums
}

export function addDatum(datum: Datum<unknown>): void {
  __DebugAdapter?.breakpoint()
  const lib: EventLib = {
    events: {},
    on_nth_tick: {},
  }
  const datumName = datum.constructor.name
  script.register_metatable("datum:" + datumName, getmetatable(datum)!)
  if (initialDatums[datumName]) {
    error("Datum already exists: " + datumName)
  }
  initialDatums[datumName] = datum

  for (const [name, id] of pairs(defines.events)) {
    if (datum[name]) {
      lib.events![id] = (event: any) => {
        getDatums()[datumName][name]!(event)
      }
    }
  }
  if (datum.on_nth_tick) {
    assert(datum.nth_tick_period, "on_nth_tick requires nth_tick_period")
    lib.on_nth_tick![datum.nth_tick_period!] = (event: NthTickEventData) => {
      getDatums()[datumName].on_nth_tick!(event)
    }
  }

  add_lib(lib)
}

add_lib({
  on_init() {
    getDatums()
  },
  events: {
    [defines.events.on_game_created_from_scenario]: () => {
      getDatums()
    },
  },
})

function toLowerCamelCase(s: string): string {
  return s[0].toLowerCase() + s.slice(1)
}

export function exportData(): void {
  const result: Record<string, unknown> = {}
  for (const [name, datum] of pairs(global.analysisDatums)) {
    result[toLowerCamelCase(name)] = datum.exportData()
  }

  game.write_file("analysis-data.json", game.table_to_json(result))

  game.print("Exported analysis data to analysis-data.json")
}
