/**
 * Copyright (c) 2020-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { Volume } from '../../mol-model/volume';
import { Interval, OrderedSet, SortedArray } from '../../mol-data/int';
import { equalEps } from '../../mol-math/linear-algebra/3d/common';
import { Vec3 } from '../../mol-math/linear-algebra/3d/vec3';
import { packIntToRGBArray } from '../../mol-util/number-packing';
import { SetUtils } from '../../mol-util/set';
import { Box3D } from '../../mol-math/geometry';
// avoiding namespace lookup improved performance in Chrome (Aug 2020)
var v3set = Vec3.set;
var v3normalize = Vec3.normalize;
var v3sub = Vec3.sub;
var v3addScalar = Vec3.addScalar;
var v3scale = Vec3.scale;
var v3toArray = Vec3.toArray;
export function eachVolumeLoci(loci, volume, props, apply) {
    var changed = false;
    if (Volume.isLoci(loci)) {
        if (!Volume.areEquivalent(loci.volume, volume))
            return false;
        if (apply(Interval.ofLength(volume.grid.cells.data.length)))
            changed = true;
    }
    else if (Volume.Isosurface.isLoci(loci)) {
        if (!Volume.areEquivalent(loci.volume, volume))
            return false;
        if (props === null || props === void 0 ? void 0 : props.isoValue) {
            if (!Volume.IsoValue.areSame(loci.isoValue, props.isoValue, volume.grid.stats))
                return false;
            if (apply(Interval.ofLength(volume.grid.cells.data.length)))
                changed = true;
        }
        else {
            var _a = volume.grid, stats = _a.stats, data = _a.cells.data;
            var eps = stats.sigma;
            var v = Volume.IsoValue.toAbsolute(loci.isoValue, stats).absoluteValue;
            for (var i = 0, il = data.length; i < il; ++i) {
                if (equalEps(v, data[i], eps)) {
                    if (apply(Interval.ofSingleton(i)))
                        changed = true;
                }
            }
        }
    }
    else if (Volume.Cell.isLoci(loci)) {
        if (!Volume.areEquivalent(loci.volume, volume))
            return false;
        if (Interval.is(loci.indices)) {
            if (apply(loci.indices))
                changed = true;
        }
        else {
            OrderedSet.forEach(loci.indices, function (v) {
                if (apply(Interval.ofSingleton(v)))
                    changed = true;
            });
        }
    }
    else if (Volume.Segment.isLoci(loci)) {
        if (!Volume.areEquivalent(loci.volume, volume))
            return false;
        if (props === null || props === void 0 ? void 0 : props.segments) {
            if (!SortedArray.areIntersecting(loci.segments, props.segments))
                return false;
            if (apply(Interval.ofLength(volume.grid.cells.data.length)))
                changed = true;
        }
        else {
            var segmentation = Volume.Segmentation.get(volume);
            if (segmentation) {
                var set = new Set();
                for (var i = 0, il = loci.segments.length; i < il; ++i) {
                    SetUtils.add(set, segmentation.segments.get(loci.segments[i]));
                }
                var s = Array.from(set.values());
                var d = volume.grid.cells.data;
                for (var i = 0, il = d.length; i < il; ++i) {
                    if (s.includes(d[i])) {
                        if (apply(Interval.ofSingleton(i)))
                            changed = true;
                    }
                }
            }
        }
    }
    return changed;
}
//
export function getVolumeTexture2dLayout(dim, padding) {
    if (padding === void 0) { padding = 0; }
    var area = dim[0] * dim[1] * dim[2];
    var squareDim = Math.sqrt(area);
    var powerOfTwoSize = Math.pow(2, Math.ceil(Math.log(squareDim) / Math.log(2)));
    var width = dim[0] + padding;
    var height = dim[1] + padding;
    var rows = 1;
    var columns = width;
    if (powerOfTwoSize < width * dim[2]) {
        columns = Math.floor(powerOfTwoSize / width);
        rows = Math.ceil(dim[2] / columns);
        width *= columns;
        height *= rows;
    }
    else {
        width *= dim[2];
    }
    return { width: width, height: height, columns: columns, rows: rows, powerOfTwoSize: height < powerOfTwoSize ? powerOfTwoSize : powerOfTwoSize * 2 };
}
export function createVolumeTexture2d(volume, variant, padding) {
    if (padding === void 0) { padding = 0; }
    var _a = volume.grid, _b = _a.cells, space = _b.space, data = _b.data, _c = _a.stats, max = _c.max, min = _c.min;
    var dim = space.dimensions;
    var o = space.dataOffset;
    var _d = getVolumeTexture2dLayout(dim, padding), width = _d.width, height = _d.height;
    var itemSize = variant === 'data' ? 1 : 4;
    var array = new Uint8Array(width * height * itemSize);
    var textureImage = { array: array, width: width, height: height };
    var diff = max - min;
    var xn = dim[0], yn = dim[1], zn = dim[2];
    var xnp = xn + padding;
    var ynp = yn + padding;
    var n0 = Vec3();
    var n1 = Vec3();
    var xn1 = xn - 1;
    var yn1 = yn - 1;
    var zn1 = zn - 1;
    for (var z = 0; z < zn; ++z) {
        for (var y = 0; y < yn; ++y) {
            for (var x = 0; x < xn; ++x) {
                var column = Math.floor(((z * xnp) % width) / xnp);
                var row = Math.floor((z * xnp) / width);
                var px = column * xnp + x;
                var index = itemSize * ((row * ynp * width) + (y * width) + px);
                var offset = o(x, y, z);
                if (variant === 'data') {
                    array[index] = Math.round(((data[offset] - min) / diff) * 255);
                }
                else {
                    if (variant === 'groups') {
                        packIntToRGBArray(offset, array, index);
                    }
                    else {
                        v3set(n0, data[o(Math.max(0, x - 1), y, z)], data[o(x, Math.max(0, y - 1), z)], data[o(x, y, Math.max(0, z - 1))]);
                        v3set(n1, data[o(Math.min(xn1, x + 1), y, z)], data[o(x, Math.min(yn1, y + 1), z)], data[o(x, y, Math.min(zn1, z + 1))]);
                        v3normalize(n0, v3sub(n0, n0, n1));
                        v3addScalar(n0, v3scale(n0, n0, 0.5), 0.5);
                        v3toArray(v3scale(n0, n0, 255), array, index);
                    }
                    array[index + 3] = Math.round(((data[offset] - min) / diff) * 255);
                }
            }
        }
    }
    return textureImage;
}
export function createVolumeTexture3d(volume) {
    var _a = volume.grid, _b = _a.cells, space = _b.space, data = _b.data, _c = _a.stats, max = _c.max, min = _c.min;
    var _d = space.dimensions, width = _d[0], height = _d[1], depth = _d[2];
    var o = space.dataOffset;
    var array = new Uint8Array(width * height * depth * 4);
    var textureVolume = { array: array, width: width, height: height, depth: depth };
    var diff = max - min;
    var n0 = Vec3();
    var n1 = Vec3();
    var width1 = width - 1;
    var height1 = height - 1;
    var depth1 = depth - 1;
    var i = 0;
    for (var z = 0; z < depth; ++z) {
        for (var y = 0; y < height; ++y) {
            for (var x = 0; x < width; ++x) {
                var offset = o(x, y, z);
                v3set(n0, data[o(Math.max(0, x - 1), y, z)], data[o(x, Math.max(0, y - 1), z)], data[o(x, y, Math.max(0, z - 1))]);
                v3set(n1, data[o(Math.min(width1, x + 1), y, z)], data[o(x, Math.min(height1, y + 1), z)], data[o(x, y, Math.min(depth1, z + 1))]);
                v3normalize(n0, v3sub(n0, n0, n1));
                v3addScalar(n0, v3scale(n0, n0, 0.5), 0.5);
                v3toArray(v3scale(n0, n0, 255), array, i);
                array[i + 3] = Math.round(((data[offset] - min) / diff) * 255);
                i += 4;
            }
        }
    }
    return textureVolume;
}
export function createSegmentTexture2d(volume, set, bbox, padding) {
    if (padding === void 0) { padding = 0; }
    var data = volume.grid.cells.data;
    var dim = Box3D.size(Vec3(), bbox);
    var o = volume.grid.cells.space.dataOffset;
    var _a = getVolumeTexture2dLayout(dim, padding), width = _a.width, height = _a.height;
    var itemSize = 1;
    var array = new Uint8Array(width * height * itemSize);
    var textureImage = { array: array, width: width, height: height };
    var xn = dim[0], yn = dim[1], zn = dim[2];
    var xn1 = xn - 1;
    var yn1 = yn - 1;
    var zn1 = zn - 1;
    var xnp = xn + padding;
    var ynp = yn + padding;
    var _b = bbox.min, minx = _b[0], miny = _b[1], minz = _b[2];
    var _c = bbox.max, maxx = _c[0], maxy = _c[1], maxz = _c[2];
    for (var z = 0; z < zn; ++z) {
        for (var y = 0; y < yn; ++y) {
            for (var x = 0; x < xn; ++x) {
                var column = Math.floor(((z * xnp) % width) / xnp);
                var row = Math.floor((z * xnp) / width);
                var px = column * xnp + x;
                var index = itemSize * ((row * ynp * width) + (y * width) + px);
                var v0 = set.includes(data[o(x + minx, y + miny, z + minz)]) ? 255 : 0;
                var xp = set.includes(data[o(Math.min(xn1 + maxx, x + 1 + minx), y + miny, z + minz)]) ? 255 : 0;
                var xn_1 = set.includes(data[o(Math.max(0, x - 1 + minx), y + miny, z + minz)]) ? 255 : 0;
                var yp = set.includes(data[o(x + minx, Math.min(yn1 + maxy, y + 1 + miny), z + minz)]) ? 255 : 0;
                var yn_1 = set.includes(data[o(x + minx, Math.max(0, y - 1 + miny), z + minz)]) ? 255 : 0;
                var zp = set.includes(data[o(x + minx, y + miny, Math.min(zn1 + maxz, z + 1 + minz))]) ? 255 : 0;
                var zn_1 = set.includes(data[o(x + minx, y + miny, Math.max(0, z - 1 + minz))]) ? 255 : 0;
                array[index] = Math.round((v0 + v0 + xp + xn_1 + yp + yn_1 + zp + zn_1) / 8);
            }
        }
    }
    return textureImage;
}
