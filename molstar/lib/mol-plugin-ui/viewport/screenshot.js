import { __awaiter, __extends, __generator } from "tslib";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { PluginCommands } from '../../mol-plugin/commands';
import { PluginUIComponent } from '../base';
import { Button, ExpandGroup, ToggleButton } from '../controls/common';
import { CopySvg, CropFreeSvg, CropOrginalSvg, CropSvg, GetAppSvg } from '../controls/icons';
import { ParameterControls } from '../controls/parameters';
import { ScreenshotPreview } from '../controls/screenshot';
import { useBehavior } from '../hooks/use-behavior';
import { LocalStateSnapshotParams, StateExportImportControls } from '../state/snapshots';
var DownloadScreenshotControls = /** @class */ (function (_super) {
    __extends(DownloadScreenshotControls, _super);
    function DownloadScreenshotControls() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.state = {
            showPreview: true,
            isDisabled: false
        };
        _this.download = function () {
            var _a;
            (_a = _this.plugin.helpers.viewportScreenshot) === null || _a === void 0 ? void 0 : _a.download();
            _this.props.close();
        };
        _this.copy = function () { return __awaiter(_this, void 0, void 0, function () {
            var _a;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, ((_b = this.plugin.helpers.viewportScreenshot) === null || _b === void 0 ? void 0 : _b.copyToClipboard())];
                    case 1:
                        _c.sent();
                        PluginCommands.Toast.Show(this.plugin, {
                            message: 'Copied to clipboard.',
                            title: 'Screenshot',
                            timeoutMs: 1500
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        _a = _c.sent();
                        return [2 /*return*/, this.copyImg()];
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        _this.copyImg = function () { return __awaiter(_this, void 0, void 0, function () {
            var src;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, ((_a = this.plugin.helpers.viewportScreenshot) === null || _a === void 0 ? void 0 : _a.getImageDataUri())];
                    case 1:
                        src = _b.sent();
                        this.setState({ imageData: src });
                        return [2 /*return*/];
                }
            });
        }); };
        _this.open = function (e) {
            if (!e.target.files || !e.target.files[0])
                return;
            PluginCommands.State.Snapshots.OpenFile(_this.plugin, { file: e.target.files[0] });
        };
        return _this;
    }
    DownloadScreenshotControls.prototype.componentDidMount = function () {
        var _this = this;
        this.subscribe(this.plugin.state.data.behaviors.isUpdating, function (v) {
            _this.setState({ isDisabled: v });
        });
    };
    DownloadScreenshotControls.prototype.componentWillUnmount = function () {
        _super.prototype.componentWillUnmount.call(this);
        this.setState({ imageData: void 0 });
    };
    DownloadScreenshotControls.prototype.render = function () {
        var _this = this;
        var _a;
        var hasClipboardApi = !!((_a = navigator.clipboard) === null || _a === void 0 ? void 0 : _a.write);
        return _jsxs("div", { children: [this.state.showPreview && _jsxs("div", { className: 'msp-image-preview', children: [_jsx(ScreenshotPreview, { plugin: this.plugin }), _jsx(CropControls, { plugin: this.plugin })] }), _jsxs("div", { className: 'msp-flex-row', children: [!this.state.imageData && _jsx(Button, { icon: CopySvg, onClick: hasClipboardApi ? this.copy : this.copyImg, disabled: this.state.isDisabled, children: "Copy" }), this.state.imageData && _jsx(Button, { onClick: function () { return _this.setState({ imageData: void 0 }); }, disabled: this.state.isDisabled, children: "Clear" }), _jsx(Button, { icon: GetAppSvg, onClick: this.download, disabled: this.state.isDisabled, children: "Download" })] }), this.state.imageData && _jsxs("div", { className: 'msp-row msp-copy-image-wrapper', children: [_jsx("div", { children: "Right click below + Copy Image" }), _jsx("img", { src: this.state.imageData, style: { width: '100%', height: 32, display: 'block' } })] }), _jsx(ScreenshotParams, { plugin: this.plugin, isDisabled: this.state.isDisabled }), _jsxs(ExpandGroup, { header: 'State', children: [_jsx(StateExportImportControls, { onAction: this.props.close }), _jsx(ExpandGroup, { header: 'Save Options', initiallyExpanded: false, noOffset: true, children: _jsx(LocalStateSnapshotParams, {}) })] })] });
    };
    return DownloadScreenshotControls;
}(PluginUIComponent));
export { DownloadScreenshotControls };
function ScreenshotParams(_a) {
    var plugin = _a.plugin, isDisabled = _a.isDisabled;
    var helper = plugin.helpers.viewportScreenshot;
    var values = useBehavior(helper === null || helper === void 0 ? void 0 : helper.behaviors.values);
    if (!helper)
        return null;
    return _jsx(ParameterControls, { params: helper.params, values: values, onChangeValues: function (v) { return helper.behaviors.values.next(v); }, isDisabled: isDisabled });
}
function CropControls(_a) {
    var plugin = _a.plugin;
    var helper = plugin.helpers.viewportScreenshot;
    var cropParams = useBehavior(helper === null || helper === void 0 ? void 0 : helper.behaviors.cropParams);
    useBehavior(helper === null || helper === void 0 ? void 0 : helper.behaviors.relativeCrop);
    if (!helper || !cropParams)
        return null;
    return _jsxs("div", { style: { width: '100%', height: '24px', marginTop: '8px' }, children: [_jsx(ToggleButton, { icon: CropOrginalSvg, title: 'Auto-crop', inline: true, isSelected: cropParams.auto, style: { background: 'transparent', float: 'left', width: 'auto', height: '24px', lineHeight: '24px' }, toggle: function () { return helper.toggleAutocrop(); }, label: 'Auto-crop ' + (cropParams.auto ? 'On' : 'Off') }), !cropParams.auto && _jsx(Button, { icon: CropSvg, title: 'Crop', style: { background: 'transparent', float: 'right', height: '24px', lineHeight: '24px', width: '24px', padding: '0' }, onClick: function () { return helper.autocrop(); } }), !cropParams.auto && !helper.isFullFrame && _jsx(Button, { icon: CropFreeSvg, title: 'Reset Crop', style: { background: 'transparent', float: 'right', height: '24px', lineHeight: '24px', width: '24px', padding: '0' }, onClick: function () { return helper.resetCrop(); } })] });
}
