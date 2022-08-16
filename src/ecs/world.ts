import { Entity } from './entity';
import { StartupSystem, System } from './system';

type QueryPredicate = (entity: Entity) => boolean;

export const has =
    (componentType: string): QueryPredicate =>
    (entity: Entity) =>
        entity.componentTypes.includes(componentType);

export const hasNot =
    (componentType: string): QueryPredicate =>
    (entity: Entity) =>
        !entity.componentTypes.includes(componentType);

export const and =
    (queries: QueryPredicate[]): QueryPredicate =>
    (entity: Entity) =>
        queries.every((predicate) => predicate(entity));

export const or =
    (queries: QueryPredicate[]): QueryPredicate =>
    (entity: Entity) =>
        queries.some((predicate) => predicate(entity));

class Query {
    predicate: (entity: Entity) => boolean;
    entities: Entity[] = [];

    constructor(predicate: (entity: Entity) => boolean) {
        this.predicate = predicate;
    }

    addEntity(entity: Entity) {
        this.entities.push(entity);
    }

    removeEntity(entity: Entity) {
        this.entities = this.entities.filter((e) => e !== entity);
    }
}

const createGetDelta =
    (then = 0) =>
    (now: number): number => {
        now *= 0.001;
        const delta = now - then;
        then = now;
        return delta;
    };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class World<State = any> {
    public state!: State;

    private getDelta = createGetDelta();
    private queries: Query[] = [];
    private entities: Record<string, Entity | undefined> = {};
    private systems: System[] = [];
    private startupSystems: StartupSystem[] = [];

    constructor(state?: State) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this.state = state as any;
    }

    createQuery(predicate: QueryPredicate) {
        const query = new Query(predicate);
        this.queries.push(query);
        return query;
    }

    addEntity(entity: Entity) {
        this.entities[entity.name] = entity;

        for (let i = 0; i < this.queries.length; i++) {
            const query = this.queries[i];
            if (query.predicate(entity)) {
                query.addEntity(entity);
            }
        }

        return this;
    }

    removeEntity(entity: Entity) {
        this.entities[entity.name] = undefined;

        for (let i = 0; i < this.queries.length; i++) {
            const query = this.queries[i];
            if (query.predicate(entity)) {
                query.removeEntity(entity);
            }
        }

        return this;
    }

    addSystem(system: System) {
        this.systems.push(system);
        return this;
    }

    addStartupSystem(startupSystem: StartupSystem) {
        this.startupSystems.push(startupSystem);
        return this;
    }

    run() {
        for (let s = 0; s < this.startupSystems.length; s++) {
            this.startupSystems[s](this);
        }

        const tick = (time: number) => {
            const delta = this.getDelta(time);

            for (let s = 0; s < this.systems.length; s++) {
                this.systems[s](delta, time);
            }

            window.requestAnimationFrame(tick);
        };

        window.requestAnimationFrame(tick);
        return this;
    }
}
