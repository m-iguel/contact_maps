/**
 * Copyright (c) 2017 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * From CIFTools.js
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { Encoding } from './encoding';
import { IsNativeEndianLittle, flipByteOrder } from '../binary';
import { assertUnreachable } from '../../../mol-util/type-helpers';
/**
 * Fixed point, delta, RLE, integer packing adopted from https://github.com/rcsb/mmtf-javascript/
 * by Alexander Rose <alexander.rose@weirdbyte.de>, MIT License, Copyright (c) 2016
 */
export function decode(data) {
    var current = data.data;
    for (var i = data.encoding.length - 1; i >= 0; i--) {
        current = decodeStep(current, data.encoding[i]);
    }
    return current;
}
function decodeStep(data, encoding) {
    switch (encoding.kind) {
        case 'ByteArray': {
            switch (encoding.type) {
                case Encoding.IntDataType.Uint8: return data;
                case Encoding.IntDataType.Int8: return int8(data);
                case Encoding.IntDataType.Int16: return int16(data);
                case Encoding.IntDataType.Uint16: return uint16(data);
                case Encoding.IntDataType.Int32: return int32(data);
                case Encoding.IntDataType.Uint32: return uint32(data);
                case Encoding.FloatDataType.Float32: return float32(data);
                case Encoding.FloatDataType.Float64: return float64(data);
                default: assertUnreachable(encoding.type);
            }
        }
        case 'FixedPoint': return fixedPoint(data, encoding);
        case 'IntervalQuantization': return intervalQuantization(data, encoding);
        case 'RunLength': return runLength(data, encoding);
        case 'Delta': return delta(data, encoding);
        case 'IntegerPacking': return integerPacking(data, encoding);
        case 'StringArray': return stringArray(data, encoding);
    }
}
function getIntArray(type, size) {
    switch (type) {
        case Encoding.IntDataType.Int8: return new Int8Array(size);
        case Encoding.IntDataType.Int16: return new Int16Array(size);
        case Encoding.IntDataType.Int32: return new Int32Array(size);
        case Encoding.IntDataType.Uint8: return new Uint8Array(size);
        case Encoding.IntDataType.Uint16: return new Uint16Array(size);
        case Encoding.IntDataType.Uint32: return new Uint32Array(size);
        default: assertUnreachable(type);
    }
}
function getFloatArray(type, size) {
    switch (type) {
        case Encoding.FloatDataType.Float32: return new Float32Array(size);
        case Encoding.FloatDataType.Float64: return new Float64Array(size);
        default: assertUnreachable(type);
    }
}
function int8(data) { return new Int8Array(data.buffer, data.byteOffset); }
function view(data, byteSize, c) {
    if (IsNativeEndianLittle)
        return new c(data.buffer);
    return new c(flipByteOrder(data, byteSize));
}
function int16(data) { return view(data, 2, Int16Array); }
function uint16(data) { return view(data, 2, Uint16Array); }
function int32(data) { return view(data, 4, Int32Array); }
function uint32(data) { return view(data, 4, Uint32Array); }
function float32(data) { return view(data, 4, Float32Array); }
function float64(data) { return view(data, 8, Float64Array); }
function fixedPoint(data, encoding) {
    var n = data.length;
    var output = getFloatArray(encoding.srcType, n);
    var f = 1 / encoding.factor;
    for (var i = 0; i < n; i++) {
        output[i] = f * data[i];
    }
    return output;
}
function intervalQuantization(data, encoding) {
    var n = data.length;
    var output = getFloatArray(encoding.srcType, n);
    var delta = (encoding.max - encoding.min) / (encoding.numSteps - 1);
    var min = encoding.min;
    for (var i = 0; i < n; i++) {
        output[i] = min + delta * data[i];
    }
    return output;
}
function runLength(data, encoding) {
    var output = getIntArray(encoding.srcType, encoding.srcSize);
    var dataOffset = 0;
    for (var i = 0, il = data.length; i < il; i += 2) {
        var value = data[i]; // value to be repeated
        var length_1 = data[i + 1]; // number of repeats
        for (var j = 0; j < length_1; ++j) {
            output[dataOffset++] = value;
        }
    }
    return output;
}
function delta(data, encoding) {
    var n = data.length;
    var output = getIntArray(encoding.srcType, n);
    if (!n)
        return data;
    output[0] = data[0] + (encoding.origin | 0);
    for (var i = 1; i < n; ++i) {
        output[i] = data[i] + output[i - 1];
    }
    return output;
}
function integerPackingSigned(data, encoding) {
    var upperLimit = encoding.byteCount === 1 ? 0x7F : 0x7FFF;
    var lowerLimit = -upperLimit - 1;
    var n = data.length;
    var output = new Int32Array(encoding.srcSize);
    var i = 0;
    var j = 0;
    while (i < n) {
        var value = 0, t = data[i];
        while (t === upperLimit || t === lowerLimit) {
            value += t;
            i++;
            t = data[i];
        }
        value += t;
        output[j] = value;
        i++;
        j++;
    }
    return output;
}
function integerPackingUnsigned(data, encoding) {
    var upperLimit = encoding.byteCount === 1 ? 0xFF : 0xFFFF;
    var n = data.length;
    var output = new Int32Array(encoding.srcSize);
    var i = 0;
    var j = 0;
    while (i < n) {
        var value = 0, t = data[i];
        while (t === upperLimit) {
            value += t;
            i++;
            t = data[i];
        }
        value += t;
        output[j] = value;
        i++;
        j++;
    }
    return output;
}
function integerPacking(data, encoding) {
    if (data.length === encoding.srcSize)
        return data;
    return encoding.isUnsigned ? integerPackingUnsigned(data, encoding) : integerPackingSigned(data, encoding);
}
function stringArray(data, encoding) {
    var offsets = decode({ encoding: encoding.offsetEncoding, data: encoding.offsets });
    var indices = decode({ encoding: encoding.dataEncoding, data: data });
    var str = encoding.stringData;
    var strings = new Array(offsets.length);
    strings[0] = '';
    for (var i = 1, _i = offsets.length; i < _i; i++) {
        strings[i] = str.substring(offsets[i - 1], offsets[i]);
    }
    var offset = 0;
    var result = new Array(indices.length);
    for (var i = 0, _i = indices.length; i < _i; i++) {
        result[offset++] = strings[indices[i] + 1];
    }
    return result;
}
