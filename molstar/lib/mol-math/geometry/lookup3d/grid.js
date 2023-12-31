/**
 * Copyright (c) 2018-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author Gianluca Tomasello <giagitom@gmail.com>
 */
import { Result } from './common';
import { Box3D } from '../primitives/box3d';
import { Vec3 } from '../../linear-algebra';
import { OrderedSet } from '../../../mol-data/int';
import { FibonacciHeap } from '../../../mol-util/fibonacci-heap';
function GridLookup3D(data, boundary, cellSizeOrCount) {
    return new GridLookup3DImpl(data, boundary, cellSizeOrCount);
}
export { GridLookup3D };
var GridLookup3DImpl = /** @class */ (function () {
    function GridLookup3DImpl(data, boundary, cellSizeOrCount) {
        var structure = build(data, boundary, cellSizeOrCount);
        this.ctx = createContext(structure);
        this.boundary = { box: structure.boundingBox, sphere: structure.boundingSphere };
        this.buckets = { offset: structure.bucketOffset, count: structure.bucketCounts, array: structure.bucketArray };
        this.result = Result.create();
    }
    GridLookup3DImpl.prototype.find = function (x, y, z, radius, result) {
        this.ctx.x = x;
        this.ctx.y = y;
        this.ctx.z = z;
        this.ctx.radius = radius;
        this.ctx.isCheck = false;
        var ret = result !== null && result !== void 0 ? result : this.result;
        query(this.ctx, ret);
        return ret;
    };
    GridLookup3DImpl.prototype.nearest = function (x, y, z, k, stopIf, result) {
        if (k === void 0) { k = 1; }
        this.ctx.x = x;
        this.ctx.y = y;
        this.ctx.z = z;
        this.ctx.k = k;
        this.ctx.stopIf = stopIf;
        var ret = result !== null && result !== void 0 ? result : this.result;
        queryNearest(this.ctx, ret);
        return ret;
    };
    GridLookup3DImpl.prototype.check = function (x, y, z, radius) {
        this.ctx.x = x;
        this.ctx.y = y;
        this.ctx.z = z;
        this.ctx.radius = radius;
        this.ctx.isCheck = true;
        return query(this.ctx, this.result);
    };
    return GridLookup3DImpl;
}());
function _build(state) {
    var expandedBox = state.expandedBox, _a = state.size, sX = _a[0], sY = _a[1], sZ = _a[2], _b = state.data, px = _b.x, py = _b.y, pz = _b.z, radius = _b.radius, indices = _b.indices, elementCount = state.elementCount, delta = state.delta;
    var n = sX * sY * sZ;
    var _c = expandedBox.min, minX = _c[0], minY = _c[1], minZ = _c[2];
    var maxRadius = 0;
    var bucketCount = 0;
    var grid = new Uint32Array(n);
    var bucketIndex = new Int32Array(elementCount);
    for (var t = 0; t < elementCount; t++) {
        var i = OrderedSet.getAt(indices, t);
        var x = Math.floor((px[i] - minX) / delta[0]);
        var y = Math.floor((py[i] - minY) / delta[1]);
        var z = Math.floor((pz[i] - minZ) / delta[2]);
        var idx = (((x * sY) + y) * sZ) + z;
        if ((grid[idx] += 1) === 1) {
            bucketCount += 1;
        }
        bucketIndex[t] = idx;
    }
    if (radius) {
        for (var t = 0; t < elementCount; t++) {
            var i = OrderedSet.getAt(indices, t);
            if (radius[i] > maxRadius)
                maxRadius = radius[i];
        }
    }
    var bucketCounts = new Int32Array(bucketCount);
    for (var i = 0, j = 0; i < n; i++) {
        var c = grid[i];
        if (c > 0) {
            grid[i] = j + 1;
            bucketCounts[j] = c;
            j += 1;
        }
    }
    var bucketOffset = new Uint32Array(bucketCount);
    for (var i = 1; i < bucketCount; ++i) {
        bucketOffset[i] += bucketOffset[i - 1] + bucketCounts[i - 1];
    }
    var bucketFill = new Int32Array(bucketCount);
    var bucketArray = new Int32Array(elementCount);
    for (var i = 0; i < elementCount; i++) {
        var bucketIdx = grid[bucketIndex[i]];
        if (bucketIdx > 0) {
            var k = bucketIdx - 1;
            bucketArray[bucketOffset[k] + bucketFill[k]] = i;
            bucketFill[k] += 1;
        }
    }
    return {
        size: state.size,
        bucketArray: bucketArray,
        bucketCounts: bucketCounts,
        bucketOffset: bucketOffset,
        grid: grid,
        delta: delta,
        min: state.expandedBox.min,
        data: state.data,
        maxRadius: maxRadius,
        expandedBox: state.expandedBox,
        boundingBox: state.boundingBox,
        boundingSphere: state.boundingSphere
    };
}
function build(data, boundary, cellSizeOrCount) {
    // need to expand the grid bounds to avoid rounding errors
    var expandedBox = Box3D.expand(Box3D(), boundary.box, Vec3.create(0.5, 0.5, 0.5));
    var indices = data.indices;
    var S = Box3D.size(Vec3(), expandedBox);
    var delta, size;
    var elementCount = OrderedSet.size(indices);
    var cellCount = typeof cellSizeOrCount === 'number' ? cellSizeOrCount : 32;
    var cellSize = Array.isArray(cellSizeOrCount) && cellSizeOrCount;
    if (cellSize && !Vec3.isZero(cellSize)) {
        size = [Math.ceil(S[0] / cellSize[0]), Math.ceil(S[1] / cellSize[1]), Math.ceil(S[2] / cellSize[2])];
        delta = cellSize;
    }
    else if (elementCount > 0) {
        // size of the box
        // required "grid volume" so that each cell contains on average 'cellCount' elements.
        var V = Math.ceil(elementCount / cellCount);
        var f = Math.pow(V / (S[0] * S[1] * S[2]), 1 / 3);
        size = [Math.ceil(S[0] * f), Math.ceil(S[1] * f), Math.ceil(S[2] * f)];
        delta = [S[0] / size[0], S[1] / size[1], S[2] / size[2]];
    }
    else {
        delta = S;
        size = [1, 1, 1];
    }
    var inputData = {
        x: data.x,
        y: data.y,
        z: data.z,
        indices: indices,
        radius: data.radius
    };
    var state = {
        size: size,
        data: inputData,
        expandedBox: expandedBox,
        boundingBox: boundary.box,
        boundingSphere: boundary.sphere,
        elementCount: elementCount,
        delta: delta
    };
    return _build(state);
}
function createContext(grid) {
    return { grid: grid, x: 0.1, y: 0.1, z: 0.1, k: 1, stopIf: undefined, radius: 0.1, isCheck: false };
}
function query(ctx, result) {
    var _a = ctx.grid, min = _a.min, _b = _a.size, sX = _b[0], sY = _b[1], sZ = _b[2], bucketOffset = _a.bucketOffset, bucketCounts = _a.bucketCounts, bucketArray = _a.bucketArray, grid = _a.grid, _c = _a.data, px = _c.x, py = _c.y, pz = _c.z, indices = _c.indices, radius = _c.radius, delta = _a.delta, maxRadius = _a.maxRadius;
    var inputRadius = ctx.radius, isCheck = ctx.isCheck, x = ctx.x, y = ctx.y, z = ctx.z;
    var r = inputRadius + maxRadius;
    var rSq = r * r;
    Result.reset(result);
    var loX = Math.max(0, Math.floor((x - r - min[0]) / delta[0]));
    var loY = Math.max(0, Math.floor((y - r - min[1]) / delta[1]));
    var loZ = Math.max(0, Math.floor((z - r - min[2]) / delta[2]));
    var hiX = Math.min(sX - 1, Math.floor((x + r - min[0]) / delta[0]));
    var hiY = Math.min(sY - 1, Math.floor((y + r - min[1]) / delta[1]));
    var hiZ = Math.min(sZ - 1, Math.floor((z + r - min[2]) / delta[2]));
    if (loX > hiX || loY > hiY || loZ > hiZ)
        return false;
    for (var ix = loX; ix <= hiX; ix++) {
        for (var iy = loY; iy <= hiY; iy++) {
            for (var iz = loZ; iz <= hiZ; iz++) {
                var bucketIdx = grid[(((ix * sY) + iy) * sZ) + iz];
                if (bucketIdx === 0)
                    continue;
                var k = bucketIdx - 1;
                var offset = bucketOffset[k];
                var count = bucketCounts[k];
                var end = offset + count;
                for (var i = offset; i < end; i++) {
                    var idx = OrderedSet.getAt(indices, bucketArray[i]);
                    var dx = px[idx] - x;
                    var dy = py[idx] - y;
                    var dz = pz[idx] - z;
                    var distSq = dx * dx + dy * dy + dz * dz;
                    if (distSq <= rSq) {
                        if (maxRadius > 0 && Math.sqrt(distSq) - radius[idx] > inputRadius)
                            continue;
                        if (isCheck)
                            return true;
                        Result.add(result, bucketArray[i], distSq);
                    }
                }
            }
        }
    }
    return result.count > 0;
}
var tmpDirVec = Vec3();
var tmpVec = Vec3();
var tmpSetG = new Set();
var tmpSetG2 = new Set();
var tmpArrG1 = [0.1];
var tmpArrG2 = [0.1];
var tmpArrG3 = [0.1];
var tmpHeapG = new FibonacciHeap();
function queryNearest(ctx, result) {
    var _a = ctx.grid, min = _a.min, box = _a.expandedBox, center = _a.boundingSphere.center, _b = _a.size, sX = _b[0], sY = _b[1], sZ = _b[2], bucketOffset = _a.bucketOffset, bucketCounts = _a.bucketCounts, bucketArray = _a.bucketArray, grid = _a.grid, _c = _a.data, px = _c.x, py = _c.y, pz = _c.z, indices = _c.indices, radius = _c.radius, delta = _a.delta, maxRadius = _a.maxRadius;
    var x = ctx.x, y = ctx.y, z = ctx.z, k = ctx.k, stopIf = ctx.stopIf;
    var indicesCount = OrderedSet.size(indices);
    Result.reset(result);
    if (indicesCount === 0 || k <= 0)
        return false;
    var gX, gY, gZ, stop = false, gCount = 1, expandGrid = true, nextGCount = 0, arrG = tmpArrG1, nextArrG = tmpArrG2, maxRange = 0, expandRange = true, gridId, gridPointsFinished = false;
    var expandedArrG = tmpArrG3, sqMaxRadius = maxRadius * maxRadius;
    arrG.length = 0;
    expandedArrG.length = 0;
    tmpSetG.clear();
    tmpHeapG.clear();
    Vec3.set(tmpVec, x, y, z);
    if (!Box3D.containsVec3(box, tmpVec)) {
        // intersect ray pointing to box center
        Box3D.nearestIntersectionWithRay(tmpVec, box, tmpVec, Vec3.normalize(tmpDirVec, Vec3.sub(tmpDirVec, center, tmpVec)));
        gX = Math.max(0, Math.min(sX - 1, Math.floor((tmpVec[0] - min[0]) / delta[0])));
        gY = Math.max(0, Math.min(sY - 1, Math.floor((tmpVec[1] - min[1]) / delta[1])));
        gZ = Math.max(0, Math.min(sZ - 1, Math.floor((tmpVec[2] - min[2]) / delta[2])));
    }
    else {
        gX = Math.floor((x - min[0]) / delta[0]);
        gY = Math.floor((y - min[1]) / delta[1]);
        gZ = Math.floor((z - min[2]) / delta[2]);
    }
    var dX = maxRadius !== 0 ? Math.max(1, Math.min(sX - 1, Math.ceil(maxRadius / delta[0]))) : 1;
    var dY = maxRadius !== 0 ? Math.max(1, Math.min(sY - 1, Math.ceil(maxRadius / delta[1]))) : 1;
    var dZ = maxRadius !== 0 ? Math.max(1, Math.min(sZ - 1, Math.ceil(maxRadius / delta[2]))) : 1;
    arrG.push(gX, gY, gZ, (((gX * sY) + gY) * sZ) + gZ);
    while (result.count < indicesCount) {
        var arrGLen = gCount * 4;
        for (var ig = 0; ig < arrGLen; ig += 4) {
            gridId = arrG[ig + 3];
            if (!tmpSetG.has(gridId)) {
                tmpSetG.add(gridId);
                gridPointsFinished = tmpSetG.size >= grid.length;
                var bucketIdx = grid[gridId];
                if (bucketIdx !== 0) {
                    var _maxRange = maxRange;
                    var ki = bucketIdx - 1;
                    var offset = bucketOffset[ki];
                    var count = bucketCounts[ki];
                    var end = offset + count;
                    for (var i = offset; i < end; i++) {
                        var bIdx = bucketArray[i];
                        var idx = OrderedSet.getAt(indices, bIdx);
                        var dx = px[idx] - x;
                        var dy = py[idx] - y;
                        var dz = pz[idx] - z;
                        var distSq = dx * dx + dy * dy + dz * dz;
                        if (maxRadius !== 0) {
                            var r = radius[idx];
                            distSq -= r * r;
                        }
                        if (expandRange && distSq > maxRange) {
                            maxRange = distSq;
                        }
                        tmpHeapG.insert(distSq, bIdx);
                    }
                    if (_maxRange < maxRange)
                        expandRange = false;
                }
            }
        }
        // find next grid points
        nextArrG.length = 0;
        nextGCount = 0;
        tmpSetG2.clear();
        for (var ig = 0; ig < arrGLen; ig += 4) {
            gX = arrG[ig];
            gY = arrG[ig + 1];
            gZ = arrG[ig + 2];
            // fill grid points array with valid adiacent positions
            for (var ix = -dX; ix <= dX; ix++) {
                var xPos = gX + ix;
                if (xPos < 0 || xPos >= sX)
                    continue;
                for (var iy = -dY; iy <= dY; iy++) {
                    var yPos = gY + iy;
                    if (yPos < 0 || yPos >= sY)
                        continue;
                    for (var iz = -dZ; iz <= dZ; iz++) {
                        var zPos = gZ + iz;
                        if (zPos < 0 || zPos >= sZ)
                            continue;
                        gridId = (((xPos * sY) + yPos) * sZ) + zPos;
                        if (tmpSetG2.has(gridId))
                            continue; // already scanned
                        tmpSetG2.add(gridId);
                        if (tmpSetG.has(gridId))
                            continue; // already visited
                        if (!expandGrid) {
                            var xP = min[0] + xPos * delta[0] - x;
                            var yP = min[1] + yPos * delta[1] - y;
                            var zP = min[2] + zPos * delta[2] - z;
                            var distSqG = (xP * xP) + (yP * yP) + (zP * zP) - sqMaxRadius; // is sqMaxRadius necessary?
                            if (distSqG > maxRange) {
                                expandedArrG.push(xPos, yPos, zPos, gridId);
                                continue;
                            }
                        }
                        nextArrG.push(xPos, yPos, zPos, gridId);
                        nextGCount++;
                    }
                }
            }
        }
        expandGrid = false;
        if (nextGCount === 0) {
            if (k === 1) {
                var node = tmpHeapG.findMinimum();
                if (node) {
                    var _d = node, squaredDistance = _d.key, index = _d.value;
                    // const squaredDistance = node!.key, index = node!.value;
                    Result.add(result, index, squaredDistance);
                    return true;
                }
            }
            else {
                while (!tmpHeapG.isEmpty() && (gridPointsFinished || tmpHeapG.findMinimum().key <= maxRange) && result.count < k) {
                    var node = tmpHeapG.extractMinimum();
                    var squaredDistance = node.key, index = node.value;
                    Result.add(result, index, squaredDistance);
                    if (stopIf && !stop) {
                        stop = stopIf(index, squaredDistance);
                    }
                }
            }
            if (result.count >= k || stop || result.count >= indicesCount)
                return result.count > 0;
            expandGrid = true;
            expandRange = true;
            if (expandedArrG.length > 0) {
                for (var i = 0, l = expandedArrG.length; i < l; i++) {
                    arrG.push(expandedArrG[i]);
                }
                expandedArrG.length = 0;
                gCount = arrG.length;
            }
        }
        else {
            var tmp = arrG;
            arrG = nextArrG;
            nextArrG = tmp;
            gCount = nextGCount;
        }
    }
    return result.count > 0;
}
