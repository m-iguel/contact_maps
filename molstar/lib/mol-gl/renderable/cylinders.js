/**
 * Copyright (c) 2020-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { __assign } from "tslib";
import { createRenderable } from '../renderable';
import { createGraphicsRenderItem } from '../webgl/render-item';
import { GlobalUniformSchema, BaseSchema, AttributeSpec, InternalSchema, SizeSchema, ElementsSpec, ValueSpec, DefineSpec, GlobalTextureSchema, UniformSpec } from './schema';
import { CylindersShaderCode } from '../shader-code';
import { ValueCell } from '../../mol-util';
export var CylindersSchema = __assign(__assign(__assign({}, BaseSchema), SizeSchema), { aGroup: AttributeSpec('float32', 1, 0), aStart: AttributeSpec('float32', 3, 0), aEnd: AttributeSpec('float32', 3, 0), aMapping: AttributeSpec('float32', 3, 0), aScale: AttributeSpec('float32', 1, 0), aCap: AttributeSpec('float32', 1, 0), elements: ElementsSpec('uint32'), padding: ValueSpec('number'), uDoubleSided: UniformSpec('b', 'material'), dIgnoreLight: DefineSpec('boolean'), dXrayShaded: DefineSpec('string', ['off', 'on', 'inverted']), dTransparentBackfaces: DefineSpec('string', ['off', 'on', 'opaque']), dSolidInterior: DefineSpec('boolean'), uBumpFrequency: UniformSpec('f', 'material'), uBumpAmplitude: UniformSpec('f', 'material') });
export function CylindersRenderable(ctx, id, values, state, materialId, variants) {
    var schema = __assign(__assign(__assign(__assign({}, GlobalUniformSchema), GlobalTextureSchema), InternalSchema), CylindersSchema);
    var internalValues = {
        uObjectId: ValueCell.create(id),
    };
    var shaderCode = CylindersShaderCode;
    var renderItem = createGraphicsRenderItem(ctx, 'triangles', shaderCode, schema, __assign(__assign({}, values), internalValues), materialId, variants);
    return createRenderable(renderItem, values, state);
}
