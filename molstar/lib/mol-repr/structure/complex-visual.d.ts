/**
 * Copyright (c) 2018-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { ParamDefinition as PD } from '../../mol-util/param-definition';
import { Visual, VisualContext } from '../visual';
import { Structure } from '../../mol-model/structure';
import { Geometry, GeometryUtils } from '../../mol-geo/geometry/geometry';
import { LocationIterator } from '../../mol-geo/util/location-iterator';
import { Theme } from '../../mol-theme/theme';
import { RenderObjectValues } from '../../mol-gl/render-object';
import { PickingId } from '../../mol-geo/geometry/picking';
import { Loci } from '../../mol-model/loci';
import { Interval } from '../../mol-data/int';
import { VisualUpdateState } from '../util';
import { Mesh } from '../../mol-geo/geometry/mesh/mesh';
import { Cylinders } from '../../mol-geo/geometry/cylinders/cylinders';
import { Lines } from '../../mol-geo/geometry/lines/lines';
import { Text } from '../../mol-geo/geometry/text/text';
import { DirectVolume } from '../../mol-geo/geometry/direct-volume/direct-volume';
import { StructureParams } from './params';
import { TextureMesh } from '../../mol-geo/geometry/texture-mesh/texture-mesh';
import { WebGLContext } from '../../mol-gl/webgl/context';
export interface ComplexVisual<P extends StructureParams> extends Visual<Structure, P> {
}
interface ComplexVisualBuilder<P extends StructureParams, G extends Geometry> {
    defaultProps: PD.Values<P>;
    createGeometry(ctx: VisualContext, structure: Structure, theme: Theme, props: PD.Values<P>, geometry?: G): Promise<G> | G;
    createLocationIterator(structure: Structure): LocationIterator;
    getLoci(pickingId: PickingId, structure: Structure, id: number): Loci;
    eachLocation(loci: Loci, structure: Structure, apply: (interval: Interval) => boolean, isMarking: boolean): boolean;
    setUpdateState(state: VisualUpdateState, newProps: PD.Values<P>, currentProps: PD.Values<P>, newTheme: Theme, currentTheme: Theme, newStructure: Structure, currentStructure: Structure): void;
    mustRecreate?: (structure: Structure, props: PD.Values<P>) => boolean;
    processValues?: (values: RenderObjectValues<G['kind']>, geometry: G, props: PD.Values<P>, theme: Theme, webgl?: WebGLContext) => void;
    dispose?: (geometry: G) => void;
}
interface ComplexVisualGeometryBuilder<P extends StructureParams, G extends Geometry> extends ComplexVisualBuilder<P, G> {
    geometryUtils: GeometryUtils<G>;
}
export declare function ComplexVisual<G extends Geometry, P extends StructureParams & Geometry.Params<G>>(builder: ComplexVisualGeometryBuilder<P, G>, materialId: number): ComplexVisual<P>;
export declare const ComplexMeshParams: {
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
export type ComplexMeshParams = typeof ComplexMeshParams;
export interface ComplexMeshVisualBuilder<P extends ComplexMeshParams> extends ComplexVisualBuilder<P, Mesh> {
}
export declare function ComplexMeshVisual<P extends ComplexMeshParams>(builder: ComplexMeshVisualBuilder<P>, materialId: number): ComplexVisual<P>;
export declare const ComplexCylindersParams: {
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
export type ComplexCylindersParams = typeof ComplexCylindersParams;
export interface ComplexCylindersVisualBuilder<P extends ComplexCylindersParams> extends ComplexVisualBuilder<P, Cylinders> {
}
export declare function ComplexCylindersVisual<P extends ComplexCylindersParams>(builder: ComplexCylindersVisualBuilder<P>, materialId: number): ComplexVisual<P>;
export declare const ComplexLinesParams: {
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
export type ComplexLinesParams = typeof ComplexLinesParams;
export interface ComplexLinesVisualBuilder<P extends ComplexLinesParams> extends ComplexVisualBuilder<P, Lines> {
}
export declare function ComplexLinesVisual<P extends ComplexLinesParams>(builder: ComplexLinesVisualBuilder<P>, materialId: number): ComplexVisual<P>;
export declare const ComplexTextParams: {
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
export type ComplexTextParams = typeof ComplexTextParams;
export interface ComplexTextVisualBuilder<P extends ComplexTextParams> extends ComplexVisualBuilder<P, Text> {
}
export declare function ComplexTextVisual<P extends ComplexTextParams>(builder: ComplexTextVisualBuilder<P>, materialId: number): ComplexVisual<P>;
export declare const ComplexDirectVolumeParams: {
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
export type ComplexDirectVolumeParams = typeof ComplexDirectVolumeParams;
export interface ComplexDirectVolumeVisualBuilder<P extends ComplexDirectVolumeParams> extends ComplexVisualBuilder<P, DirectVolume> {
}
export declare function ComplexDirectVolumeVisual<P extends ComplexDirectVolumeParams>(builder: ComplexDirectVolumeVisualBuilder<P>, materialId: number): ComplexVisual<P>;
export declare const ComplexTextureMeshParams: {
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
export type ComplexTextureMeshParams = typeof ComplexTextureMeshParams;
export interface ComplexTextureMeshVisualBuilder<P extends ComplexTextureMeshParams> extends ComplexVisualBuilder<P, TextureMesh> {
}
export declare function ComplexTextureMeshVisual<P extends ComplexTextureMeshParams>(builder: ComplexTextureMeshVisualBuilder<P>, materialId: number): ComplexVisual<P>;
export {};
