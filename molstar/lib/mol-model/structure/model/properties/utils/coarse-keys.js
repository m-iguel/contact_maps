/**
 * Copyright (c) 2017-2018 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { SortedRanges } from '../../../../../mol-data/int/sorted-ranges';
import { OrderedSet } from '../../../../../mol-data/int';
function getElementKey(map, key, counter) {
    if (map.has(key))
        return map.get(key);
    var ret = counter.index++;
    map.set(key, ret);
    return ret;
}
function getElementSubstructureKeyMap(map, key) {
    if (map.has(key))
        return map.get(key);
    var ret = new Map();
    map.set(key, ret);
    return ret;
}
function createLookUp(entities, chain, seq) {
    var getEntKey = entities.getEntityIndex;
    var findChainKey = function (e, c) {
        var eKey = getEntKey(e);
        if (eKey < 0)
            return -1;
        var cm = chain.get(eKey);
        if (!cm.has(c))
            return -1;
        return cm.get(c);
    };
    var findSequenceKey = function (e, c, s) {
        var eKey = getEntKey(e);
        if (eKey < 0)
            return -1;
        var cm = chain.get(eKey);
        if (cm === undefined)
            return -1;
        var cKey = cm.get(c);
        if (cKey === undefined)
            return -1;
        var sm = seq.get(cKey);
        var elementIndices = sm.elementIndices, seqRanges = sm.seqRanges;
        var idx = SortedRanges.firstIntersectionIndex(seqRanges, OrderedSet.ofSingleton(s));
        return (idx !== -1 ? elementIndices[idx] : -1);
    };
    return { findChainKey: findChainKey, findSequenceKey: findSequenceKey };
}
function missingEntity(k) {
    throw new Error("Missing entity entry for entity id '".concat(k, "'."));
}
export function getCoarseKeys(data, entities) {
    var entity_id = data.entity_id, asym_id = data.asym_id, seq_id_begin = data.seq_id_begin, seq_id_end = data.seq_id_end, count = data.count, chainElementSegments = data.chainElementSegments;
    var seqMaps = new Map();
    var chainMaps = new Map(), chainCounter = { index: 0 };
    var chainKey = new Int32Array(count);
    var entityKey = new Int32Array(count);
    var chainToEntity = new Int32Array(chainElementSegments.count);
    for (var i = 0; i < count; i++) {
        entityKey[i] = entities.getEntityIndex(entity_id.value(i));
        if (entityKey[i] < 0)
            missingEntity(entity_id.value(i));
    }
    for (var cI = 0; cI < chainElementSegments.count; cI++) {
        var start = chainElementSegments.offsets[cI];
        var end = chainElementSegments.offsets[cI + 1];
        var eK = entityKey[start];
        chainToEntity[cI] = eK;
        var map = getElementSubstructureKeyMap(chainMaps, eK);
        var key = getElementKey(map, asym_id.value(start), chainCounter);
        for (var i = start; i < end; i++)
            chainKey[i] = key;
        // create seq_id map for the ranges defined by seq_id_begin and seq_id_end
        var elementIndices = [];
        var seqRanges = [];
        for (var i = start; i < end; i++) {
            var seqStart = seq_id_begin.value(i);
            var seqEnd = seq_id_end.value(i);
            elementIndices.push(i);
            seqRanges.push(seqStart, seqEnd);
        }
        var seqMap = { elementIndices: elementIndices, seqRanges: SortedRanges.ofSortedRanges(seqRanges) };
        seqMaps.set(key, seqMap);
    }
    var _a = createLookUp(entities, chainMaps, seqMaps), findChainKey = _a.findChainKey, findSequenceKey = _a.findSequenceKey;
    var getEntityFromChain = function (c) {
        return chainToEntity[c];
    };
    return { chainKey: chainKey, entityKey: entityKey, findSequenceKey: findSequenceKey, findChainKey: findChainKey, getEntityFromChain: getEntityFromChain };
}
