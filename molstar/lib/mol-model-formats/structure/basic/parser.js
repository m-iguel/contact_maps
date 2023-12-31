/**
 * Copyright (c) 2017-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { __assign, __awaiter, __generator } from "tslib";
import { Column, Table } from '../../../mol-data/db';
import { UUID } from '../../../mol-util/uuid';
import { Model } from '../../../mol-model/structure/model/model';
import { CustomProperties } from '../../../mol-model/custom-property';
import { getAtomicHierarchyAndConformation } from './atomic';
import { getCoarse, EmptyCoarse } from './coarse';
import { getSequence } from './sequence';
import { sortAtomSite } from './sort';
import { getAtomicRanges } from '../../../mol-model/structure/model/properties/utils/atomic-ranges';
import { getChemicalComponentMap, getMissingResidues, getSaccharideComponentMap, getStructAsymMap } from './properties';
import { getEntitiesWithPRD, getEntityData } from './entities';
import { getModelGroupName } from './util';
import { ArrayTrajectory } from '../../../mol-model/structure/trajectory';
export function createModels(data, format, ctx) {
    return __awaiter(this, void 0, void 0, function () {
        var properties, models, _a, i;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    properties = getCommonProperties(data, format);
                    if (!(data.ihm_model_list._rowCount > 0)) return [3 /*break*/, 2];
                    return [4 /*yield*/, readIntegrative(ctx, data, properties, format)];
                case 1:
                    _a = _b.sent();
                    return [3 /*break*/, 4];
                case 2: return [4 /*yield*/, readStandard(ctx, data, properties, format)];
                case 3:
                    _a = _b.sent();
                    _b.label = 4;
                case 4:
                    models = _a;
                    for (i = 0; i < models.length; i++) {
                        Model.TrajectoryInfo.set(models[i], { index: i, size: models.length });
                    }
                    return [2 /*return*/, new ArrayTrajectory(models)];
            }
        });
    });
}
function getCommonProperties(data, format) {
    return {
        missingResidues: getMissingResidues(data),
        chemicalComponentMap: getChemicalComponentMap(data),
        saccharideComponentMap: getSaccharideComponentMap(data)
    };
}
/** Standard atomic model */
function createStandardModel(data, atom_site, sourceIndex, entities, properties, format, previous) {
    var atomic = getAtomicHierarchyAndConformation(atom_site, sourceIndex, entities, properties.chemicalComponentMap, format, previous);
    var modelNum = atom_site.pdbx_PDB_model_num.value(0);
    if (previous && atomic.sameAsPrevious) {
        return __assign(__assign({}, previous), { id: UUID.create22(), modelNum: modelNum, atomicConformation: atomic.conformation, _dynamicPropertyData: Object.create(null) });
    }
    var coarse = EmptyCoarse;
    var sequence = getSequence(data, entities, atomic.hierarchy, coarse.hierarchy);
    var atomicRanges = getAtomicRanges(atomic.hierarchy, entities, atomic.conformation, sequence);
    var structAsymMap = getStructAsymMap(atomic.hierarchy);
    var entry = data.entry.id.valueKind(0) === 0 /* Column.ValueKinds.Present */
        ? data.entry.id.value(0) : format.name;
    var label = [];
    if (entry)
        label.push(entry);
    if (data.struct.title.valueKind(0) === 0 /* Column.ValueKinds.Present */)
        label.push(data.struct.title.value(0));
    return {
        id: UUID.create22(),
        entryId: entry,
        label: label.join(' | '),
        entry: entry,
        sourceData: format,
        modelNum: modelNum,
        parent: undefined,
        entities: getEntitiesWithPRD(data, entities, structAsymMap),
        sequence: sequence,
        atomicHierarchy: atomic.hierarchy,
        atomicConformation: atomic.conformation,
        atomicRanges: atomicRanges,
        atomicChainOperatorMappinng: atomic.chainOperatorMapping,
        coarseHierarchy: coarse.hierarchy,
        coarseConformation: coarse.conformation,
        properties: __assign(__assign({}, properties), { structAsymMap: structAsymMap }),
        customProperties: new CustomProperties(),
        _staticPropertyData: Object.create(null),
        _dynamicPropertyData: Object.create(null)
    };
}
/** Integrative model with atomic/coarse parts */
function createIntegrativeModel(data, ihm, properties, format) {
    var atomic = getAtomicHierarchyAndConformation(ihm.atom_site, ihm.atom_site_sourceIndex, ihm.entities, properties.chemicalComponentMap, format);
    var coarse = getCoarse(ihm, properties.chemicalComponentMap);
    var sequence = getSequence(data, ihm.entities, atomic.hierarchy, coarse.hierarchy);
    var atomicRanges = getAtomicRanges(atomic.hierarchy, ihm.entities, atomic.conformation, sequence);
    var entry = data.entry.id.valueKind(0) === 0 /* Column.ValueKinds.Present */
        ? data.entry.id.value(0) : format.name;
    var label = [];
    if (entry)
        label.push(entry);
    if (data.struct.title.valueKind(0) === 0 /* Column.ValueKinds.Present */)
        label.push(data.struct.title.value(0));
    if (ihm.model_name)
        label.push(ihm.model_name);
    if (ihm.model_group_name)
        label.push(ihm.model_group_name);
    var structAsymMap = getStructAsymMap(atomic.hierarchy, data);
    return {
        id: UUID.create22(),
        entryId: entry,
        label: label.join(' | '),
        entry: entry,
        sourceData: format,
        modelNum: ihm.model_id,
        parent: undefined,
        entities: getEntitiesWithPRD(data, ihm.entities, structAsymMap),
        sequence: sequence,
        atomicHierarchy: atomic.hierarchy,
        atomicConformation: atomic.conformation,
        atomicRanges: atomicRanges,
        atomicChainOperatorMappinng: atomic.chainOperatorMapping,
        coarseHierarchy: coarse.hierarchy,
        coarseConformation: coarse.conformation,
        properties: __assign(__assign({}, properties), { structAsymMap: structAsymMap }),
        customProperties: new CustomProperties(),
        _staticPropertyData: Object.create(null),
        _dynamicPropertyData: Object.create(null)
    };
}
function findModelEnd(num, startIndex) {
    var rowCount = num.rowCount;
    if (!num.isDefined)
        return rowCount;
    var endIndex = startIndex + 1;
    while (endIndex < rowCount && num.areValuesEqual(startIndex, endIndex))
        endIndex++;
    return endIndex;
}
function readStandard(ctx, data, properties, format) {
    return __awaiter(this, void 0, void 0, function () {
        var models, atomCount, entities, modelStart, modelEnd, _a, atom_site, sourceIndex, model;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    models = [];
                    if (!data.atom_site) return [3 /*break*/, 3];
                    atomCount = data.atom_site.id.rowCount;
                    entities = getEntityData(data);
                    modelStart = 0;
                    _b.label = 1;
                case 1:
                    if (!(modelStart < atomCount)) return [3 /*break*/, 3];
                    modelEnd = findModelEnd(data.atom_site.pdbx_PDB_model_num, modelStart);
                    return [4 /*yield*/, sortAtomSite(ctx, data.atom_site, modelStart, modelEnd)];
                case 2:
                    _a = _b.sent(), atom_site = _a.atom_site, sourceIndex = _a.sourceIndex;
                    model = createStandardModel(data, atom_site, sourceIndex, entities, properties, format, models.length > 0 ? models[models.length - 1] : void 0);
                    models.push(model);
                    modelStart = modelEnd;
                    return [3 /*break*/, 1];
                case 3: return [2 /*return*/, models];
            }
        });
    });
}
function splitTable(table, col) {
    var ret = new Map();
    var rowCount = table._rowCount;
    var modelStart = 0;
    while (modelStart < rowCount) {
        var modelEnd = findModelEnd(col, modelStart);
        var id = col.value(modelStart);
        ret.set(id, {
            table: Table.window(table, table._schema, modelStart, modelEnd),
            start: modelStart,
            end: modelEnd
        });
        modelStart = modelEnd;
    }
    return ret;
}
function readIntegrative(ctx, data, properties, format) {
    return __awaiter(this, void 0, void 0, function () {
        var entities, atom_sites_modelColumn, atom_sites, sphere_sites, gauss_sites, models, _a, model_id, model_name, i, id, atom_site, atom_site_sourceIndex, e, _b, sorted, sourceIndex, ihm, model;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    entities = getEntityData(data);
                    atom_sites_modelColumn = data.atom_site.ihm_model_id.isDefined
                        ? data.atom_site.ihm_model_id : data.atom_site.pdbx_PDB_model_num;
                    atom_sites = splitTable(data.atom_site, atom_sites_modelColumn);
                    sphere_sites = splitTable(data.ihm_sphere_obj_site, data.ihm_sphere_obj_site.model_id);
                    gauss_sites = splitTable(data.ihm_gaussian_obj_site, data.ihm_gaussian_obj_site.model_id);
                    models = [];
                    if (!data.ihm_model_list) return [3 /*break*/, 6];
                    _a = data.ihm_model_list, model_id = _a.model_id, model_name = _a.model_name;
                    i = 0;
                    _c.label = 1;
                case 1:
                    if (!(i < data.ihm_model_list._rowCount)) return [3 /*break*/, 6];
                    id = model_id.value(i);
                    atom_site = void 0, atom_site_sourceIndex = void 0;
                    if (!atom_sites.has(id)) return [3 /*break*/, 3];
                    e = atom_sites.get(id);
                    return [4 /*yield*/, sortAtomSite(ctx, data.atom_site, e.start, e.end)];
                case 2:
                    _b = _c.sent(), sorted = _b.atom_site, sourceIndex = _b.sourceIndex;
                    atom_site = sorted;
                    atom_site_sourceIndex = sourceIndex;
                    return [3 /*break*/, 4];
                case 3:
                    atom_site = Table.window(data.atom_site, data.atom_site._schema, 0, 0);
                    atom_site_sourceIndex = Column.ofIntArray([]);
                    _c.label = 4;
                case 4:
                    ihm = {
                        model_id: id,
                        model_name: model_name.value(i),
                        model_group_name: getModelGroupName(id, data),
                        entities: entities,
                        atom_site: atom_site,
                        atom_site_sourceIndex: atom_site_sourceIndex,
                        ihm_sphere_obj_site: sphere_sites.has(id) ? sphere_sites.get(id).table : Table.window(data.ihm_sphere_obj_site, data.ihm_sphere_obj_site._schema, 0, 0),
                        ihm_gaussian_obj_site: gauss_sites.has(id) ? gauss_sites.get(id).table : Table.window(data.ihm_gaussian_obj_site, data.ihm_gaussian_obj_site._schema, 0, 0)
                    };
                    model = createIntegrativeModel(data, ihm, properties, format);
                    models.push(model);
                    _c.label = 5;
                case 5:
                    i++;
                    return [3 /*break*/, 1];
                case 6: return [2 /*return*/, models];
            }
        });
    });
}
