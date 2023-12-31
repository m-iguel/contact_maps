/**
 * Copyright (c) 2018-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { ParamDefinition as PD } from '../../mol-util/param-definition';
import { Structure, Unit } from '../../mol-model/structure';
import { RepresentationProps } from '../representation';
import { Visual, VisualContext } from '../visual';
import { Geometry, GeometryUtils } from '../../mol-geo/geometry/geometry';
import { LocationIterator } from '../../mol-geo/util/location-iterator';
import { Theme } from '../../mol-theme/theme';
import { StructureGroup } from './visual/util/common';
import { RenderObjectValues } from '../../mol-gl/render-object';
import { PickingId } from '../../mol-geo/geometry/picking';
import { Loci } from '../../mol-model/loci';
import { Interval } from '../../mol-data/int';
import { VisualUpdateState } from '../util';
import { Mesh } from '../../mol-geo/geometry/mesh/mesh';
import { Spheres } from '../../mol-geo/geometry/spheres/spheres';
import { Cylinders } from '../../mol-geo/geometry/cylinders/cylinders';
import { Points } from '../../mol-geo/geometry/points/points';
import { Lines } from '../../mol-geo/geometry/lines/lines';
import { Text } from '../../mol-geo/geometry/text/text';
import { DirectVolume } from '../../mol-geo/geometry/direct-volume/direct-volume';
import { TextureMesh } from '../../mol-geo/geometry/texture-mesh/texture-mesh';
import { StructureParams } from './params';
import { WebGLContext } from '../../mol-gl/webgl/context';
export interface UnitsVisual<P extends RepresentationProps = {}> extends Visual<StructureGroup, P> {
}
interface UnitsVisualBuilder<P extends StructureParams, G extends Geometry> {
    defaultProps: PD.Values<P>;
    createGeometry(ctx: VisualContext, unit: Unit, structure: Structure, theme: Theme, props: PD.Values<P>, geometry?: G): Promise<G> | G;
    createLocationIterator(structureGroup: StructureGroup): LocationIterator;
    getLoci(pickingId: PickingId, structureGroup: StructureGroup, id: number): Loci;
    eachLocation(loci: Loci, structureGroup: StructureGroup, apply: (interval: Interval) => boolean, isMarking: boolean): boolean;
    setUpdateState(state: VisualUpdateState, newProps: PD.Values<P>, currentProps: PD.Values<P>, newTheme: Theme, currentTheme: Theme, newStructureGroup: StructureGroup, currentStructureGroup: StructureGroup): void;
    mustRecreate?: (structureGroup: StructureGroup, props: PD.Values<P>) => boolean;
    processValues?: (values: RenderObjectValues<G['kind']>, geometry: G, props: PD.Values<P>, theme: Theme, webgl?: WebGLContext) => void;
    dispose?: (geometry: G) => void;
}
interface UnitsVisualGeometryBuilder<P extends StructureParams, G extends Geometry> extends UnitsVisualBuilder<P, G> {
    geometryUtils: GeometryUtils<G>;
}
export declare function UnitsVisual<G extends Geometry, P extends StructureParams & Geometry.Params<G>>(builder: UnitsVisualGeometryBuilder<P, G>, materialId: number): UnitsVisual<P>;
export declare const UnitsMeshParams: {
    unitKinds: PD.MultiSelect<"spheres" | "gaussians" | "atomic">;
    includeParent: PD.BooleanParam;
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
export type UnitsMeshParams = typeof UnitsMeshParams;
export interface UnitsMeshVisualBuilder<P extends UnitsMeshParams> extends UnitsVisualBuilder<P, Mesh> {
}
export declare function UnitsMeshVisual<P extends UnitsMeshParams>(builder: UnitsMeshVisualBuilder<P>, materialId: number): UnitsVisual<P>;
export declare const UnitsSpheresParams: {
    unitKinds: PD.MultiSelect<"spheres" | "gaussians" | "atomic">;
    includeParent: PD.BooleanParam;
    sizeFactor: PD.Numeric;
    doubleSided: PD.BooleanParam;
    ignoreLight: PD.BooleanParam;
    xrayShaded: PD.Select<boolean | "inverted">;
    transparentBackfaces: PD.Select<string>;
    solidInterior: PD.BooleanParam;
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
export type UnitsSpheresParams = typeof UnitsSpheresParams;
export interface UnitsSpheresVisualBuilder<P extends UnitsSpheresParams> extends UnitsVisualBuilder<P, Spheres> {
}
export declare function UnitsSpheresVisual<P extends UnitsSpheresParams>(builder: UnitsSpheresVisualBuilder<P>, materialId: number): UnitsVisual<P>;
export declare const UnitsCylindersParams: {
    unitKinds: PD.MultiSelect<"spheres" | "gaussians" | "atomic">;
    includeParent: PD.BooleanParam;
    sizeFactor: PD.Numeric;
    sizeAspectRatio: PD.Numeric;
    doubleSided: PD.BooleanParam;
    ignoreLight: PD.BooleanParam;
    xrayShaded: PD.Select<boolean | "inverted">;
    transparentBackfaces: PD.Select<string>;
    solidInterior: PD.BooleanParam;
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
export type UnitsCylindersParams = typeof UnitsCylindersParams;
export interface UnitsCylindersVisualBuilder<P extends UnitsCylindersParams> extends UnitsVisualBuilder<P, Cylinders> {
}
export declare function UnitsCylindersVisual<P extends UnitsCylindersParams>(builder: UnitsCylindersVisualBuilder<P>, materialId: number): UnitsVisual<P>;
export declare const UnitsPointsParams: {
    unitKinds: PD.MultiSelect<"spheres" | "gaussians" | "atomic">;
    includeParent: PD.BooleanParam;
    sizeFactor: PD.Numeric;
    pointSizeAttenuation: PD.BooleanParam;
    pointStyle: PD.Select<"circle" | "square" | "fuzzy">;
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
export type UnitsPointsParams = typeof UnitsPointsParams;
export interface UnitsPointVisualBuilder<P extends UnitsPointsParams> extends UnitsVisualBuilder<P, Points> {
}
export declare function UnitsPointsVisual<P extends UnitsPointsParams>(builder: UnitsPointVisualBuilder<P>, materialId: number): UnitsVisual<P>;
export declare const UnitsLinesParams: {
    unitKinds: PD.MultiSelect<"spheres" | "gaussians" | "atomic">;
    includeParent: PD.BooleanParam;
    sizeFactor: PD.Numeric;
    lineSizeAttenuation: PD.BooleanParam;
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
export type UnitsLinesParams = typeof UnitsLinesParams;
export interface UnitsLinesVisualBuilder<P extends UnitsLinesParams> extends UnitsVisualBuilder<P, Lines> {
}
export declare function UnitsLinesVisual<P extends UnitsLinesParams>(builder: UnitsLinesVisualBuilder<P>, materialId: number): UnitsVisual<P>;
export declare const UnitsTextParams: {
    unitKinds: PD.MultiSelect<"spheres" | "gaussians" | "atomic">;
    includeParent: PD.BooleanParam;
    sizeFactor: PD.Numeric;
    borderWidth: PD.Numeric;
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
    fontFamily: PD.Select<import("../../mol-geo/geometry/text/font-atlas").FontFamily>;
    fontQuality: PD.Select<number>;
    fontStyle: PD.Select<import("../../mol-geo/geometry/text/font-atlas").FontStyle>;
    fontVariant: PD.Select<import("../../mol-geo/geometry/text/font-atlas").FontVariant>;
    fontWeight: PD.Select<import("../../mol-geo/geometry/text/font-atlas").FontWeight>;
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
export type UnitsTextParams = typeof UnitsTextParams;
export interface UnitsTextVisualBuilder<P extends UnitsTextParams> extends UnitsVisualBuilder<P, Text> {
}
export declare function UnitsTextVisual<P extends UnitsTextParams>(builder: UnitsTextVisualBuilder<P>, materialId: number): UnitsVisual<P>;
export declare const UnitsDirectVolumeParams: {
    unitKinds: PD.MultiSelect<"spheres" | "gaussians" | "atomic">;
    includeParent: PD.BooleanParam;
    ignoreLight: PD.BooleanParam;
    xrayShaded: PD.Select<boolean | "inverted">;
    controlPoints: PD.LineGraph;
    stepsPerCell: PD.Numeric;
    jumpLength: PD.Numeric;
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
export type UnitsDirectVolumeParams = typeof UnitsDirectVolumeParams;
export interface UnitsDirectVolumeVisualBuilder<P extends UnitsDirectVolumeParams> extends UnitsVisualBuilder<P, DirectVolume> {
}
export declare function UnitsDirectVolumeVisual<P extends UnitsDirectVolumeParams>(builder: UnitsDirectVolumeVisualBuilder<P>, materialId: number): UnitsVisual<P>;
export declare const UnitsTextureMeshParams: {
    unitKinds: PD.MultiSelect<"spheres" | "gaussians" | "atomic">;
    includeParent: PD.BooleanParam;
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
export type UnitsTextureMeshParams = typeof UnitsTextureMeshParams;
export interface UnitsTextureMeshVisualBuilder<P extends UnitsTextureMeshParams> extends UnitsVisualBuilder<P, TextureMesh> {
}
export declare function UnitsTextureMeshVisual<P extends UnitsTextureMeshParams>(builder: UnitsTextureMeshVisualBuilder<P>, materialId: number): UnitsVisual<P>;
export {};
