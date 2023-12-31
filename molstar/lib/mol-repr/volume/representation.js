/**
 * Copyright (c) 2018-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { __assign, __awaiter, __generator } from "tslib";
import { ParamDefinition as PD } from '../../mol-util/param-definition';
import { Visual } from '../visual';
import { Volume } from '../../mol-model/volume';
import { Geometry } from '../../mol-geo/geometry/geometry';
import { Theme } from '../../mol-theme/theme';
import { createIdentityTransform } from '../../mol-geo/geometry/transform-data';
import { createRenderObject, getNextMaterialId } from '../../mol-gl/render-object';
import { isEveryLoci, EmptyLoci, isEmptyLoci } from '../../mol-model/loci';
import { Interval, SortedArray } from '../../mol-data/int';
import { getQualityProps, VisualUpdateState } from '../util';
import { ColorTheme } from '../../mol-theme/color';
import { ValueCell } from '../../mol-util';
import { createSizes } from '../../mol-geo/geometry/size-data';
import { createColors } from '../../mol-geo/geometry/color-data';
import { EPSILON, Mat4 } from '../../mol-math/linear-algebra';
import { Representation } from '../representation';
import { BaseGeometry } from '../../mol-geo/geometry/base';
import { Subject } from 'rxjs';
import { Task } from '../../mol-task';
import { isPromiseLike } from '../../mol-util/type-helpers';
import { createMarkers } from '../../mol-geo/geometry/marker-data';
function createVolumeRenderObject(volume, geometry, locationIt, theme, props, materialId) {
    var _a = Geometry.getUtils(geometry), createValues = _a.createValues, createRenderableState = _a.createRenderableState;
    var transform = createIdentityTransform();
    var values = createValues(geometry, transform, locationIt, theme, props);
    var state = createRenderableState(props);
    return createRenderObject(geometry.kind, values, state, materialId);
}
export function VolumeVisual(builder, materialId) {
    var defaultProps = builder.defaultProps, createGeometry = builder.createGeometry, createLocationIterator = builder.createLocationIterator, getLoci = builder.getLoci, eachLocation = builder.eachLocation, setUpdateState = builder.setUpdateState, mustRecreate = builder.mustRecreate, dispose = builder.dispose;
    var _a = builder.geometryUtils, updateValues = _a.updateValues, updateBoundingSphere = _a.updateBoundingSphere, updateRenderableState = _a.updateRenderableState, createPositionIterator = _a.createPositionIterator;
    var updateState = VisualUpdateState.create();
    var renderObject;
    var newProps;
    var newTheme;
    var newVolume;
    var newKey;
    var currentProps = Object.assign({}, defaultProps);
    var currentTheme = Theme.createEmpty();
    var currentVolume;
    var currentKey;
    var geometry;
    var geometryVersion = -1;
    var locationIt;
    var positionIt;
    function prepareUpdate(theme, props, volume, key) {
        if (!volume && !currentVolume) {
            throw new Error('missing volume');
        }
        newProps = Object.assign({}, currentProps, props);
        newTheme = theme;
        newVolume = volume;
        newKey = key;
        VisualUpdateState.reset(updateState);
        if (!renderObject) {
            updateState.createNew = true;
        }
        else if (!Volume.areEquivalent(newVolume, currentVolume) || newKey !== currentKey) {
            updateState.createNew = true;
        }
        if (updateState.createNew) {
            updateState.createGeometry = true;
            return;
        }
        setUpdateState(updateState, volume, newProps, currentProps, newTheme, currentTheme);
        if (!ColorTheme.areEqual(theme.color, currentTheme.color))
            updateState.updateColor = true;
        if (updateState.createGeometry) {
            updateState.updateColor = true;
        }
        if (newProps.instanceGranularity !== currentProps.instanceGranularity) {
            updateState.updateTransform = true;
        }
    }
    function update(newGeometry) {
        if (updateState.createNew) {
            locationIt = createLocationIterator(newVolume, newKey);
            if (newGeometry) {
                renderObject = createVolumeRenderObject(newVolume, newGeometry, locationIt, newTheme, newProps, materialId);
                positionIt = createPositionIterator(newGeometry, renderObject.values);
            }
            else {
                throw new Error('expected geometry to be given');
            }
        }
        else {
            if (!renderObject) {
                throw new Error('expected renderObject to be available');
            }
            if (updateState.updateTransform) {
                // console.log('update transform');
                locationIt = createLocationIterator(newVolume, newKey);
                var instanceCount = locationIt.instanceCount, groupCount = locationIt.groupCount;
                if (newProps.instanceGranularity) {
                    createMarkers(instanceCount, 'instance', renderObject.values);
                }
                else {
                    createMarkers(instanceCount * groupCount, 'groupInstance', renderObject.values);
                }
            }
            else {
                locationIt.reset();
            }
            if (updateState.createGeometry) {
                if (newGeometry) {
                    ValueCell.updateIfChanged(renderObject.values.drawCount, Geometry.getDrawCount(newGeometry));
                    ValueCell.updateIfChanged(renderObject.values.uVertexCount, Geometry.getVertexCount(newGeometry));
                    ValueCell.updateIfChanged(renderObject.values.uGroupCount, Geometry.getGroupCount(newGeometry));
                }
                else {
                    throw new Error('expected geometry to be given');
                }
            }
            if (updateState.updateTransform || updateState.createGeometry) {
                updateBoundingSphere(renderObject.values, newGeometry || geometry);
                positionIt = createPositionIterator(newGeometry || geometry, renderObject.values);
            }
            if (updateState.updateSize) {
                // not all geometries have size data, so check here
                if ('uSize' in renderObject.values) {
                    createSizes(locationIt, newTheme.size, renderObject.values);
                }
            }
            if (updateState.updateColor) {
                createColors(locationIt, positionIt, newTheme.color, renderObject.values);
            }
            updateValues(renderObject.values, newProps);
            updateRenderableState(renderObject.state, newProps);
        }
        currentProps = newProps;
        currentTheme = newTheme;
        currentVolume = newVolume;
        currentKey = newKey;
        if (newGeometry) {
            geometry = newGeometry;
            geometryVersion += 1;
        }
    }
    function eachInstance(loci, volume, key, apply) {
        var changed = false;
        if (Volume.Cell.isLoci(loci)) {
            if (Volume.Cell.isLociEmpty(loci))
                return false;
            if (!Volume.areEquivalent(loci.volume, volume))
                return false;
            if (apply(Interval.ofSingleton(0)))
                changed = true;
        }
        else if (Volume.Segment.isLoci(loci)) {
            if (Volume.Segment.isLociEmpty(loci))
                return false;
            if (!Volume.areEquivalent(loci.volume, volume))
                return false;
            if (!SortedArray.has(loci.segments, key))
                return false;
            if (apply(Interval.ofSingleton(0)))
                changed = true;
        }
        return changed;
    }
    function lociApply(loci, apply) {
        if (isEveryLoci(loci)) {
            if (currentProps.instanceGranularity) {
                return apply(Interval.ofBounds(0, locationIt.instanceCount));
            }
            else {
                return apply(Interval.ofBounds(0, locationIt.groupCount * locationIt.instanceCount));
            }
        }
        else {
            if (currentProps.instanceGranularity) {
                return eachInstance(loci, currentVolume, currentKey, apply);
            }
            else {
                return eachLocation(loci, currentVolume, currentKey, currentProps, apply);
            }
        }
    }
    return {
        get groupCount() { return locationIt ? locationIt.count : 0; },
        get renderObject() { return renderObject; },
        get geometryVersion() { return geometryVersion; },
        createOrUpdate: function (ctx, theme, props, volumeKey) {
            if (props === void 0) { props = {}; }
            return __awaiter(this, void 0, void 0, function () {
                var newGeometry;
                return __generator(this, function (_a) {
                    prepareUpdate(theme, props, (volumeKey === null || volumeKey === void 0 ? void 0 : volumeKey.volume) || currentVolume, (volumeKey === null || volumeKey === void 0 ? void 0 : volumeKey.key) || currentKey);
                    if (updateState.createGeometry) {
                        newGeometry = createGeometry(ctx, newVolume, newKey, newTheme, newProps, geometry);
                        return [2 /*return*/, isPromiseLike(newGeometry) ? newGeometry.then(update) : update(newGeometry)];
                    }
                    else {
                        update();
                    }
                    return [2 /*return*/];
                });
            });
        },
        getLoci: function (pickingId) {
            return renderObject ? getLoci(pickingId, currentVolume, currentKey, currentProps, renderObject.id) : EmptyLoci;
        },
        eachLocation: function (cb) {
            locationIt.reset();
            while (locationIt.hasNext) {
                var _a = locationIt.move(), location_1 = _a.location, isSecondary = _a.isSecondary;
                cb(location_1, isSecondary);
            }
        },
        mark: function (loci, action) {
            return Visual.mark(renderObject, loci, action, lociApply);
        },
        setVisibility: function (visible) {
            Visual.setVisibility(renderObject, visible);
        },
        setAlphaFactor: function (alphaFactor) {
            Visual.setAlphaFactor(renderObject, alphaFactor);
        },
        setPickable: function (pickable) {
            Visual.setPickable(renderObject, pickable);
        },
        setColorOnly: function (colorOnly) {
            Visual.setColorOnly(renderObject, colorOnly);
        },
        setTransform: function (matrix, instanceMatrices) {
            Visual.setTransform(renderObject, matrix, instanceMatrices);
        },
        setOverpaint: function (overpaint) {
            return Visual.setOverpaint(renderObject, overpaint, lociApply, true);
        },
        setTransparency: function (transparency) {
            return Visual.setTransparency(renderObject, transparency, lociApply, true);
        },
        setSubstance: function (substance) {
            return Visual.setSubstance(renderObject, substance, lociApply, true);
        },
        setClipping: function (clipping) {
            return Visual.setClipping(renderObject, clipping, lociApply, true);
        },
        setThemeStrength: function (strength) {
            Visual.setThemeStrength(renderObject, strength);
        },
        destroy: function () {
            dispose === null || dispose === void 0 ? void 0 : dispose(geometry);
            if (renderObject) {
                renderObject.state.disposed = true;
                renderObject = undefined;
            }
        },
        mustRecreate: mustRecreate
    };
}
export function VolumeRepresentationProvider(p) { return p; }
//
export var VolumeParams = __assign({}, BaseGeometry.Params);
export function VolumeRepresentation(label, ctx, getParams, visualCtor, getLoci, getKeys) {
    if (getKeys === void 0) { getKeys = function () { return [-1]; }; }
    var version = 0;
    var webgl = ctx.webgl;
    var updated = new Subject();
    var geometryState = new Representation.GeometryState();
    var materialId = getNextMaterialId();
    var renderObjects = [];
    var _state = Representation.createState();
    var visuals = new Map();
    var _volume;
    var _keys;
    var _params;
    var _props;
    var _theme = Theme.createEmpty();
    function visual(runtime, key) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var visual;
            return __generator(this, function (_b) {
                visual = visuals.get(key);
                if (!visual) {
                    visual = visualCtor(materialId, _volume, key, _props, webgl);
                    visuals.set(key, visual);
                }
                else if ((_a = visual.mustRecreate) === null || _a === void 0 ? void 0 : _a.call(visual, { volume: _volume, key: key }, _props, webgl)) {
                    visual.destroy();
                    visual = visualCtor(materialId, _volume, key, _props, webgl);
                    visuals.set(key, visual);
                }
                return [2 /*return*/, visual.createOrUpdate({ webgl: webgl, runtime: runtime }, _theme, _props, { volume: _volume, key: key })];
            });
        });
    }
    function createOrUpdate(props, volume) {
        var _this = this;
        if (props === void 0) { props = {}; }
        if (volume && volume !== _volume) {
            _params = getParams(ctx, volume);
            _volume = volume;
            if (!_props)
                _props = PD.getDefaultValues(_params);
        }
        var qualityProps = getQualityProps(Object.assign({}, _props, props), _volume);
        Object.assign(_props, props, qualityProps);
        _keys = getKeys(_props);
        return Task.create('Creating or updating VolumeRepresentation', function (runtime) { return __awaiter(_this, void 0, void 0, function () {
            var toDelete, i, il, segment, promise;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        toDelete = new Set(visuals.keys());
                        i = 0, il = _keys.length;
                        _a.label = 1;
                    case 1:
                        if (!(i < il)) return [3 /*break*/, 4];
                        segment = _keys[i];
                        toDelete.delete(segment);
                        promise = visual(runtime, segment);
                        if (!promise) return [3 /*break*/, 3];
                        return [4 /*yield*/, promise];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        ++i;
                        return [3 /*break*/, 1];
                    case 4:
                        toDelete.forEach(function (segment) {
                            var _a;
                            (_a = visuals.get(segment)) === null || _a === void 0 ? void 0 : _a.destroy();
                            visuals.delete(segment);
                        });
                        // update list of renderObjects
                        renderObjects.length = 0;
                        visuals.forEach(function (visual) {
                            if (visual.renderObject) {
                                renderObjects.push(visual.renderObject);
                                geometryState.add(visual.renderObject.id, visual.geometryVersion);
                            }
                        });
                        geometryState.snapshot();
                        // increment version
                        updated.next(version++);
                        return [2 /*return*/];
                }
            });
        }); });
    }
    function mark(loci, action) {
        var changed = false;
        visuals.forEach(function (visual) {
            changed = visual.mark(loci, action) || changed;
        });
        return changed;
    }
    function setVisualState(visual, state) {
        if (state.visible !== undefined && visual)
            visual.setVisibility(state.visible);
        if (state.alphaFactor !== undefined && visual)
            visual.setAlphaFactor(state.alphaFactor);
        if (state.pickable !== undefined && visual)
            visual.setPickable(state.pickable);
        if (state.overpaint !== undefined && visual)
            visual.setOverpaint(state.overpaint);
        if (state.transparency !== undefined && visual)
            visual.setTransparency(state.transparency);
        if (state.substance !== undefined && visual)
            visual.setSubstance(state.substance);
        if (state.clipping !== undefined && visual)
            visual.setClipping(state.clipping);
        if (state.transform !== undefined && visual)
            visual.setTransform(state.transform);
        if (state.themeStrength !== undefined && visual)
            visual.setThemeStrength(state.themeStrength);
    }
    function setState(state) {
        var visible = state.visible, alphaFactor = state.alphaFactor, pickable = state.pickable, overpaint = state.overpaint, transparency = state.transparency, substance = state.substance, clipping = state.clipping, transform = state.transform, themeStrength = state.themeStrength, syncManually = state.syncManually, markerActions = state.markerActions;
        var newState = {};
        if (visible !== undefined)
            newState.visible = visible;
        if (alphaFactor !== undefined)
            newState.alphaFactor = alphaFactor;
        if (pickable !== undefined)
            newState.pickable = pickable;
        if (overpaint !== undefined)
            newState.overpaint = overpaint;
        if (transparency !== undefined)
            newState.transparency = transparency;
        if (substance !== undefined)
            newState.substance = substance;
        if (clipping !== undefined)
            newState.clipping = clipping;
        if (themeStrength !== undefined)
            newState.themeStrength = themeStrength;
        if (transform !== undefined && !Mat4.areEqual(transform, _state.transform, EPSILON)) {
            newState.transform = transform;
        }
        if (syncManually !== undefined)
            newState.syncManually = syncManually;
        if (markerActions !== undefined)
            newState.markerActions = markerActions;
        visuals.forEach(function (visual) { return setVisualState(visual, newState); });
        Representation.updateState(_state, state);
    }
    function setTheme(theme) {
        _theme = theme;
    }
    function destroy() {
        visuals.forEach(function (visual) { return visual.destroy(); });
        visuals.clear();
    }
    return {
        label: label,
        get groupCount() {
            var groupCount = 0;
            visuals.forEach(function (visual) {
                if (visual.renderObject)
                    groupCount += visual.groupCount;
            });
            return groupCount;
        },
        get props() { return _props; },
        get params() { return _params; },
        get state() { return _state; },
        get theme() { return _theme; },
        get geometryVersion() { return geometryState.version; },
        renderObjects: renderObjects,
        updated: updated,
        createOrUpdate: createOrUpdate,
        setState: setState,
        setTheme: setTheme,
        getLoci: function (pickingId) {
            var loci = EmptyLoci;
            visuals.forEach(function (visual) {
                var _loci = visual.getLoci(pickingId);
                if (!isEmptyLoci(_loci))
                    loci = _loci;
            });
            return loci;
        },
        getAllLoci: function () {
            return [getLoci(_volume, _props)];
        },
        eachLocation: function (cb) {
            visuals.forEach(function (visual) {
                visual.eachLocation(cb);
            });
        },
        mark: mark,
        destroy: destroy
    };
}
