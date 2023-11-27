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
import { Spheres } from '../../mol-geo/geometry/spheres/spheres';
export function createSpheres() {
    var spheres = Spheres.createEmpty();
    var props = PD.getDefaultValues(Spheres.Params);
    var values = Spheres.Utils.createValuesSimple(spheres, props, ColorNames.orange, 1);
    var state = Spheres.Utils.createRenderableState(props);
    return createRenderObject('spheres', values, state, -1);
}
describe('spheres', function () {
    var ctx = tryGetGLContext(32, 32, { fragDepth: true });
    (ctx ? it : it.skip)('basic', function () { return __awaiter(void 0, void 0, void 0, function () {
        var ctx, scene, spheres;
        return __generator(this, function (_a) {
            ctx = getGLContext(32, 32);
            scene = Scene.create(ctx);
            spheres = createSpheres();
            scene.add(spheres);
            setDebugMode(true);
            expect(function () { return scene.commit(); }).not.toThrow();
            setDebugMode(false);
            ctx.destroy();
            return [2 /*return*/];
        });
    }); });
});
