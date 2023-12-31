/**
 * Copyright (c) 2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { __awaiter, __generator } from "tslib";
import * as fs from 'fs';
import { parseXtc } from '../mol-io/reader/xtc/parser';
console.log('reading');
console.time('read');
fs.readFile('C:\\Projects\\mol-star\\molstar\\build\\tests\\test.xtc', function (err, data) { return __awaiter(void 0, void 0, void 0, function () {
    var ret;
    var _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                console.log(err);
                console.timeEnd('read');
                console.time('parse');
                return [4 /*yield*/, parseXtc(new Uint8Array(data)).run(function (o) {
                        console.log("".concat(o.root.progress.current, "/").concat(o.root.progress.max));
                    }, 1000)];
            case 1:
                ret = _c.sent();
                console.timeEnd('parse');
                if (ret.isError) {
                    console.log(ret.message);
                }
                else {
                    console.log((_a = ret.result) === null || _a === void 0 ? void 0 : _a.frames.length);
                    console.log((_b = ret.result) === null || _b === void 0 ? void 0 : _b.frames[0].x[250]);
                }
                return [2 /*return*/];
        }
    });
}); });
