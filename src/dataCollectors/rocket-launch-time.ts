import { OnRocketLaunchedEvent } from "factorio:runtime"
import { DataCollector } from "../data-collector"

export default class RocketLaunchTime implements DataCollector<{ rocketLaunchTimes: number[] }> {
  launchTimes: number[] = []

  on_rocket_launched(event: OnRocketLaunchedEvent): void {
    this.launchTimes.push(event.tick)
  }

  exportData(): { rocketLaunchTimes: number[] } {
    return { rocketLaunchTimes: this.launchTimes }
  }
}
