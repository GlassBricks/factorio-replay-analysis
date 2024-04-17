import { MapPosition } from "factorio:prototype"
import EntityTracker from "./entity-tracker"
import { LuaEntity, nil } from "factorio:runtime"
import { DataCollector } from "../data-collector"

export interface SingleLabData {
  name: string
  unitNumber: number
  location: MapPosition
  timeBuilt: number
  packs: [time: number, ...packCounts: number[]][]
}

export interface LabData {
  period: number
  sciencePacks: string[]
  labs: SingleLabData[]
}

const sciencePacks: string[] = [
  "automation-science-pack",
  "logistic-science-pack",
  "chemical-science-pack",
  "military-science-pack",
  "production-science-pack",
  "utility-science-pack",
  "space-science-pack",
]

export default class LabContents extends EntityTracker<SingleLabData> implements DataCollector<LabData> {
  constructor(public nth_tick_period: number = 60) {
    super({ filter: "type", type: "lab" })
  }

  protected override initialData(entity: LuaEntity): SingleLabData | nil {
    return {
      name: entity.name,
      unitNumber: entity.unit_number!,
      location: entity.position,
      timeBuilt: game.tick,
      packs: [],
    }
  }

  protected override onPeriodicUpdate(entity: LuaEntity, data: SingleLabData) {
    const contents = entity.get_inventory(defines.inventory.lab_input)!.get_contents()
    const packCounts = sciencePacks.map((pack) => contents[pack] ?? 0)
    data.packs.push([game.tick, ...packCounts])
  }

  exportData(): LabData {
    const labData = Object.values(this.entityData).filter((data) =>
      data.packs.some((a) => a.some((amt, index) => index > 0 && amt > 0)),
    )
    return {
      period: this.nth_tick_period,
      sciencePacks,
      labs: labData,
    }
  }
}
