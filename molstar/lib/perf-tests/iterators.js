import * as B from 'benchmark';
import { Iterator as It } from '../mol-data/iterator';
function createData(n) {
    var data = []; // new Int32Array(n);
    var last = (15 * Math.random()) | 0;
    for (var i = 0; i < n; i++) {
        data[i] = last;
        last += (15 * Math.random()) | 0;
    }
    return data;
}
export var Iterators;
(function (Iterators) {
    var data = createData(100000);
    function forLoop() {
        var sum = 0;
        for (var i = 0, _i = data.length; i < _i; i++) {
            sum += data[i];
        }
        return sum;
    }
    Iterators.forLoop = forLoop;
    function forOf() {
        var sum = 0;
        for (var _a = 0, data_1 = data; _a < data_1.length; _a++) {
            var e = data_1[_a];
            sum += e;
        }
        return sum;
    }
    Iterators.forOf = forOf;
    function forEach() {
        var ctx = { sum: 0 };
        data.forEach(function (v) { this.sum += v; }, ctx);
        return ctx.sum;
    }
    Iterators.forEach = forEach;
    function forEachAllParams() {
        var ctx = { sum: 0 };
        data.forEach(function (v, _, __) { this.sum += v; }, ctx);
        return ctx.sum;
    }
    Iterators.forEachAllParams = forEachAllParams;
    function forEachClosure() {
        var sum = 0;
        data.forEach(function (v) { return sum += v; });
        return sum;
    }
    Iterators.forEachClosure = forEachClosure;
    function forEachClosureAll() {
        var sum = 0;
        data.forEach(function (v, _, __) { return sum += v; });
        return sum;
    }
    Iterators.forEachClosureAll = forEachClosureAll;
    function forEachClosureAllFunction() {
        var sum = 0;
        data.forEach(function (v, _, __) { sum += v; });
        return sum;
    }
    Iterators.forEachClosureAllFunction = forEachClosureAllFunction;
    var _MutableES6Iterator = /** @class */ (function () {
        function _MutableES6Iterator() {
            this.done = true;
            this.value = 0;
            this.xs = void 0;
            this.index = -1;
            this.length = 0;
        }
        _MutableES6Iterator.prototype[Symbol.iterator] = function () { return this; };
        ;
        _MutableES6Iterator.prototype.next = function () {
            var index = ++this.index;
            if (index < this.length)
                this.value = this.xs[index];
            else
                this.done = true;
            return this;
        };
        _MutableES6Iterator.prototype.reset = function (xs) {
            this.value = xs[0];
            this.length = xs.length;
            this.done = false;
            this.xs = xs;
            this.index = -1;
            return this;
        };
        return _MutableES6Iterator;
    }());
    var _ImmutableES6Iterator = /** @class */ (function () {
        function _ImmutableES6Iterator() {
            this.done = true;
            this.value = 0;
            this.xs = void 0;
            this.index = -1;
            this.length = 0;
        }
        _ImmutableES6Iterator.prototype[Symbol.iterator] = function () { return this; };
        ;
        _ImmutableES6Iterator.prototype.next = function () {
            var index = ++this.index;
            if (index < this.length)
                this.value = this.xs[index];
            else
                this.done = true;
            return { done: this.done, value: this.value };
        };
        _ImmutableES6Iterator.prototype.reset = function (xs) {
            this.value = xs[0];
            this.length = xs.length;
            this.done = false;
            this.xs = xs;
            this.index = -1;
            return this;
        };
        return _ImmutableES6Iterator;
    }());
    function mutableES6Iterator() {
        var it = new _MutableES6Iterator();
        var sum = 0;
        for (var e = it.reset(data).next().value; !it.done; e = it.next().value) {
            sum += e;
        }
        return sum;
    }
    Iterators.mutableES6Iterator = mutableES6Iterator;
    // export function mutableES6IteratorOf() {
    //     const it = new _ImmutableES6Iterator();
    //     let sum = 0;
    //     for (const e of it.reset(data)) {
    //         sum += e;
    //     }
    //     return sum;
    // }
    function immutableES6Iterator() {
        var it = new _ImmutableES6Iterator();
        var sum = 0;
        it.reset(data);
        while (true) {
            var _a = it.next(), value = _a.value, done = _a.done;
            if (done)
                break;
            sum += value;
        }
        return sum;
    }
    Iterators.immutableES6Iterator = immutableES6Iterator;
    var _MutableIterator = /** @class */ (function () {
        function _MutableIterator() {
            this.done = true;
            this.xs = void 0;
            this.index = -1;
            this.length = 0;
        }
        _MutableIterator.prototype.next = function () {
            var index = ++this.index;
            if (index < this.length)
                return this.xs[index];
            else {
                this.done = true;
                return 0;
            }
        };
        _MutableIterator.prototype.start = function (xs) {
            this.length = xs.length;
            this.done = !this.length;
            this.xs = xs;
            this.index = 0;
            return this.done ? 0 : this.xs[0];
        };
        return _MutableIterator;
    }());
    function mutableIterator() {
        var it = new _MutableIterator();
        var sum = 0;
        for (var e = it.start(data); !it.done; e = it.next()) {
            sum += e;
        }
        return sum;
    }
    Iterators.mutableIterator = mutableIterator;
    function run() {
        var suite = new B.Suite();
        suite
            .add('for', function () { return Iterators.forLoop(); })
            .add('forOf', function () { return Iterators.forOf(); })
            .add('forEach', function () { return Iterators.forEach(); })
            .add('forEach all params', function () { return Iterators.forEachAllParams(); })
            .add('forEachClosure', function () { return Iterators.forEachClosure(); })
            .add('forEachClosure all', function () { return Iterators.forEachClosureAll(); })
            .add('forEachClosure all function', function () { return Iterators.forEachClosureAllFunction(); })
            .add('mutableIterator ES6', function () { return Iterators.mutableES6Iterator(); })
            // .add('mutableIteratorOf ES6', () => Iterators.mutableES6IteratorOf())
            .add('immutableIterator ES6', function () { return Iterators.immutableES6Iterator(); })
            // .add('immutableIteratorOf ES6', () => Iterators.immutableES6IteratorOf())
            .add('mutableIterator', function () { return Iterators.mutableIterator(); })
            .on('cycle', function (e) {
            console.log(String(e.target));
        })
            // .on('complete', function (this: any) {
            //     console.log('Fastest is ' + this.filter('fastest').map('name'));
            // })
            .run();
    }
    Iterators.run = run;
})(Iterators || (Iterators = {}));
var it = It.Array([1, 2, 3]);
while (it.hasNext) {
    console.log(it.move());
}
