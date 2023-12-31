/**
 * Copyright (c) 2018 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { __awaiter, __generator } from "tslib";
import { getCifFieldType } from '../../../mol-io/reader/cif';
import { CifWriter } from '../../../mol-io/writer/cif';
import { Task } from '../../../mol-task';
// import { showProgress } from './util';
function getCategoryInstanceProvider(cat, fields) {
    return {
        name: cat.name,
        instance: function () { return CifWriter.categoryInstance(fields, { data: cat, rowCount: cat.rowCount }); }
    };
}
function classify(name, field) {
    var type = getCifFieldType(field);
    if (type['@type'] === 'str') {
        return { name: name, type: 0 /* CifWriter.Field.Type.Str */, value: field.str, valueKind: field.valueKind };
    }
    else if (type['@type'] === 'float') {
        return CifWriter.Field.float(name, field.float, { valueKind: field.valueKind, typedArray: Float64Array });
    }
    else {
        return CifWriter.Field.int(name, field.int, { valueKind: field.valueKind, typedArray: Int32Array });
    }
}
export function classifyCif(frame) {
    var _this = this;
    return Task.create('Classify CIF Data', function (ctx) { return __awaiter(_this, void 0, void 0, function () {
        var maxProgress, _i, _a, c, ret, current, _b, _c, c, cat, fields, _d, _e, f, cifField;
        return __generator(this, function (_f) {
            switch (_f.label) {
                case 0:
                    maxProgress = 0;
                    for (_i = 0, _a = frame.categoryNames; _i < _a.length; _i++) {
                        c = _a[_i];
                        maxProgress += frame.categories[c].fieldNames.length;
                    }
                    ret = [];
                    current = 0;
                    _b = 0, _c = frame.categoryNames;
                    _f.label = 1;
                case 1:
                    if (!(_b < _c.length)) return [3 /*break*/, 7];
                    c = _c[_b];
                    cat = frame.categories[c];
                    fields = [];
                    _d = 0, _e = cat.fieldNames;
                    _f.label = 2;
                case 2:
                    if (!(_d < _e.length)) return [3 /*break*/, 5];
                    f = _e[_d];
                    cifField = classify(f, cat.getField(f));
                    fields.push(cifField);
                    current++;
                    if (!ctx.shouldUpdate) return [3 /*break*/, 4];
                    return [4 /*yield*/, ctx.update({ message: 'Classifying...', current: current, max: maxProgress })];
                case 3:
                    _f.sent();
                    _f.label = 4;
                case 4:
                    _d++;
                    return [3 /*break*/, 2];
                case 5:
                    ret.push(getCategoryInstanceProvider(cat, fields));
                    _f.label = 6;
                case 6:
                    _b++;
                    return [3 /*break*/, 1];
                case 7: return [2 /*return*/, ret];
            }
        });
    }); }).run();
}
