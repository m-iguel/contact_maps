/**
 * Copyright (c) 2019-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { Model, Symmetry } from '../../../mol-model/structure';
import { ParamDefinition as PD } from '../../../mol-util/param-definition';
import { Vec3 } from '../../../mol-math/linear-algebra';
import { RepresentationParamsGetter, Representation, RepresentationContext } from '../../representation';
interface UnitcellData {
    symmetry: Symmetry;
    ref: Vec3;
}
export declare const UnitcellParams: {
    cellColor: PD.Color;
    cellScale: PD.Numeric;
    ref: PD.Select<"origin" | "model">;
    attachment: PD.Select<"center" | "corner">;
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
export type UnitcellParams = typeof UnitcellParams;
export type UnitcellProps = PD.Values<UnitcellParams>;
export declare function getUnitcellData(model: Model, symmetry: Symmetry, props: UnitcellProps): {
    symmetry: Symmetry;
    ref: Vec3;
};
export type UnitcellRepresentation = Representation<UnitcellData, UnitcellParams>;
export declare function UnitcellRepresentation(ctx: RepresentationContext, getParams: RepresentationParamsGetter<UnitcellData, UnitcellParams>): UnitcellRepresentation;
export {};
