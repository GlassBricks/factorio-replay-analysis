import { NthTickEventData } from "factorio:runtime"
import { DataCollector } from "../src/data-collector"

let testStartTick = 0

export function useFakeTime() {
  if (testStartTick != 0) return
  testStartTick = game.tick
  after_test(() => {
    testStartTick = 0
    rawset(game, "tick", nil!)
  })
}

export function fakeTime(): number {
  if (rawget(game, "tick") != nil) return game.tick
  return game.tick - testStartTick
}

export function withFakeTime(fn: () => void) {
  if (rawget(game, "tick") != nil) {
    fn()
    return
  }
  const oldTick = game.tick
  const fakeTick = oldTick - testStartTick
  rawset(game, "tick", fakeTick)
  fn()
  rawset(game, "tick", nil)
}

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

function setEventHandler(event: defines.events) {
  script.on_event(event, (event) => {
    const oldTick = event.tick
    withFakeTime(() => {
      if (handlers[event.name] == nil) return
      ;(event as any).tick = game.tick
      for (const handler of handlers[event.name]) {
        handler(event)
      }
    })
    ;(event as any).tick = oldTick
  })
}

setEventHandler(defines.events.on_tick)

export function addHandlerForTest<K extends defines.events>(event: K, handler: (event: K["_eventData"]) => void): void {
  useFakeTime()
  ;(handlers[event] ??= new LuaSet()).add(handler as any)
  if (script.get_event_handler(event) === nil) {
    setEventHandler(event)
  }
  after_test(() => {
    handlers[event]?.delete(handler as any)
  })
}

export function addNthTickHandlerForTest(period: number, handler: (event: NthTickEventData) => void): void {
  addHandlerForTest(defines.events.on_tick, (event) => {
    if (event.tick % period === 0) {
      handler({
        nth_tick: period,
        tick: event.tick,
      })
    }
  })
}

export function testDataCollector<T extends DataCollector>(dataCollector: T): T {
  useFakeTime()
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
