/**
 * Copyright (c) 2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { __spreadArray } from "tslib";
import { PluginStateObject as SO } from '../../objects';
import { StateObject } from '../../../mol-state';
import { StateTransforms } from '../../transforms';
import { VolumeStreaming } from '../../../mol-plugin/behavior/dynamic/volume-streaming/behavior';
export function buildStructureHierarchy(state, previous) {
    var build = BuildState(state, previous || StructureHierarchy());
    doPreOrder(state.tree, build);
    if (previous)
        previous.refs.forEach(isRemoved, build);
    return { hierarchy: build.hierarchy, added: build.added, changed: build.changed };
}
export function StructureHierarchy() {
    return { trajectories: [], models: [], structures: [], refs: new Map() };
}
function TrajectoryRef(cell) {
    return { kind: 'trajectory', cell: cell, version: cell.transform.version, models: [] };
}
function ModelRef(cell, trajectory) {
    return { kind: 'model', cell: cell, version: cell.transform.version, trajectory: trajectory, structures: [] };
}
function ModelPropertiesRef(cell, model) {
    return { kind: 'model-properties', cell: cell, version: cell.transform.version, model: model };
}
function ModelUnitcellRef(cell, model) {
    return { kind: 'model-unitcell', cell: cell, version: cell.transform.version, model: model };
}
function StructureRef(cell, model) {
    return { kind: 'structure', cell: cell, version: cell.transform.version, model: model, components: [] };
}
function StructurePropertiesRef(cell, structure) {
    return { kind: 'structure-properties', cell: cell, version: cell.transform.version, structure: structure };
}
function StructureTransformRef(cell, structure) {
    return { kind: 'structure-transform', cell: cell, version: cell.transform.version, structure: structure };
}
function StructureVolumeStreamingRef(cell, structure) {
    return { kind: 'structure-volume-streaming', cell: cell, version: cell.transform.version, structure: structure };
}
function componentKey(cell) {
    if (!cell.transform.tags)
        return cell.transform.ref;
    return __spreadArray([], cell.transform.tags, true).sort().join();
}
function StructureComponentRef(cell, structure) {
    return { kind: 'structure-component', cell: cell, version: cell.transform.version, structure: structure, key: componentKey(cell), representations: [] };
}
function StructureRepresentationRef(cell, component) {
    return { kind: 'structure-representation', cell: cell, version: cell.transform.version, component: component };
}
function GenericRepresentationRef(cell, parent) {
    return { kind: 'generic-representation', cell: cell, version: cell.transform.version, parent: parent };
}
function BuildState(state, oldHierarchy) {
    return { state: state, oldHierarchy: oldHierarchy, hierarchy: StructureHierarchy(), changed: false, added: new Set() };
}
function createOrUpdateRefList(state, cell, list, ctor) {
    var args = [];
    for (var _i = 4; _i < arguments.length; _i++) {
        args[_i - 4] = arguments[_i];
    }
    var ref = ctor.apply(void 0, args);
    list.push(ref);
    state.hierarchy.refs.set(cell.transform.ref, ref);
    var old = state.oldHierarchy.refs.get(cell.transform.ref);
    if (old) {
        if (old.version !== cell.transform.version)
            state.changed = true;
    }
    else {
        state.added.add(ref.cell.transform.ref);
        state.changed = true;
    }
    return ref;
}
function createOrUpdateRef(state, cell, ctor) {
    var args = [];
    for (var _i = 3; _i < arguments.length; _i++) {
        args[_i - 3] = arguments[_i];
    }
    var ref = ctor.apply(void 0, args);
    state.hierarchy.refs.set(cell.transform.ref, ref);
    var old = state.oldHierarchy.refs.get(cell.transform.ref);
    if (old) {
        if (old.version !== cell.transform.version)
            state.changed = true;
    }
    else {
        state.added.add(ref.cell.transform.ref);
        state.changed = true;
    }
    return ref;
}
function isType(t) {
    return function (cell) { return t.is(cell.obj); };
}
function isTypeRoot(t, target) {
    return function (cell, state) { return !target(state) && t.is(cell.obj); };
}
function isTransformer(t) {
    return function (cell) { return cell.transform.transformer === t; };
}
function noop() { }
var Mapping = [
    // Trajectory
    [isType(SO.Molecule.Trajectory), function (state, cell) {
            state.currentTrajectory = createOrUpdateRefList(state, cell, state.hierarchy.trajectories, TrajectoryRef, cell);
        }, function (state) { return state.currentTrajectory = void 0; }],
    // Model
    [isTypeRoot(SO.Molecule.Model, function (s) { return s.currentModel; }), function (state, cell) {
            if (state.currentTrajectory) {
                state.currentModel = createOrUpdateRefList(state, cell, state.currentTrajectory.models, ModelRef, cell, state.currentTrajectory);
            }
            else {
                state.currentModel = createOrUpdateRef(state, cell, ModelRef, cell);
            }
            state.hierarchy.models.push(state.currentModel);
        }, function (state) { return state.currentModel = void 0; }],
    [isTransformer(StateTransforms.Model.CustomModelProperties), function (state, cell) {
            if (!state.currentModel)
                return false;
            state.currentModel.properties = createOrUpdateRef(state, cell, ModelPropertiesRef, cell, state.currentModel);
        }, noop],
    [isTransformer(StateTransforms.Representation.ModelUnitcell3D), function (state, cell) {
            if (!state.currentModel)
                return false;
            state.currentModel.unitcell = createOrUpdateRef(state, cell, ModelUnitcellRef, cell, state.currentModel);
        }, noop],
    // Structure
    [isTypeRoot(SO.Molecule.Structure, function (s) { return s.currentStructure; }), function (state, cell) {
            if (state.currentModel) {
                state.currentStructure = createOrUpdateRefList(state, cell, state.currentModel.structures, StructureRef, cell, state.currentModel);
            }
            else {
                state.currentStructure = createOrUpdateRef(state, cell, StructureRef, cell);
            }
            state.hierarchy.structures.push(state.currentStructure);
        }, function (state) { return state.currentStructure = void 0; }],
    [isTransformer(StateTransforms.Model.CustomStructureProperties), function (state, cell) {
            if (!state.currentStructure)
                return false;
            state.currentStructure.properties = createOrUpdateRef(state, cell, StructurePropertiesRef, cell, state.currentStructure);
        }, noop],
    [isTransformer(StateTransforms.Model.TransformStructureConformation), function (state, cell) {
            if (!state.currentStructure)
                return false;
            state.currentStructure.transform = createOrUpdateRef(state, cell, StructureTransformRef, cell, state.currentStructure);
        }, noop],
    // Volume Streaming
    [isType(VolumeStreaming), function (state, cell) {
            if (!state.currentStructure)
                return false;
            state.currentStructure.volumeStreaming = createOrUpdateRef(state, cell, StructureVolumeStreamingRef, cell, state.currentStructure);
            // Do not continue into VolumeStreaming subtree.
            return false;
        }, noop],
    // Component
    [function (cell, state) {
            if (state.currentComponent || !state.currentStructure || cell.transform.transformer.definition.isDecorator)
                return false;
            return SO.Molecule.Structure.is(cell.obj);
        }, function (state, cell) {
            if (state.currentStructure) {
                state.currentComponent = createOrUpdateRefList(state, cell, state.currentStructure.components, StructureComponentRef, cell, state.currentStructure);
            }
        }, function (state) { return state.currentComponent = void 0; }],
    // Component Representation
    [function (cell, state) {
            return !cell.state.isGhost && !!state.currentComponent && SO.Molecule.Structure.Representation3D.is(cell.obj);
        }, function (state, cell) {
            if (state.currentComponent) {
                createOrUpdateRefList(state, cell, state.currentComponent.representations, StructureRepresentationRef, cell, state.currentComponent);
            }
            // Nothing useful down the line
            return false;
        }, noop],
    // Generic Representation
    [function (cell) { return !cell.state.isGhost && SO.isRepresentation3D(cell.obj); }, function (state, cell) {
            var genericTarget = state.currentComponent || state.currentStructure || state.currentModel;
            if (genericTarget) {
                if (!genericTarget.genericRepresentations)
                    genericTarget.genericRepresentations = [];
                createOrUpdateRefList(state, cell, genericTarget.genericRepresentations, GenericRepresentationRef, cell, genericTarget);
            }
        }, noop],
];
function isValidCell(cell) {
    if (!cell || !(cell === null || cell === void 0 ? void 0 : cell.parent) || !cell.parent.cells.has(cell.transform.ref))
        return false;
    var obj = cell.obj;
    if (!obj || obj === StateObject.Null || (cell.status !== 'ok' && cell.status !== 'error'))
        return false;
    return true;
}
function isRemoved(ref) {
    var cell = ref.cell;
    if (isValidCell(cell))
        return;
    this.changed = true;
}
function _preOrderFunc(c) { _doPreOrder(this, this.tree.transforms.get(c)); }
function _doPreOrder(ctx, root) {
    var state = ctx.state;
    var cell = state.state.cells.get(root.ref);
    if (!isValidCell(cell))
        return;
    var onLeave = void 0;
    var end = false;
    for (var _i = 0, Mapping_1 = Mapping; _i < Mapping_1.length; _i++) {
        var _a = Mapping_1[_i], test_1 = _a[0], f = _a[1], l = _a[2];
        if (test_1(cell, state)) {
            var cont = f(state, cell);
            if (cont === false) {
                end = true;
                break;
            }
            onLeave = l;
            break;
        }
    }
    // TODO: might be needed in the future
    // const { currentComponent, currentModel, currentStructure, currentTrajectory } = ctx.state;
    // const inTrackedSubtree = currentComponent || currentModel || currentStructure || currentTrajectory;
    // if (inTrackedSubtree && cell.transform.transformer.definition.isDecorator) {
    //     const ref = cell.transform.ref;
    //     const old = ctx.state.oldHierarchy.decorators.get(ref);
    //     if (old && old.version !== cell.transform.version) {
    //         ctx.state.changed = true;
    //     }
    //     ctx.state.hierarchy.decorators.set(cell.transform.ref, cell.transform);
    // }
    if (end)
        return;
    var children = ctx.tree.children.get(root.ref);
    if (children && children.size) {
        children.forEach(_preOrderFunc, ctx);
    }
    if (onLeave)
        onLeave(state);
}
function doPreOrder(tree, state) {
    var ctx = { tree: tree, state: state };
    _doPreOrder(ctx, tree.root);
    return ctx.state;
}
