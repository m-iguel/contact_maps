/**
 * Copyright (c) 2018-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { ValueCell } from '../../../mol-util';
import { Mat4 } from '../../../mol-math/linear-algebra';
import { Sphere3D } from '../../../mol-math/geometry';
import { GroupMapping } from '../../util';
import { GeometryUtils } from '../geometry';
import { ParamDefinition as PD } from '../../../mol-util/param-definition';
import { MeshValues } from '../../../mol-gl/renderable/mesh';
export interface Mesh {
    readonly kind: 'mesh';
    /** Number of vertices in the mesh */
    vertexCount: number;
    /** Number of triangles in the mesh */
    triangleCount: number;
    /** Vertex buffer as array of xyz values wrapped in a value cell */
    readonly vertexBuffer: ValueCell<Float32Array>;
    /** Index buffer as array of vertex index triplets wrapped in a value cell */
    readonly indexBuffer: ValueCell<Uint32Array>;
    /** Normal buffer as array of xyz values for each vertex wrapped in a value cell */
    readonly normalBuffer: ValueCell<Float32Array>;
    /** Group buffer as array of group ids for each vertex wrapped in a value cell */
    readonly groupBuffer: ValueCell<Float32Array>;
    /** Indicates that group may vary within a triangle, wrapped in a value cell */
    readonly varyingGroup: ValueCell<boolean>;
    /** Bounding sphere of the mesh */
    readonly boundingSphere: Sphere3D;
    /** Maps group ids to vertex indices */
    readonly groupMapping: GroupMapping;
    setBoundingSphere(boundingSphere: Sphere3D): void;
    readonly meta: {
        [k: string]: unknown;
    };
}
export declare namespace Mesh {
    function create(vertices: Float32Array, indices: Uint32Array, normals: Float32Array, groups: Float32Array, vertexCount: number, triangleCount: number, mesh?: Mesh): Mesh;
    function createEmpty(mesh?: Mesh): Mesh;
    function computeNormals(mesh: Mesh): void;
    function checkForDuplicateVertices(mesh: Mesh, fractionDigits?: number): number;
    function transform(mesh: Mesh, t: Mat4): void;
    type OriginalData = {
        indexBuffer: Uint32Array;
        vertexCount: number;
        triangleCount: number;
    };
    /** Meshes may contain some original data in case any processing was done. */
    function getOriginalData(x: Mesh | MeshValues): OriginalData | undefined;
    /**
     * Ensure that each vertices of each triangle have the same group id.
     * Note that normals are copied over and can't be re-created from the new mesh.
     */
    function uniformTriangleGroup(mesh: Mesh, splitTriangles?: boolean): Mesh;
    function smoothEdges(mesh: Mesh, options: {
        iterations: number;
        maxNewEdgeLength: number;
    }): Mesh;
    const Params: {
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
    type Params = typeof Params;
    const Utils: GeometryUtils<Mesh, Params>;
}
