import { __extends } from "tslib";
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * Copyright (c) 2019-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import * as React from 'react';
import { Binding } from '../../mol-util/binding';
import { PluginUIComponent } from '../base';
import { StateSelection } from '../../mol-state';
import { SelectLoci } from '../../mol-plugin/behavior/dynamic/representation';
import { FocusLoci } from '../../mol-plugin/behavior/dynamic/representation';
import { Icon, ArrowDropDownSvg, ArrowRightSvg, CameraSvg } from '../controls/icons';
import { Button } from '../controls/common';
import { memoizeLatest } from '../../mol-util/memoize';
function getBindingsList(bindings) {
    return Object.keys(bindings).map(function (k) { return [k, bindings[k]]; }).filter(function (b) { return Binding.isBinding(b[1]); });
}
var BindingsHelp = /** @class */ (function (_super) {
    __extends(BindingsHelp, _super);
    function BindingsHelp() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    BindingsHelp.prototype.getBindingComponents = function () {
        var bindingsList = getBindingsList(this.props.bindings);
        return _jsx(_Fragment, { children: bindingsList.map(function (value) {
                var name = value[0], binding = value[1];
                return !Binding.isEmpty(binding)
                    ? _jsxs("div", { style: { marginBottom: '6px' }, children: [_jsx("b", { children: binding.action }), _jsx("br", {}), _jsx("span", { dangerouslySetInnerHTML: { __html: Binding.format(binding, name) } })] }, name)
                    : null;
            }) });
    };
    BindingsHelp.prototype.render = function () {
        return _jsx(HelpText, { children: this.getBindingComponents() });
    };
    return BindingsHelp;
}(React.PureComponent));
export { BindingsHelp };
var HelpText = /** @class */ (function (_super) {
    __extends(HelpText, _super);
    function HelpText() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    HelpText.prototype.render = function () {
        return _jsx("div", { className: 'msp-help-text', children: _jsx("div", { children: this.props.children }) });
    };
    return HelpText;
}(React.PureComponent));
export { HelpText };
var HelpGroup = /** @class */ (function (_super) {
    __extends(HelpGroup, _super);
    function HelpGroup() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.state = {
            header: _this.props.header,
            isExpanded: !!_this.props.initiallyExpanded
        };
        _this.toggleExpanded = function () { return _this.setState({ isExpanded: !_this.state.isExpanded }); };
        return _this;
    }
    HelpGroup.prototype.render = function () {
        return _jsxs("div", { className: 'msp-control-group-wrapper', children: [_jsx("div", { className: 'msp-control-group-header', children: _jsxs(Button, { onClick: this.toggleExpanded, children: [_jsx(Icon, { svg: this.state.isExpanded ? ArrowDropDownSvg : ArrowRightSvg }), this.props.header] }) }), this.state.isExpanded && _jsx("div", { className: 'msp-control-offset', style: { display: this.state.isExpanded ? 'block' : 'none' }, children: this.props.children })] });
    };
    return HelpGroup;
}(React.PureComponent));
export { HelpGroup };
function HelpSection(props) {
    return _jsx("div", { className: 'msp-simple-help-section', children: props.header });
}
var ViewportHelpContent = /** @class */ (function (_super) {
    __extends(ViewportHelpContent, _super);
    function ViewportHelpContent() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.getInteractionBindings = memoizeLatest(function (cells) {
            var interactionBindings = void 0;
            cells.forEach(function (c) {
                var _a;
                var params = (_a = c.params) === null || _a === void 0 ? void 0 : _a.values;
                if ((params === null || params === void 0 ? void 0 : params.bindings) && Object.keys(params.bindings).length > 0) {
                    if (!interactionBindings)
                        interactionBindings = {};
                    Object.assign(interactionBindings, params.bindings);
                }
            });
            return interactionBindings;
        });
        return _this;
    }
    ViewportHelpContent.prototype.componentDidMount = function () {
        var _this = this;
        this.subscribe(this.plugin.events.canvas3d.settingsUpdated, function () { return _this.forceUpdate(); });
    };
    ViewportHelpContent.prototype.render = function () {
        var interactionBindings = this.getInteractionBindings(this.plugin.state.behaviors.cells);
        return _jsxs(_Fragment, { children: [(!this.props.selectOnly && this.plugin.canvas3d) && _jsx(HelpGroup, { header: 'Moving in 3D', children: _jsx(BindingsHelp, { bindings: this.plugin.canvas3d.props.trackball.bindings }) }, 'trackball'), !!interactionBindings && _jsx(HelpGroup, { header: 'Mouse & Key Controls', children: _jsx(BindingsHelp, { bindings: interactionBindings }) }, 'interactions')] });
    };
    return ViewportHelpContent;
}(PluginUIComponent));
export { ViewportHelpContent };
var HelpContent = /** @class */ (function (_super) {
    __extends(HelpContent, _super);
    function HelpContent() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    HelpContent.prototype.componentDidMount = function () {
        var _this = this;
        this.subscribe(this.plugin.events.canvas3d.settingsUpdated, function () { return _this.forceUpdate(); });
    };
    HelpContent.prototype.formatTriggers = function (binding) {
        return binding.triggers.map(function (t) { return Binding.Trigger.format(t); }).join(' or ');
    };
    HelpContent.prototype.getTriggerFor = function (transformer, name) {
        var state = this.plugin.state.behaviors;
        var selections = state.select(StateSelection.Generators.ofTransformer(transformer));
        var params = selections.length === 1 ? selections[0].params : undefined;
        var bindings = params ? params.values.bindings : {};
        var binding = name in bindings ? bindings[name] : Binding.Empty;
        return this.formatTriggers(binding);
    };
    HelpContent.prototype.render = function () {
        var selectToggleTriggers = this.getTriggerFor(SelectLoci, 'clickSelectToggle');
        var focusTriggers = this.getTriggerFor(FocusLoci, 'clickFocus');
        // TODO: interactive help, for example for density
        return _jsxs("div", { children: [_jsx(HelpSection, { header: 'Interface Controls' }), _jsxs(HelpGroup, { header: 'Inline Help', children: [_jsx(HelpText, { children: "Many user interface elements show a little questionmark icon when hovered over. Clicking the icon toggles the display of an inline help text." }), _jsx(HelpText, { children: "Tooltips may provide additional information on a user interface element and are shown when hovering over it with the mouse." })] }), _jsx(HelpGroup, { header: 'Selections', children: _jsxs(HelpText, { children: ["The viewer allows changing colors and representations for selections of atoms, residues or chains. Selections can be created by", _jsxs("ul", { style: { paddingLeft: '20px' }, children: [_jsxs("li", { children: ["picking elements on the 3D canvas or the sequence view using the mouse, e.g. toggle selection using ", selectToggleTriggers, " (for more see help section on ", _jsx("i", { children: "Mouse Controls" }), ")"] }), _jsxs("li", { children: ["using the ", _jsx("i", { children: "Add" }), ", ", _jsx("i", { children: "Remove" }), " and ", _jsx("i", { children: "Only" }), " dropdown buttons in the ", _jsx("i", { children: "Manage Selection" }), " panel which allow modifing the current selection by predefined sets"] })] })] }) }), _jsx(HelpGroup, { header: 'Coloring', children: _jsxs(HelpText, { children: ["There are two ways to color structures. Every representation (e.g. cartoon or spacefill) has a color theme which can be changed using the dropdown for each representation in the ", _jsx("i", { children: "Structure Settings" }), " panel. Additionally any selection atoms, residues or chains can by given a custom color. For that, first select the parts of the structure to be colored (see help section on ", _jsx("i", { children: "Selections" }), ") and, second, choose a color from the color dropdown botton in the ", _jsx("i", { children: "Selection" }), " row of the ", _jsx("i", { children: "Change Representation" }), " panel. The theme color can be seen as a base color that is overpainted by the custom color. Custom colors can be removed for a selection with the 'Clear' option in the color dropdown."] }) }), _jsx(HelpGroup, { header: 'Representations', children: _jsxs(HelpText, { children: ["Structures can be shown with many different representations (e.g. cartoon or spacefill). The ", _jsx("i", { children: "Change Representation" }), " panel offers a collection of predefined styles which can be applied using the ", _jsx("i", { children: "Preset" }), " dropdown button. Additionally any selection atoms, residues or chains can by shown with a custom representation. For that, first select the parts of the structure to be mofified (see help section on ", _jsx("i", { children: "Selections" }), ") and, second, choose a representation to hide or show from the ", _jsx("i", { children: "Show" }), " and ", _jsx("i", { children: "Hide" }), " dropdown bottons in the ", _jsx("i", { children: "Selection" }), " row of the ", _jsx("i", { children: "Change Representation" }), " panel. The ", _jsx("i", { children: "Everything" }), " row applies the action to the whole structure instead of the current selection."] }) }), _jsx(HelpGroup, { header: 'Surroundings', children: _jsxs(HelpText, { children: ["To show the surroundings of a residue or ligand, click it in the 3D scene or in the sequence widget using ", focusTriggers, "."] }) }), _jsx(HelpSection, { header: 'How-to Guides' }), _jsx(HelpGroup, { header: 'Create an Image', children: _jsxs(HelpText, { children: [_jsxs("p", { children: ["Use the ", _jsx(Icon, { svg: CameraSvg }), " icon in the viewport to bring up the screenshot controls."] }), _jsxs("p", { children: ["To adjust the size of the image, use the ", _jsx("i", { children: "Resolution" }), " dropdown."] })] }) }), _jsx(HelpSection, { header: 'Mouse Controls' }), _jsx(ViewportHelpContent, {})] });
    };
    return HelpContent;
}(PluginUIComponent));
export { HelpContent };
