/**
 * Copyright (c) 2019-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { ParamDefinition as PD } from '../../../mol-util/param-definition';
import { UnitsVisual } from '../units-visual';
export declare const PolymerTubeMeshParams: {
    sizeFactor: PD.Numeric;
    detail: PD.Numeric;
    linearSegments: PD.Numeric;
    radialSegments: PD.Numeric;
};
export declare const DefaultPolymerTubeMeshProps: PD.Values<{
    sizeFactor: PD.Numeric;
    detail: PD.Numeric;
    linearSegments: PD.Numeric;
    radialSegments: PD.Numeric;
}>;
export type PolymerTubeMeshProps = typeof DefaultPolymerTubeMeshProps;
export declare const PolymerTubeParams: {
    sizeFactor: PD.Numeric;
    detail: PD.Numeric;
    linearSegments: PD.Numeric;
    radialSegments: PD.Numeric;
    unitKinds: PD.MultiSelect<"spheres" | "gaussians" | "atomic">;
    includeParent: PD.BooleanParam;
    doubleSided: PD.BooleanParam;
    flipSided: PD.BooleanParam;
    flatShaded: PD.BooleanParam;
    ignoreLight: PD.BooleanParam;
    xrayShaded: PD.Select<boolean | "inverted">;
    transparentBackfaces: PD.Select<string>;
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
export type PolymerTubeParams = typeof PolymerTubeParams;
export declare function PolymerTubeVisual(materialId: number): UnitsVisual<PolymerTubeParams>;
