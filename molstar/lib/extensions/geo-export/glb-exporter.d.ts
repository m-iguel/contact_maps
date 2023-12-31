/**
 * Copyright (c) 2021-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Sukolsak Sakshuwong <sukolsak@stanford.edu>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { Box3D } from '../../mol-math/geometry';
import { RuntimeContext } from '../../mol-task';
import { MeshExporter, AddMeshInput } from './mesh-exporter';
export type GlbData = {
    glb: Uint8Array;
};
export declare class GlbExporter extends MeshExporter<GlbData> {
    readonly fileExtension = "glb";
    private nodes;
    private meshes;
    private materials;
    private materialMap;
    private accessors;
    private bufferViews;
    private binaryBuffer;
    private byteOffset;
    private centerTransform;
    private static vec3MinMax;
    private addBuffer;
    private addGeometryBuffers;
    private addColorBuffer;
    private addMaterial;
    protected addMeshWithColors(input: AddMeshInput): Promise<void>;
    getData(): Promise<{
        glb: Uint8Array;
    }>;
    getBlob(ctx: RuntimeContext): Promise<Blob>;
    constructor(boundingBox: Box3D);
}
