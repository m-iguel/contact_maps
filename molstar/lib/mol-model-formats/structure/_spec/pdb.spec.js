/**
 * Copyright (c) 2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { TokenBuilder } from '../../../mol-io/reader/common/text/tokenizer';
import { guessElementSymbolTokens } from '../util';
var records = [
    ['ATOM     19 HD23 LEU A   1     151.940 143.340 155.670  0.00  0.00', 'H'],
    ['ATOM     38  CA  SER A   3     146.430 138.150 162.270  0.00  0.00', 'C'],
    ['ATOM     38 NA   SER A   3     146.430 138.150 162.270  0.00  0.00', 'NA'],
    ['ATOM     38  NAA SER A   3     146.430 138.150 162.270  0.00  0.00', 'N'],
];
describe('PDB to-cif', function () {
    it('guess-element-symbol', function () {
        for (var i = 0, il = records.length; i < il; ++i) {
            var _a = records[i], data = _a[0], element = _a[1];
            var tokens = TokenBuilder.create(data, 2);
            guessElementSymbolTokens(tokens, data, 12, 16);
            expect(data.substring(tokens.indices[0], tokens.indices[1])).toBe(element);
        }
    });
});
