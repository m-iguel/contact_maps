/**
 * Copyright (c) 2018-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { __assign } from "tslib";
import { createRenderable } from '../renderable';
import { createGraphicsRenderItem } from '../webgl/render-item';
import { AttributeSpec, UniformSpec, GlobalUniformSchema, InternalSchema, TextureSpec, ElementsSpec, DefineSpec, GlobalTextureSchema, BaseSchema } from './schema';
import { DirectVolumeShaderCode } from '../shader-code';
import { ValueCell } from '../../mol-util';
export var DirectVolumeSchema = __assign(__assign({}, BaseSchema), { aPosition: AttributeSpec('float32', 3, 0), elements: ElementsSpec('uint32'), uBboxMin: UniformSpec('v3'), uBboxMax: UniformSpec('v3'), uBboxSize: UniformSpec('v3'), uMaxSteps: UniformSpec('i'), uStepScale: UniformSpec('f'), uJumpLength: UniformSpec('f'), uTransform: UniformSpec('m4'), uGridDim: UniformSpec('v3'), tTransferTex: TextureSpec('image-uint8', 'alpha', 'ubyte', 'linear'), uTransferScale: UniformSpec('f', 'material'), dGridTexType: DefineSpec('string', ['2d', '3d']), uGridTexDim: UniformSpec('v3'), tGridTex: TextureSpec('texture', 'rgba', 'ubyte', 'linear'), uGridStats: UniformSpec('v4'), uCellDim: UniformSpec('v3'), uCartnToUnit: UniformSpec('m4'), uUnitToCartn: UniformSpec('m4'), dPackedGroup: DefineSpec('boolean'), dAxisOrder: DefineSpec('string', ['012', '021', '102', '120', '201', '210']), dIgnoreLight: DefineSpec('boolean'), dXrayShaded: DefineSpec('string', ['off', 'on', 'inverted']) });
export function DirectVolumeRenderable(ctx, id, values, state, materialId, variants) {
    var schema = __assign(__assign(__assign(__assign({}, GlobalUniformSchema), GlobalTextureSchema), InternalSchema), DirectVolumeSchema);
    if (!ctx.isWebGL2) {
        // workaround for webgl1 limitation that loop counters need to be `const`
        schema.uMaxSteps = DefineSpec('number');
    }
    var internalValues = {
        uObjectId: ValueCell.create(id),
    };
    var shaderCode = DirectVolumeShaderCode;
    var renderItem = createGraphicsRenderItem(ctx, 'triangles', shaderCode, schema, __assign(__assign({}, values), internalValues), materialId, variants);
    return createRenderable(renderItem, values, state);
}
