import { Analysis } from "../analysis"
import { OnRocketLaunchedEvent } from "factorio:runtime"

export default class SiloLaunchTime implements Analysis<{ rocketLaunchTimes: number[] }> {
  launchTimes: number[] = []

  on_rocket_launched(event: OnRocketLaunchedEvent): void {
    this.launchTimes.push(event.tick)
  }

  exportData(): { rocketLaunchTimes: number[] } {
    return { rocketLaunchTimes: this.launchTimes }
  }
}
