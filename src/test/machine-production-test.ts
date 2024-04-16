import MachineProduction from "../dataCollectors/machine-production"
import { simulateEvent, testDataCollector } from "./test-util"
import { LuaEntity, LuaSurface, MapPosition, OnGuiClosedEvent } from "factorio:runtime"
import expect from "tstl-expect"

let dc: MachineProduction
before_each(() => {
  dc = testDataCollector(
    new MachineProduction(["assembling-machine-1", "assembling-machine-2", "stone-furnace", "steel-furnace"], 60),
  )
})
after_all(() => {
  dc = nil!
})
let surface: LuaSurface

before_each(() => {
  surface = game.surfaces[1]
})
after_each(() => {
  surface.find_entities().forEach((e) => e.destroy())
})
before_all(() => {
  game.players[1].teleport({ x: 10, y: 10 }, surface)
})

function createPowerSource() {
  const engine = surface.create_entity({ name: "steam-engine", position: { x: -5, y: -5 } })!
  on_tick(() => {
    engine.fluidbox[0] = { name: "steam", amount: 200, temperature: 165 }
  })
  surface.create_entity({ name: "substation", position: { x: -5, y: 0 } })
}

function createEntity(name: string, position: MapPosition = { x: 0.5, y: 0.5 }): LuaEntity {
  return assert(
    surface.create_entity({
      name,
      position,
      raise_built: true,
      force: "player",
    }),
  )
}

test("ignores machines that never produced anything", () => {
  createPowerSource()
  const machine = createEntity("assembling-machine-1")
  machine.set_recipe("iron-gear-wheel")
  after_ticks(180, () => {
    done()
    const data = dc.exportData()
    expect(data.machines).toEqual([])
  })
})

test("can track a machine producing items", () => {
  createPowerSource()
  const asm = createEntity("assembling-machine-1")
  after_ticks(90, () => {
    asm.set_recipe("iron-gear-wheel")
    simulateEvent(defines.events.on_gui_closed, { entity: asm } as OnGuiClosedEvent)
  })
  after_ticks(150, () => {
    asm.insert({ name: "iron-plate", count: 6 })
  })
  after_ticks(360, () => {
    done()
    const data = dc.exportData()
    expect(data.machines[0]).toEqual({
      name: "assembling-machine-1",
      unitNumber: asm.unit_number,
      location: asm.position,
      timeBuilt: 0,
      recipes: expect.anything(),
    })
    expect(data.machines[0].recipes).toEqual([
      {
        recipe: "iron-gear-wheel",
        timeStarted: 90,
        production: [
          [120, 0, "item_ingredient_shortage"],
          [180, 0, "working"],
          [240, 1, "working"],
          [300, 1, "working"],
          [360, 1, "full_output"],
        ],
      },
    ])
  })
})

test("tracks if a machine changes recipe", () => {
  createPowerSource()
  const asm = createEntity("assembling-machine-1")
  asm.set_recipe("iron-gear-wheel")
  simulateEvent(defines.events.on_gui_closed, { entity: asm } as OnGuiClosedEvent)
  asm.insert({ name: "iron-plate", count: 10 })
  after_ticks(150, () => {
    asm.set_recipe("copper-cable")
    asm.insert({ name: "copper-plate", count: 10 })
    simulateEvent(defines.events.on_gui_closed, { entity: asm } as OnGuiClosedEvent)
  })
  after_ticks(240, () => {
    done()
    const data = dc.exportData()
    expect(data.machines[0].recipes).toEqual([
      {
        recipe: "iron-gear-wheel",
        timeStarted: 0,
        timeStopped: 150,
        stoppedReason: "recipe_changed",
        production: [
          [60, 0, "working"],
          [120, 1, "working"],
          [150, 1, "working"],
        ],
      },
      {
        recipe: "copper-cable",
        timeStarted: 150,
        production: [
          [180, 0, "working"],
          [240, 1, "working"],
        ],
      },
    ])
  })
})

test("tracks a mined machine", () => {
  createPowerSource()
  const asm = createEntity("assembling-machine-1")
  asm.set_recipe("iron-gear-wheel")
  simulateEvent(defines.events.on_gui_closed, { entity: asm } as OnGuiClosedEvent)
  asm.insert({ name: "iron-plate", count: 10 })
  after_ticks(150, () => {
    game.players[1].mine_entity(asm)
  })
  after_ticks(240, () => {
    done()
    const data = dc.exportData()
    expect(data.machines[0].recipes[0]).toEqual({
      recipe: "iron-gear-wheel",
      timeStarted: 0,
      timeStopped: 150,
      stoppedReason: "mined",
      production: [
        [60, 0, "working"],
        [120, 1, "working"],
        [150, 1, "working"],
      ],
    })
  })
})

test("tracks a machine marked for deconstruction", () => {
  createPowerSource()
  const asm = createEntity("assembling-machine-1")
  asm.set_recipe("iron-gear-wheel")
  simulateEvent(defines.events.on_gui_closed, { entity: asm } as OnGuiClosedEvent)
  asm.insert({ name: "iron-plate", count: 10 })
  after_ticks(150, () => {
    assert(asm.order_deconstruction("player"))
  })
  after_ticks(240, () => {
    done()
    const data = dc.exportData()
    expect(data.machines[0].recipes[0]).toEqual({
      recipe: "iron-gear-wheel",
      timeStarted: 0,
      timeStopped: 150,
      stoppedReason: "marked_for_deconstruction",
      production: [
        [60, 0, "working"],
        [120, 1, "working"],
        [150, 1, "marked_for_deconstruction"],
      ],
    })
  })
})

test("tracks a furnace", () => {
  const furnace = createEntity("steel-furnace")
  furnace.insert({ name: "iron-ore", count: 10 })
  furnace.insert({ name: "coal", count: 10 })

  after_ticks(240, () => {
    const data = dc.exportData()
    expect(data.machines[0]).toEqual({
      name: "steel-furnace",
      unitNumber: furnace.unit_number,
      location: furnace.position,
      timeBuilt: 0,
      recipes: expect.anything(),
    })
    expect(data.machines[0].recipes).toEqual([
      {
        recipe: "iron-plate",
        timeStarted: 60,
        production: [
          [120, 1, "working"],
          [180, 0, "working"],
          [240, 1, "working"],
        ],
      },
    ])
  })
})

test("a furnace with ingredients missing", () => {
  const furnace = createEntity("steel-furnace")
  furnace.insert({ name: "iron-ore", count: 2 })
  furnace.insert({ name: "coal", count: 10 })
  after_ticks(330, () => {
    furnace.insert({ name: "iron-ore", count: 2 })
  })

  after_ticks(360, () => {
    const data = dc.exportData()
    expect(data.machines[0].recipes[0]).toEqual({
      recipe: "iron-plate",
      timeStarted: 60,
      production: [
        [120, 1, "working"],
        [180, 0, "working"],
        [240, 1, "no_ingredients"],
        [300, 0, "no_ingredients"],
        [360, 0, "working"],
      ],
    })
  })
})
test("a furnace with missing fuel", () => {
  const furnace = createEntity("stone-furnace")
  furnace.insert({ name: "iron-ore", count: 10 })
  furnace.insert({ name: "wood", count: 1 })

  after_ticks(1600, () => {
    const data = dc.exportData()
    expect(data.machines[0].recipes[0].production).toContainEqual([1500, 0, "no_fuel"])
  })
})