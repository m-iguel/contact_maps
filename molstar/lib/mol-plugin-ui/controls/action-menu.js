import { __assign, __extends } from "tslib";
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * Copyright (c) 2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import * as React from 'react';
import { Button, ControlGroup } from './common';
import { CloseSvg, ArrowDropDownSvg, ArrowRightSvg, CheckSvg } from './icons';
var ActionMenu = /** @class */ (function (_super) {
    __extends(ActionMenu, _super);
    function ActionMenu() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.hide = function () { return _this.props.onSelect(void 0); };
        return _this;
    }
    ActionMenu.prototype.render = function () {
        var cmd = this.props;
        var section = _jsx(Section, { items: cmd.items, onSelect: cmd.onSelect, current: cmd.current, multiselect: this.props.multiselect, noOffset: this.props.noOffset, noAccent: this.props.noAccent });
        return _jsxs("div", { className: "msp-action-menu-options".concat(cmd.header ? '' : ' msp-action-menu-options-no-header'), children: [cmd.header && _jsx(ControlGroup, { header: cmd.header, title: cmd.title, initialExpanded: true, hideExpander: true, hideOffset: true, onHeaderClick: this.hide, topRightIcon: CloseSvg, children: section }), !cmd.header && section] });
    };
    return ActionMenu;
}(React.PureComponent));
export { ActionMenu };
(function (ActionMenu) {
    function Header(label, options) {
        return options ? __assign({ kind: 'header', label: label }, options) : { kind: 'header', label: label };
    }
    ActionMenu.Header = Header;
    function Item(label, value, options) {
        return __assign({ kind: 'item', label: label, value: value }, options);
    }
    ActionMenu.Item = Item;
    function createItems(xs, params) {
        var _a = params || {}, label = _a.label, value = _a.value, category = _a.category, selected = _a.selected, icon = _a.icon, addOn = _a.addOn, description = _a.description;
        var cats = void 0;
        var items = [];
        for (var i = 0; i < xs.length; i++) {
            var x = xs[i];
            if ((params === null || params === void 0 ? void 0 : params.filter) && !params.filter(x))
                continue;
            var catName = category === null || category === void 0 ? void 0 : category(x);
            var l = label ? label(x) : '' + x;
            var v = value ? value(x) : x;
            var d = description ? description(x) :
                typeof x === 'string' ? x : undefined;
            var cat = void 0;
            if (!!catName) {
                if (!cats)
                    cats = new Map();
                cat = cats.get(catName);
                if (!cat) {
                    cat = [ActionMenu.Header(catName, { description: catName })];
                    cats.set(catName, cat);
                    items.push(cat);
                }
            }
            else {
                cat = items;
            }
            var ao = addOn === null || addOn === void 0 ? void 0 : addOn(x);
            cat.push({ kind: 'item', label: l, value: v, icon: icon ? icon(x) : void 0, selected: selected ? selected(x) : void 0, addOn: ao, description: d });
        }
        return items;
    }
    ActionMenu.createItems = createItems;
    var _selectOptions = { value: function (o) { return o[0]; }, label: function (o) { return o[1]; }, category: function (o) { return o[2]; } };
    function createItemsFromSelectOptions(options, params) {
        return createItems(options, params ? __assign(__assign({}, _selectOptions), params) : _selectOptions);
    }
    ActionMenu.createItemsFromSelectOptions = createItemsFromSelectOptions;
    function hasSelectedItem(items) {
        if (isHeader(items))
            return false;
        if (isItem(items))
            return !!items.selected;
        for (var _i = 0, items_1 = items; _i < items_1.length; _i++) {
            var s = items_1[_i];
            var found = hasSelectedItem(s);
            if (found)
                return true;
        }
        return false;
    }
    ActionMenu.hasSelectedItem = hasSelectedItem;
    function findItem(items, value) {
        if (isHeader(items))
            return;
        if (isItem(items))
            return items.value === value ? items : void 0;
        for (var _i = 0, items_2 = items; _i < items_2.length; _i++) {
            var s = items_2[_i];
            var found = findItem(s, value);
            if (found)
                return found;
        }
    }
    ActionMenu.findItem = findItem;
    function getFirstItem(items) {
        if (isHeader(items))
            return;
        if (isItem(items))
            return items;
        for (var _i = 0, items_3 = items; _i < items_3.length; _i++) {
            var s = items_3[_i];
            var found = getFirstItem(s);
            if (found)
                return found;
        }
    }
    ActionMenu.getFirstItem = getFirstItem;
    // export type SelectProps<T> = {
    //     items: Items,
    //     onSelect: (item: Item) => void,
    //     disabled?: boolean,
    //     label?: string,
    //     current?: Item,
    //     style?: React.CSSProperties
    // }
    // export class Select<T> extends React.PureComponent<SelectProps<T>, { isExpanded: boolean }> {
    //     state = { isExpanded: false };
    //     toggleExpanded = () => this.setState({ isExpanded: !this.state.isExpanded })
    //     onSelect: OnSelect = (item) => {
    //         this.setState({ isExpanded: false });
    //         if (!item) return;
    //         this.onSelect(item);
    //     }
    //     render() {
    //         const current = this.props.current;
    //         const label = this.props.label || current?.label || '';
    //         return <div className='msp-action-menu-select' style={this.props.style}>
    //             <ToggleButton disabled={this.props.disabled} style={{ textAlign: 'left' }} className='msp-no-overflow'
    //                 label={label} title={label as string} toggle={this.toggleExpanded} isSelected={this.state.isExpanded} />
    //             {this.state.isExpanded && <ActionMenu items={this.props.items} current={this.props.current} onSelect={this.onSelect} />}
    //         </div>
    //     }
    // }
})(ActionMenu || (ActionMenu = {}));
var Section = /** @class */ (function (_super) {
    __extends(Section, _super);
    function Section() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.state = Section.createState(_this.props);
        _this.toggleExpanded = function (e) {
            _this.setState({ isExpanded: !_this.state.isExpanded });
            e.currentTarget.blur();
        };
        _this.selectAll = function () {
            var items = collectItems(_this.props.items, []).filter(function (i) { return !i.selected; });
            _this.props.onSelect(items);
        };
        _this.selectNone = function () {
            var items = collectItems(_this.props.items, []).filter(function (i) { return !!i.selected; });
            _this.props.onSelect(items);
        };
        return _this;
    }
    Section.createState = function (props, isExpanded) {
        var header = isItems(props.items) && isHeader(props.items[0]) ? props.items[0] : void 0;
        var hasCurrent = (header === null || header === void 0 ? void 0 : header.isIndependent)
            ? false
            : props.multiselect
                ? ActionMenu.hasSelectedItem(props.items)
                : (!!props.current && !!ActionMenu.findItem(props.items, props.current.value)) || ActionMenu.hasSelectedItem(props.items);
        return {
            header: header,
            hasCurrent: hasCurrent,
            isExpanded: hasCurrent || (isExpanded !== null && isExpanded !== void 0 ? isExpanded : !!(header === null || header === void 0 ? void 0 : header.initiallyExpanded))
        };
    };
    Section.prototype.componentDidUpdate = function (prevProps) {
        if (this.props.items !== prevProps.items || this.props.current !== prevProps.current) {
            // keep previously expanded section if the header label is the same
            var isExpanded = (isItems(this.props.items) && isItems(prevProps.items) &&
                isHeader(this.props.items[0]) && isHeader(prevProps.items[0]) &&
                this.props.items[0].label === prevProps.items[0].label) ? this.state.isExpanded : undefined;
            this.setState(Section.createState(this.props, isExpanded));
        }
    };
    Object.defineProperty(Section.prototype, "multiselectHeader", {
        get: function () {
            var _a = this.state, header = _a.header, hasCurrent = _a.hasCurrent;
            return _jsxs("div", { className: 'msp-flex-row msp-control-group-header', children: [_jsx(Button, { icon: this.state.isExpanded ? ArrowDropDownSvg : ArrowRightSvg, flex: true, noOverflow: true, onClick: this.toggleExpanded, title: "Click to ".concat(this.state.isExpanded ? 'collapse' : 'expand', ".").concat((header === null || header === void 0 ? void 0 : header.description) ? " ".concat(header === null || header === void 0 ? void 0 : header.description) : ''), children: hasCurrent ? _jsx("b", { children: header === null || header === void 0 ? void 0 : header.label }) : header === null || header === void 0 ? void 0 : header.label }), _jsx(Button, { icon: CheckSvg, flex: true, onClick: this.selectAll, style: { flex: '0 0 50px', textAlign: 'right' }, children: "All" }), _jsx(Button, { icon: CloseSvg, flex: true, onClick: this.selectNone, style: { flex: '0 0 50px', textAlign: 'right' }, children: "None" })] });
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Section.prototype, "basicHeader", {
        get: function () {
            var _a = this.state, header = _a.header, hasCurrent = _a.hasCurrent;
            return _jsx("div", { className: 'msp-control-group-header', style: { marginTop: '1px' }, children: _jsx(Button, { noOverflow: true, icon: this.state.isExpanded ? ArrowDropDownSvg : ArrowRightSvg, onClick: this.toggleExpanded, title: "Click to ".concat(this.state.isExpanded ? 'collapse' : 'expand', ". ").concat((header === null || header === void 0 ? void 0 : header.description) ? header === null || header === void 0 ? void 0 : header.description : ''), children: hasCurrent ? _jsx("b", { children: header === null || header === void 0 ? void 0 : header.label }) : header === null || header === void 0 ? void 0 : header.label }) });
        },
        enumerable: false,
        configurable: true
    });
    Section.prototype.render = function () {
        var _this = this;
        var _a = this.props, items = _a.items, onSelect = _a.onSelect, current = _a.current;
        if (isHeader(items))
            return null;
        if (isItem(items))
            return _jsx(Action, { item: items, onSelect: onSelect, current: current, multiselect: this.props.multiselect });
        var header = this.state.header;
        return _jsxs(_Fragment, { children: [header && (this.props.multiselect && this.state.isExpanded ? this.multiselectHeader : this.basicHeader), _jsx("div", { className: this.props.noOffset ? void 0 : this.props.noAccent ? 'msp-control-offset' : 'msp-accent-offset', children: (!header || this.state.isExpanded) && items.map(function (x, i) {
                        if (isHeader(x))
                            return null;
                        if (isItem(x))
                            return _jsx(Action, { item: x, onSelect: onSelect, current: current, multiselect: _this.props.multiselect }, i);
                        return _jsx(Section, { items: x, onSelect: onSelect, current: current, multiselect: _this.props.multiselect, noAccent: true }, i);
                    }) })] });
    };
    return Section;
}(React.PureComponent));
var Action = function (_a) {
    var item = _a.item, onSelect = _a.onSelect, current = _a.current, multiselect = _a.multiselect;
    var isCurrent = current === item;
    var style = item.addOn ? { position: 'relative' } : void 0;
    return _jsxs(Button, { icon: item.icon, noOverflow: true, className: 'msp-action-menu-button', onClick: function (e) { return onSelect(multiselect ? [item] : item, e); }, disabled: item.disabled, style: style, title: item.description, children: [isCurrent || item.selected ? _jsx("b", { children: item.label }) : item.label, item.addOn] });
};
function isItems(x) {
    return !!x && Array.isArray(x);
}
function isItem(x) {
    var v = x;
    return v && v.kind === 'item';
}
function isHeader(x) {
    var v = x;
    return v && v.kind === 'header';
}
function collectItems(items, target) {
    if (isHeader(items))
        return target;
    if (isItem(items)) {
        target.push(items);
        return target;
    }
    for (var _i = 0, items_4 = items; _i < items_4.length; _i++) {
        var i = items_4[_i];
        collectItems(i, target);
    }
    return target;
}
