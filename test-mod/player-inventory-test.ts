import { testDataCollector } from "./test-util"
import PlayerInventory from "../src/dataCollectors/player-inventory"
import expect from "tstl-expect"

test("tracks player inventory", () => {
  const player = game.players[1]
  player.get_main_inventory()!.clear()
  const dataCollector = testDataCollector(new PlayerInventory(60))
  after_ticks(60 - 1, () => player.insert({ name: "iron-plate", count: 10 }))
  after_ticks(60 * 2 - 1, () => player.insert({ name: "copper-plate", count: 15 }))
  after_ticks(60 * 2, () => {
    const data = dataCollector.exportData()
    expect(data.players[player.name]).toEqual([{}, { "iron-plate": 10 }, { "iron-plate": 10, "copper-plate": 15 }])
  })
})
