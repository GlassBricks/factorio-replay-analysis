--[[ Generated with https://github.com/TypeScriptToLua/TypeScriptToLua ]]

local ____modules = {}
local ____moduleCache = {}
local ____originalRequire = require
local function require(file, ...)
    if ____moduleCache[file] then
        return ____moduleCache[file].value
    end
    if ____modules[file] then
        local module = ____modules[file]
        ____moduleCache[file] = { value = (select("#", ...) > 0) and module(...) or module(file) }
        return ____moduleCache[file].value
    else
        if ____originalRequire then
            return ____originalRequire(file)
        else
            error("module '" .. file .. "' not found")
        end
    end
end
____modules = {
["lualib_bundle"] = function(...) 
local function __TS__StringAccess(self, index)
    if index >= 0 and index < #self then
        return string.sub(self, index + 1, index + 1)
    end
end

local function __TS__StringEndsWith(self, searchString, endPosition)
    if endPosition == nil or endPosition > #self then
        endPosition = #self
    end
    return string.sub(self, endPosition - #searchString + 1, endPosition) == searchString
end

local function __TS__StringSlice(self, start, ____end)
    if start == nil or start ~= start then
        start = 0
    end
    if ____end ~= ____end then
        ____end = 0
    end
    if start >= 0 then
        start = start + 1
    end
    if ____end ~= nil and ____end < 0 then
        ____end = ____end - 1
    end
    return string.sub(self, start, ____end)
end

local function __TS__Class(self)
    local c = {prototype = {}}
    c.prototype.__index = c.prototype
    c.prototype.constructor = c
    return c
end

local function __TS__CountVarargs(...)
    return select("#", ...)
end

local function __TS__SparseArrayNew(...)
    local sparseArray = {...}
    sparseArray.sparseLength = __TS__CountVarargs(...)
    return sparseArray
end

local function __TS__SparseArrayPush(sparseArray, ...)
    local args = {...}
    local argsLen = __TS__CountVarargs(...)
    local listLen = sparseArray.sparseLength
    for i = 1, argsLen do
        sparseArray[listLen + i] = args[i]
    end
    sparseArray.sparseLength = listLen + argsLen
end

local function __TS__SparseArraySpread(sparseArray)
    local _unpack = unpack or table.unpack
    return _unpack(sparseArray, 1, sparseArray.sparseLength)
end

local function __TS__ArrayIncludes(self, searchElement, fromIndex)
    if fromIndex == nil then
        fromIndex = 0
    end
    local len = #self
    local k = fromIndex
    if fromIndex < 0 then
        k = len + fromIndex
    end
    if k < 0 then
        k = 0
    end
    for i = k + 1, len do
        if self[i] == searchElement then
            return true
        end
    end
    return false
end

local function __TS__StringIncludes(self, searchString, position)
    if not position then
        position = 1
    else
        position = position + 1
    end
    local index = string.find(self, searchString, position, true)
    return index ~= nil
end

local function __TS__New(target, ...)
    local instance = setmetatable({}, target.prototype)
    instance:____constructor(...)
    return instance
end

local function __TS__ClassExtends(target, base)
    target.____super = base
    local staticMetatable = setmetatable({__index = base}, base)
    setmetatable(target, staticMetatable)
    local baseMetatable = getmetatable(base)
    if baseMetatable then
        if type(baseMetatable.__index) == "function" then
            staticMetatable.__index = baseMetatable.__index
        end
        if type(baseMetatable.__newindex) == "function" then
            staticMetatable.__newindex = baseMetatable.__newindex
        end
    end
    setmetatable(target.prototype, base.prototype)
    if type(base.prototype.__index) == "function" then
        target.prototype.__index = base.prototype.__index
    end
    if type(base.prototype.__newindex) == "function" then
        target.prototype.__newindex = base.prototype.__newindex
    end
    if type(base.prototype.__tostring) == "function" then
        target.prototype.__tostring = base.prototype.__tostring
    end
end

local Error, RangeError, ReferenceError, SyntaxError, TypeError, URIError
do
    local function getErrorStack(self, constructor)
        if debug == nil then
            return nil
        end
        local level = 1
        while true do
            local info = debug.getinfo(level, "f")
            level = level + 1
            if not info then
                level = 1
                break
            elseif info.func == constructor then
                break
            end
        end
        if __TS__StringIncludes(_VERSION, "Lua 5.0") then
            return debug.traceback(("[Level " .. tostring(level)) .. "]")
        else
            return debug.traceback(nil, level)
        end
    end
    local function wrapErrorToString(self, getDescription)
        return function(self)
            local description = getDescription(self)
            local caller = debug.getinfo(3, "f")
            local isClassicLua = __TS__StringIncludes(_VERSION, "Lua 5.0") or _VERSION == "Lua 5.1"
            if isClassicLua or caller and caller.func ~= error then
                return description
            else
                return (description .. "\n") .. tostring(self.stack)
            end
        end
    end
    local function initErrorClass(self, Type, name)
        Type.name = name
        return setmetatable(
            Type,
            {__call = function(____, _self, message) return __TS__New(Type, message) end}
        )
    end
    local ____initErrorClass_1 = initErrorClass
    local ____class_0 = __TS__Class()
    ____class_0.name = ""
    function ____class_0.prototype.____constructor(self, message)
        if message == nil then
            message = ""
        end
        self.message = message
        self.name = "Error"
        self.stack = getErrorStack(nil, self.constructor.new)
        local metatable = getmetatable(self)
        if metatable and not metatable.__errorToStringPatched then
            metatable.__errorToStringPatched = true
            metatable.__tostring = wrapErrorToString(nil, metatable.__tostring)
        end
    end
    function ____class_0.prototype.__tostring(self)
        return self.message ~= "" and (self.name .. ": ") .. self.message or self.name
    end
    Error = ____initErrorClass_1(nil, ____class_0, "Error")
    local function createErrorClass(self, name)
        local ____initErrorClass_3 = initErrorClass
        local ____class_2 = __TS__Class()
        ____class_2.name = ____class_2.name
        __TS__ClassExtends(____class_2, Error)
        function ____class_2.prototype.____constructor(self, ...)
            ____class_2.____super.prototype.____constructor(self, ...)
            self.name = name
        end
        return ____initErrorClass_3(nil, ____class_2, name)
    end
    RangeError = createErrorClass(nil, "RangeError")
    ReferenceError = createErrorClass(nil, "ReferenceError")
    SyntaxError = createErrorClass(nil, "SyntaxError")
    TypeError = createErrorClass(nil, "TypeError")
    URIError = createErrorClass(nil, "URIError")
end

local function __TS__ObjectGetOwnPropertyDescriptors(object)
    local metatable = getmetatable(object)
    if not metatable then
        return {}
    end
    return rawget(metatable, "_descriptors") or ({})
end

local function __TS__Delete(target, key)
    local descriptors = __TS__ObjectGetOwnPropertyDescriptors(target)
    local descriptor = descriptors[key]
    if descriptor then
        if not descriptor.configurable then
            error(
                __TS__New(
                    TypeError,
                    ((("Cannot delete property " .. tostring(key)) .. " of ") .. tostring(target)) .. "."
                ),
                0
            )
        end
        descriptors[key] = nil
        return true
    end
    target[key] = nil
    return true
end

return {
  __TS__StringAccess = __TS__StringAccess,
  __TS__StringEndsWith = __TS__StringEndsWith,
  __TS__StringSlice = __TS__StringSlice,
  __TS__Class = __TS__Class,
  __TS__SparseArrayNew = __TS__SparseArrayNew,
  __TS__SparseArrayPush = __TS__SparseArrayPush,
  __TS__SparseArraySpread = __TS__SparseArraySpread,
  __TS__ArrayIncludes = __TS__ArrayIncludes,
  __TS__Delete = __TS__Delete,
  __TS__New = __TS__New
}
 end,
["dataCollector"] = function(...) 
local ____lualib = require("lualib_bundle")
local __TS__StringAccess = ____lualib.__TS__StringAccess
local __TS__StringEndsWith = ____lualib.__TS__StringEndsWith
local __TS__StringSlice = ____lualib.__TS__StringSlice
local ____exports = {}
local ____event_handler = require("event_handler")
local add_lib = ____event_handler.add_lib
local initialDataCollectors = {}
local function getDataCollectors(self)
    if not global.dataCollectors then
        global.dataCollectors = initialDataCollectors
    end
    return global.dataCollectors
end
function ____exports.addDataCollector(self, dataCollector)
    local lib = {events = {}, on_nth_tick = {}}
    local dataCollectorName = dataCollector.constructor.name
    script.register_metatable(
        "dataCollector:" .. dataCollectorName,
        getmetatable(dataCollector)
    )
    if initialDataCollectors[dataCollectorName] then
        error("dataCollector already exists: " .. dataCollectorName)
    end
    initialDataCollectors[dataCollectorName] = dataCollector
    for name, id in pairs(defines.events) do
        if dataCollector[name] then
            lib.events[id] = function(event)
                local ____self_0 = getDataCollectors(nil)[dataCollectorName]
                ____self_0[name](____self_0, event)
            end
        end
    end
    if dataCollector.on_nth_tick then
        assert(dataCollector.nth_tick_period, "on_nth_tick requires nth_tick_period")
        lib.on_nth_tick[dataCollector.nth_tick_period] = function(event)
            getDataCollectors(nil)[dataCollectorName]:on_nth_tick(event)
        end
    end
    if dataCollector.on_init then
        lib.on_init = function()
            getDataCollectors(nil)[dataCollectorName]:on_init()
        end
    end
    add_lib(lib)
end
add_lib({
    on_init = function()
        getDataCollectors(nil)
    end,
    on_load = function()
        if __DebugAdapter ~= nil then
            __DebugAdapter.breakpoint()
        end
    end,
    events = {[defines.events.on_game_created_from_scenario] = function()
        getDataCollectors(nil)
    end}
})
local function getOutFileName(self, s)
    local lowerCamelCase = string.lower(__TS__StringAccess(s, 0)) .. string.sub(s, 2)
    if __TS__StringEndsWith(lowerCamelCase, "DataCollector") then
        return __TS__StringSlice(lowerCamelCase, 0, -#"DataCollector")
    end
    return lowerCamelCase
end
function ____exports.exportAllDataCollectors(self)
    for name, datum in pairs(global.dataCollectors) do
        local outname = ("dataCollector/" .. getOutFileName(nil, name)) .. ".json"
        log("Exporting " .. name)
        local data = game.table_to_json(datum:exportData())
        game.write_file(outname, data)
    end
    log("Exported dataCollector data to script-output/dataCollector/*.json")
end
return ____exports
 end,
["dataCollectors.player-position"] = function(...) 
local ____lualib = require("lualib_bundle")
local __TS__Class = ____lualib.__TS__Class
local ____exports = {}
local floor = math.floor
____exports.default = __TS__Class()
local PlayerPosition = ____exports.default
PlayerPosition.name = "PlayerPosition"
function PlayerPosition.prototype.____constructor(self, nth_tick_period)
    if nth_tick_period == nil then
        nth_tick_period = 60
    end
    self.nth_tick_period = nth_tick_period
    self.players = {}
end
function PlayerPosition.prototype.on_nth_tick(self, event)
    for ____, player in pairs(game.players) do
        local name = player.name
        local position = player.position
        local x = floor(position.x + 0.5)
        local y = floor(position.y + 0.5)
        if not self.players[name] then
            self.players[name] = {}
            do
                local i = 0
                while i < event.tick do
                    local ____self_players_name_0 = self.players[name]
                    ____self_players_name_0[#____self_players_name_0 + 1] = {x, y}
                    i = i + self.nth_tick_period
                end
            end
        end
        local ____self_players_name_1 = self.players[name]
        ____self_players_name_1[#____self_players_name_1 + 1] = {x, y}
    end
end
function PlayerPosition.prototype.exportData(self)
    return {period = self.nth_tick_period, players = self.players}
end
return ____exports
 end,
["dataCollectors.silo-launched"] = function(...) 
local ____lualib = require("lualib_bundle")
local __TS__Class = ____lualib.__TS__Class
local ____exports = {}
____exports.default = __TS__Class()
local SiloLaunchTime = ____exports.default
SiloLaunchTime.name = "SiloLaunchTime"
function SiloLaunchTime.prototype.____constructor(self)
    self.launchTimes = {}
end
function SiloLaunchTime.prototype.on_rocket_launched(self, event)
    local ____self_launchTimes_0 = self.launchTimes
    ____self_launchTimes_0[#____self_launchTimes_0 + 1] = event.tick
end
function SiloLaunchTime.prototype.exportData(self)
    return {rocketLaunchTimes = self.launchTimes}
end
return ____exports
 end,
["dataCollectors.machine-production"] = function(...) 
local ____lualib = require("lualib_bundle")
local __TS__Class = ____lualib.__TS__Class
local __TS__SparseArrayNew = ____lualib.__TS__SparseArrayNew
local __TS__SparseArrayPush = ____lualib.__TS__SparseArrayPush
local __TS__SparseArraySpread = ____lualib.__TS__SparseArraySpread
local __TS__ArrayIncludes = ____lualib.__TS__ArrayIncludes
local __TS__Delete = ____lualib.__TS__Delete
local ____exports = {}
____exports.default = __TS__Class()
local MachineProductionDataCollector = ____exports.default
MachineProductionDataCollector.name = "MachineProductionDataCollector"
function MachineProductionDataCollector.prototype.____constructor(self, prototypes, nth_tick_period)
    if nth_tick_period == nil then
        nth_tick_period = 60 * 5
    end
    self.prototypes = prototypes
    self.nth_tick_period = nth_tick_period
    self.trackedMachines = {}
    self.machines = {}
    self.nth_tick_period = nth_tick_period
end
function MachineProductionDataCollector.prototype.on_init(self)
    for ____, name in ipairs(self.prototypes) do
        local prototype = game.entity_prototypes[name]
        assert(prototype, "prototype not found: " .. name)
        assert(prototype.type == "assembling-machine" or prototype.type == "furnace" or prototype.type == "rocket-silo", "Not a crafting machine or furnace: " .. name)
    end
end
function MachineProductionDataCollector.prototype.getStatus(self, entity)
    local commonKeys = {
        "working",
        "normal",
        "no_power",
        "low_power",
        "no_fuel",
        "disabled_by_control_behavior",
        "disabled_by_script",
        "marked_for_deconstruction"
    }
    local ____array_0 = __TS__SparseArrayNew(table.unpack(commonKeys))
    __TS__SparseArrayPush(
        ____array_0,
        "no_recipe",
        "fluid_ingredient_shortage",
        "full_output",
        "item_ingredient_shortage"
    )
    local craftingMachineKeys = {__TS__SparseArraySpread(____array_0)}
    local ____array_1 = __TS__SparseArrayNew(table.unpack(commonKeys))
    __TS__SparseArrayPush(____array_1, "no_ingredients")
    local furnaceKeys = {__TS__SparseArraySpread(____array_1)}
    local keys = (entity.type == "assembling-machine" or entity.type == "rocket-silo") and craftingMachineKeys or (entity.type == "furnace" and furnaceKeys or error("Invalid entity type"))
    local status = entity.status
    for ____, key in ipairs(keys) do
        if defines.entity_status[key] == status then
            return key
        end
    end
    log("Unknown status for crafting machine: " .. tostring(status))
    for key, value in pairs(defines.entity_status) do
        log((key .. " ") .. tostring(value))
    end
    return "unknown"
end
function MachineProductionDataCollector.prototype.onBuilt(self, entity)
    if __TS__ArrayIncludes(self.prototypes, entity.name) and entity.unit_number then
        self.trackedMachines[entity.unit_number] = entity
        self.machines[entity.unit_number] = {byRecipe = {}, timeBuilt = game.tick, lastProductsFinished = 0}
    end
end
function MachineProductionDataCollector.prototype.tryUpdateEntity(self, entity, status, onlyIfRecipeChanged)
    if onlyIfRecipeChanged == nil then
        onlyIfRecipeChanged = false
    end
    if entity and entity.valid then
        local unitNumber = entity.unit_number
        if unitNumber and self.trackedMachines[unitNumber] then
            self:updateEntity(entity, unitNumber, status, onlyIfRecipeChanged)
        end
    end
end
function MachineProductionDataCollector.prototype.updateEntity(self, entity, unitNumber, status, onlyIfRecipeChanged)
    if onlyIfRecipeChanged == nil then
        onlyIfRecipeChanged = false
    end
    if not entity.valid then
        __TS__Delete(self.trackedMachines, unitNumber)
        return
    end
    local machine = self.machines[unitNumber]
    if not machine then
        return
    end
    local ____opt_2 = entity.get_recipe()
    local recipe = ____opt_2 and ____opt_2.name
    local lastRecipe = machine.lastRecipe
    local recipeChanged = recipe ~= lastRecipe
    if recipeChanged and lastRecipe then
        local lastEntry = machine.byRecipe[lastRecipe]
        if lastEntry ~= nil then
            local ____lastEntry_production_4 = lastEntry.production
            ____lastEntry_production_4[#____lastEntry_production_4 + 1] = {game.tick, entity.products_finished - machine.lastProductsFinished, "recipe-changed"}
        end
        machine.lastProductsFinished = entity.products_finished
    end
    machine.lastRecipe = recipe
    if not recipe or onlyIfRecipeChanged and not recipeChanged then
        return
    end
    if not machine.byRecipe[recipe] then
        machine.byRecipe[recipe] = {
            name = entity.name,
            recipe = recipe,
            unitNumber = unitNumber,
            location = entity.position,
            timeBuilt = machine.timeBuilt,
            timeStarted = game.tick,
            production = {}
        }
    end
    local entry = machine.byRecipe[recipe]
    local productsFinished = entity.products_finished
    local delta = productsFinished - machine.lastProductsFinished
    machine.lastProductsFinished = productsFinished
    if status == nil then
        status = self:getStatus(entity)
    end
    local ____entry_production_5 = entry.production
    ____entry_production_5[#____entry_production_5 + 1] = {
        game.tick,
        delta,
        status or self:getStatus(entity)
    }
end
function MachineProductionDataCollector.prototype.on_built_entity(self, event)
    self:onBuilt(event.created_entity)
end
function MachineProductionDataCollector.prototype.on_robot_built_entity(self, event)
    self:onBuilt(event.created_entity)
end
function MachineProductionDataCollector.prototype.on_pre_player_mined_item(self, event)
    self:tryUpdateEntity(event.entity, "mined")
end
function MachineProductionDataCollector.prototype.on_robot_pre_mined(self, event)
    self:tryUpdateEntity(event.entity, "mined")
end
function MachineProductionDataCollector.prototype.on_entity_died(self, event)
    self:tryUpdateEntity(event.entity, "entity-died")
end
function MachineProductionDataCollector.prototype.on_marked_for_deconstruction(self, event)
    self:tryUpdateEntity(event.entity)
end
function MachineProductionDataCollector.prototype.on_cancelled_deconstruction(self, event)
    self:tryUpdateEntity(event.entity)
end
function MachineProductionDataCollector.prototype.on_gui_closed(self, event)
    local entity = event.entity
    if entity then
        self:tryUpdateEntity(entity, nil, true)
    end
end
function MachineProductionDataCollector.prototype.on_entity_settings_pasted(self, event)
    self:tryUpdateEntity(event.destination, nil, true)
end
function MachineProductionDataCollector.prototype.on_nth_tick(self)
    for unitNumber, entity in pairs(self.trackedMachines) do
        self:updateEntity(entity, unitNumber)
    end
end
function MachineProductionDataCollector.prototype.exportData(self)
    local totalSize = 0
    local machines = {}
    for ____, machine in pairs(self.machines) do
        for ____, production in pairs(machine.byRecipe) do
            if #production.production > 0 then
                machines[#machines + 1] = production
                totalSize = totalSize + #production.production
            end
        end
    end
    log("Total size: " .. tostring(totalSize))
    return {period = self.nth_tick_period, machines = machines}
end
return ____exports
 end,
["control"] = function(...) 
local ____lualib = require("lualib_bundle")
local __TS__New = ____lualib.__TS__New
local ____exports = {}
local ____event_handler = require("event_handler")
local add_lib = ____event_handler.add_lib
local ____dataCollector = require("dataCollector")
local addDataCollector = ____dataCollector.addDataCollector
local exportAllDataCollectors = ____dataCollector.exportAllDataCollectors
local ____player_2Dposition = require("dataCollectors.player-position")
local PlayerPositions = ____player_2Dposition.default
local ____silo_2Dlaunched = require("dataCollectors.silo-launched")
local SiloLaunchTimes = ____silo_2Dlaunched.default
local ____machine_2Dproduction = require("dataCollectors.machine-production")
local MachineProductionDataCollector = ____machine_2Dproduction.default
local exportOnSiloLaunch = true
addDataCollector(
    nil,
    __TS__New(PlayerPositions)
)
addDataCollector(
    nil,
    __TS__New(SiloLaunchTimes)
)
addDataCollector(
    nil,
    __TS__New(MachineProductionDataCollector, {
        "assembling-machine-1",
        "assembling-machine-2",
        "assembling-machine-3",
        "chemical-plant",
        "oil-refinery",
        "stone-furnace",
        "steel-furnace"
    })
)
if exportOnSiloLaunch then
    add_lib({events = {[defines.events.on_rocket_launched] = function() return exportAllDataCollectors(nil) end}})
end
commands.add_command(
    "export-dataCollector",
    "Export current dataCollector data",
    function()
        exportAllDataCollectors(nil)
        game.print("Exported dataCollector data to script-output/dataCollector/*.json")
    end
)
require("old-control")
return ____exports
 end,
["old-control"] = function(...) 
local handler = require("event_handler")
handler.add_lib(require("freeplay"))
handler.add_lib(require("silo-script"))
 end,
}
return require("control", ...)
