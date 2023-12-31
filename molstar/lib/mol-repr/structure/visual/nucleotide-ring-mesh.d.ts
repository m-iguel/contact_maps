/**
 * Copyright (c) 2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { ParamDefinition as PD } from '../../../mol-util/param-definition';
import { UnitsVisual } from '../units-visual';
export declare const NucleotideRingMeshParams: {
    sizeFactor: PD.Numeric;
    radialSegments: PD.Numeric;
    detail: PD.Numeric;
};
export declare const DefaultNucleotideRingMeshProps: PD.Values<{
    sizeFactor: PD.Numeric;
    radialSegments: PD.Numeric;
    detail: PD.Numeric;
}>;
export type NucleotideRingProps = typeof DefaultNucleotideRingMeshProps;
export declare const NucleotideRingParams: {
    sizeFactor: PD.Numeric;
    radialSegments: PD.Numeric;
    detail: PD.Numeric;
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
export type NucleotideRingParams = typeof NucleotideRingParams;
export declare function NucleotideRingVisual(materialId: number): UnitsVisual<NucleotideRingParams>;
