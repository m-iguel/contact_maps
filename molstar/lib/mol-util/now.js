/**
 * Copyright (c) 2017 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
var now = (function () {
    if (typeof window !== 'undefined' && window.performance) {
        var perf_1 = window.performance;
        return function () { return perf_1.now(); };
    }
    else if (typeof process !== 'undefined' && process.hrtime !== 'undefined' && typeof process.hrtime === 'function') {
        return function () {
            var t = process.hrtime();
            return t[0] * 1000 + t[1] / 1000000;
        };
    }
    else if (Date.now) {
        return function () { return Date.now(); };
    }
    else {
        return function () { return +new Date(); };
    }
}());
function formatTimespan(t, includeMsZeroes) {
    if (includeMsZeroes === void 0) { includeMsZeroes = true; }
    if (isNaN(t))
        return 'n/a';
    var h = Math.floor(t / (60 * 60 * 1000)), m = Math.floor(t / (60 * 1000) % 60), s = Math.floor(t / 1000 % 60);
    var ms = Math.floor(t % 1000).toString();
    while (ms.length < 3)
        ms = '0' + ms;
    while (!includeMsZeroes && ms.length > 1 && ms[ms.length - 1] === '0')
        ms = ms.substr(0, ms.length - 1);
    if (h > 0)
        return "".concat(h, "h").concat(m, "m").concat(s, ".").concat(ms, "s");
    if (m > 0)
        return "".concat(m, "m").concat(s, ".").concat(ms, "s");
    if (s > 0)
        return "".concat(s, ".").concat(ms, "s");
    return "".concat(t.toFixed(0), "ms");
}
export { now, formatTimespan };
