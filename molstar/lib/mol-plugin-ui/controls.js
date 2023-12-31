import { __awaiter, __extends, __generator } from "tslib";
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { UpdateTrajectory } from '../mol-plugin-state/actions/structure';
import { StateTransforms } from '../mol-plugin-state/transforms';
import { PluginCommands } from '../mol-plugin/commands';
import { PluginUIComponent } from './base';
import { IconButton } from './controls/common';
import { Icon, NavigateBeforeSvg, NavigateNextSvg, SkipPreviousSvg, StopSvg, PlayArrowSvg, SubscriptionsOutlinedSvg, BuildSvg } from './controls/icons';
import { AnimationControls } from './state/animation';
import { StructureComponentControls } from './structure/components';
import { StructureMeasurementsControls } from './structure/measurements';
import { StructureSelectionActionsControls } from './structure/selection';
import { StructureSourceControls } from './structure/source';
import { VolumeStreamingControls, VolumeSourceControls } from './structure/volume';
import { PluginConfig } from '../mol-plugin/config';
import { StructureSuperpositionControls } from './structure/superposition';
import { StructureQuickStylesControls } from './structure/quick-styles';
var TrajectoryViewportControls = /** @class */ (function (_super) {
    __extends(TrajectoryViewportControls, _super);
    function TrajectoryViewportControls() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.state = { show: false, label: '' };
        _this.update = function () {
            var state = _this.plugin.state.data;
            var models = state.selectQ(function (q) { return q.ofTransformer(StateTransforms.Model.ModelFromTrajectory); });
            if (models.length === 0) {
                _this.setState({ show: false });
                return;
            }
            var label = '', count = 0;
            var parents = new Set();
            for (var _i = 0, models_1 = models; _i < models_1.length; _i++) {
                var m = models_1[_i];
                if (!m.sourceRef)
                    continue;
                var parent_1 = state.cells.get(m.sourceRef).obj;
                if (!parent_1)
                    continue;
                if (parent_1.data.frameCount > 1) {
                    if (parents.has(m.sourceRef)) {
                        // do not show the controls if there are 2 models of the same trajectory present
                        _this.setState({ show: false });
                        return;
                    }
                    parents.add(m.sourceRef);
                    count++;
                    if (!label) {
                        var idx = m.transform.params.modelIndex;
                        label = "Model ".concat(idx + 1, " / ").concat(parent_1.data.frameCount);
                    }
                }
            }
            if (count > 1)
                label = '';
            _this.setState({ show: count > 0, label: label });
        };
        _this.reset = function () { return PluginCommands.State.ApplyAction(_this.plugin, {
            state: _this.plugin.state.data,
            action: UpdateTrajectory.create({ action: 'reset' })
        }); };
        _this.prev = function () { return PluginCommands.State.ApplyAction(_this.plugin, {
            state: _this.plugin.state.data,
            action: UpdateTrajectory.create({ action: 'advance', by: -1 })
        }); };
        _this.next = function () { return PluginCommands.State.ApplyAction(_this.plugin, {
            state: _this.plugin.state.data,
            action: UpdateTrajectory.create({ action: 'advance', by: 1 })
        }); };
        return _this;
    }
    TrajectoryViewportControls.prototype.componentDidMount = function () {
        this.subscribe(this.plugin.state.data.events.changed, this.update);
        this.subscribe(this.plugin.behaviors.state.isAnimating, this.update);
    };
    TrajectoryViewportControls.prototype.render = function () {
        var isAnimating = this.plugin.behaviors.state.isAnimating.value;
        if (!this.state.show || (isAnimating && !this.state.label) || !this.plugin.config.get(PluginConfig.Viewport.ShowTrajectoryControls))
            return null;
        return _jsxs("div", { className: 'msp-traj-controls', children: [!isAnimating && _jsx(IconButton, { svg: SkipPreviousSvg, title: 'First Model', onClick: this.reset, disabled: isAnimating }), !isAnimating && _jsx(IconButton, { svg: NavigateBeforeSvg, title: 'Previous Model', onClick: this.prev, disabled: isAnimating }), !isAnimating && _jsx(IconButton, { svg: NavigateNextSvg, title: 'Next Model', onClick: this.next, disabled: isAnimating }), !!this.state.label && _jsx("span", { children: this.state.label })] });
    };
    return TrajectoryViewportControls;
}(PluginUIComponent));
export { TrajectoryViewportControls };
var StateSnapshotViewportControls = /** @class */ (function (_super) {
    __extends(StateSnapshotViewportControls, _super);
    function StateSnapshotViewportControls() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.state = { isBusy: false, show: true };
        _this.keyUp = function (e) {
            if (!e.ctrlKey || _this.state.isBusy || e.target !== document.body)
                return;
            var snapshots = _this.plugin.managers.snapshot;
            if (e.keyCode === 37 || e.key === 'ArrowLeft') {
                if (snapshots.state.isPlaying)
                    snapshots.stop();
                _this.prev();
            }
            else if (e.keyCode === 38 || e.key === 'ArrowUp') {
                if (snapshots.state.isPlaying)
                    snapshots.stop();
                if (snapshots.state.entries.size === 0)
                    return;
                var e_1 = snapshots.state.entries.get(0);
                _this.update(e_1.snapshot.id);
            }
            else if (e.keyCode === 39 || e.key === 'ArrowRight') {
                if (snapshots.state.isPlaying)
                    snapshots.stop();
                _this.next();
            }
            else if (e.keyCode === 40 || e.key === 'ArrowDown') {
                if (snapshots.state.isPlaying)
                    snapshots.stop();
                if (snapshots.state.entries.size === 0)
                    return;
                var e_2 = snapshots.state.entries.get(snapshots.state.entries.size - 1);
                _this.update(e_2.snapshot.id);
            }
        };
        _this.change = function (e) {
            if (e.target.value === 'none')
                return;
            _this.update(e.target.value);
        };
        _this.prev = function () {
            var s = _this.plugin.managers.snapshot;
            var id = s.getNextId(s.state.current, -1);
            if (id)
                _this.update(id);
        };
        _this.next = function () {
            var s = _this.plugin.managers.snapshot;
            var id = s.getNextId(s.state.current, 1);
            if (id)
                _this.update(id);
        };
        _this.togglePlay = function () {
            _this.plugin.managers.snapshot.togglePlay();
        };
        return _this;
    }
    StateSnapshotViewportControls.prototype.componentDidMount = function () {
        var _this = this;
        // TODO: this needs to be diabled when the state is updating!
        this.subscribe(this.plugin.managers.snapshot.events.changed, function () { return _this.forceUpdate(); });
        this.subscribe(this.plugin.behaviors.state.isBusy, function (isBusy) { return _this.setState({ isBusy: isBusy }); });
        this.subscribe(this.plugin.behaviors.state.isAnimating, function (isBusy) { return _this.setState({ isBusy: isBusy }); });
        window.addEventListener('keyup', this.keyUp, false);
    };
    StateSnapshotViewportControls.prototype.componentWillUnmount = function () {
        _super.prototype.componentWillUnmount.call(this);
        window.removeEventListener('keyup', this.keyUp, false);
    };
    StateSnapshotViewportControls.prototype.update = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.setState({ isBusy: true });
                        return [4 /*yield*/, PluginCommands.State.Snapshots.Apply(this.plugin, { id: id })];
                    case 1:
                        _a.sent();
                        this.setState({ isBusy: false });
                        return [2 /*return*/];
                }
            });
        });
    };
    StateSnapshotViewportControls.prototype.render = function () {
        var snapshots = this.plugin.managers.snapshot;
        var count = snapshots.state.entries.size;
        if (count < 2 || !this.state.show) {
            return null;
        }
        var current = snapshots.state.current;
        var isPlaying = snapshots.state.isPlaying;
        return _jsxs("div", { className: 'msp-state-snapshot-viewport-controls', children: [_jsxs("select", { className: 'msp-form-control', value: current || 'none', onChange: this.change, disabled: this.state.isBusy || isPlaying, children: [!current && _jsx("option", { value: 'none' }, 'none'), snapshots.state.entries.valueSeq().map(function (e, i) { return _jsxs("option", { value: e.snapshot.id, children: ["[".concat(i + 1, "/").concat(count, "]"), " ", e.name || new Date(e.timestamp).toLocaleString()] }, e.snapshot.id); })] }), _jsx(IconButton, { svg: isPlaying ? StopSvg : PlayArrowSvg, title: isPlaying ? 'Pause' : 'Cycle States', onClick: this.togglePlay, disabled: isPlaying ? false : this.state.isBusy }), !isPlaying && _jsxs(_Fragment, { children: [_jsx(IconButton, { svg: NavigateBeforeSvg, title: 'Previous State', onClick: this.prev, disabled: this.state.isBusy || isPlaying }), _jsx(IconButton, { svg: NavigateNextSvg, title: 'Next State', onClick: this.next, disabled: this.state.isBusy || isPlaying })] })] });
    };
    return StateSnapshotViewportControls;
}(PluginUIComponent));
export { StateSnapshotViewportControls };
var AnimationViewportControls = /** @class */ (function (_super) {
    __extends(AnimationViewportControls, _super);
    function AnimationViewportControls() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.state = { isEmpty: true, isExpanded: false, isBusy: false, isAnimating: false, isPlaying: false };
        _this.toggleExpanded = function () { return _this.setState({ isExpanded: !_this.state.isExpanded }); };
        _this.stop = function () {
            _this.plugin.managers.animation.stop();
            _this.plugin.managers.snapshot.stop();
        };
        return _this;
    }
    AnimationViewportControls.prototype.componentDidMount = function () {
        var _this = this;
        this.subscribe(this.plugin.managers.snapshot.events.changed, function () {
            if (_this.plugin.managers.snapshot.state.isPlaying)
                _this.setState({ isPlaying: true, isExpanded: false });
            else
                _this.setState({ isPlaying: false });
        });
        this.subscribe(this.plugin.behaviors.state.isBusy, function (isBusy) {
            if (isBusy)
                _this.setState({ isBusy: true, isExpanded: false, isEmpty: _this.plugin.state.data.tree.transforms.size < 2 });
            else
                _this.setState({ isBusy: false, isEmpty: _this.plugin.state.data.tree.transforms.size < 2 });
        });
        this.subscribe(this.plugin.behaviors.state.isAnimating, function (isAnimating) {
            if (isAnimating)
                _this.setState({ isAnimating: true, isExpanded: false });
            else
                _this.setState({ isAnimating: false });
        });
    };
    AnimationViewportControls.prototype.render = function () {
        var isPlaying = this.plugin.managers.snapshot.state.isPlaying;
        if (isPlaying || this.state.isEmpty || this.plugin.managers.animation.isEmpty || !this.plugin.config.get(PluginConfig.Viewport.ShowAnimation))
            return null;
        var isAnimating = this.state.isAnimating;
        return _jsxs("div", { className: 'msp-animation-viewport-controls', children: [_jsxs("div", { children: [_jsx("div", { className: 'msp-semi-transparent-background' }), _jsx(IconButton, { svg: isAnimating || isPlaying ? StopSvg : SubscriptionsOutlinedSvg, transparent: true, title: isAnimating ? 'Stop' : 'Select Animation', onClick: isAnimating || isPlaying ? this.stop : this.toggleExpanded, toggleState: this.state.isExpanded, disabled: isAnimating || isPlaying ? false : this.state.isBusy || this.state.isPlaying || this.state.isEmpty })] }), (this.state.isExpanded && !this.state.isBusy) && _jsx("div", { className: 'msp-animation-viewport-controls-select', children: _jsx(AnimationControls, { onStart: this.toggleExpanded }) })] });
    };
    return AnimationViewportControls;
}(PluginUIComponent));
export { AnimationViewportControls };
var SelectionViewportControls = /** @class */ (function (_super) {
    __extends(SelectionViewportControls, _super);
    function SelectionViewportControls() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    SelectionViewportControls.prototype.componentDidMount = function () {
        var _this = this;
        this.subscribe(this.plugin.behaviors.interaction.selectionMode, function () { return _this.forceUpdate(); });
    };
    SelectionViewportControls.prototype.render = function () {
        if (!this.plugin.selectionMode)
            return null;
        return _jsx("div", { className: 'msp-selection-viewport-controls', children: _jsx(StructureSelectionActionsControls, {}) });
    };
    return SelectionViewportControls;
}(PluginUIComponent));
export { SelectionViewportControls };
var LociLabels = /** @class */ (function (_super) {
    __extends(LociLabels, _super);
    function LociLabels() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.state = { labels: [] };
        return _this;
    }
    LociLabels.prototype.componentDidMount = function () {
        var _this = this;
        this.subscribe(this.plugin.behaviors.labels.highlight, function (e) { return _this.setState({ labels: e.labels }); });
    };
    LociLabels.prototype.render = function () {
        if (this.state.labels.length === 0) {
            return null;
        }
        return _jsx("div", { className: 'msp-highlight-info', children: this.state.labels.map(function (e, i) { return _jsx("div", { dangerouslySetInnerHTML: { __html: e } }, '' + i); }) });
    };
    return LociLabels;
}(PluginUIComponent));
export { LociLabels };
var CustomStructureControls = /** @class */ (function (_super) {
    __extends(CustomStructureControls, _super);
    function CustomStructureControls() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    CustomStructureControls.prototype.componentDidMount = function () {
        var _this = this;
        this.subscribe(this.plugin.state.behaviors.events.changed, function () { return _this.forceUpdate(); });
    };
    CustomStructureControls.prototype.render = function () {
        var _this = this;
        var controls = [];
        this.plugin.customStructureControls.forEach(function (Controls, key) {
            controls.push(_jsx(Controls, { initiallyCollapsed: _this.props.initiallyCollapsed }, key));
        });
        return controls.length > 0 ? _jsx(_Fragment, { children: controls }) : null;
    };
    return CustomStructureControls;
}(PluginUIComponent));
export { CustomStructureControls };
var DefaultStructureTools = /** @class */ (function (_super) {
    __extends(DefaultStructureTools, _super);
    function DefaultStructureTools() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DefaultStructureTools.prototype.render = function () {
        return _jsxs(_Fragment, { children: [_jsxs("div", { className: 'msp-section-header', children: [_jsx(Icon, { svg: BuildSvg }), "Structure Tools"] }), _jsx(StructureSourceControls, {}), _jsx(StructureMeasurementsControls, {}), _jsx(StructureSuperpositionControls, {}), _jsx(StructureQuickStylesControls, {}), _jsx(StructureComponentControls, {}), this.plugin.config.get(PluginConfig.VolumeStreaming.Enabled) && _jsx(VolumeStreamingControls, {}), _jsx(VolumeSourceControls, {}), _jsx(CustomStructureControls, {})] });
    };
    return DefaultStructureTools;
}(PluginUIComponent));
export { DefaultStructureTools };
