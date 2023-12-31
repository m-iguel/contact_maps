/**
 * Copyright (c) 2018-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { Renderable, RenderableState } from '../renderable';
import { WebGLContext } from '../webgl/context';
import { GraphicsRenderVariant } from '../webgl/render-item';
import { AttributeSpec, Values, UniformSpec, TextureSpec, ElementsSpec, DefineSpec } from './schema';
export declare const DirectVolumeSchema: {
    aPosition: AttributeSpec<"float32">;
    elements: ElementsSpec<"uint32">;
    uBboxMin: UniformSpec<"v3">;
    uBboxMax: UniformSpec<"v3">;
    uBboxSize: UniformSpec<"v3">;
    uMaxSteps: UniformSpec<"i">;
    uStepScale: UniformSpec<"f">;
    uJumpLength: UniformSpec<"f">;
    uTransform: UniformSpec<"m4">;
    uGridDim: UniformSpec<"v3">;
    tTransferTex: TextureSpec<"image-uint8">;
    uTransferScale: UniformSpec<"f">;
    dGridTexType: DefineSpec<"string">;
    uGridTexDim: UniformSpec<"v3">;
    tGridTex: TextureSpec<"texture">;
    uGridStats: UniformSpec<"v4">;
    uCellDim: UniformSpec<"v3">;
    uCartnToUnit: UniformSpec<"m4">;
    uUnitToCartn: UniformSpec<"m4">;
    dPackedGroup: DefineSpec<"boolean">;
    dAxisOrder: DefineSpec<"string">;
    dIgnoreLight: DefineSpec<"boolean">;
    dXrayShaded: DefineSpec<"string">;
    dLightCount: DefineSpec<"number">;
    dColorMarker: DefineSpec<"boolean">;
    dClipObjectCount: DefineSpec<"number">;
    dClipVariant: DefineSpec<"string">;
    uClipObjectType: UniformSpec<"i[]">;
    uClipObjectInvert: UniformSpec<"b[]">;
    uClipObjectPosition: UniformSpec<"v3[]">;
    uClipObjectRotation: UniformSpec<"v4[]">;
    uClipObjectScale: UniformSpec<"v3[]">;
    aInstance: AttributeSpec<"float32">;
    aTransform: AttributeSpec<"float32">;
    uAlpha: UniformSpec<"f">;
    uMetalness: UniformSpec<"f">;
    uRoughness: UniformSpec<"f">;
    uBumpiness: UniformSpec<"f">;
    uVertexCount: UniformSpec<"i">;
    uInstanceCount: UniformSpec<"i">;
    uGroupCount: UniformSpec<"i">;
    uInvariantBoundingSphere: UniformSpec<"v4">;
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
    uClippingTexDim: UniformSpec<"v2">;
    tClipping: TextureSpec<"image-uint8">;
    dClipping: DefineSpec<"boolean">;
    dClippingType: DefineSpec<"string">;
    uSubstanceTexDim: UniformSpec<"v2">;
    tSubstance: TextureSpec<"image-uint8">;
    dSubstance: DefineSpec<"boolean">;
    uSubstanceGridDim: UniformSpec<"v3">;
    uSubstanceGridTransform: UniformSpec<"v4">;
    tSubstanceGrid: TextureSpec<"texture">;
    dSubstanceType: DefineSpec<"string">;
    uSubstanceStrength: UniformSpec<"f">;
    uTransparencyTexDim: UniformSpec<"v2">;
    tTransparency: TextureSpec<"image-uint8">;
    dTransparency: DefineSpec<"boolean">;
    transparencyAverage: import("./schema").ValueSpec<"number">;
    uTransparencyGridDim: UniformSpec<"v3">;
    uTransparencyGridTransform: UniformSpec<"v4">;
    tTransparencyGrid: TextureSpec<"texture">;
    dTransparencyType: DefineSpec<"string">;
    uTransparencyStrength: UniformSpec<"f">;
    uOverpaintTexDim: UniformSpec<"v2">;
    tOverpaint: TextureSpec<"image-uint8">;
    dOverpaint: DefineSpec<"boolean">;
    uOverpaintGridDim: UniformSpec<"v3">;
    uOverpaintGridTransform: UniformSpec<"v4">;
    tOverpaintGrid: TextureSpec<"texture">;
    dOverpaintType: DefineSpec<"string">;
    uOverpaintStrength: UniformSpec<"f">;
    uMarker: UniformSpec<"f">;
    uMarkerTexDim: UniformSpec<"v2">;
    tMarker: TextureSpec<"image-uint8">;
    markerAverage: import("./schema").ValueSpec<"number">;
    markerStatus: import("./schema").ValueSpec<"number">;
    dMarkerType: DefineSpec<"string">;
    uColor: UniformSpec<"v3">;
    uColorTexDim: UniformSpec<"v2">;
    uColorGridDim: UniformSpec<"v3">;
    uColorGridTransform: UniformSpec<"v4">;
    tColor: TextureSpec<"image-uint8">;
    tPalette: TextureSpec<"image-uint8">;
    tColorGrid: TextureSpec<"texture">;
    dColorType: DefineSpec<"string">;
    dUsePalette: DefineSpec<"boolean">;
    dGeometryType: DefineSpec<"string">;
};
export type DirectVolumeSchema = typeof DirectVolumeSchema;
export type DirectVolumeValues = Values<DirectVolumeSchema>;
export declare function DirectVolumeRenderable(ctx: WebGLContext, id: number, values: DirectVolumeValues, state: RenderableState, materialId: number, variants: GraphicsRenderVariant[]): Renderable<DirectVolumeValues>;
