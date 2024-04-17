import EntityTracker from "./entity-tracker"
import { EntityPrototypeFilterWrite, LuaEntity, MapPosition, nil, UnitNumber } from "factorio:runtime"
import { DataCollector } from "../data-collector"

export interface SingleBufferData {
  name: string
  unitNumber: number
  location: MapPosition
  timeBuilt: number
  type: "chest" | "tank"
  content: string
  amounts: [time: number, amount: number][]
}

export interface BufferData {
  period: number
  buffers: SingleBufferData[]
}

interface TrackedBufferData {
  content?: string
  name: string
  unitNumber: UnitNumber
  location: MapPosition
  timeBuilt: number
  type: "chest" | "tank"

  itemCounts?: {
    time: number
    counts: Record<string, number>
  }[]

  amounts?: [time: number, amount: number][]
}

export default class BufferAmounts extends EntityTracker<TrackedBufferData> implements DataCollector<BufferData> {
  constructor(
    public nth_tick_period: number = 60 * 5,
    public minDataPointsToDetermineItem: number = 5,
    public includeTanks: boolean = true,
  ) {
    const filters: EntityPrototypeFilterWrite[] = [
      {
        filter: "type",
        type: ["container", "logistic-container"],
      },
    ]
    if (includeTanks) {
      filters.push({
        filter: "type",
        type: "storage-tank",
        mode: "or",
      })
    }
    super(...filters)
  }

  protected override initialData(entity: LuaEntity): TrackedBufferData | nil {
    const type = entity.type == "storage-tank" ? "tank" : "chest"
    return {
      name: entity.name,
      type,
      unitNumber: entity.unit_number!,
      location: entity.position,
      timeBuilt: game.tick,
      itemCounts: [],
    }
  }

  private getMajorityKey(obj: Record<string, number>, threshold: number): string | nil {
    let maxKey: string | nil
    let max = 0
    let total = 0
    for (const [key, value] of pairs(obj)) {
      if (value > max) {
        max = value
        maxKey = key
      }
      total += value
    }
    if (max >= total * threshold) {
      return maxKey
    }
  }

  protected override onPeriodicUpdate(entity: LuaEntity, data: TrackedBufferData) {
    const amounts = data.amounts
    if (amounts) {
      const counts =
        data.type == "tank"
          ? entity.get_fluid_count(assert(data.content))
          : entity.get_inventory(defines.inventory.chest)!.get_item_count(assert(data.content))
      amounts.push([game.tick, counts])
    } else {
      const itemCounts = assert(data.itemCounts)
      const counts =
        data.type == "tank"
          ? entity.get_fluid_contents()
          : entity.get_inventory(defines.inventory.chest)!.get_contents()
      if (next(counts)[0] == nil) return
      itemCounts.push({ time: game.tick, counts })
      if (itemCounts.length == this.minDataPointsToDetermineItem) {
        this.determineItemType(data)
      }
      return
    }
  }

  private determineItemType(data: TrackedBufferData) {
    const maxAtTime: Record<string, number> = {}
    const itemCounts = data.itemCounts!
    for (const { counts } of itemCounts) {
      const maxKey = this.getMajorityKey(counts, 2 / 3)
      if (maxKey) {
        maxAtTime[maxKey] = (maxAtTime[maxKey] ?? 0) + 1
      }
    }
    const finalMax = this.getMajorityKey(maxAtTime, 1 / 2)
    if (!finalMax) {
      // a multiplicity of items, probably not a buffer
      this.removeEntry(data.unitNumber)
      return
    }
    data.content = finalMax

    data.amounts = []
    for (const { time, counts } of itemCounts) {
      data.amounts.push([time, counts[finalMax] ?? 0])
    }

    delete data.itemCounts
  }

  exportData(): BufferData {
    const buffers: SingleBufferData[] = []
    for (const [unitNumber, entity] of pairs(this.trackedEntities)) {
      const data = this.getEntityData(entity, unitNumber)
      const amounts = data?.amounts
      if (!amounts || !amounts[0]) continue
      const remove = table.remove
      while (amounts[amounts.length - 1][1] == 0) {
        remove(amounts)
      }
      if (!amounts[0]) continue
      buffers.push({
        name: data.name,
        type: data.type,
        unitNumber: data.unitNumber,
        location: data.location,
        timeBuilt: data.timeBuilt,
        content: data.content!,
        amounts: amounts,
      })
    }
    return {
      period: this.nth_tick_period,
      buffers,
    }
  }
}
