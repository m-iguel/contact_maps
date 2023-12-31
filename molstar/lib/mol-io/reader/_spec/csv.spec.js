/**
 * Copyright (c) 2017 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { __awaiter, __generator } from "tslib";
import { parseCsv } from '../csv/parser';
var csvStringBasic = "StrCol,IntCol,FloatCol\n# comment\nstring1,-1,-0.34e3\nstring2,42,2.44";
var csvStringAdvanced = "StrCol,\"Int Col\",FloatCol\n string1  \t , -1,  -0.34e3\n    # comment\n   \" stri\nng2\" ,42, 2.44 ";
var tabString = "StrCol\tIntCol\tFloatCol\nstring1\t-1\t-0.34e3\nstring2\t42\t2.44";
describe('csv reader', function () {
    it('basic', function () { return __awaiter(void 0, void 0, void 0, function () {
        var parsed, csvFile, strCol, intCol, floatCol;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, parseCsv(csvStringBasic).run()];
                case 1:
                    parsed = _a.sent();
                    if (parsed.isError)
                        return [2 /*return*/];
                    csvFile = parsed.result;
                    strCol = csvFile.table.getColumn('StrCol');
                    if (strCol)
                        expect(strCol.toStringArray()).toEqual(['string1', 'string2']);
                    intCol = csvFile.table.getColumn('IntCol');
                    if (intCol)
                        expect(intCol.toIntArray()).toEqual([-1, 42]);
                    floatCol = csvFile.table.getColumn('FloatCol');
                    if (floatCol)
                        expect(floatCol.toFloatArray()).toEqual([-340.0, 2.44]);
                    expect.assertions(3);
                    return [2 /*return*/];
            }
        });
    }); });
    it('advanced', function () { return __awaiter(void 0, void 0, void 0, function () {
        var parsed, csvFile, strCol, intCol, floatCol;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, parseCsv(csvStringAdvanced).run()];
                case 1:
                    parsed = _a.sent();
                    if (parsed.isError)
                        return [2 /*return*/];
                    csvFile = parsed.result;
                    strCol = csvFile.table.getColumn('StrCol');
                    if (strCol)
                        expect(strCol.toStringArray()).toEqual(['string1', ' stri\nng2']);
                    intCol = csvFile.table.getColumn('Int Col');
                    if (intCol)
                        expect(intCol.toIntArray()).toEqual([-1, 42]);
                    floatCol = csvFile.table.getColumn('FloatCol');
                    if (floatCol)
                        expect(floatCol.toFloatArray()).toEqual([-340.0, 2.44]);
                    expect.assertions(3);
                    return [2 /*return*/];
            }
        });
    }); });
    it('tabs', function () { return __awaiter(void 0, void 0, void 0, function () {
        var parsed, csvFile, strCol, intCol, floatCol;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, parseCsv(tabString, { delimiter: '\t' }).run()];
                case 1:
                    parsed = _a.sent();
                    if (parsed.isError)
                        return [2 /*return*/];
                    csvFile = parsed.result;
                    strCol = csvFile.table.getColumn('StrCol');
                    if (strCol)
                        expect(strCol.toStringArray()).toEqual(['string1', 'string2']);
                    intCol = csvFile.table.getColumn('IntCol');
                    if (intCol)
                        expect(intCol.toIntArray()).toEqual([-1, 42]);
                    floatCol = csvFile.table.getColumn('FloatCol');
                    if (floatCol)
                        expect(floatCol.toFloatArray()).toEqual([-340.0, 2.44]);
                    expect.assertions(3);
                    return [2 /*return*/];
            }
        });
    }); });
});
