import { MapPosition } from "factorio:prototype"
import {
  LuaEntity,
  nil,
  OnEntityDiedEvent,
  OnEntitySettingsPastedEvent,
  OnGuiClosedEvent,
  OnMarkedForDeconstructionEvent,
  OnPrePlayerMinedItemEvent,
  OnRobotPreMinedEvent,
  UnitNumber,
} from "factorio:runtime"
import EntityTracker from "./entity-tracker"
import { DataCollector } from "../data-collector"
import { list_to_map } from "util"

type EntityStatus = keyof typeof defines.entity_status | "unknown"

interface MachineProductionData {
  period: number
  machines: MachineData[]
}

interface MachineData {
  name: string
  unitNumber: number
  location: MapPosition
  timeBuilt: number
  recipes: MachineRecipeProduction[]
}

type StopReason = "recipe_changed" | "mined" | "entity_died" | "marked_for_deconstruction" | "disabled_by_script"

interface MachineRecipeProduction {
  recipe: string
  timeStarted: number
  timeStopped?: number
  stoppedReason?: StopReason
  production: [time: number, productsFinished: number, status: EntityStatus, additionalInfo?: unknown][]
}

const stoppedStatuses = {
  disabled_by_script: true,
  marked_for_deconstruction: true,
  no_recipe: true,
} as const

function isStoppingStatus(
  status: EntityStatus,
): status is "disabled_by_script" | "marked_for_deconstruction" | "no_recipe" {
  return status in stoppedStatuses
}

// assemblers, chem plants, refineries, furnaces

const commonStatuses = list_to_map<string>([
  "working",
  "normal",
  "no_power",
  "low_power",
  "no_fuel",
  "disabled_by_control_behavior",
  "disabled_by_script",
  "marked_for_deconstruction",
] satisfies (keyof typeof defines.entity_status)[])
const craftingMachineStatuses = list_to_map<string>([
  ...commonStatuses,
  "no_recipe",
  "fluid_ingredient_shortage",
  "full_output",
  "item_ingredient_shortage",
])
const furnaceStatuses = list_to_map<string>([...commonStatuses, "no_ingredients"])

const reverseMap: Record<defines.entity_status, EntityStatus> = {}
for (const [key, value] of pairs(defines.entity_status)) {
  reverseMap[value] = key
}

interface TrackedMachineData {
  name: string
  unitNumber: UnitNumber
  location: MapPosition
  timeBuilt: number
  lastProductsFinished: number
  lastRunningRecipe: string | nil
  recipeProduction: MachineRecipeProduction[]
}

