/**
 * Copyright (c) 2021-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Sukolsak Sakshuwong <sukolsak@stanford.edu>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { __awaiter, __generator } from "tslib";
import { sort, arraySwap } from '../../mol-data/util';
import { getTrilinearlyInterpolated } from '../../mol-geo/geometry/mesh/color-smoothing';
import { Mesh } from '../../mol-geo/geometry/mesh/mesh';
import { MeshBuilder } from '../../mol-geo/geometry/mesh/mesh-builder';
import { addSphere } from '../../mol-geo/geometry/mesh/builder/sphere';
import { addCylinder } from '../../mol-geo/geometry/mesh/builder/cylinder';
import { sizeDataFactor } from '../../mol-geo/geometry/size-data';
import { Vec3 } from '../../mol-math/linear-algebra';
import { Color } from '../../mol-util/color/color';
import { unpackRGBToInt } from '../../mol-util/number-packing';
import { readAlphaTexture, readTexture } from '../../mol-gl/compute/util';
import { assertUnreachable } from '../../mol-util/type-helpers';
var GeoExportName = 'geo-export';
// avoiding namespace lookup improved performance in Chrome (Aug 2020)
var v3fromArray = Vec3.fromArray;
var v3sub = Vec3.sub;
var v3dot = Vec3.dot;
var v3unitY = Vec3.unitY;
var MeshExporter = /** @class */ (function () {
    function MeshExporter() {
        this.options = {
            includeHidden: false,
            linesAsTriangles: false,
            pointsAsTriangles: false,
            primitivesQuality: 'auto',
        };
    }
    MeshExporter.getSizeFromTexture = function (tSize, i) {
        var r = tSize.array[i * 3];
        var g = tSize.array[i * 3 + 1];
        var b = tSize.array[i * 3 + 2];
        return unpackRGBToInt(r, g, b) / sizeDataFactor;
    };
    MeshExporter.getSize = function (values, instanceIndex, group) {
        var tSize = values.tSize.ref.value;
        var size = 0;
        switch (values.dSizeType.ref.value) {
            case 'uniform':
                size = values.uSize.ref.value;
                break;
            case 'instance':
                size = MeshExporter.getSizeFromTexture(tSize, instanceIndex);
                break;
            case 'group':
                size = MeshExporter.getSizeFromTexture(tSize, group);
                break;
            case 'groupInstance':
                var groupCount = values.uGroupCount.ref.value;
                size = MeshExporter.getSizeFromTexture(tSize, instanceIndex * groupCount + group);
                break;
        }
        return size * values.uSizeFactor.ref.value;
    };
    MeshExporter.getGroup = function (groups, i) {
        var i4 = i * 4;
        var r = groups[i4];
        var g = groups[i4 + 1];
        var b = groups[i4 + 2];
        if (groups instanceof Float32Array) {
            return unpackRGBToInt(r * 255 + 0.5, g * 255 + 0.5, b * 255 + 0.5);
        }
        return unpackRGBToInt(r, g, b);
    };
    MeshExporter.getInterpolatedColors = function (webgl, input) {
        var values = input.values, vertexCount = input.vertexCount, vertices = input.vertices, colorType = input.colorType, stride = input.stride;
        var colorGridTransform = values.uColorGridTransform.ref.value;
        var colorGridDim = values.uColorGridDim.ref.value;
        var colorTexDim = values.uColorTexDim.ref.value;
        var aTransform = values.aTransform.ref.value;
        var instanceCount = values.uInstanceCount.ref.value;
        var colorGrid = readTexture(webgl, values.tColorGrid.ref.value).array;
        var interpolated = getTrilinearlyInterpolated({ vertexCount: vertexCount, instanceCount: instanceCount, transformBuffer: aTransform, positionBuffer: vertices, colorType: colorType, grid: colorGrid, gridDim: colorGridDim, gridTexDim: colorTexDim, gridTransform: colorGridTransform, vertexStride: stride, colorStride: 4, outputStride: 3 });
        return interpolated.array;
    };
    MeshExporter.getInterpolatedOverpaint = function (webgl, input) {
        var values = input.values, vertexCount = input.vertexCount, vertices = input.vertices, colorType = input.colorType, stride = input.stride;
        var overpaintGridTransform = values.uOverpaintGridTransform.ref.value;
        var overpaintGridDim = values.uOverpaintGridDim.ref.value;
        var overpaintTexDim = values.uOverpaintTexDim.ref.value;
        var aTransform = values.aTransform.ref.value;
        var instanceCount = values.uInstanceCount.ref.value;
        var overpaintGrid = readTexture(webgl, values.tOverpaintGrid.ref.value).array;
        var interpolated = getTrilinearlyInterpolated({ vertexCount: vertexCount, instanceCount: instanceCount, transformBuffer: aTransform, positionBuffer: vertices, colorType: colorType, grid: overpaintGrid, gridDim: overpaintGridDim, gridTexDim: overpaintTexDim, gridTransform: overpaintGridTransform, vertexStride: stride, colorStride: 4, outputStride: 4 });
        return interpolated.array;
    };
    MeshExporter.getInterpolatedTransparency = function (webgl, input) {
        var values = input.values, vertexCount = input.vertexCount, vertices = input.vertices, colorType = input.colorType, stride = input.stride;
        var transparencyGridTransform = values.uTransparencyGridTransform.ref.value;
        var transparencyGridDim = values.uTransparencyGridDim.ref.value;
        var transparencyTexDim = values.uTransparencyTexDim.ref.value;
        var aTransform = values.aTransform.ref.value;
        var instanceCount = values.uInstanceCount.ref.value;
        var transparencyGrid = readAlphaTexture(webgl, values.tTransparencyGrid.ref.value).array;
        var interpolated = getTrilinearlyInterpolated({ vertexCount: vertexCount, instanceCount: instanceCount, transformBuffer: aTransform, positionBuffer: vertices, colorType: colorType, grid: transparencyGrid, gridDim: transparencyGridDim, gridTexDim: transparencyTexDim, gridTransform: transparencyGridTransform, vertexStride: stride, colorStride: 4, outputStride: 1, itemOffset: 3 });
        return interpolated.array;
    };
    MeshExporter.quantizeColors = function (colorArray, vertexCount) {
        if (vertexCount <= 1024)
            return;
        var rgb = Vec3();
        var min = Vec3();
        var max = Vec3();
        var sum = Vec3();
        var colorMap = new Map();
        var colorComparers = [
            function (colors, i, j) { return (Color.toVec3(rgb, colors[i])[0] - Color.toVec3(rgb, colors[j])[0]); },
            function (colors, i, j) { return (Color.toVec3(rgb, colors[i])[1] - Color.toVec3(rgb, colors[j])[1]); },
            function (colors, i, j) { return (Color.toVec3(rgb, colors[i])[2] - Color.toVec3(rgb, colors[j])[2]); },
        ];
        var medianCut = function (colors, l, r, depth) {
            if (l > r)
                return;
            if (l === r || depth >= 10) {
                // Find the average color.
                Vec3.set(sum, 0, 0, 0);
                for (var i = l; i <= r; ++i) {
                    Color.toVec3(rgb, colors[i]);
                    Vec3.add(sum, sum, rgb);
                }
                Vec3.round(rgb, Vec3.scale(rgb, sum, 1 / (r - l + 1)));
                var averageColor = Color.fromArray(rgb, 0);
                for (var i = l; i <= r; ++i)
                    colorMap.set(colors[i], averageColor);
                return;
            }
            // Find the color channel with the greatest range.
            Vec3.set(min, 255, 255, 255);
            Vec3.set(max, 0, 0, 0);
            for (var i = l; i <= r; ++i) {
                Color.toVec3(rgb, colors[i]);
                for (var j = 0; j < 3; ++j) {
                    Vec3.min(min, min, rgb);
                    Vec3.max(max, max, rgb);
                }
            }
            var k = 0;
            if (max[1] - min[1] > max[k] - min[k])
                k = 1;
            if (max[2] - min[2] > max[k] - min[k])
                k = 2;
            sort(colors, l, r + 1, colorComparers[k], arraySwap);
            var m = (l + r) >> 1;
            medianCut(colors, l, m, depth + 1);
            medianCut(colors, m + 1, r, depth + 1);
        };
        // Create an array of unique colors and use the median cut algorithm.
        var colorSet = new Set();
        for (var i = 0; i < vertexCount; ++i) {
            colorSet.add(Color.fromArray(colorArray, i * 3));
        }
        var colors = Array.from(colorSet);
        medianCut(colors, 0, colors.length - 1, 0);
        // Map actual colors to quantized colors.
        for (var i = 0; i < vertexCount; ++i) {
            var color = colorMap.get(Color.fromArray(colorArray, i * 3));
            Color.toArray(color, colorArray, i * 3);
        }
    };
    MeshExporter.getInstance = function (input, instanceIndex) {
        var mesh = input.mesh, meshes = input.meshes;
        if (mesh !== undefined) {
            return mesh;
        }
        else {
            var mesh_1 = meshes[instanceIndex];
            return {
                vertices: mesh_1.vertexBuffer.ref.value,
                normals: mesh_1.normalBuffer.ref.value,
                indices: mesh_1.indexBuffer.ref.value,
                groups: mesh_1.groupBuffer.ref.value,
                vertexCount: mesh_1.vertexCount,
                drawCount: mesh_1.triangleCount * 3
            };
        }
    };
    MeshExporter.getColor = function (vertexIndex, geoData, interpolatedColors, interpolatedOverpaint) {
        var values = geoData.values, instanceIndex = geoData.instanceIndex, isGeoTexture = geoData.isGeoTexture, mode = geoData.mode, groups = geoData.groups;
        var groupCount = values.uGroupCount.ref.value;
        var colorType = values.dColorType.ref.value;
        var uColor = values.uColor.ref.value;
        var tColor = values.tColor.ref.value.array;
        var overpaintType = values.dOverpaintType.ref.value;
        var dOverpaint = values.dOverpaint.ref.value;
        var tOverpaint = values.tOverpaint.ref.value.array;
        var vertexCount = geoData.vertexCount;
        if (mode === 'lines') {
            vertexIndex *= 2;
            vertexCount *= 2;
        }
        var color;
        switch (colorType) {
            case 'uniform':
                color = Color.fromNormalizedArray(uColor, 0);
                break;
            case 'instance':
                color = Color.fromArray(tColor, instanceIndex * 3);
                break;
            case 'group': {
                var group = isGeoTexture ? MeshExporter.getGroup(groups, vertexIndex) : groups[vertexIndex];
                color = Color.fromArray(tColor, group * 3);
                break;
            }
            case 'groupInstance': {
                var group = isGeoTexture ? MeshExporter.getGroup(groups, vertexIndex) : groups[vertexIndex];
                color = Color.fromArray(tColor, (instanceIndex * groupCount + group) * 3);
                break;
            }
            case 'vertex':
                color = Color.fromArray(tColor, vertexIndex * 3);
                break;
            case 'vertexInstance':
                color = Color.fromArray(tColor, (instanceIndex * vertexCount + vertexIndex) * 3);
                break;
            case 'volume':
                color = Color.fromArray(interpolatedColors, vertexIndex * 3);
                break;
            case 'volumeInstance':
                color = Color.fromArray(interpolatedColors, (instanceIndex * vertexCount + vertexIndex) * 3);
                break;
            default: throw new Error('Unsupported color type.');
        }
        if (dOverpaint) {
            var overpaintColor = void 0;
            var overpaintAlpha = void 0;
            switch (overpaintType) {
                case 'groupInstance': {
                    var group = isGeoTexture ? MeshExporter.getGroup(groups, vertexIndex) : groups[vertexIndex];
                    var idx = (instanceIndex * groupCount + group) * 4;
                    overpaintColor = Color.fromArray(tOverpaint, idx);
                    overpaintAlpha = tOverpaint[idx + 3] / 255;
                    break;
                }
                case 'vertexInstance': {
                    var idx = (instanceIndex * vertexCount + vertexIndex) * 4;
                    overpaintColor = Color.fromArray(tOverpaint, idx);
                    overpaintAlpha = tOverpaint[idx + 3] / 255;
                    break;
                }
                case 'volumeInstance': {
                    var idx = (instanceIndex * vertexCount + vertexIndex) * 4;
                    overpaintColor = Color.fromArray(interpolatedOverpaint, idx);
                    overpaintAlpha = interpolatedOverpaint[idx + 3] / 255;
                    break;
                }
                default: throw new Error('Unsupported overpaint type.');
            }
            // interpolate twice to avoid darkening due to empty overpaint
            overpaintColor = Color.interpolate(color, overpaintColor, overpaintAlpha);
            color = Color.interpolate(color, overpaintColor, overpaintAlpha);
        }
        return color;
    };
    MeshExporter.getTransparency = function (vertexIndex, geoData, interpolatedTransparency) {
        var values = geoData.values, instanceIndex = geoData.instanceIndex, isGeoTexture = geoData.isGeoTexture, mode = geoData.mode, groups = geoData.groups;
        var groupCount = values.uGroupCount.ref.value;
        var dTransparency = values.dTransparency.ref.value;
        var tTransparency = values.tTransparency.ref.value.array;
        var transparencyType = values.dTransparencyType.ref.value;
        var vertexCount = geoData.vertexCount;
        if (mode === 'lines') {
            vertexIndex *= 2;
            vertexCount *= 2;
        }
        var transparency = 0;
        if (dTransparency) {
            switch (transparencyType) {
                case 'groupInstance': {
                    var group = isGeoTexture ? MeshExporter.getGroup(groups, vertexIndex) : groups[vertexIndex];
                    var idx = (instanceIndex * groupCount + group);
                    transparency = tTransparency[idx] / 255;
                    break;
                }
                case 'vertexInstance': {
                    var idx = (instanceIndex * vertexCount + vertexIndex);
                    transparency = tTransparency[idx] / 255;
                    break;
                }
                case 'volumeInstance': {
                    var idx = (instanceIndex * vertexCount + vertexIndex);
                    transparency = interpolatedTransparency[idx] / 255;
                    break;
                }
                default: throw new Error('Unsupported transparency type.');
            }
        }
        return transparency;
    };
    MeshExporter.prototype.addMesh = function (values, webgl, ctx) {
        return __awaiter(this, void 0, void 0, function () {
            var aPosition, aNormal, aGroup, originalData, indices, vertexCount, drawCount;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        aPosition = values.aPosition.ref.value;
                        aNormal = values.aNormal.ref.value;
                        aGroup = values.aGroup.ref.value;
                        originalData = Mesh.getOriginalData(values);
                        if (originalData) {
                            indices = originalData.indexBuffer;
                            vertexCount = originalData.vertexCount;
                            drawCount = originalData.triangleCount * 3;
                        }
                        else {
                            indices = values.elements.ref.value;
                            vertexCount = values.uVertexCount.ref.value;
                            drawCount = values.drawCount.ref.value;
                        }
                        return [4 /*yield*/, this.addMeshWithColors({ mesh: { vertices: aPosition, normals: aNormal, indices: indices, groups: aGroup, vertexCount: vertexCount, drawCount: drawCount }, meshes: undefined, values: values, isGeoTexture: false, mode: 'triangles', webgl: webgl, ctx: ctx })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    MeshExporter.prototype.addLines = function (values, webgl, ctx) {
        return __awaiter(this, void 0, void 0, function () {
            var aStart, aEnd, aGroup, vertexCount, drawCount, start, end, instanceCount, meshes, radialSegments, topCap, bottomCap, instanceIndex, state, i, il, group, radius, cylinderProps, n, vertices, i;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        aStart = values.aStart.ref.value;
                        aEnd = values.aEnd.ref.value;
                        aGroup = values.aGroup.ref.value;
                        vertexCount = (values.uVertexCount.ref.value / 4) * 2;
                        drawCount = values.drawCount.ref.value / (2 * 3);
                        if (!this.options.linesAsTriangles) return [3 /*break*/, 2];
                        start = Vec3();
                        end = Vec3();
                        instanceCount = values.instanceCount.ref.value;
                        meshes = [];
                        radialSegments = 6;
                        topCap = true;
                        bottomCap = true;
                        for (instanceIndex = 0; instanceIndex < instanceCount; ++instanceIndex) {
                            state = MeshBuilder.createState(512, 256);
                            for (i = 0, il = vertexCount * 2; i < il; i += 4) {
                                v3fromArray(start, aStart, i * 3);
                                v3fromArray(end, aEnd, i * 3);
                                group = aGroup[i];
                                radius = MeshExporter.getSize(values, instanceIndex, group) * 0.03;
                                cylinderProps = { radiusTop: radius, radiusBottom: radius, topCap: topCap, bottomCap: bottomCap, radialSegments: radialSegments };
                                state.currentGroup = aGroup[i];
                                addCylinder(state, start, end, 1, cylinderProps);
                            }
                            meshes.push(MeshBuilder.getMesh(state));
                        }
                        return [4 /*yield*/, this.addMeshWithColors({ mesh: undefined, meshes: meshes, values: values, isGeoTexture: false, mode: 'triangles', webgl: webgl, ctx: ctx })];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 2:
                        n = vertexCount / 2;
                        vertices = new Float32Array(n * 2 * 3);
                        for (i = 0; i < n; ++i) {
                            vertices[i * 6] = aStart[i * 4 * 3];
                            vertices[i * 6 + 1] = aStart[i * 4 * 3 + 1];
                            vertices[i * 6 + 2] = aStart[i * 4 * 3 + 2];
                            vertices[i * 6 + 3] = aEnd[i * 4 * 3];
                            vertices[i * 6 + 4] = aEnd[i * 4 * 3 + 1];
                            vertices[i * 6 + 5] = aEnd[i * 4 * 3 + 2];
                        }
                        return [4 /*yield*/, this.addMeshWithColors({ mesh: { vertices: vertices, normals: undefined, indices: undefined, groups: aGroup, vertexCount: vertexCount, drawCount: drawCount }, meshes: undefined, values: values, isGeoTexture: false, mode: 'lines', webgl: webgl, ctx: ctx })];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    MeshExporter.prototype.addPoints = function (values, webgl, ctx) {
        return __awaiter(this, void 0, void 0, function () {
            var aPosition, aGroup, vertexCount, drawCount, center, instanceCount, meshes, detail, instanceIndex, state, i, group, radius;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        aPosition = values.aPosition.ref.value;
                        aGroup = values.aGroup.ref.value;
                        vertexCount = values.uVertexCount.ref.value;
                        drawCount = values.drawCount.ref.value;
                        if (!this.options.pointsAsTriangles) return [3 /*break*/, 2];
                        center = Vec3();
                        instanceCount = values.instanceCount.ref.value;
                        meshes = [];
                        detail = 0;
                        for (instanceIndex = 0; instanceIndex < instanceCount; ++instanceIndex) {
                            state = MeshBuilder.createState(512, 256);
                            for (i = 0; i < vertexCount; ++i) {
                                v3fromArray(center, aPosition, i * 3);
                                group = aGroup[i];
                                radius = MeshExporter.getSize(values, instanceIndex, group) * 0.03;
                                state.currentGroup = group;
                                addSphere(state, center, radius, detail);
                            }
                            meshes.push(MeshBuilder.getMesh(state));
                        }
                        return [4 /*yield*/, this.addMeshWithColors({ mesh: undefined, meshes: meshes, values: values, isGeoTexture: false, mode: 'triangles', webgl: webgl, ctx: ctx })];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 2: return [4 /*yield*/, this.addMeshWithColors({ mesh: { vertices: aPosition, normals: undefined, indices: undefined, groups: aGroup, vertexCount: vertexCount, drawCount: drawCount }, meshes: undefined, values: values, isGeoTexture: false, mode: 'points', webgl: webgl, ctx: ctx })];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    MeshExporter.prototype.addSpheres = function (values, webgl, ctx) {
        return __awaiter(this, void 0, void 0, function () {
            var center, aPosition, aGroup, instanceCount, vertexCount, meshes, sphereCount, detail, instanceIndex, state, i, group, radius;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        center = Vec3();
                        aPosition = values.aPosition.ref.value;
                        aGroup = values.aGroup.ref.value;
                        instanceCount = values.instanceCount.ref.value;
                        vertexCount = values.uVertexCount.ref.value;
                        meshes = [];
                        sphereCount = vertexCount / 4 * instanceCount;
                        switch (this.options.primitivesQuality) {
                            case 'auto':
                                if (sphereCount < 2000)
                                    detail = 3;
                                else if (sphereCount < 20000)
                                    detail = 2;
                                else
                                    detail = 1;
                                break;
                            case 'high':
                                detail = 3;
                                break;
                            case 'medium':
                                detail = 2;
                                break;
                            case 'low':
                                detail = 1;
                                break;
                            default:
                                assertUnreachable(this.options.primitivesQuality);
                        }
                        for (instanceIndex = 0; instanceIndex < instanceCount; ++instanceIndex) {
                            state = MeshBuilder.createState(512, 256);
                            for (i = 0; i < vertexCount; i += 4) {
                                v3fromArray(center, aPosition, i * 3);
                                group = aGroup[i];
                                radius = MeshExporter.getSize(values, instanceIndex, group);
                                state.currentGroup = group;
                                addSphere(state, center, radius, detail);
                            }
                            meshes.push(MeshBuilder.getMesh(state));
                        }
                        return [4 /*yield*/, this.addMeshWithColors({ mesh: undefined, meshes: meshes, values: values, isGeoTexture: false, mode: 'triangles', webgl: webgl, ctx: ctx })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    MeshExporter.prototype.addCylinders = function (values, webgl, ctx) {
        return __awaiter(this, void 0, void 0, function () {
            var start, end, dir, aStart, aEnd, aScale, aCap, aGroup, instanceCount, vertexCount, meshes, cylinderCount, radialSegments, instanceIndex, state, i, group, radius, cap, topCap, bottomCap, cylinderProps;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        start = Vec3();
                        end = Vec3();
                        dir = Vec3();
                        aStart = values.aStart.ref.value;
                        aEnd = values.aEnd.ref.value;
                        aScale = values.aScale.ref.value;
                        aCap = values.aCap.ref.value;
                        aGroup = values.aGroup.ref.value;
                        instanceCount = values.instanceCount.ref.value;
                        vertexCount = values.uVertexCount.ref.value;
                        meshes = [];
                        cylinderCount = vertexCount / 6 * instanceCount;
                        switch (this.options.primitivesQuality) {
                            case 'auto':
                                if (cylinderCount < 2000)
                                    radialSegments = 36;
                                else if (cylinderCount < 20000)
                                    radialSegments = 24;
                                else
                                    radialSegments = 12;
                                break;
                            case 'high':
                                radialSegments = 36;
                                break;
                            case 'medium':
                                radialSegments = 24;
                                break;
                            case 'low':
                                radialSegments = 12;
                                break;
                            default:
                                assertUnreachable(this.options.primitivesQuality);
                        }
                        for (instanceIndex = 0; instanceIndex < instanceCount; ++instanceIndex) {
                            state = MeshBuilder.createState(512, 256);
                            for (i = 0; i < vertexCount; i += 6) {
                                v3fromArray(start, aStart, i * 3);
                                v3fromArray(end, aEnd, i * 3);
                                v3sub(dir, end, start);
                                group = aGroup[i];
                                radius = MeshExporter.getSize(values, instanceIndex, group) * aScale[i];
                                cap = aCap[i];
                                topCap = cap === 1 || cap === 3;
                                bottomCap = cap >= 2;
                                if (v3dot(v3unitY, dir) > 0) {
                                    _a = [topCap, bottomCap], bottomCap = _a[0], topCap = _a[1];
                                }
                                cylinderProps = { radiusTop: radius, radiusBottom: radius, topCap: topCap, bottomCap: bottomCap, radialSegments: radialSegments };
                                state.currentGroup = aGroup[i];
                                addCylinder(state, start, end, 1, cylinderProps);
                            }
                            meshes.push(MeshBuilder.getMesh(state));
                        }
                        return [4 /*yield*/, this.addMeshWithColors({ mesh: undefined, meshes: meshes, values: values, isGeoTexture: false, mode: 'triangles', webgl: webgl, ctx: ctx })];
                    case 1:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    MeshExporter.prototype.addTextureMesh = function (values, webgl, ctx) {
        return __awaiter(this, void 0, void 0, function () {
            var framebuffer, _a, width, height, vertices, normals, groups, vertexCount, drawCount;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!webgl.namedFramebuffers[GeoExportName]) {
                            webgl.namedFramebuffers[GeoExportName] = webgl.resources.framebuffer();
                        }
                        framebuffer = webgl.namedFramebuffers[GeoExportName];
                        _a = values.uGeoTexDim.ref.value, width = _a[0], height = _a[1];
                        vertices = new Float32Array(width * height * 4);
                        normals = new Float32Array(width * height * 4);
                        groups = webgl.isWebGL2 ? new Uint8Array(width * height * 4) : new Float32Array(width * height * 4);
                        framebuffer.bind();
                        values.tPosition.ref.value.attachFramebuffer(framebuffer, 0);
                        webgl.readPixels(0, 0, width, height, vertices);
                        values.tNormal.ref.value.attachFramebuffer(framebuffer, 0);
                        webgl.readPixels(0, 0, width, height, normals);
                        values.tGroup.ref.value.attachFramebuffer(framebuffer, 0);
                        webgl.readPixels(0, 0, width, height, groups);
                        vertexCount = values.uVertexCount.ref.value;
                        drawCount = values.drawCount.ref.value;
                        return [4 /*yield*/, this.addMeshWithColors({ mesh: { vertices: vertices, normals: normals, indices: undefined, groups: groups, vertexCount: vertexCount, drawCount: drawCount }, meshes: undefined, values: values, isGeoTexture: true, mode: 'triangles', webgl: webgl, ctx: ctx })];
                    case 1:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    MeshExporter.prototype.add = function (renderObject, webgl, ctx) {
        if (!renderObject.state.visible && !this.options.includeHidden)
            return;
        if (renderObject.values.drawCount.ref.value === 0)
            return;
        if (renderObject.values.instanceCount.ref.value === 0)
            return;
        switch (renderObject.type) {
            case 'mesh':
                return this.addMesh(renderObject.values, webgl, ctx);
            case 'lines':
                return this.addLines(renderObject.values, webgl, ctx);
            case 'points':
                return this.addPoints(renderObject.values, webgl, ctx);
            case 'spheres':
                return this.addSpheres(renderObject.values, webgl, ctx);
            case 'cylinders':
                return this.addCylinders(renderObject.values, webgl, ctx);
            case 'texture-mesh':
                return this.addTextureMesh(renderObject.values, webgl, ctx);
        }
    };
    return MeshExporter;
}());
export { MeshExporter };
