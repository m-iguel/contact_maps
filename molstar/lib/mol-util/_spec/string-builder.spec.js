/**
 * Copyright (c) 2017 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { StringBuilder as SB } from '../string-builder';
describe('string-builder', function () {
    function check(name, bb, expected) {
        var sb = SB.create();
        bb(sb);
        it(name, function () { return expect(SB.getString(sb)).toEqual(expected); });
    }
    check('write', function (sb) { return SB.write(sb, '123'); }, '123');
    check('whitespace', function (sb) { return SB.whitespace(sb, 3); }, '   ');
    check('writePadLeft', function (sb) { return SB.writePadLeft(sb, '1', 3); }, '  1');
    check('writePadRight', function (sb) { return SB.writePadRight(sb, '1', 3); }, '1  ');
    check('writeIntegerPadLeft', function (sb) { return SB.writeIntegerPadLeft(sb, -125, 5); }, ' -125');
    check('writeIntegerPadRight', function (sb) { return SB.writeIntegerPadRight(sb, -125, 5); }, '-125 ');
    check('writeFloat', function (sb) { return SB.writeFloat(sb, 1.123, 100); }, '1.12');
    check('writeFloatPadLeft', function (sb) { return SB.writeFloatPadLeft(sb, 1.123, 100, 6); }, '  1.12');
    check('writeFloatPadRight', function (sb) { return SB.writeFloatPadRight(sb, -1.123, 100, 6); }, '-1.12 ');
    it('chunks', function () {
        var sb = SB.create(2);
        SB.write(sb, '1');
        SB.write(sb, '2');
        SB.write(sb, '3');
        expect(SB.getChunks(sb)).toEqual(['12', '3']);
        expect(SB.getString(sb)).toEqual('123');
    });
});
