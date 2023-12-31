/**
 * Copyright (c) 2019-2021 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { __awaiter, __generator } from "tslib";
import { CIF } from '../../../mol-io/reader/cif';
var cifCoreString = "data_n1379\n_audit_block_doi                 10.5517/ccy42jn\n_database_code_depnum_ccdc_archive 'CCDC 867861'\nloop_\n_citation_id\n_citation_doi\n_citation_year\n1 10.1002/chem.201202070 2012\n_audit_update_record\n;\n2012-02-20 deposited with the CCDC.\n2016-10-08 downloaded from the CCDC.\n;\n\nloop_\n_atom_type_symbol\n_atom_type_description\n_atom_type_scat_dispersion_real\n_atom_type_scat_dispersion_imag\n_atom_type_scat_source\nC C 0.0181 0.0091 'International Tables Vol C Tables 4.2.6.8 and 6.1.1.4'\nH H 0.0000 0.0000 'International Tables Vol C Tables 4.2.6.8 and 6.1.1.4'\nN N 0.0311 0.0180 'International Tables Vol C Tables 4.2.6.8 and 6.1.1.4'\nO O 0.0492 0.0322 'International Tables Vol C Tables 4.2.6.8 and 6.1.1.4'\nF F 0.0727 0.0534 'International Tables Vol C Tables 4.2.6.8 and 6.1.1.4'\n\n_symmetry_cell_setting           Triclinic\n_symmetry_space_group_name_H-M   P-1\n\n_cell_length_a                   11.0829(8)\n_cell_length_b                   14.6829(10)\n_cell_length_c                   16.8532(17)\n_cell_angle_alpha                105.728(6)\n_cell_angle_beta                 100.310(6)\n_cell_angle_gamma                110.620(4)\n_cell_volume                     2353.3(3)\n_cell_formula_units_Z            1\n_cell_measurement_temperature    100(2)\n_cell_measurement_reflns_used    5934\n_cell_measurement_theta_min      2.86\n_cell_measurement_theta_max      64.30\n\nloop_\n_atom_site_aniso_label\n_atom_site_aniso_U_11\n_atom_site_aniso_U_22\n_atom_site_aniso_U_33\n_atom_site_aniso_U_23\n_atom_site_aniso_U_13\n_atom_site_aniso_U_12\nPt1 0.0425(2) 0.0423(2) 0.0375(2) 0.00066(13) 0.01515(13) 0.00089(12)\nK1 0.0605(15) 0.0687(17) 0.0559(17) 0.000 0.0203(13) 0.000\nCl2 0.0511(11) 0.0554(11) 0.0533(13) 0.0078(10) 0.0225(9) 0.0027(9)\nCl3 0.0708(13) 0.0484(11) 0.0605(13) -0.0053(10) 0.0276(10) 0.0026(10)\nCl1 0.0950(16) 0.0442(11) 0.0942(18) -0.0051(12) 0.0526(14) 0.0035(12)\nN9 0.045(3) 0.047(4) 0.035(4) 0.004(3) 0.014(3) -0.003(3)\nN7 0.040(3) 0.048(4) 0.036(3) 0.008(3) 0.004(3) -0.004(3)\nO2 0.052(3) 0.098(4) 0.046(4) -0.012(4) 0.006(3) -0.016(3)\nN3 0.041(3) 0.044(3) 0.044(4) 0.001(3) 0.008(3) -0.002(3)\nO6 0.053(3) 0.093(4) 0.052(3) 0.008(3) 0.021(3) -0.019(3)\nC4 0.044(4) 0.032(4) 0.050(5) 0.004(4) 0.011(4) 0.003(3)\nN1 0.049(4) 0.049(4) 0.040(4) 0.004(3) 0.014(3) -0.005(3)\nC8 0.050(4) 0.045(4) 0.033(4) -0.007(4) 0.000(3) -0.004(4)\nC5 0.036(4) 0.039(4) 0.045(5) 0.003(4) 0.013(3) -0.001(3)\nC2 0.047(4) 0.045(4) 0.039(5) -0.007(4) 0.011(4) -0.004(4)\nC7 0.041(4) 0.072(5) 0.055(5) 0.013(5) 0.006(4) -0.015(4)\nC1 0.061(5) 0.067(5) 0.043(5) -0.002(4) 0.017(4) -0.005(4)\nC3 0.038(4) 0.090(6) 0.054(5) 0.003(5) 0.013(4) -0.018(4)\nC6 0.045(4) 0.043(4) 0.038(4) 0.004(4) 0.008(3) -0.002(4)\n";
describe('cif-core read', function () {
    it('frame', function () { return __awaiter(void 0, void 0, void 0, function () {
        var parsed, cifFile, block;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, CIF.parseText(cifCoreString).run()];
                case 1:
                    parsed = _a.sent();
                    if (parsed.isError)
                        return [2 /*return*/];
                    cifFile = parsed.result;
                    block = cifFile.blocks[0];
                    expect(block.getField('cell_length_a').float(0)).toBe(11.0829);
                    expect(block.getField('symmetry_space_group_name_H-M').str(0)).toBe('P-1');
                    expect.assertions(2);
                    return [2 /*return*/];
            }
        });
    }); });
    it('schema', function () { return __awaiter(void 0, void 0, void 0, function () {
        var parsed, cifFile, block, cifCore;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, CIF.parseText(cifCoreString).run()];
                case 1:
                    parsed = _a.sent();
                    if (parsed.isError)
                        return [2 /*return*/];
                    cifFile = parsed.result;
                    block = cifFile.blocks[0];
                    cifCore = CIF.schema.cifCore(block);
                    expect(cifCore.cell.length_a.value(0)).toBe(11.0829);
                    expect(cifCore.space_group['name_h-m_full'].value(0)).toBe('P-1');
                    expect(cifCore.atom_site_aniso.u.value(0)).toEqual(new Float64Array([0.0425, 0, 0, 0.00089, 0.0423, 0, 0.01515, 0.00066, 0.0375]));
                    expect.assertions(3);
                    return [2 /*return*/];
            }
        });
    }); });
});
