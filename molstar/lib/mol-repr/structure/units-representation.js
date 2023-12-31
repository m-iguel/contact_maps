/**
 * Copyright (c) 2018-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { __awaiter, __generator } from "tslib";
import { ParamDefinition as PD } from '../../mol-util/param-definition';
import { StructureRepresentationStateBuilder } from './representation';
import { Representation } from '../representation';
import { Structure, StructureElement, Bond } from '../../mol-model/structure';
import { Subject } from 'rxjs';
import { getNextMaterialId } from '../../mol-gl/render-object';
import { Theme } from '../../mol-theme/theme';
import { Task } from '../../mol-task';
import { Loci, EmptyLoci, isEmptyLoci, isEveryLoci, isDataLoci, EveryLoci } from '../../mol-model/loci';
import { MarkerAction, MarkerActions, applyMarkerAction } from '../../mol-util/marker-action';
import { Overpaint } from '../../mol-theme/overpaint';
import { Transparency } from '../../mol-theme/transparency';
import { Mat4, EPSILON } from '../../mol-math/linear-algebra';
import { Interval } from '../../mol-data/int';
import { Clipping } from '../../mol-theme/clipping';
import { Substance } from '../../mol-theme/substance';
export function UnitsRepresentation(label, ctx, getParams, visualCtor) {
    var version = 0;
    var webgl = ctx.webgl;
    var updated = new Subject();
    var materialId = getNextMaterialId();
    var renderObjects = [];
    var geometryState = new Representation.GeometryState();
    var _state = StructureRepresentationStateBuilder.create();
    var visuals = new Map();
    var _structure;
    var _groups;
    var _params;
    var _props;
    var _theme = Theme.createEmpty();
    function createOrUpdate(props, structure) {
        var _this = this;
        if (props === void 0) { props = {}; }
        if (structure && structure !== _structure) {
            _params = getParams(ctx, structure);
            if (!_props)
                _props = PD.getDefaultValues(_params);
        }
        _props = Object.assign({}, _props, props);
        return Task.create('Creating or updating UnitsRepresentation', function (runtime) { return __awaiter(_this, void 0, void 0, function () {
            var i, group, visual, promise, oldVisuals, i, group, visualGroup, visual, promise, promise, arr, visual, promise, i, group, visualGroup, visual, promise, promise, visualsList_1, i, il, _a, visual, group, promise, promise;
            var _b, _c, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        if (!(!_structure && !structure)) return [3 /*break*/, 1];
                        throw new Error('missing structure');
                    case 1:
                        if (!(structure && !_structure)) return [3 /*break*/, 8];
                        // console.log(label, 'initial structure');
                        // First call with a structure, create visuals for each group.
                        _groups = structure.unitSymmetryGroups;
                        i = 0;
                        _e.label = 2;
                    case 2:
                        if (!(i < _groups.length)) return [3 /*break*/, 7];
                        group = _groups[i];
                        visual = visualCtor(materialId, structure, _props, webgl);
                        promise = visual.createOrUpdate({ webgl: webgl, runtime: runtime }, _theme, _props, { group: group, structure: structure });
                        if (!promise) return [3 /*break*/, 4];
                        return [4 /*yield*/, promise];
                    case 3:
                        _e.sent();
                        _e.label = 4;
                    case 4:
                        setVisualState(visual, group, _state); // current state for new visual
                        visuals.set(group.hashCode, { visual: visual, group: group });
                        if (!runtime.shouldUpdate) return [3 /*break*/, 6];
                        return [4 /*yield*/, runtime.update({ message: 'Creating or updating UnitsVisual', current: i, max: _groups.length })];
                    case 5:
                        _e.sent();
                        _e.label = 6;
                    case 6:
                        i++;
                        return [3 /*break*/, 2];
                    case 7: return [3 /*break*/, 43];
                    case 8:
                        if (!(structure && (!Structure.areUnitIdsAndIndicesEqual(structure, _structure) || structure.child !== _structure.child))) return [3 /*break*/, 22];
                        // console.log(label, 'structures not equivalent');
                        // Tries to re-use existing visuals for the groups of the new structure.
                        // Creates additional visuals if needed, destroys left-over visuals.
                        _groups = structure.unitSymmetryGroups;
                        oldVisuals = visuals;
                        visuals = new Map();
                        i = 0;
                        _e.label = 9;
                    case 9:
                        if (!(i < _groups.length)) return [3 /*break*/, 21];
                        group = _groups[i];
                        visualGroup = oldVisuals.get(group.hashCode);
                        if (!visualGroup) return [3 /*break*/, 15];
                        visual = visualGroup.visual;
                        if (!((_b = visual.mustRecreate) === null || _b === void 0 ? void 0 : _b.call(visual, { group: group, structure: structure }, _props, webgl))) return [3 /*break*/, 12];
                        visual.destroy();
                        visual = visualCtor(materialId, structure, _props, webgl);
                        promise = visual.createOrUpdate({ webgl: webgl, runtime: runtime }, _theme, _props, { group: group, structure: structure });
                        if (!promise) return [3 /*break*/, 11];
                        return [4 /*yield*/, promise];
                    case 10:
                        _e.sent();
                        _e.label = 11;
                    case 11:
                        setVisualState(visual, group, _state); // current state for new visual
                        return [3 /*break*/, 14];
                    case 12:
                        promise = visual.createOrUpdate({ webgl: webgl, runtime: runtime }, _theme, _props, { group: group, structure: structure });
                        if (!promise) return [3 /*break*/, 14];
                        return [4 /*yield*/, promise];
                    case 13:
                        _e.sent();
                        _e.label = 14;
                    case 14:
                        visuals.set(group.hashCode, { visual: visual, group: group });
                        oldVisuals.delete(group.hashCode);
                        // Remove highlight
                        // TODO: remove selection too??
                        if (visual.renderObject) {
                            arr = visual.renderObject.values.tMarker.ref.value.array;
                            applyMarkerAction(arr, Interval.ofBounds(0, arr.length), MarkerAction.RemoveHighlight);
                        }
                        return [3 /*break*/, 18];
                    case 15:
                        visual = visualCtor(materialId, structure, _props, webgl);
                        promise = visual.createOrUpdate({ webgl: webgl, runtime: runtime }, _theme, _props, { group: group, structure: structure });
                        if (!promise) return [3 /*break*/, 17];
                        return [4 /*yield*/, promise];
                    case 16:
                        _e.sent();
                        _e.label = 17;
                    case 17:
                        setVisualState(visual, group, _state); // current state for new visual
                        visuals.set(group.hashCode, { visual: visual, group: group });
                        _e.label = 18;
                    case 18:
                        if (!runtime.shouldUpdate) return [3 /*break*/, 20];
                        return [4 /*yield*/, runtime.update({ message: 'Creating or updating UnitsVisual', current: i, max: _groups.length })];
                    case 19:
                        _e.sent();
                        _e.label = 20;
                    case 20:
                        i++;
                        return [3 /*break*/, 9];
                    case 21:
                        oldVisuals.forEach(function (_a) {
                            var visual = _a.visual;
                            // console.log(label, 'removed unused visual');
                            visual.destroy();
                        });
                        return [3 /*break*/, 43];
                    case 22:
                        if (!(structure && structure !== _structure && Structure.areUnitIdsAndIndicesEqual(structure, _structure))) return [3 /*break*/, 34];
                        // console.log(label, 'structures equivalent but not identical');
                        // Expects that for structures with the same hashCode,
                        // the unitSymmetryGroups are the same as well.
                        // Re-uses existing visuals for the groups of the new structure.
                        _groups = structure.unitSymmetryGroups;
                        i = 0;
                        _e.label = 23;
                    case 23:
                        if (!(i < _groups.length)) return [3 /*break*/, 33];
                        group = _groups[i];
                        visualGroup = visuals.get(group.hashCode);
                        if (!visualGroup) return [3 /*break*/, 29];
                        visual = visualGroup.visual;
                        if (!((_c = visual.mustRecreate) === null || _c === void 0 ? void 0 : _c.call(visual, { group: group, structure: structure }, _props, ctx.webgl))) return [3 /*break*/, 26];
                        visual.destroy();
                        visual = visualCtor(materialId, structure, _props, ctx.webgl);
                        visualGroup.visual = visual;
                        promise = visual.createOrUpdate({ webgl: webgl, runtime: runtime }, _theme, _props, { group: group, structure: structure });
                        if (!promise) return [3 /*break*/, 25];
                        return [4 /*yield*/, promise];
                    case 24:
                        _e.sent();
                        _e.label = 25;
                    case 25:
                        setVisualState(visual, group, _state); // current state for new visual
                        return [3 /*break*/, 28];
                    case 26:
                        promise = visual.createOrUpdate({ webgl: webgl, runtime: runtime }, _theme, _props, { group: group, structure: structure });
                        if (!promise) return [3 /*break*/, 28];
                        return [4 /*yield*/, promise];
                    case 27:
                        _e.sent();
                        _e.label = 28;
                    case 28:
                        visualGroup.group = group;
                        return [3 /*break*/, 30];
                    case 29: throw new Error("expected to find visual for hashCode ".concat(group.hashCode));
                    case 30:
                        if (!runtime.shouldUpdate) return [3 /*break*/, 32];
                        return [4 /*yield*/, runtime.update({ message: 'Creating or updating UnitsVisual', current: i, max: _groups.length })];
                    case 31:
                        _e.sent();
                        _e.label = 32;
                    case 32:
                        i++;
                        return [3 /*break*/, 23];
                    case 33: return [3 /*break*/, 43];
                    case 34:
                        visualsList_1 = [];
                        visuals.forEach(function (vg) { return visualsList_1.push(vg); });
                        i = 0, il = visualsList_1.length;
                        _e.label = 35;
                    case 35:
                        if (!(i < il)) return [3 /*break*/, 43];
                        _a = visualsList_1[i], visual = _a.visual, group = _a.group;
                        if (!((_d = visual.mustRecreate) === null || _d === void 0 ? void 0 : _d.call(visual, { group: group, structure: _structure }, _props, ctx.webgl))) return [3 /*break*/, 38];
                        visual.destroy();
                        visual = visualCtor(materialId, _structure, _props, webgl);
                        visualsList_1[i].visual = visual;
                        promise = visual.createOrUpdate({ webgl: webgl, runtime: runtime }, _theme, _props, { group: group, structure: _structure });
                        if (!promise) return [3 /*break*/, 37];
                        return [4 /*yield*/, promise];
                    case 36:
                        _e.sent();
                        _e.label = 37;
                    case 37:
                        setVisualState(visual, group, _state); // current state for new visual
                        return [3 /*break*/, 40];
                    case 38:
                        promise = visual.createOrUpdate({ webgl: webgl, runtime: runtime }, _theme, _props);
                        if (!promise) return [3 /*break*/, 40];
                        return [4 /*yield*/, promise];
                    case 39:
                        _e.sent();
                        _e.label = 40;
                    case 40:
                        if (!runtime.shouldUpdate) return [3 /*break*/, 42];
                        return [4 /*yield*/, runtime.update({ message: 'Creating or updating UnitsVisual', current: i, max: il })];
                    case 41:
                        _e.sent();
                        _e.label = 42;
                    case 42:
                        ++i;
                        return [3 /*break*/, 35];
                    case 43:
                        // update list of renderObjects
                        renderObjects.length = 0;
                        visuals.forEach(function (_a) {
                            var visual = _a.visual;
                            if (visual.renderObject) {
                                renderObjects.push(visual.renderObject);
                                geometryState.add(visual.renderObject.id, visual.geometryVersion);
                            }
                        });
                        geometryState.snapshot();
                        // set new structure
                        if (structure)
                            _structure = structure;
                        // increment version
                        updated.next(version++);
                        return [2 /*return*/];
                }
            });
        }); });
    }
    function getLoci(pickingId) {
        var loci = EmptyLoci;
        visuals.forEach(function (_a) {
            var visual = _a.visual;
            var _loci = visual.getLoci(pickingId);
            if (!isEmptyLoci(_loci))
                loci = _loci;
        });
        return loci;
    }
    function eachLocation(cb) {
        visuals.forEach(function (_a) {
            var visual = _a.visual;
            visual.eachLocation(cb);
        });
    }
    function getAllLoci() {
        var _a;
        return [Structure.Loci((_a = _structure.child) !== null && _a !== void 0 ? _a : _structure)];
    }
    function mark(loci, action) {
        if (!_structure)
            return false;
        if (!MarkerActions.is(_state.markerActions, action))
            return false;
        if (Structure.isLoci(loci) || StructureElement.Loci.is(loci) || Bond.isLoci(loci)) {
            if (!Structure.areRootsEquivalent(loci.structure, _structure))
                return false;
            // Remap `loci` from equivalent structure to the current `_structure`
            loci = Loci.remap(loci, _structure);
            if (Structure.isLoci(loci) || (StructureElement.Loci.is(loci) && StructureElement.Loci.isWholeStructure(loci))) {
                // Change to `EveryLoci` to allow for downstream optimizations
                loci = EveryLoci;
            }
        }
        else if (!isEveryLoci(loci) && !isDataLoci(loci)) {
            return false;
        }
        if (Loci.isEmpty(loci))
            return false;
        var changed = false;
        visuals.forEach(function (_a) {
            var visual = _a.visual;
            changed = visual.mark(loci, action) || changed;
        });
        return changed;
    }
    function setVisualState(visual, group, state) {
        var visible = state.visible, alphaFactor = state.alphaFactor, pickable = state.pickable, overpaint = state.overpaint, transparency = state.transparency, substance = state.substance, clipping = state.clipping, themeStrength = state.themeStrength, transform = state.transform, unitTransforms = state.unitTransforms;
        if (visible !== undefined)
            visual.setVisibility(visible);
        if (alphaFactor !== undefined)
            visual.setAlphaFactor(alphaFactor);
        if (pickable !== undefined)
            visual.setPickable(pickable);
        if (overpaint !== undefined)
            visual.setOverpaint(overpaint, webgl);
        if (transparency !== undefined)
            visual.setTransparency(transparency, webgl);
        if (substance !== undefined)
            visual.setSubstance(substance, webgl);
        if (clipping !== undefined)
            visual.setClipping(clipping);
        if (themeStrength !== undefined)
            visual.setThemeStrength(themeStrength);
        if (transform !== undefined) {
            if (transform !== _state.transform || !Mat4.areEqual(transform, _state.transform, EPSILON)) {
                visual.setTransform(transform);
            }
        }
        if (unitTransforms !== undefined) {
            if (unitTransforms) {
                // console.log(group.hashCode, unitTransforms.getSymmetryGroupTransforms(group))
                visual.setTransform(undefined, unitTransforms.getSymmetryGroupTransforms(group));
            }
            else if (unitTransforms !== _state.unitTransforms) {
                visual.setTransform(undefined, null);
            }
        }
    }
    function setState(state) {
        var visible = state.visible, alphaFactor = state.alphaFactor, pickable = state.pickable, overpaint = state.overpaint, transparency = state.transparency, substance = state.substance, clipping = state.clipping, themeStrength = state.themeStrength, transform = state.transform, unitTransforms = state.unitTransforms, syncManually = state.syncManually, markerActions = state.markerActions;
        var newState = {};
        if (visible !== undefined)
            newState.visible = visible;
        if (alphaFactor !== undefined)
            newState.alphaFactor = alphaFactor;
        if (pickable !== undefined)
            newState.pickable = pickable;
        if (overpaint !== undefined && _structure) {
            newState.overpaint = Overpaint.remap(overpaint, _structure);
        }
        if (transparency !== undefined && _structure) {
            newState.transparency = Transparency.remap(transparency, _structure);
        }
        if (substance !== undefined && _structure) {
            newState.substance = Substance.remap(substance, _structure);
        }
        if (clipping !== undefined && _structure) {
            newState.clipping = Clipping.remap(clipping, _structure);
        }
        if (themeStrength !== undefined)
            newState.themeStrength = themeStrength;
        if (transform !== undefined && !Mat4.areEqual(transform, _state.transform, EPSILON)) {
            newState.transform = transform;
        }
        if (unitTransforms !== _state.unitTransforms || (unitTransforms === null || unitTransforms === void 0 ? void 0 : unitTransforms.version) !== _state.unitTransformsVersion) {
            newState.unitTransforms = unitTransforms;
            _state.unitTransformsVersion = unitTransforms ? unitTransforms === null || unitTransforms === void 0 ? void 0 : unitTransforms.version : -1;
        }
        if (syncManually !== undefined)
            newState.syncManually = syncManually;
        if (markerActions !== undefined)
            newState.markerActions = markerActions;
        visuals.forEach(function (_a) {
            var visual = _a.visual, group = _a.group;
            return setVisualState(visual, group, newState);
        });
        StructureRepresentationStateBuilder.update(_state, newState);
    }
    function setTheme(theme) {
        _theme = theme;
    }
    function destroy() {
        visuals.forEach(function (_a) {
            var visual = _a.visual;
            return visual.destroy();
        });
        visuals.clear();
    }
    return {
        label: label,
        get groupCount() {
            var groupCount = 0;
            visuals.forEach(function (_a) {
                var visual = _a.visual;
                if (visual.renderObject)
                    groupCount += visual.groupCount;
            });
            return groupCount;
        },
        get geometryVersion() { return geometryState.version; },
        get props() { return _props; },
        get params() { return _params; },
        get state() { return _state; },
        get theme() { return _theme; },
        renderObjects: renderObjects,
        updated: updated,
        createOrUpdate: createOrUpdate,
        setState: setState,
        setTheme: setTheme,
        getLoci: getLoci,
        getAllLoci: getAllLoci,
        eachLocation: eachLocation,
        mark: mark,
        destroy: destroy
    };
}
