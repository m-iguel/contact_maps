/**
 * Copyright (c) 2018 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { idFactory } from '../id-factory';
describe('id-factory', function () {
    it('basic', function () {
        var getNextId = idFactory();
        expect(getNextId()).toBe(0);
        expect(getNextId()).toBe(1);
    });
    it('start-id', function () {
        var getNextId = idFactory(5);
        expect(getNextId()).toBe(5);
        expect(getNextId()).toBe(6);
    });
    it('negative-start-id', function () {
        var getNextId = idFactory(-1);
        expect(getNextId()).toBe(-1);
        expect(getNextId()).toBe(0);
    });
    it('max-id', function () {
        var getNextId = idFactory(0, 2);
        expect(getNextId()).toBe(0);
        expect(getNextId()).toBe(1);
        expect(getNextId()).toBe(0);
        expect(getNextId()).toBe(1);
    });
});
