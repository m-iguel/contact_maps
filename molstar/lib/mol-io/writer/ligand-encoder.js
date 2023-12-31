/**
 * Copyright (c) 2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Sebastian Bittrich <sebastian.bittrich@rcsb.org>
 */
import { __assign } from "tslib";
import { StringBuilder } from '../../mol-util';
import { getElementIdx, isHydrogen } from '../../mol-model/structure/structure/unit/bonds/common';
function Atom(partial) {
    return __assign({}, partial);
}
var LigandEncoder = /** @class */ (function () {
    function LigandEncoder(encoder, metaInformation, hydrogens) {
        this.encoder = encoder;
        this.metaInformation = metaInformation;
        this.hydrogens = hydrogens;
        this.error = false;
        this.encoded = false;
        this.isBinary = false;
        this.binaryEncodingProvider = void 0;
        this.builder = StringBuilder.create();
        this.meta = StringBuilder.create();
    }
    LigandEncoder.prototype.writeCategory = function (category, context) {
        if (this.encoded) {
            throw new Error('The writer contents have already been encoded, no more writing.');
        }
        if (this.metaInformation && (category.name === 'model_server_result' || category.name === 'model_server_params' || category.name === 'model_server_stats')) {
            this.writeFullCategory(this.meta, category, context);
            return;
        }
        // if error: force writing of meta information
        if (category.name === 'model_server_error') {
            this.writeFullCategory(this.meta, category, context);
            this.error = true;
            return;
        }
        // only care about atom_site category when writing SDF
        if (category.name !== 'atom_site') {
            return;
        }
        this._writeCategory(category, context);
    };
    LigandEncoder.prototype.setComponentAtomData = function (componentAtomData) {
        this.componentAtomData = componentAtomData;
    };
    LigandEncoder.prototype.setComponentBondData = function (componentBondData) {
        this.componentBondData = componentBondData;
    };
    LigandEncoder.prototype.writeTo = function (stream) {
        var chunks = StringBuilder.getChunks(this.builder);
        for (var i = 0, _i = chunks.length; i < _i; i++) {
            stream.writeString(chunks[i]);
        }
    };
    LigandEncoder.prototype.getSize = function () {
        return StringBuilder.getSize(this.builder);
    };
    LigandEncoder.prototype.getData = function () {
        return StringBuilder.getString(this.builder);
    };
    LigandEncoder.prototype.getAtoms = function (instance, source) {
        var sortedFields = this.getSortedFields(instance, ['Cartn_x', 'Cartn_y', 'Cartn_z']);
        var label_atom_id = this.getField(instance, 'label_atom_id');
        var type_symbol = this.getField(instance, 'type_symbol');
        return this._getAtoms(source, sortedFields, label_atom_id, type_symbol);
    };
    LigandEncoder.prototype._getAtoms = function (source, fields, label_atom_id, type_symbol) {
        var atoms = new Map();
        var index = 0;
        // is outer loop even needed?
        for (var _c = 0; _c < source.length; _c++) {
            var src = source[_c];
            var data = src.data;
            if (src.rowCount === 0)
                continue;
            var it_1 = src.keys();
            while (it_1.hasNext) {
                var key = it_1.move();
                var lai = label_atom_id.value(key, data, index);
                // ignore all alternate locations after the first
                if (atoms.has(lai))
                    continue;
                var ts = type_symbol.value(key, data, index);
                if (this.skipHydrogen(ts))
                    continue;
                var a = {};
                for (var _f = 0, _fl = fields.length; _f < _fl; _f++) {
                    var f = fields[_f];
                    a[f.name] = f.value(key, data, index);
                }
                a[type_symbol.name] = ts;
                a['index'] = index;
                atoms.set(lai, Atom(a));
                index++;
            }
        }
        return atoms;
    };
    LigandEncoder.prototype.skipHydrogen = function (type_symbol) {
        if (this.hydrogens) {
            return false;
        }
        return this.isHydrogen(type_symbol);
    };
    LigandEncoder.prototype.isHydrogen = function (type_symbol) {
        return isHydrogen(getElementIdx(type_symbol));
    };
    LigandEncoder.prototype.getSortedFields = function (instance, names) {
        var _this = this;
        return names.map(function (n) { return _this.getField(instance, n); });
    };
    LigandEncoder.prototype.getField = function (instance, name) {
        return instance.fields.find(function (f) { return f.name === name; });
    };
    LigandEncoder.prototype.getName = function (instance, source) {
        var label_comp_id = this.getField(instance, 'label_comp_id');
        return label_comp_id.value(source[0].keys().move(), source[0].data, 0);
    };
    LigandEncoder.prototype.startDataBlock = function () { };
    LigandEncoder.prototype.setFilter = function () { };
    LigandEncoder.prototype.setFormatter = function () { };
    LigandEncoder.prototype.isCategoryIncluded = function () {
        return true;
    };
    return LigandEncoder;
}());
export { LigandEncoder };
