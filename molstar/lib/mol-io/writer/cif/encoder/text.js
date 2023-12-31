/**
 * Copyright (c) 2017-2021 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * Adapted from CIFTools.js (https://github.com/dsehnal/CIFTools.js)
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { StringBuilder } from '../../../../mol-util/string-builder';
import { Category } from '../encoder';
import { getFieldDigitCount, getIncludedFields, getCategoryInstanceData } from './util';
var TextEncoder = /** @class */ (function () {
    function TextEncoder() {
        this.builder = StringBuilder.create();
        this.encoded = false;
        this.dataBlockCreated = false;
        this.filter = Category.DefaultFilter;
        this.formatter = Category.DefaultFormatter;
        this.isBinary = false;
        this.binaryEncodingProvider = void 0;
    }
    TextEncoder.prototype.setFilter = function (filter) {
        this.filter = filter || Category.DefaultFilter;
    };
    TextEncoder.prototype.isCategoryIncluded = function (name) {
        return this.filter.includeCategory(name);
    };
    TextEncoder.prototype.setFormatter = function (formatter) {
        this.formatter = formatter || Category.DefaultFormatter;
    };
    TextEncoder.prototype.startDataBlock = function (header) {
        this.dataBlockCreated = true;
        StringBuilder.write(this.builder, "data_".concat((header || '').replace(/[ \n\t]/g, '').toUpperCase(), "\n#\n"));
    };
    TextEncoder.prototype.writeCategory = function (category, context, options) {
        if (this.encoded) {
            throw new Error('The writer contents have already been encoded, no more writing.');
        }
        if (!this.dataBlockCreated) {
            throw new Error('No data block created.');
        }
        if (!(options === null || options === void 0 ? void 0 : options.ignoreFilter) && !this.filter.includeCategory(category.name))
            return;
        var _a = getCategoryInstanceData(category, context), instance = _a.instance, rowCount = _a.rowCount, source = _a.source;
        if (!rowCount)
            return;
        if (rowCount === 1) {
            writeCifSingleRecord(category, instance, source, this.builder, this.filter, this.formatter);
        }
        else {
            writeCifLoop(category, instance, source, this.builder, this.filter, this.formatter);
        }
    };
    TextEncoder.prototype.encode = function () {
        this.encoded = true;
    };
    TextEncoder.prototype.writeTo = function (stream) {
        var chunks = StringBuilder.getChunks(this.builder);
        for (var i = 0, _i = chunks.length; i < _i; i++) {
            stream.writeString(chunks[i]);
        }
    };
    TextEncoder.prototype.getSize = function () {
        return StringBuilder.getSize(this.builder);
    };
    TextEncoder.prototype.getData = function () {
        return StringBuilder.getString(this.builder);
    };
    return TextEncoder;
}());
export { TextEncoder };
function writeValue(builder, data, key, f, floatPrecision, index) {
    var kind = f.valueKind;
    var p = kind ? kind(key, data) : 0 /* Column.ValueKinds.Present */;
    if (p !== 0 /* Column.ValueKinds.Present */) {
        if (p === 1 /* Column.ValueKinds.NotPresent */)
            writeNotPresent(builder);
        else
            writeUnknown(builder);
    }
    else {
        var val = f.value(key, data, index);
        var t = f.type;
        if (t === 0 /* Field.Type.Str */) {
            if (isMultiline(val)) {
                writeMultiline(builder, val);
                return true;
            }
            else {
                return writeChecked(builder, val);
            }
        }
        else if (t === 1 /* Field.Type.Int */) {
            writeInteger(builder, val);
        }
        else {
            writeFloat(builder, val, floatPrecision);
        }
    }
    return false;
}
function getFloatPrecisions(categoryName, fields, formatter) {
    var ret = [];
    for (var _a = 0, fields_1 = fields; _a < fields_1.length; _a++) {
        var f = fields_1[_a];
        var format = formatter.getFormat(categoryName, f.name);
        if (format && typeof format.digitCount !== 'undefined')
            ret[ret.length] = f.type === 2 /* Field.Type.Float */ ? Math.pow(10, Math.max(0, Math.min(format.digitCount, 15))) : 0;
        else
            ret[ret.length] = f.type === 2 /* Field.Type.Float */ ? Math.pow(10, getFieldDigitCount(f)) : 0;
    }
    return ret;
}
function writeCifSingleRecord(category, instance, source, builder, filter, formatter) {
    var fields = getIncludedFields(instance);
    var src = source[0];
    var data = src.data;
    var width = fields.reduce(function (w, f) { return filter.includeField(category.name, f.name) ? Math.max(w, f.name.length) : 0; }, 0);
    // this means no field from this category is included.
    if (width === 0)
        return;
    width += category.name.length + 6;
    var it = src.keys();
    var key = it.move();
    var precisions = getFloatPrecisions(category.name, instance.fields, formatter);
    for (var _f = 0; _f < fields.length; _f++) {
        var f = fields[_f];
        if (!filter.includeField(category.name, f.name))
            continue;
        StringBuilder.writePadRight(builder, "_".concat(category.name, ".").concat(f.name), width);
        var multiline = writeValue(builder, data, key, f, precisions[_f], 0);
        if (!multiline)
            StringBuilder.newline(builder);
    }
    StringBuilder.write(builder, '#\n');
}
function writeCifLoop(category, instance, source, builder, filter, formatter) {
    var fieldSource = getIncludedFields(instance);
    var fields = filter === Category.DefaultFilter ? fieldSource : fieldSource.filter(function (f) { return filter.includeField(category.name, f.name); });
    var fieldCount = fields.length;
    if (fieldCount === 0)
        return;
    var precisions = getFloatPrecisions(category.name, fields, formatter);
    writeLine(builder, 'loop_');
    for (var i = 0; i < fieldCount; i++) {
        writeLine(builder, "_".concat(category.name, ".").concat(fields[i].name));
    }
    var index = 0;
    for (var _c = 0; _c < source.length; _c++) {
        var src = source[_c];
        var data = src.data;
        if (src.rowCount === 0)
            continue;
        var it_1 = src.keys();
        while (it_1.hasNext) {
            var key = it_1.move();
            var multiline = false;
            for (var _f = 0; _f < fieldCount; _f++) {
                multiline = writeValue(builder, data, key, fields[_f], precisions[_f], index);
            }
            if (!multiline)
                StringBuilder.newline(builder);
            index++;
        }
    }
    StringBuilder.write(builder, '#\n');
}
function isMultiline(value) {
    return typeof value === 'string' && value.indexOf('\n') >= 0;
}
function writeLine(builder, val) {
    StringBuilder.write(builder, val);
    StringBuilder.newline(builder);
}
function writeInteger(builder, val) {
    StringBuilder.writeInteger(builder, val);
    StringBuilder.whitespace1(builder);
}
function writeFloat(builder, val, precisionMultiplier) {
    StringBuilder.writeFloat(builder, val, precisionMultiplier);
    StringBuilder.whitespace1(builder);
}
function writeNotPresent(builder) {
    StringBuilder.writeSafe(builder, '. ');
}
function writeUnknown(builder) {
    StringBuilder.writeSafe(builder, '? ');
}
function writeChecked(builder, val) {
    if (!val) {
        StringBuilder.writeSafe(builder, '. ');
        return false;
    }
    var fst = val.charCodeAt(0);
    var escape = false;
    var escapeKind = 0; // 0 => ', 1 => "
    var hasSingleQuote = false, hasDoubleQuote = false;
    for (var i = 0, _l = val.length - 1; i <= _l; i++) {
        var c = val.charCodeAt(i);
        switch (c) {
            case 9: // \t
                escape = true;
                break;
            case 10: // \n
                writeMultiline(builder, val);
                return true;
            case 32: // ' '
                escape = true;
                break;
            case 34: // "
                // no need to escape quote if it's the last char and the length is > 1
                if (i && i === _l)
                    break;
                if (hasSingleQuote) {
                    // the string already has a " => use multiline value
                    writeMultiline(builder, val);
                    return true;
                }
                hasDoubleQuote = true;
                escape = true;
                escapeKind = 0;
                break;
            case 39: // '
                // no need to escape quote if it's the last char and the length is > 1
                if (i && i === _l)
                    break;
                if (hasDoubleQuote) {
                    writeMultiline(builder, val);
                    return true;
                }
                hasSingleQuote = true;
                escape = true;
                escapeKind = 1;
                break;
        }
    }
    if (!escape && (fst === 35 /* # */ || fst === 36 /* $ */ || fst === 59 /* ; */ || fst === 91 /* [ */ || fst === 93 /* ] */ || fst === 95 /* _ */)) {
        escape = true;
    }
    if (escape) {
        StringBuilder.writeSafe(builder, escapeKind ? '"' : '\'');
        StringBuilder.writeSafe(builder, val);
        StringBuilder.writeSafe(builder, escapeKind ? '" ' : '\' ');
    }
    else {
        StringBuilder.writeSafe(builder, val);
        StringBuilder.writeSafe(builder, ' ');
    }
    return false;
}
function writeMultiline(builder, val) {
    StringBuilder.writeSafe(builder, '\n;' + val);
    StringBuilder.writeSafe(builder, '\n;\n');
}
