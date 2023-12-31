/**
 * Copyright (c) 2019-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { ValueCell } from '../../../mol-util';
import { GeometryUtils } from '../geometry';
import { ParamDefinition as PD } from '../../../mol-util/param-definition';
import { Sphere3D } from '../../../mol-math/geometry';
import { GroupMapping } from '../../util';
export interface Spheres {
    readonly kind: 'spheres';
    /** Number of spheres */
    sphereCount: number;
    /** Center buffer as array of xyz values wrapped in a value cell */
    readonly centerBuffer: ValueCell<Float32Array>;
    /** Mapping buffer as array of xy values wrapped in a value cell */
    readonly mappingBuffer: ValueCell<Float32Array>;
    /** Index buffer as array of center index triplets wrapped in a value cell */
    readonly indexBuffer: ValueCell<Uint32Array>;
    /** Group buffer as array of group ids for each vertex wrapped in a value cell */
    readonly groupBuffer: ValueCell<Float32Array>;
    /** Bounding sphere of the spheres */
    readonly boundingSphere: Sphere3D;
    /** Maps group ids to sphere indices */
    readonly groupMapping: GroupMapping;
    setBoundingSphere(boundingSphere: Sphere3D): void;
}
export declare namespace Spheres {
    function create(centers: Float32Array, mappings: Float32Array, indices: Uint32Array, groups: Float32Array, sphereCount: number, spheres?: Spheres): Spheres;
    function createEmpty(spheres?: Spheres): Spheres;
    const Params: {
        sizeFactor: PD.Numeric;
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
    const Utils: GeometryUtils<Spheres, Params>;
}
