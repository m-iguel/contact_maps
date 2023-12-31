/**
 * Copyright (c) 2018 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { sort, arraySwap } from './sort';
function sortAsc(bs, i, j) { return bs[i].key < bs[j].key ? -1 : 1; }
function _makeBuckets(indices, getKey, sortBuckets, start, end) {
    var buckets = new Map();
    var bucketList = [];
    var prevKey = getKey(indices[0]);
    var isBucketed = true;
    for (var i = start; i < end; i++) {
        var key = getKey(indices[i]);
        if (buckets.has(key)) {
            buckets.get(key).count++;
            if (prevKey !== key)
                isBucketed = false;
        }
        else {
            var bucket = { key: key, count: 1, offset: i };
            buckets.set(key, bucket);
            bucketList[bucketList.length] = bucket;
        }
        prevKey = key;
    }
    var bucketOffsets = new Int32Array(bucketList.length + 1);
    bucketOffsets[bucketList.length] = end;
    var sorted = true;
    if (sortBuckets) {
        for (var i = 1, _i = bucketList.length; i < _i; i++) {
            if (bucketList[i - 1].key > bucketList[i].key) {
                sorted = false;
                break;
            }
        }
    }
    if (isBucketed && sorted) {
        for (var i = 0; i < bucketList.length; i++)
            bucketOffsets[i] = bucketList[i].offset;
        return bucketOffsets;
    }
    if (sortBuckets && !sorted) {
        sort(bucketList, 0, bucketList.length, sortAsc, arraySwap);
    }
    var offset = 0;
    for (var i = 0; i < bucketList.length; i++) {
        var b = bucketList[i];
        b.offset = offset;
        offset += b.count;
    }
    var reorderedIndices = new Int32Array(end - start);
    for (var i = start; i < end; i++) {
        var key = getKey(indices[i]);
        var bucket = buckets.get(key);
        reorderedIndices[bucket.offset++] = indices[i];
    }
    for (var i = 0, _i = reorderedIndices.length; i < _i; i++) {
        indices[i + start] = reorderedIndices[i];
    }
    bucketOffsets[0] = start;
    for (var i = 1; i < bucketList.length; i++)
        bucketOffsets[i] = bucketList[i - 1].offset + start;
    return bucketOffsets;
}
/**
 * Reorders indices so that the same keys are next to each other, [start, end)
 * Returns the offsets of buckets. So that [offsets[i], offsets[i + 1]) determines the range.
 */
export function makeBuckets(indices, getKey, options) {
    var s = (options && options.start) || 0;
    var e = (options && options.end) || indices.length;
    if (e - s <= 0)
        throw new Error('Can only bucket non-empty collections.');
    return _makeBuckets(indices, getKey, !!(options && options.sort), s, e);
}
