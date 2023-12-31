/**
 * Copyright (c) 2017-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import * as ColumnHelpers from '../column-helpers';
import { Column } from '../column';
import { Table } from '../table';
describe('column', function () {
    var cc = Column.ofConst(10, 2, Column.Schema.int);
    var arr = Column.ofArray({ array: [1, 2, 3, 4], schema: Column.Schema.int });
    var arrNumberList = Column.ofArray({ array: [[1, 2], [3, 4], [5, 6]], schema: Column.Schema.List(' ', function (x) { return parseInt(x, 10); }) });
    var arrStringList = Column.ofArray({ array: [['a', 'b'], ['c', 'd'], ['e', 'f']], schema: Column.Schema.List(',', function (x) { return x; }) });
    var arrWindow = Column.window(arr, 1, 3);
    var typed = Column.ofArray({ array: new Int32Array([1, 2, 3, 4]), schema: Column.Schema.int });
    var typedWindow = Column.window(typed, 1, 3);
    var numStr = Column.ofArray({ array: [1, 2], schema: Column.Schema.str });
    it('constant', function () {
        expect(cc.rowCount).toBe(2);
        expect(cc.value(0)).toBe(10);
    });
    it('arr', function () {
        expect(arr.rowCount).toBe(4);
        expect(arr.value(1)).toBe(2);
        expect(arrWindow.value(0)).toBe(2);
        expect(arrWindow.rowCount).toBe(2);
    });
    it('arrList', function () {
        expect(arrNumberList.rowCount).toBe(3);
        expect(arrNumberList.value(1)).toEqual([3, 4]);
        expect(arrStringList.rowCount).toBe(3);
        expect(arrStringList.value(2)).toEqual(['e', 'f']);
    });
    it('typed', function () {
        expect(typedWindow.value(0)).toBe(2);
        expect(typedWindow.rowCount).toBe(2);
        expect(ColumnHelpers.isTypedArray(typedWindow.toArray())).toBe(true);
    });
    it('numStr', function () {
        expect(numStr.value(0)).toBe('1');
        expect(numStr.toArray()).toEqual(['1', '2']);
    });
    it('view', function () {
        expect(Column.view(arr, [1, 0, 3, 2]).toArray()).toEqual([2, 1, 4, 3]);
        expect(Column.view(arr, [1, 3]).toArray()).toEqual([2, 4]);
    });
    it('map to array', function () {
        expect(Column.mapToArray(arrWindow, function (x) { return x + 1; })).toEqual([3, 4]);
    });
});
describe('string column', function () {
    var xs = ['A', 'b', null, undefined];
    var xsArr = xs.map(function (x) { return x !== null && x !== void 0 ? x : ''; });
    var xsLC = xs.map(function (x) { return (x !== null && x !== void 0 ? x : '').toLowerCase(); });
    var arr = Column.ofArray({ array: xs, schema: Column.Schema.str });
    var arrLC = Column.ofArray({ array: xs, schema: Column.Schema.Str({ transform: 'lowercase' }) });
    var aliasedLC = Column.ofArray({ array: xs, schema: Column.Schema.Aliased(Column.Schema.lstr) });
    it('value', function () {
        var _a, _b;
        for (var i = 0; i < xs.length; i++) {
            expect(arr.value(i)).toBe((_a = xs[i]) !== null && _a !== void 0 ? _a : '');
            expect(arrLC.value(i)).toBe((_b = xsLC[i]) !== null && _b !== void 0 ? _b : '');
            expect(aliasedLC.value(i)).toBe(xsLC[i]);
        }
    });
    it('array', function () {
        expect(arr.toArray()).toEqual(xsArr);
        expect(arrLC.toArray()).toEqual(xsLC);
        expect(aliasedLC.toArray()).toEqual(xsLC);
    });
});
describe('table', function () {
    var schema = {
        x: Column.Schema.int,
        n: Column.Schema.str
    };
    it('ofRows', function () {
        var t = Table.ofRows(schema, [
            { x: 10, n: 'row1' },
            { x: -1, n: 'row2' },
        ]);
        expect(t.x.toArray()).toEqual([10, -1]);
        expect(t.n.toArray()).toEqual(['row1', 'row2']);
    });
    it('ofColumns', function () {
        var t = Table.ofColumns(schema, {
            x: Column.ofArray({ array: [10, -1], schema: Column.Schema.int }),
            n: Column.ofArray({ array: ['row1', 'row2'], schema: Column.Schema.str }),
        });
        expect(t.x.toArray()).toEqual([10, -1]);
        expect(t.n.toArray()).toEqual(['row1', 'row2']);
    });
    it('ofArrays', function () {
        var t = Table.ofArrays(schema, {
            x: [10, -1],
            n: ['row1', 'row2'],
        });
        expect(t.x.toArray()).toEqual([10, -1]);
        expect(t.n.toArray()).toEqual(['row1', 'row2']);
    });
    it('pickColumns', function () {
        var t = Table.ofColumns(schema, {
            x: Column.ofArray({ array: [10, -1], schema: Column.Schema.int }),
            n: Column.ofArray({ array: ['row1', 'row2'], schema: Column.Schema.str }),
        });
        var s = { x: Column.Schema.int, y: Column.Schema.int };
        var picked = Table.pickColumns(s, t, { y: Column.ofArray({ array: [3, 4], schema: Column.Schema.int }) });
        expect(picked._columns).toEqual(['x', 'y']);
        expect(picked._rowCount).toEqual(2);
        expect(picked.x.toArray()).toEqual([10, -1]);
        expect(picked.y.toArray()).toEqual([3, 4]);
    });
    it('view', function () {
        var t = Table.ofColumns(schema, {
            x: Column.ofArray({ array: [10, -1], schema: Column.Schema.int }),
            n: Column.ofArray({ array: ['row1', 'row2'], schema: Column.Schema.str }),
        });
        var s = { x: Column.Schema.int };
        var view = Table.view(t, s, [1]);
        expect(view._columns).toEqual(['x']);
        expect(view._rowCount).toEqual(1);
        expect(view.x.toArray()).toEqual([-1]);
    });
    it('sort', function () {
        var t = Table.ofColumns(schema, {
            x: Column.ofArray({ array: [10, -1], schema: Column.Schema.int }),
            n: Column.ofArray({ array: ['row1', 'row2'], schema: Column.Schema.str }),
        });
        var x = t.x;
        var sorted = Table.sort(t, function (i, j) { return x.value(i) - x.value(j); });
        expect(sorted.x.toArray()).toEqual([-1, 10]);
        expect(sorted.n.toArray()).toEqual(['row2', 'row1']);
    });
});
