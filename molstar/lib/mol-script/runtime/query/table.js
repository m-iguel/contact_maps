/**
 * Copyright (c) 2018-2022 Mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { MolScriptSymbolTable as MolScript } from '../../language/symbol-table';
import { DefaultQueryRuntimeTable, QuerySymbolRuntime, QueryRuntimeArguments } from './base';
import { Queries, StructureProperties, StructureElement, UnitRing } from '../../../mol-model/structure';
import { ElementSymbol, BondType } from '../../../mol-model/structure/model/types';
import { SetUtils } from '../../../mol-util/set';
import { upperCaseAny } from '../../../mol-util/string';
import { VdwRadius, AtomWeight, AtomNumber } from '../../../mol-model/structure/model/properties/atomic';
import { cantorPairing, invertCantorPairing, sortedCantorPairing } from '../../../mol-data/util';
import { bundleElementImpl, bundleGenerator } from '../../../mol-model/structure/query/queries/internal';
import { arrayEqual } from '../../../mol-util/array';
var C = QuerySymbolRuntime.Const;
var D = QuerySymbolRuntime.Dynamic;
var symbols = [
    // ============= TYPES =============
    C(MolScript.core.type.bool, function core_type_bool(ctx, v) { return !!v[0](ctx); }),
    C(MolScript.core.type.num, function core_type_num(ctx, v) { return +v[0](ctx); }),
    C(MolScript.core.type.str, function core_type_str(ctx, v) { return '' + v[0](ctx); }),
    C(MolScript.core.type.list, function core_type_list(ctx, xs) { return QueryRuntimeArguments.forEachEval(xs, ctx, function (v, i, list) { return list[i] = v; }, []); }),
    C(MolScript.core.type.set, function core_type_set(ctx, xs) { return QueryRuntimeArguments.forEachEval(xs, ctx, function core_type_set_argEval(v, i, set) { return set.add(v); }, new Set()); }),
    C(MolScript.core.type.regex, function core_type_regex(ctx, v) { return new RegExp(v[0](ctx), (v[1] && v[1](ctx)) || ''); }),
    C(MolScript.core.type.bitflags, function core_type_bitflags(ctx, v) { return +v[0](ctx); }),
    C(MolScript.core.type.compositeKey, function core_type_compositeKey(ctx, xs) { return QueryRuntimeArguments.forEachEval(xs, ctx, function (v, i, list) { return list[i] = '' + v; }, []).join('-'); }),
    // ============= LOGIC ================
    C(MolScript.core.logic.not, function (ctx, v) { return !v[0](ctx); }),
    C(MolScript.core.logic.and, function (ctx, xs) {
        if (typeof xs.length === 'number') {
            for (var i = 0, _i = xs.length; i < _i; i++)
                if (!xs[i](ctx))
                    return false;
        }
        else {
            for (var _a = 0, _b = Object.keys(xs); _a < _b.length; _a++) {
                var k = _b[_a];
                if (!xs[k](ctx))
                    return false;
            }
        }
        return true;
    }),
    C(MolScript.core.logic.or, function (ctx, xs) {
        if (typeof xs.length === 'number') {
            for (var i = 0, _i = xs.length; i < _i; i++)
                if (xs[i](ctx))
                    return true;
        }
        else {
            for (var _a = 0, _b = Object.keys(xs); _a < _b.length; _a++) {
                var k = _b[_a];
                if (xs[k](ctx))
                    return true;
            }
        }
        return false;
    }),
    // ============= RELATIONAL ================
    C(MolScript.core.rel.eq, function (ctx, v) { return v[0](ctx) === v[1](ctx); }),
    C(MolScript.core.rel.neq, function (ctx, v) { return v[0](ctx) !== v[1](ctx); }),
    C(MolScript.core.rel.lt, function (ctx, v) { return v[0](ctx) < v[1](ctx); }),
    C(MolScript.core.rel.lte, function (ctx, v) { return v[0](ctx) <= v[1](ctx); }),
    C(MolScript.core.rel.gr, function (ctx, v) { return v[0](ctx) > v[1](ctx); }),
    C(MolScript.core.rel.gre, function (ctx, v) { return v[0](ctx) >= v[1](ctx); }),
    C(MolScript.core.rel.inRange, function (ctx, v) {
        var x = v[0](ctx);
        return x >= v[1](ctx) && x <= v[2](ctx);
    }),
    // ============= ARITHMETIC ================
    C(MolScript.core.math.add, function (ctx, xs) {
        var ret = 0;
        if (typeof xs.length === 'number') {
            for (var i = 0, _i = xs.length; i < _i; i++)
                ret += xs[i](ctx);
        }
        else {
            for (var _a = 0, _b = Object.keys(xs); _a < _b.length; _a++) {
                var k = _b[_a];
                ret += xs[k](ctx);
            }
        }
        return ret;
    }),
    C(MolScript.core.math.sub, function (ctx, xs) {
        var ret = 0;
        if (typeof xs.length === 'number') {
            if (xs.length === 1)
                return -xs[0](ctx);
            ret = xs[0](ctx) || 0;
            for (var i = 1, _i = xs.length; i < _i; i++)
                ret -= xs[i](ctx);
        }
        else {
            var keys = Object.keys(xs);
            if (keys.length === 1)
                return -xs[keys[0]](ctx);
            ret = xs[keys[0]](ctx) || 0;
            for (var i = 1, _i = keys.length; i < _i; i++)
                ret -= xs[keys[i]](ctx);
        }
        return ret;
    }),
    C(MolScript.core.math.mult, function (ctx, xs) {
        var ret = 1;
        if (typeof xs.length === 'number') {
            for (var i = 0, _i = xs.length; i < _i; i++)
                ret *= xs[i](ctx);
        }
        else {
            for (var _a = 0, _b = Object.keys(xs); _a < _b.length; _a++) {
                var k = _b[_a];
                ret *= xs[k](ctx);
            }
        }
        return ret;
    }),
    C(MolScript.core.math.div, function (ctx, v) { return v[0](ctx) / v[1](ctx); }),
    C(MolScript.core.math.pow, function (ctx, v) { return Math.pow(v[0](ctx), v[1](ctx)); }),
    C(MolScript.core.math.mod, function (ctx, v) { return v[0](ctx) % v[1](ctx); }),
    C(MolScript.core.math.min, function (ctx, xs) {
        var ret = Number.POSITIVE_INFINITY;
        if (typeof xs.length === 'number') {
            for (var i = 0, _i = xs.length; i < _i; i++)
                ret = Math.min(xs[i](ctx), ret);
        }
        else {
            for (var _a = 0, _b = Object.keys(xs); _a < _b.length; _a++) {
                var k = _b[_a];
                ret = Math.min(xs[k](ctx), ret);
            }
        }
        return ret;
    }),
    C(MolScript.core.math.max, function (ctx, xs) {
        var ret = Number.NEGATIVE_INFINITY;
        if (typeof xs.length === 'number') {
            for (var i = 0, _i = xs.length; i < _i; i++)
                ret = Math.max(xs[i](ctx), ret);
        }
        else {
            for (var _a = 0, _b = Object.keys(xs); _a < _b.length; _a++) {
                var k = _b[_a];
                ret = Math.max(xs[k](ctx), ret);
            }
        }
        return ret;
    }),
    C(MolScript.core.math.cantorPairing, function (ctx, v) { return cantorPairing(v[0](ctx), v[1](ctx)); }),
    C(MolScript.core.math.sortedCantorPairing, function (ctx, v) { return sortedCantorPairing(v[0](ctx), v[1](ctx)); }),
    C(MolScript.core.math.invertCantorPairing, function (ctx, v) { return invertCantorPairing([0, 0], v[0](ctx)); }),
    C(MolScript.core.math.floor, function (ctx, v) { return Math.floor(v[0](ctx)); }),
    C(MolScript.core.math.ceil, function (ctx, v) { return Math.ceil(v[0](ctx)); }),
    C(MolScript.core.math.roundInt, function (ctx, v) { return Math.round(v[0](ctx)); }),
    C(MolScript.core.math.trunc, function (ctx, v) { return Math.trunc(v[0](ctx)); }),
    C(MolScript.core.math.abs, function (ctx, v) { return Math.abs(v[0](ctx)); }),
    C(MolScript.core.math.sign, function (ctx, v) { return Math.sign(v[0](ctx)); }),
    C(MolScript.core.math.sqrt, function (ctx, v) { return Math.sqrt(v[0](ctx)); }),
    C(MolScript.core.math.cbrt, function (ctx, v) { return Math.cbrt(v[0](ctx)); }),
    C(MolScript.core.math.sin, function (ctx, v) { return Math.sin(v[0](ctx)); }),
    C(MolScript.core.math.cos, function (ctx, v) { return Math.cos(v[0](ctx)); }),
    C(MolScript.core.math.tan, function (ctx, v) { return Math.tan(v[0](ctx)); }),
    C(MolScript.core.math.asin, function (ctx, v) { return Math.asin(v[0](ctx)); }),
    C(MolScript.core.math.acos, function (ctx, v) { return Math.acos(v[0](ctx)); }),
    C(MolScript.core.math.atan, function (ctx, v) { return Math.atan(v[0](ctx)); }),
    C(MolScript.core.math.sinh, function (ctx, v) { return Math.sinh(v[0](ctx)); }),
    C(MolScript.core.math.cosh, function (ctx, v) { return Math.cosh(v[0](ctx)); }),
    C(MolScript.core.math.tanh, function (ctx, v) { return Math.tanh(v[0](ctx)); }),
    C(MolScript.core.math.exp, function (ctx, v) { return Math.exp(v[0](ctx)); }),
    C(MolScript.core.math.log, function (ctx, v) { return Math.log(v[0](ctx)); }),
    C(MolScript.core.math.log10, function (ctx, v) { return Math.log10(v[0](ctx)); }),
    C(MolScript.core.math.atan2, function (ctx, v) { return Math.atan2(v[0](ctx), v[1](ctx)); }),
    // ============= STRING ================
    C(MolScript.core.str.match, function (ctx, v) { return v[0](ctx).test(v[1](ctx)); }),
    C(MolScript.core.str.concat, function (ctx, xs) {
        var ret = [];
        if (typeof xs.length === 'number') {
            for (var i = 0, _i = xs.length; i < _i; i++)
                ret.push(xs[i](ctx).toString());
        }
        else {
            for (var _a = 0, _b = Object.keys(xs); _a < _b.length; _a++) {
                var k = _b[_a];
                ret.push(xs[k](ctx).toString());
            }
        }
        return ret.join('');
    }),
    // ============= LIST ================
    C(MolScript.core.list.getAt, function (ctx, v) { return v[0](ctx)[v[1](ctx)]; }),
    C(MolScript.core.list.equal, function (ctx, v) { return arrayEqual(v[0](ctx), v[1](ctx)); }),
    // ============= SET ================
    C(MolScript.core.set.has, function core_set_has(ctx, v) { return v[0](ctx).has(v[1](ctx)); }),
    C(MolScript.core.set.isSubset, function core_set_isSubset(ctx, v) { return SetUtils.isSuperset(v[1](ctx), v[0](ctx)); }),
    // ============= FLAGS ================
    C(MolScript.core.flags.hasAny, function (ctx, v) {
        var test = v[1](ctx);
        var tested = v[0](ctx);
        if (!test)
            return !!tested;
        return (tested & test) !== 0;
    }),
    C(MolScript.core.flags.hasAll, function (ctx, v) {
        var test = v[1](ctx);
        var tested = v[0](ctx);
        if (!test)
            return !tested;
        return (tested & test) === test;
    }),
    // Structure
    // ============= TYPES ================
    C(MolScript.structureQuery.type.elementSymbol, function (ctx, v) { return ElementSymbol(v[0](ctx)); }),
    C(MolScript.structureQuery.type.atomName, function (ctx, v) { return upperCaseAny(v[0](ctx)); }),
    C(MolScript.structureQuery.type.bondFlags, function (ctx, xs) {
        var ret = 0 /* BondType.Flag.None */;
        if (typeof xs.length === 'number') {
            for (var i = 0, _i = xs.length; i < _i; i++)
                ret = bondFlag(ret, xs[i](ctx));
        }
        else {
            for (var _a = 0, _b = Object.keys(xs); _a < _b.length; _a++) {
                var k = _b[_a];
                ret = bondFlag(ret, xs[k](ctx));
            }
        }
        return ret;
    }),
    C(MolScript.structureQuery.type.ringFingerprint, function (ctx, xs) { return UnitRing.elementFingerprint(getArray(ctx, xs)); }),
    C(MolScript.structureQuery.type.secondaryStructureFlags, function (ctx, xs) {
        var ret = 0 /* SecondaryStructureType.Flag.None */;
        if (typeof xs.length === 'number') {
            for (var i = 0, _i = xs.length; i < _i; i++)
                ret = secondaryStructureFlag(ret, xs[i](ctx));
        }
        else {
            for (var _a = 0, _b = Object.keys(xs); _a < _b.length; _a++) {
                var k = _b[_a];
                ret = secondaryStructureFlag(ret, xs[k](ctx));
            }
        }
        return ret;
    }),
    // TODO:
    // C(MolScript.structureQuery.type.entityType, (ctx, v) => StructureRuntime.Common.entityType(v[0](ctx))),
    // C(MolScript.structureQuery.type.authResidueId, (ctx, v) => ResidueIdentifier.auth(v[0](ctx), v[1](ctx), v[2] && v[2](ctx))),
    // C(MolScript.structureQuery.type.labelResidueId, (ctx, v) => ResidueIdentifier.label(v[0](ctx), v[1](ctx), v[2](ctx), v[3] && v[3](ctx))),
    // ============= SLOTS ================
    // TODO: slots might not be needed after all: reducer simply pushes/pops current element
    // C(MolScript.structureQuery.slot.element, (ctx, _) => ctx_.element),
    // C(MolScript.structureQuery.slot.elementSetReduce, (ctx, _) => ctx_.element),
    // ============= FILTERS ================
    D(MolScript.structureQuery.filter.pick, function (ctx, xs) { return Queries.filters.pick(xs[0], xs['test'])(ctx); }),
    D(MolScript.structureQuery.filter.first, function (ctx, xs) { return Queries.filters.first(xs[0])(ctx); }),
    D(MolScript.structureQuery.filter.withSameAtomProperties, function (ctx, xs) { return Queries.filters.withSameAtomProperties(xs[0], xs['source'], xs['property'])(ctx); }),
    D(MolScript.structureQuery.filter.intersectedBy, function (ctx, xs) { return Queries.filters.areIntersectedBy(xs[0], xs['by'])(ctx); }),
    D(MolScript.structureQuery.filter.within, function (ctx, xs) {
        var _a, _b, _c;
        return Queries.filters.within({
            query: xs[0],
            target: xs['target'],
            minRadius: (_a = xs['min-radius']) === null || _a === void 0 ? void 0 : _a.call(xs, ctx),
            maxRadius: (_b = xs['max-radius']) === null || _b === void 0 ? void 0 : _b.call(xs, ctx),
            elementRadius: xs['atom-radius'],
            invert: (_c = xs['invert']) === null || _c === void 0 ? void 0 : _c.call(xs, ctx)
        })(ctx);
    }),
    D(MolScript.structureQuery.filter.isConnectedTo, function (ctx, xs) {
        var _a, _b;
        return Queries.filters.isConnectedTo({
            query: xs[0],
            target: xs['target'],
            disjunct: (_a = xs['disjunct']) === null || _a === void 0 ? void 0 : _a.call(xs, ctx),
            invert: (_b = xs['invert']) === null || _b === void 0 ? void 0 : _b.call(xs, ctx),
            bondTest: xs['bond-test']
        })(ctx);
    }),
    // ============= GENERATORS ================
    D(MolScript.structureQuery.generator.atomGroups, function structureQuery_generator_atomGroups(ctx, xs) {
        return Queries.generators.atoms({
            entityTest: xs['entity-test'],
            chainTest: xs['chain-test'],
            residueTest: xs['residue-test'],
            atomTest: xs['atom-test'],
            groupBy: xs['group-by']
        })(ctx);
    }),
    D(MolScript.structureQuery.generator.all, function structureQuery_generator_all(ctx) { return Queries.generators.all(ctx); }),
    D(MolScript.structureQuery.generator.empty, function structureQuery_generator_empty(ctx) { return Queries.generators.none(ctx); }),
    D(MolScript.structureQuery.generator.bondedAtomicPairs, function structureQuery_generator_bondedAtomicPairs(ctx, xs) {
        return Queries.generators.bondedAtomicPairs(xs && xs[0])(ctx);
    }),
    D(MolScript.structureQuery.generator.rings, function structureQuery_generator_rings(ctx, xs) {
        var _a, _b;
        return Queries.generators.rings((_a = xs === null || xs === void 0 ? void 0 : xs['fingerprint']) === null || _a === void 0 ? void 0 : _a.call(xs, ctx), (_b = xs === null || xs === void 0 ? void 0 : xs['only-aromatic']) === null || _b === void 0 ? void 0 : _b.call(xs, ctx))(ctx);
    }),
    D(MolScript.structureQuery.generator.queryInSelection, function structureQuery_generator_queryInSelection(ctx, xs) {
        var _a;
        return Queries.generators.querySelection(xs[0], xs['query'], (_a = xs['in-complement']) === null || _a === void 0 ? void 0 : _a.call(xs, ctx))(ctx);
    }),
    // ============= MODIFIERS ================
    D(MolScript.structureQuery.modifier.includeSurroundings, function structureQuery_modifier_includeSurroundings(ctx, xs) {
        return Queries.modifiers.includeSurroundings(xs[0], {
            radius: xs['radius'](ctx),
            wholeResidues: !!(xs['as-whole-residues'] && xs['as-whole-residues'](ctx)),
            elementRadius: xs['atom-radius']
        })(ctx);
    }),
    D(MolScript.structureQuery.modifier.surroundingLigands, function structureQuery_modifier_includeSurroundingLigands(ctx, xs) {
        return Queries.modifiers.surroundingLigands({
            query: xs[0],
            radius: xs['radius'](ctx),
            includeWater: !!(xs['include-water'] && xs['include-water'](ctx)),
        })(ctx);
    }),
    D(MolScript.structureQuery.modifier.wholeResidues, function structureQuery_modifier_wholeResidues(ctx, xs) { return Queries.modifiers.wholeResidues(xs[0])(ctx); }),
    D(MolScript.structureQuery.modifier.union, function structureQuery_modifier_union(ctx, xs) { return Queries.modifiers.union(xs[0])(ctx); }),
    D(MolScript.structureQuery.modifier.expandProperty, function structureQuery_modifier_expandProperty(ctx, xs) { return Queries.modifiers.expandProperty(xs[0], xs['property'])(ctx); }),
    D(MolScript.structureQuery.modifier.exceptBy, function structureQuery_modifier_exceptBy(ctx, xs) { return Queries.modifiers.exceptBy(xs[0], xs['by'])(ctx); }),
    D(MolScript.structureQuery.modifier.includeConnected, function structureQuery_modifier_includeConnected(ctx, xs) {
        var _a, _b;
        return Queries.modifiers.includeConnected({
            query: xs[0],
            bondTest: xs['bond-test'],
            wholeResidues: !!(xs['as-whole-residues'] && xs['as-whole-residues'](ctx)),
            layerCount: (xs['layer-count'] && xs['layer-count'](ctx)) || 1,
            fixedPoint: (_b = (_a = xs['fixed-point']) === null || _a === void 0 ? void 0 : _a.call(xs, ctx)) !== null && _b !== void 0 ? _b : false
        })(ctx);
    }),
    D(MolScript.structureQuery.modifier.intersectBy, function structureQuery_modifier_intersectBy(ctx, xs) { return Queries.modifiers.intersectBy(xs[0], xs['by'])(ctx); }),
    // ============= COMBINATORS ================
    D(MolScript.structureQuery.combinator.merge, function (ctx, xs) { return Queries.combinators.merge(xs)(ctx); }),
    // ============= ATOM PROPERTIES ================
    // ~~~ CORE ~~~
    D(MolScript.structureQuery.atomProperty.core.elementSymbol, atomProp(StructureProperties.atom.type_symbol)),
    D(MolScript.structureQuery.atomProperty.core.vdw, function (ctx, xs) { return VdwRadius(StructureProperties.atom.type_symbol((xs && xs[0] && xs[0](ctx)) || ctx.element)); }),
    D(MolScript.structureQuery.atomProperty.core.mass, function (ctx, xs) { return AtomWeight(StructureProperties.atom.type_symbol((xs && xs[0] && xs[0](ctx)) || ctx.element)); }),
    D(MolScript.structureQuery.atomProperty.core.atomicNumber, function (ctx, xs) { return AtomNumber(StructureProperties.atom.type_symbol((xs && xs[0] && xs[0](ctx)) || ctx.element)); }),
    D(MolScript.structureQuery.atomProperty.core.x, atomProp(StructureProperties.atom.x)),
    D(MolScript.structureQuery.atomProperty.core.y, atomProp(StructureProperties.atom.y)),
    D(MolScript.structureQuery.atomProperty.core.z, atomProp(StructureProperties.atom.z)),
    D(MolScript.structureQuery.atomProperty.core.sourceIndex, atomProp(StructureProperties.atom.sourceIndex)),
    D(MolScript.structureQuery.atomProperty.core.operatorName, atomProp(StructureProperties.unit.operator_name)),
    D(MolScript.structureQuery.atomProperty.core.operatorKey, atomProp(StructureProperties.unit.operator_key)),
    D(MolScript.structureQuery.atomProperty.core.modelIndex, atomProp(StructureProperties.unit.model_index)),
    D(MolScript.structureQuery.atomProperty.core.modelLabel, atomProp(StructureProperties.unit.model_label)),
    D(MolScript.structureQuery.atomProperty.core.atomKey, function (ctx, xs) {
        var e = (xs && xs[0] && xs[0](ctx)) || ctx.element;
        return cantorPairing(e.unit.id, e.element);
    }),
    // TODO:
    // D(MolScript.structureQuery.atomProperty.core.bondCount, (ctx, _) => ),
    // ~~~ TOPOLOGY ~~~
    // TODO
    // ~~~ MACROMOLECULAR ~~~
    // TODO:
    // // identifiers
    // labelResidueId: prop((env, v) => ResidueIdentifier.labelOfResidueIndex(env.context.model, getAddress(env, v).residue)),
    // authResidueId: prop((env, v) => ResidueIdentifier.authOfResidueIndex(env.context.model, getAddress(env, v).residue)),
    // keys
    D(MolScript.structureQuery.atomProperty.macromolecular.residueKey, function (ctx, xs) { return StructureElement.residueIndex((xs && xs[0] && xs[0](ctx)) || ctx.element); }),
    D(MolScript.structureQuery.atomProperty.macromolecular.chainKey, function (ctx, xs) { return StructureElement.chainIndex((xs && xs[0] && xs[0](ctx)) || ctx.element); }),
    D(MolScript.structureQuery.atomProperty.macromolecular.entityKey, function (ctx, xs) { return StructureElement.entityIndex((xs && xs[0] && xs[0](ctx)) || ctx.element); }),
    // mmCIF
    D(MolScript.structureQuery.atomProperty.macromolecular.id, atomProp(StructureProperties.atom.id)),
    D(MolScript.structureQuery.atomProperty.macromolecular.isHet, function (ctx, xs) { return StructureProperties.residue.group_PDB((xs && xs[0] && xs[0](ctx)) || ctx.element) !== 'ATOM'; }),
    D(MolScript.structureQuery.atomProperty.macromolecular.label_atom_id, atomProp(StructureProperties.atom.label_atom_id)),
    D(MolScript.structureQuery.atomProperty.macromolecular.label_alt_id, atomProp(StructureProperties.atom.label_alt_id)),
    D(MolScript.structureQuery.atomProperty.macromolecular.label_comp_id, atomProp(StructureProperties.atom.label_comp_id)),
    D(MolScript.structureQuery.atomProperty.macromolecular.label_seq_id, atomProp(StructureProperties.residue.label_seq_id)),
    D(MolScript.structureQuery.atomProperty.macromolecular.label_asym_id, atomProp(StructureProperties.chain.label_asym_id)),
    D(MolScript.structureQuery.atomProperty.macromolecular.label_entity_id, atomProp(StructureProperties.entity.id)),
    D(MolScript.structureQuery.atomProperty.macromolecular.auth_atom_id, atomProp(StructureProperties.atom.auth_atom_id)),
    D(MolScript.structureQuery.atomProperty.macromolecular.auth_comp_id, atomProp(StructureProperties.atom.auth_comp_id)),
    D(MolScript.structureQuery.atomProperty.macromolecular.auth_seq_id, atomProp(StructureProperties.residue.auth_seq_id)),
    D(MolScript.structureQuery.atomProperty.macromolecular.auth_asym_id, atomProp(StructureProperties.chain.auth_asym_id)),
    D(MolScript.structureQuery.atomProperty.macromolecular.pdbx_PDB_ins_code, atomProp(StructureProperties.residue.pdbx_PDB_ins_code)),
    D(MolScript.structureQuery.atomProperty.macromolecular.pdbx_formal_charge, atomProp(StructureProperties.atom.pdbx_formal_charge)),
    D(MolScript.structureQuery.atomProperty.macromolecular.occupancy, atomProp(StructureProperties.atom.occupancy)),
    D(MolScript.structureQuery.atomProperty.macromolecular.B_iso_or_equiv, atomProp(StructureProperties.atom.B_iso_or_equiv)),
    D(MolScript.structureQuery.atomProperty.macromolecular.entityType, atomProp(StructureProperties.entity.type)),
    D(MolScript.structureQuery.atomProperty.macromolecular.entitySubtype, atomProp(StructureProperties.entity.subtype)),
    D(MolScript.structureQuery.atomProperty.macromolecular.entityPrdId, atomProp(StructureProperties.entity.prd_id)),
    D(MolScript.structureQuery.atomProperty.macromolecular.entityDescription, atomProp(StructureProperties.entity.pdbx_description)),
    D(MolScript.structureQuery.atomProperty.macromolecular.objectPrimitive, atomProp(StructureProperties.unit.object_primitive)),
    D(MolScript.structureQuery.atomProperty.macromolecular.isNonStandard, atomProp(StructureProperties.residue.isNonStandard)),
    D(MolScript.structureQuery.atomProperty.macromolecular.secondaryStructureKey, atomProp(StructureProperties.residue.secondary_structure_key)),
    D(MolScript.structureQuery.atomProperty.macromolecular.secondaryStructureFlags, atomProp(StructureProperties.residue.secondary_structure_type)),
    D(MolScript.structureQuery.atomProperty.macromolecular.chemCompType, atomProp(StructureProperties.residue.chem_comp_type)),
    // ============= ATOM SET ================
    D(MolScript.structureQuery.atomSet.atomCount, function structureQuery_atomset_atomCount(ctx, xs) {
        return Queries.atomset.atomCount(ctx);
    }),
    D(MolScript.structureQuery.atomSet.countQuery, function structureQuery_atomset_countQuery(ctx, xs) {
        return Queries.atomset.countQuery(xs[0])(ctx);
    }),
    D(MolScript.structureQuery.atomSet.propertySet, function structureQuery_atomset_propertySet(ctx, xs) {
        return Queries.atomset.propertySet(xs[0])(ctx);
    }),
    // ============= BOND PROPERTIES ================
    D(MolScript.structureQuery.bondProperty.order, function (ctx, xs) { return ctx.atomicBond.order; }),
    D(MolScript.structureQuery.bondProperty.flags, function (ctx, xs) { return ctx.atomicBond.type; }),
    D(MolScript.structureQuery.bondProperty.key, function (ctx, xs) { return ctx.atomicBond.key; }),
    D(MolScript.structureQuery.bondProperty.atomA, function (ctx, xs) { return ctx.atomicBond.a; }),
    D(MolScript.structureQuery.bondProperty.atomB, function (ctx, xs) { return ctx.atomicBond.b; }),
    D(MolScript.structureQuery.bondProperty.length, function (ctx, xs) { return ctx.atomicBond.length; }),
    // Internal
    D(MolScript.internal.generator.bundleElement, function internal_generator_bundleElement(ctx, xs) { return bundleElementImpl(xs.groupedUnits(ctx), xs.ranges(ctx), xs.set(ctx)); }),
    D(MolScript.internal.generator.bundle, function internal_generator_bundle(ctx, xs) { return bundleGenerator(xs.elements(ctx))(ctx); }),
    D(MolScript.internal.generator.current, function internal_generator_current(ctx, xs) { return ctx.tryGetCurrentSelection(); }),
];
function atomProp(p) {
    return function (ctx, xs) { return p((xs && xs[0] && xs[0](ctx)) || ctx.element); };
}
function bondFlag(current, f) {
    return current | (BondType.isName(f) ? BondType.fromName(f) : 0 /* BondType.Flag.None */);
}
function secondaryStructureFlag(current, f) {
    switch (f.toLowerCase()) {
        case 'helix': return current | 2 /* SecondaryStructureType.Flag.Helix */;
        case 'alpha': return current | 2 /* SecondaryStructureType.Flag.Helix */ | 4096 /* SecondaryStructureType.Flag.HelixAlpha */;
        case 'pi': return current | 2 /* SecondaryStructureType.Flag.Helix */ | 32768 /* SecondaryStructureType.Flag.HelixPi */;
        case '310': return current | 2 /* SecondaryStructureType.Flag.Helix */ | 2048 /* SecondaryStructureType.Flag.Helix3Ten */;
        case 'beta': return current | 4 /* SecondaryStructureType.Flag.Beta */;
        case 'strand': return current | 4 /* SecondaryStructureType.Flag.Beta */ | 4194304 /* SecondaryStructureType.Flag.BetaStrand */;
        case 'sheet': return current | 4 /* SecondaryStructureType.Flag.Beta */ | 8388608 /* SecondaryStructureType.Flag.BetaSheet */;
        case 'turn': return current | 16 /* SecondaryStructureType.Flag.Turn */;
        case 'bend': return current | 8 /* SecondaryStructureType.Flag.Bend */;
        case 'coil': return current | 536870912 /* SecondaryStructureType.Flag.NA */;
        default: return current;
    }
}
function getArray(ctx, xs) {
    var ret = [];
    if (!xs)
        return ret;
    if (typeof xs.length === 'number') {
        for (var i = 0, _i = xs.length; i < _i; i++)
            ret.push(xs[i](ctx));
    }
    else {
        var keys = Object.keys(xs);
        for (var i = 1, _i = keys.length; i < _i; i++)
            ret.push(xs[keys[i]](ctx));
    }
    return ret;
}
(function () {
    for (var _a = 0, symbols_1 = symbols; _a < symbols_1.length; _a++) {
        var s = symbols_1[_a];
        DefaultQueryRuntimeTable.addSymbol(s);
    }
})();
