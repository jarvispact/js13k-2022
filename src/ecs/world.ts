/* eslint-disable @typescript-eslint/no-explicit-any */

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

class Query<E extends Entity> {
    predicate: (entity: Entity) => boolean;
    entities: E[] = [];

    constructor(predicate: (entity: Entity) => boolean) {
        this.predicate = predicate;
    }

    addEntity(entity: Entity) {
        this.entities.push(entity as E);
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

type StateChangeSubscriber<State = any, Action = any> = (args: {
    previousState: State;
    newState: State;
    action: Action;
}) => boolean | void | Promise<boolean | void>;

type EventSubsriber<Event = any> = (event: Event) => void;

type WorldArgs<State = any, Action = any> = {
    initialState?: State;
    stateReducer?: (state: State, action: Action) => State;
};

export class World<State = any, Action = any, Event = any> {
    private state: State;
    private stateReducer: (state: State, action: Action) => State;
    private stateChangeSubscribers: StateChangeSubscriber<State, Action>[] = [];

    private eventSubsribers: EventSubsriber<Event>[] = [];

    private getDelta = createGetDelta();
    private queries: Query<Entity>[] = [];
    private entities: Record<string, Entity | undefined> = {};
    private systems: System[] = [];
    private startupSystems: StartupSystem[] = [];

    constructor({ initialState, stateReducer }: WorldArgs<State, Action> = {}) {
        this.state = initialState as any;
        this.stateReducer = stateReducer as any;
    }

    onStateChange(subscriber: StateChangeSubscriber<State, Action>) {
        this.stateChangeSubscribers.push(subscriber);
    }

    dispatch(action: Action) {
        let shouldUpdate = true;
        const newState = this.stateReducer(this.state, action);

        for (let i = 0; i < this.stateChangeSubscribers.length; i++) {
            const subscriber = this.stateChangeSubscribers[i];
            const preventUpdate = subscriber({ previousState: this.state, newState, action });
            if (preventUpdate === false) {
                shouldUpdate = false;
            }
        }

        if (shouldUpdate) {
            this.state = newState;
        }

        return this;
    }

    getState() {
        return this.state;
    }

    onEvent(subscriber: EventSubsriber<Event>) {
        this.eventSubsribers.push(subscriber);
    }

    dispatchEvent(event: Event) {
        for (let i = 0; i < this.eventSubsribers.length; i++) {
            const subscriber = this.eventSubsribers[i];
            subscriber(event);
        }
    }

    createQuery<E extends Entity>(predicate: QueryPredicate) {
        const query = new Query<E>(predicate);
        this.queries.push(query);
        return query;
    }

    spawnEntity(entity: Entity) {
        this.entities[entity.name] = entity;

        for (let i = 0; i < this.queries.length; i++) {
            const query = this.queries[i];
            if (query.predicate(entity)) {
                query.addEntity(entity);
            }
        }

        return this;
    }

    despawnEntity(entity: Entity) {
        this.entities[entity.name] = undefined;

        for (let i = 0; i < this.queries.length; i++) {
            const query = this.queries[i];
            if (query.predicate(entity)) {
                query.removeEntity(entity);
            }
        }

        return this;
    }

    getEntity<E extends Entity>(name: E['name']) {
        return this.entities[name] as E;
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
