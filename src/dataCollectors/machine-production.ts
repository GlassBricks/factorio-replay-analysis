import { MapPosition } from "factorio:prototype"
import {
  LuaEntity,
  OnEntityDiedEvent,
  OnEntitySettingsPastedEvent,
  OnGuiClosedEvent,
  OnMarkedForDeconstructionEvent,
  OnPrePlayerMinedItemEvent,
  OnRobotPreMinedEvent,
} from "factorio:runtime"
import EntityTracker from "./entity-tracker"
import { DataCollector } from "../data-collector"

type EntityStatus = keyof typeof defines.entity_status | "recipe-changed" | "unknown" | "mined" | "entity-died"

interface SingleMachineData {
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
  machines: SingleMachineData[]
}

// assemblers, chem plants, refineries, furnaces

interface TrackedMachineInfo {
  byRecipe: Record<string, SingleMachineData>
  timeBuilt: number
  lastProductsFinished: number
  lastRecipe?: string
}

export default class MachineProduction
  extends EntityTracker<TrackedMachineInfo>
  implements DataCollector<MachineProductionData>
{
  constructor(
    prototypes: string[],
    public nth_tick_period: number = 60 * 5,
  ) {
    super({
      filter: "name",
      name: prototypes,
    })
  }

  override on_init(): void {
    super.on_init()
    for (const name of this.prototypes) {
      const prototype = game.entity_prototypes[name]
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

  override initialData(): TrackedMachineInfo {
    return {
      byRecipe: {},
      timeBuilt: game.tick,
      lastProductsFinished: 0,
    }
  }

  private tryUpdateEntity(entity: LuaEntity, status?: EntityStatus, onlyIfRecipeChanged: boolean = false) {
    const info = this.getEntityData(entity)
    if (info) {
      this.updateEntity(entity, info, status, onlyIfRecipeChanged)
    }
  }

  updateEntity(
    entity: LuaEntity,
    info: TrackedMachineInfo,
    status?: EntityStatus,
    onlyIfRecipeChanged: boolean = false,
  ) {
    // log(`trying to update entity ${entity.name} ${entity.unit_number} ${entity.position.x} ${entity.position.y}`)
    const recipe = entity.get_recipe()?.name
    const lastRecipe = info.lastRecipe
    const recipeChanged = recipe != lastRecipe
    if (recipeChanged && lastRecipe) {
      const lastEntry = info.byRecipe[lastRecipe]
      if (lastEntry != undefined) {
        lastEntry.production.push([game.tick, entity.products_finished - info.lastProductsFinished, "recipe-changed"])
      }

      info.lastProductsFinished = entity.products_finished
    }
    info.lastRecipe = recipe

    if (!recipe || (onlyIfRecipeChanged && !recipeChanged)) {
      return
    }
    if (!info.byRecipe[recipe]) {
      info.byRecipe[recipe] = {
        name: entity.name,
        recipe,
        unitNumber: entity.unit_number!,
        location: entity.position,
        timeBuilt: info.timeBuilt,
        timeStarted: game.tick,
        production: [],
      }
    }
    const entry = info.byRecipe[recipe]
    const productsFinished = entity.products_finished
    const delta = productsFinished - info.lastProductsFinished
    info.lastProductsFinished = productsFinished
    status ??= this.getStatus(entity)
    entry.production.push([game.tick, delta, status ?? this.getStatus(entity)])
  }

  protected override onDeleted(
    entity: LuaEntity,
    event: OnPrePlayerMinedItemEvent | OnRobotPreMinedEvent | OnEntityDiedEvent,
  ) {
    this.tryUpdateEntity(entity, event.name == defines.events.on_entity_died ? "entity-died" : "mined")
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

  protected override onPeriodicUpdate(entity: LuaEntity, data: TrackedMachineInfo) {
    this.updateEntity(entity, data)
  }

  exportData(): MachineProductionData {
    let totalSize = 0
    const machines: SingleMachineData[] = []
    for (const [, machine] of pairs(this.entityData)) {
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
