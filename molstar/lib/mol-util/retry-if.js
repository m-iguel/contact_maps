/**
 * Copyright (c) 2018 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { __awaiter, __generator } from "tslib";
export function retryIf(promiseProvider, params) {
    var _a;
    return __awaiter(this, void 0, void 0, function () {
        var count, result, e_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    count = 0;
                    _b.label = 1;
                case 1:
                    if (!(count <= params.retryCount)) return [3 /*break*/, 6];
                    _b.label = 2;
                case 2:
                    _b.trys.push([2, 4, , 5]);
                    if (count > 0)
                        (_a = params.onRetry) === null || _a === void 0 ? void 0 : _a.call(params);
                    return [4 /*yield*/, promiseProvider()];
                case 3:
                    result = _b.sent();
                    if (params.retryThenIf && params.retryThenIf(result)) {
                        count++;
                        return [3 /*break*/, 1];
                    }
                    return [2 /*return*/, result];
                case 4:
                    e_1 = _b.sent();
                    if (!params.retryCatchIf || params.retryCatchIf(e_1)) {
                        count++;
                        return [3 /*break*/, 1];
                    }
                    throw e_1;
                case 5: return [3 /*break*/, 1];
                case 6: throw new Error('Maximum retry count exceeded.');
            }
        });
    });
}
