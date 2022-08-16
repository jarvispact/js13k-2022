export type Component<Type extends string = string, Data = unknown> = {
    type: Type;
    data: Data;
};

export const createComponent = <Type extends string, Data = undefined>(type: Type, data?: Data) => ({
    type,
    data: data as Data,
});
