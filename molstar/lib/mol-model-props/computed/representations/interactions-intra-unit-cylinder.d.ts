/**
 * Copyright (c) 2019-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { ParamDefinition as PD } from '../../../mol-util/param-definition';
import { UnitsVisual } from '../../../mol-repr/structure/units-visual';
export declare const InteractionsIntraUnitParams: {
    sizeFactor: PD.Numeric;
    dashCount: PD.Numeric;
    dashScale: PD.Numeric;
    ignoreHydrogens: PD.BooleanParam;
    ignoreHydrogensVariant: PD.Select<"all" | "non-polar">;
    includeParent: PD.BooleanParam;
    parentDisplay: PD.Select<"stub" | "full" | "between">;
    linkScale: PD.Numeric;
    linkSpacing: PD.Numeric;
    linkCap: PD.BooleanParam;
    aromaticScale: PD.Numeric;
    aromaticSpacing: PD.Numeric;
    aromaticDashCount: PD.Numeric;
    dashCap: PD.BooleanParam;
    stubCap: PD.BooleanParam;
    radialSegments: PD.Numeric;
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
export type InteractionsIntraUnitParams = typeof InteractionsIntraUnitParams;
export declare function InteractionsIntraUnitVisual(materialId: number): UnitsVisual<InteractionsIntraUnitParams>;
