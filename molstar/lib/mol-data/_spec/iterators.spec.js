/**
 * Copyright (c) 2017 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { Iterator } from '../iterator';
function iteratorToArray(it) {
    var ret = [];
    while (it.hasNext) {
        var v = it.move();
        ret[ret.length] = v;
    }
    return ret;
}
describe('basic iterators', function () {
    function check(name, iter, expected) {
        it(name, function () {
            expect(iteratorToArray(iter)).toEqual(expected);
        });
    }
    check('empty', Iterator.Empty, []);
    check('singleton', Iterator.Value(10), [10]);
    check('array', Iterator.Array([1, 2, 3]), [1, 2, 3]);
    check('range', Iterator.Range(0, 3), [0, 1, 2, 3]);
    check('map', Iterator.map(Iterator.Range(0, 1), function (x) { return x + 1; }), [1, 2]);
    check('filter', Iterator.filter(Iterator.Range(0, 3), function (x) { return x >= 2; }), [2, 3]);
});
