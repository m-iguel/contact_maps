/**
 * Copyright (c) 2018-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { Texture } from '../../../mol-gl/webgl/texture';
import { Box3D, Sphere3D } from '../../../mol-math/geometry';
import { Mat4, Vec3, Vec4 } from '../../../mol-math/linear-algebra';
import { ValueCell } from '../../../mol-util';
import { ParamDefinition as PD } from '../../../mol-util/param-definition';
import { GeometryUtils } from '../geometry';
import { Grid } from '../../../mol-model/volume';
export interface DirectVolume {
    readonly kind: 'direct-volume';
    readonly gridTexture: ValueCell<Texture>;
    readonly gridTextureDim: ValueCell<Vec3>;
    readonly gridDimension: ValueCell<Vec3>;
    readonly gridStats: ValueCell<Vec4>;
    readonly bboxSize: ValueCell<Vec3>;
    readonly bboxMin: ValueCell<Vec3>;
    readonly bboxMax: ValueCell<Vec3>;
    readonly transform: ValueCell<Mat4>;
    readonly cellDim: ValueCell<Vec3>;
    readonly unitToCartn: ValueCell<Mat4>;
    readonly cartnToUnit: ValueCell<Mat4>;
    readonly packedGroup: ValueCell<boolean>;
    readonly axisOrder: ValueCell<Vec3>;
    /** Bounding sphere of the volume */
    readonly boundingSphere: Sphere3D;
    setBoundingSphere(boundingSphere: Sphere3D): void;
}
export declare namespace DirectVolume {
    function create(bbox: Box3D, gridDimension: Vec3, transform: Mat4, unitToCartn: Mat4, cellDim: Vec3, texture: Texture, stats: Grid['stats'], packedGroup: boolean, axisOrder: Vec3, directVolume?: DirectVolume): DirectVolume;
    function createEmpty(directVolume?: DirectVolume): DirectVolume;
    const Params: {
        ignoreLight: PD.BooleanParam;
        xrayShaded: PD.Select<boolean | "inverted">;
        controlPoints: PD.LineGraph;
        stepsPerCell: PD.Numeric;
        jumpLength: PD.Numeric;
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
    const Utils: GeometryUtils<DirectVolume, Params>;
}
