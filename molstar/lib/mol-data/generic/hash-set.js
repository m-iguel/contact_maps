/**
 * Copyright (c) 2017 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
var HashSetImpl = /** @class */ (function () {
    function HashSetImpl(getHash, areEqual) {
        this.getHash = getHash;
        this.areEqual = areEqual;
        this.size = 0;
        this.byHash = new Map();
    }
    HashSetImpl.prototype.add = function (a) {
        var hash = this.getHash(a);
        if (this.byHash.has(hash)) {
            var xs = this.byHash.get(hash);
            for (var i = 0, _i = xs.length; i < _i; i++) {
                if (this.areEqual(a, xs[i]))
                    return false;
            }
            xs[xs.length] = a;
            this.size++;
            return true;
        }
        else {
            this.byHash.set(hash, [a]);
            this.size++;
            return true;
        }
    };
    HashSetImpl.prototype.has = function (v) {
        var hash = this.getHash(v);
        if (!this.byHash.has(hash))
            return false;
        var xs = this.byHash.get(hash);
        for (var i = 0, _i = xs.length; i < _i; i++) {
            if (this.areEqual(v, xs[i]))
                return true;
        }
        return false;
    };
    return HashSetImpl;
}());
// TODO: add implementations with multilevel hashing support?
export function HashSet(getHash, areEqual) {
    return new HashSetImpl(getHash, areEqual);
}
