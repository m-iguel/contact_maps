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
import { Points } from '../../mol-geo/geometry/points/points';
export function createPoints() {
    var points = Points.createEmpty();
    var props = PD.getDefaultValues(Points.Params);
    var values = Points.Utils.createValuesSimple(points, props, ColorNames.orange, 1);
    var state = Points.Utils.createRenderableState(props);
    return createRenderObject('points', values, state, -1);
}
describe('points', function () {
    var ctx = tryGetGLContext(32, 32);
    (ctx ? it : it.skip)('basic', function () { return __awaiter(void 0, void 0, void 0, function () {
        var ctx, scene, points;
        return __generator(this, function (_a) {
            ctx = getGLContext(32, 32);
            scene = Scene.create(ctx);
            points = createPoints();
            scene.add(points);
            setDebugMode(true);
            expect(function () { return scene.commit(); }).not.toThrow();
            setDebugMode(false);
            ctx.destroy();
            return [2 /*return*/];
        });
    }); });
});
