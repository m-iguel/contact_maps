import * as B from 'benchmark';
import { StringBuilder as SB } from '../mol-util/string-builder';
export var Test;
(function (Test) {
    function createData(n) {
        var ret = [];
        for (var i = 0; i < n; i++) {
            ret[i] = '' + ((100000000 * Math.random() + 1) | 0);
        }
        return ret;
    }
    function build(data, chunkSize) {
        var sb = SB.create(chunkSize);
        for (var i = 0, _i = data.length; i < _i; i++) {
            SB.writeSafe(sb, data[i]);
            SB.whitespace1(sb);
        }
        return sb;
    }
    function buildWS(data, chunkSize) {
        var sb = SB.create(chunkSize);
        for (var i = 0, _i = data.length; i < _i; i++) {
            SB.writeSafe(sb, data[i] + ' ');
        }
        return sb;
    }
    // function naive(data: string[]) {
    //     let ret = '';
    //     for (let i = 0, _i = data.length; i < _i; i++) ret += data[i];
    //     return ret;
    // }
    // function join(data: string[]) {
    //     let ret = [];
    //     for (let i = 0, _i = data.length; i < _i; i++) ret[i] = data[i];
    //     return ret.join('');
    // }
    function run() {
        var data = createData(26 * 100000);
        var N = 512;
        var suite = new B.Suite();
        suite
            // .add(`naive`, () => naive(data))
            // .add(`join`, () => join(data))
            // .add(`${N} chunks`, () => SB.getChunks(build(data, N)))
            .add("".concat(N, " str"), function () { return SB.getString(build(data, N)); })
            .add("".concat(N, " str ws"), function () { return SB.getString(buildWS(data, N)); })
            .on('cycle', function (e) { return console.log(String(e.target)); })
            .run();
    }
    Test.run = run;
})(Test || (Test = {}));
Test.run();
