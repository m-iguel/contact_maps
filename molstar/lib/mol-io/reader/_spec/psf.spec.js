/**
 * Copyright (c) 2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { __awaiter, __generator } from "tslib";
import { parsePsf } from '../psf/parser';
var psfString = "PSF CMAP CHEQ\n\n       2 !NTITLE\n* BETA HARPIN IN IMPLICIT SOLVENT\n*  DATE:    11/22/10     16:54: 9      CREATED BY USER: aokur\n\n      42 !NATOM\n       1 ALA3 1    ALA  CAY    24  -0.270000       12.0110           0   0.00000     -0.301140E-02\n       2 ALA3 1    ALA  HY1     3   0.900000E-01   1.00800           0   0.00000     -0.301140E-02\n       3 ALA3 1    ALA  HY2     3   0.900000E-01   1.00800           0   0.00000     -0.301140E-02\n       4 ALA3 1    ALA  HY3     3   0.900000E-01   1.00800           0   0.00000     -0.301140E-02\n       5 ALA3 1    ALA  CY     20   0.510000       12.0110           0   0.00000     -0.301140E-02\n       6 ALA3 1    ALA  OY     70  -0.510000       15.9990           0   0.00000     -0.301140E-02\n       7 ALA3 1    ALA  N      54  -0.470000       14.0070           0   0.00000     -0.301140E-02\n       8 ALA3 1    ALA  HN      1   0.310000       1.00800           0   0.00000     -0.301140E-02\n       9 ALA3 1    ALA  CA     22   0.700000E-01   12.0110           0   0.00000     -0.301140E-02\n      10 ALA3 1    ALA  HA      6   0.900000E-01   1.00800           0   0.00000     -0.301140E-02\n      11 ALA3 1    ALA  CB     24  -0.270000       12.0110           0   0.00000     -0.301140E-02\n      12 ALA3 1    ALA  HB1     3   0.900000E-01   1.00800           0   0.00000     -0.301140E-02\n      13 ALA3 1    ALA  HB2     3   0.900000E-01   1.00800           0   0.00000     -0.301140E-02\n      14 ALA3 1    ALA  HB3     3   0.900000E-01   1.00800           0   0.00000     -0.301140E-02\n      15 ALA3 1    ALA  C      20   0.510000       12.0110           0   0.00000     -0.301140E-02\n      16 ALA3 1    ALA  O      70  -0.510000       15.9990           0   0.00000     -0.301140E-02\n      17 ALA3 2    ALA  N      54  -0.470000       14.0070           0   0.00000     -0.301140E-02\n      18 ALA3 2    ALA  HN      1   0.310000       1.00800           0   0.00000     -0.301140E-02\n      19 ALA3 2    ALA  CA     22   0.700000E-01   12.0110           0   0.00000     -0.301140E-02\n      20 ALA3 2    ALA  HA      6   0.900000E-01   1.00800           0   0.00000     -0.301140E-02\n      21 ALA3 2    ALA  CB     24  -0.270000       12.0110           0   0.00000     -0.301140E-02\n      22 ALA3 2    ALA  HB1     3   0.900000E-01   1.00800           0   0.00000     -0.301140E-02\n      23 ALA3 2    ALA  HB2     3   0.900000E-01   1.00800           0   0.00000     -0.301140E-02\n      24 ALA3 2    ALA  HB3     3   0.900000E-01   1.00800           0   0.00000     -0.301140E-02\n      25 ALA3 2    ALA  C      20   0.510000       12.0110           0   0.00000     -0.301140E-02\n      26 ALA3 2    ALA  O      70  -0.510000       15.9990           0   0.00000     -0.301140E-02\n      27 ALA3 3    ALA  N      54  -0.470000       14.0070           0   0.00000     -0.301140E-02\n      28 ALA3 3    ALA  HN      1   0.310000       1.00800           0   0.00000     -0.301140E-02\n      29 ALA3 3    ALA  CA     22   0.700000E-01   12.0110           0   0.00000     -0.301140E-02\n      30 ALA3 3    ALA  HA      6   0.900000E-01   1.00800           0   0.00000     -0.301140E-02\n      31 ALA3 3    ALA  CB     24  -0.270000       12.0110           0   0.00000     -0.301140E-02\n      32 ALA3 3    ALA  HB1     3   0.900000E-01   1.00800           0   0.00000     -0.301140E-02\n      33 ALA3 3    ALA  HB2     3   0.900000E-01   1.00800           0   0.00000     -0.301140E-02\n      34 ALA3 3    ALA  HB3     3   0.900000E-01   1.00800           0   0.00000     -0.301140E-02\n      35 ALA3 3    ALA  C      20   0.510000       12.0110           0   0.00000     -0.301140E-02\n      36 ALA3 3    ALA  O      70  -0.510000       15.9990           0   0.00000     -0.301140E-02\n      37 ALA3 3    ALA  NT     54  -0.470000       14.0070           0   0.00000     -0.301140E-02\n      38 ALA3 3    ALA  HNT     1   0.310000       1.00800           0   0.00000     -0.301140E-02\n      39 ALA3 3    ALA  CAT    24  -0.110000       12.0110           0   0.00000     -0.301140E-02\n      40 ALA3 3    ALA  HT1     3   0.900000E-01   1.00800           0   0.00000     -0.301140E-02\n      41 ALA3 3    ALA  HT2     3   0.900000E-01   1.00800           0   0.00000     -0.301140E-02\n      42 ALA3 3    ALA  HT3     3   0.900000E-01   1.00800           0   0.00000     -0.301140E-02\n\n      41 !NBOND: bonds\n       5       1       5       7       1       2       1       3\n       1       4       6       5      11       9       7       8\n       7       9      15       9      15      17       9      10\n      11      12      11      13      11      14      16      15\n      21      19      17      18      17      19      25      19\n      25      27      19      20      21      22      21      23\n      21      24      26      25      31      29      27      28\n      27      29      35      29      29      30      31      32\n      31      33      31      34      36      35      35      37\n      37      38      37      39      39      40      39      41\n      39      42\n";
describe('psf reader', function () {
    it('basic', function () { return __awaiter(void 0, void 0, void 0, function () {
        var parsed, psfFile, id, title, atoms, bonds;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, parsePsf(psfString).run()];
                case 1:
                    parsed = _a.sent();
                    if (parsed.isError) {
                        throw new Error(parsed.message);
                    }
                    psfFile = parsed.result;
                    id = psfFile.id, title = psfFile.title, atoms = psfFile.atoms, bonds = psfFile.bonds;
                    expect(id).toBe('PSF CMAP CHEQ');
                    expect(title).toEqual([
                        'BETA HARPIN IN IMPLICIT SOLVENT',
                        'DATE:    11/22/10     16:54: 9      CREATED BY USER: aokur'
                    ]);
                    expect(atoms.atomId.value(0)).toBe(1);
                    expect(atoms.atomId.value(41)).toBe(42);
                    expect(atoms.segmentName.value(0)).toBe('ALA3');
                    expect(atoms.residueId.value(0)).toBe(1);
                    expect(atoms.residueId.value(41)).toBe(3);
                    expect(atoms.residueName.value(0)).toBe('ALA');
                    expect(atoms.atomName.value(0)).toBe('CAY');
                    expect(atoms.atomName.value(41)).toBe('HT3');
                    expect(atoms.atomType.value(0)).toBe('24');
                    expect(atoms.atomType.value(41)).toBe('3');
                    expect(atoms.charge.value(0)).toBeCloseTo(-0.270000, 0.00001);
                    expect(atoms.charge.value(41)).toBeCloseTo(0.090000, 0.00001);
                    expect(atoms.mass.value(0)).toBeCloseTo(12.0110, 0.00001);
                    expect(atoms.mass.value(41)).toBeCloseTo(1.00800, 0.00001);
                    expect(bonds.atomIdA.value(0)).toBe(5);
                    expect(bonds.atomIdB.value(0)).toBe(1);
                    expect(bonds.atomIdA.value(40)).toBe(39);
                    expect(bonds.atomIdB.value(40)).toBe(42);
                    return [2 /*return*/];
            }
        });
    }); });
});
