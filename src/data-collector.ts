import { add_lib, EventLib } from "event_handler"
import { NthTickEventData } from "factorio:runtime"

export type EventHandlers = {
  [K in keyof typeof defines.events]?: (event: (typeof defines.events)[K]["_eventData"]) => void
}

export interface DataCollector<T extends object = object> extends EventHandlers {
  nth_tick_period?: number

  on_nth_tick?(event: NthTickEventData): void

  exportData(): T

  constructor: {
    name: string
  }

  on_init?(): void
}

const initialDataCollectors: Record<string, DataCollector> = {}

declare const global: {
  dataCollectors?: Record<string, DataCollector>
}

function getDataCollectors(): Record<string, DataCollector> {
  if (!global.dataCollectors) {
    global.dataCollectors = initialDataCollectors
  }
  return global.dataCollectors
}

export function addDataCollector(dataCollector: DataCollector): void {
  const lib: EventLib = {
    events: {},
    on_nth_tick: {},
  }
  const dataCollectorName = dataCollector.constructor.name
  script.register_metatable("dataCollector:" + dataCollectorName, getmetatable(dataCollector)!)
  if (initialDataCollectors[dataCollectorName]) {
    error("dataCollector already exists: " + dataCollectorName)
  }
  initialDataCollectors[dataCollectorName] = dataCollector

  for (const [name, id] of pairs(defines.events)) {
    if (dataCollector[name]) {
      lib.events![id] = (event: any) => {
        getDataCollectors()[dataCollectorName][name]!(event)
      }
    }
  }
  if (dataCollector.on_nth_tick) {
    assert(dataCollector.nth_tick_period, "on_nth_tick requires nth_tick_period")
    lib.on_nth_tick![dataCollector.nth_tick_period!] = (event: NthTickEventData) => {
      getDataCollectors()[dataCollectorName].on_nth_tick!(event)
    }
  }

  if (dataCollector.on_init) {
    lib.on_init = () => {
      getDataCollectors()[dataCollectorName].on_init!()
    }
  }

  add_lib(lib)
}

add_lib({
  on_init() {
    getDataCollectors()
  },
  on_load() {
    __DebugAdapter?.breakpoint()
  },
  events: {
    [defines.events.on_game_created_from_scenario]: () => {
      getDataCollectors()
    },
  },
})

function getOutFileName(s: string): string {
  const lowerCamelCase = s[0].toLowerCase() + s.slice(1)
  if (lowerCamelCase.endsWith("DataCollector")) {
    return lowerCamelCase.slice(0, -"DataCollector".length)
  }
  return lowerCamelCase
}

export function exportAllData(): void {
  for (const [name, datum] of pairs(global.dataCollectors!)) {
    const outname = `replay-data/${getOutFileName(name)}.json`
    log(`Exporting ${name}`)
    const data = game.table_to_json(datum.exportData())
    game.write_file(outname, data)
  }
  log("Exported dataCollector data to script-output/replay-data/*.json")
}
