/**
 * Copyright (c) 2020-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author Gianluca Tomasello <giagitom@gmail.com>
 */
import { Cylinders } from './cylinders';
import { Vec3 } from '../../../mol-math/linear-algebra';
export interface CylindersBuilder {
    add(startX: number, startY: number, startZ: number, endX: number, endY: number, endZ: number, radiusScale: number, topCap: boolean, bottomCap: boolean, group: number): void;
    addFixedCountDashes(start: Vec3, end: Vec3, segmentCount: number, radiusScale: number, topCap: boolean, bottomCap: boolean, stubCap: boolean, group: number): void;
    addFixedLengthDashes(start: Vec3, end: Vec3, segmentLength: number, radiusScale: number, topCap: boolean, bottomCap: boolean, group: number): void;
    getCylinders(): Cylinders;
}
export declare namespace CylindersBuilder {
    function create(initialCount?: number, chunkSize?: number, cylinders?: Cylinders): CylindersBuilder;
}
