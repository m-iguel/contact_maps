/**
 * Copyright (c) 2018-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { ParamDefinition as PD } from '../../../mol-util/param-definition';
import { Color } from '../../../mol-util/color';
import { Representation, RepresentationContext, RepresentationParamsGetter } from '../../../mol-repr/representation';
import { Structure } from '../../../mol-model/structure';
export declare const AssemblySymmetryParams: {
    visuals: PD.MultiSelect<"axes" | "cage">;
    cageColor: PD.Color;
    scale: PD.Numeric;
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
    axesColor: PD.Mapped<PD.NamedParams<PD.Normalize<{
        colorValue: Color;
    }>, "uniform"> | PD.NamedParams<PD.Normalize<unknown>, "byOrder">>;
};
export type AssemblySymmetryParams = typeof AssemblySymmetryParams;
export type AssemblySymmetryProps = PD.Values<AssemblySymmetryParams>;
export type AssemblySymmetryRepresentation = Representation<Structure, AssemblySymmetryParams>;
export declare function AssemblySymmetryRepresentation(ctx: RepresentationContext, getParams: RepresentationParamsGetter<Structure, AssemblySymmetryParams>): AssemblySymmetryRepresentation;
