/**
 * Copyright (c) 2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { SortedArray } from '../../../../../mol-data/int';
var ElementSetIntraBondCache = /** @class */ (function () {
    function ElementSetIntraBondCache() {
        this.data = new Map();
    }
    ElementSetIntraBondCache.prototype.get = function (xs) {
        var hash = SortedArray.hashCode(xs);
        if (!this.data.has(hash))
            return void 0;
        for (var _i = 0, _a = this.data.get(hash); _i < _a.length; _i++) {
            var _b = _a[_i], s = _b[0], b = _b[1];
            if (SortedArray.areEqual(xs, s))
                return b;
        }
    };
    ElementSetIntraBondCache.prototype.set = function (xs, bonds) {
        var hash = SortedArray.hashCode(xs);
        if (this.data.has(hash)) {
            var es = this.data.get(hash);
            for (var _i = 0, es_1 = es; _i < es_1.length; _i++) {
                var e = es_1[_i];
                if (SortedArray.areEqual(xs, e[0])) {
                    e[1] = bonds;
                    return;
                }
            }
            es.push([xs, bonds]);
        }
        else {
            this.data.set(hash, [[xs, bonds]]);
        }
    };
    ElementSetIntraBondCache.get = function (model) {
        if (!model._dynamicPropertyData.ElementSetIntraBondCache) {
            model._dynamicPropertyData.ElementSetIntraBondCache = new ElementSetIntraBondCache();
        }
        return model._dynamicPropertyData.ElementSetIntraBondCache;
    };
    return ElementSetIntraBondCache;
}());
export { ElementSetIntraBondCache };
