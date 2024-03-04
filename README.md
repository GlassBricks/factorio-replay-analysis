# Factorio replay analysis

Generates a control.lua that that collects certain data about a replay, then exports the data to a json file.

To use:
- Replace the existing control.lua in a replay save file with the generated `out/control.lua`
- Run the replay
- Take a (new) save of the replay at some point
- Load the save
- run `/export-analysis`

Currrently, data is also exported immediately after first rocket launch.
