/**
 * Copyright (c) 2017-2018 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { __awaiter, __generator } from "tslib";
import * as Data from '../cif/data-model';
import * as Schema from '../cif/schema';
import { Column } from '../../../mol-data/db';
import { parseCifText } from '../cif/text/parser';
var columnData = "123abc d,e,f '4 5 6'";
// 123abc d,e,f '4 5 6'
var intField = Data.CifField.ofTokens({ data: columnData, indices: [0, 1, 1, 2, 2, 3], count: 3 });
var strField = Data.CifField.ofTokens({ data: columnData, indices: [3, 4, 4, 5, 5, 6], count: 3 });
var strListField = Data.CifField.ofTokens({ data: columnData, indices: [7, 12], count: 1 });
var intListField = Data.CifField.ofTokens({ data: columnData, indices: [14, 19], count: 1 });
var testBlock = Data.CifBlock(['test'], {
    test: Data.CifCategory('test', 3, ['int', 'str', 'strList', 'intList'], {
        int: intField,
        str: strField,
        strList: strListField,
        intList: intListField
    })
}, 'test');
var TestSchema;
(function (TestSchema) {
    TestSchema.test = {
        int: Column.Schema.int,
        str: Column.Schema.str,
        strList: Column.Schema.List(',', function (x) { return x; }),
        intList: Column.Schema.List(' ', function (x) { return parseInt(x, 10); })
    };
    TestSchema.schema = { test: TestSchema.test };
})(TestSchema || (TestSchema = {}));
test('cif triple quote', function () { return __awaiter(void 0, void 0, void 0, function () {
    var data, result, cat;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                data = "data_test\n_test.field1 '''123 \" '' 1'''\n_test.field2 ''' c glide reflection through the plane (x,1/4,z)\nchosen as one of the generators of the space group'''";
                return [4 /*yield*/, parseCifText(data).run()];
            case 1:
                result = _a.sent();
                if (result.isError) {
                    expect(false).toBe(true);
                    return [2 /*return*/];
                }
                cat = result.result.blocks[0].categories['test'];
                expect(cat.getField('field1').str(0)).toBe("123 \" '' 1");
                expect(cat.getField('field2').str(0)).toBe(" c glide reflection through the plane (x,1/4,z)\nchosen as one of the generators of the space group");
                return [2 /*return*/];
        }
    });
}); });
describe('schema', function () {
    var db = Schema.toDatabase(TestSchema.schema, testBlock);
    it('property access', function () {
        var _a = db.test, int = _a.int, str = _a.str, strList = _a.strList, intList = _a.intList;
        expect(int.value(0)).toBe(1);
        expect(str.value(1)).toBe('b');
        expect(strList.value(0)).toEqual(['d', 'e', 'f']);
        expect(intList.value(0)).toEqual([4, 5, 6]);
    });
    it('toArray', function () {
        var ret = db.test.int.toArray({ array: Int32Array });
        expect(ret.length).toBe(3);
        expect(ret[0]).toBe(1);
        expect(ret[1]).toBe(2);
        expect(ret[2]).toBe(3);
    });
});
