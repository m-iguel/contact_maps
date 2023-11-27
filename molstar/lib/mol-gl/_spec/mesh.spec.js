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
import { Mesh } from '../../mol-geo/geometry/mesh/mesh';
export function createMesh() {
    var mesh = Mesh.createEmpty();
    var props = PD.getDefaultValues(Mesh.Params);
    var values = Mesh.Utils.createValuesSimple(mesh, props, ColorNames.orange, 1);
    var state = Mesh.Utils.createRenderableState(props);
    return createRenderObject('mesh', values, state, -1);
}
describe('mesh', function () {
    var ctx = tryGetGLContext(32, 32);
    (ctx ? it : it.skip)('basic', function () { return __awaiter(void 0, void 0, void 0, function () {
        var ctx, scene, mesh;
        return __generator(this, function (_a) {
            ctx = getGLContext(32, 32);
            scene = Scene.create(ctx);
            mesh = createMesh();
            scene.add(mesh);
            setDebugMode(true);
            expect(function () { return scene.commit(); }).not.toThrow();
            setDebugMode(false);
            ctx.destroy();
            return [2 /*return*/];
        });
    }); });
});
