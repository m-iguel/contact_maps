/**
 * Copyright (c) 2017-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { __assign, __awaiter, __generator } from "tslib";
import { IntMap, SortedArray, Segmentation, Interval, OrderedSet } from '../../../mol-data/int';
import { UniqueArray } from '../../../mol-data/generic';
import { SymmetryOperator } from '../../../mol-math/geometry/symmetry-operator';
import { Model } from '../model';
import { sort, arraySwap, hash1, sortArray, hashString, hashFnv32a } from '../../../mol-data/util';
import { StructureElement } from './element';
import { Unit } from './unit';
import { StructureLookup3D } from './util/lookup3d';
import { StructureSubsetBuilder } from './util/subset-builder';
import { InterUnitBonds, computeInterUnitBonds, Bond } from './unit/bonds';
import { StructureSymmetry } from './symmetry';
import { StructureProperties } from './properties';
import { computeCarbohydrates } from './carbohydrates/compute';
import { Vec3, Mat4 } from '../../../mol-math/linear-algebra';
import { idFactory } from '../../../mol-util/id-factory';
import { GridLookup3D } from '../../../mol-math/geometry';
import { CustomProperties } from '../../custom-property';
import { AtomicHierarchy } from '../model/properties/atomic';
import { StructureSelection } from '../query/selection';
import { getBoundary } from '../../../mol-math/geometry/boundary';
import { CustomStructureProperty } from '../../../mol-model-props/common/custom-structure-property';
import { Task } from '../../../mol-task';
import { computeStructureBoundary } from './util/boundary';
var Structure = /** @class */ (function () {
    /**
     * @param units Array of all units in the structure, sorted by unit.id
     * @param unitMap Maps unit.id to index of unit in units array
     * @param unitIndexMap Array of all units in the structure, sorted by unit.id
     */
    function Structure(units, unitMap, unitIndexMap, state, asParent) {
        this.units = units;
        this.unitMap = unitMap;
        this.unitIndexMap = unitIndexMap;
        this.state = state;
        // always assign to ensure object shape
        this._child = asParent === null || asParent === void 0 ? void 0 : asParent.child;
        this._target = asParent === null || asParent === void 0 ? void 0 : asParent.target;
        this._proxy = undefined;
    }
    Structure.prototype.subsetBuilder = function (isSorted) {
        return new StructureSubsetBuilder(this, isSorted);
    };
    Object.defineProperty(Structure.prototype, "elementCount", {
        /** Count of all elements in the structure, i.e. the sum of the elements in the units */
        get: function () {
            return this.state.elementCount;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Structure.prototype, "bondCount", {
        /** Count of all bonds (intra- and inter-unit) in the structure */
        get: function () {
            if (this.state.bondCount === -1) {
                this.state.bondCount = this.interUnitBonds.edgeCount + Bond.getIntraUnitBondCount(this);
            }
            return this.state.bondCount;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Structure.prototype, "hasCustomProperties", {
        get: function () {
            return !!this.state.customProps && this.state.customProps.all.length > 0;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Structure.prototype, "customPropertyDescriptors", {
        get: function () {
            if (!this.state.customProps)
                this.state.customProps = new CustomProperties();
            return this.state.customProps;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Structure.prototype, "currentPropertyData", {
        /**
         * Property data unique to this instance of the structure.
         */
        get: function () {
            if (!this.state.propertyData)
                this.state.propertyData = Object.create(null);
            return this.state.propertyData;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Structure.prototype, "inheritedPropertyData", {
        /**
         * Property data of the parent structure if it exists, currentPropertyData otherwise.
         */
        get: function () {
            return this.parent ? this.parent.currentPropertyData : this.currentPropertyData;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Structure.prototype, "polymerResidueCount", {
        /** Count of all polymer residues in the structure */
        get: function () {
            if (this.state.polymerResidueCount === -1) {
                this.state.polymerResidueCount = getPolymerResidueCount(this);
            }
            return this.state.polymerResidueCount;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Structure.prototype, "polymerGapCount", {
        /** Count of all polymer gaps in the structure */
        get: function () {
            if (this.state.polymerGapCount === -1) {
                this.state.polymerGapCount = getPolymerGapCount(this);
            }
            return this.state.polymerGapCount;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Structure.prototype, "polymerUnitCount", {
        get: function () {
            if (this.state.polymerUnitCount === -1) {
                this.state.polymerUnitCount = getPolymerUnitCount(this);
            }
            return this.state.polymerUnitCount;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Structure.prototype, "uniqueElementCount", {
        get: function () {
            if (this.state.uniqueElementCount === -1) {
                this.state.uniqueElementCount = getUniqueElementCount(this);
            }
            return this.state.uniqueElementCount;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Structure.prototype, "atomicResidueCount", {
        get: function () {
            if (this.state.atomicResidueCount === -1) {
                this.state.atomicResidueCount = getAtomicResidueCount(this);
            }
            return this.state.atomicResidueCount;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Structure.prototype, "isCoarseGrained", {
        /**
         * True if any model the structure is based on is coarse grained.
         * @see Model.isCoarseGrained
         */
        get: function () {
            return this.models.some(function (m) { return Model.isCoarseGrained(m); });
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Structure.prototype, "isEmpty", {
        get: function () {
            return this.units.length === 0;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Structure.prototype, "hashCode", {
        get: function () {
            if (this.state.hashCode !== -1)
                return this.state.hashCode;
            return this.computeHash();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Structure.prototype, "transformHash", {
        /** Hash based on all unit.id values in the structure, reflecting the units transformation */
        get: function () {
            if (this.state.transformHash !== -1)
                return this.state.transformHash;
            this.state.transformHash = hashFnv32a(this.units.map(function (u) { return u.id; }));
            return this.state.transformHash;
        },
        enumerable: false,
        configurable: true
    });
    Structure.prototype.computeHash = function () {
        var hash = 23;
        for (var i = 0, _i = this.units.length; i < _i; i++) {
            var u = this.units[i];
            hash = (31 * hash + u.id) | 0;
            hash = (31 * hash + SortedArray.hashCode(u.elements)) | 0;
        }
        hash = (31 * hash + this.elementCount) | 0;
        hash = hash1(hash);
        if (hash === -1)
            hash = 0;
        this.state.hashCode = hash;
        return hash;
    };
    /** Returns a new element location iterator */
    Structure.prototype.elementLocations = function () {
        return new Structure.ElementLocationIterator(this);
    };
    Object.defineProperty(Structure.prototype, "root", {
        /** The parent or itself in case this is the root */
        get: function () {
            var _a;
            return (_a = this.state.parent) !== null && _a !== void 0 ? _a : this;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Structure.prototype, "parent", {
        /** The root/top-most parent or `undefined` in case this is the root */
        get: function () {
            return this.state.parent;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Structure.prototype, "coordinateSystem", {
        /**
         * Conformation transformation that was applied to every unit of this structure.
         *
         * Coordinate system applies to the *current* structure only.
         * A parent structure can have a different coordinate system and thefore it has to be composed "manualy"
         * by the consumer.
         */
        get: function () {
            return this.state.coordinateSystem;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Structure.prototype, "label", {
        get: function () {
            return this.state.label;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Structure.prototype, "boundary", {
        get: function () {
            if (this.state.boundary)
                return this.state.boundary;
            this.state.boundary = computeStructureBoundary(this);
            return this.state.boundary;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Structure.prototype, "lookup3d", {
        get: function () {
            if (this.state.lookup3d)
                return this.state.lookup3d;
            this.state.lookup3d = new StructureLookup3D(this);
            return this.state.lookup3d;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Structure.prototype, "interUnitBonds", {
        get: function () {
            if (this.state.interUnitBonds)
                return this.state.interUnitBonds;
            if (this.parent && this.state.dynamicBonds === this.parent.state.dynamicBonds &&
                this.parent.state.interUnitBonds && this.parent.state.interUnitBonds.edgeCount === 0) {
                // no need to compute InterUnitBonds if parent's ones are empty
                this.state.interUnitBonds = new InterUnitBonds(new Map());
            }
            else {
                this.state.interUnitBonds = computeInterUnitBonds(this, {
                    ignoreWater: !this.dynamicBonds,
                    ignoreIon: !this.dynamicBonds,
                    validUnit: this.state.interBondsValidUnit,
                    validUnitPair: this.state.interBondsValidUnitPair,
                });
            }
            return this.state.interUnitBonds;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Structure.prototype, "dynamicBonds", {
        get: function () {
            return this.state.dynamicBonds;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Structure.prototype, "interBondsValidUnit", {
        get: function () {
            return this.state.interBondsValidUnit;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Structure.prototype, "interBondsValidUnitPair", {
        get: function () {
            return this.state.interBondsValidUnitPair;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Structure.prototype, "unitSymmetryGroups", {
        get: function () {
            if (this.state.unitSymmetryGroups)
                return this.state.unitSymmetryGroups;
            this.state.unitSymmetryGroups = StructureSymmetry.computeTransformGroups(this);
            return this.state.unitSymmetryGroups;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Structure.prototype, "unitSymmetryGroupsIndexMap", {
        /** Maps unit.id to index of SymmetryGroup in unitSymmetryGroups array */
        get: function () {
            if (this.state.unitSymmetryGroupsIndexMap)
                return this.state.unitSymmetryGroupsIndexMap;
            this.state.unitSymmetryGroupsIndexMap = Unit.SymmetryGroup.getUnitSymmetryGroupsIndexMap(this.unitSymmetryGroups);
            return this.state.unitSymmetryGroupsIndexMap;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Structure.prototype, "carbohydrates", {
        get: function () {
            if (this.state.carbohydrates)
                return this.state.carbohydrates;
            this.state.carbohydrates = computeCarbohydrates(this);
            return this.state.carbohydrates;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Structure.prototype, "models", {
        get: function () {
            if (this.state.models)
                return this.state.models;
            this.state.models = getModels(this);
            return this.state.models;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Structure.prototype, "uniqueResidueNames", {
        get: function () {
            return this.state.uniqueResidueNames
                || (this.state.uniqueResidueNames = getUniqueResidueNames(this));
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Structure.prototype, "uniqueElementSymbols", {
        get: function () {
            return this.state.uniqueElementSymbols
                || (this.state.uniqueElementSymbols = getUniqueElementSymbols(this));
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Structure.prototype, "entityIndices", {
        get: function () {
            return this.state.entityIndices
                || (this.state.entityIndices = getEntityIndices(this));
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Structure.prototype, "uniqueAtomicResidueIndices", {
        get: function () {
            return this.state.uniqueAtomicResidueIndices
                || (this.state.uniqueAtomicResidueIndices = getUniqueAtomicResidueIndices(this));
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Structure.prototype, "isAtomic", {
        /** Contains only atomic units */
        get: function () {
            for (var _a = 0, _b = this.units; _a < _b.length; _a++) {
                var u = _b[_a];
                if (!Unit.isAtomic(u))
                    return false;
            }
            return true;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Structure.prototype, "hasAtomic", {
        /** Contains some atomic units */
        get: function () {
            for (var _a = 0, _b = this.units; _a < _b.length; _a++) {
                var u = _b[_a];
                if (Unit.isAtomic(u))
                    return true;
            }
            return false;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Structure.prototype, "isCoarse", {
        /** Contains only coarse units */
        get: function () {
            for (var _a = 0, _b = this.units; _a < _b.length; _a++) {
                var u = _b[_a];
                if (!Unit.isCoarse(u))
                    return false;
            }
            return true;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Structure.prototype, "hasCoarse", {
        /** Contains some coarse units */
        get: function () {
            for (var _a = 0, _b = this.units; _a < _b.length; _a++) {
                var u = _b[_a];
                if (Unit.isCoarse(u))
                    return true;
            }
            return false;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Structure.prototype, "serialMapping", {
        /**
         * Provides mapping for serial element indices accross all units.
         *
         * Note that this is especially costly for structures with many units that are grouped
         * into few symmetry groups. Use only when needed and prefer `StructureElement`
         * to address elements in a structure.
         */
        get: function () {
            return this.state.serialMapping || (this.state.serialMapping = getSerialMapping(this));
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Structure.prototype, "model", {
        /**
         * If the structure is based on a single model or has a master-/representative-model, return it.
         * Otherwise throw an exception.
         */
        get: function () {
            if (this.state.model)
                return this.state.model;
            if (this.state.representativeModel)
                return this.state.representativeModel;
            if (this.state.masterModel)
                return this.state.masterModel;
            var models = this.models;
            if (models.length > 1) {
                throw new Error('The structure is based on multiple models and has neither a master- nor a representative-model.');
            }
            this.state.model = models[0];
            return this.state.model;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Structure.prototype, "masterModel", {
        /** The master-model, other models can have bonds to it  */
        get: function () {
            return this.state.masterModel;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Structure.prototype, "representativeModel", {
        /** A representative model, e.g. the first model of a trajectory */
        get: function () {
            return this.state.representativeModel;
        },
        enumerable: false,
        configurable: true
    });
    Structure.prototype.hasElement = function (e) {
        if (!this.unitMap.has(e.unit.id))
            return false;
        return SortedArray.has(this.unitMap.get(e.unit.id).elements, e.element);
    };
    Structure.prototype.getModelIndex = function (m) {
        return this.models.indexOf(m);
    };
    Structure.prototype.remapModel = function (m) {
        var _a = this.state, dynamicBonds = _a.dynamicBonds, interUnitBonds = _a.interUnitBonds, parent = _a.parent;
        var units = [];
        for (var _b = 0, _c = this.unitSymmetryGroups; _b < _c.length; _b++) {
            var ug = _c[_b];
            var unit = ug.units[0].remapModel(m, dynamicBonds);
            units.push(unit);
            for (var i = 1, il = ug.units.length; i < il; ++i) {
                var u = ug.units[i];
                units.push(u.remapModel(m, dynamicBonds, unit.props));
            }
        }
        return Structure.create(units, {
            parent: parent === null || parent === void 0 ? void 0 : parent.remapModel(m),
            label: this.label,
            interUnitBonds: dynamicBonds ? undefined : interUnitBonds,
            dynamicBonds: dynamicBonds,
            interBondsValidUnit: this.state.interBondsValidUnit,
            interBondsValidUnitPair: this.state.interBondsValidUnitPair,
            coordinateSystem: this.state.coordinateSystem,
            masterModel: this.state.masterModel,
            representativeModel: this.state.representativeModel,
        });
    };
    /**
     * For `structure` with `parent` this returns a proxy that
     * targets `parent` and has `structure` attached as a child.
     */
    Structure.prototype.asParent = function () {
        if (this._proxy)
            return this._proxy;
        if (this.parent) {
            var p = this.parent.coordinateSystem.isIdentity ? this.parent : Structure.transform(this.parent, this.parent.coordinateSystem.inverse);
            var s = this.coordinateSystem.isIdentity ? p : Structure.transform(p, this.coordinateSystem.matrix);
            this._proxy = new Structure(s.units, s.unitMap, s.unitIndexMap, __assign(__assign({}, s.state), { dynamicBonds: this.dynamicBonds }), { child: this, target: this.parent });
        }
        else {
            this._proxy = this;
        }
        return this._proxy;
    };
    Object.defineProperty(Structure.prototype, "child", {
        get: function () {
            return this._child;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Structure.prototype, "target", {
        /** Get the proxy target. Usefull for equality checks. */
        get: function () {
            var _a;
            return (_a = this._target) !== null && _a !== void 0 ? _a : this;
        },
        enumerable: false,
        configurable: true
    });
    return Structure;
}());
function cmpUnits(units, i, j) {
    return units[i].id - units[j].id;
}
function getModels(s) {
    var units = s.units;
    var arr = UniqueArray.create();
    for (var _a = 0, units_1 = units; _a < units_1.length; _a++) {
        var u = units_1[_a];
        UniqueArray.add(arr, u.model.id, u.model);
    }
    return arr.array;
}
function getUniqueResidueNames(s) {
    var microheterogeneityCompIds = StructureProperties.residue.microheterogeneityCompIds;
    var names = new Set();
    var loc = StructureElement.Location.create(s);
    for (var _a = 0, _b = s.unitSymmetryGroups; _a < _b.length; _a++) {
        var unitGroup = _b[_a];
        var unit = unitGroup.units[0];
        // TODO: support coarse unit?
        if (!Unit.isAtomic(unit))
            continue;
        var residues = Segmentation.transientSegments(unit.model.atomicHierarchy.residueAtomSegments, unit.elements);
        loc.unit = unit;
        while (residues.hasNext) {
            var seg = residues.move();
            loc.element = unit.elements[seg.start];
            var compIds = microheterogeneityCompIds(loc);
            for (var _c = 0, compIds_1 = compIds; _c < compIds_1.length; _c++) {
                var compId = compIds_1[_c];
                names.add(compId);
            }
        }
    }
    return names;
}
function getUniqueElementSymbols(s) {
    var prop = StructureProperties.atom.type_symbol;
    var symbols = new Set();
    var loc = StructureElement.Location.create(s);
    for (var _a = 0, _b = s.unitSymmetryGroups; _a < _b.length; _a++) {
        var unitGroup = _b[_a];
        var unit = unitGroup.units[0];
        if (!Unit.isAtomic(unit))
            continue;
        loc.unit = unit;
        for (var i = 0, il = unit.elements.length; i < il; ++i) {
            loc.element = unit.elements[i];
            symbols.add(prop(loc));
        }
    }
    return symbols;
}
function getEntityIndices(structure) {
    var units = structure.units;
    var l = StructureElement.Location.create(structure);
    var keys = UniqueArray.create();
    for (var _a = 0, units_2 = units; _a < units_2.length; _a++) {
        var unit = units_2[_a];
        var prop = unit.kind === 0 /* Unit.Kind.Atomic */ ? StructureProperties.entity.key : StructureProperties.coarse.entityKey;
        l.unit = unit;
        var elements = unit.elements;
        var chainsIt = Segmentation.transientSegments(unit.model.atomicHierarchy.chainAtomSegments, elements);
        while (chainsIt.hasNext) {
            var chainSegment = chainsIt.move();
            l.element = elements[chainSegment.start];
            var key = prop(l);
            UniqueArray.add(keys, key, key);
        }
    }
    sortArray(keys.array);
    return keys.array;
}
function getUniqueAtomicResidueIndices(structure) {
    var map = new Map();
    var modelIds = [];
    var unitGroups = structure.unitSymmetryGroups;
    for (var _a = 0, unitGroups_1 = unitGroups; _a < unitGroups_1.length; _a++) {
        var unitGroup = unitGroups_1[_a];
        var unit = unitGroup.units[0];
        if (!Unit.isAtomic(unit))
            continue;
        var uniqueResidues = void 0;
        if (map.has(unit.model.id))
            uniqueResidues = map.get(unit.model.id);
        else {
            uniqueResidues = UniqueArray.create();
            modelIds.push(unit.model.id);
            map.set(unit.model.id, uniqueResidues);
        }
        var residues = Segmentation.transientSegments(unit.model.atomicHierarchy.residueAtomSegments, unit.elements);
        while (residues.hasNext) {
            var seg = residues.move();
            UniqueArray.add(uniqueResidues, seg.index, seg.index);
        }
    }
    var ret = new Map();
    for (var _b = 0, modelIds_1 = modelIds; _b < modelIds_1.length; _b++) {
        var id = modelIds_1[_b];
        var array = map.get(id).array;
        sortArray(array);
        ret.set(id, array);
    }
    return ret;
}
function getUniqueElementCount(structure) {
    var unitSymmetryGroups = structure.unitSymmetryGroups;
    var uniqueElementCount = 0;
    for (var i = 0, _i = unitSymmetryGroups.length; i < _i; i++) {
        uniqueElementCount += unitSymmetryGroups[i].elements.length;
    }
    return uniqueElementCount;
}
function getPolymerResidueCount(structure) {
    var units = structure.units;
    var polymerResidueCount = 0;
    for (var i = 0, _i = units.length; i < _i; i++) {
        polymerResidueCount += units[i].polymerElements.length;
    }
    return polymerResidueCount;
}
function getPolymerGapCount(structure) {
    var units = structure.units;
    var polymerGapCount = 0;
    for (var i = 0, _i = units.length; i < _i; i++) {
        polymerGapCount += units[i].gapElements.length / 2;
    }
    return polymerGapCount;
}
function getPolymerUnitCount(structure) {
    var units = structure.units;
    var polymerUnitCount = 0;
    for (var i = 0, _i = units.length; i < _i; i++) {
        if (units[i].polymerElements.length > 0)
            polymerUnitCount += 1;
    }
    return polymerUnitCount;
}
function getAtomicResidueCount(structure) {
    var units = structure.units;
    var atomicResidueCount = 0;
    for (var i = 0, _i = units.length; i < _i; i++) {
        var unit = units[i];
        if (!Unit.isAtomic(unit))
            continue;
        var elements = unit.elements, residueIndex = unit.residueIndex;
        var idx = -1;
        var prevIdx = -1;
        for (var j = 0, jl = elements.length; j < jl; ++j) {
            idx = residueIndex[elements[j]];
            if (idx !== prevIdx) {
                atomicResidueCount += 1;
                prevIdx = idx;
            }
        }
    }
    return atomicResidueCount;
}
function getSerialMapping(structure) {
    var units = structure.units, elementCount = structure.elementCount, unitIndexMap = structure.unitIndexMap;
    var cumulativeUnitElementCount = new Uint32Array(units.length);
    var unitIndices = new Uint32Array(elementCount);
    var elementIndices = new Uint32Array(elementCount);
    for (var i = 0, m = 0, il = units.length; i < il; ++i) {
        cumulativeUnitElementCount[i] = m;
        var elements = units[i].elements;
        for (var j = 0, jl = elements.length; j < jl; ++j) {
            var mj = m + j;
            unitIndices[mj] = i;
            elementIndices[mj] = elements[j];
        }
        m += elements.length;
    }
    return {
        cumulativeUnitElementCount: cumulativeUnitElementCount,
        unitIndices: unitIndices,
        elementIndices: elementIndices,
        getSerialIndex: function (unit, element) { return cumulativeUnitElementCount[unitIndexMap.get(unit.id)] + OrderedSet.indexOf(unit.elements, element); }
    };
}
(function (Structure) {
    Structure.Empty = create([]);
    function Loci(structure) {
        return { kind: 'structure-loci', structure: structure };
    }
    Structure.Loci = Loci;
    function toStructureElementLoci(structure) {
        var elements = [];
        for (var _a = 0, _b = structure.units; _a < _b.length; _a++) {
            var unit = _b[_a];
            elements.push({ unit: unit, indices: Interval.ofBounds(0, unit.elements.length) });
        }
        return StructureElement.Loci(structure, elements);
    }
    Structure.toStructureElementLoci = toStructureElementLoci;
    function toSubStructureElementLoci(parent, structure) {
        return StructureSelection.toLociWithSourceUnits(StructureSelection.Singletons(parent, structure));
    }
    Structure.toSubStructureElementLoci = toSubStructureElementLoci;
    function isLoci(x) {
        return !!x && x.kind === 'structure-loci';
    }
    Structure.isLoci = isLoci;
    function areLociEqual(a, b) {
        return a.structure === b.structure;
    }
    Structure.areLociEqual = areLociEqual;
    function isLociEmpty(loci) {
        return loci.structure.isEmpty;
    }
    Structure.isLociEmpty = isLociEmpty;
    function remapLoci(loci, structure) {
        if (structure === loci.structure)
            return loci;
        return Loci(structure);
    }
    Structure.remapLoci = remapLoci;
    function create(units, props) {
        if (props === void 0) { props = {}; }
        // init units
        var unitMap = IntMap.Mutable();
        var unitIndexMap = IntMap.Mutable();
        var elementCount = 0;
        var isSorted = true;
        var lastId = units.length > 0 ? units[0].id : 0;
        for (var i = 0, _i = units.length; i < _i; i++) {
            var u = units[i];
            unitMap.set(u.id, u);
            elementCount += u.elements.length;
            if (u.id < lastId)
                isSorted = false;
            lastId = u.id;
        }
        if (!isSorted)
            sort(units, 0, units.length, cmpUnits, arraySwap);
        for (var i = 0, _i = units.length; i < _i; i++) {
            unitIndexMap.set(units[i].id, i);
        }
        // initial state
        var state = {
            hashCode: -1,
            transformHash: -1,
            elementCount: elementCount,
            bondCount: -1,
            uniqueElementCount: -1,
            atomicResidueCount: -1,
            polymerResidueCount: -1,
            polymerGapCount: -1,
            polymerUnitCount: -1,
            dynamicBonds: false,
            coordinateSystem: SymmetryOperator.Default,
            label: ''
        };
        // handle props
        if (props.parent)
            state.parent = props.parent.parent || props.parent;
        if (props.interUnitBonds)
            state.interUnitBonds = props.interUnitBonds;
        if (props.interBondsValidUnit)
            state.interBondsValidUnit = props.interBondsValidUnit;
        else if (props.parent)
            state.interBondsValidUnit = props.parent.interBondsValidUnit;
        if (props.interBondsValidUnitPair)
            state.interBondsValidUnitPair = props.interBondsValidUnitPair;
        else if (props.parent)
            state.interBondsValidUnitPair = props.parent.interBondsValidUnitPair;
        if (props.dynamicBonds)
            state.dynamicBonds = props.dynamicBonds;
        else if (props.parent)
            state.dynamicBonds = props.parent.dynamicBonds;
        if (props.coordinateSystem)
            state.coordinateSystem = props.coordinateSystem;
        else if (props.parent)
            state.coordinateSystem = props.parent.coordinateSystem;
        if (props.label)
            state.label = props.label;
        else if (props.parent)
            state.label = props.parent.label;
        if (props.masterModel)
            state.masterModel = props.masterModel;
        else if (props.parent)
            state.masterModel = props.parent.masterModel;
        if (props.representativeModel)
            state.representativeModel = props.representativeModel;
        else if (props.parent)
            state.representativeModel = props.parent.representativeModel;
        return new Structure(units, unitMap, unitIndexMap, state);
    }
    Structure.create = create;
    function ofTrajectory(trajectory, ctx) {
        return __awaiter(this, void 0, void 0, function () {
            var units, first, count, i, il, frame, structure, j, jl, u, invariantId, chainGroupId, newUnit;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (trajectory.frameCount === 0)
                            return [2 /*return*/, Structure.Empty];
                        units = [];
                        first = void 0;
                        count = 0;
                        i = 0, il = trajectory.frameCount;
                        _a.label = 1;
                    case 1:
                        if (!(i < il)) return [3 /*break*/, 4];
                        return [4 /*yield*/, Task.resolveInContext(trajectory.getFrameAtIndex(i), ctx)];
                    case 2:
                        frame = _a.sent();
                        if (!first)
                            first = frame;
                        structure = ofModel(frame);
                        for (j = 0, jl = structure.units.length; j < jl; ++j) {
                            u = structure.units[j];
                            invariantId = u.invariantId + count;
                            chainGroupId = u.chainGroupId + count;
                            newUnit = Unit.create(units.length, invariantId, chainGroupId, u.traits, u.kind, u.model, u.conformation.operator, u.elements);
                            units.push(newUnit);
                        }
                        count = units.length;
                        _a.label = 3;
                    case 3:
                        ++i;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/, create(units, { representativeModel: first, label: first.label })];
                }
            });
        });
    }
    Structure.ofTrajectory = ofTrajectory;
    var PARTITION = false;
    /**
     * Construct a Structure from a model.
     *
     * Generally, a single unit corresponds to a single chain, with the exception
     * of consecutive "single atom chains" with same entity_id and same auth_asym_id.
     */
    function ofModel(model, props) {
        if (props === void 0) { props = {}; }
        var chains = model.atomicHierarchy.chainAtomSegments;
        var index = model.atomicHierarchy.index;
        var auth_asym_id = model.atomicHierarchy.chains.auth_asym_id;
        var atomicChainOperatorMappinng = model.atomicChainOperatorMappinng;
        var builder = new StructureBuilder(__assign({ label: model.label }, props));
        for (var c = 0; c < chains.count; c++) {
            var operator = atomicChainOperatorMappinng.get(c) || SymmetryOperator.Default;
            var start = chains.offsets[c];
            // set to true for chains that consist of "single atom residues",
            // note that it assumes there are no "zero atom residues"
            var singleAtomResidues = AtomicHierarchy.chainResidueCount(model.atomicHierarchy, c) === chains.offsets[c + 1] - chains.offsets[c];
            var multiChain = false;
            if (isWaterChain(model, c)) {
                // merge consecutive water chains
                while (c + 1 < chains.count && isWaterChain(model, c + 1)) {
                    var op1 = atomicChainOperatorMappinng.get(c);
                    var op2 = atomicChainOperatorMappinng.get(c + 1);
                    if (op1 !== op2)
                        break;
                    multiChain = true;
                    c++;
                }
            }
            else {
                // merge consecutive "single atom chains" with same entity_id and auth_asym_id
                while (c + 1 < chains.count
                    && chains.offsets[c + 1] - chains.offsets[c] === 1
                    && chains.offsets[c + 2] - chains.offsets[c + 1] === 1) {
                    singleAtomResidues = true;
                    var e1 = index.getEntityFromChain(c);
                    var e2 = index.getEntityFromChain(c + 1);
                    if (e1 !== e2)
                        break;
                    var a1 = auth_asym_id.value(c);
                    var a2 = auth_asym_id.value(c + 1);
                    if (a1 !== a2)
                        break;
                    var op1 = atomicChainOperatorMappinng.get(c);
                    var op2 = atomicChainOperatorMappinng.get(c + 1);
                    if (op1 !== op2)
                        break;
                    multiChain = true;
                    c++;
                }
            }
            var elements = SortedArray.ofBounds(start, chains.offsets[c + 1]);
            if (PARTITION) {
                // check for polymer to exclude CA/P-only models
                if (singleAtomResidues && !isPolymerChain(model, c)) {
                    partitionAtomicUnitByAtom(model, elements, builder, multiChain, operator);
                }
                else if (elements.length > 200000 || isWaterChain(model, c)) {
                    // split up very large chains e.g. lipid bilayers, micelles or water with explicit H
                    partitionAtomicUnitByResidue(model, elements, builder, multiChain, operator);
                }
                else {
                    builder.addUnit(0 /* Unit.Kind.Atomic */, model, operator, elements, multiChain ? Unit.Trait.MultiChain : Unit.Trait.None);
                }
            }
            else {
                builder.addUnit(0 /* Unit.Kind.Atomic */, model, operator, elements, multiChain ? Unit.Trait.MultiChain : Unit.Trait.None);
            }
        }
        var cs = model.coarseHierarchy;
        if (cs.isDefined) {
            if (cs.spheres.count > 0) {
                addCoarseUnits(builder, model, model.coarseHierarchy.spheres, 1 /* Unit.Kind.Spheres */);
            }
            if (cs.gaussians.count > 0) {
                addCoarseUnits(builder, model, model.coarseHierarchy.gaussians, 2 /* Unit.Kind.Gaussians */);
            }
        }
        return builder.getStructure();
    }
    Structure.ofModel = ofModel;
    function isWaterChain(model, chainIndex) {
        var e = model.atomicHierarchy.index.getEntityFromChain(chainIndex);
        return model.entities.data.type.value(e) === 'water';
    }
    function isPolymerChain(model, chainIndex) {
        var e = model.atomicHierarchy.index.getEntityFromChain(chainIndex);
        return model.entities.data.type.value(e) === 'polymer';
    }
    function partitionAtomicUnitByAtom(model, indices, builder, multiChain, operator) {
        var _a = model.atomicConformation, x = _a.x, y = _a.y, z = _a.z;
        var position = { x: x, y: y, z: z, indices: indices };
        var lookup = GridLookup3D(position, getBoundary(position), 8192);
        var _b = lookup.buckets, offset = _b.offset, count = _b.count, array = _b.array;
        var traits = (multiChain ? Unit.Trait.MultiChain : Unit.Trait.None) | (offset.length > 1 ? Unit.Trait.Partitioned : Unit.Trait.None);
        builder.beginChainGroup();
        for (var i = 0, _i = offset.length; i < _i; i++) {
            var start = offset[i];
            var set = new Int32Array(count[i]);
            for (var j = 0, _j = count[i]; j < _j; j++) {
                set[j] = indices[array[start + j]];
            }
            builder.addUnit(0 /* Unit.Kind.Atomic */, model, operator, SortedArray.ofSortedArray(set), traits);
        }
        builder.endChainGroup();
    }
    // keeps atoms of residues together
    function partitionAtomicUnitByResidue(model, indices, builder, multiChain, operator) {
        var residueAtomSegments = model.atomicHierarchy.residueAtomSegments;
        var startIndices = [];
        var endIndices = [];
        var residueIt = Segmentation.transientSegments(residueAtomSegments, indices);
        while (residueIt.hasNext) {
            var residueSegment = residueIt.move();
            startIndices[startIndices.length] = indices[residueSegment.start];
            endIndices[endIndices.length] = indices[residueSegment.end];
        }
        var firstResidueAtomCount = endIndices[0] - startIndices[0];
        var gridCellCount = 512 * firstResidueAtomCount;
        var _a = model.atomicConformation, x = _a.x, y = _a.y, z = _a.z;
        var position = { x: x, y: y, z: z, indices: SortedArray.ofSortedArray(startIndices) };
        var lookup = GridLookup3D(position, getBoundary(position), gridCellCount);
        var _b = lookup.buckets, offset = _b.offset, count = _b.count, array = _b.array;
        var traits = (multiChain ? Unit.Trait.MultiChain : Unit.Trait.None) | (offset.length > 1 ? Unit.Trait.Partitioned : Unit.Trait.None);
        builder.beginChainGroup();
        for (var i = 0, _i = offset.length; i < _i; i++) {
            var start = offset[i];
            var set = [];
            for (var j = 0, _j = count[i]; j < _j; j++) {
                var k = array[start + j];
                for (var l = startIndices[k], _l = endIndices[k]; l < _l; l++) {
                    set[set.length] = l;
                }
            }
            builder.addUnit(0 /* Unit.Kind.Atomic */, model, operator, SortedArray.ofSortedArray(new Int32Array(set)), traits);
        }
        builder.endChainGroup();
    }
    function addCoarseUnits(builder, model, elements, kind) {
        var chainElementSegments = elements.chainElementSegments;
        for (var cI = 0; cI < chainElementSegments.count; cI++) {
            var elements_1 = SortedArray.ofBounds(chainElementSegments.offsets[cI], chainElementSegments.offsets[cI + 1]);
            builder.addUnit(kind, model, SymmetryOperator.Default, elements_1, Unit.Trait.None);
        }
    }
    function transform(s, transform) {
        if (Mat4.isIdentity(transform))
            return s;
        if (!Mat4.isRotationAndTranslation(transform, SymmetryOperator.RotationTranslationEpsilon))
            throw new Error('Only rotation/translation combination can be applied.');
        var units = [];
        for (var _a = 0, _b = s.units; _a < _b.length; _a++) {
            var u = _b[_a];
            var old = u.conformation.operator;
            var op = SymmetryOperator.create(old.name, transform, old);
            units.push(u.applyOperator(u.id, op));
        }
        var cs = s.coordinateSystem;
        var newCS = SymmetryOperator.compose(SymmetryOperator.create(cs.name, transform, cs), cs);
        return create(units, { parent: s, coordinateSystem: newCS });
    }
    Structure.transform = transform;
    var StructureBuilder = /** @class */ (function () {
        function StructureBuilder(props) {
            if (props === void 0) { props = {}; }
            this.props = props;
            this.units = [];
            this.invariantId = idFactory();
            this.chainGroupId = -1;
            this.inChainGroup = false;
            this.p = Vec3();
            this.singleElementUnits = new Map();
        }
        StructureBuilder.prototype.beginChainGroup = function () {
            this.chainGroupId++;
            this.inChainGroup = true;
        };
        StructureBuilder.prototype.endChainGroup = function () {
            this.inChainGroup = false;
        };
        StructureBuilder.prototype.addUnit = function (kind, model, operator, elements, traits, invariantId) {
            if (invariantId === undefined)
                invariantId = this.invariantId();
            var chainGroupId = this.inChainGroup ? this.chainGroupId : ++this.chainGroupId;
            var unit = Unit.create(this.units.length, invariantId, chainGroupId, traits, kind, model, operator, elements);
            return this.add(unit);
        };
        StructureBuilder.prototype.add = function (unit) {
            // this is to avoid adding many identical single atom units,
            // for example, from 'degenerate' spacegroups
            // - Diamond (COD 9008564)
            if (unit.elements.length === 1) {
                unit.conformation.position(unit.elements[0], this.p);
                var hash = [unit.invariantId, this.p[0], this.p[1], this.p[2]].join('|');
                if (this.singleElementUnits.has(hash)) {
                    return this.singleElementUnits.get(hash);
                }
                else {
                    this.singleElementUnits.set(hash, unit);
                }
            }
            this.units.push(unit);
            return unit;
        };
        StructureBuilder.prototype.addWithOperator = function (unit, operator, dontCompose) {
            if (dontCompose === void 0) { dontCompose = false; }
            return this.add(unit.applyOperator(this.units.length, operator, dontCompose));
        };
        StructureBuilder.prototype.getStructure = function () {
            return create(this.units, this.props);
        };
        Object.defineProperty(StructureBuilder.prototype, "isEmpty", {
            get: function () {
                return this.units.length === 0;
            },
            enumerable: false,
            configurable: true
        });
        return StructureBuilder;
    }());
    Structure.StructureBuilder = StructureBuilder;
    function Builder(props) {
        if (props === void 0) { props = {}; }
        return new StructureBuilder(props);
    }
    Structure.Builder = Builder;
    function hashCode(s) {
        return s.hashCode;
    }
    Structure.hashCode = hashCode;
    /** Hash based on all unit.model conformation values in the structure */
    function conformationHash(s) {
        return hashString(s.units.map(function (u) { return Unit.conformationId(u); }).join('|'));
    }
    Structure.conformationHash = conformationHash;
    // TODO: there should be a version that properly supports partitioned units
    function areUnitIdsEqual(a, b) {
        if (a === b)
            return true;
        if (a.elementCount !== b.elementCount)
            return false;
        var len = a.units.length;
        if (len !== b.units.length)
            return false;
        for (var i = 0; i < len; i++) {
            if (a.units[i].id !== b.units[i].id)
                return false;
        }
        return true;
    }
    Structure.areUnitIdsEqual = areUnitIdsEqual;
    function areUnitIdsAndIndicesEqual(a, b) {
        if (a === b)
            return true;
        if (!areUnitIdsEqual(a, b))
            return false;
        for (var i = 0, il = a.units.length; i < il; i++) {
            if (!SortedArray.areEqual(a.units[i].elements, b.units[i].elements))
                return false;
        }
        return true;
    }
    Structure.areUnitIdsAndIndicesEqual = areUnitIdsAndIndicesEqual;
    function areHierarchiesEqual(a, b) {
        if (a.hashCode !== b.hashCode)
            return false;
        var len = a.models.length;
        if (len !== b.models.length)
            return false;
        for (var i = 0; i < len; i++) {
            if (!Model.areHierarchiesEqual(a.models[i], b.models[i]))
                return false;
        }
        return true;
    }
    Structure.areHierarchiesEqual = areHierarchiesEqual;
    function areEquivalent(a, b) {
        return a === b || (a.hashCode === b.hashCode &&
            StructureSymmetry.areTransformGroupsEquivalent(a.unitSymmetryGroups, b.unitSymmetryGroups));
    }
    Structure.areEquivalent = areEquivalent;
    /** Check if the structures or their parents are equivalent */
    function areRootsEquivalent(a, b) {
        return areEquivalent(a.root, b.root);
    }
    Structure.areRootsEquivalent = areRootsEquivalent;
    /** Check if the structures or their parents are equal */
    function areRootsEqual(a, b) {
        return a.root === b.root;
    }
    Structure.areRootsEqual = areRootsEqual;
    var ElementLocationIterator = /** @class */ (function () {
        function ElementLocationIterator(structure) {
            this.structure = structure;
            this.unitIndex = 0;
            this.maxIdx = 0;
            this.idx = -1;
            this.current = StructureElement.Location.create(structure);
            this.hasNext = structure.elementCount > 0;
            if (this.hasNext) {
                this.elements = structure.units[0].elements;
                this.maxIdx = this.elements.length - 1;
                this.current.unit = structure.units[0];
            }
        }
        ElementLocationIterator.prototype.move = function () {
            this.advance();
            this.current.element = this.elements[this.idx];
            return this.current;
        };
        ElementLocationIterator.prototype.advance = function () {
            if (this.idx < this.maxIdx) {
                this.idx++;
                if (this.idx === this.maxIdx)
                    this.hasNext = this.unitIndex + 1 < this.structure.units.length;
                return;
            }
            this.idx = 0;
            this.unitIndex++;
            if (this.unitIndex >= this.structure.units.length) {
                this.hasNext = false;
                return;
            }
            this.current.unit = this.structure.units[this.unitIndex];
            this.elements = this.current.unit.elements;
            this.maxIdx = this.elements.length - 1;
            if (this.maxIdx === 0) {
                this.hasNext = this.unitIndex + 1 < this.structure.units.length;
            }
        };
        return ElementLocationIterator;
    }());
    Structure.ElementLocationIterator = ElementLocationIterator;
    var distVec = Vec3();
    function unitElementMinDistance(unit, p, eRadius) {
        var elements = unit.elements, _a = unit.conformation, position = _a.position, r = _a.r, dV = distVec;
        var minD = Number.MAX_VALUE;
        for (var i = 0, _i = elements.length; i < _i; i++) {
            var e = elements[i];
            var d = Vec3.distance(p, position(e, dV)) - eRadius - r(e);
            if (d < minD)
                minD = d;
        }
        return minD;
    }
    function minDistanceToPoint(s, point, radius) {
        var units = s.units;
        var minD = Number.MAX_VALUE;
        for (var i = 0, _i = units.length; i < _i; i++) {
            var unit = units[i];
            var d = unitElementMinDistance(unit, point, radius);
            if (d < minD)
                minD = d;
        }
        return minD;
    }
    Structure.minDistanceToPoint = minDistanceToPoint;
    var distPivot = Vec3();
    function distance(a, b) {
        if (a.elementCount === 0 || b.elementCount === 0)
            return 0;
        var units = a.units;
        var minD = Number.MAX_VALUE;
        for (var i = 0, _i = units.length; i < _i; i++) {
            var unit = units[i];
            var elements = unit.elements, _a = unit.conformation, position = _a.position, r = _a.r;
            for (var i_1 = 0, _i_1 = elements.length; i_1 < _i_1; i_1++) {
                var e = elements[i_1];
                var d = minDistanceToPoint(b, position(e, distPivot), r(e));
                if (d < minD)
                    minD = d;
            }
        }
        return minD;
    }
    Structure.distance = distance;
    function elementDescription(s) {
        return s.elementCount === 1 ? '1 element' : "".concat(s.elementCount, " elements");
    }
    Structure.elementDescription = elementDescription;
    function validUnitPair(s, a, b) {
        return s.masterModel
            ? a.model === b.model || a.model === s.masterModel || b.model === s.masterModel
            : a.model === b.model;
    }
    Structure.validUnitPair = validUnitPair;
    /**
     * Iterate over all unit pairs of a structure and invokes callback for valid units
     * and unit pairs if their boundaries are within a max distance.
     */
    function eachUnitPair(structure, callback, props) {
        var maxRadius = props.maxRadius, validUnit = props.validUnit, validUnitPair = props.validUnitPair;
        if (!structure.units.some(function (u) { return validUnit(u); }))
            return;
        var lookup = structure.lookup3d;
        var imageCenter = Vec3();
        for (var _a = 0, _b = structure.units; _a < _b.length; _a++) {
            var unitA = _b[_a];
            if (!validUnit(unitA))
                continue;
            var bs = unitA.boundary.sphere;
            Vec3.transformMat4(imageCenter, bs.center, unitA.conformation.operator.matrix);
            var closeUnits = lookup.findUnitIndices(imageCenter[0], imageCenter[1], imageCenter[2], bs.radius + maxRadius);
            for (var i = 0; i < closeUnits.count; i++) {
                var unitB = structure.units[closeUnits.indices[i]];
                if (unitA.id >= unitB.id)
                    continue;
                if (!validUnit(unitB) || !validUnitPair(unitA, unitB))
                    continue;
                if (unitB.elements.length >= unitA.elements.length)
                    callback(unitA, unitB);
                else
                    callback(unitB, unitA);
            }
        }
    }
    Structure.eachUnitPair = eachUnitPair;
    ;
    function eachAtomicHierarchyElement(structure, _a) {
        var chain = _a.chain, residue = _a.residue, atom = _a.atom;
        var l = StructureElement.Location.create(structure);
        for (var _b = 0, _c = structure.units; _b < _c.length; _b++) {
            var unit = _c[_b];
            if (unit.kind !== 0 /* Unit.Kind.Atomic */)
                continue;
            l.unit = unit;
            var elements = unit.elements;
            var chainsIt = Segmentation.transientSegments(unit.model.atomicHierarchy.chainAtomSegments, elements);
            var residuesIt = Segmentation.transientSegments(unit.model.atomicHierarchy.residueAtomSegments, elements);
            while (chainsIt.hasNext) {
                var chainSegment = chainsIt.move();
                if (chain) {
                    l.element = elements[chainSegment.start];
                    chain(l);
                }
                if (!residue && !atom)
                    continue;
                residuesIt.setSegment(chainSegment);
                while (residuesIt.hasNext) {
                    var residueSegment = residuesIt.move();
                    if (residue) {
                        l.element = elements[residueSegment.start];
                        residue(l);
                    }
                    if (!atom)
                        continue;
                    for (var j = residueSegment.start, _j = residueSegment.end; j < _j; j++) {
                        l.element = elements[j];
                        atom(l);
                    }
                }
            }
        }
    }
    Structure.eachAtomicHierarchyElement = eachAtomicHierarchyElement;
    //
    Structure.DefaultSizeThresholds = {
        /** Must be lower to be small */
        smallResidueCount: 10,
        /** Must be lower to be medium */
        mediumResidueCount: 5000,
        /** Must be lower to be large (big ribosomes like 4UG0 should still be `large`) */
        largeResidueCount: 30000,
        /**
         * Structures above `largeResidueCount` are consider huge when they have
         * a `highSymmetryUnitCount` or gigantic when not
         */
        highSymmetryUnitCount: 10,
        /** Fiber-like structure are consider small when below this */
        fiberResidueCount: 15,
    };
    function getPolymerSymmetryGroups(structure) {
        return structure.unitSymmetryGroups.filter(function (ug) { return ug.units[0].polymerElements.length > 0; });
    }
    /**
     * Try to match fiber-like structures like 6nk4
     */
    function isFiberLike(structure, thresholds) {
        var polymerSymmetryGroups = getPolymerSymmetryGroups(structure);
        return (polymerSymmetryGroups.length === 1 &&
            polymerSymmetryGroups[0].units.length > 2 &&
            polymerSymmetryGroups[0].units[0].polymerElements.length < thresholds.fiberResidueCount);
    }
    function hasHighSymmetry(structure, thresholds) {
        var polymerSymmetryGroups = getPolymerSymmetryGroups(structure);
        return (polymerSymmetryGroups.length >= 1 &&
            polymerSymmetryGroups[0].units.length > thresholds.highSymmetryUnitCount);
    }
    var Size;
    (function (Size) {
        Size[Size["Small"] = 0] = "Small";
        Size[Size["Medium"] = 1] = "Medium";
        Size[Size["Large"] = 2] = "Large";
        Size[Size["Huge"] = 3] = "Huge";
        Size[Size["Gigantic"] = 4] = "Gigantic";
    })(Size = Structure.Size || (Structure.Size = {}));
    /**
     * @param residueCountFactor - modifies the threshold counts, useful when estimating
     *                             the size of a structure comprised of multiple models
     */
    function getSize(structure, thresholds, residueCountFactor) {
        if (thresholds === void 0) { thresholds = {}; }
        if (residueCountFactor === void 0) { residueCountFactor = 1; }
        var t = __assign(__assign({}, Structure.DefaultSizeThresholds), thresholds);
        if (structure.polymerResidueCount >= t.largeResidueCount * residueCountFactor) {
            if (hasHighSymmetry(structure, t)) {
                return Size.Huge;
            }
            else {
                return Size.Gigantic;
            }
        }
        else if (isFiberLike(structure, t)) {
            return Size.Small;
        }
        else if (structure.polymerResidueCount < t.smallResidueCount * residueCountFactor) {
            return Size.Small;
        }
        else if (structure.polymerResidueCount < t.mediumResidueCount * residueCountFactor) {
            return Size.Medium;
        }
        else {
            return Size.Large;
        }
    }
    Structure.getSize = getSize;
    Structure.Index = CustomStructureProperty.createSimple('index', 'root');
    Structure.MaxIndex = CustomStructureProperty.createSimple('max_index', 'root');
    var PrincipalAxesProp = '__PrincipalAxes__';
    function getPrincipalAxes(structure) {
        if (structure.currentPropertyData[PrincipalAxesProp])
            return structure.currentPropertyData[PrincipalAxesProp];
        var principalAxes = StructureElement.Loci.getPrincipalAxes(Structure.toStructureElementLoci(structure));
        structure.currentPropertyData[PrincipalAxesProp] = principalAxes;
        return principalAxes;
    }
    Structure.getPrincipalAxes = getPrincipalAxes;
})(Structure || (Structure = {}));
export { Structure };
