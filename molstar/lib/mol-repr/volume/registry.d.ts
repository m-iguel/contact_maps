/**
 * Copyright (c) 2018-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { RepresentationRegistry, Representation, RepresentationProvider } from '../representation';
import { Volume } from '../../mol-model/volume';
export declare class VolumeRepresentationRegistry extends RepresentationRegistry<Volume, Representation.State> {
    constructor();
}
export declare namespace VolumeRepresentationRegistry {
    export const BuiltIn: {
        isosurface: import("./representation").VolumeRepresentationProvider<{
            visuals: import("../../mol-util/param-definition").ParamDefinition.MultiSelect<"solid" | "wireframe">;
            bumpFrequency: import("../../mol-util/param-definition").ParamDefinition.Numeric;
            quality: {
                isEssential: boolean;
                type: "select";
                options: readonly (readonly ["auto" | "medium" | "high" | "low" | "custom" | "highest" | "higher" | "lower" | "lowest", string] | readonly ["auto" | "medium" | "high" | "low" | "custom" | "highest" | "higher" | "lower" | "lowest", string, string | undefined])[];
                cycle?: boolean | undefined;
                isOptional?: boolean | undefined;
                defaultValue: "auto" | "medium" | "high" | "low" | "custom" | "highest" | "higher" | "lower" | "lowest";
                label?: string | undefined;
                description?: string | undefined;
                legend?: import("../../mol-util/legend").Legend | undefined;
                fieldLabels?: {
                    [name: string]: string;
                } | undefined;
                isHidden?: boolean | undefined;
                shortLabel?: boolean | undefined;
                twoColumns?: boolean | undefined;
                category?: string | undefined;
                hideIf?: ((currentGroup: any) => boolean) | undefined;
                help?: ((value: any) => {
                    description?: string | undefined;
                    legend?: import("../../mol-util/legend").Legend | undefined;
                }) | undefined;
            };
            sizeFactor: import("../../mol-util/param-definition").ParamDefinition.Numeric;
            isoValue: import("../../mol-util/param-definition").ParamDefinition.Conditioned<Readonly<{
                kind: "absolute";
                absoluteValue: number;
            }> | Readonly<{
                kind: "relative";
                relativeValue: number;
            }>, import("../../mol-util/param-definition").ParamDefinition.Base<Readonly<{
                kind: "absolute";
                absoluteValue: number;
            }> | Readonly<{
                kind: "relative";
                relativeValue: number;
            }>>, {
                absolute: import("../../mol-util/param-definition").ParamDefinition.Converted<Readonly<{
                    kind: "absolute";
                    absoluteValue: number;
                }>, number>;
                relative: import("../../mol-util/param-definition").ParamDefinition.Converted<Readonly<{
                    kind: "relative";
                    relativeValue: number;
                }>, number>;
            }>;
            lineSizeAttenuation: import("../../mol-util/param-definition").ParamDefinition.BooleanParam;
            alpha: import("../../mol-util/param-definition").ParamDefinition.Numeric;
            material: import("../../mol-util/param-definition").ParamDefinition.Group<import("../../mol-util/param-definition").ParamDefinition.Normalize<{
                metalness: number;
                roughness: number;
                bumpiness: number;
            }>>;
            clip: import("../../mol-util/param-definition").ParamDefinition.Group<import("../../mol-util/param-definition").ParamDefinition.Normalize<{
                variant: import("../../mol-util/clip").Clip.Variant;
                objects: import("../../mol-util/param-definition").ParamDefinition.Normalize<{
                    type: any;
                    invert: any;
                    position: any;
                    rotation: any;
                    scale: any;
                }>[];
            }>>;
            instanceGranularity: import("../../mol-util/param-definition").ParamDefinition.BooleanParam;
            tryUseGpu: import("../../mol-util/param-definition").ParamDefinition.BooleanParam;
            doubleSided: import("../../mol-util/param-definition").ParamDefinition.BooleanParam;
            flipSided: import("../../mol-util/param-definition").ParamDefinition.BooleanParam;
            flatShaded: import("../../mol-util/param-definition").ParamDefinition.BooleanParam;
            ignoreLight: import("../../mol-util/param-definition").ParamDefinition.BooleanParam;
            xrayShaded: import("../../mol-util/param-definition").ParamDefinition.Select<boolean | "inverted">;
            transparentBackfaces: import("../../mol-util/param-definition").ParamDefinition.Select<string>;
            bumpAmplitude: import("../../mol-util/param-definition").ParamDefinition.Numeric;
        }, "isosurface">;
        slice: import("./representation").VolumeRepresentationProvider<{
            quality: {
                isEssential: boolean;
                type: "select";
                options: readonly (readonly ["auto" | "medium" | "high" | "low" | "custom" | "highest" | "higher" | "lower" | "lowest", string] | readonly ["auto" | "medium" | "high" | "low" | "custom" | "highest" | "higher" | "lower" | "lowest", string, string | undefined])[];
                cycle?: boolean | undefined;
                isOptional?: boolean | undefined;
                defaultValue: "auto" | "medium" | "high" | "low" | "custom" | "highest" | "higher" | "lower" | "lowest";
                label?: string | undefined;
                description?: string | undefined;
                legend?: import("../../mol-util/legend").Legend | undefined;
                fieldLabels?: {
                    [name: string]: string;
                } | undefined;
                isHidden?: boolean | undefined;
                shortLabel?: boolean | undefined;
                twoColumns?: boolean | undefined;
                category?: string | undefined;
                hideIf?: ((currentGroup: any) => boolean) | undefined;
                help?: ((value: any) => {
                    description?: string | undefined;
                    legend?: import("../../mol-util/legend").Legend | undefined;
                }) | undefined;
            };
            dimension: import("../../mol-util/param-definition").ParamDefinition.Mapped<import("../../mol-util/param-definition").ParamDefinition.NamedParams<number, "x"> | import("../../mol-util/param-definition").ParamDefinition.NamedParams<number, "y"> | import("../../mol-util/param-definition").ParamDefinition.NamedParams<number, "z">>;
            isoValue: import("../../mol-util/param-definition").ParamDefinition.Conditioned<Readonly<{
                kind: "absolute";
                absoluteValue: number;
            }> | Readonly<{
                kind: "relative";
                relativeValue: number;
            }>, import("../../mol-util/param-definition").ParamDefinition.Base<Readonly<{
                kind: "absolute";
                absoluteValue: number;
            }> | Readonly<{
                kind: "relative";
                relativeValue: number;
            }>>, {
                absolute: import("../../mol-util/param-definition").ParamDefinition.Converted<Readonly<{
                    kind: "absolute";
                    absoluteValue: number;
                }>, number>;
                relative: import("../../mol-util/param-definition").ParamDefinition.Converted<Readonly<{
                    kind: "relative";
                    relativeValue: number;
                }>, number>;
            }>;
            interpolation: import("../../mol-util/param-definition").ParamDefinition.Select<"nearest" | "bspline" | "catmulrom" | "mitchell">;
            alpha: import("../../mol-util/param-definition").ParamDefinition.Numeric;
            material: import("../../mol-util/param-definition").ParamDefinition.Group<import("../../mol-util/param-definition").ParamDefinition.Normalize<{
                metalness: number;
                roughness: number;
                bumpiness: number;
            }>>;
            clip: import("../../mol-util/param-definition").ParamDefinition.Group<import("../../mol-util/param-definition").ParamDefinition.Normalize<{
                variant: import("../../mol-util/clip").Clip.Variant;
                objects: import("../../mol-util/param-definition").ParamDefinition.Normalize<{
                    type: any;
                    invert: any;
                    position: any;
                    rotation: any;
                    scale: any;
                }>[];
            }>>;
            instanceGranularity: import("../../mol-util/param-definition").ParamDefinition.BooleanParam;
        }, "slice">;
        'direct-volume': import("./representation").VolumeRepresentationProvider<{
            quality: {
                isEssential: boolean;
                type: "select";
                options: readonly (readonly ["auto" | "medium" | "high" | "low" | "custom" | "highest" | "higher" | "lower" | "lowest", string] | readonly ["auto" | "medium" | "high" | "low" | "custom" | "highest" | "higher" | "lower" | "lowest", string, string | undefined])[];
                cycle?: boolean | undefined;
                isOptional?: boolean | undefined;
                defaultValue: "auto" | "medium" | "high" | "low" | "custom" | "highest" | "higher" | "lower" | "lowest";
                label?: string | undefined;
                description?: string | undefined;
                legend?: import("../../mol-util/legend").Legend | undefined;
                fieldLabels?: {
                    [name: string]: string;
                } | undefined;
                isHidden?: boolean | undefined;
                shortLabel?: boolean | undefined;
                twoColumns?: boolean | undefined;
                category?: string | undefined;
                hideIf?: ((currentGroup: any) => boolean) | undefined;
                help?: ((value: any) => {
                    description?: string | undefined;
                    legend?: import("../../mol-util/legend").Legend | undefined;
                }) | undefined;
            };
            ignoreLight: import("../../mol-util/param-definition").ParamDefinition.BooleanParam;
            xrayShaded: import("../../mol-util/param-definition").ParamDefinition.Select<boolean | "inverted">;
            controlPoints: import("../../mol-util/param-definition").ParamDefinition.LineGraph;
            stepsPerCell: import("../../mol-util/param-definition").ParamDefinition.Numeric;
            jumpLength: import("../../mol-util/param-definition").ParamDefinition.Numeric;
            alpha: import("../../mol-util/param-definition").ParamDefinition.Numeric;
            material: import("../../mol-util/param-definition").ParamDefinition.Group<import("../../mol-util/param-definition").ParamDefinition.Normalize<{
                metalness: number;
                roughness: number;
                bumpiness: number;
            }>>;
            clip: import("../../mol-util/param-definition").ParamDefinition.Group<import("../../mol-util/param-definition").ParamDefinition.Normalize<{
                variant: import("../../mol-util/clip").Clip.Variant;
                objects: import("../../mol-util/param-definition").ParamDefinition.Normalize<{
                    type: any;
                    invert: any;
                    position: any;
                    rotation: any;
                    scale: any;
                }>[];
            }>>;
            instanceGranularity: import("../../mol-util/param-definition").ParamDefinition.BooleanParam;
        }, "direct-volume">;
        segment: import("./representation").VolumeRepresentationProvider<{
            visuals: import("../../mol-util/param-definition").ParamDefinition.MultiSelect<"segment">;
            bumpFrequency: import("../../mol-util/param-definition").ParamDefinition.Numeric;
            quality: {
                isEssential: boolean;
                type: "select";
                options: readonly (readonly ["auto" | "medium" | "high" | "low" | "custom" | "highest" | "higher" | "lower" | "lowest", string] | readonly ["auto" | "medium" | "high" | "low" | "custom" | "highest" | "higher" | "lower" | "lowest", string, string | undefined])[];
                cycle?: boolean | undefined;
                isOptional?: boolean | undefined;
                defaultValue: "auto" | "medium" | "high" | "low" | "custom" | "highest" | "higher" | "lower" | "lowest";
                label?: string | undefined;
                description?: string | undefined;
                legend?: import("../../mol-util/legend").Legend | undefined;
                fieldLabels?: {
                    [name: string]: string;
                } | undefined;
                isHidden?: boolean | undefined;
                shortLabel?: boolean | undefined;
                twoColumns?: boolean | undefined;
                category?: string | undefined;
                hideIf?: ((currentGroup: any) => boolean) | undefined;
                help?: ((value: any) => {
                    description?: string | undefined;
                    legend?: import("../../mol-util/legend").Legend | undefined;
                }) | undefined;
            };
            tryUseGpu: import("../../mol-util/param-definition").ParamDefinition.BooleanParam;
            segments: import("../../mol-util/param-definition").ParamDefinition.Converted<number[], string[]>;
            doubleSided: import("../../mol-util/param-definition").ParamDefinition.BooleanParam;
            flipSided: import("../../mol-util/param-definition").ParamDefinition.BooleanParam;
            flatShaded: import("../../mol-util/param-definition").ParamDefinition.BooleanParam;
            ignoreLight: import("../../mol-util/param-definition").ParamDefinition.BooleanParam;
            xrayShaded: import("../../mol-util/param-definition").ParamDefinition.Select<boolean | "inverted">;
            transparentBackfaces: import("../../mol-util/param-definition").ParamDefinition.Select<string>;
            bumpAmplitude: import("../../mol-util/param-definition").ParamDefinition.Numeric;
            alpha: import("../../mol-util/param-definition").ParamDefinition.Numeric;
            material: import("../../mol-util/param-definition").ParamDefinition.Group<import("../../mol-util/param-definition").ParamDefinition.Normalize<{
                metalness: number;
                roughness: number;
                bumpiness: number;
            }>>;
            clip: import("../../mol-util/param-definition").ParamDefinition.Group<import("../../mol-util/param-definition").ParamDefinition.Normalize<{
                variant: import("../../mol-util/clip").Clip.Variant;
                objects: import("../../mol-util/param-definition").ParamDefinition.Normalize<{
                    type: any;
                    invert: any;
                    position: any;
                    rotation: any;
                    scale: any;
                }>[];
            }>>;
            instanceGranularity: import("../../mol-util/param-definition").ParamDefinition.BooleanParam;
        }, "segment">;
    };
    type _BuiltIn = typeof BuiltIn;
    export type BuiltIn = keyof _BuiltIn;
    export type BuiltInParams<T extends BuiltIn> = Partial<RepresentationProvider.ParamValues<_BuiltIn[T]>>;
    export {};
}
