/**
 * Copyright (c) 2019-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { __assign } from "tslib";
import { createRenderable } from '../renderable';
import { createGraphicsRenderItem } from '../webgl/render-item';
import { GlobalUniformSchema, BaseSchema, DefineSpec, InternalSchema, UniformSpec, TextureSpec, GlobalTextureSchema, ValueSpec } from './schema';
import { MeshShaderCode } from '../shader-code';
import { ValueCell } from '../../mol-util';
export var TextureMeshSchema = __assign(__assign({}, BaseSchema), { uGeoTexDim: UniformSpec('v2', 'buffered'), tPosition: TextureSpec('texture', 'rgb', 'float', 'nearest'), tGroup: TextureSpec('texture', 'alpha', 'float', 'nearest'), tNormal: TextureSpec('texture', 'rgb', 'float', 'nearest'), dVaryingGroup: DefineSpec('boolean'), dFlatShaded: DefineSpec('boolean'), uDoubleSided: UniformSpec('b', 'material'), dFlipSided: DefineSpec('boolean'), dIgnoreLight: DefineSpec('boolean'), dXrayShaded: DefineSpec('string', ['off', 'on', 'inverted']), dTransparentBackfaces: DefineSpec('string', ['off', 'on', 'opaque']), uBumpFrequency: UniformSpec('f', 'material'), uBumpAmplitude: UniformSpec('f', 'material'), meta: ValueSpec('unknown') });
export function TextureMeshRenderable(ctx, id, values, state, materialId, variants) {
    var schema = __assign(__assign(__assign(__assign({}, GlobalUniformSchema), GlobalTextureSchema), InternalSchema), TextureMeshSchema);
    var internalValues = {
        uObjectId: ValueCell.create(id),
    };
    var shaderCode = MeshShaderCode;
    var renderItem = createGraphicsRenderItem(ctx, 'triangles', shaderCode, schema, __assign(__assign({}, values), internalValues), materialId, variants);
    return createRenderable(renderItem, values, state);
}
