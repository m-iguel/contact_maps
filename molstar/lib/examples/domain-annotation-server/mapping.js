/**
 * Copyright (c) 2017 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { __assign } from "tslib";
import { Table } from '../../mol-data/db';
import { CifWriter } from '../../mol-io/writer/cif';
import * as S from './schemas';
// import { getCategoryInstanceProvider } from './utils'
export function createMapping(allData) {
    var mols = Object.keys(allData);
    var enc = CifWriter.createEncoder();
    enc.startDataBlock(mols[0]);
    if (!mols.length)
        return enc.getData();
    var data = allData[mols[0]];
    var sources = getSources(data);
    if (!sources._rowCount)
        return enc.getData();
    enc.writeCategory({ name: "pdbx_domain_annotation_sources", instance: function () { return CifWriter.Category.ofTable(sources); } });
    for (var _i = 0, _a = Object.keys(S.categories); _i < _a.length; _i++) {
        var cat = _a[_i];
        writeDomain(enc, getDomain(cat, S.categories[cat], data));
    }
    return enc.getData();
}
function writeDomain(enc, domain) {
    if (!domain)
        return;
    enc.writeCategory({ name: "pdbx_".concat(domain.name, "_domain_annotation"), instance: function () { return CifWriter.Category.ofTable(domain.domains); } });
    enc.writeCategory({ name: "pdbx_".concat(domain.name, "_domain_mapping"), instance: function () { return CifWriter.Category.ofTable(domain.mappings); } });
}
function getSources(data) {
    var rows = [];
    for (var _i = 0, _a = Object.keys(S.categories); _i < _a.length; _i++) {
        var name_1 = _a[_i];
        if (!data[name_1])
            continue;
        var row = { id: name_1, count: Object.keys(data[name_1]).length };
        if (row.count > 0)
            rows.push(row);
    }
    return Table.ofRows(S.Sources, rows);
}
function getMappings(startId, group_id, mappings) {
    var rows = [];
    var n = function (v) { return v === null ? void 0 : v; };
    for (var _i = 0, mappings_1 = mappings; _i < mappings_1.length; _i++) {
        var entry = mappings_1[_i];
        if (entry.start && entry.end) {
            rows.push({
                id: startId++,
                group_id: group_id,
                label_entity_id: '' + entry.entity_id,
                label_asym_id: entry.struct_asym_id,
                auth_asym_id: entry.chain_id,
                beg_label_seq_id: n(entry.start.residue_number),
                beg_auth_seq_id: n(entry.start.author_residue_number),
                pdbx_beg_PDB_ins_code: entry.start.author_insertion_code,
                end_label_seq_id: n(entry.end.residue_number),
                end_auth_seq_id: n(entry.end.author_residue_number),
                pdbx_end_PDB_ins_code: entry.end.author_insertion_code
            });
        }
        else {
            rows.push({
                id: startId++,
                group_id: group_id,
                label_entity_id: '' + entry.entity_id,
                label_asym_id: entry.struct_asym_id,
                auth_asym_id: entry.chain_id
            });
        }
    }
    return rows;
}
function getDomainInfo(id, mapping_group_id, data, schema) {
    var props = Object.create(null);
    for (var _i = 0, _a = Object.keys(schema); _i < _a.length; _i++) {
        var k = _a[_i];
        props[k] = data[k];
    }
    return __assign({ id: id, mapping_group_id: mapping_group_id, identifier: data.identifier }, props);
}
function getDomain(name, schema, allData) {
    if (!allData[name])
        return void 0;
    var data = allData[name];
    var domains = [];
    var mappings = [];
    var mappingSerialId = 1, mapping_group_id = 1;
    for (var _i = 0, _a = Object.keys(data); _i < _a.length; _i++) {
        var id = _a[_i];
        var domain = data[id];
        domains.push(getDomainInfo(id, mapping_group_id, domain, schema));
        mappings.push.apply(mappings, getMappings(mappingSerialId, mapping_group_id, domain.mappings));
        mappingSerialId = mappings.length + 1;
        mapping_group_id++;
    }
    return domains.length > 0 ? {
        name: name,
        domains: Table.ofRows(__assign(__assign({}, S.Base), schema), domains),
        mappings: Table.ofRows(S.mapping, mappings)
    } : void 0;
}
