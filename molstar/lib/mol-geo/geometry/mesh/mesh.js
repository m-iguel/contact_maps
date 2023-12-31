/**
 * Copyright (c) 2018-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { __assign } from "tslib";
import { ValueCell } from '../../../mol-util';
import { Vec3, Mat4, Mat3, Vec4 } from '../../../mol-math/linear-algebra';
import { Sphere3D } from '../../../mol-math/geometry';
import { transformPositionArray, transformDirectionArray, computeIndexedVertexNormals, createGroupMapping } from '../../util';
import { createMarkers } from '../marker-data';
import { LocationIterator, PositionLocation } from '../../util/location-iterator';
import { createColors } from '../color-data';
import { ChunkedArray, hashFnv32a, invertCantorPairing, sortedCantorPairing } from '../../../mol-data/util';
import { ParamDefinition as PD } from '../../../mol-util/param-definition';
import { calculateInvariantBoundingSphere, calculateTransformBoundingSphere } from '../../../mol-gl/renderable/util';
import { BaseGeometry } from '../base';
import { createEmptyOverpaint } from '../overpaint-data';
import { createEmptyTransparency } from '../transparency-data';
import { createEmptyClipping } from '../clipping-data';
import { arraySetAdd } from '../../../mol-util/array';
import { degToRad } from '../../../mol-math/misc';
import { createEmptySubstance } from '../substance-data';
export var Mesh;
(function (Mesh) {
    function create(vertices, indices, normals, groups, vertexCount, triangleCount, mesh) {
        return mesh ?
            update(vertices, indices, normals, groups, vertexCount, triangleCount, mesh) :
            fromArrays(vertices, indices, normals, groups, vertexCount, triangleCount);
    }
    Mesh.create = create;
    function createEmpty(mesh) {
        var vb = mesh ? mesh.vertexBuffer.ref.value : new Float32Array(0);
        var ib = mesh ? mesh.indexBuffer.ref.value : new Uint32Array(0);
        var nb = mesh ? mesh.normalBuffer.ref.value : new Float32Array(0);
        var gb = mesh ? mesh.groupBuffer.ref.value : new Float32Array(0);
        return create(vb, ib, nb, gb, 0, 0, mesh);
    }
    Mesh.createEmpty = createEmpty;
    function hashCode(mesh) {
        return hashFnv32a([
            mesh.vertexCount, mesh.triangleCount,
            mesh.vertexBuffer.ref.version, mesh.indexBuffer.ref.version,
            mesh.normalBuffer.ref.version, mesh.groupBuffer.ref.version
        ]);
    }
    function fromArrays(vertices, indices, normals, groups, vertexCount, triangleCount) {
        var boundingSphere = Sphere3D();
        var groupMapping;
        var currentHash = -1;
        var currentGroup = -1;
        var mesh = {
            kind: 'mesh',
            vertexCount: vertexCount,
            triangleCount: triangleCount,
            vertexBuffer: ValueCell.create(vertices),
            indexBuffer: ValueCell.create(indices),
            normalBuffer: ValueCell.create(normals),
            groupBuffer: ValueCell.create(groups),
            varyingGroup: ValueCell.create(false),
            get boundingSphere() {
                var newHash = hashCode(mesh);
                if (newHash !== currentHash) {
                    var b = calculateInvariantBoundingSphere(mesh.vertexBuffer.ref.value, mesh.vertexCount, 1);
                    Sphere3D.copy(boundingSphere, b);
                    currentHash = newHash;
                }
                return boundingSphere;
            },
            get groupMapping() {
                if (mesh.groupBuffer.ref.version !== currentGroup) {
                    groupMapping = createGroupMapping(mesh.groupBuffer.ref.value, mesh.vertexCount);
                    currentGroup = mesh.groupBuffer.ref.version;
                }
                return groupMapping;
            },
            setBoundingSphere: function (sphere) {
                Sphere3D.copy(boundingSphere, sphere);
                currentHash = hashCode(mesh);
            },
            meta: {}
        };
        return mesh;
    }
    function update(vertices, indices, normals, groups, vertexCount, triangleCount, mesh) {
        mesh.vertexCount = vertexCount;
        mesh.triangleCount = triangleCount;
        ValueCell.update(mesh.vertexBuffer, vertices);
        ValueCell.update(mesh.indexBuffer, indices);
        ValueCell.update(mesh.normalBuffer, normals);
        ValueCell.update(mesh.groupBuffer, groups);
        return mesh;
    }
    function computeNormals(mesh) {
        var vertexCount = mesh.vertexCount, triangleCount = mesh.triangleCount;
        var vertices = mesh.vertexBuffer.ref.value;
        var indices = mesh.indexBuffer.ref.value;
        var normals = mesh.normalBuffer.ref.value.length >= vertexCount * 3
            ? mesh.normalBuffer.ref.value
            : new Float32Array(vertexCount * 3);
        if (normals === mesh.normalBuffer.ref.value) {
            normals.fill(0, 0, vertexCount * 3);
        }
        computeIndexedVertexNormals(vertices, indices, normals, vertexCount, triangleCount);
        ValueCell.update(mesh.normalBuffer, normals);
    }
    Mesh.computeNormals = computeNormals;
    function checkForDuplicateVertices(mesh, fractionDigits) {
        if (fractionDigits === void 0) { fractionDigits = 3; }
        var v = mesh.vertexBuffer.ref.value;
        var map = new Map();
        var hash = function (v, d) { return "".concat(v[0].toFixed(d), "|").concat(v[1].toFixed(d), "|").concat(v[2].toFixed(d)); };
        var duplicates = 0;
        var a = Vec3();
        for (var i = 0, il = mesh.vertexCount; i < il; ++i) {
            Vec3.fromArray(a, v, i * 3);
            var k = hash(a, fractionDigits);
            var count = map.get(k);
            if (count !== undefined) {
                duplicates += 1;
                map.set(k, count + 1);
            }
            else {
                map.set(k, 1);
            }
        }
        return duplicates;
    }
    Mesh.checkForDuplicateVertices = checkForDuplicateVertices;
    var tmpMat3 = Mat3();
    function transform(mesh, t) {
        var v = mesh.vertexBuffer.ref.value;
        transformPositionArray(t, v, 0, mesh.vertexCount);
        if (!Mat4.isTranslationAndUniformScaling(t)) {
            var n = Mat3.directionTransform(tmpMat3, t);
            transformDirectionArray(n, mesh.normalBuffer.ref.value, 0, mesh.vertexCount);
        }
        ValueCell.update(mesh.vertexBuffer, v);
    }
    Mesh.transform = transform;
    /** Meshes may contain some original data in case any processing was done. */
    function getOriginalData(x) {
        var originalData = ('kind' in x ? x.meta : x.meta.ref.value).originalData;
        return originalData;
    }
    Mesh.getOriginalData = getOriginalData;
    /**
     * Ensure that each vertices of each triangle have the same group id.
     * Note that normals are copied over and can't be re-created from the new mesh.
     */
    function uniformTriangleGroup(mesh, splitTriangles) {
        if (splitTriangles === void 0) { splitTriangles = true; }
        var indexBuffer = mesh.indexBuffer, vertexBuffer = mesh.vertexBuffer, groupBuffer = mesh.groupBuffer, normalBuffer = mesh.normalBuffer, triangleCount = mesh.triangleCount, vertexCount = mesh.vertexCount;
        var ib = indexBuffer.ref.value;
        var vb = vertexBuffer.ref.value;
        var gb = groupBuffer.ref.value;
        var nb = normalBuffer.ref.value;
        // new
        var index = ChunkedArray.create(Uint32Array, 3, 1024, triangleCount);
        // re-use
        var vertex = ChunkedArray.create(Float32Array, 3, 1024, vb);
        vertex.currentIndex = vertexCount * 3;
        vertex.elementCount = vertexCount;
        var normal = ChunkedArray.create(Float32Array, 3, 1024, nb);
        normal.currentIndex = vertexCount * 3;
        normal.elementCount = vertexCount;
        var group = ChunkedArray.create(Float32Array, 1, 1024, gb);
        group.currentIndex = vertexCount;
        group.elementCount = vertexCount;
        var vi = Vec3();
        var vj = Vec3();
        var vk = Vec3();
        var ni = Vec3();
        var nj = Vec3();
        var nk = Vec3();
        function add(i) {
            Vec3.fromArray(vi, vb, i * 3);
            Vec3.fromArray(ni, nb, i * 3);
            ChunkedArray.add3(vertex, vi[0], vi[1], vi[2]);
            ChunkedArray.add3(normal, ni[0], ni[1], ni[2]);
        }
        function addMid(i, j) {
            Vec3.fromArray(vi, vb, i * 3);
            Vec3.fromArray(vj, vb, j * 3);
            Vec3.scale(vi, Vec3.add(vi, vi, vj), 0.5);
            Vec3.fromArray(ni, nb, i * 3);
            Vec3.fromArray(nj, nb, j * 3);
            Vec3.scale(ni, Vec3.add(ni, ni, nj), 0.5);
            ChunkedArray.add3(vertex, vi[0], vi[1], vi[2]);
            ChunkedArray.add3(normal, ni[0], ni[1], ni[2]);
        }
        function addCenter(i, j, k) {
            Vec3.fromArray(vi, vb, i * 3);
            Vec3.fromArray(vj, vb, j * 3);
            Vec3.fromArray(vk, vb, k * 3);
            Vec3.scale(vi, Vec3.add(vi, Vec3.add(vi, vi, vj), vk), 1 / 3);
            Vec3.fromArray(ni, nb, i * 3);
            Vec3.fromArray(nj, nb, j * 3);
            Vec3.fromArray(nk, nb, k * 3);
            Vec3.scale(ni, Vec3.add(ni, Vec3.add(ni, ni, nj), nk), 1 / 3);
            ChunkedArray.add3(vertex, vi[0], vi[1], vi[2]);
            ChunkedArray.add3(normal, ni[0], ni[1], ni[2]);
        }
        function split2(i0, i1, i2, g0, g1) {
            ++newTriangleCount;
            add(i0);
            addMid(i0, i1);
            addMid(i0, i2);
            ChunkedArray.add3(index, newVertexCount, newVertexCount + 1, newVertexCount + 2);
            for (var j = 0; j < 3; ++j)
                ChunkedArray.add(group, g0);
            newVertexCount += 3;
            newTriangleCount += 2;
            add(i1);
            add(i2);
            addMid(i0, i1);
            addMid(i0, i2);
            ChunkedArray.add3(index, newVertexCount, newVertexCount + 1, newVertexCount + 3);
            ChunkedArray.add3(index, newVertexCount, newVertexCount + 3, newVertexCount + 2);
            for (var j = 0; j < 4; ++j)
                ChunkedArray.add(group, g1);
            newVertexCount += 4;
        }
        var newVertexCount = vertexCount;
        var newTriangleCount = 0;
        if (splitTriangles) {
            for (var i = 0, il = triangleCount; i < il; ++i) {
                var i0 = ib[i * 3], i1 = ib[i * 3 + 1], i2 = ib[i * 3 + 2];
                var g0 = gb[i0], g1 = gb[i1], g2 = gb[i2];
                if (g0 === g1 && g0 === g2) {
                    ++newTriangleCount;
                    ChunkedArray.add3(index, i0, i1, i2);
                }
                else if (g0 === g1) {
                    split2(i2, i0, i1, g2, g0);
                }
                else if (g0 === g2) {
                    split2(i1, i2, i0, g1, g2);
                }
                else if (g1 === g2) {
                    split2(i0, i1, i2, g0, g1);
                }
                else {
                    newTriangleCount += 2;
                    add(i0);
                    addMid(i0, i1);
                    addMid(i0, i2);
                    addCenter(i0, i1, i2);
                    ChunkedArray.add3(index, newVertexCount, newVertexCount + 1, newVertexCount + 3);
                    ChunkedArray.add3(index, newVertexCount, newVertexCount + 3, newVertexCount + 2);
                    for (var j = 0; j < 4; ++j)
                        ChunkedArray.add(group, g0);
                    newVertexCount += 4;
                    newTriangleCount += 2;
                    add(i1);
                    addMid(i1, i2);
                    addMid(i1, i0);
                    addCenter(i0, i1, i2);
                    ChunkedArray.add3(index, newVertexCount, newVertexCount + 1, newVertexCount + 3);
                    ChunkedArray.add3(index, newVertexCount, newVertexCount + 3, newVertexCount + 2);
                    for (var j = 0; j < 4; ++j)
                        ChunkedArray.add(group, g1);
                    newVertexCount += 4;
                    newTriangleCount += 2;
                    add(i2);
                    addMid(i2, i1);
                    addMid(i2, i0);
                    addCenter(i0, i1, i2);
                    ChunkedArray.add3(index, newVertexCount + 3, newVertexCount + 1, newVertexCount);
                    ChunkedArray.add3(index, newVertexCount + 2, newVertexCount + 3, newVertexCount);
                    for (var j = 0; j < 4; ++j)
                        ChunkedArray.add(group, g2);
                    newVertexCount += 4;
                }
            }
        }
        else {
            for (var i = 0, il = triangleCount; i < il; ++i) {
                var i0 = ib[i * 3], i1 = ib[i * 3 + 1], i2 = ib[i * 3 + 2];
                var g0 = gb[i0], g1 = gb[i1], g2 = gb[i2];
                if (g0 !== g1 || g0 !== g2) {
                    ++newTriangleCount;
                    add(i0);
                    add(i1);
                    add(i2);
                    ChunkedArray.add3(index, newVertexCount, newVertexCount + 1, newVertexCount + 2);
                    var g = g1 === g2 ? g1 : g0;
                    for (var j = 0; j < 3; ++j)
                        ChunkedArray.add(group, g);
                    newVertexCount += 3;
                }
                else {
                    ++newTriangleCount;
                    ChunkedArray.add3(index, i0, i1, i2);
                }
            }
        }
        var newIb = ChunkedArray.compact(index);
        var newVb = ChunkedArray.compact(vertex);
        var newNb = ChunkedArray.compact(normal);
        var newGb = ChunkedArray.compact(group);
        mesh.vertexCount = newVertexCount;
        mesh.triangleCount = newTriangleCount;
        ValueCell.update(vertexBuffer, newVb);
        ValueCell.update(groupBuffer, newGb);
        ValueCell.update(indexBuffer, newIb);
        ValueCell.update(normalBuffer, newNb);
        // keep some original data, e.g., for geometry export
        mesh.meta.originalData = { indexBuffer: ib, vertexCount: vertexCount, triangleCount: triangleCount };
        return mesh;
    }
    Mesh.uniformTriangleGroup = uniformTriangleGroup;
    //
    function getNeighboursMap(mesh) {
        var vertexCount = mesh.vertexCount, triangleCount = mesh.triangleCount;
        var elements = mesh.indexBuffer.ref.value;
        var neighboursMap = [];
        for (var i = 0; i < vertexCount; ++i) {
            neighboursMap[i] = [];
        }
        for (var i = 0; i < triangleCount; ++i) {
            var v1 = elements[i * 3];
            var v2 = elements[i * 3 + 1];
            var v3 = elements[i * 3 + 2];
            arraySetAdd(neighboursMap[v1], v2);
            arraySetAdd(neighboursMap[v1], v3);
            arraySetAdd(neighboursMap[v2], v1);
            arraySetAdd(neighboursMap[v2], v3);
            arraySetAdd(neighboursMap[v3], v1);
            arraySetAdd(neighboursMap[v3], v2);
        }
        return neighboursMap;
    }
    function getEdgeCounts(mesh) {
        var triangleCount = mesh.triangleCount;
        var elements = mesh.indexBuffer.ref.value;
        var edgeCounts = new Map();
        var add = function (a, b) {
            var z = sortedCantorPairing(a, b);
            var c = edgeCounts.get(z) || 0;
            edgeCounts.set(z, c + 1);
        };
        for (var i = 0; i < triangleCount; ++i) {
            var a = elements[i * 3];
            var b = elements[i * 3 + 1];
            var c = elements[i * 3 + 2];
            add(a, b);
            add(a, c);
            add(b, c);
        }
        return edgeCounts;
    }
    function getBorderVertices(edgeCounts) {
        var borderVertices = new Set();
        var pair = [0, 0];
        edgeCounts.forEach(function (c, z) {
            if (c === 1) {
                invertCantorPairing(pair, z);
                borderVertices.add(pair[0]);
                borderVertices.add(pair[1]);
            }
        });
        return borderVertices;
    }
    function getBorderNeighboursMap(neighboursMap, borderVertices, edgeCounts) {
        var borderNeighboursMap = new Map();
        var add = function (v, nb) {
            if (borderNeighboursMap.has(v))
                arraySetAdd(borderNeighboursMap.get(v), nb);
            else
                borderNeighboursMap.set(v, [nb]);
        };
        borderVertices.forEach(function (v) {
            var neighbours = neighboursMap[v];
            for (var _i = 0, neighbours_1 = neighbours; _i < neighbours_1.length; _i++) {
                var nb = neighbours_1[_i];
                if (borderVertices.has(nb) && edgeCounts.get(sortedCantorPairing(v, nb)) === 1) {
                    add(v, nb);
                }
            }
        });
        return borderNeighboursMap;
    }
    function trimEdges(mesh, neighboursMap) {
        var indexBuffer = mesh.indexBuffer, triangleCount = mesh.triangleCount;
        var ib = indexBuffer.ref.value;
        // new
        var index = ChunkedArray.create(Uint32Array, 3, 1024, triangleCount);
        var newTriangleCount = 0;
        for (var i = 0; i < triangleCount; ++i) {
            var a = ib[i * 3];
            var b = ib[i * 3 + 1];
            var c = ib[i * 3 + 2];
            if (neighboursMap[a].length === 2 ||
                neighboursMap[b].length === 2 ||
                neighboursMap[c].length === 2)
                continue;
            ChunkedArray.add3(index, a, b, c);
            newTriangleCount += 1;
        }
        var newIb = ChunkedArray.compact(index);
        mesh.triangleCount = newTriangleCount;
        ValueCell.update(indexBuffer, newIb);
        return mesh;
    }
    function fillEdges(mesh, neighboursMap, borderNeighboursMap, maxLengthSquared) {
        var _a;
        var vertexBuffer = mesh.vertexBuffer, indexBuffer = mesh.indexBuffer, normalBuffer = mesh.normalBuffer, triangleCount = mesh.triangleCount;
        var vb = vertexBuffer.ref.value;
        var ib = indexBuffer.ref.value;
        var nb = normalBuffer.ref.value;
        // new
        var index = ChunkedArray.create(Uint32Array, 3, 1024, triangleCount);
        var newTriangleCount = 0;
        for (var i = 0; i < triangleCount; ++i) {
            ChunkedArray.add3(index, ib[i * 3], ib[i * 3 + 1], ib[i * 3 + 2]);
            newTriangleCount += 1;
        }
        var vA = Vec3();
        var vB = Vec3();
        var vC = Vec3();
        var vD = Vec3();
        var vAB = Vec3();
        var vAC = Vec3();
        var vAD = Vec3();
        var vABC = Vec3();
        var vAN = Vec3();
        var vN = Vec3();
        var AngleThreshold = degToRad(120);
        var added = new Set();
        var indices = Array.from(borderNeighboursMap.keys())
            .filter(function (v) { return borderNeighboursMap.get(v).length < 2; })
            .map(function (v) {
            var bnd = borderNeighboursMap.get(v);
            Vec3.fromArray(vA, vb, v * 3);
            Vec3.fromArray(vB, vb, bnd[0] * 3);
            Vec3.fromArray(vC, vb, bnd[1] * 3);
            Vec3.sub(vAB, vB, vA);
            Vec3.sub(vAC, vC, vA);
            return [v, Vec3.angle(vAB, vAC)];
        });
        // start with the smallest angle
        indices.sort(function (_a, _b) {
            var a = _a[1];
            var b = _b[1];
            return a - b;
        });
        for (var _i = 0, indices_1 = indices; _i < indices_1.length; _i++) {
            var _b = indices_1[_i], v = _b[0], angle = _b[1];
            if (added.has(v) || angle > AngleThreshold)
                continue;
            var nbs = borderNeighboursMap.get(v);
            if (neighboursMap[nbs[0]].includes(nbs[1]) &&
                !((_a = borderNeighboursMap.get(nbs[0])) === null || _a === void 0 ? void 0 : _a.includes(nbs[1])))
                continue;
            Vec3.fromArray(vA, vb, v * 3);
            Vec3.fromArray(vB, vb, nbs[0] * 3);
            Vec3.fromArray(vC, vb, nbs[1] * 3);
            Vec3.sub(vAB, vB, vA);
            Vec3.sub(vAC, vC, vA);
            Vec3.add(vABC, vAB, vAC);
            if (Vec3.squaredDistance(vA, vB) >= maxLengthSquared)
                continue;
            var add = false;
            for (var _c = 0, _d = neighboursMap[v]; _c < _d.length; _c++) {
                var nb_1 = _d[_c];
                if (nbs.includes(nb_1))
                    continue;
                Vec3.fromArray(vD, vb, nb_1 * 3);
                Vec3.sub(vAD, vD, vA);
                if (Vec3.dot(vABC, vAD) < 0) {
                    add = true;
                    break;
                }
            }
            if (!add)
                continue;
            Vec3.fromArray(vAN, nb, v * 3);
            Vec3.triangleNormal(vN, vA, vB, vC);
            if (Vec3.dot(vN, vAN) > 0) {
                ChunkedArray.add3(index, v, nbs[0], nbs[1]);
            }
            else {
                ChunkedArray.add3(index, nbs[1], nbs[0], v);
            }
            added.add(v);
            added.add(nbs[0]);
            added.add(nbs[1]);
            newTriangleCount += 1;
        }
        var newIb = ChunkedArray.compact(index);
        mesh.triangleCount = newTriangleCount;
        ValueCell.update(indexBuffer, newIb);
        return mesh;
    }
    function laplacianEdgeSmoothing(mesh, borderNeighboursMap, options) {
        var iterations = options.iterations, lambda = options.lambda;
        var a = Vec3();
        var b = Vec3();
        var c = Vec3();
        var t = Vec3();
        var mu = -lambda;
        var dst = new Float32Array(mesh.vertexBuffer.ref.value.length);
        var step = function (f) {
            var pos = mesh.vertexBuffer.ref.value;
            dst.set(pos);
            borderNeighboursMap.forEach(function (nbs, v) {
                if (nbs.length !== 2)
                    return;
                Vec3.fromArray(a, pos, v * 3);
                Vec3.fromArray(b, pos, nbs[0] * 3);
                Vec3.fromArray(c, pos, nbs[1] * 3);
                var wab = 1 / Vec3.distance(a, b);
                var wac = 1 / Vec3.distance(a, c);
                Vec3.scale(b, b, wab);
                Vec3.scale(c, c, wac);
                Vec3.add(t, b, c);
                Vec3.scale(t, t, 1 / (wab + wac));
                Vec3.sub(t, t, a);
                Vec3.scale(t, t, f);
                Vec3.add(t, a, t);
                Vec3.toArray(t, dst, v * 3);
            });
            var tmp = mesh.vertexBuffer.ref.value;
            ValueCell.update(mesh.vertexBuffer, dst);
            dst = tmp;
        };
        for (var k = 0; k < iterations; ++k) {
            step(lambda);
            step(mu);
        }
    }
    function smoothEdges(mesh, options) {
        trimEdges(mesh, getNeighboursMap(mesh));
        for (var k = 0; k < 10; ++k) {
            var oldTriangleCount = mesh.triangleCount;
            var edgeCounts_1 = getEdgeCounts(mesh);
            var neighboursMap_1 = getNeighboursMap(mesh);
            var borderVertices_1 = getBorderVertices(edgeCounts_1);
            var borderNeighboursMap_1 = getBorderNeighboursMap(neighboursMap_1, borderVertices_1, edgeCounts_1);
            fillEdges(mesh, neighboursMap_1, borderNeighboursMap_1, options.maxNewEdgeLength * options.maxNewEdgeLength);
            if (mesh.triangleCount === oldTriangleCount)
                break;
        }
        var edgeCounts = getEdgeCounts(mesh);
        var neighboursMap = getNeighboursMap(mesh);
        var borderVertices = getBorderVertices(edgeCounts);
        var borderNeighboursMap = getBorderNeighboursMap(neighboursMap, borderVertices, edgeCounts);
        laplacianEdgeSmoothing(mesh, borderNeighboursMap, { iterations: options.iterations, lambda: 0.5 });
        return mesh;
    }
    Mesh.smoothEdges = smoothEdges;
    //
    Mesh.Params = __assign(__assign({}, BaseGeometry.Params), { doubleSided: PD.Boolean(false, BaseGeometry.CustomQualityParamInfo), flipSided: PD.Boolean(false, BaseGeometry.ShadingCategory), flatShaded: PD.Boolean(false, BaseGeometry.ShadingCategory), ignoreLight: PD.Boolean(false, BaseGeometry.ShadingCategory), xrayShaded: PD.Select(false, [[false, 'Off'], [true, 'On'], ['inverted', 'Inverted']], BaseGeometry.ShadingCategory), transparentBackfaces: PD.Select('off', PD.arrayToOptions(['off', 'on', 'opaque']), BaseGeometry.ShadingCategory), bumpFrequency: PD.Numeric(0, { min: 0, max: 10, step: 0.1 }, BaseGeometry.ShadingCategory), bumpAmplitude: PD.Numeric(1, { min: 0, max: 5, step: 0.1 }, BaseGeometry.ShadingCategory) });
    Mesh.Utils = {
        Params: Mesh.Params,
        createEmpty: createEmpty,
        createValues: createValues,
        createValuesSimple: createValuesSimple,
        updateValues: updateValues,
        updateBoundingSphere: updateBoundingSphere,
        createRenderableState: createRenderableState,
        updateRenderableState: updateRenderableState,
        createPositionIterator: createPositionIterator
    };
    function createPositionIterator(mesh, transform) {
        var groupCount = mesh.vertexCount;
        var instanceCount = transform.instanceCount.ref.value;
        var location = PositionLocation();
        var p = location.position;
        var v = mesh.vertexBuffer.ref.value;
        var m = transform.aTransform.ref.value;
        var getLocation = function (groupIndex, instanceIndex) {
            if (instanceIndex < 0) {
                Vec3.fromArray(p, v, groupIndex * 3);
            }
            else {
                Vec3.transformMat4Offset(p, v, m, 0, groupIndex * 3, instanceIndex * 16);
            }
            return location;
        };
        return LocationIterator(groupCount, instanceCount, 1, getLocation);
    }
    function createValues(mesh, transform, locationIt, theme, props) {
        var instanceCount = locationIt.instanceCount, groupCount = locationIt.groupCount;
        var positionIt = createPositionIterator(mesh, transform);
        var color = createColors(locationIt, positionIt, theme.color);
        var marker = props.instanceGranularity
            ? createMarkers(instanceCount, 'instance')
            : createMarkers(instanceCount * groupCount, 'groupInstance');
        var overpaint = createEmptyOverpaint();
        var transparency = createEmptyTransparency();
        var material = createEmptySubstance();
        var clipping = createEmptyClipping();
        var counts = { drawCount: mesh.triangleCount * 3, vertexCount: mesh.vertexCount, groupCount: groupCount, instanceCount: instanceCount };
        var invariantBoundingSphere = Sphere3D.clone(mesh.boundingSphere);
        var boundingSphere = calculateTransformBoundingSphere(invariantBoundingSphere, transform.aTransform.ref.value, instanceCount, 0);
        return __assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign({ dGeometryType: ValueCell.create('mesh'), aPosition: mesh.vertexBuffer, aNormal: mesh.normalBuffer, aGroup: mesh.groupBuffer, elements: mesh.indexBuffer, dVaryingGroup: mesh.varyingGroup, boundingSphere: ValueCell.create(boundingSphere), invariantBoundingSphere: ValueCell.create(invariantBoundingSphere), uInvariantBoundingSphere: ValueCell.create(Vec4.ofSphere(invariantBoundingSphere)) }, color), marker), overpaint), transparency), material), clipping), transform), BaseGeometry.createValues(props, counts)), { uDoubleSided: ValueCell.create(props.doubleSided), dFlatShaded: ValueCell.create(props.flatShaded), dFlipSided: ValueCell.create(props.flipSided), dIgnoreLight: ValueCell.create(props.ignoreLight), dXrayShaded: ValueCell.create(props.xrayShaded === 'inverted' ? 'inverted' : props.xrayShaded === true ? 'on' : 'off'), dTransparentBackfaces: ValueCell.create(props.transparentBackfaces), uBumpFrequency: ValueCell.create(props.bumpFrequency), uBumpAmplitude: ValueCell.create(props.bumpAmplitude), meta: ValueCell.create(mesh.meta) });
    }
    function createValuesSimple(mesh, props, colorValue, sizeValue, transform) {
        var s = BaseGeometry.createSimple(colorValue, sizeValue, transform);
        var p = __assign(__assign({}, PD.getDefaultValues(Mesh.Params)), props);
        return createValues(mesh, s.transform, s.locationIterator, s.theme, p);
    }
    function updateValues(values, props) {
        BaseGeometry.updateValues(values, props);
        ValueCell.updateIfChanged(values.uDoubleSided, props.doubleSided);
        ValueCell.updateIfChanged(values.dFlatShaded, props.flatShaded);
        ValueCell.updateIfChanged(values.dFlipSided, props.flipSided);
        ValueCell.updateIfChanged(values.dIgnoreLight, props.ignoreLight);
        ValueCell.updateIfChanged(values.dXrayShaded, props.xrayShaded === 'inverted' ? 'inverted' : props.xrayShaded === true ? 'on' : 'off');
        ValueCell.updateIfChanged(values.dTransparentBackfaces, props.transparentBackfaces);
        ValueCell.updateIfChanged(values.uBumpFrequency, props.bumpFrequency);
        ValueCell.updateIfChanged(values.uBumpAmplitude, props.bumpAmplitude);
    }
    function updateBoundingSphere(values, mesh) {
        var invariantBoundingSphere = Sphere3D.clone(mesh.boundingSphere);
        var boundingSphere = calculateTransformBoundingSphere(invariantBoundingSphere, values.aTransform.ref.value, values.instanceCount.ref.value, 0);
        if (!Sphere3D.equals(boundingSphere, values.boundingSphere.ref.value)) {
            ValueCell.update(values.boundingSphere, boundingSphere);
        }
        if (!Sphere3D.equals(invariantBoundingSphere, values.invariantBoundingSphere.ref.value)) {
            ValueCell.update(values.invariantBoundingSphere, invariantBoundingSphere);
            ValueCell.update(values.uInvariantBoundingSphere, Vec4.fromSphere(values.uInvariantBoundingSphere.ref.value, invariantBoundingSphere));
        }
    }
    function createRenderableState(props) {
        var state = BaseGeometry.createRenderableState(props);
        updateRenderableState(state, props);
        return state;
    }
    function updateRenderableState(state, props) {
        BaseGeometry.updateRenderableState(state, props);
        state.opaque = state.opaque && !props.xrayShaded;
        state.writeDepth = state.opaque;
    }
})(Mesh || (Mesh = {}));
