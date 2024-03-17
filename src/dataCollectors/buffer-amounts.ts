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

interface TrackedBufferInfo {
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

export default class BufferAmounts extends EntityTracker<TrackedBufferInfo> implements DataCollector<BufferData> {
  constructor(
    public nth_tick_period: number = 60 * 5,
    public minDataPointsToDetermineItemType: number = 5,
  ) {
    super({
      filter: "type",
      type: "container",
    })
  }

  protected override initialData(entity: LuaEntity): TrackedBufferInfo | undefined {
    if (!entity.get_inventory(defines.inventory.chest)) return undefined
    return {
      name: entity.name,
      unitNumber: entity.unit_number!,
      location: entity.position,
      timeBuilt: game.tick,
      itemCounts: [],
    }
  }

  // returns undefined if tied
  private getMaxKey(obj: Record<string, number>): string | undefined {
    let maxKey: string | undefined
    let max = 0
    for (const [key, value] of pairs(obj)) {
      if (value == max) {
        maxKey = undefined
      }
      if (value > max) {
        max = value
        maxKey = key
      }
    }
    return maxKey
  }

  protected override onPeriodicUpdate(entity: LuaEntity, data: TrackedBufferInfo) {
    const amounts = data.amounts
    if (amounts) {
      const itemCount = entity.get_inventory(defines.inventory.chest)!.get_item_count(assert(data.item))
      amounts.push([game.tick, itemCount])
    } else {
      const itemCounts = assert(data.itemCounts)
      // still trying to determine what the dominant item is
      const counts = entity.get_inventory(defines.inventory.chest)!.get_contents()
      if (next(counts)[0] == undefined) return
      itemCounts.push({ time: game.tick, counts })
      if (itemCounts.length == this.minDataPointsToDetermineItemType) {
        this.determineItemType(data)
      }
      return
    }
  }

  private determineItemType(data: TrackedBufferInfo) {
    const maxAtTime: Record<string, number> = {}
    const itemCounts = data.itemCounts!
    for (const { counts } of itemCounts) {
      const maxKey = this.getMaxKey(counts)
      if (maxKey) {
        maxAtTime[maxKey] = (maxAtTime[maxKey] ?? 0) + 1
      }
    }
    const finalMax = this.getMaxKey(maxAtTime)
    if (!(finalMax && maxAtTime[finalMax] > this.minDataPointsToDetermineItemType / 2)) {
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
