/**
 * Copyright (c) 2019-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Schäfer, Marco <marco.schaefer@uni-tuebingen.de>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { Task } from '../../mol-task';
import { ShapeProvider } from '../../mol-model/shape/provider';
import { Color } from '../../mol-util/color';
import { PlyFile } from '../../mol-io/reader/ply/schema';
import { Mesh } from '../../mol-geo/geometry/mesh/mesh';
import { ParamDefinition as PD } from '../../mol-util/param-definition';
export declare const PlyShapeParams: {
    coloring: PD.Mapped<PD.NamedParams<PD.Normalize<{
        color: Color;
    }>, "uniform"> | PD.NamedParams<PD.Normalize<{
        red: string;
        green: string;
        blue: string;
    }>, "material"> | PD.NamedParams<PD.Normalize<{
        red: string;
        green: string;
        blue: string;
    }>, "vertex">>;
    grouping: PD.Mapped<PD.NamedParams<PD.Normalize<unknown>, "none"> | PD.NamedParams<PD.Normalize<{
        group: string;
    }>, "vertex">>;
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
export type PlyShapeParams = typeof PlyShapeParams;
export declare function shapeFromPly(source: PlyFile, params?: {}): Task<ShapeProvider<PlyFile, Mesh, {
    coloring: PD.Mapped<PD.NamedParams<PD.Normalize<{
        color: Color;
    }>, "uniform"> | PD.NamedParams<PD.Normalize<{
        red: string;
        green: string;
        blue: string;
    }>, "material"> | PD.NamedParams<PD.Normalize<{
        red: string;
        green: string;
        blue: string;
    }>, "vertex">>;
    grouping: PD.Mapped<PD.NamedParams<PD.Normalize<unknown>, "none"> | PD.NamedParams<PD.Normalize<{
        group: string;
    }>, "vertex">>;
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
}>>;
