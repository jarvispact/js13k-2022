import { Component } from './component';

type Take<T extends { type: string; data: unknown }, K extends string> = T['type'] extends K ? T : never;

type ObjectFromArray<T extends { type: string; data: unknown }[]> = {
    [K in T[number] as K['type']]: K extends { type: K['type'] } ? Take<K, K['type']> : never;
};

const indexByType = (accum: Record<string, Component | undefined>, component: Component) => {
    accum[component.type] = component;
    return accum;
};

export type Entity<Name extends string = string, Components extends Component[] = Component[]> = {
    name: Name;
    componentTypes: string[];
    getComponent: <Type extends Components[number]['type']>(type: Type) => ObjectFromArray<Components>[Type];
};

export const createEntity = <Name extends string, Components extends Component[]>(
    name: Name,
    _components: Components,
): Entity<Name, Components> => {
    const components = _components.reduce(indexByType, {}) as ObjectFromArray<Components>;
    return {
        name,
        componentTypes: Object.keys(components),
        getComponent: <Type extends Components[number]['type']>(type: Type) => components[type],
    };
};
