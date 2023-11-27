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
import { Image } from '../../mol-geo/geometry/image/image';
export function createImage() {
    var image = Image.createEmpty();
    var props = PD.getDefaultValues(Image.Params);
    var values = Image.Utils.createValuesSimple(image, props, ColorNames.orange, 1);
    var state = Image.Utils.createRenderableState(props);
    return createRenderObject('image', values, state, -1);
}
describe('image', function () {
    var ctx = tryGetGLContext(32, 32);
    (ctx ? it : it.skip)('basic', function () { return __awaiter(void 0, void 0, void 0, function () {
        var ctx, scene, image;
        return __generator(this, function (_a) {
            ctx = getGLContext(32, 32);
            scene = Scene.create(ctx);
            image = createImage();
            scene.add(image);
            setDebugMode(true);
            expect(function () { return scene.commit(); }).not.toThrow();
            setDebugMode(false);
            ctx.destroy();
            return [2 /*return*/];
        });
    }); });
});
