import { __awaiter, __generator } from "tslib";
import * as B from 'benchmark';
import { now } from '../mol-util/now';
import { Scheduler } from '../mol-task/util/scheduler';
export var Tasks;
(function (Tasks) {
    var Yielding = /** @class */ (function () {
        function Yielding() {
            this.lastUpdated = 0;
        }
        Yielding.prototype.yield = function () {
            var t = now();
            if (t - this.lastUpdated < 250)
                return;
            this.lastUpdated = t;
            return Scheduler.immediatePromise();
        };
        return Yielding;
    }());
    Tasks.Yielding = Yielding;
    var CheckYielding = /** @class */ (function () {
        function CheckYielding() {
            this.lastUpdated = 0;
        }
        Object.defineProperty(CheckYielding.prototype, "needsYield", {
            get: function () {
                return now() - this.lastUpdated > 250;
            },
            enumerable: false,
            configurable: true
        });
        CheckYielding.prototype.yield = function () {
            this.lastUpdated = now();
            return Scheduler.immediatePromise();
        };
        return CheckYielding;
    }());
    Tasks.CheckYielding = CheckYielding;
    function yielding() {
        return __awaiter(this, void 0, void 0, function () {
            var y, ret, i;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.time('yielding');
                        y = new Yielding();
                        ret = 0;
                        i = 0;
                        _a.label = 1;
                    case 1:
                        if (!(i < 1000000)) return [3 /*break*/, 4];
                        ret += +(i.toString() + i.toString());
                        if (!(i % 10000 === 0)) return [3 /*break*/, 3];
                        return [4 /*yield*/, y.yield()];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        i++;
                        return [3 /*break*/, 1];
                    case 4:
                        console.timeEnd('yielding');
                        console.log(ret);
                        return [2 /*return*/, ret];
                }
            });
        });
    }
    Tasks.yielding = yielding;
    function yielding1() {
        return __awaiter(this, void 0, void 0, function () {
            var y, ret, yy, i;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.time('yielding1');
                        y = new Yielding();
                        ret = 0;
                        i = 0;
                        _a.label = 1;
                    case 1:
                        if (!(i < 1000000)) return [3 /*break*/, 4];
                        ret += +(i.toString() + i.toString());
                        if (!(i % 10000 === 0 && (yy = y.yield()))) return [3 /*break*/, 3];
                        return [4 /*yield*/, yy];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        i++;
                        return [3 /*break*/, 1];
                    case 4:
                        console.timeEnd('yielding1');
                        console.log(ret);
                        return [2 /*return*/, ret];
                }
            });
        });
    }
    Tasks.yielding1 = yielding1;
    function testYielding() {
        return __awaiter(this, void 0, void 0, function () {
            var y, ret, i;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.time('check yielding');
                        y = new CheckYielding();
                        ret = 0;
                        i = 0;
                        _a.label = 1;
                    case 1:
                        if (!(i < 1000000)) return [3 /*break*/, 4];
                        ret += +(i.toString() + i.toString());
                        if (!(i % 10000 === 0 && y.needsYield)) return [3 /*break*/, 3];
                        return [4 /*yield*/, y.yield()];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        i++;
                        return [3 /*break*/, 1];
                    case 4:
                        console.timeEnd('check yielding');
                        console.log(ret);
                        return [2 /*return*/, ret];
                }
            });
        });
    }
    Tasks.testYielding = testYielding;
    function baseline() {
        return __awaiter(this, void 0, void 0, function () {
            var ret, i;
            return __generator(this, function (_a) {
                console.time('baseline');
                ret = 0;
                for (i = 0; i < 1000000; i++) {
                    ret += +(i.toString() + i.toString());
                }
                console.timeEnd('baseline');
                console.log(ret);
                return [2 /*return*/, ret];
            });
        });
    }
    Tasks.baseline = baseline;
    function testImmediate() {
        return __awaiter(this, void 0, void 0, function () {
            var ret, y, i;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.time('immediate');
                        ret = 0;
                        y = new CheckYielding();
                        i = 0;
                        _a.label = 1;
                    case 1:
                        if (!(i < 1000000)) return [3 /*break*/, 4];
                        if (!(i % 10000 === 0)) return [3 /*break*/, 3];
                        return [4 /*yield*/, y.yield()];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        i++;
                        return [3 /*break*/, 1];
                    case 4:
                        console.timeEnd('immediate');
                        console.log(ret);
                        return [2 /*return*/, ret];
                }
            });
        });
    }
    Tasks.testImmediate = testImmediate;
    function run() {
        var _this = this;
        var suite = new B.Suite();
        suite
            .add("yielding", function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, yielding()];
                case 1: return [2 /*return*/, _a.sent()];
            }
        }); }); })
            // .add(`test yielding`, () => testYielding().then(() => { }))
            .on('cycle', function (e) { return console.log(String(e.target)); })
            .run();
    }
    Tasks.run = run;
    function add(x, y) {
        return x + y;
    }
    // async function addAs(x: number, y: number) {
    //     return x + y;
    // }
    function opAsync(n) {
        return __awaiter(this, void 0, void 0, function () {
            var ret, i, v, _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        ret = 0;
                        i = 0;
                        _c.label = 1;
                    case 1:
                        if (!(i < n)) return [3 /*break*/, 6];
                        v = add(i, i + 1);
                        _a = ret;
                        if (!v.then) return [3 /*break*/, 3];
                        return [4 /*yield*/, v];
                    case 2:
                        _b = _c.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        _b = v;
                        _c.label = 4;
                    case 4:
                        ret = _a + _b;
                        _c.label = 5;
                    case 5:
                        i++;
                        return [3 /*break*/, 1];
                    case 6: return [2 /*return*/, ret];
                }
            });
        });
    }
    function opNormal(n) {
        var ret = 0;
        for (var i = 0; i < n; i++) {
            ret += add(i, i + 1);
        }
        return ret;
    }
    function awaitF() {
        return __awaiter(this, void 0, void 0, function () {
            var N, _a, _b, _c, _d, _e, _f;
            return __generator(this, function (_g) {
                switch (_g.label) {
                    case 0:
                        N = 10000000;
                        console.time('async');
                        _b = (_a = console).log;
                        return [4 /*yield*/, opAsync(N)];
                    case 1:
                        _b.apply(_a, [_g.sent()]);
                        console.timeEnd('async');
                        console.time('async');
                        _d = (_c = console).log;
                        return [4 /*yield*/, opAsync(N)];
                    case 2:
                        _d.apply(_c, [_g.sent()]);
                        console.timeEnd('async');
                        console.time('async');
                        _f = (_e = console).log;
                        return [4 /*yield*/, opAsync(N)];
                    case 3:
                        _f.apply(_e, [_g.sent()]);
                        console.timeEnd('async');
                        console.time('normal');
                        console.log(opNormal(N));
                        console.timeEnd('normal');
                        console.time('normal');
                        console.log(opNormal(N));
                        console.timeEnd('normal');
                        console.time('normal');
                        console.log(opNormal(N));
                        console.timeEnd('normal');
                        return [2 /*return*/];
                }
            });
        });
    }
    Tasks.awaitF = awaitF;
})(Tasks || (Tasks = {}));
(function () {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: 
                // await Tasks.testImmediate();
                // await Tasks.testImmediate();
                // await Tasks.baseline();
                // await Tasks.yielding();
                // await Tasks.yielding1();
                // await Tasks.testYielding();
                // await Tasks.baseline();
                // await Tasks.yielding();
                // await Tasks.yielding1();
                // await Tasks.testYielding();
                return [4 /*yield*/, Tasks.awaitF()];
                case 1:
                    // await Tasks.testImmediate();
                    // await Tasks.testImmediate();
                    // await Tasks.baseline();
                    // await Tasks.yielding();
                    // await Tasks.yielding1();
                    // await Tasks.testYielding();
                    // await Tasks.baseline();
                    // await Tasks.yielding();
                    // await Tasks.yielding1();
                    // await Tasks.testYielding();
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}());
// console.time('test')
// Tasks.yielding();
// console.timeEnd('test')
// console.time('test')
// Tasks.yielding();
// console.timeEnd('test')
// console.time('test')
// Tasks.testYielding();
// console.timeEnd('test')
// console.time('test')
// Tasks.testYielding();
// console.timeEnd('test')
