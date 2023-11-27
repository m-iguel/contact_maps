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
import { Cylinders } from '../../mol-geo/geometry/cylinders/cylinders';
export function createCylinders() {
    var cylinders = Cylinders.createEmpty();
    var props = PD.getDefaultValues(Cylinders.Params);
    var values = Cylinders.Utils.createValuesSimple(cylinders, props, ColorNames.orange, 1);
    var state = Cylinders.Utils.createRenderableState(props);
    return createRenderObject('cylinders', values, state, -1);
}
describe('cylinders', function () {
    var ctx = tryGetGLContext(32, 32, { fragDepth: true });
    (ctx ? it : it.skip)('basic', function () { return __awaiter(void 0, void 0, void 0, function () {
        var ctx, scene, cylinders;
        return __generator(this, function (_a) {
            ctx = getGLContext(32, 32);
            scene = Scene.create(ctx);
            cylinders = createCylinders();
            scene.add(cylinders);
            setDebugMode(true);
            expect(function () { return scene.commit(); }).not.toThrow();
            setDebugMode(false);
            ctx.destroy();
            return [2 /*return*/];
        });
    }); });
});
