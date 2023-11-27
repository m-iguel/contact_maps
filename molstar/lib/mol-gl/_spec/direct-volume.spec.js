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
import { DirectVolume } from '../../mol-geo/geometry/direct-volume/direct-volume';
export function createDirectVolume() {
    var directVolume = DirectVolume.createEmpty();
    var props = PD.getDefaultValues(DirectVolume.Params);
    var values = DirectVolume.Utils.createValuesSimple(directVolume, props, ColorNames.orange, 1);
    var state = DirectVolume.Utils.createRenderableState(props);
    return createRenderObject('direct-volume', values, state, -1);
}
describe('direct-volume', function () {
    var ctx = tryGetGLContext(32, 32);
    (ctx ? it : it.skip)('basic', function () { return __awaiter(void 0, void 0, void 0, function () {
        var ctx, scene, directVolume;
        return __generator(this, function (_a) {
            ctx = getGLContext(32, 32);
            scene = Scene.create(ctx);
            directVolume = createDirectVolume();
            scene.add(directVolume);
            setDebugMode(true);
            expect(function () { return scene.commit(); }).not.toThrow();
            setDebugMode(false);
            ctx.destroy();
            return [2 /*return*/];
        });
    }); });
});
