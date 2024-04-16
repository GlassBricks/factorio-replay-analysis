// this is the entry point for the TEST mod
// for the actual script, see main.ts

if ("factorio-test" in script.active_mods) {
  require("@NoResolution:__factorio-test__/init")(getProjectFilesMatchingRegex("-test\\.tsx?$"), {
    load_luassert: false,
  })
}
