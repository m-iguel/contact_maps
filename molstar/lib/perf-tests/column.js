import { __spreadArray } from "tslib";
import * as B from 'benchmark';
import { Column as C } from '../mol-data/db';
export var Column;
(function (Column) {
    function createData(n) {
        var ret = new Float32Array(n);
        for (var i = 0; i < n; i++) {
            ret[i] = i * i + 1;
        }
        return ret;
    }
    function raw(xs) {
        var sum = 0;
        for (var i = 0, _i = xs.length; i < _i; i++) {
            sum += xs[i];
        }
        return sum;
    }
    function column(col) {
        var sum = 0;
        for (var i = 0, _i = col.rowCount; i < _i; i++) {
            sum += col.value(i);
        }
        return sum;
    }
    function column1(col) {
        var sum = 0;
        for (var i = 0, _i = col.rowCount; i < _i; i++) {
            sum += col.value(i);
        }
        return sum;
    }
    function val(i) { return i * i + 1; }
    function runMono() {
        var suite = new B.Suite();
        var data = createData(1000);
        var nativeData = __spreadArray([], data, true);
        var col = C.ofArray({ array: data, schema: C.Schema.float });
        var lambda = C.ofLambda({ value: val, rowCount: data.length, schema: C.Schema.float });
        var cnst = C.ofConst(10, data.length, C.Schema.float);
        suite
            .add('raw', function () { return raw(data); })
            .add('native raw', function () { return raw(nativeData); })
            .add('arraycol', function () { return column(col); })
            .add('arraycol1', function () { return column(col); })
            .add('const', function () { return column1(cnst); })
            .add('arraycol2', function () { return column(col); })
            .add('lambda', function () { return column1(lambda); })
            .on('cycle', function (e) { return console.log(String(e.target)); })
            .run();
    }
    Column.runMono = runMono;
    function runPoly() {
        var suite = new B.Suite();
        var data = createData(10000);
        var nativeData = __spreadArray([], data, true);
        var col = C.ofArray({ array: data, schema: C.Schema.float });
        var lambda = C.ofLambda({ value: val, rowCount: data.length, schema: C.Schema.float });
        var cnst = C.ofConst(10, data.length, C.Schema.float);
        suite
            .add('raw', function () { return raw(data); })
            .add('native raw', function () { return raw(nativeData); })
            .add('arraycol', function () { return column(col); })
            .add('const', function () { return column(cnst); })
            .add('arraycol2', function () { return column(col); })
            .add('lambda', function () { return column(lambda); })
            .on('cycle', function (e) { return console.log(String(e.target)); })
            .run();
    }
    Column.runPoly = runPoly;
})(Column || (Column = {}));
Column.runMono();
Column.runPoly();
