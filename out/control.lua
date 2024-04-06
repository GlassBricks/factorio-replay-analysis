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

local function __TS__ArrayEvery(self, callbackfn, thisArg)
    for i = 1, #self do
        if not callbackfn(thisArg, self[i], i - 1, self) then
            return false
        end
    end
    return true
end

return {
  __TS__StringAccess = __TS__StringAccess,
  __TS__StringEndsWith = __TS__StringEndsWith,
  __TS__StringSlice = __TS__StringSlice,
  __TS__Class = __TS__Class,
  __TS__Delete = __TS__Delete,
  __TS__SparseArrayNew = __TS__SparseArrayNew,
  __TS__SparseArrayPush = __TS__SparseArrayPush,
  __TS__SparseArraySpread = __TS__SparseArraySpread,
  __TS__ClassExtends = __TS__ClassExtends,
  __TS__ArrayEvery = __TS__ArrayEvery,
  __TS__New = __TS__New
}
 end,
["data-collector"] = function(...) 
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
function ____exports.exportAllData(self)
    for name, datum in pairs(global.dataCollectors) do
        local outname = ("replay-data/" .. getOutFileName(nil, name)) .. ".json"
        log("Exporting " .. name)
        local data = game.table_to_json(datum:exportData())
        game.write_file(outname, data)
    end
    log("Exported dataCollector data to script-output/replay-data/*.json")
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
["dataCollectors.entity-tracker"] = function(...) 
local ____lualib = require("lualib_bundle")
local __TS__Class = ____lualib.__TS__Class
local __TS__Delete = ____lualib.__TS__Delete
local ____exports = {}
____exports.default = __TS__Class()
local EntityTracker = ____exports.default
EntityTracker.name = "EntityTracker"
function EntityTracker.prototype.____constructor(self, ...)
    local prototypeFilters = {...}
    self.prototypes = {}
    self.trackedEntities = {}
    self.entityData = {}
    self.prototypeFilters = prototypeFilters
end
function EntityTracker.prototype.on_init(self)
    for name in pairs(game.get_filtered_entity_prototypes(self.prototypeFilters)) do
        self.prototypes[name] = true
    end
    __TS__Delete(self, "prototypeFilters")
end
function EntityTracker.prototype.onCreated(self, entity, event)
    local unitNumber = entity.unit_number
    if unitNumber and self.prototypes[entity.name] ~= nil then
        local data = self:initialData(entity, event)
        if data then
            self.trackedEntities[unitNumber] = entity
            self.entityData[unitNumber] = data
        end
    end
end
function EntityTracker.prototype.on_built_entity(self, event)
    self:onCreated(event.created_entity, event)
end
function EntityTracker.prototype.on_robot_built_entity(self, event)
    self:onCreated(event.created_entity, event)
end
function EntityTracker.prototype.onDeleted(self, entity, _event)
    local unitNumber = entity.unit_number
    if unitNumber then
        self:removeEntry(unitNumber)
    end
end
function EntityTracker.prototype.removeEntry(self, unitNumber)
    __TS__Delete(self.trackedEntities, unitNumber)
end
function EntityTracker.prototype.on_pre_player_mined_item(self, event)
    self:onDeleted(event.entity, event)
end
function EntityTracker.prototype.on_robot_pre_mined(self, event)
    self:onDeleted(event.entity, event)
end
function EntityTracker.prototype.on_entity_died(self, event)
    self:onDeleted(event.entity, event)
end
function EntityTracker.prototype.getEntityData(self, entity, unitNumber)
    if not entity.valid then
        if unitNumber then
            __TS__Delete(self.trackedEntities, unitNumber)
        end
        return nil
    end
    if unitNumber == nil then
        unitNumber = entity.unit_number
    end
    if unitNumber then
        return self.entityData[unitNumber]
    end
    return nil
end
function EntityTracker.prototype.on_nth_tick(self)
    for unitNumber, entity in pairs(self.trackedEntities) do
        local data = self:getEntityData(entity, unitNumber)
        if data then
            self:onPeriodicUpdate(entity, data)
        end
    end
end
return ____exports
 end,
