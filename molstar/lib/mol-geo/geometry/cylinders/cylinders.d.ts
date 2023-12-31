/**
 * Copyright (c) 2020-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { ValueCell } from '../../../mol-util';
import { Mat4 } from '../../../mol-math/linear-algebra';
import { GroupMapping } from '../../util';
import { GeometryUtils } from '../geometry';
import { ParamDefinition as PD } from '../../../mol-util/param-definition';
import { Sphere3D } from '../../../mol-math/geometry';
export interface Cylinders {
    readonly kind: 'cylinders';
    /** Number of cylinders */
    cylinderCount: number;
    /** Mapping buffer as array of uvw values wrapped in a value cell */
    readonly mappingBuffer: ValueCell<Float32Array>;
    /** Index buffer as array of vertex index triplets wrapped in a value cell */
    readonly indexBuffer: ValueCell<Uint32Array>;
    /** Group buffer as array of group ids for each vertex wrapped in a value cell */
    readonly groupBuffer: ValueCell<Float32Array>;
    /** Cylinder start buffer as array of xyz values wrapped in a value cell */
    readonly startBuffer: ValueCell<Float32Array>;
    /** Cylinder end buffer as array of xyz values wrapped in a value cell */
    readonly endBuffer: ValueCell<Float32Array>;
    /** Cylinder scale buffer as array of scaling factors wrapped in a value cell */
    readonly scaleBuffer: ValueCell<Float32Array>;
    /** Cylinder cap buffer as array of cap flags wrapped in a value cell */
    readonly capBuffer: ValueCell<Float32Array>;
    /** Bounding sphere of the cylinders */
    readonly boundingSphere: Sphere3D;
    /** Maps group ids to cylinder indices */
    readonly groupMapping: GroupMapping;
    setBoundingSphere(boundingSphere: Sphere3D): void;
}
export declare namespace Cylinders {
    function create(mappings: Float32Array, indices: Uint32Array, groups: Float32Array, starts: Float32Array, ends: Float32Array, scales: Float32Array, caps: Float32Array, cylinderCount: number, cylinders?: Cylinders): Cylinders;
    function createEmpty(cylinders?: Cylinders): Cylinders;
    function transform(cylinders: Cylinders, t: Mat4): void;
    const Params: {
        sizeFactor: PD.Numeric;
        sizeAspectRatio: PD.Numeric;
        doubleSided: PD.BooleanParam;
        ignoreLight: PD.BooleanParam;
        xrayShaded: PD.Select<boolean | "inverted">;
        transparentBackfaces: PD.Select<string>;
        solidInterior: PD.BooleanParam;
        bumpFrequency: PD.Numeric;
        bumpAmplitude: PD.Numeric;
        alpha: PD.Numeric;
        quality: PD.Select<"auto" | "medium" | "high" | "low" | "custom" | "highest" | "higher" | "lower" | "lowest">;
        material: PD.Group<PD.Normalize<{
            metalness: number;
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
    const Utils: GeometryUtils<Cylinders, Params>;
}
