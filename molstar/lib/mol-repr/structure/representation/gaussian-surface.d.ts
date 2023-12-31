/**
 * Copyright (c) 2018-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { ParamDefinition as PD } from '../../../mol-util/param-definition';
import { StructureRepresentation, StructureRepresentationProvider } from '../representation';
import { RepresentationParamsGetter, RepresentationContext } from '../../../mol-repr/representation';
import { ThemeRegistryContext } from '../../../mol-theme/theme';
import { Structure } from '../../../mol-model/structure';
export declare const GaussianSurfaceParams: {
    visuals: PD.MultiSelect<"gaussian-surface-mesh" | "structure-gaussian-surface-mesh" | "gaussian-surface-wireframe">;
    bumpFrequency: PD.Numeric;
    sizeFactor: PD.Numeric;
    lineSizeAttenuation: PD.BooleanParam;
    ignoreHydrogens: PD.BooleanParam;
    ignoreHydrogensVariant: PD.Select<"all" | "non-polar">;
    includeParent: PD.BooleanParam;
    traceOnly: PD.BooleanParam;
    resolution: PD.Numeric;
    radiusOffset: PD.Numeric;
    smoothness: PD.Numeric;
    unitKinds: PD.MultiSelect<"spheres" | "gaussians" | "atomic">;
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
    tryUseGpu: PD.BooleanParam;
    smoothColors: PD.Mapped<PD.NamedParams<PD.Normalize<unknown>, "auto"> | PD.NamedParams<PD.Normalize<{
        resolutionFactor: number;
        sampleStride: number;
    }>, "on"> | PD.NamedParams<PD.Normalize<unknown>, "off">>;
    doubleSided: PD.BooleanParam;
    flipSided: PD.BooleanParam;
    flatShaded: PD.BooleanParam;
    ignoreLight: PD.BooleanParam;
    xrayShaded: PD.Select<boolean | "inverted">;
    transparentBackfaces: PD.Select<string>;
    bumpAmplitude: PD.Numeric;
};
export type GaussianSurfaceParams = typeof GaussianSurfaceParams;
export declare function getGaussianSurfaceParams(ctx: ThemeRegistryContext, structure: Structure): {
    visuals: PD.MultiSelect<"gaussian-surface-mesh" | "structure-gaussian-surface-mesh" | "gaussian-surface-wireframe">;
    bumpFrequency: PD.Numeric;
    sizeFactor: PD.Numeric;
    lineSizeAttenuation: PD.BooleanParam;
    ignoreHydrogens: PD.BooleanParam;
    ignoreHydrogensVariant: PD.Select<"all" | "non-polar">;
    includeParent: PD.BooleanParam;
    traceOnly: PD.BooleanParam;
    resolution: PD.Numeric;
    radiusOffset: PD.Numeric;
    smoothness: PD.Numeric;
    unitKinds: PD.MultiSelect<"spheres" | "gaussians" | "atomic">;
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
    tryUseGpu: PD.BooleanParam;
    smoothColors: PD.Mapped<PD.NamedParams<PD.Normalize<unknown>, "auto"> | PD.NamedParams<PD.Normalize<{
        resolutionFactor: number;
        sampleStride: number;
    }>, "on"> | PD.NamedParams<PD.Normalize<unknown>, "off">>;
    doubleSided: PD.BooleanParam;
    flipSided: PD.BooleanParam;
    flatShaded: PD.BooleanParam;
    ignoreLight: PD.BooleanParam;
    xrayShaded: PD.Select<boolean | "inverted">;
    transparentBackfaces: PD.Select<string>;
    bumpAmplitude: PD.Numeric;
};
export type GaussianSurfaceRepresentation = StructureRepresentation<GaussianSurfaceParams>;
export declare function GaussianSurfaceRepresentation(ctx: RepresentationContext, getParams: RepresentationParamsGetter<Structure, GaussianSurfaceParams>): GaussianSurfaceRepresentation;
export declare const GaussianSurfaceRepresentationProvider: StructureRepresentationProvider<{
    visuals: PD.MultiSelect<"gaussian-surface-mesh" | "structure-gaussian-surface-mesh" | "gaussian-surface-wireframe">;
    bumpFrequency: PD.Numeric;
    sizeFactor: PD.Numeric;
    lineSizeAttenuation: PD.BooleanParam;
    ignoreHydrogens: PD.BooleanParam;
    ignoreHydrogensVariant: PD.Select<"all" | "non-polar">;
    includeParent: PD.BooleanParam;
    traceOnly: PD.BooleanParam;
    resolution: PD.Numeric;
    radiusOffset: PD.Numeric;
    smoothness: PD.Numeric;
    unitKinds: PD.MultiSelect<"spheres" | "gaussians" | "atomic">;
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
    tryUseGpu: PD.BooleanParam;
    smoothColors: PD.Mapped<PD.NamedParams<PD.Normalize<unknown>, "auto"> | PD.NamedParams<PD.Normalize<{
        resolutionFactor: number;
        sampleStride: number;
    }>, "on"> | PD.NamedParams<PD.Normalize<unknown>, "off">>;
    doubleSided: PD.BooleanParam;
    flipSided: PD.BooleanParam;
    flatShaded: PD.BooleanParam;
    ignoreLight: PD.BooleanParam;
    xrayShaded: PD.Select<boolean | "inverted">;
    transparentBackfaces: PD.Select<string>;
    bumpAmplitude: PD.Numeric;
}, "gaussian-surface">;
