/**
 * Copyright (c) 2020-2021 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { __awaiter, __generator } from "tslib";
import { deflate, inflate, unzip, zip } from '../zip/zip';
import { SyncRuntimeContext } from '../../mol-task/execution/synchronous';
describe('zip', function () {
    it('roundtrip deflate/inflate', function () { return __awaiter(void 0, void 0, void 0, function () {
        var data, deflated, inflated;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    data = new Uint8Array([1, 2, 3, 4, 5, 6, 7]);
                    return [4 /*yield*/, deflate(SyncRuntimeContext, data)];
                case 1:
                    deflated = _a.sent();
                    return [4 /*yield*/, inflate(SyncRuntimeContext, deflated)];
                case 2:
                    inflated = _a.sent();
                    expect(inflated).toEqual(data);
                    return [2 /*return*/];
            }
        });
    }); });
    it('roundtrip zip/unzip', function () { return __awaiter(void 0, void 0, void 0, function () {
        var data, zipped, unzipped;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    data = {
                        'test.foo': new Uint8Array([1, 2, 3, 4, 5, 6, 7])
                    };
                    return [4 /*yield*/, zip(SyncRuntimeContext, data)];
                case 1:
                    zipped = _a.sent();
                    return [4 /*yield*/, unzip(SyncRuntimeContext, zipped)];
                case 2:
                    unzipped = _a.sent();
                    expect(unzipped).toEqual(data);
                    return [2 /*return*/];
            }
        });
    }); });
});
