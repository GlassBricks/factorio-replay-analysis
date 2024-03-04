import { add_lib } from "event_handler"
import { addDatum, exportData } from "./datum"
import PlayerPosition from "./datums/player-position"
import SiloLaunchTime from "./datums/silo-launched"

const exportOnSiloLaunch = true

// datums
addDatum(new PlayerPosition())
addDatum(new SiloLaunchTime())

// options
if (exportOnSiloLaunch) {
  add_lib({
    events: {
      [defines.events.on_rocket_launched]: () => exportData(),
    },
  })
}

commands.add_command("export-analysis", "Export current analysis data to analysis-data.json", () => exportData())

require("./old-control")
