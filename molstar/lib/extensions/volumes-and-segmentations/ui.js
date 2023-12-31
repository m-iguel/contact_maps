import { __assign, __awaiter, __extends, __generator, __rest } from "tslib";
import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Copyright (c) 2018-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Adam Midlik <midlik@gmail.com>
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { CollapsableControls } from '../../mol-plugin-ui/base';
import { Button, ControlRow, ExpandGroup, IconButton } from '../../mol-plugin-ui/controls/common';
import * as Icons from '../../mol-plugin-ui/controls/icons';
import { ParameterControls } from '../../mol-plugin-ui/controls/parameters';
import { Slider } from '../../mol-plugin-ui/controls/slider';
import { useBehavior } from '../../mol-plugin-ui/hooks/use-behavior';
import { UpdateTransformControl } from '../../mol-plugin-ui/state/update-transform';
import { shallowEqualArrays } from '../../mol-util';
import { ParamDefinition as PD } from '../../mol-util/param-definition';
import { sleep } from '../../mol-util/sleep';
import { VolsegEntry } from './entry-root';
import { SimpleVolumeParams } from './entry-volume';
import { VolsegGlobalState, VolsegGlobalStateParams } from './global-state';
import { isDefined } from './helpers';
var VolsegUIData;
(function (VolsegUIData) {
    function changeAvailableNodes(data, newNodes) {
        var _a;
        var newActiveNode = newNodes.length > data.availableNodes.length ?
            newNodes[newNodes.length - 1]
            : (_a = newNodes.find(function (node) { var _a; return node.data.ref === ((_a = data.activeNode) === null || _a === void 0 ? void 0 : _a.data.ref); })) !== null && _a !== void 0 ? _a : newNodes[0];
        return __assign(__assign({}, data), { availableNodes: newNodes, activeNode: newActiveNode });
    }
    VolsegUIData.changeAvailableNodes = changeAvailableNodes;
    function changeActiveNode(data, newActiveRef) {
        var _a;
        var newActiveNode = (_a = data.availableNodes.find(function (node) { return node.data.ref === newActiveRef; })) !== null && _a !== void 0 ? _a : data.availableNodes[0];
        return __assign(__assign({}, data), { availableNodes: data.availableNodes, activeNode: newActiveNode });
    }
    VolsegUIData.changeActiveNode = changeActiveNode;
    function equals(data1, data2) {
        return shallowEqualArrays(data1.availableNodes, data2.availableNodes) && data1.activeNode === data2.activeNode && data1.globalState === data2.globalState;
    }
    VolsegUIData.equals = equals;
})(VolsegUIData || (VolsegUIData = {}));
var VolsegUI = /** @class */ (function (_super) {
    __extends(VolsegUI, _super);
    function VolsegUI() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    VolsegUI.prototype.defaultState = function () {
        return {
            header: 'Volume & Segmentation',
            isCollapsed: true,
            brand: { accent: 'orange', svg: Icons.ExtensionSvg },
            data: {
                globalState: undefined,
                availableNodes: [],
                activeNode: undefined,
            }
        };
    };
    VolsegUI.prototype.renderControls = function () {
        var _this = this;
        return _jsx(VolsegControls, { plugin: this.plugin, data: this.state.data, setData: function (d) { return _this.setState({ data: d }); } });
    };
    VolsegUI.prototype.componentDidMount = function () {
        var _this = this;
        this.setState({ isHidden: true, isCollapsed: false });
        this.subscribe(this.plugin.state.data.events.changed, function (e) {
            var _a, _b, _c;
            var nodes = e.state.selectQ(function (q) { return q.ofType(VolsegEntry); }).map(function (cell) { return cell === null || cell === void 0 ? void 0 : cell.obj; }).filter(isDefined);
            var isHidden = nodes.length === 0;
            var newData = VolsegUIData.changeAvailableNodes(_this.state.data, nodes);
            if (!((_a = _this.state.data.globalState) === null || _a === void 0 ? void 0 : _a.isRegistered())) {
                var globalState = (_c = (_b = e.state.selectQ(function (q) { return q.ofType(VolsegGlobalState); })[0]) === null || _b === void 0 ? void 0 : _b.obj) === null || _c === void 0 ? void 0 : _c.data;
                if (globalState)
                    newData.globalState = globalState;
            }
            if (!VolsegUIData.equals(_this.state.data, newData) || _this.state.isHidden !== isHidden) {
                _this.setState({ data: newData, isHidden: isHidden });
            }
        });
    };
    return VolsegUI;
}(CollapsableControls));
export { VolsegUI };
function VolsegControls(_a) {
    var _this = this;
    var _b;
    var plugin = _a.plugin, data = _a.data, setData = _a.setData;
    var entryData = (_b = data.activeNode) === null || _b === void 0 ? void 0 : _b.data;
    if (!entryData) {
        return _jsx("p", { children: "No data!" });
    }
    if (!data.globalState) {
        return _jsx("p", { children: "No global state!" });
    }
    var params = {
        /** Reference to the active VolsegEntry node */
        entry: PD.Select(data.activeNode.data.ref, data.availableNodes.map(function (entry) { return [entry.data.ref, entry.data.entryId]; }))
    };
    var values = {
        entry: data.activeNode.data.ref,
    };
    var globalState = useBehavior(data.globalState.currentState);
    return _jsxs(_Fragment, { children: [_jsx(ParameterControls, { params: params, values: values, onChangeValues: function (next) { return setData(VolsegUIData.changeActiveNode(data, next.entry)); } }), _jsx(ExpandGroup, { header: 'Global options', children: _jsx(WaitingParameterControls, { params: VolsegGlobalStateParams, values: globalState, onChangeValues: function (next) { return __awaiter(_this, void 0, void 0, function () { var _a; return __generator(this, function (_b) {
                        switch (_b.label) {
                            case 0: return [4 /*yield*/, ((_a = data.globalState) === null || _a === void 0 ? void 0 : _a.updateState(plugin, next))];
                            case 1: return [2 /*return*/, _b.sent()];
                        }
                    }); }); } }) }), _jsx(VolsegEntryControls, { entryData: entryData }, entryData.ref)] });
}
function VolsegEntryControls(_a) {
    var _this = this;
    var _b, _c, _d;
    var entryData = _a.entryData;
    var state = useBehavior(entryData.currentState);
    var allSegments = entryData.metadata.allSegments;
    var selectedSegment = entryData.metadata.getSegment(state.selectedSegment);
    var visibleSegments = state.visibleSegments.map(function (seg) { return seg.segmentId; });
    var visibleModels = state.visibleModels.map(function (model) { return model.pdbId; });
    var allPdbs = entryData.pdbs;
    return _jsxs(_Fragment, { children: [_jsx("div", { style: { fontWeight: 'bold', padding: 8, paddingTop: 6, paddingBottom: 4, overflow: 'hidden' }, children: (_c = (_b = entryData.metadata.raw.annotation) === null || _b === void 0 ? void 0 : _b.name) !== null && _c !== void 0 ? _c : 'Unnamed Annotation' }), allPdbs.length > 0 && _jsx(ExpandGroup, { header: 'Fitted models in PDB', initiallyExpanded: true, children: allPdbs.map(function (pdb) {
                    return _jsx(WaitingButton, { onClick: function () { return entryData.actionShowFittedModel(visibleModels.includes(pdb) ? [] : [pdb]); }, style: { fontWeight: visibleModels.includes(pdb) ? 'bold' : undefined, textAlign: 'left', marginTop: 1 }, children: pdb }, pdb);
                }) }), _jsx(VolumeControls, { entryData: entryData }), _jsxs(ExpandGroup, { header: 'Segmentation data', initiallyExpanded: true, children: [_jsx(ControlRow, { label: 'Opacity', control: _jsx(WaitingSlider, { min: 0, max: 1, value: state.segmentOpacity, step: 0.05, onChange: function (v) { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, entryData.actionSetOpacity(v)];
                                    case 1: return [2 /*return*/, _a.sent()];
                                }
                            }); }); } }) }), allSegments.length > 0 && _jsxs(_Fragment, { children: [_jsx(WaitingButton, { onClick: function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, sleep(20)];
                                        case 1:
                                            _a.sent();
                                            return [4 /*yield*/, entryData.actionToggleAllSegments()];
                                        case 2:
                                            _a.sent();
                                            return [2 /*return*/];
                                    }
                                }); }); }, style: { marginTop: 1 }, children: "Toggle All segments" }), _jsx("div", { style: { maxHeight: 200, overflow: 'hidden', overflowY: 'auto', marginBlock: 1 }, children: allSegments.map(function (segment) {
                                    var _a, _b;
                                    return _jsxs("div", { style: { display: 'flex', marginBottom: 1 }, onMouseEnter: function () { return entryData.actionHighlightSegment(segment); }, onMouseLeave: function () { return entryData.actionHighlightSegment(); }, children: [_jsx(Button, { onClick: function () { return entryData.actionSelectSegment(segment !== selectedSegment ? segment.id : undefined); }, style: { fontWeight: segment.id === (selectedSegment === null || selectedSegment === void 0 ? void 0 : selectedSegment.id) ? 'bold' : undefined, marginRight: 1, flexGrow: 1, textAlign: 'left' }, children: _jsxs("div", { title: (_a = segment.biological_annotation.name) !== null && _a !== void 0 ? _a : 'Unnamed segment', style: { maxWidth: 240, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }, children: [(_b = segment.biological_annotation.name) !== null && _b !== void 0 ? _b : 'Unnamed segment', " (", segment.id, ")"] }) }), _jsx(IconButton, { svg: visibleSegments.includes(segment.id) ? Icons.VisibilityOutlinedSvg : Icons.VisibilityOffOutlinedSvg, onClick: function () { return entryData.actionToggleSegment(segment.id); } })] }, segment.id);
                                }) })] })] }), _jsx(ExpandGroup, { header: 'Selected segment annotation', initiallyExpanded: true, children: _jsxs("div", { style: { paddingTop: 4, paddingRight: 8, maxHeight: 300, overflow: 'hidden', overflowY: 'auto' }, children: [!selectedSegment && 'No segment selected', selectedSegment && _jsxs("b", { children: ["Segment ", selectedSegment.id, ":", _jsx("br", {}), (_d = selectedSegment.biological_annotation.name) !== null && _d !== void 0 ? _d : 'Unnamed segment'] }), selectedSegment === null || selectedSegment === void 0 ? void 0 : selectedSegment.biological_annotation.external_references.map(function (ref) {
                            return _jsxs("p", { style: { marginTop: 4 }, children: [_jsxs("small", { children: [ref.resource, ":", ref.accession] }), _jsx("br", {}), _jsx("b", { children: capitalize(ref.label) }), _jsx("br", {}), ref.description] }, ref.id);
                        })] }) })] });
}
function VolumeControls(_a) {
    var _this = this;
    var _b, _c;
    var entryData = _a.entryData;
    var vol = useBehavior(entryData.currentVolume);
    if (!vol)
        return null;
    var volumeValues = {
        volumeType: vol.state.isHidden ? 'off' : (_b = vol.params) === null || _b === void 0 ? void 0 : _b.type.name,
        opacity: (_c = vol.params) === null || _c === void 0 ? void 0 : _c.type.params.alpha,
    };
    return _jsxs(ExpandGroup, { header: 'Volume data', initiallyExpanded: true, children: [_jsx(WaitingParameterControls, { params: SimpleVolumeParams, values: volumeValues, onChangeValues: function (next) { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, sleep(20)];
                        case 1:
                            _a.sent();
                            return [4 /*yield*/, entryData.actionUpdateVolumeVisual(next)];
                        case 2:
                            _a.sent();
                            return [2 /*return*/];
                    }
                }); }); } }), _jsx(ExpandGroup, { header: 'Detailed Volume Params', headerStyle: { marginTop: 1 }, children: _jsx(UpdateTransformControl, { state: entryData.plugin.state.data, transform: vol, customHeader: 'none' }) })] });
}
function WaitingSlider(_a) {
    var value = _a.value, onChange = _a.onChange, etc = __rest(_a, ["value", "onChange"]);
    var _b = useAsyncChange(value), changing = _b[0], sliderValue = _b[1], execute = _b[2];
    return _jsx(Slider, __assign({ value: sliderValue, disabled: changing, onChange: function (newValue) { return execute(onChange, newValue); } }, etc));
}
function WaitingButton(_a) {
    var onClick = _a.onClick, etc = __rest(_a, ["onClick"]);
    var _b = useAsyncChange(undefined), changing = _b[0], _ = _b[1], execute = _b[2];
    return _jsx(Button, __assign({ disabled: changing, onClick: function () { return execute(onClick, undefined); } }, etc, { children: etc.children }));
}
function WaitingParameterControls(_a) {
    var values = _a.values, onChangeValues = _a.onChangeValues, etc = __rest(_a, ["values", "onChangeValues"]);
    var _b = useAsyncChange(values), changing = _b[0], currentValues = _b[1], execute = _b[2];
    return _jsx(ParameterControls, __assign({ isDisabled: changing, values: currentValues, onChangeValues: function (newValue) { return execute(onChangeValues, newValue); } }, etc));
}
function capitalize(text) {
    var first = text.charAt(0);
    var rest = text.slice(1);
    return first.toUpperCase() + rest;
}
function useAsyncChange(initialValue) {
    var _this = this;
    var _a = useState(false), isExecuting = _a[0], setIsExecuting = _a[1];
    var _b = useState(initialValue), value = _b[0], setValue = _b[1];
    var isMounted = useRef(false);
    useEffect(function () { return setValue(initialValue); }, [initialValue]);
    useEffect(function () {
        isMounted.current = true;
        return function () { isMounted.current = false; };
    }, []);
    var execute = useCallback(function (func, val) { return __awaiter(_this, void 0, void 0, function () {
        var err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setIsExecuting(true);
                    setValue(val);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, func(val)];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 5];
                case 3:
                    err_1 = _a.sent();
                    if (isMounted.current) {
                        setValue(initialValue);
                    }
                    throw err_1;
                case 4:
                    if (isMounted.current) {
                        setIsExecuting(false);
                    }
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); }, []);
    return [isExecuting, value, execute];
}
