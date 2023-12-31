/**
 * Copyright (c) 2018-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { ValueCell } from '../../../mol-util';
import { Mat4 } from '../../../mol-math/linear-algebra';
import { GroupMapping } from '../../util';
import { GeometryUtils } from '../geometry';
import { ParamDefinition as PD } from '../../../mol-util/param-definition';
import { Sphere3D } from '../../../mol-math/geometry';
/** Point cloud */
export interface Points {
    readonly kind: 'points';
    /** Number of vertices in the point cloud */
    pointCount: number;
    /** Center buffer as array of xyz values wrapped in a value cell */
    readonly centerBuffer: ValueCell<Float32Array>;
    /** Group buffer as array of group ids for each vertex wrapped in a value cell */
    readonly groupBuffer: ValueCell<Float32Array>;
    /** Bounding sphere of the points */
    readonly boundingSphere: Sphere3D;
    /** Maps group ids to point indices */
    readonly groupMapping: GroupMapping;
    setBoundingSphere(boundingSphere: Sphere3D): void;
}
export declare namespace Points {
    function create(centers: Float32Array, groups: Float32Array, pointCount: number, points?: Points): Points;
    function createEmpty(points?: Points): Points;
    function transform(points: Points, t: Mat4): void;
    const StyleTypes: {
        square: string;
        circle: string;
        fuzzy: string;
    };
    type StyleTypes = keyof typeof StyleTypes;
    const StyleTypeNames: ("circle" | "square" | "fuzzy")[];
    const Params: {
        sizeFactor: PD.Numeric;
        pointSizeAttenuation: PD.BooleanParam;
        pointStyle: PD.Select<"circle" | "square" | "fuzzy">;
        alpha: PD.Numeric;
        quality: PD.Select<"auto" | "medium" | "high" | "low" | "custom" | "highest" | "higher" | "lower" | "lowest">;
        material: PD.Group<PD.Normalize<{
            metalness: number; /** Number of vertices in the point cloud */
            roughness: number;
            bumpiness: number;
        }>>;
        clip: PD.Group<PD.Normalize<{
            variant: import("../../../mol-util/clip").Clip.Variant;
            objects: PD.Normalize<{
                type: any;
                invert: any;
                position: any;
                rotation: any;
                scale: any;
            }>[];
        }>>;
        instanceGranularity: PD.BooleanParam;
    };
    type Params = typeof Params;
    const Utils: GeometryUtils<Points, Params>;
}
