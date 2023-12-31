/*
 * Copyright (c) 2018 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * Adapted from LiteMol
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */
import { now } from '../mol-util/now';
var PerformanceMonitor = /** @class */ (function () {
    function PerformanceMonitor() {
        this.starts = new Map();
        this.ends = new Map();
    }
    PerformanceMonitor.currentTime = function () {
        return now();
    };
    PerformanceMonitor.prototype.start = function (name) {
        this.starts.set(name, now());
    };
    PerformanceMonitor.prototype.end = function (name) {
        this.ends.set(name, now());
    };
    PerformanceMonitor.format = function (t) {
        if (isNaN(t))
            return 'n/a';
        var h = Math.floor(t / (60 * 60 * 1000)), m = Math.floor(t / (60 * 1000) % 60), s = Math.floor(t / 1000 % 60);
        var ms = Math.floor(t % 1000).toString();
        while (ms.length < 3)
            ms = '0' + ms;
        if (h > 0)
            return "".concat(h, "h").concat(m, "m").concat(s, ".").concat(ms, "s");
        if (m > 0)
            return "".concat(m, "m").concat(s, ".").concat(ms, "s");
        if (s > 0)
            return "".concat(s, ".").concat(ms, "s");
        return "".concat(t.toFixed(0), "ms");
    };
    PerformanceMonitor.prototype.formatTime = function (name) {
        return PerformanceMonitor.format(this.time(name));
    };
    PerformanceMonitor.prototype.formatTimeSum = function () {
        var names = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            names[_i] = arguments[_i];
        }
        return PerformanceMonitor.format(this.timeSum.apply(this, names));
    };
    /** Returns the time in milliseconds and removes them from the cache. */
    PerformanceMonitor.prototype.time = function (name) {
        var start = this.starts.get(name), end = this.ends.get(name);
        this.starts.delete(name);
        this.ends.delete(name);
        return end - start;
    };
    PerformanceMonitor.prototype.timeSum = function () {
        var _this = this;
        var names = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            names[_i] = arguments[_i];
        }
        var t = 0;
        for (var _a = 0, _b = names.map(function (n) { return _this.ends.get(n) - _this.starts.get(n); }); _a < _b.length; _a++) {
            var m = _b[_a];
            t += m;
        }
        return t;
    };
    return PerformanceMonitor;
}());
export { PerformanceMonitor };
