/**
 * Copyright (c) 2021 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { ParamDefinition as PD } from '../../../mol-util/param-definition';
import { Representation, RepresentationParamsGetter, RepresentationContext } from '../../representation';
import { StructureElement } from '../../../mol-model/structure';
export interface PlaneData {
    locis: StructureElement.Loci[];
}
export declare const PlaneParams: {
    visuals: PD.MultiSelect<"plane">;
    color: PD.Color;
    scaleFactor: PD.Numeric;
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
export type PlaneParams = typeof PlaneParams;
export type PlaneProps = PD.Values<PlaneParams>;
export type PlaneRepresentation = Representation<PlaneData, PlaneParams>;
export declare function PlaneRepresentation(ctx: RepresentationContext, getParams: RepresentationParamsGetter<PlaneData, PlaneParams>): PlaneRepresentation;
