import { __awaiter, __extends, __generator } from "tslib";
import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Copyright (c) 2021 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Sukolsak Sakshuwong <sukolsak@stanford.edu>
 */
import { merge } from 'rxjs';
import { CollapsableControls } from '../../mol-plugin-ui/base';
import { Button } from '../../mol-plugin-ui/controls/common';
import { GetAppSvg, CubeScanSvg, CubeSendSvg } from '../../mol-plugin-ui/controls/icons';
import { ParameterControls } from '../../mol-plugin-ui/controls/parameters';
import { download } from '../../mol-util/download';
import { GeometryParams, GeometryControls } from './controls';
var GeometryExporterUI = /** @class */ (function (_super) {
    __extends(GeometryExporterUI, _super);
    function GeometryExporterUI() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.save = function () { return __awaiter(_this, void 0, void 0, function () {
            var data, e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, 3, 4]);
                        this.setState({ busy: true });
                        return [4 /*yield*/, this.controls.exportGeometry()];
                    case 1:
                        data = _a.sent();
                        download(data.blob, data.filename);
                        return [3 /*break*/, 4];
                    case 2:
                        e_1 = _a.sent();
                        console.error(e_1);
                        return [3 /*break*/, 4];
                    case 3:
                        this.setState({ busy: false });
                        return [7 /*endfinally*/];
                    case 4: return [2 /*return*/];
                }
            });
        }); };
        _this.viewInAR = function () { return __awaiter(_this, void 0, void 0, function () {
            var data, a_1, e_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, 3, 4]);
                        this.setState({ busy: true });
                        return [4 /*yield*/, this.controls.exportGeometry()];
                    case 1:
                        data = _a.sent();
                        a_1 = document.createElement('a');
                        a_1.rel = 'ar';
                        a_1.href = URL.createObjectURL(data.blob);
                        // For in-place viewing of USDZ on iOS, the link must contain a single child that is either an img or picture.
                        // https://webkit.org/blog/8421/viewing-augmented-reality-assets-in-safari-for-ios/
                        a_1.appendChild(document.createElement('img'));
                        setTimeout(function () { return URL.revokeObjectURL(a_1.href); }, 4E4); // 40s
                        setTimeout(function () { return a_1.dispatchEvent(new MouseEvent('click')); });
                        return [3 /*break*/, 4];
                    case 2:
                        e_2 = _a.sent();
                        console.error(e_2);
                        return [3 /*break*/, 4];
                    case 3:
                        this.setState({ busy: false });
                        return [7 /*endfinally*/];
                    case 4: return [2 /*return*/];
                }
            });
        }); };
        return _this;
    }
    Object.defineProperty(GeometryExporterUI.prototype, "controls", {
        get: function () {
            return this._controls || (this._controls = new GeometryControls(this.plugin));
        },
        enumerable: false,
        configurable: true
    });
    GeometryExporterUI.prototype.defaultState = function () {
        return {
            header: 'Export Geometry',
            isCollapsed: true,
            brand: { accent: 'cyan', svg: CubeSendSvg }
        };
    };
    GeometryExporterUI.prototype.renderControls = function () {
        var _a, _b, _c, _d;
        if (this.isARSupported === undefined) {
            this.isARSupported = !!((_b = (_a = document.createElement('a').relList) === null || _a === void 0 ? void 0 : _a.supports) === null || _b === void 0 ? void 0 : _b.call(_a, 'ar'));
        }
        var ctrl = this.controls;
        return _jsxs(_Fragment, { children: [_jsx(ParameterControls, { params: GeometryParams, values: ctrl.behaviors.params.value, onChangeValues: function (xs) { return ctrl.behaviors.params.next(xs); }, isDisabled: this.state.busy }), _jsx(Button, { icon: GetAppSvg, onClick: this.save, style: { marginTop: 1 }, disabled: this.state.busy || !((_c = this.plugin.canvas3d) === null || _c === void 0 ? void 0 : _c.reprCount.value), children: "Save" }), this.isARSupported && ctrl.behaviors.params.value.format === 'usdz' &&
                    _jsx(Button, { icon: CubeScanSvg, onClick: this.viewInAR, style: { marginTop: 1 }, disabled: this.state.busy || !((_d = this.plugin.canvas3d) === null || _d === void 0 ? void 0 : _d.reprCount.value), children: "View in AR" })] });
    };
    GeometryExporterUI.prototype.componentDidMount = function () {
        var _this = this;
        if (!this.plugin.canvas3d)
            return;
        var merged = merge(this.controls.behaviors.params, this.plugin.canvas3d.reprCount);
        this.subscribe(merged, function () {
            if (!_this.state.isCollapsed)
                _this.forceUpdate();
        });
    };
    GeometryExporterUI.prototype.componentWillUnmount = function () {
        var _a;
        _super.prototype.componentWillUnmount.call(this);
        (_a = this._controls) === null || _a === void 0 ? void 0 : _a.dispose();
        this._controls = void 0;
    };
    return GeometryExporterUI;
}(CollapsableControls));
export { GeometryExporterUI };
