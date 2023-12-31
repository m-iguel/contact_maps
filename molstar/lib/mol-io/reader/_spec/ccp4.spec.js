/**
 * Copyright (c) 2018 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { __awaiter, __generator } from "tslib";
import * as CCP4 from '../ccp4/parser';
function createCcp4Data() {
    var data = new Uint8Array(4 * 256 + 6);
    var dv = new DataView(data.buffer);
    dv.setInt8(52 * 4, 'M'.charCodeAt(0));
    dv.setInt8(52 * 4 + 1, 'A'.charCodeAt(0));
    dv.setInt8(52 * 4 + 2, 'P'.charCodeAt(0));
    dv.setInt8(52 * 4 + 3, ' '.charCodeAt(0));
    dv.setUint8(53 * 4, 17);
    dv.setUint8(53 * 4 + 1, 17);
    dv.setInt32(0 * 4, 1); // NC
    dv.setInt32(1 * 4, 2); // NR
    dv.setInt32(2 * 4, 3); // NS
    dv.setInt32(3 * 4, 0); // MODE
    return data;
}
describe('ccp4 reader', function () {
    it('basic', function () { return __awaiter(void 0, void 0, void 0, function () {
        var data, parsed, ccp4File, header;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    data = createCcp4Data();
                    return [4 /*yield*/, CCP4.parse(data, 'test.ccp4').run()];
                case 1:
                    parsed = _a.sent();
                    if (parsed.isError) {
                        throw new Error(parsed.message);
                    }
                    ccp4File = parsed.result;
                    header = ccp4File.header;
                    expect(header.NC).toBe(1);
                    expect(header.NR).toBe(2);
                    expect(header.NS).toBe(3);
                    return [2 /*return*/];
            }
        });
    }); });
});
