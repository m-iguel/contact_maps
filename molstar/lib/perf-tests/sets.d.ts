export declare namespace Union {
    function run(): void;
    function runR(): void;
}
export declare namespace Tuples {
    function run(): void;
}
export declare function testSegments(): void;
export declare namespace ObjectVsMap {
    function run(): void;
}
export declare namespace IntVsStringIndices {
    type WithKeys<K> = {
        keys: K[];
        data: {
            [key: number]: number;
        };
    };
    type MapWithKeys = {
        keys: number[];
        map: Map<number, number>;
    };
    export function createInt(n: number): any;
    export function createStr(n: number): any;
    export function createMap(n: number): Map<number, number>;
    export function sumInt(xs: {
        [key: number]: number;
    }): number;
    export function sumStr(xs: {
        [key: string]: number;
    }): number;
    export function sumMap(map: Map<number, number>): number;
    export function sumCached(xs: WithKeys<number>): number;
    export function sumKeyMap(xs: MapWithKeys): number;
    export function run(): void;
    export {};
}
