/**
 * Copyright (c) 2019-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { __assign } from "tslib";
import { createRenderable } from '../renderable';
import { createGraphicsRenderItem } from '../webgl/render-item';
import { GlobalUniformSchema, BaseSchema, AttributeSpec, InternalSchema, SizeSchema, ElementsSpec, ValueSpec, DefineSpec, GlobalTextureSchema, UniformSpec } from './schema';
import { SpheresShaderCode } from '../shader-code';
import { ValueCell } from '../../mol-util';
export var SpheresSchema = __assign(__assign(__assign({}, BaseSchema), SizeSchema), { aGroup: AttributeSpec('float32', 1, 0), aPosition: AttributeSpec('float32', 3, 0), aMapping: AttributeSpec('float32', 2, 0), elements: ElementsSpec('uint32'), padding: ValueSpec('number'), uDoubleSided: UniformSpec('b', 'material'), dIgnoreLight: DefineSpec('boolean'), dXrayShaded: DefineSpec('string', ['off', 'on', 'inverted']), dTransparentBackfaces: DefineSpec('string', ['off', 'on', 'opaque']), dSolidInterior: DefineSpec('boolean'), uBumpFrequency: UniformSpec('f', 'material'), uBumpAmplitude: UniformSpec('f', 'material') });
export function SpheresRenderable(ctx, id, values, state, materialId, variants) {
    var schema = __assign(__assign(__assign(__assign({}, GlobalUniformSchema), GlobalTextureSchema), InternalSchema), SpheresSchema);
    var internalValues = {
        uObjectId: ValueCell.create(id),
    };
    var shaderCode = SpheresShaderCode;
    var renderItem = createGraphicsRenderItem(ctx, 'triangles', shaderCode, schema, __assign(__assign({}, values), internalValues), materialId, variants);
    return createRenderable(renderItem, values, state);
}