export default class MachineProduction
  extends EntityTracker<TrackedMachineData>
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

  private getStatus(entity: LuaEntity): EntityStatus {
    const keys =
      entity.type == "assembling-machine" || entity.type == "rocket-silo"
        ? craftingMachineStatuses
        : entity.type == "furnace"
          ? furnaceStatuses
          : error("Invalid entity type")

    const status = entity.status
    if (status == nil) return "unknown"
    const statusText = reverseMap[status]
    if (keys.has(statusText)) {
      return statusText
    }
    log("Unknown status for crafting machine: " + status)
    for (const [key, value] of pairs(defines.entity_status)) {
      log(key + " " + value)
    }
    return "unknown"
  }

  override initialData(entity: LuaEntity): TrackedMachineData {
    return {
      name: entity.name,
      unitNumber: entity.unit_number!,
      location: entity.position,
      timeBuilt: game.tick,
      lastProductsFinished: 0,
      lastRunningRecipe: nil,
      recipeProduction: [],
    }
  }

  private addDataPoint(entity: LuaEntity, info: TrackedMachineData, status: EntityStatus) {
    const tick = game.tick
    const recipeProduction = info.recipeProduction
    const currentProduction = recipeProduction[recipeProduction.length - 1]
    const lastEntry = currentProduction.production[currentProduction.production.length - 1]
    if (!(lastEntry == nil || lastEntry[0] != tick)) {
      return
    }
    const productsFinished = entity.products_finished
    const delta = productsFinished - info.lastProductsFinished
    info.lastProductsFinished = productsFinished

    let extraInfo: unknown = nil
    if (status == "item_ingredient_shortage") {
      const currentInputs = entity.get_inventory(defines.inventory.assembling_machine_input)!.get_contents()
      const needed = entity.get_recipe()!.ingredients
      const missingIngredients: string[] = []
      for (const { type, amount, name } of needed) {
        if (type != "item") continue
        const currentAmount = currentInputs[name]
        if (currentAmount == nil || currentAmount < amount) {
          missingIngredients.push(name)
        }
      }
      extraInfo = missingIngredients
    } else if (status == "fluid_ingredient_shortage") {
      const needed = entity.get_recipe()!.ingredients
      const missingIngredients: string[] = []
      for (const { type, amount, name } of needed) {
        if (type != "fluid") continue
        const currentAmount = entity.get_fluid_count(name)
        if (currentAmount == nil || currentAmount < amount) {
          missingIngredients.push(name)
        }
      }
      extraInfo = missingIngredients
    }

    currentProduction.production.push([tick, delta, status, extraInfo])
  }

  private markProductionFinished(
    entity: LuaEntity,
    info: TrackedMachineData,
    status: EntityStatus,
    reason: StopReason,
  ) {
    info.lastRunningRecipe = nil
    const recipeProduction = info.recipeProduction
    const lastProduction = recipeProduction[recipeProduction.length - 1]
    if (lastProduction == nil) return
    this.addDataPoint(entity, info, status)
    const production = lastProduction.production
    if (production.length === 0 || production.every(([, delta]) => delta == 0)) {
      recipeProduction.pop()
      return
    }
    lastProduction.timeStopped = game.tick
    lastProduction.stoppedReason = reason
  }

  private startNewProduction(info: TrackedMachineData, recipe: string) {
    info.lastRunningRecipe = recipe
    info.recipeProduction.push({
      recipe,
      timeStarted: game.tick,
      production: [],
    })
  }

  private tryCheckRunningChanged(entity: LuaEntity, knownStopReason?: StopReason) {
    const info = this.getEntityData(entity)
    if (info) {
      this.checkRunningChanged(entity, info, nil, knownStopReason)
    }
  }

  /**
   * checks if stopped, recipe changed, or newly started
   */
  private checkRunningChanged(
    entity: LuaEntity,
    info: TrackedMachineData,
    status: EntityStatus | nil,
    knownStopReason: StopReason | nil,
  ): LuaMultiReturn<[updated: boolean, isRunning: boolean]> {
    const recipe = (entity.get_recipe() ?? (entity.type == "furnace" ? entity.previous_recipe : nil))?.name
    const lastRecipe = info.lastRunningRecipe
    const recipeChanged = recipe != lastRecipe
    status ??= this.getStatus(entity)
    const isStopped = knownStopReason != nil || isStoppingStatus(status)
    let updated = false
    if (lastRecipe) {
      if (recipeChanged || status == "no_recipe") {
        this.markProductionFinished(entity, info, status, "recipe_changed")
        updated = true
      } else if (isStopped) {
        this.markProductionFinished(entity, info, status, knownStopReason ?? (status as StopReason))
        updated = true
      }
    }
    if (recipe && (recipeChanged || info.recipeProduction.length == 0)) {
      this.startNewProduction(info, recipe)
      updated = true
    }
    return $multi(updated, !isStopped && recipe != nil)
  }

  protected override onDeleted(
    entity: LuaEntity,
    event: OnPrePlayerMinedItemEvent | OnRobotPreMinedEvent | OnEntityDiedEvent,
  ) {
    this.tryCheckRunningChanged(entity, event.name == defines.events.on_entity_died ? "entity_died" : "mined")
    super.onDeleted(entity, event)
  }

  on_marked_for_deconstruction(event: OnMarkedForDeconstructionEvent) {
    this.tryCheckRunningChanged(event.entity, "marked_for_deconstruction")
  }

  on_cancelled_deconstruction(event: OnMarkedForDeconstructionEvent) {
    this.tryCheckRunningChanged(event.entity, nil)
  }

  on_gui_closed(event: OnGuiClosedEvent) {
    if (event.entity) this.tryCheckRunningChanged(event.entity, nil)
  }

  on_entity_settings_pasted(event: OnEntitySettingsPastedEvent) {
    this.tryCheckRunningChanged(event.destination, nil)
  }

  override onPeriodicUpdate(entity: LuaEntity, data: TrackedMachineData) {
    const status = this.getStatus(entity)
    const [updated, isRunning] = this.checkRunningChanged(entity, data, status, nil)
    const shouldAddDataPoint = !updated && isRunning
    if (shouldAddDataPoint) {
      this.addDataPoint(entity, data, status)
    }
  }

  exportData(): MachineProductionData {
    const machines: MachineData[] = []
    for (const [, machine] of pairs(this.entityData)) {
      const recipes = machine.recipeProduction
      while (
        recipes.length > 0 &&
        (recipes[recipes.length - 1].production.length == 0 ||
          recipes[recipes.length - 1].production.every(([, delta]) => delta == 0))
      ) {
        recipes.pop()
      }
      if (recipes.length == 0) continue
      machines.push({
        name: machine.name,
        unitNumber: machine.unitNumber,
        location: machine.location,
        timeBuilt: machine.timeBuilt,
        recipes,
      })
    }
    return {
      period: this.nth_tick_period,
      machines,
    }
  }
}
