import { NthTickEventData } from "factorio:runtime"
import { DataCollector } from "../src/data-collector"

export function simulateEvent<K extends defines.events>(event: K, data: Omit<K["_eventData"], "name" | "tick">) {
  const handler = script.get_event_handler(event)
  if (handler != nil) {
    handler({
      name: event,
      tick: game.tick,
      ...data,
    })
  }
}

const handlers: Record<defines.events, LuaSet<(event: any) => void>> = {}
const nthTickHandlers: Record<number, LuaSet<(event: NthTickEventData) => void>> = {}

export function addHandlerForTest<K extends defines.events>(event: K, handler: (event: K["_eventData"]) => void): void {
  ;(handlers[event] ??= new LuaSet()).add(handler as any)
  after_test(() => {
    handlers[event]?.delete(handler as any)
  })
  if (script.get_event_handler(event) === nil) {
    script.on_event(event, (event) => {
      for (const handler of handlers[event.name]) {
        handler(event)
      }
    })
  }
}

export function addNthTickHandlerForTest(period: number, handler: (event: NthTickEventData) => void): void {
  ;(nthTickHandlers[period] ??= new LuaSet()).add(handler)
  after_test(() => {
    nthTickHandlers[period]?.delete(handler)
    script.on_nth_tick(period, nil)
  })
  script.on_nth_tick(period, (tick) => {
    for (const handler of nthTickHandlers[period]) {
      handler(tick)
    }
  })
}

export function testDataCollector<T extends DataCollector>(dataCollector: T): T {
  for (const [name, id] of pairs(defines.events)) {
    if (dataCollector[name]) {
      addHandlerForTest(id, (event: any) => {
        dataCollector[name]!(event)
      })
    }
  }
  if (dataCollector.on_nth_tick) {
    assert(dataCollector.nth_tick_period, "on_nth_tick requires nth_tick_period")
    addNthTickHandlerForTest(dataCollector.nth_tick_period!, (event) => {
      dataCollector.on_nth_tick!(event)
    })
  }
  dataCollector.on_init?.()
  return dataCollector
}
