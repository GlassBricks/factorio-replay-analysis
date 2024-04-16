import { simulateEvent, testDataCollector } from "./test-util"
import RocketLaunchTime from "../src/dataCollectors/rocket-launch-time"
import expect from "tstl-expect"

test("rocket-launch", () => {
  const dc = testDataCollector(new RocketLaunchTime())

  after_ticks(10, () => {
    simulateEvent(defines.events.on_rocket_launched, { rocket: nil! })

    const data = dc.exportData()
    expect(data.rocketLaunchTimes).toEqual([game.tick])
  })
})
