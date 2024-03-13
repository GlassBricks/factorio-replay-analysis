import { MapPosition } from "factorio:prototype"
import { Analysis } from "../analysis"
import {
  LuaEntity,
  OnBuiltEntityEvent,
  OnEntityDiedEvent,
  OnEntitySettingsPastedEvent,
  OnGuiClosedEvent,
  OnMarkedForDeconstructionEvent,
  OnPrePlayerMinedItemEvent,
  OnRobotBuiltEntityEvent,
  OnRobotPreMinedEvent,
  UnitNumber,
} from "factorio:runtime"

type EntityStatus = keyof typeof defines.entity_status | "recipe-changed" | "unknown" | "mined" | "entity-died"

interface MachineProduction {
  name: string
  recipe: string
  unitNumber: number
  location: MapPosition
  timeBuilt: number
  timeStarted: number
  production: [time: number, productsFinished: number, status: EntityStatus][]
}

interface MachineProductionData {
  period: number
  machines: MachineProduction[]
}

// assemblers, chem plants, refineries, furnaces

export default class MachineProductionAnalysis implements Analysis<MachineProductionData> {
  constructor(
    public prototypes: string[],
    public nth_tick_period: number = 60 * 5,
  ) {
    this.nth_tick_period = nth_tick_period
  }

  trackedMachines: Record<UnitNumber, LuaEntity> = {}

  machines: {
    [unitNumber: UnitNumber]: {
      byRecipe: Record<string, MachineProduction>
      timeBuilt: number
      lastRecipe?: string
      lastProductsFinished: number
    }
  } = {}

  on_init() {
    for (const name of this.prototypes) {
      const prototype = game.entity_prototypes[name]
      assert(prototype, `prototype not found: ${name}`)
      assert(
        prototype.type == "assembling-machine" || prototype.type == "furnace" || prototype.type == "rocket-silo",
        `Not a crafting machine or furnace: ${name}`,
      )
    }
  }

  private getStatus(entity: LuaEntity) {
    const commonKeys = [
      "working",
      "normal",
      "no_power",
      "low_power",
      "no_fuel",
      "disabled_by_control_behavior",
      "disabled_by_script",
      "marked_for_deconstruction",
    ] satisfies (keyof typeof defines.entity_status)[]
    const craftingMachineKeys: (keyof typeof defines.entity_status)[] = [
      ...commonKeys,
      "no_recipe",
      "fluid_ingredient_shortage",
      "full_output",
      "item_ingredient_shortage",
    ]
    const furnaceKeys: (keyof typeof defines.entity_status)[] = [...commonKeys, "no_ingredients"]
    const keys =
      entity.type == "assembling-machine" || entity.type == "rocket-silo"
        ? craftingMachineKeys
        : entity.type == "furnace"
          ? furnaceKeys
          : error("Invalid entity type")

    const status = entity.status
    for (const key of keys) {
      if (defines.entity_status[key] == status) {
        return key
      }
    }
    log("Unknown status for crafting machine: " + status)
    for (const [key, value] of pairs(defines.entity_status)) {
      log(key + " " + value)
    }
    return "unknown"
  }

  private onBuilt(entity: LuaEntity) {
    if (this.prototypes.includes(entity.name) && entity.unit_number) {
      this.trackedMachines[entity.unit_number] = entity
      this.machines[entity.unit_number] = {
        byRecipe: {},
        timeBuilt: game.tick,
        lastProductsFinished: 0,
      }
    }
  }

  private tryUpdateEntity(entity: LuaEntity, status?: EntityStatus, onlyIfRecipeChanged: boolean = false) {
    if (entity && entity.valid) {
      const unitNumber = entity.unit_number
      if (unitNumber && this.trackedMachines[unitNumber]) {
        this.updateEntity(entity, unitNumber, status, onlyIfRecipeChanged)
      }
    }
  }

  updateEntity(entity: LuaEntity, unitNumber: UnitNumber, status?: EntityStatus, onlyIfRecipeChanged: boolean = false) {
    if (!entity.valid) {
      delete this.trackedMachines[unitNumber]
      return
    }
    // log(`trying to update entity ${entity.name} ${entity.unit_number} ${entity.position.x} ${entity.position.y}`)
    const machine = this.machines[unitNumber]
    if (!machine) {
      // log("machine not found in machines")
      return
    }
    const recipe = entity.get_recipe()?.name
    const lastRecipe = machine.lastRecipe
    const recipeChanged = recipe != lastRecipe
    if (recipeChanged && lastRecipe) {
      const lastEntry = machine.byRecipe[lastRecipe]
      if (lastEntry != undefined) {
        lastEntry.production.push([
          game.tick,
          entity.products_finished - machine.lastProductsFinished,
          "recipe-changed",
        ])
      }

      machine.lastProductsFinished = entity.products_finished
    }
    machine.lastRecipe = recipe

    if (!recipe || (onlyIfRecipeChanged && !recipeChanged)) {
      return
    }
    if (!machine.byRecipe[recipe]) {
      machine.byRecipe[recipe] = {
        name: entity.name,
        recipe,
        unitNumber,
        location: entity.position,
        timeBuilt: machine.timeBuilt,
        timeStarted: game.tick,
        production: [],
      }
    }
    const entry = machine.byRecipe[recipe]
    const productsFinished = entity.products_finished
    const delta = productsFinished - machine.lastProductsFinished
    machine.lastProductsFinished = productsFinished
    status ??= this.getStatus(entity)
    entry.production.push([game.tick, delta, status ?? this.getStatus(entity)])
  }

  on_built_entity(event: OnBuiltEntityEvent) {
    this.onBuilt(event.created_entity)
  }

  on_robot_built_entity(event: OnRobotBuiltEntityEvent) {
    this.onBuilt(event.created_entity)
  }

  on_pre_player_mined_item(event: OnPrePlayerMinedItemEvent) {
    this.tryUpdateEntity(event.entity, "mined")
  }

  on_robot_pre_mined(event: OnRobotPreMinedEvent) {
    this.tryUpdateEntity(event.entity, "mined")
  }

  on_entity_died(event: OnEntityDiedEvent) {
    this.tryUpdateEntity(event.entity, "entity-died")
  }

  on_marked_for_deconstruction(event: OnMarkedForDeconstructionEvent) {
    this.tryUpdateEntity(event.entity)
  }

  on_cancelled_deconstruction(event: OnMarkedForDeconstructionEvent) {
    this.tryUpdateEntity(event.entity)
  }

  on_gui_closed(event: OnGuiClosedEvent) {
    const entity = event.entity
    if (entity) this.tryUpdateEntity(entity, undefined, true)
  }

  on_entity_settings_pasted(event: OnEntitySettingsPastedEvent) {
    this.tryUpdateEntity(event.destination, undefined, true)
  }

  on_nth_tick() {
    for (const [unitNumber, entity] of pairs(this.trackedMachines)) {
      this.updateEntity(entity, unitNumber)
    }
  }

  exportData(): MachineProductionData {
    let totalSize = 0
    const machines: MachineProduction[] = []
    for (const [, machine] of pairs(this.machines)) {
      for (const [, production] of pairs(machine.byRecipe)) {
        if (production.production.length > 0) {
          machines.push(production)
          totalSize += production.production.length
        }
      }
    }
    log("Total size: " + totalSize)
    return {
      period: this.nth_tick_period,
      machines,
    }
  }
}
