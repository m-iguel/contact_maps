import { __assign, __extends } from "tslib";
import { jsx as _jsx } from "react/jsx-runtime";
/**
 * Copyright (c) 2018-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import * as React from 'react';
import { Subject } from 'rxjs';
import { throttleTime } from 'rxjs/operators';
import { OrderedSet } from '../../mol-data/int';
import { StructureElement, StructureProperties, Unit } from '../../mol-model/structure';
import { Representation } from '../../mol-repr/representation';
import { ButtonsType, getButton, getButtons, getModifiers } from '../../mol-util/input/input-observer';
import { PluginUIComponent } from '../base';
/** Note, if this is changed, the CSS for `msp-sequence-number` needs adjustment too */
var MaxSequenceNumberSize = 5;
// TODO: this is somewhat inefficient and should be done using a canvas.
var Sequence = /** @class */ (function (_super) {
    __extends(Sequence, _super);
    function Sequence() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.parentDiv = React.createRef();
        _this.lastMouseOverSeqIdx = -1;
        _this.highlightQueue = new Subject();
        _this.lociHighlightProvider = function (loci, action) {
            var changed = _this.props.sequenceWrapper.markResidue(loci.loci, action);
            if (changed)
                _this.updateMarker();
        };
        _this.lociSelectionProvider = function (loci, action) {
            var changed = _this.props.sequenceWrapper.markResidue(loci.loci, action);
            if (changed)
                _this.updateMarker();
        };
        _this.contextMenu = function (e) {
            e.preventDefault();
        };
        _this.mouseDownLoci = undefined;
        _this.mouseDown = function (e) {
            e.stopPropagation();
            var seqIdx = _this.getSeqIdx(e);
            var loci = _this.getLoci(seqIdx);
            var buttons = getButtons(e.nativeEvent);
            var button = getButton(e.nativeEvent);
            var modifiers = getModifiers(e.nativeEvent);
            _this.click(loci, buttons, button, modifiers);
            _this.mouseDownLoci = loci;
        };
        _this.mouseUp = function (e) {
            e.stopPropagation();
            // ignore mouse-up events without a bound loci
            if (_this.mouseDownLoci === undefined)
                return;
            var seqIdx = _this.getSeqIdx(e);
            var loci = _this.getLoci(seqIdx);
            if (loci && !StructureElement.Loci.areEqual(_this.mouseDownLoci, loci)) {
                var buttons = getButtons(e.nativeEvent);
                var button = getButton(e.nativeEvent);
                var modifiers = getModifiers(e.nativeEvent);
                var ref = _this.mouseDownLoci.elements[0];
                var ext = loci.elements[0];
                var min = Math.min(OrderedSet.min(ref.indices), OrderedSet.min(ext.indices));
                var max = Math.max(OrderedSet.max(ref.indices), OrderedSet.max(ext.indices));
                var range = StructureElement.Loci(loci.structure, [{
                        unit: ref.unit,
                        indices: OrderedSet.ofRange(min, max)
                    }]);
                _this.click(StructureElement.Loci.subtract(range, _this.mouseDownLoci), buttons, button, modifiers);
            }
            _this.mouseDownLoci = undefined;
        };
        _this.location = StructureElement.Location.create(void 0);
        _this.mouseMove = function (e) {
            e.stopPropagation();
            var buttons = getButtons(e.nativeEvent);
            var button = getButton(e.nativeEvent);
            var modifiers = getModifiers(e.nativeEvent);
            var el = e.target;
            if (!el || !el.getAttribute) {
                if (_this.lastMouseOverSeqIdx === -1)
                    return;
                _this.lastMouseOverSeqIdx = -1;
                _this.highlightQueue.next({ seqIdx: -1, buttons: buttons, button: button, modifiers: modifiers });
                return;
            }
            var seqIdx = el.hasAttribute('data-seqid') ? +el.getAttribute('data-seqid') : -1;
            if (_this.lastMouseOverSeqIdx === seqIdx) {
                return;
            }
            else {
                _this.lastMouseOverSeqIdx = seqIdx;
                if (_this.mouseDownLoci !== undefined) {
                    var loci = _this.getLoci(seqIdx);
                    _this.hover(loci, ButtonsType.Flag.None, ButtonsType.Flag.None, __assign(__assign({}, modifiers), { shift: true }));
                }
                else {
                    _this.highlightQueue.next({ seqIdx: seqIdx, buttons: buttons, button: button, modifiers: modifiers });
                }
            }
        };
        _this.mouseLeave = function (e) {
            e.stopPropagation();
            _this.mouseDownLoci = undefined;
            if (_this.lastMouseOverSeqIdx === -1)
                return;
            _this.lastMouseOverSeqIdx = -1;
            var buttons = getButtons(e.nativeEvent);
            var button = getButton(e.nativeEvent);
            var modifiers = getModifiers(e.nativeEvent);
            _this.highlightQueue.next({ seqIdx: -1, buttons: buttons, button: button, modifiers: modifiers });
        };
        return _this;
    }
    Object.defineProperty(Sequence.prototype, "sequenceNumberPeriod", {
        get: function () {
            if (this.props.sequenceNumberPeriod !== undefined) {
                return this.props.sequenceNumberPeriod;
            }
            if (this.props.sequenceWrapper.length > 10)
                return 10;
            var lastSeqNum = this.getSequenceNumber(this.props.sequenceWrapper.length - 1);
            if (lastSeqNum.length > 1)
                return 5;
            return 1;
        },
        enumerable: false,
        configurable: true
    });
    Sequence.prototype.componentDidMount = function () {
        var _this = this;
        this.plugin.managers.interactivity.lociHighlights.addProvider(this.lociHighlightProvider);
        this.plugin.managers.interactivity.lociSelects.addProvider(this.lociSelectionProvider);
        this.subscribe(this.highlightQueue.pipe(throttleTime(3 * 16.666, void 0, { leading: true, trailing: true })), function (e) {
            var loci = _this.getLoci(e.seqIdx < 0 ? void 0 : e.seqIdx);
            _this.hover(loci, e.buttons, e.button, e.modifiers);
        });
    };
    Sequence.prototype.componentWillUnmount = function () {
        _super.prototype.componentWillUnmount.call(this);
        this.plugin.managers.interactivity.lociHighlights.removeProvider(this.lociHighlightProvider);
        this.plugin.managers.interactivity.lociSelects.removeProvider(this.lociSelectionProvider);
    };
    Sequence.prototype.getLoci = function (seqIdx) {
        if (seqIdx !== undefined) {
            var loci = this.props.sequenceWrapper.getLoci(seqIdx);
            if (!StructureElement.Loci.isEmpty(loci))
                return loci;
        }
    };
    Sequence.prototype.getSeqIdx = function (e) {
        var seqIdx = undefined;
        var el = e.target;
        if (el && el.getAttribute) {
            seqIdx = el.hasAttribute('data-seqid') ? +el.getAttribute('data-seqid') : undefined;
        }
        return seqIdx;
    };
    Sequence.prototype.hover = function (loci, buttons, button, modifiers) {
        var ev = { current: Representation.Loci.Empty, buttons: buttons, button: button, modifiers: modifiers };
        if (loci !== undefined && !StructureElement.Loci.isEmpty(loci)) {
            ev.current = { loci: loci };
        }
        this.plugin.behaviors.interaction.hover.next(ev);
    };
    Sequence.prototype.click = function (loci, buttons, button, modifiers) {
        var ev = { current: Representation.Loci.Empty, buttons: buttons, button: button, modifiers: modifiers };
        if (loci !== undefined && !StructureElement.Loci.isEmpty(loci)) {
            ev.current = { loci: loci };
        }
        this.plugin.behaviors.interaction.click.next(ev);
    };
    Sequence.prototype.getBackgroundColor = function (marker) {
        // TODO: make marker color configurable
        if (typeof marker === 'undefined')
            console.error('unexpected marker value');
        return marker === 0
            ? ''
            : marker % 2 === 0
                ? 'rgb(51, 255, 25)' // selected
                : 'rgb(255, 102, 153)'; // highlighted
    };
    Sequence.prototype.getResidueClass = function (seqIdx, label) {
        return label.length > 1
            ? this.props.sequenceWrapper.residueClass(seqIdx) + (seqIdx === 0 ? ' msp-sequence-residue-long-begin' : ' msp-sequence-residue-long')
            : this.props.sequenceWrapper.residueClass(seqIdx);
    };
    Sequence.prototype.residue = function (seqIdx, label, marker) {
        return _jsx("span", { "data-seqid": seqIdx, style: { backgroundColor: this.getBackgroundColor(marker) }, className: this.getResidueClass(seqIdx, label), children: "\u200B".concat(label, "\u200B") }, seqIdx);
    };
    Sequence.prototype.getSequenceNumberClass = function (seqIdx, seqNum, label) {
        var classList = ['msp-sequence-number'];
        if (seqNum.startsWith('-')) {
            if (label.length > 1 && seqIdx > 0)
                classList.push('msp-sequence-number-long-negative');
            else
                classList.push('msp-sequence-number-negative');
        }
        else {
            if (label.length > 1 && seqIdx > 0)
                classList.push('msp-sequence-number-long');
        }
        return classList.join(' ');
    };
    Sequence.prototype.getSequenceNumber = function (seqIdx) {
        var seqNum = '';
        var loci = this.props.sequenceWrapper.getLoci(seqIdx);
        var l = StructureElement.Loci.getFirstLocation(loci, this.location);
        if (l) {
            if (Unit.isAtomic(l.unit)) {
                var seqId = StructureProperties.residue.auth_seq_id(l);
                var insCode = StructureProperties.residue.pdbx_PDB_ins_code(l);
                seqNum = "".concat(seqId).concat(insCode ? insCode : '');
            }
            else if (Unit.isCoarse(l.unit)) {
                seqNum = "".concat(seqIdx + 1);
            }
        }
        return seqNum;
    };
    Sequence.prototype.padSeqNum = function (n) {
        if (n.length < MaxSequenceNumberSize)
            return n + new Array(MaxSequenceNumberSize - n.length + 1).join('\u00A0');
        return n;
    };
    Sequence.prototype.getSequenceNumberSpan = function (seqIdx, label) {
        var seqNum = this.getSequenceNumber(seqIdx);
        return _jsx("span", { className: this.getSequenceNumberClass(seqIdx, seqNum, label), children: this.padSeqNum(seqNum) }, "marker-".concat(seqIdx));
    };
    Sequence.prototype.updateMarker = function () {
        if (!this.parentDiv.current)
            return;
        var xs = this.parentDiv.current.children;
        var markerArray = this.props.sequenceWrapper.markerArray;
        var hasNumbers = !this.props.hideSequenceNumbers, period = this.sequenceNumberPeriod;
        // let first: HTMLSpanElement | undefined;
        var o = 0;
        for (var i = 0, il = markerArray.length; i < il; i++) {
            if (hasNumbers && i % period === 0 && i < il)
                o++;
            // o + 1 to account for help icon
            var span = xs[o];
            if (!span)
                return;
            o++;
            // if (!first && markerArray[i] > 0) {
            //     first = span;
            // }
            var backgroundColor = this.getBackgroundColor(markerArray[i]);
            if (span.style.backgroundColor !== backgroundColor)
                span.style.backgroundColor = backgroundColor;
        }
        // if (first) {
        //     first.scrollIntoView({ block: 'nearest' });
        // }
    };
    Sequence.prototype.render = function () {
        var sw = this.props.sequenceWrapper;
        var elems = [];
        var hasNumbers = !this.props.hideSequenceNumbers, period = this.sequenceNumberPeriod;
        for (var i = 0, il = sw.length; i < il; ++i) {
            var label = sw.residueLabel(i);
            // add sequence number before name so the html element do not get separated by a line-break
            if (hasNumbers && i % period === 0 && i < il) {
                elems[elems.length] = this.getSequenceNumberSpan(i, label);
            }
            elems[elems.length] = this.residue(i, label, sw.markerArray[i]);
        }
        // calling .updateMarker here is neccesary to ensure existing
        // residue spans are updated as react won't update them
        this.updateMarker();
        return _jsx("div", { className: 'msp-sequence-wrapper', onContextMenu: this.contextMenu, onMouseDown: this.mouseDown, onMouseUp: this.mouseUp, onMouseMove: this.mouseMove, onMouseLeave: this.mouseLeave, ref: this.parentDiv, children: elems });
    };
    return Sequence;
}(PluginUIComponent));
export { Sequence };
