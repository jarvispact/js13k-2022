export const findIndexFast = (list: unknown[], prop: unknown, listItemProp?: unknown) => {
    let index = -1;

    for (let i = 0; i < list.length; i++) {
        if (listItemProp) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            if (list[i][listItemProp] === prop) {
                index = i;
                break;
            }
        } else {
            if (list[i] === prop) {
                index = i;
                break;
            }
        }
    }

    return index;
};

export const arraySwapDelete = (arr: unknown[], idx: number) => {
    arr[idx] = arr[arr.length - 1];
    arr.pop();
};
