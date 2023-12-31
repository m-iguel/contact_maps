/**
 * Copyright (c) 2017-2021 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { Interval, Segmentation, SortedArray } from '../../../../../mol-data/int';
import { AtomicIndex, AtomicHierarchy } from '../atomic/hierarchy';
import { cantorPairing } from '../../../../../mol-data/util';
function getResidueId(seq_id, ins_code) {
    if (!ins_code)
        return seq_id;
    if (ins_code.length === 1)
        return cantorPairing(ins_code.charCodeAt(0), seq_id);
    if (ins_code.length === 2)
        return cantorPairing(ins_code.charCodeAt(0), cantorPairing(ins_code.charCodeAt(1), seq_id));
    return "".concat(seq_id, " ").concat(ins_code);
}
function updateMapMapIndex(map, key0, key1, index) {
    if (map.has(key0)) {
        var submap = map.get(key0);
        if (!submap.has(key1)) {
            submap.set(key1, index);
        }
    }
    else {
        var submap = new Map();
        map.set(key0, submap);
        submap.set(key1, index);
    }
}
function missingEntity(k) {
    throw new Error("Missing entity entry for entity id '".concat(k, "'."));
}
function createMapping(entities, data, segments) {
    return {
        entities: entities,
        segments: segments,
        label_seq_id: SortedArray.ofSortedArray(data.residues.label_seq_id.toArray({ array: Int32Array })),
        label_atom_id: data.atoms.label_atom_id,
        auth_atom_id: data.atoms.auth_atom_id,
        label_alt_id: data.atoms.label_alt_id,
        type_symbol: data.atoms.type_symbol,
        chain_index_entity_index: new Int32Array(data.chains._rowCount),
        entity_index_label_asym_id: new Map(),
        chain_index_label_seq_id: new Map(),
        auth_asym_id_auth_seq_id: new Map(),
        chain_index_auth_seq_id: new Map(),
        label_asym_id: new Map(),
    };
}
var _tempResidueKey = AtomicIndex.EmptyResidueKey();
var Index = /** @class */ (function () {
    function Index(map) {
        this.map = map;
        this.entityIndex = map.entities.getEntityIndex;
        this.residueOffsets = this.map.segments.residueAtomSegments.offsets;
    }
    Index.prototype.getEntityFromChain = function (cI) {
        return this.map.chain_index_entity_index[cI];
    };
    Index.prototype.findEntity = function (label_asym_id) {
        var entityIndex = this.map.label_asym_id.get(label_asym_id);
        return entityIndex !== undefined ? entityIndex : -1;
    };
    Index.prototype.findChainLabel = function (key) {
        var eI = this.entityIndex(key.label_entity_id);
        if (eI < 0 || !this.map.entity_index_label_asym_id.has(eI))
            return -1;
        var cm = this.map.entity_index_label_asym_id.get(eI);
        if (!cm)
            return -1;
        return cm.has(key.label_asym_id) ? cm.get(key.label_asym_id) : -1;
    };
    Index.prototype.findChainAuth = function (key) {
        if (!this.map.auth_asym_id_auth_seq_id.has(key.auth_asym_id))
            return -1;
        var rm = this.map.auth_asym_id_auth_seq_id.get(key.auth_asym_id);
        return rm.has(key.auth_seq_id) ? rm.get(key.auth_seq_id) : -1;
    };
    Index.prototype.findResidue = function (label_entity_id_or_key, label_asym_id, auth_seq_id, pdbx_PDB_ins_code) {
        var key;
        if (arguments.length === 1) {
            key = label_entity_id_or_key;
        }
        else {
            _tempResidueKey.label_entity_id = label_entity_id_or_key;
            _tempResidueKey.label_asym_id = label_asym_id;
            _tempResidueKey.auth_seq_id = auth_seq_id;
            _tempResidueKey.pdbx_PDB_ins_code = pdbx_PDB_ins_code;
            key = _tempResidueKey;
        }
        var cI = this.findChainLabel(key);
        if (cI < 0)
            return -1;
        var rm = this.map.chain_index_auth_seq_id.get(cI);
        var id = getResidueId(key.auth_seq_id, key.pdbx_PDB_ins_code || '');
        return rm.has(id) ? rm.get(id) : -1;
    };
    Index.prototype.findResidueLabel = function (key) {
        var cI = this.findChainLabel(key);
        if (cI < 0)
            return -1;
        var rm = this.map.chain_index_label_seq_id.get(cI);
        var id = getResidueId(key.label_seq_id, key.pdbx_PDB_ins_code || '');
        return rm.has(id) ? rm.get(id) : -1;
    };
    Index.prototype.findResidueAuth = function (key) {
        var cI = this.findChainAuth(key);
        if (cI < 0)
            return -1;
        var rm = this.map.chain_index_auth_seq_id.get(cI);
        var id = getResidueId(key.auth_seq_id, key.pdbx_PDB_ins_code || '');
        return rm.has(id) ? rm.get(id) : -1;
    };
    Index.prototype.findResidueInsertion = function (key) {
        var cI = this.findChainLabel(key);
        if (cI < 0)
            return -1;
        var rm = this.map.chain_index_label_seq_id.get(cI);
        var id = getResidueId(key.label_seq_id, key.pdbx_PDB_ins_code || '');
        if (rm.has(id))
            return rm.get(id);
        var idx = SortedArray.findPredecessorIndex(this.map.label_seq_id, key.label_seq_id);
        var start = AtomicHierarchy.chainStartResidueIndex(this.map.segments, cI);
        if (idx < start)
            return start;
        var end = AtomicHierarchy.chainEndResidueIndexExcl(this.map.segments, cI) - 1;
        if (idx >= end)
            return end;
        return idx;
    };
    Index.prototype.findAtom = function (key) {
        var rI = this.findResidue(key);
        if (rI < 0)
            return -1;
        if (typeof key.label_alt_id === 'undefined') {
            return findAtomByName(this.residueOffsets[rI], this.residueOffsets[rI + 1], this.map.label_atom_id, key.label_atom_id);
        }
        return findAtomByNameAndAltLoc(this.residueOffsets[rI], this.residueOffsets[rI + 1], this.map.label_atom_id, this.map.label_alt_id, key.label_atom_id, key.label_alt_id);
    };
    Index.prototype.findAtomAuth = function (key) {
        var rI = this.findResidueAuth(key);
        if (rI < 0)
            return -1;
        if (typeof key.label_alt_id === 'undefined') {
            return findAtomByName(this.residueOffsets[rI], this.residueOffsets[rI + 1], this.map.auth_atom_id, key.auth_atom_id);
        }
        return findAtomByNameAndAltLoc(this.residueOffsets[rI], this.residueOffsets[rI + 1], this.map.auth_atom_id, this.map.label_alt_id, key.auth_atom_id, key.label_alt_id);
    };
    Index.prototype.findAtomOnResidue = function (rI, label_atom_id, label_alt_id) {
        if (typeof label_alt_id === 'undefined') {
            return findAtomByName(this.residueOffsets[rI], this.residueOffsets[rI + 1], this.map.label_atom_id, label_atom_id);
        }
        return findAtomByNameAndAltLoc(this.residueOffsets[rI], this.residueOffsets[rI + 1], this.map.label_atom_id, this.map.label_alt_id, label_atom_id, label_alt_id);
    };
    Index.prototype.findAtomsOnResidue = function (rI, label_atom_ids) {
        return findAtomByNames(this.residueOffsets[rI], this.residueOffsets[rI + 1], this.map.label_atom_id, label_atom_ids);
    };
    Index.prototype.findElementOnResidue = function (rI, type_symbol) {
        return findAtomByElement(this.residueOffsets[rI], this.residueOffsets[rI + 1], this.map.type_symbol, type_symbol);
    };
    return Index;
}());
function findAtomByName(start, end, data, atomName) {
    for (var i = start; i < end; i++) {
        if (data.value(i) === atomName)
            return i;
    }
    return -1;
}
function findAtomByNames(start, end, data, atomNames) {
    for (var i = start; i < end; i++) {
        if (atomNames.has(data.value(i)))
            return i;
    }
    return -1;
}
function findAtomByNameAndAltLoc(start, end, nameData, altLocData, atomName, altLoc) {
    for (var i = start; i < end; i++) {
        if (nameData.value(i) === atomName && altLocData.value(i) === altLoc)
            return i;
    }
    return -1;
}
function findAtomByElement(start, end, data, typeSymbol) {
    for (var i = start; i < end; i++) {
        if (data.value(i) === typeSymbol)
            return i;
    }
    return -1;
}
export function getAtomicIndex(data, entities, segments) {
    var map = createMapping(entities, data, segments);
    var _a = data.residues, label_seq_id = _a.label_seq_id, auth_seq_id = _a.auth_seq_id, pdbx_PDB_ins_code = _a.pdbx_PDB_ins_code;
    var _b = data.chains, label_entity_id = _b.label_entity_id, label_asym_id = _b.label_asym_id, auth_asym_id = _b.auth_asym_id;
    var atomSet = Interval.ofBounds(0, data.atoms._rowCount);
    var chainsIt = Segmentation.transientSegments(segments.chainAtomSegments, atomSet);
    while (chainsIt.hasNext) {
        var chainSegment = chainsIt.move();
        var chainIndex = chainSegment.index;
        var entityIndex = entities.getEntityIndex(label_entity_id.value(chainIndex));
        if (entityIndex < 0)
            missingEntity(label_entity_id.value(chainIndex));
        map.chain_index_entity_index[chainIndex] = entityIndex;
        var authAsymId = auth_asym_id.value(chainIndex);
        var auth_asym_id_auth_seq_id = map.auth_asym_id_auth_seq_id.get(authAsymId);
        if (!auth_asym_id_auth_seq_id) {
            auth_asym_id_auth_seq_id = new Map();
            map.auth_asym_id_auth_seq_id.set(authAsymId, auth_asym_id_auth_seq_id);
        }
        var labelAsymId = label_asym_id.value(chainIndex);
        if (!map.label_asym_id.has(labelAsymId))
            map.label_asym_id.set(labelAsymId, entityIndex);
        updateMapMapIndex(map.entity_index_label_asym_id, entityIndex, labelAsymId, chainIndex);
        var chain_index_label_seq_id = new Map();
        var chain_index_auth_seq_id = new Map();
        map.chain_index_label_seq_id.set(chainIndex, chain_index_label_seq_id);
        map.chain_index_auth_seq_id.set(chainIndex, chain_index_auth_seq_id);
        var residuesIt = Segmentation.transientSegments(segments.residueAtomSegments, atomSet, chainSegment);
        while (residuesIt.hasNext) {
            var residueSegment = residuesIt.move();
            var rI = residueSegment.index;
            var authSeqId = auth_seq_id.value(rI);
            var insCode = pdbx_PDB_ins_code.value(rI);
            chain_index_label_seq_id.set(getResidueId(label_seq_id.value(rI), insCode), rI);
            chain_index_auth_seq_id.set(getResidueId(authSeqId, insCode), rI);
            auth_asym_id_auth_seq_id.set(authSeqId, chainIndex);
        }
    }
    return new Index(map);
}
