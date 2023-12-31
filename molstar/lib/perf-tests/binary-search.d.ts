declare function createData(n: number): number[];
declare function binarySearchHelper(list: ArrayLike<number>, t: number): number;
declare function objSearch(obj: any, val: number): boolean;
declare function setSearch(set: Set<number>, val: number): boolean;
type Mask = {
    min: number;
    max: number;
    mask: ArrayLike<number>;
};
declare function maskSearch({ min, max, mask }: Mask, val: number): boolean;
declare function prepare(list: ArrayLike<number>): {
    list: ArrayLike<number>;
    obj: any;
    set: Set<number>;
};
declare function prepareSet(list: ArrayLike<number>): Set<number>;
declare function prepareObj(list: ArrayLike<number>): any;
declare function prepareMask(list: ArrayLike<number>): Mask;
declare function testBinary(list: ArrayLike<number>, points: ArrayLike<number>): number;
declare function testObj(obj: any, points: ArrayLike<number>): number;
declare function testSet(set: Set<number>, points: ArrayLike<number>): number;
declare function testMask(mask: Mask, points: ArrayLike<number>): number;
declare function run(f: () => number, n: number): void;
