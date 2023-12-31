/**
 * Copyright (c) 2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author Sebastian Bittrich <sebastian.bittrich@rcsb.org>
 */
import { ParamDefinition as PD } from '../../mol-util/param-definition';
import { RepresentationContext, RepresentationParamsGetter } from '../../mol-repr/representation';
import { Structure } from '../../mol-model/structure';
import { StructureRepresentationProvider, StructureRepresentation } from '../../mol-repr/structure/representation';
import { ThemeRegistryContext } from '../../mol-theme/theme';
declare const BilayerPlanesParams: {
    sectorOpacity: PD.Numeric;
    color: PD.Color;
    radiusFactor: PD.Numeric;
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
        variant: import("../../mol-util/clip").Clip.Variant;
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
export type BilayerPlanesParams = typeof BilayerPlanesParams;
export type BilayerPlanesProps = PD.Values<BilayerPlanesParams>;
declare const BilayerRimsParams: {
    lineSizeAttenuation: PD.BooleanParam;
    linesSize: PD.Numeric;
    dashedLines: PD.BooleanParam;
    color: PD.Color;
    radiusFactor: PD.Numeric;
    sizeFactor: PD.Numeric;
    alpha: PD.Numeric;
    quality: PD.Select<"auto" | "medium" | "high" | "low" | "custom" | "highest" | "higher" | "lower" | "lowest">;
    material: PD.Group<PD.Normalize<{
        metalness: number;
        roughness: number;
        bumpiness: number;
    }>>;
    clip: PD.Group<PD.Normalize<{
        variant: import("../../mol-util/clip").Clip.Variant;
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
export type BilayerRimsParams = typeof BilayerRimsParams;
export type BilayerRimsProps = PD.Values<BilayerRimsParams>;
export declare const MembraneOrientationParams: {
    visuals: PD.MultiSelect<"bilayer-planes" | "bilayer-rims">;
    lineSizeAttenuation: PD.BooleanParam;
    linesSize: PD.Numeric;
    dashedLines: PD.BooleanParam;
    color: PD.Color;
    radiusFactor: PD.Numeric;
    sizeFactor: PD.Numeric;
    alpha: PD.Numeric;
    quality: PD.Select<"auto" | "medium" | "high" | "low" | "custom" | "highest" | "higher" | "lower" | "lowest">;
    material: PD.Group<PD.Normalize<{
        metalness: number;
        roughness: number;
        bumpiness: number;
    }>>;
    clip: PD.Group<PD.Normalize<{
        variant: import("../../mol-util/clip").Clip.Variant;
        objects: PD.Normalize<{
            type: any;
            invert: any;
            position: any;
            rotation: any;
            scale: any;
        }>[];
    }>>;
    instanceGranularity: PD.BooleanParam;
    sectorOpacity: PD.Numeric;
    doubleSided: PD.BooleanParam;
    flipSided: PD.BooleanParam;
    flatShaded: PD.BooleanParam;
    ignoreLight: PD.BooleanParam;
    xrayShaded: PD.Select<boolean | "inverted">;
    transparentBackfaces: PD.Select<string>;
    bumpFrequency: PD.Numeric;
    bumpAmplitude: PD.Numeric;
};
export type MembraneOrientationParams = typeof MembraneOrientationParams;
export type MembraneOrientationProps = PD.Values<MembraneOrientationParams>;
export declare function getMembraneOrientationParams(ctx: ThemeRegistryContext, structure: Structure): {
    visuals: PD.MultiSelect<"bilayer-planes" | "bilayer-rims">;
    lineSizeAttenuation: PD.BooleanParam;
    linesSize: PD.Numeric;
    dashedLines: PD.BooleanParam;
    color: PD.Color;
    radiusFactor: PD.Numeric;
    sizeFactor: PD.Numeric;
    alpha: PD.Numeric;
    quality: PD.Select<"auto" | "medium" | "high" | "low" | "custom" | "highest" | "higher" | "lower" | "lowest">;
    material: PD.Group<PD.Normalize<{
        metalness: number;
        roughness: number;
        bumpiness: number;
    }>>;
    clip: PD.Group<PD.Normalize<{
        variant: import("../../mol-util/clip").Clip.Variant;
        objects: PD.Normalize<{
            type: any;
            invert: any;
            position: any;
            rotation: any;
            scale: any;
        }>[];
    }>>;
    instanceGranularity: PD.BooleanParam;
    sectorOpacity: PD.Numeric;
    doubleSided: PD.BooleanParam;
    flipSided: PD.BooleanParam;
    flatShaded: PD.BooleanParam;
    ignoreLight: PD.BooleanParam;
    xrayShaded: PD.Select<boolean | "inverted">;
    transparentBackfaces: PD.Select<string>;
    bumpFrequency: PD.Numeric;
    bumpAmplitude: PD.Numeric;
};
export type MembraneOrientationRepresentation = StructureRepresentation<MembraneOrientationParams>;
export declare function MembraneOrientationRepresentation(ctx: RepresentationContext, getParams: RepresentationParamsGetter<Structure, MembraneOrientationParams>): MembraneOrientationRepresentation;
export declare const MembraneOrientationRepresentationProvider: StructureRepresentationProvider<{
    visuals: PD.MultiSelect<"bilayer-planes" | "bilayer-rims">;
    lineSizeAttenuation: PD.BooleanParam;
    linesSize: PD.Numeric;
    dashedLines: PD.BooleanParam;
    color: PD.Color;
    radiusFactor: PD.Numeric;
    sizeFactor: PD.Numeric;
    alpha: PD.Numeric;
    quality: PD.Select<"auto" | "medium" | "high" | "low" | "custom" | "highest" | "higher" | "lower" | "lowest">;
    material: PD.Group<PD.Normalize<{
        metalness: number;
        roughness: number;
        bumpiness: number;
    }>>;
    clip: PD.Group<PD.Normalize<{
        variant: import("../../mol-util/clip").Clip.Variant;
        objects: PD.Normalize<{
            type: any;
            invert: any;
            position: any;
            rotation: any;
            scale: any;
        }>[];
    }>>;
    instanceGranularity: PD.BooleanParam;
    sectorOpacity: PD.Numeric;
    doubleSided: PD.BooleanParam;
    flipSided: PD.BooleanParam;
    flatShaded: PD.BooleanParam;
    ignoreLight: PD.BooleanParam;
    xrayShaded: PD.Select<boolean | "inverted">;
    transparentBackfaces: PD.Select<string>;
    bumpFrequency: PD.Numeric;
    bumpAmplitude: PD.Numeric;
}, "membrane-orientation">;
export {};
