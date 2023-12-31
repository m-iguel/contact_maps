/**
 * Copyright (c) 2018 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
/** Builds id function returning ids within [firstId, maxId) */
export function idFactory(firstId, maxId) {
    if (firstId === void 0) { firstId = 0; }
    if (maxId === void 0) { maxId = Number.MAX_SAFE_INTEGER; }
    var _nextId = firstId;
    return function () {
        var ret = _nextId;
        _nextId = (_nextId + 1) % maxId;
        return ret;
    };
}
