/**
 * Copyright (c) 2017 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { LinkedIndex } from '../linked-index';
describe('linked-index', function () {
    it('initial state', function () {
        var index = LinkedIndex(2);
        expect(index.head).toBe(0);
        expect(index.has(0)).toBe(true);
        expect(index.has(1)).toBe(true);
    });
    it('singleton', function () {
        var index = LinkedIndex(1);
        expect(index.head).toBe(0);
        expect(index.has(0)).toBe(true);
        index.remove(0);
        expect(index.head).toBe(-1);
        expect(index.has(0)).toBe(false);
    });
    it('remove 0', function () {
        var index = LinkedIndex(2);
        index.remove(0);
        expect(index.head).toBe(1);
        expect(index.has(0)).toBe(false);
        expect(index.has(1)).toBe(true);
    });
    it('remove 1', function () {
        var index = LinkedIndex(2);
        index.remove(1);
        expect(index.head).toBe(0);
        expect(index.has(0)).toBe(true);
        expect(index.has(1)).toBe(false);
    });
    it('remove 01', function () {
        var index = LinkedIndex(2);
        index.remove(0);
        index.remove(1);
        expect(index.head).toBe(-1);
        expect(index.has(0)).toBe(false);
        expect(index.has(1)).toBe(false);
    });
});
