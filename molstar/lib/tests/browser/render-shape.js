/**
 * Copyright (c) 2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { __awaiter, __generator } from "tslib";
import './index.html';
import { resizeCanvas } from '../../mol-canvas3d/util';
import { Representation } from '../../mol-repr/representation';
import { Canvas3D, Canvas3DContext } from '../../mol-canvas3d/canvas3d';
import { lociLabel } from '../../mol-theme/label';
import { MarkerAction } from '../../mol-util/marker-action';
import { EveryLoci } from '../../mol-model/loci';
import { Progress } from '../../mol-task';
import { Mesh } from '../../mol-geo/geometry/mesh/mesh';
import { MeshBuilder } from '../../mol-geo/geometry/mesh/mesh-builder';
import { Mat4, Vec3 } from '../../mol-math/linear-algebra';
import { Sphere } from '../../mol-geo/primitive/sphere';
import { ColorNames } from '../../mol-util/color/names';
import { Shape } from '../../mol-model/shape';
import { ShapeRepresentation } from '../../mol-repr/shape/representation';
import { AssetManager } from '../../mol-util/assets';
var parent = document.getElementById('app');
parent.style.width = '100%';
parent.style.height = '100%';
var canvas = document.createElement('canvas');
parent.appendChild(canvas);
resizeCanvas(canvas, parent);
var assetManager = new AssetManager();
var info = document.createElement('div');
info.style.position = 'absolute';
info.style.fontFamily = 'sans-serif';
info.style.fontSize = '24pt';
info.style.bottom = '20px';
info.style.right = '20px';
info.style.color = 'white';
parent.appendChild(info);
var prevReprLoci = Representation.Loci.Empty;
var canvas3d = Canvas3D.create(Canvas3DContext.fromCanvas(canvas, assetManager));
canvas3d.animate();
canvas3d.input.move.subscribe(function (_a) {
    var _b;
    var x = _a.x, y = _a.y;
    var pickingId = (_b = canvas3d.identify(x, y)) === null || _b === void 0 ? void 0 : _b.id;
    var label = '';
    if (pickingId) {
        var reprLoci = canvas3d.getLoci(pickingId);
        label = lociLabel(reprLoci.loci);
        if (!Representation.Loci.areEqual(prevReprLoci, reprLoci)) {
            canvas3d.mark(prevReprLoci, MarkerAction.RemoveHighlight);
            canvas3d.mark(reprLoci, MarkerAction.Highlight);
            prevReprLoci = reprLoci;
        }
    }
    else {
        canvas3d.mark({ loci: EveryLoci }, MarkerAction.RemoveHighlight);
        prevReprLoci = Representation.Loci.Empty;
    }
    info.innerText = label;
});
/**
 * Create a mesh of spheres at given centers
 * - asynchronous (using async/await)
 * - progress tracking (via `ctx.update`)
 * - re-use storage from an existing mesh if given
 */
function getSphereMesh(ctx, centers, mesh) {
    return __awaiter(this, void 0, void 0, function () {
        var builderState, t, v, sphere, i, il;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    builderState = MeshBuilder.createState(centers.length * 128, centers.length * 128 / 2, mesh);
                    t = Mat4.identity();
                    v = Vec3.zero();
                    sphere = Sphere(3);
                    builderState.currentGroup = 0;
                    i = 0, il = centers.length / 3;
                    _a.label = 1;
                case 1:
                    if (!(i < il)) return [3 /*break*/, 4];
                    // for production, calls to update should be guarded by `if (ctx.shouldUpdate)`
                    return [4 /*yield*/, ctx.update({ current: i, max: il, message: "adding sphere ".concat(i) })];
                case 2:
                    // for production, calls to update should be guarded by `if (ctx.shouldUpdate)`
                    _a.sent();
                    builderState.currentGroup = i;
                    Mat4.setTranslation(t, Vec3.fromArray(v, centers, i * 3));
                    MeshBuilder.addPrimitive(builderState, t, sphere);
                    _a.label = 3;
                case 3:
                    ++i;
                    return [3 /*break*/, 1];
                case 4: return [2 /*return*/, MeshBuilder.getMesh(builderState)];
            }
        });
    });
}
var myData = {
    centers: [0, 0, 0, 0, 3, 0, 1, 0, 4],
    colors: [ColorNames.tomato, ColorNames.springgreen, ColorNames.springgreen],
    labels: ['Sphere 0, Instance A', 'Sphere 1, Instance A', 'Sphere 0, Instance B', 'Sphere 1, Instance B'],
    transforms: [Mat4.identity(), Mat4.fromTranslation(Mat4.zero(), Vec3.create(3, 0, 0))]
};
/**
 * Get shape from `MyData` object
 */
function getShape(ctx, data, props, shape) {
    return __awaiter(this, void 0, void 0, function () {
        var centers, colors, labels, transforms, mesh, groupCount;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, ctx.update('async creation of shape from  myData')];
                case 1:
                    _a.sent();
                    centers = data.centers, colors = data.colors, labels = data.labels, transforms = data.transforms;
                    return [4 /*yield*/, getSphereMesh(ctx, centers, shape && shape.geometry)];
                case 2:
                    mesh = _a.sent();
                    groupCount = centers.length / 3;
                    return [2 /*return*/, Shape.create('test', data, mesh, function (groupId) { return colors[groupId]; }, // color: per group, same for instances
                        function () { return 1; }, // size: constant
                        function (groupId, instanceId) { return labels[instanceId * groupCount + groupId]; }, // label: per group and instance
                        transforms)];
            }
        });
    });
}
// Init ShapeRepresentation container
var repr = ShapeRepresentation(getShape, Mesh.Utils);
export function init() {
    return __awaiter(this, void 0, void 0, function () {
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: 
                // Create shape from myData and add to canvas3d
                return [4 /*yield*/, repr.createOrUpdate({}, myData).run(function (p) { return console.log(Progress.format(p)); })];
                case 1:
                    // Create shape from myData and add to canvas3d
                    _a.sent();
                    console.log('shape', repr);
                    canvas3d.add(repr);
                    canvas3d.requestCameraReset();
                    // Change color after 1s
                    setTimeout(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    myData.colors[0] = ColorNames.darkmagenta;
                                    // Calling `createOrUpdate` with `data` will trigger color and transform update
                                    return [4 /*yield*/, repr.createOrUpdate({}, myData).run()];
                                case 1:
                                    // Calling `createOrUpdate` with `data` will trigger color and transform update
                                    _a.sent();
                                    return [2 /*return*/];
                            }
                        });
                    }); }, 1000);
                    return [2 /*return*/];
            }
        });
    });
}
init();
