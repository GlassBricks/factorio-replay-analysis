import { MapPosition } from "factorio:prototype"
import EntityTracker from "./entity-tracker"
import { LuaEntity, UnitNumber } from "factorio:runtime"
import { DataCollector } from "../data-collector"

export interface SingleBufferData {
  name: string
  unitNumber: number
  location: MapPosition
  timeBuilt: number
  item: string
  amounts: [time: number, amount: number][]
}

export interface BufferData {
  period: number
  buffers: SingleBufferData[]
}

interface TrackedBufferData {
  item?: string
  name: string
  unitNumber: UnitNumber
  location: MapPosition
  timeBuilt: number

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
  ) {
    super({
      filter: "type",
      type: "container",
    })
  }

  protected override initialData(entity: LuaEntity): TrackedBufferData | nil {
    if (!entity.get_inventory(defines.inventory.chest)) return nil
    return {
      name: entity.name,
      unitNumber: entity.unit_number!,
      location: entity.position,
      timeBuilt: game.tick,
      itemCounts: [],
    }
  }

  private getMajorityKey(obj: Record<string, number>): string | nil {
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
    if (max > total / 2) return maxKey
  }

  protected override onPeriodicUpdate(entity: LuaEntity, data: TrackedBufferData) {
    const amounts = data.amounts
    if (amounts) {
      const itemCount = entity.get_inventory(defines.inventory.chest)!.get_item_count(assert(data.item))
      amounts.push([game.tick, itemCount])
    } else {
      const itemCounts = assert(data.itemCounts)
      const counts = entity.get_inventory(defines.inventory.chest)!.get_contents()
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
      const maxKey = this.getMajorityKey(counts)
      if (maxKey) {
        maxAtTime[maxKey] = (maxAtTime[maxKey] ?? 0) + 1
      }
    }
    const finalMax = this.getMajorityKey(maxAtTime)
    if (!(finalMax && maxAtTime[finalMax] > this.minDataPointsToDetermineItem / 2)) {
      // a multiplicity of items, probably not a buffer
      this.removeEntry(data.unitNumber)
      return
    }
    data.item = finalMax

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
        unitNumber: data.unitNumber,
        location: data.location,
        timeBuilt: data.timeBuilt,
        item: data.item!,
        amounts: amounts,
      })
    }
    return {
      period: this.nth_tick_period,
      buffers,
    }
  }
}
