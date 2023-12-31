/**
 * Copyright (c) 2018-2021 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { Renderable, RenderableState } from '../renderable';
import { WebGLContext } from '../webgl/context';
import { GraphicsRenderVariant } from '../webgl/render-item';
import { AttributeSpec, DefineSpec, Values } from './schema';
export declare const PointsSchema: {
    aGroup: AttributeSpec<"float32">;
    aPosition: AttributeSpec<"float32">;
    dPointSizeAttenuation: DefineSpec<"boolean">;
    dPointStyle: DefineSpec<"string">;
    uSize: import("./schema").UniformSpec<"f">;
    uSizeTexDim: import("./schema").UniformSpec<"v2">;
    tSize: import("./schema").TextureSpec<"image-uint8">;
    dSizeType: DefineSpec<"string">;
    uSizeFactor: import("./schema").UniformSpec<"f">;
    dLightCount: DefineSpec<"number">;
    dColorMarker: DefineSpec<"boolean">;
    dClipObjectCount: DefineSpec<"number">;
    dClipVariant: DefineSpec<"string">;
    uClipObjectType: import("./schema").UniformSpec<"i[]">;
    uClipObjectInvert: import("./schema").UniformSpec<"b[]">;
    uClipObjectPosition: import("./schema").UniformSpec<"v3[]">;
    uClipObjectRotation: import("./schema").UniformSpec<"v4[]">;
    uClipObjectScale: import("./schema").UniformSpec<"v3[]">;
    aInstance: AttributeSpec<"float32">;
    aTransform: AttributeSpec<"float32">;
    uAlpha: import("./schema").UniformSpec<"f">;
    uMetalness: import("./schema").UniformSpec<"f">;
    uRoughness: import("./schema").UniformSpec<"f">;
    uBumpiness: import("./schema").UniformSpec<"f">;
    uVertexCount: import("./schema").UniformSpec<"i">;
    uInstanceCount: import("./schema").UniformSpec<"i">;
    uGroupCount: import("./schema").UniformSpec<"i">;
    uInvariantBoundingSphere: import("./schema").UniformSpec<"v4">;
    drawCount: import("./schema").ValueSpec<"number">;
    instanceCount: import("./schema").ValueSpec<"number">;
    alpha: import("./schema").ValueSpec<"number">;
    matrix: import("./schema").ValueSpec<"m4">;
    transform: import("./schema").ValueSpec<"float32">;
    extraTransform: import("./schema").ValueSpec<"float32">;
    hasReflection: import("./schema").ValueSpec<"boolean">;
    instanceGranularity: import("./schema").ValueSpec<"boolean">;
    boundingSphere: import("./schema").ValueSpec<"sphere">;
    invariantBoundingSphere: import("./schema").ValueSpec<"sphere">;
    uClippingTexDim: import("./schema").UniformSpec<"v2">;
    tClipping: import("./schema").TextureSpec<"image-uint8">;
    dClipping: DefineSpec<"boolean">;
    dClippingType: DefineSpec<"string">;
    uSubstanceTexDim: import("./schema").UniformSpec<"v2">;
    tSubstance: import("./schema").TextureSpec<"image-uint8">;
    dSubstance: DefineSpec<"boolean">;
    uSubstanceGridDim: import("./schema").UniformSpec<"v3">;
    uSubstanceGridTransform: import("./schema").UniformSpec<"v4">;
    tSubstanceGrid: import("./schema").TextureSpec<"texture">;
    dSubstanceType: DefineSpec<"string">;
    uSubstanceStrength: import("./schema").UniformSpec<"f">;
    uTransparencyTexDim: import("./schema").UniformSpec<"v2">;
    tTransparency: import("./schema").TextureSpec<"image-uint8">;
    dTransparency: DefineSpec<"boolean">;
    transparencyAverage: import("./schema").ValueSpec<"number">;
    uTransparencyGridDim: import("./schema").UniformSpec<"v3">;
    uTransparencyGridTransform: import("./schema").UniformSpec<"v4">;
    tTransparencyGrid: import("./schema").TextureSpec<"texture">;
    dTransparencyType: DefineSpec<"string">;
    uTransparencyStrength: import("./schema").UniformSpec<"f">;
    uOverpaintTexDim: import("./schema").UniformSpec<"v2">;
    tOverpaint: import("./schema").TextureSpec<"image-uint8">;
    dOverpaint: DefineSpec<"boolean">;
    uOverpaintGridDim: import("./schema").UniformSpec<"v3">;
    uOverpaintGridTransform: import("./schema").UniformSpec<"v4">;
    tOverpaintGrid: import("./schema").TextureSpec<"texture">;
    dOverpaintType: DefineSpec<"string">;
    uOverpaintStrength: import("./schema").UniformSpec<"f">;
    uMarker: import("./schema").UniformSpec<"f">;
    uMarkerTexDim: import("./schema").UniformSpec<"v2">;
    tMarker: import("./schema").TextureSpec<"image-uint8">;
    markerAverage: import("./schema").ValueSpec<"number">;
    markerStatus: import("./schema").ValueSpec<"number">;
    dMarkerType: DefineSpec<"string">;
    uColor: import("./schema").UniformSpec<"v3">;
    uColorTexDim: import("./schema").UniformSpec<"v2">;
    uColorGridDim: import("./schema").UniformSpec<"v3">;
    uColorGridTransform: import("./schema").UniformSpec<"v4">;
    tColor: import("./schema").TextureSpec<"image-uint8">;
    tPalette: import("./schema").TextureSpec<"image-uint8">;
    tColorGrid: import("./schema").TextureSpec<"texture">;
    dColorType: DefineSpec<"string">;
    dUsePalette: DefineSpec<"boolean">;
    dGeometryType: DefineSpec<"string">;
};
export type PointsSchema = typeof PointsSchema;
export type PointsValues = Values<PointsSchema>;
export declare function PointsRenderable(ctx: WebGLContext, id: number, values: PointsValues, state: RenderableState, materialId: number, variants: GraphicsRenderVariant[]): Renderable<PointsValues>;
