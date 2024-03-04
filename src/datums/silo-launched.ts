import { Datum } from "../datum"
import { OnRocketLaunchedEvent } from "factorio:runtime"

export default class SiloLaunchTime implements Datum<number> {
  launchTime: number = -1

  on_rocket_launched(event: OnRocketLaunchedEvent): void {
    this.launchTime = event.tick / 60
  }

  exportData(): number {
    return this.launchTime
  }
}
