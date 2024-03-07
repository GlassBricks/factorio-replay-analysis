import { NthTickEventData } from "factorio:runtime"
import { Analysis } from "../analysis"

interface PlayerPositionData {
  period: number
  players: {
    [playerName: string]: [x: number, y: number][]
  }
}

export default class PlayerPosition implements Analysis<PlayerPositionData> {
  constructor(public nth_tick_period: number = 60) {}

  players: Record<string, [x: number, y: number][]> = {}

  on_nth_tick(event: NthTickEventData): void {
    for (const [, player] of game.players) {
      const name = player.name
      const position = player.position
      if (!this.players[name]) {
        this.players[name] = []
        for (let i = 0; i < event.tick; i += this.nth_tick_period) {
          this.players[name].push([position.x, position.y])
        }
      }
      this.players[name].push([position.x, position.y])
    }
  }

  exportData(): PlayerPositionData {
    return {
      period: this.nth_tick_period,
      players: this.players,
    }
  }
}
