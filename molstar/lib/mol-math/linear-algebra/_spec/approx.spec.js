/**
 * Copyright (c) 2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { fasterPow2, fasterExp, fasterLog, fasterLog10, fasterSin, fasterCos, fastAtan, fastAtan2, fasterTan, fasterTanh, fasterCosh, fasterSinh, fastPow2, fastExp, fastLog, fastLog10, fastSinh, fastCosh, fastTanh, fastSin, fastCos, fastTan } from '../../approx';
describe('approx', function () {
    it('fastPow2', function () {
        expect(fastPow2(4)).toBeCloseTo(Math.pow(2, 4), 2);
    });
    it('fasterPow2', function () {
        expect(fasterPow2(4)).toBeCloseTo(Math.pow(2, 4), 0);
    });
    it('fastExp', function () {
        expect(fastExp(4)).toBeCloseTo(Math.exp(4), 2);
    });
    it('fasterExp', function () {
        expect(fasterExp(4)).toBeCloseTo(Math.exp(4), 0);
    });
    it('fastLog', function () {
        expect(fastLog(12)).toBeCloseTo(Math.log(12), 2);
    });
    it('fasterLog', function () {
        expect(fasterLog(12)).toBeCloseTo(Math.log(12), 1);
    });
    it('fastLog10', function () {
        expect(fastLog10(42)).toBeCloseTo(Math.log10(42), 2);
    });
    it('fasterLog10', function () {
        expect(fasterLog10(42)).toBeCloseTo(Math.log10(42), 1);
    });
    it('fastSinh', function () {
        expect(fastSinh(0.3)).toBeCloseTo(Math.sinh(0.3), 2);
    });
    it('fasterSinh', function () {
        expect(fasterSinh(0.3)).toBeCloseTo(Math.sinh(0.3), 1);
    });
    it('fastCosh', function () {
        expect(fastCosh(0.3)).toBeCloseTo(Math.cosh(0.3), 2);
    });
    it('fasterCosh', function () {
        expect(fasterCosh(0.3)).toBeCloseTo(Math.cosh(0.3), 1);
    });
    it('fastTanh', function () {
        expect(fastTanh(0.3)).toBeCloseTo(Math.tanh(0.3), 2);
    });
    it('fasterTanh', function () {
        expect(fasterTanh(0.3)).toBeCloseTo(Math.tanh(0.3), 1);
    });
    it('fastSin', function () {
        expect(fastSin(0.3)).toBeCloseTo(Math.sin(0.3), 2);
    });
    it('fasterSin', function () {
        expect(fasterSin(0.3)).toBeCloseTo(Math.sin(0.3), 1);
    });
    it('fastCos', function () {
        expect(fastCos(0.3)).toBeCloseTo(Math.cos(0.3), 2);
    });
    it('fasterCos', function () {
        expect(fasterCos(0.3)).toBeCloseTo(Math.cos(0.3), 1);
    });
    it('fastTan', function () {
        expect(fastTan(0.3)).toBeCloseTo(Math.tan(0.3), 2);
    });
    it('fasterTan', function () {
        expect(fasterTan(0.3)).toBeCloseTo(Math.tan(0.3), 1);
    });
    it('fastAtan', function () {
        expect(fastAtan(0.3)).toBeCloseTo(Math.atan(0.3), 2);
    });
    it('fastAtan2', function () {
        expect(fastAtan2(0.1, 0.5)).toBeCloseTo(Math.atan2(0.1, 0.5), 2);
    });
});
