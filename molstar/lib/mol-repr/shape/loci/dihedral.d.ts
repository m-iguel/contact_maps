/**
 * Copyright (c) 2019-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { Loci } from '../../../mol-model/loci';
import { ParamDefinition as PD } from '../../../mol-util/param-definition';
import { Representation, RepresentationParamsGetter, RepresentationContext } from '../../representation';
export interface DihedralData {
    quads: Loci.Bundle<4>[];
}
export declare const DihedralParams: {
    visuals: PD.MultiSelect<"text" | "vectors" | "sector" | "arc" | "extenders" | "arms" | "connector">;
    borderWidth: PD.Numeric;
    customText: PD.Text<string>;
    textColor: PD.Color;
    textSize: PD.Numeric;
    sizeFactor: PD.Numeric;
    borderColor: PD.Color;
    offsetX: PD.Numeric;
    offsetY: PD.Numeric;
    offsetZ: PD.Numeric;
    background: PD.BooleanParam;
    backgroundMargin: PD.Numeric;
    backgroundColor: PD.Color;
    backgroundOpacity: PD.Numeric;
    tether: PD.BooleanParam;
    tetherLength: PD.Numeric;
    tetherBaseWidth: PD.Numeric;
    attachment: PD.Select<"bottom-left" | "bottom-center" | "bottom-right" | "middle-left" | "middle-center" | "middle-right" | "top-left" | "top-center" | "top-right">;
    fontFamily: PD.Select<import("../../../mol-geo/geometry/text/font-atlas").FontFamily>;
    fontQuality: PD.Select<number>;
    fontStyle: PD.Select<import("../../../mol-geo/geometry/text/font-atlas").FontStyle>;
    fontVariant: PD.Select<import("../../../mol-geo/geometry/text/font-atlas").FontVariant>;
    fontWeight: PD.Select<import("../../../mol-geo/geometry/text/font-atlas").FontWeight>;
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
    ignoreLight: PD.BooleanParam;
    sectorOpacity: PD.Numeric;
    color: PD.Color;
    arcScale: PD.Numeric;
    doubleSided: PD.BooleanParam;
    flipSided: PD.BooleanParam;
    flatShaded: PD.BooleanParam;
    xrayShaded: PD.Select<boolean | "inverted">;
    transparentBackfaces: PD.Select<string>;
    bumpFrequency: PD.Numeric;
    bumpAmplitude: PD.Numeric;
    lineSizeAttenuation: PD.BooleanParam;
    linesSize: PD.Numeric;
    dashLength: PD.Numeric;
};
export type DihedralParams = typeof DihedralParams;
export type DihedralProps = PD.Values<DihedralParams>;
export type DihedralRepresentation = Representation<DihedralData, DihedralParams>;
export declare function DihedralRepresentation(ctx: RepresentationContext, getParams: RepresentationParamsGetter<DihedralData, DihedralParams>): DihedralRepresentation;
