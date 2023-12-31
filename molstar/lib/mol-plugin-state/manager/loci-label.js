/**
 * Copyright (c) 2018-2021 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { Loci } from '../../mol-model/loci';
import { Representation } from '../../mol-repr/representation';
import { MarkerAction } from '../../mol-util/marker-action';
import { arrayRemoveAtInPlace } from '../../mol-util/array';
var LociLabelManager = /** @class */ (function () {
    function LociLabelManager(ctx) {
        var _this = this;
        this.ctx = ctx;
        this.providers = [];
        this.locis = [];
        this.isDirty = false;
        this.labels = [];
        this.groupedLabels = new Map();
        ctx.managers.interactivity.lociHighlights.addProvider(function (loci, action, noRender) {
            if (_this.providers.length === 0)
                return;
            _this.mark(loci, action);
            if (!noRender)
                _this.showLabels();
        });
    }
    LociLabelManager.prototype.clearProviders = function () {
        this.providers = [];
        this.isDirty = true;
        this.showLabels();
    };
    LociLabelManager.prototype.addProvider = function (provider) {
        this.providers.push(provider);
        this.providers.sort(function (a, b) { return (b.priority || 0) - (a.priority || 0); });
        this.isDirty = true;
        this.showLabels();
    };
    LociLabelManager.prototype.removeProvider = function (provider) {
        this.providers = this.providers.filter(function (p) { return p !== provider; });
        this.isDirty = true;
        this.showLabels();
    };
    LociLabelManager.prototype.mark = function (loci, action) {
        var idx = this.locis.findIndex(function (l) { return Representation.Loci.areEqual(loci, l); });
        if (idx === -1 && action === MarkerAction.Highlight) {
            this.locis.push(loci);
            this.isDirty = true;
        }
        else if (idx !== -1 && action === MarkerAction.RemoveHighlight) {
            arrayRemoveAtInPlace(this.locis, idx);
            this.isDirty = true;
        }
    };
    LociLabelManager.prototype.showLabels = function () {
        this.ctx.behaviors.labels.highlight.next({ labels: this.getLabels() });
    };
    LociLabelManager.prototype.getLabels = function () {
        var _this = this;
        if (this.isDirty) {
            this.groupedLabels.clear();
            this.labels.length = 0;
            for (var _i = 0, _a = this.providers; _i < _a.length; _i++) {
                var provider = _a[_i];
                for (var _b = 0, _c = this.locis; _b < _c.length; _b++) {
                    var loci = _c[_b];
                    if (Loci.isEmpty(loci.loci))
                        continue;
                    var label = provider.label(loci.loci, loci.repr);
                    if (label) {
                        var hash = provider.group ? provider.group(label) : label.toString();
                        var group = this.groupedLabels.get(hash);
                        if (group)
                            group.push(label);
                        else
                            this.groupedLabels.set(hash, [label]);
                    }
                }
            }
            this.labels.length = 0;
            this.groupedLabels.forEach(function (group, hash) {
                var count = group.length;
                var entry = count > 1 && group[0] !== group[1]
                    ? hash : group[0];
                _this.labels.push(count === 1 ? entry : "".concat(entry, " <small>|| \u00D7 ").concat(count, "</small>"));
            });
            this.isDirty = false;
        }
        return this.labels;
    };
    return LociLabelManager;
}());
export { LociLabelManager };
