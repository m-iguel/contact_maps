/**
 * Copyright (c) 2018-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { __assign } from "tslib";
import { createRenderable } from '../renderable';
import { createGraphicsRenderItem } from '../webgl/render-item';
import { GlobalUniformSchema, BaseSchema, AttributeSpec, ElementsSpec, DefineSpec, InternalSchema, GlobalTextureSchema, ValueSpec, UniformSpec } from './schema';
import { MeshShaderCode } from '../shader-code';
import { ValueCell } from '../../mol-util';
export var MeshSchema = __assign(__assign({}, BaseSchema), { aGroup: AttributeSpec('float32', 1, 0), aPosition: AttributeSpec('float32', 3, 0), aNormal: AttributeSpec('float32', 3, 0), elements: ElementsSpec('uint32'), dVaryingGroup: DefineSpec('boolean'), dFlatShaded: DefineSpec('boolean'), uDoubleSided: UniformSpec('b', 'material'), dFlipSided: DefineSpec('boolean'), dIgnoreLight: DefineSpec('boolean'), dXrayShaded: DefineSpec('string', ['off', 'on', 'inverted']), dTransparentBackfaces: DefineSpec('string', ['off', 'on', 'opaque']), uBumpFrequency: UniformSpec('f', 'material'), uBumpAmplitude: UniformSpec('f', 'material'), meta: ValueSpec('unknown') });
export function MeshRenderable(ctx, id, values, state, materialId, variants) {
    var schema = __assign(__assign(__assign(__assign({}, GlobalUniformSchema), GlobalTextureSchema), InternalSchema), MeshSchema);
    var internalValues = {
        uObjectId: ValueCell.create(id),
    };
    var shaderCode = MeshShaderCode;
    var renderItem = createGraphicsRenderItem(ctx, 'triangles', shaderCode, schema, __assign(__assign({}, values), internalValues), materialId, variants);
    return createRenderable(renderItem, values, state);
}
