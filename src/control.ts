import { add_lib } from "event_handler"
import { addDataCollector, exportAllDataCollectors } from "./dataCollector"
import PlayerPositions from "./dataCollectors/player-position"
import SiloLaunchTimes from "./dataCollectors/silo-launched"
import MachineProductionDataCollector from "./dataCollectors/machine-production"

const exportOnSiloLaunch = true

// datums
addDataCollector(new PlayerPositions())
addDataCollector(new SiloLaunchTimes())

addDataCollector(
  new MachineProductionDataCollector([
    "assembling-machine-1",
    "assembling-machine-2",
    "assembling-machine-3",
    "chemical-plant",
    "oil-refinery",
    "stone-furnace",
    "steel-furnace",
  ]),
)

// options
if (exportOnSiloLaunch) {
  add_lib({
    events: {
      [defines.events.on_rocket_launched]: () => exportAllDataCollectors(),
    },
  })
}

commands.add_command("export-replay-data", "Export current dataCollector data", () => {
  exportAllDataCollectors()
  game.print("Exported dataCollector data to script-output/dataCollector/*.json")
})

require("./old-control")
