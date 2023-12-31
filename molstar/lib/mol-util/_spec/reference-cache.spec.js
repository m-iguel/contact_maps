/**
 * Copyright (c) 2018 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { createReferenceCache } from '../reference-cache';
describe('reference-cache', function () {
    it('basic', function () {
        var refCache = createReferenceCache(function (x) { return x.toString(); }, function (x) { return x; }, function () { });
        expect(refCache.count).toBe(0);
        var ref2a = refCache.get(2);
        expect(refCache.count).toBe(1);
        var ref2b = refCache.get(2);
        expect(refCache.count).toBe(1);
        expect(ref2b.value).toBe(2);
        var ref3 = refCache.get(3);
        expect(refCache.count).toBe(2);
        expect(ref3.value).toBe(3);
        ref2a.free();
        refCache.clear();
        expect(refCache.count).toBe(2);
        ref2b.free();
        refCache.clear();
        expect(refCache.count).toBe(1);
        refCache.dispose();
        expect(refCache.count).toBe(0);
    });
});
