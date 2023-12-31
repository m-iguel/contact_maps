import * as B from 'benchmark';
import * as Sort from '../mol-data/util';
function shuffle(a) {
    for (var i = a.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var t = a[i];
        a[i] = a[j];
        a[j] = t;
    }
    return a;
}
function createTestData(n) {
    var data = new Int32Array(n); // new Array(n);
    for (var i = 0; i < n; i++) {
        data[i] = i;
        // data[i] = (n * Math.random()) | 0;
    }
    shuffle(data);
    return data;
}
export function copyArray(xs) {
    var ret = new xs.constructor(xs.length);
    for (var i = 0, _i = xs.length; i < _i; i++)
        ret[i] = xs[i];
    return ret;
}
export function checkSorted(arr) {
    for (var i = 0; i < arr.length - 1; i++) {
        if (arr[i] > arr[i + 1]) {
            return false;
        }
    }
    return true;
}
export function runTest(size) {
    var _data = createTestData(size);
    var dataCopies = [];
    var dataOffset = 0;
    function prepareData() {
        dataOffset = 0;
        for (var i = 0; i < 100; i++) {
            dataCopies[i] = copyArray(_data);
        }
    }
    function getData() {
        if (dataOffset < dataCopies.length)
            return dataCopies[dataOffset++];
        return copyArray(_data);
    }
    prepareData();
    var suite = new B.Suite();
    function le(x, y) { return x - y; }
    function name(n) { return "".concat(n, " (").concat(size, " elems)"); }
    // TODO: the data copying skewes the benchmark -- write a simple benchmark util that allows for a preparation step.
    suite
        .add(name('native'), function () { return Array.prototype.sort.call(getData(), le); })
        .add(name('qsort'), function () { return Sort.sortArray(getData()); })
        // .add(name('qsort'), () => Sort.sort(getData(), 0, _data.length, Sort.arrayLess, Sort.arraySwap))
        .add(name('native sorted'), function () { return Array.prototype.sort.call(_data, le); })
        .add(name('qsort sorted'), function () { return Sort.sortArray(_data); })
        // .add(name('qsort sorted'), () => Sort.sort(_data, 0, _data.length, Sort.arrayLess, Sort.arraySwap))
        .on('cycle', function (e) {
        prepareData();
        console.log(String(e.target));
    })
        .run();
    console.log('---------------------');
}
// runTest(10);
// runTest(100);
// runTest(1000);
runTest(10000);
// runTest(100000);
