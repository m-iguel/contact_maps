/**
 * Copyright (c) 2018-2021 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { __awaiter, __generator } from "tslib";
import { createGl } from './gl.shim';
import { Camera } from '../../mol-canvas3d/camera';
import { Vec3 } from '../../mol-math/linear-algebra';
import { Renderer } from '../renderer';
import { createContext } from '../webgl/context';
import { Scene } from '../scene';
import { createPoints } from './points.spec';
export function createRenderer(gl) {
    var ctx = createContext(gl);
    var camera = new Camera({
        position: Vec3.create(0, 0, 50)
    });
    var renderer = Renderer.create(ctx);
    return { ctx: ctx, camera: camera, renderer: renderer };
}
describe('renderer', function () {
    it('basic', function () {
        var _a = [32, 32], width = _a[0], height = _a[1];
        var gl = createGl(width, height, { preserveDrawingBuffer: true });
        var _b = createRenderer(gl), ctx = _b.ctx, renderer = _b.renderer;
        expect(ctx.gl.drawingBufferWidth).toBe(32);
        expect(ctx.gl.drawingBufferHeight).toBe(32);
        expect(ctx.stats.resourceCounts.attribute).toBe(0);
        expect(ctx.stats.resourceCounts.texture).toBe(1);
        expect(ctx.stats.resourceCounts.vertexArray).toBe(0);
        expect(ctx.stats.resourceCounts.program).toBe(0);
        expect(ctx.stats.resourceCounts.shader).toBe(0);
        renderer.setViewport(0, 0, 64, 48);
        expect(ctx.gl.getParameter(ctx.gl.VIEWPORT)[2]).toBe(64);
        expect(ctx.gl.getParameter(ctx.gl.VIEWPORT)[3]).toBe(48);
    });
    it('points', function () { return __awaiter(void 0, void 0, void 0, function () {
        var _a, width, height, gl, ctx, scene, points;
        return __generator(this, function (_b) {
            _a = [32, 32], width = _a[0], height = _a[1];
            gl = createGl(width, height, { preserveDrawingBuffer: true });
            ctx = createRenderer(gl).ctx;
            scene = Scene.create(ctx);
            points = createPoints();
            scene.add(points);
            scene.commit();
            expect(ctx.stats.resourceCounts.attribute).toBe(ctx.isWebGL2 ? 4 : 5);
            expect(ctx.stats.resourceCounts.texture).toBe(9);
            expect(ctx.stats.resourceCounts.vertexArray).toBe(ctx.extensions.vertexArrayObject ? 6 : 0);
            expect(ctx.stats.resourceCounts.program).toBe(6);
            expect(ctx.stats.resourceCounts.shader).toBe(12);
            scene.remove(points);
            scene.commit();
            expect(ctx.stats.resourceCounts.attribute).toBe(0);
            expect(ctx.stats.resourceCounts.texture).toBe(1);
            expect(ctx.stats.resourceCounts.vertexArray).toBe(0);
            expect(ctx.stats.resourceCounts.program).toBe(6);
            expect(ctx.stats.resourceCounts.shader).toBe(12);
            ctx.resources.destroy();
            expect(ctx.stats.resourceCounts.program).toBe(0);
            expect(ctx.stats.resourceCounts.shader).toBe(0);
            return [2 /*return*/];
        });
    }); });
});
