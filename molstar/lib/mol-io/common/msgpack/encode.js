/*
 * Copyright (c) 2017 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * Adapted from https://github.com/rcsb/mmtf-javascript
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { utf8ByteCount, utf8Write } from '../utf8';
export function encodeMsgPack(value) {
    var buffer = new ArrayBuffer(encodedSize(value));
    var view = new DataView(buffer);
    var bytes = new Uint8Array(buffer);
    encodeInternal(value, view, bytes, 0);
    return bytes;
}
function encodedSize(value) {
    var type = typeof value;
    // Raw Bytes
    if (type === 'string') {
        var length_1 = utf8ByteCount(value);
        if (length_1 < 0x20) {
            return 1 + length_1;
        }
        if (length_1 < 0x100) {
            return 2 + length_1;
        }
        if (length_1 < 0x10000) {
            return 3 + length_1;
        }
        if (length_1 < 0x100000000) {
            return 5 + length_1;
        }
    }
    if (value instanceof Uint8Array) {
        var length_2 = value.byteLength;
        if (length_2 < 0x100) {
            return 2 + length_2;
        }
        if (length_2 < 0x10000) {
            return 3 + length_2;
        }
        if (length_2 < 0x100000000) {
            return 5 + length_2;
        }
    }
    if (type === 'number') {
        // Floating Point
        // double
        if (Math.floor(value) !== value)
            return 9;
        // Integers
        if (value >= 0) {
            // positive fixnum
            if (value < 0x80)
                return 1;
            // uint 8
            if (value < 0x100)
                return 2;
            // uint 16
            if (value < 0x10000)
                return 3;
            // uint 32
            if (value < 0x100000000)
                return 5;
            throw new Error('Number too big 0x' + value.toString(16));
        }
        // negative fixnum
        if (value >= -0x20)
            return 1;
        // int 8
        if (value >= -0x80)
            return 2;
        // int 16
        if (value >= -0x8000)
            return 3;
        // int 32
        if (value >= -0x80000000)
            return 5;
        throw new Error('Number too small -0x' + value.toString(16).substr(1));
    }
    // Boolean, null
    if (type === 'boolean' || value === null || value === void 0)
        return 1;
    // Container Types
    if (type === 'object') {
        var length_3, size = 0;
        if (Array.isArray(value)) {
            length_3 = value.length;
            for (var i = 0; i < length_3; i++) {
                size += encodedSize(value[i]);
            }
        }
        else {
            var keys = Object.keys(value);
            length_3 = keys.length;
            for (var i = 0; i < length_3; i++) {
                var key = keys[i];
                size += encodedSize(key) + encodedSize(value[key]);
            }
        }
        if (length_3 < 0x10) {
            return 1 + size;
        }
        if (length_3 < 0x10000) {
            return 3 + size;
        }
        if (length_3 < 0x100000000) {
            return 5 + size;
        }
        throw new Error('Array or object too long 0x' + length_3.toString(16));
    }
    throw new Error('Unknown type ' + type);
}
function encodeInternal(value, view, bytes, offset) {
    var type = typeof value;
    // Strings Bytes
    if (type === 'string') {
        var length_4 = utf8ByteCount(value);
        // fix str
        if (length_4 < 0x20) {
            view.setUint8(offset, length_4 | 0xa0);
            utf8Write(bytes, offset + 1, value);
            return 1 + length_4;
        }
        // str 8
        if (length_4 < 0x100) {
            view.setUint8(offset, 0xd9);
            view.setUint8(offset + 1, length_4);
            utf8Write(bytes, offset + 2, value);
            return 2 + length_4;
        }
        // str 16
        if (length_4 < 0x10000) {
            view.setUint8(offset, 0xda);
            view.setUint16(offset + 1, length_4);
            utf8Write(bytes, offset + 3, value);
            return 3 + length_4;
        }
        // str 32
        if (length_4 < 0x100000000) {
            view.setUint8(offset, 0xdb);
            view.setUint32(offset + 1, length_4);
            utf8Write(bytes, offset + 5, value);
            return 5 + length_4;
        }
    }
    if (value instanceof Uint8Array) {
        var length_5 = value.byteLength;
        var bytes_1 = new Uint8Array(view.buffer);
        // bin 8
        if (length_5 < 0x100) {
            view.setUint8(offset, 0xc4);
            view.setUint8(offset + 1, length_5);
            bytes_1.set(value, offset + 2);
            return 2 + length_5;
        }
        // bin 16
        if (length_5 < 0x10000) {
            view.setUint8(offset, 0xc5);
            view.setUint16(offset + 1, length_5);
            bytes_1.set(value, offset + 3);
            return 3 + length_5;
        }
        // bin 32
        if (length_5 < 0x100000000) {
            view.setUint8(offset, 0xc6);
            view.setUint32(offset + 1, length_5);
            bytes_1.set(value, offset + 5);
            return 5 + length_5;
        }
    }
    if (type === 'number') {
        if (!isFinite(value)) {
            throw new Error('Number not finite: ' + value);
        }
        // Floating point
        if (Math.floor(value) !== value) {
            view.setUint8(offset, 0xcb);
            view.setFloat64(offset + 1, value);
            return 9;
        }
        // Integers
        if (value >= 0) {
            // positive fixnum
            if (value < 0x80) {
                view.setUint8(offset, value);
                return 1;
            }
            // uint 8
            if (value < 0x100) {
                view.setUint8(offset, 0xcc);
                view.setUint8(offset + 1, value);
                return 2;
            }
            // uint 16
            if (value < 0x10000) {
                view.setUint8(offset, 0xcd);
                view.setUint16(offset + 1, value);
                return 3;
            }
            // uint 32
            if (value < 0x100000000) {
                view.setUint8(offset, 0xce);
                view.setUint32(offset + 1, value);
                return 5;
            }
            throw new Error('Number too big 0x' + value.toString(16));
        }
        // negative fixnum
        if (value >= -0x20) {
            view.setInt8(offset, value);
            return 1;
        }
        // int 8
        if (value >= -0x80) {
            view.setUint8(offset, 0xd0);
            view.setInt8(offset + 1, value);
            return 2;
        }
        // int 16
        if (value >= -0x8000) {
            view.setUint8(offset, 0xd1);
            view.setInt16(offset + 1, value);
            return 3;
        }
        // int 32
        if (value >= -0x80000000) {
            view.setUint8(offset, 0xd2);
            view.setInt32(offset + 1, value);
            return 5;
        }
        throw new Error('Number too small -0x' + (-value).toString(16).substr(1));
    }
    // null
    if (value === null || value === undefined) {
        view.setUint8(offset, 0xc0);
        return 1;
    }
    // Boolean
    if (type === 'boolean') {
        view.setUint8(offset, value ? 0xc3 : 0xc2);
        return 1;
    }
    // Container Types
    if (type === 'object') {
        var length_6, size = 0;
        var isArray = Array.isArray(value);
        var keys = void 0;
        if (isArray) {
            length_6 = value.length;
        }
        else {
            keys = Object.keys(value);
            length_6 = keys.length;
        }
        if (length_6 < 0x10) {
            view.setUint8(offset, length_6 | (isArray ? 0x90 : 0x80));
            size = 1;
        }
        else if (length_6 < 0x10000) {
            view.setUint8(offset, isArray ? 0xdc : 0xde);
            view.setUint16(offset + 1, length_6);
            size = 3;
        }
        else if (length_6 < 0x100000000) {
            view.setUint8(offset, isArray ? 0xdd : 0xdf);
            view.setUint32(offset + 1, length_6);
            size = 5;
        }
        if (isArray) {
            for (var i = 0; i < length_6; i++) {
                size += encodeInternal(value[i], view, bytes, offset + size);
            }
        }
        else {
            for (var i = 0, _i = keys.length; i < _i; i++) {
                var key = keys[i];
                size += encodeInternal(key, view, bytes, offset + size);
                size += encodeInternal(value[key], view, bytes, offset + size);
            }
        }
        return size;
    }
    throw new Error('Unknown type ' + type);
}
