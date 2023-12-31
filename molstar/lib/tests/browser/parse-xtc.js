/**
 * Copyright (c) 2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { __awaiter, __generator } from "tslib";
import { parseXtc } from '../../mol-io/reader/xtc/parser';
import './index.html';
var parent = document.getElementById('app');
var btn = document.createElement('button');
btn.innerText = 'run';
btn.onclick = run;
parent.appendChild(btn);
function run() {
    return __awaiter(this, void 0, void 0, function () {
        var req, data, ret;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, fetch('test.xtc')];
                case 1:
                    req = _a.sent();
                    return [4 /*yield*/, req.arrayBuffer()];
                case 2:
                    data = _a.sent();
                    console.log(data.byteLength);
                    console.time('parse');
                    return [4 /*yield*/, parseXtc(new Uint8Array(data)).run(function (o) {
                            console.log(o.root.progress.current, o.root.progress.max);
                        }, 1000)];
                case 3:
                    ret = _a.sent();
                    console.timeEnd('parse');
                    console.log(ret);
                    btn.innerText = 'done';
                    return [2 /*return*/];
            }
        });
    });
}
