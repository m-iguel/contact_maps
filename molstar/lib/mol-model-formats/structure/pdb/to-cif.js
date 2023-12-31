/**
 * Copyright (c) 2019-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author Yana Rose <yana.v.rose@gmail.com>
 */
import { __awaiter, __generator } from "tslib";
import { substringStartsWith } from '../../../mol-util/string';
import { CifCategory, CifField } from '../../../mol-io/reader/cif';
import { Tokenizer } from '../../../mol-io/reader/common/text/tokenizer';
import { parseCryst1, parseRemark350, parseMtrix } from './assembly';
import { parseHelix, parseSheet } from './secondary-structure';
import { parseCmpnd, parseHetnam } from './entity';
import { ComponentBuilder } from '../common/component';
import { EntityBuilder } from '../common/entity';
import { Column } from '../../../mol-data/db';
import { getMoleculeType } from '../../../mol-model/structure/model/types';
import { getAtomSiteTemplate, addAtom, getAtomSite } from './atom-site';
import { addAnisotropic, getAnisotropicTemplate, getAnisotropic } from './anisotropic';
import { parseConect } from './conect';
import { isDebugMode } from '../../../mol-util/debug';
import { addHeader } from './header';
export function pdbToMmCif(pdb) {
    return __awaiter(this, void 0, void 0, function () {
        var lines, data, indices, tokenizer, isPdbqt, atomCount, anisotropicCount, i, _i, s, e, header, atomSite, anisotropic, entityBuilder, helperCategories, heteroNames, modelNum, modelStr, conectRange, hasAssemblies, terIndices, i, _i, s, e, j, j, j, j, j, j, j, entry, struct_keywords, pdbx_database_status, seqIds, atomIds, compIds, asymIds, componentBuilder, i, il, compId, moleculeType, atom_site, categories, _a, helperCategories_1, c;
        return __generator(this, function (_b) {
            lines = pdb.lines;
            data = lines.data, indices = lines.indices;
            tokenizer = Tokenizer(data);
            isPdbqt = !!pdb.isPdbqt;
            atomCount = 0;
            anisotropicCount = 0;
            for (i = 0, _i = lines.count; i < _i; i++) {
                s = indices[2 * i], e = indices[2 * i + 1];
                switch (data[s]) {
                    case 'A':
                        if (substringStartsWith(data, s, e, 'ATOM  '))
                            atomCount++;
                        else if (substringStartsWith(data, s, e, 'ANISOU'))
                            anisotropicCount++;
                        break;
                    case 'H':
                        if (substringStartsWith(data, s, e, 'HETATM'))
                            atomCount++;
                        break;
                }
            }
            header = {};
            atomSite = getAtomSiteTemplate(data, atomCount);
            anisotropic = getAnisotropicTemplate(data, anisotropicCount);
            entityBuilder = new EntityBuilder();
            helperCategories = [];
            heteroNames = [];
            modelNum = 0, modelStr = '';
            conectRange = undefined;
            hasAssemblies = false;
            terIndices = new Set();
            for (i = 0, _i = lines.count; i < _i; i++) {
                s = indices[2 * i], e = indices[2 * i + 1];
                switch (data[s]) {
                    case 'A':
                        if (substringStartsWith(data, s, e, 'ATOM  ')) {
                            if (!modelNum) {
                                modelNum++;
                                modelStr = '' + modelNum;
                            }
                            addAtom(atomSite, modelStr, tokenizer, s, e, isPdbqt);
                        }
                        else if (substringStartsWith(data, s, e, 'ANISOU')) {
                            addAnisotropic(anisotropic, modelStr, tokenizer, s, e);
                        }
                        break;
                    case 'C':
                        if (substringStartsWith(data, s, e, 'CRYST1')) {
                            helperCategories.push.apply(helperCategories, parseCryst1(pdb.id || '?', data.substring(s, e)));
                        }
                        else if (substringStartsWith(data, s, e, 'CONECT')) {
                            j = i + 1;
                            while (true) {
                                s = indices[2 * j];
                                e = indices[2 * j + 1];
                                if (!substringStartsWith(data, s, e, 'CONECT'))
                                    break;
                                j++;
                            }
                            if (conectRange) {
                                if (isDebugMode) {
                                    console.log('only single CONECT block allowed, ignoring others');
                                }
                            }
                            else {
                                conectRange = [i, j];
                            }
                            i = j - 1;
                        }
                        else if (substringStartsWith(data, s, e, 'COMPND')) {
                            j = i + 1;
                            while (true) {
                                s = indices[2 * j];
                                e = indices[2 * j + 1];
                                if (!substringStartsWith(data, s, e, 'COMPND'))
                                    break;
                                j++;
                            }
                            entityBuilder.setCompounds(parseCmpnd(lines, i, j));
                            i = j - 1;
                        }
                        break;
                    case 'H':
                        if (substringStartsWith(data, s, e, 'HEADER')) {
                            addHeader(data, s, e, header);
                        }
                        else if (substringStartsWith(data, s, e, 'HETATM')) {
                            if (!modelNum) {
                                modelNum++;
                                modelStr = '' + modelNum;
                            }
                            addAtom(atomSite, modelStr, tokenizer, s, e, isPdbqt);
                        }
                        else if (substringStartsWith(data, s, e, 'HELIX')) {
                            j = i + 1;
                            while (true) {
                                s = indices[2 * j];
                                e = indices[2 * j + 1];
                                if (!substringStartsWith(data, s, e, 'HELIX'))
                                    break;
                                j++;
                            }
                            helperCategories.push(parseHelix(lines, i, j));
                            i = j - 1;
                        }
                        else if (substringStartsWith(data, s, e, 'HETNAM')) {
                            j = i + 1;
                            while (true) {
                                s = indices[2 * j];
                                e = indices[2 * j + 1];
                                if (!substringStartsWith(data, s, e, 'HETNAM'))
                                    break;
                                j++;
                            }
                            heteroNames.push.apply(heteroNames, Array.from(parseHetnam(lines, i, j).entries()));
                            i = j - 1;
                        }
                        break;
                    case 'M':
                        if (substringStartsWith(data, s, e, 'MODEL ')) {
                            modelNum++;
                            modelStr = '' + modelNum;
                        }
                        if (substringStartsWith(data, s, e, 'MTRIX')) {
                            j = i + 1;
                            while (true) {
                                s = indices[2 * j];
                                e = indices[2 * j + 1];
                                if (!substringStartsWith(data, s, e, 'MTRIX'))
                                    break;
                                j++;
                            }
                            helperCategories.push.apply(helperCategories, parseMtrix(lines, i, j));
                            i = j - 1;
                        }
                        // TODO: MODRES records => pdbx_struct_mod_residue
                        break;
                    case 'O':
                        // TODO: ORIGX record => cif.database_PDB_matrix.origx, cif.database_PDB_matrix.origx_vector
                        break;
                    case 'R':
                        if (substringStartsWith(data, s, e, 'REMARK 350')) {
                            j = i + 1;
                            while (true) {
                                s = indices[2 * j];
                                e = indices[2 * j + 1];
                                if (!substringStartsWith(data, s, e, 'REMARK 350'))
                                    break;
                                j++;
                            }
                            helperCategories.push.apply(helperCategories, parseRemark350(lines, i, j));
                            i = j - 1;
                            hasAssemblies = true;
                        }
                        break;
                    case 'S':
                        if (substringStartsWith(data, s, e, 'SHEET')) {
                            j = i + 1;
                            while (true) {
                                s = indices[2 * j];
                                e = indices[2 * j + 1];
                                if (!substringStartsWith(data, s, e, 'SHEET'))
                                    break;
                                j++;
                            }
                            helperCategories.push(parseSheet(lines, i, j));
                            i = j - 1;
                        }
                        // TODO: SCALE record => cif.atom_sites.fract_transf_matrix, cif.atom_sites.fract_transf_vector
                        break;
                    case 'T':
                        if (substringStartsWith(data, s, e, 'TER')) {
                            terIndices.add(atomSite.index);
                        }
                }
            }
            // build entry, struct_keywords and pdbx_database_status
            if (header.id_code) {
                entry = {
                    id: CifField.ofString(header.id_code)
                };
                helperCategories.push(CifCategory.ofFields('entry', entry));
            }
            if (header.classification) {
                struct_keywords = {
                    pdbx_keywords: CifField.ofString(header.classification)
                };
                helperCategories.push(CifCategory.ofFields('struct_keywords', struct_keywords));
            }
            if (header.dep_date) {
                pdbx_database_status = {
                    recvd_initial_deposition_date: CifField.ofString(header.dep_date)
                };
                helperCategories.push(CifCategory.ofFields('pdbx_database_status', pdbx_database_status));
            }
            seqIds = Column.ofIntTokens(atomSite.auth_seq_id);
            atomIds = Column.ofStringTokens(atomSite.auth_atom_id);
            compIds = Column.ofStringTokens(atomSite.auth_comp_id);
            asymIds = Column.ofStringTokens(atomSite.auth_asym_id);
            componentBuilder = new ComponentBuilder(seqIds, atomIds);
            componentBuilder.setNames(heteroNames);
            entityBuilder.setNames(heteroNames);
            for (i = 0, il = compIds.rowCount; i < il; ++i) {
                compId = compIds.value(i);
                moleculeType = getMoleculeType(componentBuilder.add(compId, i).type, compId);
                atomSite.label_entity_id[i] = entityBuilder.getEntityId(compId, moleculeType, asymIds.value(i));
            }
            atom_site = getAtomSite(atomSite, terIndices, { hasAssemblies: hasAssemblies });
            if (!isPdbqt)
                delete atom_site.partial_charge;
            if (conectRange) {
                helperCategories.push(parseConect(lines, conectRange[0], conectRange[1], atom_site));
            }
            categories = {
                entity: CifCategory.ofTable('entity', entityBuilder.getEntityTable()),
                chem_comp: CifCategory.ofTable('chem_comp', componentBuilder.getChemCompTable()),
                atom_site: CifCategory.ofFields('atom_site', atom_site),
                atom_site_anisotrop: CifCategory.ofFields('atom_site_anisotrop', getAnisotropic(anisotropic))
            };
            for (_a = 0, helperCategories_1 = helperCategories; _a < helperCategories_1.length; _a++) {
                c = helperCategories_1[_a];
                categories[c.name] = c;
            }
            return [2 /*return*/, {
                    header: pdb.id || 'PDB',
                    categoryNames: Object.keys(categories),
                    categories: categories
                }];
        });
    });
}
