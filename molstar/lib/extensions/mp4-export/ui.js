import { __awaiter, __extends, __generator } from "tslib";
import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Copyright (c) 2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { merge } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { CollapsableControls } from '../../mol-plugin-ui/base';
import { Button } from '../../mol-plugin-ui/controls/common';
import { CameraOutlinedSvg, GetAppSvg, Icon, SubscriptionsOutlinedSvg } from '../../mol-plugin-ui/controls/icons';
import { ParameterControls } from '../../mol-plugin-ui/controls/parameters';
import { download } from '../../mol-util/download';
import { Mp4AnimationParams, Mp4Controls } from './controls';
var Mp4EncoderUI = /** @class */ (function (_super) {
    __extends(Mp4EncoderUI, _super);
    function Mp4EncoderUI() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.save = function () {
            download(new Blob([_this.state.data.movie]), _this.state.data.filename);
        };
        _this.generate = function () { return __awaiter(_this, void 0, void 0, function () {
            var data, e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        this.setState({ busy: true });
                        return [4 /*yield*/, this.controls.render()];
                    case 1:
                        data = _a.sent();
                        this.setState({ busy: false, data: data });
                        return [3 /*break*/, 3];
                    case 2:
                        e_1 = _a.sent();
                        console.error(e_1);
                        this.setState({ busy: false });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        return _this;
    }
    Object.defineProperty(Mp4EncoderUI.prototype, "controls", {
        get: function () {
            return this._controls || (this._controls = new Mp4Controls(this.plugin));
        },
        enumerable: false,
        configurable: true
    });
    Mp4EncoderUI.prototype.defaultState = function () {
        return {
            header: 'Export Animation',
            isCollapsed: true,
            brand: { accent: 'cyan', svg: SubscriptionsOutlinedSvg }
        };
    };
    Mp4EncoderUI.prototype.downloadControls = function () {
        var _this = this;
        return _jsxs(_Fragment, { children: [_jsx("div", { className: 'msp-control-offset msp-help-text', children: _jsx("div", { className: 'msp-help-description', style: { textAlign: 'center' }, children: "Rendering successful!" }) }), _jsx(Button, { icon: GetAppSvg, onClick: this.save, style: { marginTop: 1 }, children: "Save Animation" }), _jsx(Button, { onClick: function () { return _this.setState({ data: void 0 }); }, style: { marginTop: 6 }, children: "Clear" })] });
    };
    Mp4EncoderUI.prototype.renderControls = function () {
        var _a;
        if (this.state.data) {
            return this.downloadControls();
        }
        var ctrl = this.controls;
        var current = ctrl.behaviors.current.value;
        var info = ctrl.behaviors.info.value;
        var canApply = ctrl.behaviors.canApply.value;
        return _jsxs(_Fragment, { children: [_jsx(ParameterControls, { params: ctrl.behaviors.animations.value, values: { current: current === null || current === void 0 ? void 0 : current.anim.name }, onChangeValues: function (xs) { return ctrl.setCurrent(xs.current); }, isDisabled: this.state.busy }), current && _jsx(ParameterControls, { params: current.params, values: current.values, onChangeValues: function (xs) { return ctrl.setCurrentParams(xs); }, isDisabled: this.state.busy }), _jsx("div", { className: 'msp-control-offset msp-help-text', children: _jsxs("div", { className: 'msp-help-description', style: { textAlign: 'center' }, children: ["Resolution: ", info.width, "x", info.height, _jsx("br", {}), "Adjust in viewport using ", _jsx(Icon, { svg: CameraOutlinedSvg, inline: true })] }) }), _jsx(ParameterControls, { params: Mp4AnimationParams, values: ctrl.behaviors.params.value, onChangeValues: function (xs) { return ctrl.behaviors.params.next(xs); }, isDisabled: this.state.busy }), _jsx(Button, { onClick: this.generate, style: { marginTop: 1 }, disabled: this.state.busy || !canApply.canApply, commit: canApply.canApply ? 'on' : 'off', children: canApply.canApply ? 'Render' : (_a = canApply.reason) !== null && _a !== void 0 ? _a : 'Invalid params/state' })] });
    };
    Mp4EncoderUI.prototype.componentDidMount = function () {
        var _this = this;
        var merged = merge(this.controls.behaviors.animations, this.controls.behaviors.current, this.controls.behaviors.canApply, this.controls.behaviors.info, this.controls.behaviors.params);
        this.subscribe(merged.pipe(debounceTime(10)), function () {
            if (!_this.state.isCollapsed)
                _this.forceUpdate();
        });
    };
    Mp4EncoderUI.prototype.componentWillUnmount = function () {
        var _a;
        _super.prototype.componentWillUnmount.call(this);
        (_a = this._controls) === null || _a === void 0 ? void 0 : _a.dispose();
        this._controls = void 0;
    };
    return Mp4EncoderUI;
}(CollapsableControls));
export { Mp4EncoderUI };
