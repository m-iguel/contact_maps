/**
 * Copyright (c) 2018-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { ValueCell } from '../../../mol-util';
import { Mat4 } from '../../../mol-math/linear-algebra';
import { GroupMapping } from '../../util';
import { GeometryUtils } from '../geometry';
import { Mesh } from '../mesh/mesh';
import { ParamDefinition as PD } from '../../../mol-util/param-definition';
import { Sphere3D } from '../../../mol-math/geometry';
/** Wide line */
export interface Lines {
    readonly kind: 'lines';
    /** Number of lines */
    lineCount: number;
    /** Mapping buffer as array of xy values wrapped in a value cell */
    readonly mappingBuffer: ValueCell<Float32Array>;
    /** Index buffer as array of vertex index triplets wrapped in a value cell */
    readonly indexBuffer: ValueCell<Uint32Array>;
    /** Group buffer as array of group ids for each vertex wrapped in a value cell */
    readonly groupBuffer: ValueCell<Float32Array>;
    /** Line start buffer as array of xyz values wrapped in a value cell */
    readonly startBuffer: ValueCell<Float32Array>;
    /** Line end buffer as array of xyz values wrapped in a value cell */
    readonly endBuffer: ValueCell<Float32Array>;
    /** Bounding sphere of the lines */
    readonly boundingSphere: Sphere3D;
    /** Maps group ids to line indices */
    readonly groupMapping: GroupMapping;
    setBoundingSphere(boundingSphere: Sphere3D): void;
}
export declare namespace Lines {
    function create(mappings: Float32Array, indices: Uint32Array, groups: Float32Array, starts: Float32Array, ends: Float32Array, lineCount: number, lines?: Lines): Lines;
    function createEmpty(lines?: Lines): Lines;
    function fromMesh(mesh: Mesh, lines?: Lines): Lines;
    function transform(lines: Lines, t: Mat4): void;
    const Params: {
        sizeFactor: PD.Numeric;
        lineSizeAttenuation: PD.BooleanParam;
        alpha: PD.Numeric;
        quality: PD.Select<"auto" | "medium" | "high" | "low" | "custom" | "highest" | "higher" | "lower" | "lowest">;
        material: PD.Group<PD.Normalize<{
            metalness: number;
            roughness: number;
            /** Number of lines */
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
    const Utils: GeometryUtils<Lines, Params>;
}
