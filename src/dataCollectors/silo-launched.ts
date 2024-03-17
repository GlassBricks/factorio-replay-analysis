import { DataCollector } from "../dataCollector"
import { OnRocketLaunchedEvent } from "factorio:runtime"

export default class SiloLaunchTime implements DataCollector<{ rocketLaunchTimes: number[] }> {
  launchTimes: number[] = []

  on_rocket_launched(event: OnRocketLaunchedEvent): void {
    this.launchTimes.push(event.tick)
  }

  exportData(): { rocketLaunchTimes: number[] } {
    return { rocketLaunchTimes: this.launchTimes }
  }
}
