/**
 * Copyright (c) 2018-2021 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { ParamDefinition as PD } from '../../../mol-util/param-definition';
import { ComplexVisual } from '../complex-visual';
import { UnitsVisual } from '../units-visual';
export declare const GaussianDensityVolumeParams: {
    ignoreHydrogens: PD.BooleanParam;
    ignoreHydrogensVariant: PD.Select<"all" | "non-polar">;
    includeParent: PD.BooleanParam;
    traceOnly: PD.BooleanParam;
    resolution: PD.Numeric;
    radiusOffset: PD.Numeric;
    smoothness: PD.Numeric;
    unitKinds: PD.MultiSelect<"spheres" | "gaussians" | "atomic">;
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
export type GaussianDensityVolumeParams = typeof GaussianDensityVolumeParams;
export declare function GaussianDensityVolumeVisual(materialId: number): ComplexVisual<GaussianDensityVolumeParams>;
export declare const UnitsGaussianDensityVolumeParams: {
    ignoreHydrogens: PD.BooleanParam;
    ignoreHydrogensVariant: PD.Select<"all" | "non-polar">;
    includeParent: PD.BooleanParam;
    traceOnly: PD.BooleanParam;
    resolution: PD.Numeric;
    radiusOffset: PD.Numeric;
    smoothness: PD.Numeric;
    unitKinds: PD.MultiSelect<"spheres" | "gaussians" | "atomic">;
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
export type UnitsGaussianDensityVolumeParams = typeof UnitsGaussianDensityVolumeParams;
export declare function UnitsGaussianDensityVolumeVisual(materialId: number): UnitsVisual<UnitsGaussianDensityVolumeParams>;
