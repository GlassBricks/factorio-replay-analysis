import { simulateEvent, testDataCollector } from "./test-util"
import ResearchTiming from "../dataCollectors/research-timing"
import { LuaTechnology } from "factorio:runtime"
import expect from "tstl-expect"

test("research started and completed times", () => {
  const dc = testDataCollector(new ResearchTiming())

  after_ticks(10, () => {
    simulateEvent(defines.events.on_research_started, { research: { name: "research1" } as LuaTechnology })
  })
  after_ticks(20, () => {
    simulateEvent(defines.events.on_research_cancelled, { research: { research1: 1 }, force: nil! })
  })
  after_ticks(30, () => {
    simulateEvent(defines.events.on_research_started, { research: { name: "research2" } as LuaTechnology })
  })
  after_ticks(40, () => {
    simulateEvent(defines.events.on_research_finished, {
      research: { name: "research2" } as LuaTechnology,
      by_script: false,
    })
    simulateEvent(defines.events.on_research_started, { research: { name: "research1" } as LuaTechnology })
  })
  after_ticks(50, () => {
    simulateEvent(defines.events.on_research_finished, {
      research: { name: "research1" } as LuaTechnology,
      by_script: false,
    })
  })
  after_ticks(60, () => {
    const data = dc.exportData()
    expect(data.timeFirstStarted).toEqual({ research1: 10, research2: 30 })
    expect(data.timeCompleted).toEqual({ research1: 50, research2: 40 })
    expect(data.events).toEqual([
      { time: 10, research: "research1", type: "started" },
      { time: 20, research: "research1", type: "cancelled" },
      { time: 30, research: "research2", type: "started" },
      { time: 40, research: "research2", type: "completed" },
      { time: 40, research: "research1", type: "started" },
      { time: 50, research: "research1", type: "completed" },
    ])
  })
})
