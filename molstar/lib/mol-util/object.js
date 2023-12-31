/**
 * Copyright (c) 2017 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
var hasOwnProperty = Object.prototype.hasOwnProperty;
/** Assign to the object if a given property in update is undefined */
export function assignIfUndefined(to, full) {
    for (var _i = 0, _a = Object.keys(full); _i < _a.length; _i++) {
        var k = _a[_i];
        if (!hasOwnProperty.call(full, k))
            continue;
        if (typeof to[k] === 'undefined') {
            to[k] = full[k];
        }
    }
    return to;
}
/** Create new object if any property in "update" changes in "source". */
export function shallowMerge2(source, update) {
    // Adapted from LiteMol (https://github.com/dsehnal/LiteMol)
    var changed = false;
    for (var _i = 0, _a = Object.keys(update); _i < _a.length; _i++) {
        var k = _a[_i];
        if (!hasOwnProperty.call(update, k))
            continue;
        if (update[k] !== source[k]) {
            changed = true;
            break;
        }
    }
    if (!changed)
        return source;
    return Object.assign({}, source, update);
}
export function shallowEqual(a, b) {
    if (!a) {
        if (!b)
            return true;
        return false;
    }
    if (!b)
        return false;
    var keys = Object.keys(a);
    if (Object.keys(b).length !== keys.length)
        return false;
    for (var _i = 0, keys_1 = keys; _i < keys_1.length; _i++) {
        var k = keys_1[_i];
        if (!hasOwnProperty.call(a, k) || a[k] !== b[k])
            return false;
    }
    return true;
}
export function shallowMerge(source) {
    var rest = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        rest[_i - 1] = arguments[_i];
    }
    return shallowMergeArray(source, rest);
}
export function shallowMergeArray(source, rest) {
    // Adapted from LiteMol (https://github.com/dsehnal/LiteMol)
    var ret = source;
    for (var s = 0; s < rest.length; s++) {
        if (!rest[s])
            continue;
        ret = shallowMerge2(source, rest[s]);
        if (ret !== source) {
            for (var i = s + 1; i < rest.length; i++) {
                ret = Object.assign(ret, rest[i]);
            }
            break;
        }
    }
    return ret;
}
/** Simple deep clone for number, boolean, string, null, undefined, object, array */
export function deepClone(source) {
    if (null === source || 'object' !== typeof source)
        return source;
    if (source instanceof Array) {
        var copy = [];
        for (var i = 0, len = source.length; i < len; i++) {
            copy[i] = deepClone(source[i]);
        }
        return copy;
    }
    // `instanceof Object` does not find `Object.create(null)`
    if (typeof source === 'object' && !('prototype' in source)) {
        var copy = {};
        for (var k in source) {
            if (hasOwnProperty.call(source, k))
                copy[k] = deepClone(source[k]);
        }
        return copy;
    }
    throw new Error("Can't clone, type \"".concat(typeof source, "\" unsupported"));
}
export function mapObjectMap(o, f) {
    var ret = {};
    for (var _i = 0, _a = Object.keys(o); _i < _a.length; _i++) {
        var k = _a[_i];
        ret[k] = f(o[k]);
    }
    return ret;
}
export function objectForEach(o, f) {
    if (!o)
        return;
    for (var _i = 0, _a = Object.keys(o); _i < _a.length; _i++) {
        var k = _a[_i];
        f(o[k], k);
    }
}
