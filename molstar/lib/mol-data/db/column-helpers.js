/**
 * Copyright (c) 2017 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
export function getArrayBounds(rowCount, params) {
    var start = params && typeof params.start !== 'undefined' ? Math.max(Math.min(params.start, rowCount - 1), 0) : 0;
    var end = params && typeof params.end !== 'undefined' ? Math.min(params.end, rowCount) : rowCount;
    return { start: start, end: end };
}
export function createArray(rowCount, params) {
    var c = params && typeof params.array !== 'undefined' ? params.array : Array;
    var _a = getArrayBounds(rowCount, params), start = _a.start, end = _a.end;
    return { array: new c(end - start), start: start, end: end };
}
export function fillArrayValues(value, target, start) {
    for (var i = 0, _e = target.length; i < _e; i++)
        target[i] = value(start + i);
    return target;
}
export function createAndFillArray(rowCount, value, params) {
    var _a = createArray(rowCount, params), array = _a.array, start = _a.start;
    return fillArrayValues(value, array, start);
}
export function isTypedArray(data) {
    return !!data.buffer && typeof data.byteLength === 'number' && typeof data.BYTES_PER_ELEMENT === 'number';
}
export function typedArrayWindow(data, params) {
    var constructor = data.constructor, buffer = data.buffer, length = data.length, byteOffset = data.byteOffset, BYTES_PER_ELEMENT = data.BYTES_PER_ELEMENT;
    var _a = getArrayBounds(length, params), start = _a.start, end = _a.end;
    if (start === 0 && end === length)
        return data;
    return new constructor(buffer, byteOffset + BYTES_PER_ELEMENT * start, Math.min(length, end - start));
}
