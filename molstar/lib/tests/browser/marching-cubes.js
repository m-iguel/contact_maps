/**
 * Copyright (c) 2019-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { __assign, __awaiter, __generator } from "tslib";
import './index.html';
import { resizeCanvas } from '../../mol-canvas3d/util';
import { Canvas3DParams, Canvas3D, Canvas3DContext } from '../../mol-canvas3d/canvas3d';
import { ColorNames } from '../../mol-util/color/names';
import { Box3D, Sphere3D } from '../../mol-math/geometry';
import { OrderedSet } from '../../mol-data/int';
import { Vec3 } from '../../mol-math/linear-algebra';
import { computeGaussianDensity, computeGaussianDensityTexture2d } from '../../mol-math/geometry/gaussian-density';
import { calcActiveVoxels } from '../../mol-gl/compute/marching-cubes/active-voxels';
import { createHistogramPyramid } from '../../mol-gl/compute/histogram-pyramid/reduction';
import { createIsosurfaceBuffers } from '../../mol-gl/compute/marching-cubes/isosurface';
import { TextureMesh } from '../../mol-geo/geometry/texture-mesh/texture-mesh';
import { Color } from '../../mol-util/color';
import { createRenderObject } from '../../mol-gl/render-object';
import { Representation } from '../../mol-repr/representation';
import { computeMarchingCubesMesh } from '../../mol-geo/util/marching-cubes/algorithm';
import { Mesh } from '../../mol-geo/geometry/mesh/mesh';
import { ParamDefinition as PD } from '../../mol-util/param-definition';
import { AssetManager } from '../../mol-util/assets';
var parent = document.getElementById('app');
parent.style.width = '100%';
parent.style.height = '100%';
var canvas = document.createElement('canvas');
parent.appendChild(canvas);
resizeCanvas(canvas, parent);
var assetManager = new AssetManager();
var canvas3d = Canvas3D.create(Canvas3DContext.fromCanvas(canvas, assetManager), PD.merge(Canvas3DParams, PD.getDefaultValues(Canvas3DParams), {
    renderer: { backgroundColor: ColorNames.white },
    camera: { mode: 'orthographic' }
}));
canvas3d.animate();
function init() {
    return __awaiter(this, void 0, void 0, function () {
        var webgl, position, box, radius, props, isoValue, densityTextureData2, activeVoxelsTex2, compacted2, densityTextureData, activeVoxelsTex, compacted, gv, mcBoundingSphere, mcIsosurface, mcIsoSurfaceProps, mcIsoSurfaceValues, mcIsoSurfaceState, mcIsoSurfaceRenderObject, mcIsoSurfaceRepr, densityData, params, surface, meshProps, meshValues, meshState, meshRenderObject, meshRepr;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    webgl = canvas3d.webgl;
                    position = {
                        x: [0, 2],
                        y: [0, 2],
                        z: [0, 2],
                        indices: OrderedSet.ofSortedArray([0, 1]),
                    };
                    box = Box3D.create(Vec3.create(0, 0, 0), Vec3.create(2, 2, 2));
                    radius = function () { return 1.8; };
                    props = {
                        resolution: 0.1,
                        radiusOffset: 0,
                        smoothness: 1.5
                    };
                    isoValue = Math.exp(-props.smoothness);
                    if (!true) return [3 /*break*/, 2];
                    console.time('gpu gaussian2');
                    return [4 /*yield*/, computeGaussianDensityTexture2d(position, box, radius, props, webgl).run()];
                case 1:
                    densityTextureData2 = _a.sent();
                    webgl.waitForGpuCommandsCompleteSync();
                    console.timeEnd('gpu gaussian2');
                    console.time('gpu mc2');
                    console.time('gpu mc active2');
                    activeVoxelsTex2 = calcActiveVoxels(webgl, densityTextureData2.texture, densityTextureData2.gridDim, densityTextureData2.gridTexDim, isoValue, densityTextureData2.gridTexScale);
                    webgl.waitForGpuCommandsCompleteSync();
                    console.timeEnd('gpu mc active2');
                    console.time('gpu mc pyramid2');
                    compacted2 = createHistogramPyramid(webgl, activeVoxelsTex2, densityTextureData2.gridTexScale, densityTextureData2.gridTexDim);
                    webgl.waitForGpuCommandsCompleteSync();
                    console.timeEnd('gpu mc pyramid2');
                    console.time('gpu mc vert2');
                    createIsosurfaceBuffers(webgl, activeVoxelsTex2, densityTextureData2.texture, compacted2, densityTextureData2.gridDim, densityTextureData2.gridTexDim, densityTextureData2.transform, isoValue, false, true, Vec3.create(0, 1, 2), true);
                    webgl.waitForGpuCommandsCompleteSync();
                    console.timeEnd('gpu mc vert2');
                    console.timeEnd('gpu mc2');
                    _a.label = 2;
                case 2:
                    console.time('gpu gaussian');
                    return [4 /*yield*/, computeGaussianDensityTexture2d(position, box, radius, props, webgl).run()];
                case 3:
                    densityTextureData = _a.sent();
                    webgl.waitForGpuCommandsCompleteSync();
                    console.timeEnd('gpu gaussian');
                    console.time('gpu mc');
                    console.time('gpu mc active');
                    activeVoxelsTex = calcActiveVoxels(webgl, densityTextureData.texture, densityTextureData.gridDim, densityTextureData.gridTexDim, isoValue, densityTextureData.gridTexScale);
                    webgl.waitForGpuCommandsCompleteSync();
                    console.timeEnd('gpu mc active');
                    console.time('gpu mc pyramid');
                    compacted = createHistogramPyramid(webgl, activeVoxelsTex, densityTextureData.gridTexScale, densityTextureData.gridTexDim);
                    webgl.waitForGpuCommandsCompleteSync();
                    console.timeEnd('gpu mc pyramid');
                    console.time('gpu mc vert');
                    gv = createIsosurfaceBuffers(webgl, activeVoxelsTex, densityTextureData.texture, compacted, densityTextureData.gridDim, densityTextureData.gridTexDim, densityTextureData.transform, isoValue, false, true, Vec3.create(0, 1, 2), true);
                    webgl.waitForGpuCommandsCompleteSync();
                    console.timeEnd('gpu mc vert');
                    console.timeEnd('gpu mc');
                    console.log(__assign(__assign({}, webgl.stats), { programCount: webgl.stats.resourceCounts.program, shaderCount: webgl.stats.resourceCounts.shader }));
                    mcBoundingSphere = Sphere3D.fromBox3D(Sphere3D(), densityTextureData.bbox);
                    mcIsosurface = TextureMesh.create(gv.vertexCount, 1, gv.vertexTexture, gv.groupTexture, gv.normalTexture, mcBoundingSphere);
                    mcIsoSurfaceProps = __assign(__assign({}, PD.getDefaultValues(TextureMesh.Params)), { doubleSided: true, flatShaded: true, alpha: 1.0 });
                    mcIsoSurfaceValues = TextureMesh.Utils.createValuesSimple(mcIsosurface, mcIsoSurfaceProps, Color(0x112299), 1);
                    mcIsoSurfaceState = TextureMesh.Utils.createRenderableState(mcIsoSurfaceProps);
                    mcIsoSurfaceRenderObject = createRenderObject('texture-mesh', mcIsoSurfaceValues, mcIsoSurfaceState, -1);
                    mcIsoSurfaceRepr = Representation.fromRenderObject('texture-mesh', mcIsoSurfaceRenderObject);
                    canvas3d.add(mcIsoSurfaceRepr);
                    canvas3d.requestCameraReset();
                    //
                    console.time('cpu gaussian');
                    return [4 /*yield*/, computeGaussianDensity(position, box, radius, props).run()];
                case 4:
                    densityData = _a.sent();
                    console.timeEnd('cpu gaussian');
                    console.log({ densityData: densityData });
                    params = {
                        isoLevel: isoValue,
                        scalarField: densityData.field,
                        idField: densityData.idField
                    };
                    console.time('cpu mc');
                    return [4 /*yield*/, computeMarchingCubesMesh(params).run()];
                case 5:
                    surface = _a.sent();
                    console.timeEnd('cpu mc');
                    console.log('surface', surface);
                    Mesh.transform(surface, densityData.transform);
                    meshProps = __assign(__assign({}, PD.getDefaultValues(Mesh.Params)), { doubleSided: true, flatShaded: false, alpha: 1.0 });
                    meshValues = Mesh.Utils.createValuesSimple(surface, meshProps, Color(0x995511), 1);
                    meshState = Mesh.Utils.createRenderableState(meshProps);
                    meshRenderObject = createRenderObject('mesh', meshValues, meshState, -1);
                    meshRepr = Representation.fromRenderObject('mesh', meshRenderObject);
                    canvas3d.add(meshRepr);
                    canvas3d.requestCameraReset();
                    return [2 /*return*/];
            }
        });
    });
}
init();
