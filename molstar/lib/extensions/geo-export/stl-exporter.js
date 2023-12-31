/**
 * Copyright (c) 2021-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Sukolsak Sakshuwong <sukolsak@stanford.edu>
 */
import { __awaiter, __extends, __generator } from "tslib";
import { asciiWrite } from '../../mol-io/common/ascii';
import { Vec3, Mat4 } from '../../mol-math/linear-algebra';
import { PLUGIN_VERSION } from '../../mol-plugin/version';
import { MeshExporter } from './mesh-exporter';
// avoiding namespace lookup improved performance in Chrome (Aug 2020)
var v3fromArray = Vec3.fromArray;
var v3transformMat4 = Vec3.transformMat4;
var v3triangleNormal = Vec3.triangleNormal;
var v3toArray = Vec3.toArray;
var StlExporter = /** @class */ (function (_super) {
    __extends(StlExporter, _super);
    function StlExporter(boundingBox) {
        var _this = _super.call(this) || this;
        _this.fileExtension = 'stl';
        _this.triangleBuffers = [];
        _this.triangleCount = 0;
        var tmpV = Vec3();
        Vec3.add(tmpV, boundingBox.min, boundingBox.max);
        Vec3.scale(tmpV, tmpV, -0.5);
        _this.centerTransform = Mat4.fromTranslation(Mat4(), tmpV);
        return _this;
    }
    StlExporter.prototype.addMeshWithColors = function (input) {
        return __awaiter(this, void 0, void 0, function () {
            var values, isGeoTexture, mode, ctx, t, tmpV, v1, v2, v3, stride, aTransform, instanceCount, instanceIndex, _a, vertices, indices, vertexCount, drawCount, vertexArray, i, triangleBuffer, dataView, i, byteOffset;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        values = input.values, isGeoTexture = input.isGeoTexture, mode = input.mode, ctx = input.ctx;
                        if (mode !== 'triangles')
                            return [2 /*return*/];
                        t = Mat4();
                        tmpV = Vec3();
                        v1 = Vec3();
                        v2 = Vec3();
                        v3 = Vec3();
                        stride = isGeoTexture ? 4 : 3;
                        aTransform = values.aTransform.ref.value;
                        instanceCount = values.uInstanceCount.ref.value;
                        instanceIndex = 0;
                        _b.label = 1;
                    case 1:
                        if (!(instanceIndex < instanceCount)) return [3 /*break*/, 5];
                        if (!ctx.shouldUpdate) return [3 /*break*/, 3];
                        return [4 /*yield*/, ctx.update({ current: instanceIndex + 1 })];
                    case 2:
                        _b.sent();
                        _b.label = 3;
                    case 3:
                        _a = StlExporter.getInstance(input, instanceIndex), vertices = _a.vertices, indices = _a.indices, vertexCount = _a.vertexCount, drawCount = _a.drawCount;
                        Mat4.fromArray(t, aTransform, instanceIndex * 16);
                        Mat4.mul(t, this.centerTransform, t);
                        vertexArray = new Float32Array(vertexCount * 3);
                        for (i = 0; i < vertexCount; ++i) {
                            v3transformMat4(tmpV, v3fromArray(tmpV, vertices, i * stride), t);
                            v3toArray(tmpV, vertexArray, i * 3);
                        }
                        triangleBuffer = new ArrayBuffer(50 * drawCount);
                        dataView = new DataView(triangleBuffer);
                        for (i = 0; i < drawCount; i += 3) {
                            v3fromArray(v1, vertexArray, (isGeoTexture ? i : indices[i]) * 3);
                            v3fromArray(v2, vertexArray, (isGeoTexture ? i + 1 : indices[i + 1]) * 3);
                            v3fromArray(v3, vertexArray, (isGeoTexture ? i + 2 : indices[i + 2]) * 3);
                            v3triangleNormal(tmpV, v1, v2, v3);
                            byteOffset = 50 * i;
                            dataView.setFloat32(byteOffset, tmpV[0], true);
                            dataView.setFloat32(byteOffset + 4, tmpV[1], true);
                            dataView.setFloat32(byteOffset + 8, tmpV[2], true);
                            dataView.setFloat32(byteOffset + 12, v1[0], true);
                            dataView.setFloat32(byteOffset + 16, v1[1], true);
                            dataView.setFloat32(byteOffset + 20, v1[2], true);
                            dataView.setFloat32(byteOffset + 24, v2[0], true);
                            dataView.setFloat32(byteOffset + 28, v2[1], true);
                            dataView.setFloat32(byteOffset + 32, v2[2], true);
                            dataView.setFloat32(byteOffset + 36, v3[0], true);
                            dataView.setFloat32(byteOffset + 40, v3[1], true);
                            dataView.setFloat32(byteOffset + 44, v3[2], true);
                        }
                        this.triangleBuffers.push(triangleBuffer);
                        this.triangleCount += drawCount;
                        _b.label = 4;
                    case 4:
                        ++instanceIndex;
                        return [3 /*break*/, 1];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    StlExporter.prototype.getData = function () {
        return __awaiter(this, void 0, void 0, function () {
            var stl, dataView, byteOffset, _i, _a, buffer;
            return __generator(this, function (_b) {
                stl = new Uint8Array(84 + 50 * this.triangleCount);
                asciiWrite(stl, "Exported from Mol* ".concat(PLUGIN_VERSION));
                dataView = new DataView(stl.buffer);
                dataView.setUint32(80, this.triangleCount, true);
                byteOffset = 84;
                for (_i = 0, _a = this.triangleBuffers; _i < _a.length; _i++) {
                    buffer = _a[_i];
                    stl.set(new Uint8Array(buffer), byteOffset);
                    byteOffset += buffer.byteLength;
                }
                return [2 /*return*/, { stl: stl }];
            });
        });
    };
    StlExporter.prototype.getBlob = function (ctx) {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = Blob.bind;
                        return [4 /*yield*/, this.getData()];
                    case 1: return [2 /*return*/, new (_a.apply(Blob, [void 0, [(_b.sent()).stl], { type: 'model/stl' }]))()];
                }
            });
        });
    };
    return StlExporter;
}(MeshExporter));
export { StlExporter };
