/**
 * Copyright (c) 2018-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { Structure } from '../../../mol-model/structure';
import { RepresentationContext, RepresentationParamsGetter } from '../../../mol-repr/representation';
import { ThemeRegistryContext } from '../../../mol-theme/theme';
import { ParamDefinition as PD } from '../../../mol-util/param-definition';
import { StructureRepresentation, StructureRepresentationProvider } from '../representation';
export declare const CartoonParams: {
    sizeFactor: PD.Numeric;
    visuals: PD.MultiSelect<"polymer-trace" | "polymer-gap" | "nucleotide-ring" | "nucleotide-block" | "direction-wedge">;
    bumpFrequency: PD.Numeric;
    unitKinds: PD.MultiSelect<"spheres" | "gaussians" | "atomic">;
    includeParent: PD.BooleanParam;
    doubleSided: PD.BooleanParam;
    flipSided: PD.BooleanParam;
    flatShaded: PD.BooleanParam;
    ignoreLight: PD.BooleanParam;
    xrayShaded: PD.Select<boolean | "inverted">;
    transparentBackfaces: PD.Select<string>;
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
    radialSegments: PD.Numeric;
    detail: PD.Numeric;
    aspectRatio: PD.Numeric;
    arrowFactor: PD.Numeric;
    tubularHelices: PD.BooleanParam;
    helixProfile: PD.Select<"square" | "elliptical" | "rounded">;
    nucleicProfile: PD.Select<"square" | "elliptical" | "rounded">;
    linearSegments: PD.Numeric;
};
export type CartoonParams = typeof CartoonParams;
export declare function getCartoonParams(ctx: ThemeRegistryContext, structure: Structure): {
    sizeFactor: PD.Numeric;
    visuals: PD.MultiSelect<"polymer-trace" | "polymer-gap" | "nucleotide-ring" | "nucleotide-block" | "direction-wedge">;
    bumpFrequency: PD.Numeric;
    unitKinds: PD.MultiSelect<"spheres" | "gaussians" | "atomic">;
    includeParent: PD.BooleanParam;
    doubleSided: PD.BooleanParam;
    flipSided: PD.BooleanParam;
    flatShaded: PD.BooleanParam;
    ignoreLight: PD.BooleanParam;
    xrayShaded: PD.Select<boolean | "inverted">;
    transparentBackfaces: PD.Select<string>;
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
    radialSegments: PD.Numeric;
    detail: PD.Numeric;
    aspectRatio: PD.Numeric;
    arrowFactor: PD.Numeric;
    tubularHelices: PD.BooleanParam;
    helixProfile: PD.Select<"square" | "elliptical" | "rounded">;
    nucleicProfile: PD.Select<"square" | "elliptical" | "rounded">;
    linearSegments: PD.Numeric;
};
export type CartoonRepresentation = StructureRepresentation<CartoonParams>;
export declare function CartoonRepresentation(ctx: RepresentationContext, getParams: RepresentationParamsGetter<Structure, CartoonParams>): CartoonRepresentation;
export declare const CartoonRepresentationProvider: StructureRepresentationProvider<{
    sizeFactor: PD.Numeric;
    visuals: PD.MultiSelect<"polymer-trace" | "polymer-gap" | "nucleotide-ring" | "nucleotide-block" | "direction-wedge">;
    bumpFrequency: PD.Numeric;
    unitKinds: PD.MultiSelect<"spheres" | "gaussians" | "atomic">;
    includeParent: PD.BooleanParam;
    doubleSided: PD.BooleanParam;
    flipSided: PD.BooleanParam;
    flatShaded: PD.BooleanParam;
    ignoreLight: PD.BooleanParam;
    xrayShaded: PD.Select<boolean | "inverted">;
    transparentBackfaces: PD.Select<string>;
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
    radialSegments: PD.Numeric;
    detail: PD.Numeric;
    aspectRatio: PD.Numeric;
    arrowFactor: PD.Numeric;
    tubularHelices: PD.BooleanParam;
    helixProfile: PD.Select<"square" | "elliptical" | "rounded">;
    nucleicProfile: PD.Select<"square" | "elliptical" | "rounded">;
    linearSegments: PD.Numeric;
}, "cartoon">;