["dataCollectors.machine-production"] = function(...) 
local ____lualib = require("lualib_bundle")
local __TS__SparseArrayNew = ____lualib.__TS__SparseArrayNew
local __TS__SparseArrayPush = ____lualib.__TS__SparseArrayPush
local __TS__SparseArraySpread = ____lualib.__TS__SparseArraySpread
local __TS__Class = ____lualib.__TS__Class
local __TS__ClassExtends = ____lualib.__TS__ClassExtends
local __TS__ArrayEvery = ____lualib.__TS__ArrayEvery
local ____exports = {}
local ____entity_2Dtracker = require("dataCollectors.entity-tracker")
local EntityTracker = ____entity_2Dtracker.default
local stoppedStatuses = {disabled_by_script = true, marked_for_deconstruction = true, no_recipe = true}
local function isStoppingStatus(self, status)
    return stoppedStatuses[status] ~= nil
end
local commonStatuses = {
    "working",
    "normal",
    "no_power",
    "low_power",
    "no_fuel",
    "disabled_by_control_behavior",
    "disabled_by_script",
    "marked_for_deconstruction"
}
local ____array_0 = __TS__SparseArrayNew(table.unpack(commonStatuses))
__TS__SparseArrayPush(
    ____array_0,
    "no_recipe",
    "fluid_ingredient_shortage",
    "full_output",
    "item_ingredient_shortage"
)
local craftingMachineStatuses = {__TS__SparseArraySpread(____array_0)}
local ____array_1 = __TS__SparseArrayNew(table.unpack(commonStatuses))
__TS__SparseArrayPush(____array_1, "no_ingredients")
local furnaceStatuses = {__TS__SparseArraySpread(____array_1)}
____exports.default = __TS__Class()
local MachineProduction = ____exports.default
MachineProduction.name = "MachineProduction"
__TS__ClassExtends(MachineProduction, EntityTracker)
function MachineProduction.prototype.____constructor(self, prototypes, nth_tick_period)
    if nth_tick_period == nil then
        nth_tick_period = 60 * 5
    end
    EntityTracker.prototype.____constructor(self, {filter = "name", name = prototypes})
    self.nth_tick_period = nth_tick_period
end
function MachineProduction.prototype.on_init(self)
    EntityTracker.prototype.on_init(self)
    for name in pairs(self.prototypes) do
        local prototype = game.entity_prototypes[name]
        assert(prototype.type == "assembling-machine" or prototype.type == "furnace" or prototype.type == "rocket-silo", "Not a crafting machine or furnace: " .. name)
    end
end
function MachineProduction.prototype.getStatus(self, entity)
    local keys = (entity.type == "assembling-machine" or entity.type == "rocket-silo") and craftingMachineStatuses or (entity.type == "furnace" and furnaceStatuses or error("Invalid entity type"))
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
function MachineProduction.prototype.initialData(self, entity)
    return {
        name = entity.name,
        unitNumber = entity.unit_number,
        location = entity.position,
        timeBuilt = game.tick,
        lastProductsFinished = 0,
        lastRecipe = nil,
        recipeProduction = {}
    }
