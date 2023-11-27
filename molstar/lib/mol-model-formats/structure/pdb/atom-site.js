/**
 * Copyright (c) 2019-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { CifField } from '../../../mol-io/reader/cif';
import { TokenBuilder, Tokenizer } from '../../../mol-io/reader/common/text/tokenizer';
import { guessElementSymbolTokens } from '../util';
import { Column } from '../../../mol-data/db';
import { areTokensEmpty } from '../../../mol-io/reader/common/text/column/token';
export function getAtomSiteTemplate(data, count) {
    var str = function () { return []; };
    var ts = function () { return TokenBuilder.create(data, 2 * count); };
    return {
        index: 0,
        group_PDB: ts(),
        id: str(),
        auth_atom_id: ts(),
        label_alt_id: ts(),
        auth_comp_id: ts(),
        auth_asym_id: ts(),
        auth_seq_id: ts(),
        pdbx_PDB_ins_code: ts(),
        Cartn_x: ts(),
        Cartn_y: ts(),
        Cartn_z: ts(),
        occupancy: ts(),
        B_iso_or_equiv: ts(),
        type_symbol: ts(),
        pdbx_PDB_model_num: str(),
        label_entity_id: str(),
        partial_charge: ts(),
    };
}
export function getAtomSite(sites, terIndices, options) {
    var pdbx_PDB_model_num = CifField.ofStrings(sites.pdbx_PDB_model_num);
    var auth_asym_id = CifField.ofTokens(sites.auth_asym_id);
    var auth_seq_id = CifField.ofTokens(sites.auth_seq_id);
    var auth_atom_id = CifField.ofTokens(sites.auth_atom_id);
    var auth_comp_id = CifField.ofTokens(sites.auth_comp_id);
    var id = CifField.ofStrings(sites.id);
    //
    var currModelNum = pdbx_PDB_model_num.str(0);
    var currAsymId = auth_asym_id.str(0);
    var currSeqId = auth_seq_id.int(0);
    var currLabelAsymId = currAsymId;
    var asymIdCounts = new Map();
    var atomIdCounts = new Map();
    var labelAsymIds = [];
    var labelAtomIds = [];
    // ensure unique asym ids per model and unique atom ids per seq id
    for (var i = 0, il = id.rowCount; i < il; ++i) {
        var modelNum = pdbx_PDB_model_num.str(i);
        var asymId = auth_asym_id.str(i);
        var seqId = auth_seq_id.int(i);
        var atomId = auth_atom_id.str(i);
        if (modelNum !== currModelNum) {
            asymIdCounts.clear();
            atomIdCounts.clear();
            currModelNum = modelNum;
            currAsymId = asymId;
            currSeqId = seqId;
            currLabelAsymId = asymId;
        }
        else if (currAsymId !== asymId) {
            atomIdCounts.clear();
            currAsymId = asymId;
            currSeqId = seqId;
            currLabelAsymId = asymId;
        }
        else if (currSeqId !== seqId) {
            atomIdCounts.clear();
            currSeqId = seqId;
        }
        if (asymIdCounts.has(asymId)) {
            // only change the chains name if there are TER records
            // otherwise assume repeated chain name use is from interleaved chains
            // also don't change the chains name if there are assemblies
            // as those require the original chain name
            if (terIndices.has(i) && !options.hasAssemblies) {
                var asymIdCount = asymIdCounts.get(asymId) + 1;
                asymIdCounts.set(asymId, asymIdCount);
                currLabelAsymId = "".concat(asymId, "_").concat(asymIdCount);
            }
        }
        else {
            asymIdCounts.set(asymId, 0);
        }
        labelAsymIds[i] = currLabelAsymId;
        if (atomIdCounts.has(atomId)) {
            var atomIdCount = atomIdCounts.get(atomId) + 1;
            atomIdCounts.set(atomId, atomIdCount);
            atomId = "".concat(atomId, "_").concat(atomIdCount);
        }
        else {
            atomIdCounts.set(atomId, 0);
        }
        labelAtomIds[i] = atomId;
    }
    var labelAsymId = Column.ofStringArray(labelAsymIds);
    var labelAtomId = Column.ofStringArray(labelAtomIds);
    //
    return {
        auth_asym_id: auth_asym_id,
        auth_atom_id: auth_atom_id,
        auth_comp_id: auth_comp_id,
        auth_seq_id: auth_seq_id,
        B_iso_or_equiv: CifField.ofTokens(sites.B_iso_or_equiv),
        Cartn_x: CifField.ofTokens(sites.Cartn_x),
        Cartn_y: CifField.ofTokens(sites.Cartn_y),
        Cartn_z: CifField.ofTokens(sites.Cartn_z),
        group_PDB: CifField.ofTokens(sites.group_PDB),
        id: id,
        label_alt_id: CifField.ofTokens(sites.label_alt_id),
        label_asym_id: CifField.ofColumn(labelAsymId),
        label_atom_id: CifField.ofColumn(labelAtomId),
        label_comp_id: auth_comp_id,
        label_seq_id: CifField.ofUndefined(sites.index, Column.Schema.int),
        label_entity_id: CifField.ofStrings(sites.label_entity_id),
        occupancy: areTokensEmpty(sites.occupancy) ? CifField.ofUndefined(sites.index, Column.Schema.float) : CifField.ofTokens(sites.occupancy),
        type_symbol: CifField.ofTokens(sites.type_symbol),
        pdbx_PDB_ins_code: CifField.ofTokens(sites.pdbx_PDB_ins_code),
        pdbx_PDB_model_num: pdbx_PDB_model_num,
        partial_charge: CifField.ofTokens(sites.partial_charge)
    };
}
export function addAtom(sites, model, data, s, e, isPdbqt) {
    var str = data.data;
    var length = e - s;
    // TODO: filter invalid atoms
    // COLUMNS        DATA TYPE       CONTENTS
    // --------------------------------------------------------------------------------
    // 1 -  6        Record name     "ATOM  "
    TokenBuilder.addToken(sites.group_PDB, Tokenizer.trim(data, s, s + 6));
    // 7 - 11        Integer         Atom serial number.
    // TODO: support HEX
    Tokenizer.trim(data, s + 6, s + 11);
    sites.id[sites.index] = data.data.substring(data.tokenStart, data.tokenEnd);
    // 13 - 16        Atom            Atom name.
    TokenBuilder.addToken(sites.auth_atom_id, Tokenizer.trim(data, s + 12, s + 16));
    // 17             Character       Alternate location indicator.
    if (str.charCodeAt(s + 16) === 32) { // ' '
        TokenBuilder.add(sites.label_alt_id, 0, 0);
    }
    else {
        TokenBuilder.add(sites.label_alt_id, s + 16, s + 17);
    }
    // 18 - 20        Residue name    Residue name.
    TokenBuilder.addToken(sites.auth_comp_id, Tokenizer.trim(data, s + 17, s + 20));
    // 22             Character       Chain identifier.
    TokenBuilder.add(sites.auth_asym_id, s + 21, s + 22);
    // 23 - 26        Integer         Residue sequence number.
    // TODO: support HEX
    TokenBuilder.addToken(sites.auth_seq_id, Tokenizer.trim(data, s + 22, s + 26));
    // 27             AChar           Code for insertion of residues.
    if (str.charCodeAt(s + 26) === 32) { // ' '
        TokenBuilder.add(sites.pdbx_PDB_ins_code, 0, 0);
    }
    else {
        TokenBuilder.add(sites.pdbx_PDB_ins_code, s + 26, s + 27);
    }
    // 31 - 38        Real(8.3)       Orthogonal coordinates for X in Angstroms.
    TokenBuilder.addToken(sites.Cartn_x, Tokenizer.trim(data, s + 30, s + 38));
    // 39 - 46        Real(8.3)       Orthogonal coordinates for Y in Angstroms.
    TokenBuilder.addToken(sites.Cartn_y, Tokenizer.trim(data, s + 38, s + 46));
    // 47 - 54        Real(8.3)       Orthogonal coordinates for Z in Angstroms.
    TokenBuilder.addToken(sites.Cartn_z, Tokenizer.trim(data, s + 46, s + 54));
    // 55 - 60        Real(6.2)       Occupancy.
    TokenBuilder.addToken(sites.occupancy, Tokenizer.trim(data, s + 54, s + 60));
    // 61 - 66        Real(6.2)       Temperature factor (Default = 0.0).
    if (length >= 66) {
        TokenBuilder.addToken(sites.B_iso_or_equiv, Tokenizer.trim(data, s + 60, s + 66));
    }
    else {
        TokenBuilder.add(sites.B_iso_or_equiv, 0, 0);
    }
    // 73 - 76        LString(4)      Segment identifier, left-justified.
    if (isPdbqt) {
        TokenBuilder.addToken(sites.partial_charge, Tokenizer.trim(data, s + 70, s + 76));
    }
    else {
        // ignored
    }
    // 77 - 78        LString(2)      Element symbol, right-justified.
    if (length >= 78 && !isPdbqt) {
        Tokenizer.trim(data, s + 76, s + 78);
        if (data.tokenStart < data.tokenEnd) {
            TokenBuilder.addToken(sites.type_symbol, data);
        }
        else {
            guessElementSymbolTokens(sites.type_symbol, str, s + 12, s + 16);
        }
    }
    else {
        guessElementSymbolTokens(sites.type_symbol, str, s + 12, s + 16);
    }
    // 79 - 80        LString(2)    charge       Charge  on the atom.
    // TODO
    sites.pdbx_PDB_model_num[sites.index] = model;
    sites.index++;
}