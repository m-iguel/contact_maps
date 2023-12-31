import { __awaiter, __generator } from "tslib";
import { MolScriptBuilder } from '../mol-script/language/builder';
import { compile, QuerySymbolRuntime, DefaultQueryRuntimeTable } from '../mol-script/runtime/query/compiler';
import { QueryContext, Structure } from '../mol-model/structure';
import { readCifFile, getModelsAndStructure } from '../cli/structure-info/model';
import { CustomPropSymbol } from '../mol-script/language/symbol';
import { Type } from '../mol-script/language/type';
import { parseMolScript } from '../mol-script/language/parser';
import * as util from 'util';
import { transpileMolScript } from '../mol-script/script/mol-script/symbols';
import { formatMolScript } from '../mol-script/language/expression-formatter';
import { StructureQualityReport, StructureQualityReportProvider } from '../extensions/pdbe/structure-quality-report/prop';
import fetch from 'node-fetch';
import { CustomPropertyDescriptor } from '../mol-model/custom-property';
// import Examples from 'mol-script/script/mol-script/examples'
// import { parseMolScript } from 'mol-script/script/mol-script/parser'
// //import { compileAST } from 'mol-script/script/mol-script/compile';
// for (const e of Examples) {
//     const expr = parseMolScript(e.value)[0];
//     console.log(e.name, util.inspect(expr, true, 10, true));
// }
// const exprs = parseMolScript(`(sel.atom.atom-groups
//     :residue-test (= atom.auth_comp_id ALA)
//     ;; ho ho ho
//     :atom-test (set.has { _C _N } atom.el)) ; comm
//     ;; this is a comment
//     ((hi) (ho))`);
// ;; :residue-test (= atom.label_comp_id REA)
var exprs = parseMolScript("(sel.atom.atom-groups\n    :residue-test (> pdbe.structure-quality.issue-count 0)\n    :atom-test (= atom.el _C))");
var tsp = transpileMolScript(exprs[0]);
// console.log(util.inspect(exprs, true, 10, true));
console.log(util.inspect(tsp, true, 10, true));
console.log(formatMolScript);
console.log(formatMolScript(tsp));
// //console.log(expr);
var expr = MolScriptBuilder.core.math.add([1, 2, 3]);
var compiled = compile(expr);
var result = compiled(new QueryContext(Structure.Empty));
console.log(result);
var CustomProp = CustomPropertyDescriptor({
    name: 'test_prop',
    cifExport: { prefix: '', categories: [] },
    symbols: {
        residueIndex: QuerySymbolRuntime.Dynamic(CustomPropSymbol('custom.test-prop', 'residue-index', Type.Num), function (ctx) {
            var e = ctx.element;
            // console.log(e.element, e.unit.model.atomicHierarchy.residueAtomSegments.index[e.element])
            return e.unit.model.atomicHierarchy.residueAtomSegments.index[e.element];
        })
    }
});
DefaultQueryRuntimeTable.addCustomProp(CustomProp);
DefaultQueryRuntimeTable.addCustomProp(StructureQualityReportProvider.descriptor);
export function testQ() {
    return __awaiter(this, void 0, void 0, function () {
        var frame, structure, model, rawData, data, _a, _b, _c, expr, compiled, result;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0: return [4 /*yield*/, readCifFile('e:/test/quick/1cbs_updated.cif')];
                case 1:
                    frame = _d.sent();
                    return [4 /*yield*/, getModelsAndStructure(frame)];
                case 2:
                    structure = (_d.sent()).structure;
                    model = structure.models[0];
                    return [4 /*yield*/, fetch("https://www.ebi.ac.uk/pdbe/api/validation/residuewise_outlier_summary/entry/".concat(model.entryId.toLowerCase()))];
                case 3:
                    rawData = _d.sent();
                    _b = (_a = StructureQualityReport).fromJson;
                    _c = [model];
                    return [4 /*yield*/, rawData.json()];
                case 4:
                    data = _b.apply(_a, _c.concat([_d.sent()]));
                    StructureQualityReportProvider.set(model, { serverUrl: '' }, data);
                    expr = MolScriptBuilder.struct.generator.atomGroups({
                        'atom-test': MolScriptBuilder.core.rel.eq([
                            MolScriptBuilder.struct.atomProperty.core.elementSymbol(),
                            MolScriptBuilder.es('C')
                        ]),
                        // 'residue-test': MolScriptBuilder.core.rel.eq([
                        //     MolScriptBuilder.struct.atomProperty.macromolecular.label_comp_id(),
                        //     'REA'
                        // ])
                        'residue-test': MolScriptBuilder.core.rel.inRange([CustomProp.symbols.residueIndex.symbol(), 1, 5])
                    });
                    expr = tsp;
                    compiled = compile(expr);
                    result = compiled(new QueryContext(structure));
                    console.log(result);
                    return [2 /*return*/];
            }
        });
    });
}
testQ();
