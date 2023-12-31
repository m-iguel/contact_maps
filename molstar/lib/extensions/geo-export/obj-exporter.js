/**
 * Copyright (c) 2021-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Sukolsak Sakshuwong <sukolsak@stanford.edu>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { __awaiter, __extends, __generator } from "tslib";
import { asciiWrite } from '../../mol-io/common/ascii';
import { Vec3, Mat3, Mat4 } from '../../mol-math/linear-algebra';
import { StringBuilder } from '../../mol-util';
import { Color } from '../../mol-util/color/color';
import { zip } from '../../mol-util/zip/zip';
import { MeshExporter } from './mesh-exporter';
// avoiding namespace lookup improved performance in Chrome (Aug 2020)
var v3fromArray = Vec3.fromArray;
var v3transformMat4 = Vec3.transformMat4;
var v3transformMat3 = Vec3.transformMat3;
var mat3directionTransform = Mat3.directionTransform;
var ObjExporter = /** @class */ (function (_super) {
    __extends(ObjExporter, _super);
    function ObjExporter(filename, boundingBox) {
        var _this = _super.call(this) || this;
        _this.filename = filename;
        _this.fileExtension = 'zip';
        _this.obj = StringBuilder.create();
        _this.mtl = StringBuilder.create();
        _this.vertexOffset = 0;
        _this.materialSet = new Set();
        StringBuilder.writeSafe(_this.obj, "mtllib ".concat(filename, ".mtl\n"));
        var tmpV = Vec3();
        Vec3.add(tmpV, boundingBox.min, boundingBox.max);
        Vec3.scale(tmpV, tmpV, -0.5);
        _this.centerTransform = Mat4.fromTranslation(Mat4(), tmpV);
        return _this;
    }
    ObjExporter.prototype.updateMaterial = function (color, alpha) {
        if (this.currentColor === color && this.currentAlpha === alpha)
            return;
        this.currentColor = color;
        this.currentAlpha = alpha;
        var material = Color.toHexString(color) + alpha;
        StringBuilder.writeSafe(this.obj, "usemtl ".concat(material));
        StringBuilder.newline(this.obj);
        if (!this.materialSet.has(material)) {
            this.materialSet.add(material);
            var _a = Color.toRgbNormalized(color).map(function (v) { return Math.round(v * 1000) / 1000; }), r = _a[0], g = _a[1], b = _a[2];
            var mtl = this.mtl;
            StringBuilder.writeSafe(mtl, "newmtl ".concat(material, "\n"));
            StringBuilder.writeSafe(mtl, 'illum 2\n'); // illumination model
            StringBuilder.writeSafe(mtl, 'Ns 163\n'); // specular exponent
            StringBuilder.writeSafe(mtl, 'Ni 0.001\n'); // optical density a.k.a. index of refraction
            StringBuilder.writeSafe(mtl, 'Ka 0 0 0\n'); // ambient reflectivity
            StringBuilder.writeSafe(mtl, 'Kd '); // diffuse reflectivity
            StringBuilder.writeFloat(mtl, r, 1000);
            StringBuilder.whitespace1(mtl);
            StringBuilder.writeFloat(mtl, g, 1000);
            StringBuilder.whitespace1(mtl);
            StringBuilder.writeFloat(mtl, b, 1000);
            StringBuilder.newline(mtl);
            StringBuilder.writeSafe(mtl, 'Ks 0.25 0.25 0.25\n'); // specular reflectivity
            StringBuilder.writeSafe(mtl, 'd '); // dissolve
            StringBuilder.writeFloat(mtl, alpha, 1000);
            StringBuilder.newline(mtl);
        }
    };
    ObjExporter.prototype.addMeshWithColors = function (input) {
        return __awaiter(this, void 0, void 0, function () {
            var mesh, values, isGeoTexture, mode, webgl, ctx, obj, t, n, tmpV, stride, colorType, overpaintType, transparencyType, uAlpha, aTransform, instanceCount, interpolatedColors, interpolatedOverpaint, interpolatedTransparency, stride_1, instanceIndex, _a, vertices, normals, indices, groups, vertexCount, drawCount, i, i, geoData, quantizedColors, i, v, color, i, color, transparency, alpha, v1, v2, v3;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        mesh = input.mesh, values = input.values, isGeoTexture = input.isGeoTexture, mode = input.mode, webgl = input.webgl, ctx = input.ctx;
                        if (mode !== 'triangles')
                            return [2 /*return*/];
                        obj = this.obj;
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
                        if (webgl && mesh && (colorType === 'volume' || colorType === 'volumeInstance')) {
                            interpolatedColors = ObjExporter.getInterpolatedColors(webgl, { vertices: mesh.vertices, vertexCount: mesh.vertexCount, values: values, stride: stride, colorType: colorType });
                        }
                        if (webgl && mesh && overpaintType === 'volumeInstance') {
                            interpolatedOverpaint = ObjExporter.getInterpolatedOverpaint(webgl, { vertices: mesh.vertices, vertexCount: mesh.vertexCount, values: values, stride: stride, colorType: overpaintType });
                        }
                        if (webgl && mesh && transparencyType === 'volumeInstance') {
                            stride_1 = isGeoTexture ? 4 : 3;
                            interpolatedTransparency = ObjExporter.getInterpolatedTransparency(webgl, { vertices: mesh.vertices, vertexCount: mesh.vertexCount, values: values, stride: stride_1, colorType: transparencyType });
                        }
                        return [4 /*yield*/, ctx.update({ isIndeterminate: false, current: 0, max: instanceCount })];
                    case 1:
                        _b.sent();
                        instanceIndex = 0;
                        _b.label = 2;
                    case 2:
                        if (!(instanceIndex < instanceCount)) return [3 /*break*/, 6];
                        if (!ctx.shouldUpdate) return [3 /*break*/, 4];
                        return [4 /*yield*/, ctx.update({ current: instanceIndex + 1 })];
                    case 3:
                        _b.sent();
                        _b.label = 4;
                    case 4:
                        _a = ObjExporter.getInstance(input, instanceIndex), vertices = _a.vertices, normals = _a.normals, indices = _a.indices, groups = _a.groups, vertexCount = _a.vertexCount, drawCount = _a.drawCount;
                        Mat4.fromArray(t, aTransform, instanceIndex * 16);
                        Mat4.mul(t, this.centerTransform, t);
                        mat3directionTransform(n, t);
                        // position
                        for (i = 0; i < vertexCount; ++i) {
                            v3transformMat4(tmpV, v3fromArray(tmpV, vertices, i * stride), t);
                            StringBuilder.writeSafe(obj, 'v ');
                            StringBuilder.writeFloat(obj, tmpV[0], 1000);
                            StringBuilder.whitespace1(obj);
                            StringBuilder.writeFloat(obj, tmpV[1], 1000);
                            StringBuilder.whitespace1(obj);
                            StringBuilder.writeFloat(obj, tmpV[2], 1000);
                            StringBuilder.newline(obj);
                        }
                        // normal
                        for (i = 0; i < vertexCount; ++i) {
                            v3transformMat3(tmpV, v3fromArray(tmpV, normals, i * stride), n);
                            StringBuilder.writeSafe(obj, 'vn ');
                            StringBuilder.writeFloat(obj, tmpV[0], 100);
                            StringBuilder.whitespace1(obj);
                            StringBuilder.writeFloat(obj, tmpV[1], 100);
                            StringBuilder.whitespace1(obj);
                            StringBuilder.writeFloat(obj, tmpV[2], 100);
                            StringBuilder.newline(obj);
                        }
                        geoData = { values: values, groups: groups, vertexCount: vertexCount, instanceIndex: instanceIndex, isGeoTexture: isGeoTexture, mode: mode };
                        quantizedColors = new Uint8Array(drawCount * 3);
                        for (i = 0; i < drawCount; i += 3) {
                            v = isGeoTexture ? i : indices[i];
                            color = ObjExporter.getColor(v, geoData, interpolatedColors, interpolatedOverpaint);
                            Color.toArray(color, quantizedColors, i);
                        }
                        ObjExporter.quantizeColors(quantizedColors, vertexCount);
                        // face
                        for (i = 0; i < drawCount; i += 3) {
                            color = Color.fromArray(quantizedColors, i);
                            transparency = ObjExporter.getTransparency(i, geoData, interpolatedTransparency);
                            alpha = Math.round(uAlpha * (1 - transparency) * 10) / 10;
                            this.updateMaterial(color, alpha);
                            v1 = this.vertexOffset + (isGeoTexture ? i : indices[i]) + 1;
                            v2 = this.vertexOffset + (isGeoTexture ? i + 1 : indices[i + 1]) + 1;
                            v3 = this.vertexOffset + (isGeoTexture ? i + 2 : indices[i + 2]) + 1;
                            StringBuilder.writeSafe(obj, 'f ');
                            StringBuilder.writeInteger(obj, v1);
                            StringBuilder.writeSafe(obj, '//');
                            StringBuilder.writeIntegerAndSpace(obj, v1);
                            StringBuilder.writeInteger(obj, v2);
                            StringBuilder.writeSafe(obj, '//');
                            StringBuilder.writeIntegerAndSpace(obj, v2);
                            StringBuilder.writeInteger(obj, v3);
                            StringBuilder.writeSafe(obj, '//');
                            StringBuilder.writeInteger(obj, v3);
                            StringBuilder.newline(obj);
                        }
                        this.vertexOffset += vertexCount;
                        _b.label = 5;
                    case 5:
                        ++instanceIndex;
                        return [3 /*break*/, 2];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    ObjExporter.prototype.getData = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, {
                        obj: StringBuilder.getString(this.obj),
                        mtl: StringBuilder.getString(this.mtl)
                    }];
            });
        });
    };
    ObjExporter.prototype.getBlob = function (ctx) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, obj, mtl, objData, mtlData, zipDataObj, _b;
            var _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0: return [4 /*yield*/, this.getData()];
                    case 1:
                        _a = _d.sent(), obj = _a.obj, mtl = _a.mtl;
                        objData = new Uint8Array(obj.length);
                        asciiWrite(objData, obj);
                        mtlData = new Uint8Array(mtl.length);
                        asciiWrite(mtlData, mtl);
                        zipDataObj = (_c = {},
                            _c[this.filename + '.obj'] = objData,
                            _c[this.filename + '.mtl'] = mtlData,
                            _c);
                        _b = Blob.bind;
                        return [4 /*yield*/, zip(ctx, zipDataObj)];
                    case 2: return [2 /*return*/, new (_b.apply(Blob, [void 0, [_d.sent()], { type: 'application/zip' }]))()];
                }
            });
        });
    };
    return ObjExporter;
}(MeshExporter));
export { ObjExporter };
