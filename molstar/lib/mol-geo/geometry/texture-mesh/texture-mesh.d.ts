/**
 * Copyright (c) 2019-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { ValueCell } from '../../../mol-util';
import { Sphere3D } from '../../../mol-math/geometry';
import { ParamDefinition as PD } from '../../../mol-util/param-definition';
import { GeometryUtils } from '../geometry';
import { Texture } from '../../../mol-gl/webgl/texture';
import { Vec2 } from '../../../mol-math/linear-algebra';
import { WebGLContext } from '../../../mol-gl/webgl/context';
export interface TextureMesh {
    readonly kind: 'texture-mesh';
    /** Number of vertices in the texture-mesh */
    vertexCount: number;
    /** Number of groups in the texture-mesh */
    groupCount: number;
    readonly geoTextureDim: ValueCell<Vec2>;
    readonly vertexTexture: ValueCell<Texture>;
    readonly groupTexture: ValueCell<Texture>;
    readonly normalTexture: ValueCell<Texture>;
    readonly varyingGroup: ValueCell<boolean>;
    readonly doubleBuffer: TextureMesh.DoubleBuffer;
    readonly boundingSphere: Sphere3D;
    readonly meta: {
        webgl?: WebGLContext;
        [k: string]: unknown;
    };
}
export declare namespace TextureMesh {
    class DoubleBuffer {
        private index;
        private textures;
        get(): {
            vertex: Texture;
            group: Texture;
            normal: Texture;
        } | undefined;
        set(vertex: Texture, group: Texture, normal: Texture): void;
        destroy(): void;
    }
    function create(vertexCount: number, groupCount: number, vertexTexture: Texture, groupTexture: Texture, normalTexture: Texture, boundingSphere: Sphere3D, textureMesh?: TextureMesh): TextureMesh;
    function createEmpty(textureMesh?: TextureMesh): TextureMesh;
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
    const Utils: GeometryUtils<TextureMesh, Params>;
}
