/**
 * Copyright (c) 2021-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Sukolsak Sakshuwong <sukolsak@stanford.edu>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { __awaiter, __extends, __generator, __spreadArray } from "tslib";
import { asciiWrite } from '../../mol-io/common/ascii';
import { Vec3, Mat3, Mat4 } from '../../mol-math/linear-algebra';
import { PLUGIN_VERSION } from '../../mol-plugin/version';
import { StringBuilder } from '../../mol-util';
import { Color } from '../../mol-util/color/color';
import { zip } from '../../mol-util/zip/zip';
import { MeshExporter } from './mesh-exporter';
// avoiding namespace lookup improved performance in Chrome (Aug 2020)
var v3fromArray = Vec3.fromArray;
var v3transformMat4 = Vec3.transformMat4;
var v3transformMat3 = Vec3.transformMat3;
var mat3directionTransform = Mat3.directionTransform;
var UsdzExporter = /** @class */ (function (_super) {
    __extends(UsdzExporter, _super);
    function UsdzExporter(boundingBox, radius) {
        var _this = _super.call(this) || this;
        _this.fileExtension = 'usdz';
        _this.meshes = [];
        _this.materials = [];
        _this.materialMap = new Map();
        var t = Mat4();
        // scale the model so that it fits within 1 meter
        Mat4.fromUniformScaling(t, Math.min(1 / (radius * 2), 1));
        // translate the model so that it sits on the ground plane (y = 0)
        Mat4.translate(t, t, Vec3.create(-(boundingBox.min[0] + boundingBox.max[0]) / 2, -boundingBox.min[1], -(boundingBox.min[2] + boundingBox.max[2]) / 2));
        _this.centerTransform = t;
        return _this;
    }
    UsdzExporter.prototype.addMaterial = function (color, alpha, metalness, roughness) {
        var hash = "".concat(color, "|").concat(alpha, "|").concat(metalness, "|").concat(roughness);
        if (this.materialMap.has(hash))
            return this.materialMap.get(hash);
        var materialKey = this.materialMap.size;
        this.materialMap.set(hash, materialKey);
        var _a = Color.toRgbNormalized(color).map(function (v) { return Math.round(v * 1000) / 1000; }), r = _a[0], g = _a[1], b = _a[2];
        this.materials.push("\ndef Material \"material".concat(materialKey, "\"\n{\n    token outputs:surface.connect = </material").concat(materialKey, "/shader.outputs:surface>\n    def Shader \"shader\"\n    {\n        uniform token info:id = \"UsdPreviewSurface\"\n        color3f inputs:diffuseColor = (").concat(r, ",").concat(g, ",").concat(b, ")\n        float inputs:opacity = ").concat(alpha, "\n        float inputs:metallic = ").concat(metalness, "\n        float inputs:roughness = ").concat(roughness, "\n        token outputs:surface\n    }\n}\n"));
        return materialKey;
    };
    UsdzExporter.prototype.addMeshWithColors = function (input) {
        return __awaiter(this, void 0, void 0, function () {
            var mesh, values, isGeoTexture, mode, webgl, ctx, t, n, tmpV, stride, colorType, overpaintType, transparencyType, uAlpha, aTransform, instanceCount, metalness, roughness, interpolatedColors, interpolatedOverpaint, stride_1, interpolatedTransparency, stride_2, _loop_1, this_1, instanceIndex;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mesh = input.mesh, values = input.values, isGeoTexture = input.isGeoTexture, mode = input.mode, webgl = input.webgl, ctx = input.ctx;
                        if (mode !== 'triangles')
                            return [2 /*return*/];
                        t = Mat4();
                        n = Mat3();
                        tmpV = Vec3();
                        stride = isGeoTexture ? 4 : 3;
                        colorType = values.dColorType.ref.value;
                        overpaintType = values.dOverpaintType.ref.value;
                        transparencyType = values.dTransparencyType.ref.value;
                        uAlpha = values.uAlpha.ref.value;
                        aTransform = values.aTransform.ref.value;
                        instanceCount = values.uInstanceCount.ref.value;
                        metalness = values.uMetalness.ref.value;
                        roughness = values.uRoughness.ref.value;
                        if (webgl && mesh && (colorType === 'volume' || colorType === 'volumeInstance')) {
                            interpolatedColors = UsdzExporter.getInterpolatedColors(webgl, { vertices: mesh.vertices, vertexCount: mesh.vertexCount, values: values, stride: stride, colorType: colorType });
                        }
                        if (webgl && mesh && overpaintType === 'volumeInstance') {
                            stride_1 = isGeoTexture ? 4 : 3;
                            interpolatedOverpaint = UsdzExporter.getInterpolatedOverpaint(webgl, { vertices: mesh.vertices, vertexCount: mesh.vertexCount, values: values, stride: stride_1, colorType: overpaintType });
                        }
                        if (webgl && mesh && transparencyType === 'volumeInstance') {
                            stride_2 = isGeoTexture ? 4 : 3;
                            interpolatedTransparency = UsdzExporter.getInterpolatedTransparency(webgl, { vertices: mesh.vertices, vertexCount: mesh.vertexCount, values: values, stride: stride_2, colorType: transparencyType });
                        }
                        return [4 /*yield*/, ctx.update({ isIndeterminate: false, current: 0, max: instanceCount })];
                    case 1:
                        _a.sent();
                        _loop_1 = function (instanceIndex) {
                            var _b, vertices, normals, indices, groups, vertexCount, drawCount, vertexBuilder, normalBuilder, indexBuilder, i, i, geoData, i, v, quantizedColors, i, v, color, faceIndicesByMaterial, i, color, transparency, alpha, materialKey, faceIndices, materialBinding, materialKey, geomSubsets_1;
                            return __generator(this, function (_c) {
                                switch (_c.label) {
                                    case 0:
                                        if (!ctx.shouldUpdate) return [3 /*break*/, 2];
                                        return [4 /*yield*/, ctx.update({ current: instanceIndex + 1 })];
                                    case 1:
                                        _c.sent();
                                        _c.label = 2;
                                    case 2:
                                        _b = UsdzExporter.getInstance(input, instanceIndex), vertices = _b.vertices, normals = _b.normals, indices = _b.indices, groups = _b.groups, vertexCount = _b.vertexCount, drawCount = _b.drawCount;
                                        Mat4.fromArray(t, aTransform, instanceIndex * 16);
                                        Mat4.mul(t, this_1.centerTransform, t);
                                        mat3directionTransform(n, t);
                                        vertexBuilder = StringBuilder.create();
                                        normalBuilder = StringBuilder.create();
                                        indexBuilder = StringBuilder.create();
                                        // position
                                        for (i = 0; i < vertexCount; ++i) {
                                            v3transformMat4(tmpV, v3fromArray(tmpV, vertices, i * stride), t);
                                            StringBuilder.writeSafe(vertexBuilder, (i === 0) ? '(' : ',(');
                                            StringBuilder.writeFloat(vertexBuilder, tmpV[0], 10000);
                                            StringBuilder.writeSafe(vertexBuilder, ',');
                                            StringBuilder.writeFloat(vertexBuilder, tmpV[1], 10000);
                                            StringBuilder.writeSafe(vertexBuilder, ',');
                                            StringBuilder.writeFloat(vertexBuilder, tmpV[2], 10000);
                                            StringBuilder.writeSafe(vertexBuilder, ')');
                                        }
                                        // normal
                                        for (i = 0; i < vertexCount; ++i) {
                                            v3transformMat3(tmpV, v3fromArray(tmpV, normals, i * stride), n);
                                            StringBuilder.writeSafe(normalBuilder, (i === 0) ? '(' : ',(');
                                            StringBuilder.writeFloat(normalBuilder, tmpV[0], 100);
                                            StringBuilder.writeSafe(normalBuilder, ',');
                                            StringBuilder.writeFloat(normalBuilder, tmpV[1], 100);
                                            StringBuilder.writeSafe(normalBuilder, ',');
                                            StringBuilder.writeFloat(normalBuilder, tmpV[2], 100);
                                            StringBuilder.writeSafe(normalBuilder, ')');
                                        }
                                        geoData = { values: values, groups: groups, vertexCount: vertexCount, instanceIndex: instanceIndex, isGeoTexture: isGeoTexture, mode: mode };
                                        // face
                                        for (i = 0; i < drawCount; ++i) {
                                            v = isGeoTexture ? i : indices[i];
                                            if (i > 0)
                                                StringBuilder.writeSafe(indexBuilder, ',');
                                            StringBuilder.writeInteger(indexBuilder, v);
                                        }
                                        quantizedColors = new Uint8Array(drawCount * 3);
                                        for (i = 0; i < drawCount; i += 3) {
                                            v = isGeoTexture ? i : indices[i];
                                            color = UsdzExporter.getColor(v, geoData, interpolatedColors, interpolatedOverpaint);
                                            Color.toArray(color, quantizedColors, i);
                                        }
                                        UsdzExporter.quantizeColors(quantizedColors, vertexCount);
                                        faceIndicesByMaterial = new Map();
                                        for (i = 0; i < drawCount; i += 3) {
                                            color = Color.fromArray(quantizedColors, i);
                                            transparency = UsdzExporter.getTransparency(i, geoData, interpolatedTransparency);
                                            alpha = Math.round(uAlpha * (1 - transparency) * 10) / 10;
                                            materialKey = this_1.addMaterial(color, alpha, metalness, roughness);
                                            faceIndices = faceIndicesByMaterial.get(materialKey);
                                            if (faceIndices === undefined) {
                                                faceIndices = [];
                                                faceIndicesByMaterial.set(materialKey, faceIndices);
                                            }
                                            faceIndices.push(i / 3);
                                        }
                                        materialBinding = void 0;
                                        if (faceIndicesByMaterial.size === 1) {
                                            materialKey = faceIndicesByMaterial.keys().next().value;
                                            materialBinding = "rel material:binding = </material".concat(materialKey, ">");
                                        }
                                        else {
                                            geomSubsets_1 = [];
                                            faceIndicesByMaterial.forEach(function (faceIndices, materialKey) {
                                                geomSubsets_1.push("\n    def GeomSubset \"g".concat(materialKey, "\"\n    {\n        uniform token elementType = \"face\"\n        uniform token familyName = \"materialBind\"\n        int[] indices = [").concat(faceIndices.join(','), "]\n        rel material:binding = </material").concat(materialKey, ">\n    }\n"));
                                            });
                                            materialBinding = geomSubsets_1.join('');
                                        }
                                        this_1.meshes.push("\ndef Mesh \"mesh".concat(this_1.meshes.length, "\"\n{\n    int[] faceVertexCounts = [").concat(new Array(drawCount / 3).fill(3).join(','), "]\n    int[] faceVertexIndices = [").concat(StringBuilder.getString(indexBuilder), "]\n    point3f[] points = [").concat(StringBuilder.getString(vertexBuilder), "]\n    normal3f[] primvars:normals = [").concat(StringBuilder.getString(normalBuilder), "] (\n        interpolation = \"vertex\"\n    )\n    uniform token subdivisionScheme = \"none\"\n    ").concat(materialBinding, "\n}\n"));
                                        return [2 /*return*/];
                                }
                            });
                        };
                        this_1 = this;
                        instanceIndex = 0;
                        _a.label = 2;
                    case 2:
                        if (!(instanceIndex < instanceCount)) return [3 /*break*/, 5];
                        return [5 /*yield**/, _loop_1(instanceIndex)];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4:
                        ++instanceIndex;
                        return [3 /*break*/, 2];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    UsdzExporter.prototype.getData = function (ctx) {
        return __awaiter(this, void 0, void 0, function () {
            var header, usda, usdaData, zipDataObj;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        header = "#usda 1.0\n(\n    customLayerData = {\n        string creator = \"Mol* ".concat(PLUGIN_VERSION, "\"\n    }\n    metersPerUnit = 1\n)\n");
                        usda = __spreadArray(__spreadArray([header], this.materials, true), this.meshes, true).join('');
                        usdaData = new Uint8Array(usda.length);
                        asciiWrite(usdaData, usda);
                        zipDataObj = (_a = {},
                            _a['model.usda'] = usdaData,
                            _a);
                        _b = {};
                        return [4 /*yield*/, zip(ctx, zipDataObj, true)];
                    case 1: return [2 /*return*/, (_b.usdz = _c.sent(),
                            _b)];
                }
            });
        });
    };
    UsdzExporter.prototype.getBlob = function (ctx) {
        return __awaiter(this, void 0, void 0, function () {
            var usdz;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getData(ctx)];
                    case 1:
                        usdz = (_a.sent()).usdz;
                        return [2 /*return*/, new Blob([usdz], { type: 'model/vnd.usdz+zip' })];
                }
            });
        });
    };
    return UsdzExporter;
}(MeshExporter));
export { UsdzExporter };
