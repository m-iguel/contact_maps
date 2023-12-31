/**
 * Copyright (c) 2018-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { ParamDefinition as PD } from '../../mol-util/param-definition';
import { Volume } from '../../mol-model/volume';
import { RuntimeContext } from '../../mol-task';
import { WebGLContext } from '../../mol-gl/webgl/context';
import { DirectVolume } from '../../mol-geo/geometry/direct-volume/direct-volume';
import { VisualContext } from '../visual';
import { Theme, ThemeRegistryContext } from '../../mol-theme/theme';
import { VolumeVisual, VolumeRepresentation, VolumeRepresentationProvider } from './representation';
import { RepresentationContext, RepresentationParamsGetter } from '../representation';
import { Interval } from '../../mol-data/int';
import { Loci } from '../../mol-model/loci';
import { PickingId } from '../../mol-geo/geometry/picking';
export declare function createDirectVolume2d(ctx: RuntimeContext, webgl: WebGLContext, volume: Volume, directVolume?: DirectVolume): DirectVolume;
export declare function createDirectVolume3d(ctx: RuntimeContext, webgl: WebGLContext, volume: Volume, directVolume?: DirectVolume): DirectVolume;
export declare function createDirectVolume(ctx: VisualContext, volume: Volume, key: number, theme: Theme, props: PD.Values<DirectVolumeParams>, directVolume?: DirectVolume): Promise<DirectVolume>;
export declare function getDirectVolumeLoci(pickingId: PickingId, volume: Volume, key: number, props: DirectVolumeProps, id: number): Volume.Cell.Loci | {
    kind: "empty-loci";
};
export declare function eachDirectVolume(loci: Loci, volume: Volume, key: number, props: DirectVolumeProps, apply: (interval: Interval) => boolean): boolean;
export declare const DirectVolumeParams: {
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
    ignoreLight: PD.BooleanParam;
    xrayShaded: PD.Select<boolean | "inverted">;
    controlPoints: PD.LineGraph;
    stepsPerCell: PD.Numeric;
    jumpLength: PD.Numeric;
    alpha: PD.Numeric;
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
export type DirectVolumeParams = typeof DirectVolumeParams;
export declare function getDirectVolumeParams(ctx: ThemeRegistryContext, volume: Volume): {
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
    ignoreLight: PD.BooleanParam;
    xrayShaded: PD.Select<boolean | "inverted">;
    controlPoints: PD.LineGraph;
    stepsPerCell: PD.Numeric;
    jumpLength: PD.Numeric;
    alpha: PD.Numeric;
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
export type DirectVolumeProps = PD.Values<DirectVolumeParams>;
export declare function DirectVolumeVisual(materialId: number): VolumeVisual<DirectVolumeParams>;
export declare function DirectVolumeRepresentation(ctx: RepresentationContext, getParams: RepresentationParamsGetter<Volume, DirectVolumeParams>): VolumeRepresentation<DirectVolumeParams>;
export declare const DirectVolumeRepresentationProvider: VolumeRepresentationProvider<{
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
    ignoreLight: PD.BooleanParam;
    xrayShaded: PD.Select<boolean | "inverted">;
    controlPoints: PD.LineGraph;
    stepsPerCell: PD.Numeric;
    jumpLength: PD.Numeric;
    alpha: PD.Numeric;
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
}, "direct-volume">;
