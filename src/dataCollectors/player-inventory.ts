import { DataCollector } from "../data-collector"
import { NthTickEventData } from "factorio:runtime"

interface PlayerInventoryData {
  period: number
  players: {
    [playerName: string]: {
      [itemName: string]: number
    }[]
  }
}

export default class PlayerInventory implements DataCollector<PlayerInventoryData> {
  constructor(public nth_tick_period: number = 360) {}

  players: Record<string, Record<string, number>[]> = {}

  on_nth_tick(event: NthTickEventData) {
    for (const [, player] of game.players) {
      const name = player.name
      if (!this.players[name]) {
        this.players[name] = []
        for (let i = 0; i < event.tick; i += this.nth_tick_period) {
          this.players[name].push({})
        }
      }
      const contents = player.get_main_inventory()?.get_contents() ?? {}
      this.players[name].push(contents)
    }
  }

  exportData(): PlayerInventoryData {
    return {
      period: this.nth_tick_period,
      players: this.players,
    }
  }
}
