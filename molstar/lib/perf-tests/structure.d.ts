/**
 * Copyright (c) 2017 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { Structure } from '../mol-model/structure';
export declare function readCIF(path: string): Promise<{
    mmcif: unknown;
    models: import("../mol-model/structure").Trajectory;
    structures: Structure[];
}>;
export declare function getBcif(pdbId: string): Promise<{
    mmcif: unknown;
    models: import("../mol-model/structure").Trajectory;
    structures: Structure[];
}>;
export declare namespace PropertyAccess {
    function write(s: Structure): void;
    function testAssembly(id: string, s: Structure): Promise<void>;
    function testSymmetry(id: string, s: Structure): Promise<void>;
    function testIncludeSurroundings(id: string, s: Structure): Promise<void>;
    function runBonds(): Promise<void>;
    function run(): Promise<void>;
}
