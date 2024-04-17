import { LuaEntity, LuaSurface, MapPosition } from "factorio:runtime"
import LabContents from "../dataCollectors/lab-contents"
import expect from "tstl-expect"
import { testDataCollector } from "./test-util"

let surface: LuaSurface
before_each(() => {
  surface = game.surfaces[1]
})
after_each(() => {
  surface.find_entities().forEach((e) => e.destroy())
})

function createLab(position: MapPosition = { x: 0.5, y: 0.5 }): LuaEntity {
  return assert(
    surface.create_entity({
      name: "lab",
      position,
      raise_built: true,
    }),
  )
}

let dc: LabContents
before_each(() => {
  dc = testDataCollector(new LabContents(10))
})
after_all(() => {
  dc = nil!
})

test("empty lab not counted", () => {
  createLab()
  after_ticks(100, () => {
    const data = dc.exportData()
    expect(data.labs).toEqual([])
  })
})

test("lab with single science pack counted", () => {
  const lab = createLab()
  lab.insert({ name: "automation-science-pack", count: 10 })
  after_ticks(100, () => {
    const data = dc.exportData()
    expect(data.labs).toEqual([
      {
        name: "lab",
        unitNumber: lab.unit_number,
        location: lab.position,
        timeBuilt: 0,
        packs: expect.anything(),
      },
    ])
    const expected = Array.from({ length: 10 }, (_, i) => [(i + 1) * 10, 10, 0, 0, 0, 0, 0, 0])
    expect(data.labs[0].packs).toEqual(expected)
  })
})

test("tracks science packs over time", () => {
  const lab = createLab()
  after_ticks(19, () => lab.insert({ name: "automation-science-pack", count: 5 }))
  after_ticks(29, () => lab.insert({ name: "logistic-science-pack", count: 10 }))
  after_ticks(39, () => lab.remove_item({ name: "automation-science-pack", count: 4 }))
  after_ticks(49, () => {
    lab.insert({ name: "chemical-science-pack", count: 1 })
    lab.insert({ name: "military-science-pack", count: 7 })
  })
  after_ticks(59, () => {
    lab.insert({ name: "production-science-pack", count: 4 })
    lab.insert({ name: "utility-science-pack", count: 2 })
    lab.insert({ name: "space-science-pack", count: 3 })
  })
  after_ticks(60, () => {
    const data = dc.exportData()
    expect(data.labs[0].packs).toEqual([
      // time, automation, logistic, chemical, military, production, utility, space
      [10, 0, 0, 0, 0, 0, 0, 0],
      [20, 5, 0, 0, 0, 0, 0, 0],
      [30, 5, 10, 0, 0, 0, 0, 0],
      [40, 1, 10, 0, 0, 0, 0, 0],
      [50, 1, 10, 1, 7, 0, 0, 0],
      [60, 1, 10, 1, 7, 4, 2, 3],
    ])
  })
})
