/**
 * Copyright (c) 2019-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { __awaiter, __extends, __generator } from "tslib";
import { OrderedSet } from '../../../mol-data/int';
import { BoundaryHelper } from '../../../mol-math/geometry/boundary-helper';
import { Vec3 } from '../../../mol-math/linear-algebra';
import { EmptyLoci, Loci } from '../../../mol-model/loci';
import { QueryContext, Structure, StructureElement, StructureSelection } from '../../../mol-model/structure';
import { StateObjectRef, StateSelection } from '../../../mol-state';
import { Task } from '../../../mol-task';
import { structureElementStatsLabel } from '../../../mol-theme/label';
import { arrayRemoveAtInPlace } from '../../../mol-util/array';
import { StatefulPluginComponent } from '../../component';
import { PluginStateObject as PSO } from '../../objects';
import { UUID } from '../../../mol-util';
import { iterableToArray } from '../../../mol-data/util';
var boundaryHelper = new BoundaryHelper('98');
var HISTORY_CAPACITY = 24;
var StructureSelectionManager = /** @class */ (function (_super) {
    __extends(StructureSelectionManager, _super);
    function StructureSelectionManager(plugin) {
        var _this = _super.call(this, { entries: new Map(), additionsHistory: [], stats: SelectionStats() }) || this;
        _this.plugin = plugin;
        _this.events = {
            changed: _this.ev(),
            additionsHistoryUpdated: _this.ev(),
            loci: {
                add: _this.ev(),
                remove: _this.ev(),
                clear: _this.ev()
            }
        };
        // listen to events from substructureParent helper to ensure it is updated
        plugin.helpers.substructureParent.events.removed.subscribe(function (e) { return _this.onRemove(e.ref, e.obj); });
        plugin.helpers.substructureParent.events.updated.subscribe(function (e) { return _this.onUpdate(e.ref, e.oldObj, e.obj); });
        return _this;
    }
    Object.defineProperty(StructureSelectionManager.prototype, "entries", {
        get: function () { return this.state.entries; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(StructureSelectionManager.prototype, "additionsHistory", {
        get: function () { return this.state.additionsHistory; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(StructureSelectionManager.prototype, "stats", {
        get: function () {
            if (this.state.stats)
                return this.state.stats;
            this.state.stats = this.calcStats();
            return this.state.stats;
        },
        enumerable: false,
        configurable: true
    });
    StructureSelectionManager.prototype.getEntry = function (s) {
        // ignore decorators to get stable ref
        var cell = this.plugin.helpers.substructureParent.get(s, true);
        if (!cell)
            return;
        var ref = cell.transform.ref;
        if (!this.entries.has(ref)) {
            var entry = new SelectionEntry(StructureElement.Loci(s, []));
            this.entries.set(ref, entry);
            return entry;
        }
        return this.entries.get(ref);
    };
    StructureSelectionManager.prototype.calcStats = function () {
        var structureCount = 0;
        var elementCount = 0;
        var stats = StructureElement.Stats.create();
        this.entries.forEach(function (v) {
            var elements = v.selection.elements;
            if (elements.length) {
                structureCount += 1;
                for (var i = 0, il = elements.length; i < il; ++i) {
                    elementCount += OrderedSet.size(elements[i].indices);
                }
                StructureElement.Stats.add(stats, stats, StructureElement.Stats.ofLoci(v.selection));
            }
        });
        var label = structureElementStatsLabel(stats, { countsOnly: true });
        return { structureCount: structureCount, elementCount: elementCount, label: label };
    };
    StructureSelectionManager.prototype.add = function (loci) {
        if (!StructureElement.Loci.is(loci))
            return false;
        var entry = this.getEntry(loci.structure);
        if (!entry)
            return false;
        var sel = entry.selection;
        entry.selection = StructureElement.Loci.union(entry.selection, loci);
        this.tryAddHistory(loci);
        this.referenceLoci = loci;
        this.events.loci.add.next(loci);
        return !StructureElement.Loci.areEqual(sel, entry.selection);
    };
    StructureSelectionManager.prototype.remove = function (loci) {
        if (!StructureElement.Loci.is(loci))
            return false;
        var entry = this.getEntry(loci.structure);
        if (!entry)
            return false;
        var sel = entry.selection;
        entry.selection = StructureElement.Loci.subtract(entry.selection, loci);
        // this.addHistory(loci);
        this.referenceLoci = loci;
        this.events.loci.remove.next(loci);
        return !StructureElement.Loci.areEqual(sel, entry.selection);
    };
    StructureSelectionManager.prototype.intersect = function (loci) {
        if (!StructureElement.Loci.is(loci))
            return false;
        var entry = this.getEntry(loci.structure);
        if (!entry)
            return false;
        var sel = entry.selection;
        entry.selection = StructureElement.Loci.intersect(entry.selection, loci);
        // this.addHistory(loci);
        this.referenceLoci = loci;
        return !StructureElement.Loci.areEqual(sel, entry.selection);
    };
    StructureSelectionManager.prototype.set = function (loci) {
        if (!StructureElement.Loci.is(loci))
            return false;
        var entry = this.getEntry(loci.structure);
        if (!entry)
            return false;
        var sel = entry.selection;
        entry.selection = loci;
        this.tryAddHistory(loci);
        this.referenceLoci = undefined;
        return !StructureElement.Loci.areEqual(sel, entry.selection);
    };
    StructureSelectionManager.prototype.modifyHistory = function (entry, action, modulus, groupByStructure) {
        if (groupByStructure === void 0) { groupByStructure = false; }
        var history = this.additionsHistory;
        var idx = history.indexOf(entry);
        if (idx < 0)
            return;
        var swapWith = void 0;
        switch (action) {
            case 'remove':
                arrayRemoveAtInPlace(history, idx);
                break;
            case 'up':
                swapWith = idx - 1;
                break;
            case 'down':
                swapWith = idx + 1;
                break;
        }
        if (swapWith !== void 0) {
            var mod = modulus ? Math.min(history.length, modulus) : history.length;
            while (true) {
                swapWith = swapWith % mod;
                if (swapWith < 0)
                    swapWith += mod;
                if (!groupByStructure || history[idx].loci.structure === history[swapWith].loci.structure) {
                    var t = history[idx];
                    history[idx] = history[swapWith];
                    history[swapWith] = t;
                    break;
                }
                else {
                    swapWith += action === 'up' ? -1 : +1;
                }
            }
        }
        this.events.additionsHistoryUpdated.next(void 0);
    };
    StructureSelectionManager.prototype.tryAddHistory = function (loci) {
        if (Loci.isEmpty(loci))
            return;
        var idx = 0, entry = void 0;
        for (var _i = 0, _a = this.additionsHistory; _i < _a.length; _i++) {
            var l = _a[_i];
            if (Loci.areEqual(l.loci, loci)) {
                entry = l;
                break;
            }
            idx++;
        }
        if (entry) {
            // move to top
            arrayRemoveAtInPlace(this.additionsHistory, idx);
            this.additionsHistory.unshift(entry);
            this.events.additionsHistoryUpdated.next(void 0);
            return;
        }
        var stats = StructureElement.Stats.ofLoci(loci);
        var label = structureElementStatsLabel(stats, { reverse: true });
        this.additionsHistory.unshift({ id: UUID.create22(), loci: loci, label: label });
        if (this.additionsHistory.length > HISTORY_CAPACITY)
            this.additionsHistory.pop();
        this.events.additionsHistoryUpdated.next(void 0);
    };
    StructureSelectionManager.prototype.clearHistory = function () {
        if (this.state.additionsHistory.length !== 0) {
            this.state.additionsHistory = [];
            this.events.additionsHistoryUpdated.next(void 0);
        }
    };
    StructureSelectionManager.prototype.clearHistoryForStructure = function (structure) {
        var historyEntryToRemove = [];
        for (var _i = 0, _a = this.state.additionsHistory; _i < _a.length; _i++) {
            var e = _a[_i];
            if (e.loci.structure.root === structure.root) {
                historyEntryToRemove.push(e);
            }
        }
        for (var _b = 0, historyEntryToRemove_1 = historyEntryToRemove; _b < historyEntryToRemove_1.length; _b++) {
            var e = historyEntryToRemove_1[_b];
            this.modifyHistory(e, 'remove');
        }
        if (historyEntryToRemove.length !== 0) {
            this.events.additionsHistoryUpdated.next(void 0);
        }
    };
    StructureSelectionManager.prototype.onRemove = function (ref, obj) {
        var _a;
        if (this.entries.has(ref)) {
            this.entries.delete(ref);
            if (obj === null || obj === void 0 ? void 0 : obj.data) {
                this.clearHistoryForStructure(obj.data);
            }
            if (((_a = this.referenceLoci) === null || _a === void 0 ? void 0 : _a.structure) === (obj === null || obj === void 0 ? void 0 : obj.data)) {
                this.referenceLoci = undefined;
            }
            this.state.stats = void 0;
            this.events.changed.next(void 0);
        }
    };
    StructureSelectionManager.prototype.onUpdate = function (ref, oldObj, obj) {
        var _a, _b, _c, _d;
        // no change to structure
        if (oldObj === obj || (oldObj === null || oldObj === void 0 ? void 0 : oldObj.data) === obj.data)
            return;
        // ignore decorators to get stable ref
        var cell = this.plugin.helpers.substructureParent.get(obj.data, true);
        if (!cell)
            return;
        // only need to update the root
        if (ref !== cell.transform.ref)
            return;
        if (!this.entries.has(ref))
            return;
        // use structure from last decorator as reference
        var structure = (_b = (_a = this.plugin.helpers.substructureParent.get(obj.data)) === null || _a === void 0 ? void 0 : _a.obj) === null || _b === void 0 ? void 0 : _b.data;
        if (!structure)
            return;
        // oldObj is not defined for inserts (e.g. TransformStructureConformation)
        if (!(oldObj === null || oldObj === void 0 ? void 0 : oldObj.data) || Structure.areUnitIdsAndIndicesEqual(oldObj.data, obj.data)) {
            this.entries.set(ref, remapSelectionEntry(this.entries.get(ref), structure));
            // remap referenceLoci & prevHighlight if needed and possible
            if (((_c = this.referenceLoci) === null || _c === void 0 ? void 0 : _c.structure.root) === structure.root) {
                this.referenceLoci = StructureElement.Loci.remap(this.referenceLoci, structure);
            }
            // remap history locis if needed and possible
            var changedHistory = false;
            for (var _i = 0, _f = this.state.additionsHistory; _i < _f.length; _i++) {
                var e = _f[_i];
                if (e.loci.structure.root === structure.root) {
                    e.loci = StructureElement.Loci.remap(e.loci, structure);
                    changedHistory = true;
                }
            }
            if (changedHistory)
                this.events.additionsHistoryUpdated.next(void 0);
        }
        else {
            // clear the selection for ref
            this.entries.set(ref, new SelectionEntry(StructureElement.Loci(structure, [])));
            if (((_d = this.referenceLoci) === null || _d === void 0 ? void 0 : _d.structure.root) === structure.root) {
                this.referenceLoci = undefined;
            }
            this.clearHistoryForStructure(structure);
            this.state.stats = void 0;
            this.events.changed.next(void 0);
        }
    };
    /** Removes all selections and returns them */
    StructureSelectionManager.prototype.clear = function () {
        var keys = this.entries.keys();
        var selections = [];
        while (true) {
            var k = keys.next();
            if (k.done)
                break;
            var s = this.entries.get(k.value);
            if (!StructureElement.Loci.isEmpty(s.selection))
                selections.push(s.selection);
            s.selection = StructureElement.Loci(s.selection.structure, []);
        }
        this.referenceLoci = undefined;
        this.state.stats = void 0;
        this.events.changed.next(void 0);
        this.events.loci.clear.next(void 0);
        this.clearHistory();
        return selections;
    };
    StructureSelectionManager.prototype.getLoci = function (structure) {
        var entry = this.getEntry(structure);
        if (!entry)
            return EmptyLoci;
        return entry.selection;
    };
    StructureSelectionManager.prototype.getStructure = function (structure) {
        var entry = this.getEntry(structure);
        if (!entry)
            return;
        return entry.structure;
    };
    StructureSelectionManager.prototype.structureHasSelection = function (structure) {
        var _a, _b;
        var s = (_b = (_a = structure.cell) === null || _a === void 0 ? void 0 : _a.obj) === null || _b === void 0 ? void 0 : _b.data;
        if (!s)
            return false;
        var entry = this.getEntry(s);
        return !!entry && !StructureElement.Loci.isEmpty(entry.selection);
    };
    StructureSelectionManager.prototype.has = function (loci) {
        if (StructureElement.Loci.is(loci)) {
            var entry = this.getEntry(loci.structure);
            if (entry) {
                return StructureElement.Loci.isSubset(entry.selection, loci);
            }
        }
        return false;
    };
    StructureSelectionManager.prototype.tryGetRange = function (loci) {
        if (!StructureElement.Loci.is(loci))
            return;
        if (loci.elements.length !== 1)
            return;
        var entry = this.getEntry(loci.structure);
        if (!entry)
            return;
        var xs = loci.elements[0];
        if (!xs)
            return;
        var ref = this.referenceLoci;
        if (!ref || !StructureElement.Loci.is(ref) || ref.structure !== loci.structure)
            return;
        var e;
        for (var _i = 0, _a = ref.elements; _i < _a.length; _i++) {
            var _e = _a[_i];
            if (xs.unit === _e.unit) {
                e = _e;
                break;
            }
        }
        if (!e)
            return;
        if (xs.unit !== e.unit)
            return;
        return getElementRange(loci.structure, e, xs);
    };
    /** Count of all selected elements */
    StructureSelectionManager.prototype.elementCount = function () {
        var count = 0;
        this.entries.forEach(function (v) {
            count += StructureElement.Loci.size(v.selection);
        });
        return count;
    };
    StructureSelectionManager.prototype.getBoundary = function () {
        var min = Vec3.create(Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE);
        var max = Vec3.create(-Number.MAX_VALUE, -Number.MAX_VALUE, -Number.MAX_VALUE);
        boundaryHelper.reset();
        var boundaries = [];
        this.entries.forEach(function (v) {
            var loci = v.selection;
            if (!StructureElement.Loci.isEmpty(loci)) {
                boundaries.push(StructureElement.Loci.getBoundary(loci));
            }
        });
        for (var i = 0, il = boundaries.length; i < il; ++i) {
            var _a = boundaries[i], box = _a.box, sphere = _a.sphere;
            Vec3.min(min, min, box.min);
            Vec3.max(max, max, box.max);
            boundaryHelper.includePositionRadius(sphere.center, sphere.radius);
        }
        boundaryHelper.finishedIncludeStep();
        for (var i = 0, il = boundaries.length; i < il; ++i) {
            var sphere = boundaries[i].sphere;
            boundaryHelper.radiusPositionRadius(sphere.center, sphere.radius);
        }
        return { box: { min: min, max: max }, sphere: boundaryHelper.getSphere() };
    };
    StructureSelectionManager.prototype.getPrincipalAxes = function () {
        var values = iterableToArray(this.entries.values());
        return StructureElement.Loci.getPrincipalAxesMany(values.map(function (v) { return v.selection; }));
    };
    StructureSelectionManager.prototype.modify = function (modifier, loci) {
        var changed = false;
        switch (modifier) {
            case 'add':
                changed = this.add(loci);
                break;
            case 'remove':
                changed = this.remove(loci);
                break;
            case 'intersect':
                changed = this.intersect(loci);
                break;
            case 'set':
                changed = this.set(loci);
                break;
        }
        if (changed) {
            this.state.stats = void 0;
            this.events.changed.next(void 0);
        }
    };
    Object.defineProperty(StructureSelectionManager.prototype, "applicableStructures", {
        get: function () {
            return this.plugin.managers.structure.hierarchy.selection.structures
                .filter(function (s) { return !!s.cell.obj; })
                .map(function (s) { return s.cell.obj.data; });
        },
        enumerable: false,
        configurable: true
    });
    StructureSelectionManager.prototype.triggerInteraction = function (modifier, loci, applyGranularity) {
        if (applyGranularity === void 0) { applyGranularity = true; }
        switch (modifier) {
            case 'add':
                this.plugin.managers.interactivity.lociSelects.select({ loci: loci }, applyGranularity);
                break;
            case 'remove':
                this.plugin.managers.interactivity.lociSelects.deselect({ loci: loci }, applyGranularity);
                break;
            case 'intersect':
                this.plugin.managers.interactivity.lociSelects.selectJoin({ loci: loci }, applyGranularity);
                break;
            case 'set':
                this.plugin.managers.interactivity.lociSelects.selectOnly({ loci: loci }, applyGranularity);
                break;
        }
    };
    StructureSelectionManager.prototype.fromLoci = function (modifier, loci, applyGranularity) {
        if (applyGranularity === void 0) { applyGranularity = true; }
        this.triggerInteraction(modifier, loci, applyGranularity);
    };
    StructureSelectionManager.prototype.fromCompiledQuery = function (modifier, query, applyGranularity) {
        if (applyGranularity === void 0) { applyGranularity = true; }
        for (var _i = 0, _a = this.applicableStructures; _i < _a.length; _i++) {
            var s = _a[_i];
            var loci = query(new QueryContext(s));
            this.triggerInteraction(modifier, StructureSelection.toLociWithSourceUnits(loci), applyGranularity);
        }
    };
    StructureSelectionManager.prototype.fromSelectionQuery = function (modifier, query, applyGranularity) {
        var _this = this;
        if (applyGranularity === void 0) { applyGranularity = true; }
        this.plugin.runTask(Task.create('Structure Selection', function (runtime) { return __awaiter(_this, void 0, void 0, function () {
            var _i, _a, s, loci;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _i = 0, _a = this.applicableStructures;
                        _b.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 4];
                        s = _a[_i];
                        return [4 /*yield*/, query.getSelection(this.plugin, runtime, s)];
                    case 2:
                        loci = _b.sent();
                        this.triggerInteraction(modifier, StructureSelection.toLociWithSourceUnits(loci), applyGranularity);
                        _b.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/];
                }
            });
        }); }));
    };
    StructureSelectionManager.prototype.fromSelections = function (ref) {
        var _a;
        var cell = StateObjectRef.resolveAndCheck(this.plugin.state.data, ref);
        if (!cell || !cell.obj)
            return;
        if (!PSO.Molecule.Structure.Selections.is(cell.obj)) {
            console.warn('fromSelections applied to wrong object type.', cell.obj);
            return;
        }
        this.clear();
        for (var _i = 0, _b = (_a = cell.obj) === null || _a === void 0 ? void 0 : _a.data; _i < _b.length; _i++) {
            var s = _b[_i];
            this.fromLoci('set', s.loci);
        }
    };
    StructureSelectionManager.prototype.getSnapshot = function () {
        var entries = [];
        this.entries.forEach(function (entry, ref) {
            entries.push({
                ref: ref,
                bundle: StructureElement.Bundle.fromLoci(entry.selection)
            });
        });
        return { entries: entries };
    };
    StructureSelectionManager.prototype.setSnapshot = function (snapshot) {
        var _a, _b;
        this.entries.clear();
        for (var _i = 0, _c = snapshot.entries; _i < _c.length; _i++) {
            var _d = _c[_i], ref = _d.ref, bundle = _d.bundle;
            var structure = (_b = (_a = this.plugin.state.data.select(StateSelection.Generators.byRef(ref))[0]) === null || _a === void 0 ? void 0 : _a.obj) === null || _b === void 0 ? void 0 : _b.data;
            if (!structure)
                continue;
            var loci = StructureElement.Bundle.toLoci(bundle, structure);
            this.fromLoci('set', loci, false);
        }
    };
    return StructureSelectionManager;
}(StatefulPluginComponent));
export { StructureSelectionManager };
function SelectionStats() { return { structureCount: 0, elementCount: 0, label: 'Nothing Selected' }; }
;
var SelectionEntry = /** @class */ (function () {
    function SelectionEntry(selection) {
        this._structure = void 0;
        this._selection = selection;
    }
    Object.defineProperty(SelectionEntry.prototype, "selection", {
        get: function () { return this._selection; },
        set: function (value) {
            this._selection = value;
            this._structure = void 0;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(SelectionEntry.prototype, "structure", {
        get: function () {
            if (this._structure)
                return this._structure;
            if (Loci.isEmpty(this._selection)) {
                this._structure = void 0;
            }
            else {
                this._structure = StructureElement.Loci.toStructure(this._selection);
            }
            return this._structure;
        },
        enumerable: false,
        configurable: true
    });
    return SelectionEntry;
}());
/** remap `selection-entry` to be related to `structure` if possible */
function remapSelectionEntry(e, s) {
    return new SelectionEntry(StructureElement.Loci.remap(e.selection, s));
}
/**
 * Assumes `ref` and `ext` belong to the same unit in the same structure
 */
function getElementRange(structure, ref, ext) {
    var min = Math.min(OrderedSet.min(ref.indices), OrderedSet.min(ext.indices));
    var max = Math.max(OrderedSet.max(ref.indices), OrderedSet.max(ext.indices));
    return StructureElement.Loci(structure, [{
            unit: ref.unit,
            indices: OrderedSet.ofRange(min, max)
        }]);
}
