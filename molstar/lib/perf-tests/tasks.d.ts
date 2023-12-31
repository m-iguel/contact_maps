export declare namespace Tasks {
    class Yielding {
        lastUpdated: number;
        yield(): Promise<void> | void;
    }
    class CheckYielding {
        lastUpdated: number;
        get needsYield(): boolean;
        yield(): Promise<void>;
    }
    function yielding(): Promise<number>;
    function yielding1(): Promise<number>;
    function testYielding(): Promise<number>;
    function baseline(): Promise<number>;
    function testImmediate(): Promise<number>;
    function run(): void;
    function awaitF(): Promise<void>;
}
