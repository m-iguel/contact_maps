/**
 * Copyright (c) 2021 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { __awaiter, __generator } from "tslib";
import { createRenderObject } from '../render-object';
import { Scene } from '../scene';
import { getGLContext, tryGetGLContext } from './gl';
import { setDebugMode } from '../../mol-util/debug';
import { ColorNames } from '../../mol-util/color/names';
import { ParamDefinition as PD } from '../../mol-util/param-definition';
import { Text } from '../../mol-geo/geometry/text/text';
export function createText() {
    var text = Text.createEmpty();
    var props = PD.getDefaultValues(Text.Params);
    var values = Text.Utils.createValuesSimple(text, props, ColorNames.orange, 1);
    var state = Text.Utils.createRenderableState(props);
    return createRenderObject('text', values, state, -1);
}
describe('text', function () {
    var ctx = tryGetGLContext(32, 32);
    (ctx ? it : it.skip)('basic', function () { return __awaiter(void 0, void 0, void 0, function () {
        var ctx, scene, text;
        return __generator(this, function (_a) {
            ctx = getGLContext(32, 32);
            scene = Scene.create(ctx);
            text = createText();
            scene.add(text);
            setDebugMode(true);
            expect(function () { return scene.commit(); }).not.toThrow();
            setDebugMode(false);
            ctx.destroy();
            return [2 /*return*/];
        });
    }); });
});