end
function MachineProduction.prototype.addDataPoint(self, entity, info, status)
    local tick = game.tick
    local recipeProduction = info.recipeProduction
    local currentProduction = recipeProduction[#recipeProduction]
    local lastEntry = currentProduction.production[#currentProduction.production]
    if lastEntry == nil or lastEntry[1] ~= tick then
        local productsFinished = entity.products_finished
        local delta = productsFinished - info.lastProductsFinished
        info.lastProductsFinished = productsFinished
        local ____currentProduction_production_2 = currentProduction.production
        ____currentProduction_production_2[#____currentProduction_production_2 + 1] = {tick, delta, status}
    end
end
function MachineProduction.prototype.markProductionFinished(self, entity, info, status, reason)
    local recipeProduction = info.recipeProduction
    local lastProduction = recipeProduction[#recipeProduction]
    if lastProduction == nil then
        return
    end
    self:addDataPoint(entity, info, status)
    local production = lastProduction.production
    if #production == 0 or __TS__ArrayEvery(
        production,
        function(____, ____bindingPattern0)
            local delta
            delta = ____bindingPattern0[2]
            return delta == 0
        end
    ) then
        table.remove(recipeProduction)
        return
    end
    lastProduction.timeStopped = game.tick
    lastProduction.stoppedReason = reason
end
function MachineProduction.prototype.startNewProduction(self, info, recipe)
    local ____info_recipeProduction_3 = info.recipeProduction
    ____info_recipeProduction_3[#____info_recipeProduction_3 + 1] = {recipe = recipe, timeStarted = game.tick, production = {}}
end
function MachineProduction.prototype.tryCheckRunningChanged(self, entity, knownStopReason)
    local info = self:getEntityData(entity)
    if info then
        self:checkRunningChanged(entity, info, nil, knownStopReason)
    end
end
function MachineProduction.prototype.checkRunningChanged(self, entity, info, status, knownStopReason)
    local ____opt_4 = entity.get_recipe()
    local recipe = ____opt_4 and ____opt_4.name
    local lastRecipe = info.lastRecipe
    if not recipe and entity.type == "furnace" then
        recipe = lastRecipe
    end
    info.lastRecipe = recipe
    local recipeChanged = recipe ~= lastRecipe
    if status == nil then
        status = self:getStatus(entity)
    end
    local isStopped = knownStopReason ~= nil or isStoppingStatus(nil, status)
    local updated = false
    if lastRecipe then
        if recipeChanged or status == "no_recipe" then
            self:markProductionFinished(entity, info, status, "recipe_changed")
            updated = true
        elseif isStopped then
            self:markProductionFinished(entity, info, status, knownStopReason or status)
            updated = true
        end
    end
    if recipe and (recipeChanged or #info.recipeProduction == 0) then
        self:startNewProduction(info, recipe)
        updated = true
    end
    return updated, not isStopped and recipe ~= nil
end
function MachineProduction.prototype.onDeleted(self, entity, event)
    self:tryCheckRunningChanged(entity, event.name == defines.events.on_entity_died and "entity_died" or "mined")
    EntityTracker.prototype.onDeleted(self, entity, event)
end
function MachineProduction.prototype.on_marked_for_deconstruction(self, event)
    self:tryCheckRunningChanged(event.entity, "marked_for_deconstruction")
end
function MachineProduction.prototype.on_cancelled_deconstruction(self, event)
    self:tryCheckRunningChanged(event.entity, nil)
end
function MachineProduction.prototype.on_gui_closed(self, event)
    if event.entity then
        self:tryCheckRunningChanged(event.entity, nil)
    end
end
function MachineProduction.prototype.on_entity_settings_pasted(self, event)
    self:tryCheckRunningChanged(event.destination, nil)
end
function MachineProduction.prototype.onPeriodicUpdate(self, entity, data)
    local status = self:getStatus(entity)
    local updated, isRunning = self:checkRunningChanged(entity, data, status, nil)
    local shouldAddDataPoint = not updated and isRunning
    if shouldAddDataPoint then
        self:addDataPoint(entity, data, status)
    end
end
function MachineProduction.prototype.exportData(self)
    local machines = {}
    for ____, machine in pairs(self.entityData) do
        do
            local recipes = machine.recipeProduction
            if #recipes == 0 then
                goto __continue37
            end
            machines[#machines + 1] = {
                name = machine.name,
                unitNumber = machine.unitNumber,
                location = machine.location,
                timeBuilt = machine.timeBuilt,
                recipes = recipes
            }
        end
        ::__continue37::
    end
    return {period = self.nth_tick_period, machines = machines}
end
return ____exports
 end,
["dataCollectors.buffer-amounts"] = function(...) 
local ____lualib = require("lualib_bundle")
local __TS__Class = ____lualib.__TS__Class
local __TS__ClassExtends = ____lualib.__TS__ClassExtends
local __TS__Delete = ____lualib.__TS__Delete
local ____exports = {}
local ____entity_2Dtracker = require("dataCollectors.entity-tracker")
local EntityTracker = ____entity_2Dtracker.default
____exports.default = __TS__Class()
local BufferAmounts = ____exports.default
BufferAmounts.name = "BufferAmounts"
__TS__ClassExtends(BufferAmounts, EntityTracker)
function BufferAmounts.prototype.____constructor(self, nth_tick_period, minDataPointsToDetermineItemType)
    if nth_tick_period == nil then
        nth_tick_period = 60 * 5
    end
    if minDataPointsToDetermineItemType == nil then
        minDataPointsToDetermineItemType = 5
    end
    EntityTracker.prototype.____constructor(self, {filter = "type", type = "container"})
    self.nth_tick_period = nth_tick_period
    self.minDataPointsToDetermineItemType = minDataPointsToDetermineItemType
end
function BufferAmounts.prototype.initialData(self, entity)
    if not entity.get_inventory(defines.inventory.chest) then
        return nil
    end
    return {
        name = entity.name,
        unitNumber = entity.unit_number,
        location = entity.position,
        timeBuilt = game.tick,
        itemCounts = {}
    }
end
function BufferAmounts.prototype.getMaxKey(self, obj)
    local maxKey
    local max = 0
    for key, value in pairs(obj) do
        if value == max then
            maxKey = nil
        end
        if value > max then
            max = value
            maxKey = key
        end
    end
    return maxKey
end
function BufferAmounts.prototype.onPeriodicUpdate(self, entity, data)
    local amounts = data.amounts
    if amounts then
        local itemCount = entity.get_inventory(defines.inventory.chest).get_item_count(assert(data.item))
        amounts[#amounts + 1] = {game.tick, itemCount}
    else
        local itemCounts = assert(data.itemCounts)
        local counts = entity.get_inventory(defines.inventory.chest).get_contents()
        if (next(counts)) == nil then
            return
        end
        itemCounts[#itemCounts + 1] = {time = game.tick, counts = counts}
        if #itemCounts == self.minDataPointsToDetermineItemType then
            self:determineItemType(data)
        end
        return
    end
end
function BufferAmounts.prototype.determineItemType(self, data)
    local maxAtTime = {}
    local itemCounts = data.itemCounts
    for ____, ____value in ipairs(itemCounts) do
        local counts = ____value.counts
        local maxKey = self:getMaxKey(counts)
        if maxKey then
            maxAtTime[maxKey] = (maxAtTime[maxKey] or 0) + 1
        end
    end
    local finalMax = self:getMaxKey(maxAtTime)
    if not (finalMax and maxAtTime[finalMax] > self.minDataPointsToDetermineItemType / 2) then
        self:removeEntry(data.unitNumber)
        return
    end
    data.item = finalMax
    data.amounts = {}
    for ____, ____value in ipairs(itemCounts) do
        local time = ____value.time
        local counts = ____value.counts
        local ____data_amounts_0 = data.amounts
        ____data_amounts_0[#____data_amounts_0 + 1] = {time, counts[finalMax] or 0}
    end
    __TS__Delete(data, "itemCounts")
end
function BufferAmounts.prototype.exportData(self)
    local buffers = {}
    for unitNumber, entity in pairs(self.trackedEntities) do
        do
            local data = self:getEntityData(entity, unitNumber)
            local amounts = data and data.amounts
            if not amounts or not amounts[1] then
                goto __continue22
            end
            local remove = table.remove
            while amounts[#amounts][2] == 0 do
                remove(amounts)
            end
            if not amounts[1] then
                goto __continue22
            end
            buffers[#buffers + 1] = {
                name = data.name,
                unitNumber = data.unitNumber,
                location = data.location,
                timeBuilt = data.timeBuilt,
                item = data.item,
                amounts = amounts
            }
        end
        ::__continue22::
    end
    return {period = self.nth_tick_period, buffers = buffers}
end
return ____exports
 end,
["dataCollectors.rocket-launch-time"] = function(...) 
local ____lualib = require("lualib_bundle")
local __TS__Class = ____lualib.__TS__Class
local ____exports = {}
____exports.default = __TS__Class()
local RocketLaunchTime = ____exports.default
RocketLaunchTime.name = "RocketLaunchTime"
function RocketLaunchTime.prototype.____constructor(self)
    self.launchTimes = {}
end
function RocketLaunchTime.prototype.on_rocket_launched(self, event)
    local ____self_launchTimes_0 = self.launchTimes
    ____self_launchTimes_0[#____self_launchTimes_0 + 1] = event.tick
end
function RocketLaunchTime.prototype.exportData(self)
    return {rocketLaunchTimes = self.launchTimes}
end
return ____exports
 end,
["dataCollectors.player-inventory"] = function(...) 
local ____lualib = require("lualib_bundle")
local __TS__Class = ____lualib.__TS__Class
local ____exports = {}
____exports.default = __TS__Class()
local PlayerInventory = ____exports.default
PlayerInventory.name = "PlayerInventory"
function PlayerInventory.prototype.____constructor(self, nth_tick_period)
    if nth_tick_period == nil then
        nth_tick_period = 360
    end
    self.nth_tick_period = nth_tick_period
    self.players = {}
end
function PlayerInventory.prototype.on_nth_tick(self, event)
    for ____, player in pairs(game.players) do
        local name = player.name
        if not self.players[name] then
            self.players[name] = {}
            do
                local i = 0
                while i < event.tick do
                    local ____self_players_name_0 = self.players[name]
                    ____self_players_name_0[#____self_players_name_0 + 1] = {}
                    i = i + self.nth_tick_period
                end
            end
        end
        local ____opt_1 = player.get_main_inventory()
        local contents = ____opt_1 and ____opt_1.get_contents() or ({})
        local ____self_players_name_3 = self.players[name]
        ____self_players_name_3[#____self_players_name_3 + 1] = contents
    end
end
function PlayerInventory.prototype.exportData(self)
    return {period = self.nth_tick_period, players = self.players}
end
return ____exports
 end,
["dataCollectors.research-timing"] = function(...) 
local ____lualib = require("lualib_bundle")
local __TS__Class = ____lualib.__TS__Class
local ____exports = {}
____exports.default = __TS__Class()
local ResearchTiming = ____exports.default
ResearchTiming.name = "ResearchTiming"
function ResearchTiming.prototype.____constructor(self)
    self.data = {timeFirstStarted = {}, timeCompleted = {}, events = {}}
end
function ResearchTiming.prototype.on_research_started(self, event)
    local research = event.research.name
    local time = event.tick
    local ____self_data_timeFirstStarted_0, ____research_1 = self.data.timeFirstStarted, research
    if ____self_data_timeFirstStarted_0[____research_1] == nil then
        ____self_data_timeFirstStarted_0[____research_1] = time
    end
    local ____self_data_events_2 = self.data.events
    ____self_data_events_2[#____self_data_events_2 + 1] = {time = time, research = research, type = "started"}
end
function ResearchTiming.prototype.on_research_cancelled(self, event)
    local time = event.tick
    for research in pairs(event.research) do
        local ____self_data_events_3 = self.data.events
        ____self_data_events_3[#____self_data_events_3 + 1] = {time = time, research = research, type = "cancelled"}
    end
end
function ResearchTiming.prototype.on_research_finished(self, event)
    local research = event.research.name
    local time = event.tick
    local ____self_data_timeCompleted_4, ____research_5 = self.data.timeCompleted, research
    if ____self_data_timeCompleted_4[____research_5] == nil then
        ____self_data_timeCompleted_4[____research_5] = time
    end
    local ____self_data_events_6 = self.data.events
    ____self_data_events_6[#____self_data_events_6 + 1] = {time = time, research = research, type = "completed"}
end
function ResearchTiming.prototype.exportData(self)
    return self.data
end
return ____exports
 end,
["control"] = function(...) 
local ____lualib = require("lualib_bundle")
local __TS__New = ____lualib.__TS__New
local ____exports = {}
local ____event_handler = require("event_handler")
local add_lib = ____event_handler.add_lib
local ____player_2Dposition = require("dataCollectors.player-position")
local PlayerPosition = ____player_2Dposition.default
local ____machine_2Dproduction = require("dataCollectors.machine-production")
local MachineProduction = ____machine_2Dproduction.default
local ____data_2Dcollector = require("data-collector")
local addDataCollector = ____data_2Dcollector.addDataCollector
local exportAllData = ____data_2Dcollector.exportAllData
local ____buffer_2Damounts = require("dataCollectors.buffer-amounts")
local BufferAmounts = ____buffer_2Damounts.default
local ____rocket_2Dlaunch_2Dtime = require("dataCollectors.rocket-launch-time")
local RocketLaunchTime = ____rocket_2Dlaunch_2Dtime.default
local ____player_2Dinventory = require("dataCollectors.player-inventory")
local PlayerInventory = ____player_2Dinventory.default
local ____research_2Dtiming = require("dataCollectors.research-timing")
local ResearchTiming = ____research_2Dtiming.default
local exportOnSiloLaunch = true
addDataCollector(
    nil,
    __TS__New(PlayerPosition)
)
addDataCollector(
    nil,
    __TS__New(PlayerInventory)
)
addDataCollector(
    nil,
    __TS__New(MachineProduction, {
        "assembling-machine-1",
        "assembling-machine-2",
        "assembling-machine-3",
        "chemical-plant",
        "oil-refinery",
        "stone-furnace",
        "steel-furnace"
    })
)
addDataCollector(
    nil,
    __TS__New(BufferAmounts)
)
addDataCollector(
    nil,
    __TS__New(ResearchTiming)
)
addDataCollector(
    nil,
    __TS__New(RocketLaunchTime)
)
if exportOnSiloLaunch then
    add_lib({events = {[defines.events.on_rocket_launched] = function() return exportAllData(nil) end}})
end
commands.add_command(
    "export-replay-data",
    "Export current collected replay data",
    function()
        exportAllData(nil)
        game.print("Exported data to script-output/replay-data/*.json")
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
