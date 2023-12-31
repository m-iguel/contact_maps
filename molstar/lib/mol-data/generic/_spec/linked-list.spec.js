/**
 * Copyright (c) 2017 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { LinkedList } from '../linked-list';
describe('linked list', function () {
    function toArray(list) {
        var ret = [];
        for (var t = list.first; !!t; t = t.next) {
            ret[ret.length] = t.value;
        }
        return ret;
    }
    function create(xs) {
        var list = LinkedList();
        for (var _i = 0, xs_1 = xs; _i < xs_1.length; _i++) {
            var x = xs_1[_i];
            list.addLast(x);
        }
        return list;
    }
    it('add', function () {
        var list = LinkedList();
        list.addFirst(1);
        list.addLast(2);
        list.addFirst(3);
        list.addFirst(4);
        list.addLast(5);
        expect(toArray(list)).toEqual([4, 3, 1, 2, 5]);
        expect(list.count).toBe(5);
    });
    it('remove', function () {
        var list = create([1, 2, 3, 4]);
        var fst = list.removeFirst();
        expect(fst).toBe(1);
        expect(list.last.value).toBe(4);
        expect(list.count).toBe(3);
        expect(toArray(list)).toEqual([2, 3, 4]);
        var last = list.removeLast();
        expect(last).toBe(4);
        expect(list.last.value).toBe(3);
        expect(list.count).toBe(2);
        expect(toArray(list)).toEqual([2, 3]);
        var n3 = list.find(3);
        list.remove(n3);
        expect(list.first.value).toBe(2);
        expect(list.last.value).toBe(2);
        expect(list.count).toBe(1);
        expect(toArray(list)).toEqual([2]);
        list.removeFirst();
        expect(list.first).toBe(null);
        expect(list.last).toBe(null);
        expect(list.count).toBe(0);
        expect(toArray(list)).toEqual([]);
    });
});
