/**
 * Copyright (c) 2021-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Sukolsak Sakshuwong <sukolsak@stanford.edu>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { __awaiter, __extends, __generator, __spreadArray } from "tslib";
import { asciiWrite } from '../../mol-io/common/ascii';
import { IsNativeEndianLittle, flipByteOrder } from '../../mol-io/common/binary';
import { Vec3, Mat4 } from '../../mol-math/linear-algebra';
import { PLUGIN_VERSION } from '../../mol-plugin/version';
import { Color } from '../../mol-util/color/color';
import { fillSerial } from '../../mol-util/array';
import { assertUnreachable } from '../../mol-util/type-helpers';
import { MeshExporter } from './mesh-exporter';
// avoiding namespace lookup improved performance in Chrome (Aug 2020)
var v3fromArray = Vec3.fromArray;
var v3normalize = Vec3.normalize;
var v3toArray = Vec3.toArray;
// https://github.com/KhronosGroup/glTF/tree/master/specification/2.0
var UNSIGNED_BYTE = 5121;
var UNSIGNED_INT = 5125;
var FLOAT = 5126;
var ARRAY_BUFFER = 34962;
var ELEMENT_ARRAY_BUFFER = 34963;
var GLTF_MAGIC_BYTE = 0x46546C67;
var JSON_CHUNK_TYPE = 0x4E4F534A;
var BIN_CHUNK_TYPE = 0x004E4942;
var JSON_PAD_CHAR = 0x20;
var BIN_PAD_CHAR = 0x00;
function getPrimitiveMode(mode) {
    switch (mode) {
        case 'points': return 0;
        case 'lines': return 1;
        case 'triangles': return 4;
        default: assertUnreachable(mode);
    }
}
var GlbExporter = /** @class */ (function (_super) {
    __extends(GlbExporter, _super);
    function GlbExporter(boundingBox) {
        var _this = _super.call(this) || this;
        _this.fileExtension = 'glb';
        _this.nodes = [];
        _this.meshes = [];
        _this.materials = [];
        _this.materialMap = new Map();
        _this.accessors = [];
        _this.bufferViews = [];
        _this.binaryBuffer = [];
        _this.byteOffset = 0;
        var tmpV = Vec3();
        Vec3.add(tmpV, boundingBox.min, boundingBox.max);
        Vec3.scale(tmpV, tmpV, -0.5);
        _this.centerTransform = Mat4.fromTranslation(Mat4(), tmpV);
        return _this;
    }
    GlbExporter.vec3MinMax = function (a) {
        var min = [Infinity, Infinity, Infinity];
        var max = [-Infinity, -Infinity, -Infinity];
        for (var i = 0, il = a.length; i < il; i += 3) {
            for (var j = 0; j < 3; ++j) {
                min[j] = Math.min(a[i + j], min[j]);
                max[j] = Math.max(a[i + j], max[j]);
            }
        }
        return [min, max];
    };
    GlbExporter.prototype.addBuffer = function (buffer, componentType, type, count, target, min, max, normalized) {
        this.binaryBuffer.push(buffer);
        var bufferViewOffset = this.bufferViews.length;
        this.bufferViews.push({
            buffer: 0,
            byteOffset: this.byteOffset,
            byteLength: buffer.byteLength,
            target: target
        });
        this.byteOffset += buffer.byteLength;
        var accessorOffset = this.accessors.length;
        this.accessors.push({
            bufferView: bufferViewOffset,
            byteOffset: 0,
            componentType: componentType,
            count: count,
            type: type,
            min: min,
            max: max,
            normalized: normalized
        });
        return accessorOffset;
    };
    GlbExporter.prototype.addGeometryBuffers = function (vertices, normals, indices, vertexCount, drawCount, isGeoTexture) {
        var tmpV = Vec3();
        var stride = isGeoTexture ? 4 : 3;
        var vertexArray = new Float32Array(vertexCount * 3);
        var normalArray;
        var indexArray;
        // position
        for (var i = 0; i < vertexCount; ++i) {
            v3fromArray(tmpV, vertices, i * stride);
            v3toArray(tmpV, vertexArray, i * 3);
        }
        // normal
        if (normals) {
            normalArray = new Float32Array(vertexCount * 3);
            for (var i = 0; i < vertexCount; ++i) {
                v3fromArray(tmpV, normals, i * stride);
                v3normalize(tmpV, tmpV);
                v3toArray(tmpV, normalArray, i * 3);
            }
        }
        // face
        if (!isGeoTexture && indices) {
            indexArray = indices.slice(0, drawCount);
        }
        var _a = GlbExporter.vec3MinMax(vertexArray), vertexMin = _a[0], vertexMax = _a[1];
        var vertexBuffer = vertexArray.buffer;
        var normalBuffer = normalArray === null || normalArray === void 0 ? void 0 : normalArray.buffer;
        var indexBuffer = (isGeoTexture || !indexArray) ? undefined : indexArray.buffer;
        if (!IsNativeEndianLittle) {
            vertexBuffer = flipByteOrder(new Uint8Array(vertexBuffer), 4);
            if (normalBuffer)
                normalBuffer = flipByteOrder(new Uint8Array(normalBuffer), 4);
            if (!isGeoTexture)
                indexBuffer = flipByteOrder(new Uint8Array(indexBuffer), 4);
        }
        return {
            vertexAccessorIndex: this.addBuffer(vertexBuffer, FLOAT, 'VEC3', vertexCount, ARRAY_BUFFER, vertexMin, vertexMax),
            normalAccessorIndex: normalBuffer ? this.addBuffer(normalBuffer, FLOAT, 'VEC3', vertexCount, ARRAY_BUFFER) : undefined,
            indexAccessorIndex: (isGeoTexture || !indexBuffer) ? undefined : this.addBuffer(indexBuffer, UNSIGNED_INT, 'SCALAR', drawCount, ELEMENT_ARRAY_BUFFER)
        };
    };
    GlbExporter.prototype.addColorBuffer = function (geoData, interpolatedColors, interpolatedOverpaint, interpolatedTransparency) {
        var values = geoData.values, vertexCount = geoData.vertexCount;
        var uAlpha = values.uAlpha.ref.value;
        var colorArray = new Uint8Array(vertexCount * 4);
        for (var i = 0; i < vertexCount; ++i) {
            var color = GlbExporter.getColor(i, geoData, interpolatedColors, interpolatedOverpaint);
            var transparency = GlbExporter.getTransparency(i, geoData, interpolatedTransparency);
            var alpha = uAlpha * (1 - transparency);
            color = Color.sRGBToLinear(color);
            Color.toArray(color, colorArray, i * 4);
            colorArray[i * 4 + 3] = Math.round(alpha * 255);
        }
        var colorBuffer = colorArray.buffer;
        if (!IsNativeEndianLittle) {
            colorBuffer = flipByteOrder(new Uint8Array(colorBuffer), 4);
        }
        return this.addBuffer(colorBuffer, UNSIGNED_BYTE, 'VEC4', vertexCount, ARRAY_BUFFER, undefined, undefined, true);
    };
    GlbExporter.prototype.addMaterial = function (metalness, roughness, doubleSided, alpha) {
        var hash = "".concat(metalness, "|").concat(roughness, "|").concat(doubleSided);
        if (!this.materialMap.has(hash)) {
            this.materialMap.set(hash, this.materials.length);
            this.materials.push({
                pbrMetallicRoughness: {
                    baseColorFactor: [1, 1, 1, 1],
                    metallicFactor: metalness,
                    roughnessFactor: roughness
                },
                doubleSided: doubleSided,
                alphaMode: alpha ? 'BLEND' : 'OPAQUE',
            });
        }
        return this.materialMap.get(hash);
    };
    GlbExporter.prototype.addMeshWithColors = function (input) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var mesh, values, isGeoTexture, mode, webgl, ctx, t, colorType, overpaintType, transparencyType, dTransparency, aTransform, instanceCount, metalness, roughness, doubleSided, alpha, material, interpolatedColors, stride, interpolatedOverpaint, stride, interpolatedTransparency, stride, sameGeometryBuffers, sameColorBuffer, vertexAccessorIndex, normalAccessorIndex, indexAccessorIndex, colorAccessorIndex, meshIndex, instanceIndex, _b, vertices, normals, indices, groups, vertexCount, drawCount, accessorIndices, node;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        mesh = input.mesh, values = input.values, isGeoTexture = input.isGeoTexture, mode = input.mode, webgl = input.webgl, ctx = input.ctx;
                        t = Mat4();
                        colorType = values.dColorType.ref.value;
                        overpaintType = values.dOverpaintType.ref.value;
                        transparencyType = values.dTransparencyType.ref.value;
                        dTransparency = values.dTransparency.ref.value;
                        aTransform = values.aTransform.ref.value;
                        instanceCount = values.uInstanceCount.ref.value;
                        metalness = values.uMetalness.ref.value;
                        roughness = values.uRoughness.ref.value;
                        doubleSided = ((_a = values.uDoubleSided) === null || _a === void 0 ? void 0 : _a.ref.value) || values.hasReflection.ref.value;
                        alpha = values.uAlpha.ref.value < 1;
                        material = this.addMaterial(metalness, roughness, doubleSided, alpha);
                        if (webgl && mesh && (colorType === 'volume' || colorType === 'volumeInstance')) {
                            stride = isGeoTexture ? 4 : 3;
                            interpolatedColors = GlbExporter.getInterpolatedColors(webgl, { vertices: mesh.vertices, vertexCount: mesh.vertexCount, values: values, stride: stride, colorType: colorType });
                        }
                        if (webgl && mesh && overpaintType === 'volumeInstance') {
                            stride = isGeoTexture ? 4 : 3;
                            interpolatedOverpaint = GlbExporter.getInterpolatedOverpaint(webgl, { vertices: mesh.vertices, vertexCount: mesh.vertexCount, values: values, stride: stride, colorType: overpaintType });
                        }
                        if (webgl && mesh && transparencyType === 'volumeInstance') {
                            stride = isGeoTexture ? 4 : 3;
                            interpolatedTransparency = GlbExporter.getInterpolatedTransparency(webgl, { vertices: mesh.vertices, vertexCount: mesh.vertexCount, values: values, stride: stride, colorType: transparencyType });
                        }
                        sameGeometryBuffers = mesh !== undefined;
                        sameColorBuffer = sameGeometryBuffers && colorType !== 'instance' && !colorType.endsWith('Instance') && !dTransparency;
                        return [4 /*yield*/, ctx.update({ isIndeterminate: false, current: 0, max: instanceCount })];
                    case 1:
                        _c.sent();
                        instanceIndex = 0;
                        _c.label = 2;
                    case 2:
                        if (!(instanceIndex < instanceCount)) return [3 /*break*/, 6];
                        if (!ctx.shouldUpdate) return [3 /*break*/, 4];
                        return [4 /*yield*/, ctx.update({ current: instanceIndex + 1 })];
                    case 3:
                        _c.sent();
                        _c.label = 4;
                    case 4:
                        // create a glTF mesh if needed
                        if (instanceIndex === 0 || !sameGeometryBuffers || !sameColorBuffer) {
                            _b = GlbExporter.getInstance(input, instanceIndex), vertices = _b.vertices, normals = _b.normals, indices = _b.indices, groups = _b.groups, vertexCount = _b.vertexCount, drawCount = _b.drawCount;
                            // create geometry buffers if needed
                            if (instanceIndex === 0 || !sameGeometryBuffers) {
                                accessorIndices = this.addGeometryBuffers(vertices, normals, indices, vertexCount, drawCount, isGeoTexture);
                                vertexAccessorIndex = accessorIndices.vertexAccessorIndex;
                                normalAccessorIndex = accessorIndices.normalAccessorIndex;
                                indexAccessorIndex = accessorIndices.indexAccessorIndex;
                            }
                            // create a color buffer if needed
                            if (instanceIndex === 0 || !sameColorBuffer) {
                                colorAccessorIndex = this.addColorBuffer({ values: values, groups: groups, vertexCount: vertexCount, instanceIndex: instanceIndex, isGeoTexture: isGeoTexture, mode: mode }, interpolatedColors, interpolatedOverpaint, interpolatedTransparency);
                            }
                            // glTF mesh
                            meshIndex = this.meshes.length;
                            this.meshes.push({
                                primitives: [{
                                        attributes: {
                                            POSITION: vertexAccessorIndex,
                                            NORMAL: normalAccessorIndex,
                                            COLOR_0: colorAccessorIndex
                                        },
                                        indices: indexAccessorIndex,
                                        material: material,
                                        mode: getPrimitiveMode(mode),
                                    }]
                            });
                        }
                        // node
                        Mat4.fromArray(t, aTransform, instanceIndex * 16);
                        Mat4.mul(t, this.centerTransform, t);
                        node = {
                            mesh: meshIndex,
                            matrix: t.slice()
                        };
                        this.nodes.push(node);
                        _c.label = 5;
                    case 5:
                        ++instanceIndex;
                        return [3 /*break*/, 2];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    GlbExporter.prototype.getData = function () {
        return __awaiter(this, void 0, void 0, function () {
            var binaryBufferLength, gltf, createChunk, jsonString, jsonBuffer, _a, jsonChunk, jsonChunkLength, _b, binaryChunk, binaryChunkLength, glbBufferLength, header, headerDataView, glbBuffer, glb, offset, _i, glbBuffer_1, buffer;
            return __generator(this, function (_c) {
                binaryBufferLength = this.byteOffset;
                gltf = {
                    asset: {
                        version: '2.0',
                        generator: "Mol* ".concat(PLUGIN_VERSION)
                    },
                    scenes: [{
                            nodes: fillSerial(new Array(this.nodes.length))
                        }],
                    nodes: this.nodes,
                    meshes: this.meshes,
                    buffers: [{
                            byteLength: binaryBufferLength,
                        }],
                    bufferViews: this.bufferViews,
                    accessors: this.accessors,
                    materials: this.materials
                };
                createChunk = function (chunkType, data, byteLength, padChar) {
                    var padding = null;
                    if (byteLength % 4 !== 0) {
                        var pad = 4 - (byteLength % 4);
                        byteLength += pad;
                        padding = new Uint8Array(pad);
                        padding.fill(padChar);
                    }
                    var preamble = new ArrayBuffer(8);
                    var preambleDataView = new DataView(preamble);
                    preambleDataView.setUint32(0, byteLength, true);
                    preambleDataView.setUint32(4, chunkType, true);
                    var chunk = __spreadArray([preamble], data, true);
                    if (padding) {
                        chunk.push(padding.buffer);
                    }
                    return [chunk, 8 + byteLength];
                };
                jsonString = JSON.stringify(gltf);
                jsonBuffer = new Uint8Array(jsonString.length);
                asciiWrite(jsonBuffer, jsonString);
                _a = createChunk(JSON_CHUNK_TYPE, [jsonBuffer.buffer], jsonBuffer.length, JSON_PAD_CHAR), jsonChunk = _a[0], jsonChunkLength = _a[1];
                _b = createChunk(BIN_CHUNK_TYPE, this.binaryBuffer, binaryBufferLength, BIN_PAD_CHAR), binaryChunk = _b[0], binaryChunkLength = _b[1];
                glbBufferLength = 12 + jsonChunkLength + binaryChunkLength;
                header = new ArrayBuffer(12);
                headerDataView = new DataView(header);
                headerDataView.setUint32(0, GLTF_MAGIC_BYTE, true); // magic number "glTF"
                headerDataView.setUint32(4, 2, true); // version
                headerDataView.setUint32(8, glbBufferLength, true); // length
                glbBuffer = __spreadArray(__spreadArray([header], jsonChunk, true), binaryChunk, true);
                glb = new Uint8Array(glbBufferLength);
                offset = 0;
                for (_i = 0, glbBuffer_1 = glbBuffer; _i < glbBuffer_1.length; _i++) {
                    buffer = glbBuffer_1[_i];
                    glb.set(new Uint8Array(buffer), offset);
                    offset += buffer.byteLength;
                }
                return [2 /*return*/, { glb: glb }];
            });
        });
    };
    GlbExporter.prototype.getBlob = function (ctx) {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = Blob.bind;
                        return [4 /*yield*/, this.getData()];
                    case 1: return [2 /*return*/, new (_a.apply(Blob, [void 0, [(_b.sent()).glb], { type: 'model/gltf-binary' }]))()];
                }
            });
        });
    };
    return GlbExporter;
}(MeshExporter));
export { GlbExporter };
