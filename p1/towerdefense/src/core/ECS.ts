export type ComponentType = string;

export interface Component {
  type: ComponentType;
}

export class Entity {
  public id: number;
  private components: Map<ComponentType, Component>;

  constructor(id: number) {
    this.id = id;
    this.components = new Map();
  }

  addComponent(component: Component): void {
    this.components.set(component.type, component);
  }

  removeComponent(type: ComponentType): void {
    this.components.delete(type);
  }

  getComponent<T extends Component>(type: ComponentType): T | undefined {
    return this.components.get(type) as T | undefined;
  }

  hasComponent(type: ComponentType): boolean {
    return this.components.has(type);
  }

  hasComponents(types: ComponentType[]): boolean {
    return types.every(type => this.components.has(type));
  }
}

export abstract class System {
  protected requiredComponents: ComponentType[];
  protected active: boolean = true;

  constructor(requiredComponents: ComponentType[]) {
    this.requiredComponents = requiredComponents;
  }

  isActive(): boolean {
    return this.active;
  }

  setActive(active: boolean): void {
    this.active = active;
  }

  getRequiredComponents(): ComponentType[] {
    return this.requiredComponents;
  }

  abstract update(entities: Entity[], deltaTime: number): void;
}

export class EntityManager {
  private entities: Map<number, Entity>;
  private nextId: number;

  constructor() {
    this.entities = new Map();
    this.nextId = 1;
  }

  createEntity(): Entity {
    const entity = new Entity(this.nextId++);
    this.entities.set(entity.id, entity);
    return entity;
  }

  removeEntity(id: number): void {
    this.entities.delete(id);
  }

  getEntity(id: number): Entity | undefined {
    return this.entities.get(id);
  }

  getAllEntities(): Entity[] {
    return Array.from(this.entities.values());
  }

  getEntitiesWithComponents(types: ComponentType[]): Entity[] {
    return this.getAllEntities().filter(entity => entity.hasComponents(types));
  }
}

export class SystemManager {
  private systems: System[];

  constructor() {
    this.systems = [];
  }

  addSystem(system: System): void {
    this.systems.push(system);
  }

  removeSystem(system: System): void {
    const index = this.systems.indexOf(system);
    if (index !== -1) {
      this.systems.splice(index, 1);
    }
  }

  updateAll(entityManager: EntityManager, deltaTime: number): void {
    for (const system of this.systems) {
      if (system.isActive()) {
        const entities = entityManager.getEntitiesWithComponents(system.getRequiredComponents());
        system.update(entities, deltaTime);
      }
    }
  }

  getSystems(): System[] {
    return this.systems;
  }
}

export class ECS {
  public entityManager: EntityManager;
  public systemManager: SystemManager;

  constructor() {
    this.entityManager = new EntityManager();
    this.systemManager = new SystemManager();
  }

  update(deltaTime: number): void {
    this.systemManager.updateAll(this.entityManager, deltaTime);
  }
}
