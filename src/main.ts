import { add_lib } from "event_handler"
import PlayerPosition from "./dataCollectors/player-position"
import MachineProduction from "./dataCollectors/machine-production"
import { addDataCollector, exportAllData } from "./data-collector"
import BufferAmounts from "./dataCollectors/buffer-amounts"
import RocketLaunchTime from "./dataCollectors/rocket-launch-time"
import PlayerInventory from "./dataCollectors/player-inventory"
import ResearchTiming from "./dataCollectors/research-timing"
import LabContents from "./dataCollectors/lab-contents"

const exportOnSiloLaunch = true

// data collectors
addDataCollector(new PlayerPosition())
addDataCollector(new PlayerInventory(60))
addDataCollector(
  new MachineProduction([
    "assembling-machine-1",
    "assembling-machine-2",
    "assembling-machine-3",
    "chemical-plant",
    "oil-refinery",
    "stone-furnace",
    "steel-furnace",
  ]),
)
addDataCollector(new BufferAmounts())
addDataCollector(new LabContents())
addDataCollector(new ResearchTiming())
addDataCollector(new RocketLaunchTime())

// options
if (exportOnSiloLaunch) {
  add_lib({
    events: {
      [defines.events.on_rocket_launched]: () => exportAllData(),
    },
  })
}

commands.add_command("export-replay-data", "Export current collected replay data", () => {
  exportAllData()
  game.print("Exported data to script-output/replay-data/*.json")
})

require("./old-control")
