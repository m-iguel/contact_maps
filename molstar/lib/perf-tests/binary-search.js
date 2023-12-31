"use strict";
function createData(n) {
    var data = []; // new Int32Array(n);
    var last = (15 * Math.random()) | 0;
    for (var i = 0; i < n; i++) {
        data[i] = last;
        last += (15 * Math.random()) | 0;
    }
    return data;
}
function binarySearchHelper(list, t) {
    var min = 0, max = list.length - 1;
    while (min <= max) {
        if (min + 11 > max) {
            for (var i = min; i <= max; i++) {
                if (t === list[i])
                    return i;
            }
            return -1;
        }
        var mid = (min + max) >> 1;
        var v = list[mid];
        if (t < v)
            max = mid - 1;
        else if (t > v)
            min = mid + 1;
        else
            return mid;
    }
    return -1;
}
function objSearch(obj, val) {
    return typeof obj[val] !== 'undefined';
}
function setSearch(set, val) {
    return set.has(val);
}
function maskSearch(_a, val) {
    var min = _a.min, max = _a.max, mask = _a.mask;
    return val >= min && val <= max && !!mask[val - min];
}
function prepare(list) {
    var obj = Object.create(null), set = new Set();
    for (var i = 0; i < list.length; i++) {
        var v = list[i];
        obj[v] = i;
        set.add(v);
    }
    return { list: list, obj: obj, set: set };
}
function prepareSet(list) {
    var set = new Set();
    for (var i = 0; i < list.length; i++) {
        var v = list[i];
        set.add(v);
    }
    return set;
}
function prepareObj(list) {
    var obj = Object.create(null);
    for (var i = 0; i < list.length; i++) {
        var v = list[i];
        obj[v] = i;
    }
    return obj;
}
function prepareMask(list) {
    var max = Number.NEGATIVE_INFINITY, min = Number.POSITIVE_INFINITY;
    for (var i = 0; i < list.length; i++) {
        var v = list[i];
        if (max < v)
            max = v;
        if (min > v)
            min = v;
    }
    var mask = new Uint8Array(max - min + 1);
    for (var i = 0; i < list.length; i++) {
        var v = list[i];
        mask[v - min] = 1;
    }
    return { min: min, max: max, mask: mask };
}
function testBinary(list, points) {
    var r = 0;
    for (var i = 0, _i = points.length; i < _i; i++) {
        if (binarySearchHelper(list, points[i]) >= 0)
            r += points[i];
    }
    return r;
}
function testObj(obj, points) {
    var r = 0;
    for (var i = 0, _i = points.length; i < _i; i++) {
        if (objSearch(obj, points[i]))
            r += points[i];
    }
    return r;
}
function testSet(set, points) {
    var r = 0;
    for (var i = 0, _i = points.length; i < _i; i++) {
        if (setSearch(set, points[i]))
            r += points[i];
    }
    return r;
}
function testMask(mask, points) {
    var r = 0;
    for (var i = 0, _i = points.length; i < _i; i++) {
        if (maskSearch(mask, points[i]))
            r += points[i];
    }
    return r;
}
function run(f, n) {
    for (var i = 0; i < n; i++)
        f();
}
(function () {
    var size = 10000;
    var list = createData(size);
    var queryPoints = createData(size);
    var obj = prepareObj(list);
    var set = prepareSet(list);
    var mask = prepareMask(list);
    console.log('list', testBinary(list, queryPoints));
    console.log('obj', testObj(obj, queryPoints));
    console.log('set', testSet(set, queryPoints));
    console.log('mask', testMask(mask, queryPoints));
    console.log('----------------------');
    console.time('obj');
    run(function () { return testObj(obj, queryPoints); }, 100);
    console.timeEnd('obj');
    console.time('set');
    run(function () { return testSet(set, queryPoints); }, 100);
    console.timeEnd('set');
    console.time('bin-search');
    run(function () { return testBinary(list, queryPoints); }, 100);
    console.timeEnd('bin-search');
    console.time('mask-search');
    run(function () { return testMask(mask, queryPoints); }, 100);
    console.timeEnd('mask-search');
    console.log('----------------------');
    console.time('prepare-obj');
    run(function () { return prepareObj(list); }, 1);
    console.timeEnd('prepare-obj');
    console.time('prepare-set');
    run(function () { return prepareSet(list).size; }, 1);
    console.timeEnd('prepare-set');
    console.time('prepare-mask');
    run(function () { return prepareMask(list).min; }, 1);
    console.timeEnd('prepare-mask');
}());
