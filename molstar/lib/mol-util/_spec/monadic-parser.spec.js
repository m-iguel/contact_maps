/**
 * Copyright (c) 2018 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { MonadicParser as P } from '../monadic-parser';
describe('parser', function () {
    it('string', function () {
        var p = P.string('abc');
        expect(p.parse('abc').success).toBe(true);
        expect(p.parse('cabc').success).toBe(false);
    });
    it('alt', function () {
        var p = P.alt(P.string('abc'), P.string('123'));
        expect(p.parse('abc').success).toBe(true);
        expect(p.parse('123').success).toBe(true);
        expect(p.parse('123a').success).toBe(false);
    });
    it('trim', function () {
        var p = P.string('abc').trim(P.whitespace);
        expect(p.tryParse(' abc ')).toBe('abc');
    });
    it('wrap', function () {
        var p = P.string('abc').wrap(P.string('('), P.string(')'));
        expect(p.tryParse('(abc)')).toBe('abc');
    });
    it('then', function () {
        var p = P.string('abc').then(P.string('123'));
        expect(p.tryParse('abc123')).toBe('123');
    });
    it('many', function () {
        var p = P.string('1').many();
        expect(p.tryParse('111')).toEqual(['1', '1', '1']);
    });
    it('times', function () {
        var p = P.string('1').times(2);
        expect(p.tryParse('11')).toEqual(['1', '1']);
    });
    it('sepBy', function () {
        var p = P.sepBy(P.digits, P.string(',')).map(function (xs) { return xs.map(function (x) { return +x; }); });
        expect(p.tryParse('1,2,3,4')).toEqual([1, 2, 3, 4]);
    });
});
