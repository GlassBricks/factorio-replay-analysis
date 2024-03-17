import {
  EntityPrototypeFilterWrite,
  LuaEntity,
  OnBuiltEntityEvent,
  OnEntityDiedEvent,
  OnPrePlayerMinedItemEvent,
  OnRobotBuiltEntityEvent,
  OnRobotPreMinedEvent,
  UnitNumber,
} from "factorio:runtime"

export default abstract class EntityTracker<T> {
  protected prototypes = new LuaSet<string>()

  private prototypeFilters?: EntityPrototypeFilterWrite[]

  protected constructor(...prototypeFilters: EntityPrototypeFilterWrite[]) {
    this.prototypeFilters = prototypeFilters
  }

  on_init() {
    for (const [name] of game.get_filtered_entity_prototypes(this.prototypeFilters!)) {
      this.prototypes.add(name)
    }
    delete this.prototypeFilters
  }

  trackedEntities: Record<UnitNumber, LuaEntity> = {}
  entityData: { [unitNumber: number]: T } = {}

  protected onCreated(entity: LuaEntity, event: OnBuiltEntityEvent | OnRobotBuiltEntityEvent) {
    const unitNumber = entity.unit_number
    if (unitNumber && this.prototypes.has(entity.name)) {
      const data = this.initialData(entity, event)
      if (data) {
        this.trackedEntities[unitNumber] = entity
        this.entityData[unitNumber] = data
      }
    }
  }

  protected abstract initialData(entity: LuaEntity, event: OnBuiltEntityEvent | OnRobotBuiltEntityEvent): T | undefined

  on_built_entity(event: OnBuiltEntityEvent) {
    this.onCreated(event.created_entity, event)
  }

  on_robot_built_entity(event: OnRobotBuiltEntityEvent) {
    this.onCreated(event.created_entity, event)
  }

  protected onDeleted(entity: LuaEntity, event: OnPrePlayerMinedItemEvent | OnRobotPreMinedEvent | OnEntityDiedEvent) {
    const unitNumber = entity.unit_number
    if (unitNumber) {
      this.removeEntry(unitNumber)
    }
  }

  protected removeEntry(unitNumber: UnitNumber) {
    delete this.trackedEntities[unitNumber]
  }

  on_pre_player_mined_item(event: OnPrePlayerMinedItemEvent) {
    this.onDeleted(event.entity, event)
  }

  on_robot_pre_mined(event: OnRobotPreMinedEvent) {
    this.onDeleted(event.entity, event)
  }

  on_entity_died(event: OnEntityDiedEvent) {
    this.onDeleted(event.entity, event)
  }

  protected getEntityData(entity: LuaEntity, unitNumber?: UnitNumber): T | undefined {
    if (!entity.valid) {
      if (unitNumber) {
        delete this.trackedEntities[unitNumber]
      }
      return undefined
    }
    unitNumber ??= entity.unit_number
    if (unitNumber) {
      return this.entityData[unitNumber]
    }
    return undefined
  }

  protected abstract onPeriodicUpdate(entity: LuaEntity, data: T): void

  on_nth_tick() {
    for (const [unitNumber, entity] of pairs(this.trackedEntities)) {
      const data = this.getEntityData(entity, unitNumber)
      if (data) this.onPeriodicUpdate(entity, data)
    }
  }
}
