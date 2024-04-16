if ("factorio-test" in script.active_mods) {
  require("@NoResolution:__factorio-test__/init")(getProjectFilesMatchingRegex("-test\\.tsx?$"), {
    load_luassert: false,
  })
}
