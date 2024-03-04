import { NthTickEventData } from "factorio:runtime"
import { Datum } from "../datum"

interface PlayerPositionData {
  period: number
  players: {
    [playerName: string]: [x: number, y: number][]
  }
}

export default class PlayerPosition implements Datum<PlayerPositionData> {
  nth_tick_period = 60

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
      log(`tick: ${event.tick}, name: ${name}, position: ${position.x}, ${position.y}`)
    }
  }

  exportData(): PlayerPositionData {
    return {
      period: this.nth_tick_period / 60,
      players: this.players,
    }
  }
}
