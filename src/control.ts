import { add_lib } from "event_handler"
import { addAnalysis, exportAllAnalyses } from "./analysis"
import PlayerPositions from "./analyses/player-position"
import SiloLaunchTimes from "./analyses/silo-launched"
import MachineProductionAnalysis from "./analyses/machine-production"

const exportOnSiloLaunch = true

// datums
addAnalysis(new PlayerPositions())
addAnalysis(new SiloLaunchTimes())

addAnalysis(
  new MachineProductionAnalysis([
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
      [defines.events.on_rocket_launched]: () => exportAllAnalyses(),
    },
  })
}

commands.add_command("export-analysis", "Export current analysis data", () => {
  exportAllAnalyses()
  game.print("Exported analysis data to script-output/analysis/*.json")
})

require("./old-control")
