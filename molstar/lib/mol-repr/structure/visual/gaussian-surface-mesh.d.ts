/**
 * Copyright (c) 2018-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { ParamDefinition as PD } from '../../../mol-util/param-definition';
import { UnitsVisual } from '../units-visual';
import { Structure } from '../../../mol-model/structure';
import { ComplexVisual } from '../complex-visual';
import { WebGLContext } from '../../../mol-gl/webgl/context';
export declare const GaussianSurfaceMeshParams: {
    ignoreHydrogens: PD.BooleanParam;
    ignoreHydrogensVariant: PD.Select<"all" | "non-polar">;
    tryUseGpu: PD.BooleanParam;
    includeParent: PD.BooleanParam;
    smoothColors: PD.Mapped<PD.NamedParams<PD.Normalize<unknown>, "auto"> | PD.NamedParams<PD.Normalize<{
        resolutionFactor: number;
        sampleStride: number;
    }>, "on"> | PD.NamedParams<PD.Normalize<unknown>, "off">>;
    traceOnly: PD.BooleanParam;
    resolution: PD.Numeric;
    radiusOffset: PD.Numeric;
    smoothness: PD.Numeric;
    unitKinds: PD.MultiSelect<"spheres" | "gaussians" | "atomic">;
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
export type GaussianSurfaceMeshParams = typeof GaussianSurfaceMeshParams;
export declare const StructureGaussianSurfaceMeshParams: {
    ignoreHydrogens: PD.BooleanParam;
    ignoreHydrogensVariant: PD.Select<"all" | "non-polar">;
    tryUseGpu: PD.BooleanParam;
    includeParent: PD.BooleanParam;
    smoothColors: PD.Mapped<PD.NamedParams<PD.Normalize<unknown>, "auto"> | PD.NamedParams<PD.Normalize<{
        resolutionFactor: number;
        sampleStride: number;
    }>, "on"> | PD.NamedParams<PD.Normalize<unknown>, "off">>;
    traceOnly: PD.BooleanParam;
    resolution: PD.Numeric;
    radiusOffset: PD.Numeric;
    smoothness: PD.Numeric;
    unitKinds: PD.MultiSelect<"spheres" | "gaussians" | "atomic">;
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
export type StructureGaussianSurfaceMeshParams = typeof StructureGaussianSurfaceMeshParams;
export declare function GaussianSurfaceVisual(materialId: number, structure: Structure, props: PD.Values<GaussianSurfaceMeshParams>, webgl?: WebGLContext): UnitsVisual<{
    ignoreHydrogens: PD.BooleanParam;
    ignoreHydrogensVariant: PD.Select<"all" | "non-polar">;
    tryUseGpu: PD.BooleanParam;
    includeParent: PD.BooleanParam;
    smoothColors: PD.Mapped<PD.NamedParams<PD.Normalize<unknown>, "auto"> | PD.NamedParams<PD.Normalize<{
        resolutionFactor: number;
        sampleStride: number;
    }>, "on"> | PD.NamedParams<PD.Normalize<unknown>, "off">>;
    traceOnly: PD.BooleanParam;
    resolution: PD.Numeric;
    radiusOffset: PD.Numeric;
    smoothness: PD.Numeric;
    unitKinds: PD.MultiSelect<"spheres" | "gaussians" | "atomic">;
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
}>;
export declare function StructureGaussianSurfaceVisual(materialId: number, structure: Structure, props: PD.Values<StructureGaussianSurfaceMeshParams>, webgl?: WebGLContext): ComplexVisual<{
    ignoreHydrogens: PD.BooleanParam;
    ignoreHydrogensVariant: PD.Select<"all" | "non-polar">;
    tryUseGpu: PD.BooleanParam;
    includeParent: PD.BooleanParam;
    smoothColors: PD.Mapped<PD.NamedParams<PD.Normalize<unknown>, "auto"> | PD.NamedParams<PD.Normalize<{
        resolutionFactor: number;
        sampleStride: number;
    }>, "on"> | PD.NamedParams<PD.Normalize<unknown>, "off">>;
    traceOnly: PD.BooleanParam;
    resolution: PD.Numeric;
    radiusOffset: PD.Numeric;
    smoothness: PD.Numeric;
    unitKinds: PD.MultiSelect<"spheres" | "gaussians" | "atomic">;
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
}>;
export declare function GaussianSurfaceMeshVisual(materialId: number): UnitsVisual<GaussianSurfaceMeshParams>;
export declare function StructureGaussianSurfaceMeshVisual(materialId: number): ComplexVisual<StructureGaussianSurfaceMeshParams>;
export declare function GaussianSurfaceTextureMeshVisual(materialId: number): UnitsVisual<GaussianSurfaceMeshParams>;
export declare function StructureGaussianSurfaceTextureMeshVisual(materialId: number): ComplexVisual<StructureGaussianSurfaceMeshParams>;
