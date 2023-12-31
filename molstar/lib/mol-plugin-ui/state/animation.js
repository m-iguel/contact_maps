import { __extends } from "tslib";
import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Copyright (c) 2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { PluginUIComponent } from '../base';
import { ParameterControls } from '../controls/parameters';
import { Button } from '../controls/common';
import { PlayArrowSvg } from '../controls/icons';
var AnimationControls = /** @class */ (function (_super) {
    __extends(AnimationControls, _super);
    function AnimationControls() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.updateParams = function (p) {
            var _a;
            _this.plugin.managers.animation.updateParams((_a = {}, _a[p.name] = p.value, _a));
        };
        _this.updateCurrentParams = function (p) {
            var _a;
            _this.plugin.managers.animation.updateCurrentParams((_a = {}, _a[p.name] = p.value, _a));
        };
        _this.startOrStop = function () {
            var anim = _this.plugin.managers.animation;
            if (anim.state.animationState === 'playing')
                anim.stop();
            else {
                if (_this.props.onStart)
                    _this.props.onStart();
                anim.start();
            }
        };
        return _this;
    }
    AnimationControls.prototype.componentDidMount = function () {
        var _this = this;
        this.subscribe(this.plugin.managers.animation.events.updated, function () { return _this.forceUpdate(); });
    };
    AnimationControls.prototype.render = function () {
        var _a, _b;
        var anim = this.plugin.managers.animation;
        if (anim.isEmpty)
            return null;
        var isDisabled = anim.state.animationState === 'playing';
        var canApply = (_b = (_a = anim.current.anim).canApply) === null || _b === void 0 ? void 0 : _b.call(_a, this.plugin);
        return _jsxs(_Fragment, { children: [_jsx(ParameterControls, { params: anim.getParams(), values: anim.state.params, onChange: this.updateParams, isDisabled: isDisabled }), _jsx(ParameterControls, { params: anim.current.params, values: anim.current.paramValues, onChange: this.updateCurrentParams, isDisabled: isDisabled }), _jsx("div", { className: 'msp-flex-row', children: _jsx(Button, { icon: anim.state.animationState !== 'playing' ? void 0 : PlayArrowSvg, onClick: this.startOrStop, disabled: canApply !== void 0 && canApply.canApply === false, children: anim.state.animationState === 'playing' ? 'Stop' : canApply === void 0 || canApply.canApply ? 'Start' : canApply.reason || 'Start' }) })] });
    };
    return AnimationControls;
}(PluginUIComponent));
export { AnimationControls };
