/**
 * Copyright (c) 2018-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
var emptyArray = [];
function getPairKey(indexA, unitA, indexB, unitB) {
    return "".concat(indexA, "|").concat(unitA.id, "|").concat(indexB, "|").concat(unitB.id);
}
var PairRestraints = /** @class */ (function () {
    function PairRestraints(pairs) {
        this.pairs = pairs;
        var pairKeyIndices = new Map();
        this.pairs.forEach(function (p, i) {
            var key = getPairKey(p.indexA, p.unitA, p.indexB, p.unitB);
            var indices = pairKeyIndices.get(key);
            if (indices)
                indices.push(i);
            else
                pairKeyIndices.set(key, [i]);
        });
        this.count = pairs.length;
        this.pairKeyIndices = pairKeyIndices;
    }
    /** Indices into this.pairs */
    PairRestraints.prototype.getPairIndices = function (indexA, unitA, indexB, unitB) {
        var key = getPairKey(indexA, unitA, indexB, unitB);
        return this.pairKeyIndices.get(key) || emptyArray;
    };
    PairRestraints.prototype.getPairs = function (indexA, unitA, indexB, unitB) {
        var _this = this;
        var indices = this.getPairIndices(indexA, unitA, indexB, unitB);
        return indices.map(function (idx) { return _this.pairs[idx]; });
    };
    return PairRestraints;
}());
export { PairRestraints };
