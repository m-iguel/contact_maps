import * as B from 'benchmark';
import { Tuple, Segmentation, OrderedSet as OrdSet } from '../mol-data/int';
// import { ElementSet } from 'mol-model/structure'
// export namespace Iteration {
//     const U = 1000, V = 2500;
//     const control: number[] = [];
//     const sets = Object.create(null);
//     for (let i = 1; i < U; i++) {
//         const set = [];
//         for (let j = 1; j < V; j++) {
//             control[control.length] = j * j + 1;
//             set[set.length] = j * j + 1;
//         }
//         sets[i * i] = OrdSet.ofSortedArray(set);
//     }
//     const ms = ElementSet.create(sets);
//     export function native() {
//         let s = 0;
//         for (let i = 0, _i = control.length; i < _i; i++) s += control[i];
//         return s;
//     }
//     export function iterators() {
//         let s = 0;
//         const it = ElementSet.atoms(ms);
//         while (it.hasNext) {
//             const v = it.move();
//             s += Tuple.snd(v);
//         }
//         return s;
//     }
//     export function elementAt() {
//         let s = 0;
//         for (let i = 0, _i = ElementSet.atomCount(ms); i < _i; i++) s += Tuple.snd(ElementSet.atomGetAt(ms, i));
//         return s;
//     }
//     export function manual() {
//         let s = 0;
//         const keys = ElementSet.unitIds(ms);
//         for (let i = 0, _i = OrdSet.size(keys); i < _i; i++) {
//             const set = ElementSet.unitGetById(ms, OrdSet.getAt(keys, i));
//             for (let j = 0, _j = OrdSet.size(set); j < _j; j++) {
//                 s += OrdSet.getAt(set, j);
//             }
//         }
//         return s;
//     }
//     export function manual1() {
//         let s = 0;
//         for (let i = 0, _i = ElementSet.unitCount(ms); i < _i; i++) {
//             const set = ElementSet.unitGetByIndex(ms, i);
//             for (let j = 0, _j = OrdSet.size(set); j < _j; j++) {
//                 s += OrdSet.getAt(set, j);
//             }
//         }
//         return s;
//     }
//     export function run() {
//         const suite = new B.Suite();
//         // const values: number[] = [];
//         // for (let i = 0; i < 1000000; i++) values[i] = (Math.random() * 1000) | 0;
//         console.log(Iteration.native(), Iteration.iterators(), Iteration.elementAt(), Iteration.manual(), Iteration.manual1());
//         suite
//             .add('native', () => Iteration.native())
//             .add('iterators', () => Iteration.iterators())
//             .add('manual', () => Iteration.manual())
//             .add('manual1', () => Iteration.manual1())
//             .add('el at', () => Iteration.elementAt())
//             .on('cycle', (e: any) => console.log(String(e.target)))
//             .run();
//     }
// }
export var Union;
(function (Union) {
    function createArray(n) {
        var data = new Int32Array(n);
        var c = (Math.random() * 100) | 0;
        for (var i = 0; i < n; i++) {
            data[i] = c;
            c += 1 + (Math.random() * 100) | 0;
        }
        return data;
    }
    function rangeArray(o, n) {
        var data = new Int32Array(n);
        for (var i = 0; i < n; i++) {
            data[i] = o + i;
        }
        return data;
    }
    function createData(array) {
        var obj = Object.create(null);
        var set = new Set();
        for (var i = 0; i < array.length; i++) {
            var a = array[i];
            obj[a] = 1;
            set.add(a);
        }
        return { ordSet: OrdSet.ofSortedArray(array), obj: obj, set: set };
    }
    function unionOS(a, b) {
        return OrdSet.union(a, b);
    }
    function intOS(a, b) {
        return OrdSet.intersect(a, b);
    }
    function unionO(a, b) {
        var ret = Object.create(null);
        for (var _a = 0, _b = Object.keys(a); _a < _b.length; _a++) {
            var k = _b[_a];
            ret[k] = 1;
        }
        for (var _c = 0, _d = Object.keys(b); _c < _d.length; _c++) {
            var k = _d[_c];
            ret[k] = 1;
        }
        return ret;
    }
    function intO(a, b) {
        var ret = Object.create(null);
        for (var _a = 0, _b = Object.keys(a); _a < _b.length; _a++) {
            var k = _b[_a];
            if (b[k])
                ret[k] = 1;
        }
        return ret;
    }
    function _setAdd(x) { this.add(x); }
    function unionS(a, b) {
        var ret = new Set();
        a.forEach(_setAdd, ret);
        b.forEach(_setAdd, ret);
        return ret;
    }
    function _setInt(x) { if (this.other.has(x))
        this.set.add(x); }
    function intS(a, b) {
        if (a.size < b.size) {
            var ctx = { set: new Set(), other: b };
            a.forEach(_setInt, ctx);
            return ctx.set;
        }
        else {
            var ctx = { set: new Set(), other: a };
            b.forEach(_setInt, ctx);
            return ctx.set;
        }
    }
    function run() {
        var suite = new B.Suite();
        var _a = createData(createArray(1000)), osA = _a.ordSet, sA = _a.set, oA = _a.obj;
        var _b = createData(createArray(1000)), osB = _b.ordSet, sB = _b.set, oB = _b.obj;
        console.log(OrdSet.size(unionOS(osA, osB)), Object.keys(unionO(oA, oB)).length, unionS(sA, sB).size);
        console.log(OrdSet.size(intOS(osA, osB)), Object.keys(intO(oA, oB)).length, intS(sA, sB).size);
        suite
            .add('u ord set', function () { return unionOS(osA, osB); })
            .add('u obj', function () { return unionO(oA, oB); })
            .add('u ES6 set', function () { return unionS(sA, sB); })
            .add('i ord set', function () { return intOS(osA, osB); })
            .add('i obj', function () { return intO(oA, oB); })
            .add('i ES6 set', function () { return intS(sA, sB); })
            .on('cycle', function (e) { return console.log(String(e.target)); })
            .run();
    }
    Union.run = run;
    function runR() {
        var suite = new B.Suite();
        var rangeA = rangeArray(145, 1000);
        var rangeB = rangeArray(456, 1000);
        var _a = createData(rangeA), osA = _a.ordSet, sA = _a.set, oA = _a.obj;
        var _b = createData(rangeB), osB = _b.ordSet, sB = _b.set, oB = _b.obj;
        console.log(OrdSet.size(unionOS(osA, osB)), Object.keys(unionO(oA, oB)).length, unionS(sA, sB).size);
        console.log(OrdSet.size(intOS(osA, osB)), Object.keys(intO(oA, oB)).length, intS(sA, sB).size);
        suite
            .add('u ord set', function () { return unionOS(osA, osB); })
            .add('u obj', function () { return unionO(oA, oB); })
            .add('u ES6 set', function () { return unionS(sA, sB); })
            .add('i ord set', function () { return intOS(osA, osB); })
            .add('i obj', function () { return intO(oA, oB); })
            .add('i ES6 set', function () { return intS(sA, sB); })
            .on('cycle', function (e) { return console.log(String(e.target)); })
            .run();
    }
    Union.runR = runR;
})(Union || (Union = {}));
// export namespace Build {
//     function createSorted() {
//         const b = ElementSet.LinearBuilder(ElementSet.Empty);
//         for (let i = 0; i < 10; i++) {
//             for (let j = 0; j < 1000; j++) {
//                 b.add(i, j);
//             }
//         }
//         return b.getSet();
//     }
//     function createByUnit() {
//         const b = ElementSet.LinearBuilder(ElementSet.Empty);
//         for (let i = 0; i < 10; i++) {
//             b.beginUnit();
//             for (let j = 0; j < 1000; j++) {
//                 b.addToUnit(j);
//             }
//             b.commitUnit(i);
//         }
//         return b.getSet();
//     }
//     export function run() {
//         const suite = new B.Suite();
//         suite
//             .add('create sorted', () => createSorted())
//             .add('create by unit', () => createByUnit())
//             .on('cycle', (e: any) => console.log(String(e.target)))
//             .run();
//     }
// }
export var Tuples;
(function (Tuples) {
    function createData(n) {
        var ret = new Float64Array(n);
        for (var i = 0; i < n; i++) {
            ret[i] = Tuple.create(i, i * i + 1);
        }
        return ret;
    }
    function sum1(data) {
        var s = 0;
        for (var i = 0, _i = data.length; i < _i; i++) {
            s += Tuple.fst(data[i]) + Tuple.snd(data[i]);
        }
        return s;
    }
    function sum2(data) {
        var s = 0;
        for (var i = 0, _i = data.length; i < _i; i++) {
            var t = data[i];
            s += Tuple.fst(t) + Tuple.snd(t);
        }
        return s;
    }
    function run() {
        var suite = new B.Suite();
        var data = createData(10000);
        suite
            .add('sum fst/snd', function () { return sum1(data); })
            .add('sum fst/snd 1', function () { return sum2(data); })
            .on('cycle', function (e) { return console.log(String(e.target)); })
            .run();
    }
    Tuples.run = run;
})(Tuples || (Tuples = {}));
export function testSegments() {
    var data = OrdSet.ofSortedArray([4, 9, 10, 11, 14, 15, 16]);
    var segs = Segmentation.create([0, 4, 10, 12, 13, 15, 25]);
    var it = Segmentation.transientSegments(segs, data);
    while (it.hasNext) {
        var s = it.move();
        for (var j = s.start; j < s.end; j++) {
            console.log("".concat(s.index, ": ").concat(OrdSet.getAt(data, j)));
        }
    }
}
export var ObjectVsMap;
(function (ObjectVsMap) {
    function objCreate(keys) {
        var m = Object.create(null);
        m.x = 0;
        delete m.x;
        for (var i = 0, _i = keys.length; i < _i; i++) {
            m[keys[i]] = i * i;
        }
        return m;
    }
    function mapCreate(keys) {
        var m = new Map();
        for (var i = 0, _i = keys.length; i < _i; i++) {
            m.set(keys[i], i * i);
        }
        return m;
    }
    function objQuery(keys, n, obj) {
        var ret = 0;
        for (var i = 0; i < n; i++)
            ret += obj[keys[i % n]];
        return ret;
    }
    function mapQuery(keys, n, map) {
        var ret = 0;
        for (var i = 0; i < n; i++)
            ret += map.get(keys[i % n]);
        return ret;
    }
    function run() {
        var suite = new B.Suite();
        var keys = [];
        for (var i = 0; i < 1000; i++)
            keys[i] = 'k' + i;
        var N = 100000;
        var obj = objCreate(keys);
        var map = mapCreate(keys);
        suite
            .add('c obj', function () { return objCreate(keys); })
            .add('c map', function () { return mapCreate(keys); })
            .add('q obj', function () { return objQuery(keys, N, obj); })
            .add('q map', function () { return mapQuery(keys, N, map); })
            .on('cycle', function (e) { return console.log(String(e.target)); })
            .run();
    }
    ObjectVsMap.run = run;
})(ObjectVsMap || (ObjectVsMap = {}));
export var IntVsStringIndices;
(function (IntVsStringIndices) {
    function createCacheKeys(n) {
        var data = Object.create(null), keys = [];
        data.__ = void 0;
        delete data.__;
        for (var i = 1; i <= n; i++) {
            var k = i * (i + 1);
            keys[keys.length] = k;
            data[k] = i + 1;
        }
        return { data: data, keys: keys };
    }
    function createMapKeys(n) {
        var map = new Map(), keys = [];
        for (var i = 1; i <= n; i++) {
            var k = i * (i + 1);
            keys[keys.length] = k;
            map.set(k, i + 1);
        }
        return { map: map, keys: keys };
    }
    function createInt(n) {
        var ret = Object.create(null);
        ret.__ = void 0;
        delete ret.__;
        for (var i = 1; i <= n; i++)
            ret[i * (i + 1)] = i + 1;
        return ret;
    }
    IntVsStringIndices.createInt = createInt;
    function createStr(n) {
        var ret = Object.create(null);
        ret.__ = void 0;
        delete ret.__;
        for (var i = 1; i <= n; i++)
            ret['' + (i * (i + 1))] = i + 1;
        return ret;
    }
    IntVsStringIndices.createStr = createStr;
    function createMap(n) {
        var map = new Map();
        for (var i = 1; i <= n; i++)
            map.set(i * (i + 1), i + 1);
        return map;
    }
    IntVsStringIndices.createMap = createMap;
    function sumInt(xs) {
        var s = 0;
        var keys = Object.keys(xs);
        for (var i = 0, _i = keys.length; i < _i; i++)
            s += xs[+keys[i]];
        return s;
    }
    IntVsStringIndices.sumInt = sumInt;
    function sumStr(xs) {
        var s = 0;
        var keys = Object.keys(xs);
        for (var i = 0, _i = keys.length; i < _i; i++)
            s += xs[keys[i]];
        return s;
    }
    IntVsStringIndices.sumStr = sumStr;
    function sumMap(map) {
        var s = 0;
        var values = map.keys();
        while (true) {
            var _a = values.next(), done = _a.done, value = _a.value;
            if (done)
                break;
            s += value;
        }
        return s;
    }
    IntVsStringIndices.sumMap = sumMap;
    function sumCached(xs) {
        var s = 0;
        var keys = xs.keys, data = xs.data;
        for (var i = 0, _i = keys.length; i < _i; i++)
            s += data[keys[i]];
        return s;
    }
    IntVsStringIndices.sumCached = sumCached;
    function sumKeyMap(xs) {
        var s = 0;
        var keys = xs.keys, map = xs.map;
        for (var i = 0, _i = keys.length; i < _i; i++)
            s += map.get(keys[i]);
        return s;
    }
    IntVsStringIndices.sumKeyMap = sumKeyMap;
    function run() {
        var N = 1000;
        // const int = createInt(N);
        var map = createMap(N);
        // const str = createStr(N);
        var keys = createCacheKeys(N);
        var keyMap = createMapKeys(N);
        console.log(sumMap(map), sumCached(keys), sumKeyMap(keyMap));
        new B.Suite()
            // .add('c int', () => createInt(N))
            .add('q map', function () { return sumMap(map); })
            .add('c map', function () { return createMap(N); })
            .add('c mk', function () { return createMapKeys(N); })
            // .add('c str', () => createStr(N))
            .add('c cc', function () { return createCacheKeys(N); })
            // .add('q int', () => sumInt(int))
            .add('q mk', function () { return sumKeyMap(keyMap); })
            // .add('q str', () => sumStr(str))
            .add('q cc', function () { return sumCached(keys); })
            .on('cycle', function (e) { return console.log(String(e.target)); })
            .run();
    }
    IntVsStringIndices.run = run;
})(IntVsStringIndices || (IntVsStringIndices = {}));
IntVsStringIndices.run();
// ObjectVsMap.run();
// testSegments();
// Tuples.run();
// interface AA { kind: 'a' }
// //interface BB { kind: 'b' }
// interface AB { kind: 'a' | 'b' }
// declare const a: AA;
// export const ab: AB = a;
