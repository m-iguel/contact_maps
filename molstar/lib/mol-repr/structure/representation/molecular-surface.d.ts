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
export declare const MolecularSurfaceParams: {
    visuals: PD.MultiSelect<"molecular-surface-mesh" | "structure-molecular-surface-mesh" | "molecular-surface-wireframe">;
    bumpFrequency: PD.Numeric;
    sizeFactor: PD.Numeric;
    ignoreHydrogens: PD.BooleanParam;
    ignoreHydrogensVariant: PD.Select<"all" | "non-polar">;
    traceOnly: PD.BooleanParam;
    includeParent: PD.BooleanParam;
    probeRadius: PD.Numeric;
    resolution: PD.Numeric;
    probePositions: PD.Numeric;
    unitKinds: PD.MultiSelect<"spheres" | "gaussians" | "atomic">;
    lineSizeAttenuation: PD.BooleanParam;
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
export type MolecularSurfaceParams = typeof MolecularSurfaceParams;
export declare function getMolecularSurfaceParams(ctx: ThemeRegistryContext, structure: Structure): {
    visuals: PD.MultiSelect<"molecular-surface-mesh" | "structure-molecular-surface-mesh" | "molecular-surface-wireframe">;
    bumpFrequency: PD.Numeric;
    sizeFactor: PD.Numeric;
    ignoreHydrogens: PD.BooleanParam;
    ignoreHydrogensVariant: PD.Select<"all" | "non-polar">;
    traceOnly: PD.BooleanParam;
    includeParent: PD.BooleanParam;
    probeRadius: PD.Numeric;
    resolution: PD.Numeric;
    probePositions: PD.Numeric;
    unitKinds: PD.MultiSelect<"spheres" | "gaussians" | "atomic">;
    lineSizeAttenuation: PD.BooleanParam;
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
export type MolecularSurfaceRepresentation = StructureRepresentation<MolecularSurfaceParams>;
export declare function MolecularSurfaceRepresentation(ctx: RepresentationContext, getParams: RepresentationParamsGetter<Structure, MolecularSurfaceParams>): MolecularSurfaceRepresentation;
export declare const MolecularSurfaceRepresentationProvider: StructureRepresentationProvider<{
    visuals: PD.MultiSelect<"molecular-surface-mesh" | "structure-molecular-surface-mesh" | "molecular-surface-wireframe">;
    bumpFrequency: PD.Numeric;
    sizeFactor: PD.Numeric;
    ignoreHydrogens: PD.BooleanParam;
    ignoreHydrogensVariant: PD.Select<"all" | "non-polar">;
    traceOnly: PD.BooleanParam;
    includeParent: PD.BooleanParam;
    probeRadius: PD.Numeric;
    resolution: PD.Numeric;
    probePositions: PD.Numeric;
    unitKinds: PD.MultiSelect<"spheres" | "gaussians" | "atomic">;
    lineSizeAttenuation: PD.BooleanParam;
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
}, "molecular-surface">;
