/**
 * Copyright (c) 2017-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { Unit } from './unit';
import { VdwRadius } from '../model/properties/atomic';
import { SecondaryStructureProvider } from '../../../mol-model-props/computed/secondary-structure';
import { SymmetryOperator } from '../../../mol-math/geometry';
function p(p) { return p; }
var constant = {
    true: p(function (l) { return true; }),
    false: p(function (l) { return false; }),
    zero: p(function (l) { return 0; })
};
function notAtomic() {
    throw new Error('Property only available for atomic models.');
}
function notCoarse(kind) {
    if (!!kind)
        throw new Error("Property only available for coarse models (".concat(kind, ")."));
    throw new Error('Property only available for coarse models.');
}
// TODO: remove the type checks?
var atom = {
    key: p(function (l) { return l.element; }),
    // Conformation
    x: p(function (l) { return l.unit.conformation.x(l.element); }),
    y: p(function (l) { return l.unit.conformation.y(l.element); }),
    z: p(function (l) { return l.unit.conformation.z(l.element); }),
    id: p(function (l) { return !Unit.isAtomic(l.unit) ? notAtomic() : l.unit.model.atomicConformation.atomId.value(l.element); }),
    occupancy: p(function (l) { return !Unit.isAtomic(l.unit) ? notAtomic() : l.unit.model.atomicConformation.occupancy.value(l.element); }),
    B_iso_or_equiv: p(function (l) { return !Unit.isAtomic(l.unit) ? notAtomic() : l.unit.model.atomicConformation.B_iso_or_equiv.value(l.element); }),
    sourceIndex: p(function (l) { return Unit.isAtomic(l.unit)
        ? l.unit.model.atomicHierarchy.atomSourceIndex.value(l.element)
        // TODO: when implemented, this should map to the source index.
        : l.element; }),
    // Hierarchy
    type_symbol: p(function (l) { return !Unit.isAtomic(l.unit) ? notAtomic() : l.unit.model.atomicHierarchy.atoms.type_symbol.value(l.element); }),
    label_atom_id: p(function (l) { return !Unit.isAtomic(l.unit) ? notAtomic() : l.unit.model.atomicHierarchy.atoms.label_atom_id.value(l.element); }),
    auth_atom_id: p(function (l) { return !Unit.isAtomic(l.unit) ? notAtomic() : l.unit.model.atomicHierarchy.atoms.auth_atom_id.value(l.element); }),
    label_alt_id: p(function (l) { return !Unit.isAtomic(l.unit) ? notAtomic() : l.unit.model.atomicHierarchy.atoms.label_alt_id.value(l.element); }),
    label_comp_id: p(compId),
    auth_comp_id: p(function (l) { return !Unit.isAtomic(l.unit) ? notAtomic() : l.unit.model.atomicHierarchy.atoms.auth_comp_id.value(l.element); }),
    pdbx_formal_charge: p(function (l) { return !Unit.isAtomic(l.unit) ? notAtomic() : l.unit.model.atomicHierarchy.atoms.pdbx_formal_charge.value(l.element); }),
    // Derived
    vdw_radius: p(function (l) { return !Unit.isAtomic(l.unit) ? notAtomic() : VdwRadius(l.unit.model.atomicHierarchy.atoms.type_symbol.value(l.element)); }),
};
function compId(l) {
    if (!Unit.isAtomic(l.unit))
        notAtomic();
    return l.unit.model.atomicHierarchy.atoms.label_comp_id.value(l.element);
}
function seqId(l) {
    return !Unit.isAtomic(l.unit) ? notAtomic() : l.unit.model.atomicHierarchy.residues.label_seq_id.value(l.unit.residueIndex[l.element]);
}
function hasMicroheterogeneity(l) {
    if (!Unit.isAtomic(l.unit))
        notAtomic();
    var entitySeq = l.unit.model.sequence.byEntityKey[eK(l)];
    return entitySeq && entitySeq.sequence.microHet.has(seqId(l));
}
function microheterogeneityCompIds(l) {
    if (!Unit.isAtomic(l.unit))
        notAtomic();
    var entitySeq = l.unit.model.sequence.byEntityKey[eK(l)];
    if (entitySeq) {
        return entitySeq.sequence.microHet.get(seqId(l)) || [compId(l)];
    }
    else {
        return [compId(l)];
    }
}
var residue = {
    key: p(function (l) { return !Unit.isAtomic(l.unit) ? notAtomic() : l.unit.residueIndex[l.element]; }),
    group_PDB: p(function (l) { return !Unit.isAtomic(l.unit) ? notAtomic() : l.unit.model.atomicHierarchy.residues.group_PDB.value(l.unit.residueIndex[l.element]); }),
    label_seq_id: p(seqId),
    auth_seq_id: p(function (l) { return !Unit.isAtomic(l.unit) ? notAtomic() : l.unit.model.atomicHierarchy.residues.auth_seq_id.value(l.unit.residueIndex[l.element]); }),
    pdbx_PDB_ins_code: p(function (l) { return !Unit.isAtomic(l.unit) ? notAtomic() : l.unit.model.atomicHierarchy.residues.pdbx_PDB_ins_code.value(l.unit.residueIndex[l.element]); }),
    // Properties
    isNonStandard: p(function (l) { return !Unit.isAtomic(l.unit) ? notAtomic() : microheterogeneityCompIds(l).some(function (c) { return l.unit.model.properties.chemicalComponentMap.get(c).mon_nstd_flag[0] === 'n'; }); }),
    hasMicroheterogeneity: p(hasMicroheterogeneity),
    microheterogeneityCompIds: p(microheterogeneityCompIds),
    secondary_structure_type: p(function (l) {
        var _a;
        if (!Unit.isAtomic(l.unit))
            notAtomic();
        var secStruc = (_a = SecondaryStructureProvider.get(l.structure).value) === null || _a === void 0 ? void 0 : _a.get(l.unit.invariantId);
        return secStruc ? secStruc.type[secStruc.getIndex(l.unit.residueIndex[l.element])] : 536870912 /* SecondaryStructureType.Flag.NA */;
    }),
    secondary_structure_key: p(function (l) {
        var _a;
        if (!Unit.isAtomic(l.unit))
            notAtomic();
        var secStruc = (_a = SecondaryStructureProvider.get(l.structure).value) === null || _a === void 0 ? void 0 : _a.get(l.unit.invariantId);
        return secStruc ? secStruc.key[secStruc.getIndex(l.unit.residueIndex[l.element])] : -1;
    }),
    chem_comp_type: p(function (l) { return !Unit.isAtomic(l.unit) ? notAtomic() : l.unit.model.properties.chemicalComponentMap.get(compId(l)).type; }),
};
var chain = {
    key: p(function (l) { return !Unit.isAtomic(l.unit) ? notAtomic() : l.unit.chainIndex[l.element]; }),
    label_asym_id: p(function (l) { return !Unit.isAtomic(l.unit) ? notAtomic() : l.unit.model.atomicHierarchy.chains.label_asym_id.value(l.unit.chainIndex[l.element]); }),
    auth_asym_id: p(function (l) { return !Unit.isAtomic(l.unit) ? notAtomic() : l.unit.model.atomicHierarchy.chains.auth_asym_id.value(l.unit.chainIndex[l.element]); }),
    label_entity_id: p(function (l) { return !Unit.isAtomic(l.unit) ? notAtomic() : l.unit.model.atomicHierarchy.chains.label_entity_id.value(l.unit.chainIndex[l.element]); })
};
var coarse = {
    key: atom.key,
    entityKey: p(function (l) { return !Unit.isCoarse(l.unit) ? notCoarse() : l.unit.coarseElements.entityKey[l.element]; }),
    x: atom.x,
    y: atom.y,
    z: atom.z,
    asym_id: p(function (l) { return !Unit.isCoarse(l.unit) ? notCoarse() : l.unit.coarseElements.asym_id.value(l.element); }),
    entity_id: p(function (l) { return !Unit.isCoarse(l.unit) ? notCoarse() : l.unit.coarseElements.entity_id.value(l.element); }),
    seq_id_begin: p(function (l) { return !Unit.isCoarse(l.unit) ? notCoarse() : l.unit.coarseElements.seq_id_begin.value(l.element); }),
    seq_id_end: p(function (l) { return !Unit.isCoarse(l.unit) ? notCoarse() : l.unit.coarseElements.seq_id_end.value(l.element); }),
    sphere_radius: p(function (l) { return !Unit.isSpheres(l.unit) ? notCoarse('spheres') : l.unit.coarseConformation.radius[l.element]; }),
    sphere_rmsf: p(function (l) { return !Unit.isSpheres(l.unit) ? notCoarse('spheres') : l.unit.coarseConformation.rmsf[l.element]; }),
    gaussian_weight: p(function (l) { return !Unit.isGaussians(l.unit) ? notCoarse('gaussians') : l.unit.coarseConformation.weight[l.element]; }),
    gaussian_covariance_matrix: p(function (l) { return !Unit.isGaussians(l.unit) ? notCoarse('gaussians') : l.unit.coarseConformation.covariance_matrix[l.element]; })
};
function eK(l) {
    switch (l.unit.kind) {
        case 0 /* Unit.Kind.Atomic */:
            return l.unit.model.atomicHierarchy.index.getEntityFromChain(l.unit.chainIndex[l.element]);
        case 1 /* Unit.Kind.Spheres */:
            return l.unit.model.coarseHierarchy.spheres.entityKey[l.element];
        case 2 /* Unit.Kind.Gaussians */:
            return l.unit.model.coarseHierarchy.gaussians.entityKey[l.element];
    }
}
var entity = {
    key: p(eK),
    id: p(function (l) { return l.unit.model.entities.data.id.value(eK(l)); }),
    type: p(function (l) { return l.unit.model.entities.data.type.value(eK(l)); }),
    src_method: p(function (l) { return l.unit.model.entities.data.src_method.value(eK(l)); }),
    pdbx_description: p(function (l) { return l.unit.model.entities.data.pdbx_description.value(eK(l)); }),
    formula_weight: p(function (l) { return l.unit.model.entities.data.formula_weight.value(eK(l)); }),
    pdbx_number_of_molecules: p(function (l) { return l.unit.model.entities.data.pdbx_number_of_molecules.value(eK(l)); }),
    details: p(function (l) { return l.unit.model.entities.data.details.value(eK(l)); }),
    pdbx_mutation: p(function (l) { return l.unit.model.entities.data.pdbx_mutation.value(eK(l)); }),
    pdbx_fragment: p(function (l) { return l.unit.model.entities.data.pdbx_fragment.value(eK(l)); }),
    pdbx_ec: p(function (l) { return l.unit.model.entities.data.pdbx_ec.value(eK(l)); }),
    subtype: p(function (l) { return l.unit.model.entities.subtype.value(eK(l)); }),
    prd_id: p(function (l) { var _a, _b; return (_b = (_a = l.unit.model.entities.prd_id) === null || _a === void 0 ? void 0 : _a.value(eK(l))) !== null && _b !== void 0 ? _b : ''; }),
};
var _emptyList = [];
var unit = {
    id: p(function (l) { return l.unit.id; }),
    chainGroupId: p(function (l) { return l.unit.chainGroupId; }),
    multiChain: p(function (l) { return Unit.Traits.is(l.unit.traits, Unit.Trait.MultiChain); }),
    object_primitive: p(function (l) { return l.unit.objectPrimitive; }),
    operator_name: p(function (l) { return l.unit.conformation.operator.name; }),
    operator_key: p(function (l) { return l.unit.conformation.operator.key; }),
    model_index: p(function (l) { return l.unit.model.modelNum; }),
    model_label: p(function (l) { return l.unit.model.label; }),
    model_entry_id: p(function (l) { return l.unit.model.entryId; }),
    hkl: p(function (l) { return l.unit.conformation.operator.hkl; }),
    spgrOp: p(function (l) { return l.unit.conformation.operator.spgrOp; }),
    model_num: p(function (l) { return l.unit.model.modelNum; }),
    pdbx_struct_assembly_id: p(function (l) { var _a; return ((_a = l.unit.conformation.operator.assembly) === null || _a === void 0 ? void 0 : _a.id) || SymmetryOperator.DefaultName; }),
    pdbx_struct_oper_list_ids: p(function (l) { var _a; return ((_a = l.unit.conformation.operator.assembly) === null || _a === void 0 ? void 0 : _a.operList) || _emptyList; }),
    struct_ncs_oper_id: p(function (l) { return l.unit.conformation.operator.ncsId; }),
};
var StructureProperties = {
    constant: constant,
    atom: atom,
    residue: residue,
    chain: chain,
    entity: entity,
    unit: unit,
    coarse: coarse
};
export { StructureProperties };
