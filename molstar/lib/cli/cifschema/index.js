#!/usr/bin/env node
/**
 * Copyright (c) 2017-2021 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { __awaiter, __generator, __spreadArray } from "tslib";
import * as argparse from 'argparse';
import * as fs from 'fs';
import * as path from 'path';
import fetch from 'node-fetch';
import { parseCsv } from '../../mol-io/reader/csv/parser';
import { parseCifText } from '../../mol-io/reader/cif/text/parser';
import { generateSchema } from './util/cif-dic';
import { generate } from './util/generate';
import { parseImportGet } from './util/helper';
function getDicVersion(block) {
    return block.categories.dictionary.getField('version').str(0);
}
function getDicNamespace(block) {
    return block.categories.dictionary.getField('namespace').str(0);
}
function runGenerateSchemaMmcif(name, fieldNamesPath, typescript, out, moldbImportPath, addAliases) {
    if (typescript === void 0) { typescript = false; }
    return __awaiter(this, void 0, void 0, function () {
        var mmcifDic, ihmDic, maDic, mmcifDicVersion, ihmDicVersion, maDicVersion, version, frames, schema;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, ensureMmcifDicAvailable()];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, parseCifText(fs.readFileSync(MMCIF_DIC_PATH, 'utf8')).run()];
                case 2:
                    mmcifDic = _a.sent();
                    if (mmcifDic.isError)
                        throw mmcifDic;
                    return [4 /*yield*/, ensureIhmDicAvailable()];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, parseCifText(fs.readFileSync(IHM_DIC_PATH, 'utf8')).run()];
                case 4:
                    ihmDic = _a.sent();
                    if (ihmDic.isError)
                        throw ihmDic;
                    return [4 /*yield*/, ensureMaDicAvailable()];
                case 5:
                    _a.sent();
                    return [4 /*yield*/, parseCifText(fs.readFileSync(MA_DIC_PATH, 'utf8')).run()];
                case 6:
                    maDic = _a.sent();
                    if (maDic.isError)
                        throw maDic;
                    mmcifDicVersion = getDicVersion(mmcifDic.result.blocks[0]);
                    ihmDicVersion = getDicVersion(ihmDic.result.blocks[0]);
                    maDicVersion = getDicVersion(maDic.result.blocks[0]);
                    version = "Dictionary versions: mmCIF ".concat(mmcifDicVersion, ", IHM ").concat(ihmDicVersion, ", MA ").concat(maDicVersion, ".");
                    frames = __spreadArray(__spreadArray(__spreadArray([], mmcifDic.result.blocks[0].saveFrames, true), ihmDic.result.blocks[0].saveFrames, true), maDic.result.blocks[0].saveFrames, true);
                    schema = generateSchema(frames);
                    return [4 /*yield*/, runGenerateSchema(name, version, schema, fieldNamesPath, typescript, out, moldbImportPath, addAliases)];
                case 7:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function runGenerateSchemaCifCore(name, fieldNamesPath, typescript, out, moldbImportPath, addAliases) {
    if (typescript === void 0) { typescript = false; }
    return __awaiter(this, void 0, void 0, function () {
        var cifCoreDic, cifCoreDicVersion, version, frames, imports, schema;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, ensureCifCoreDicAvailable()];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, parseCifText(fs.readFileSync(CIF_CORE_DIC_PATH, 'utf8')).run()];
                case 2:
                    cifCoreDic = _a.sent();
                    if (cifCoreDic.isError)
                        throw cifCoreDic;
                    cifCoreDicVersion = getDicVersion(cifCoreDic.result.blocks[0]);
                    version = "Dictionary versions: CifCore ".concat(cifCoreDicVersion, ".");
                    frames = __spreadArray([], cifCoreDic.result.blocks[0].saveFrames, true);
                    return [4 /*yield*/, resolveImports(frames, DIC_DIR)];
                case 3:
                    imports = _a.sent();
                    schema = generateSchema(frames, imports);
                    return [4 /*yield*/, runGenerateSchema(name, version, schema, fieldNamesPath, typescript, out, moldbImportPath, addAliases)];
                case 4:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function resolveImports(frames, baseDir) {
    return __awaiter(this, void 0, void 0, function () {
        var imports, _i, frames_1, d, importGet, _a, importGet_1, g, file, dic;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    imports = new Map();
                    _i = 0, frames_1 = frames;
                    _b.label = 1;
                case 1:
                    if (!(_i < frames_1.length)) return [3 /*break*/, 6];
                    d = frames_1[_i];
                    if (!('import' in d.categories)) return [3 /*break*/, 5];
                    importGet = parseImportGet(d.categories['import'].getField('get').str(0));
                    _a = 0, importGet_1 = importGet;
                    _b.label = 2;
                case 2:
                    if (!(_a < importGet_1.length)) return [3 /*break*/, 5];
                    g = importGet_1[_a];
                    file = g.file;
                    if (!file)
                        return [3 /*break*/, 4];
                    if (imports.has(file))
                        return [3 /*break*/, 4];
                    return [4 /*yield*/, parseCifText(fs.readFileSync(path.join(baseDir, file), 'utf8')).run()];
                case 3:
                    dic = _b.sent();
                    if (dic.isError)
                        throw dic;
                    imports.set(file, __spreadArray([], dic.result.blocks[0].saveFrames, true));
                    _b.label = 4;
                case 4:
                    _a++;
                    return [3 /*break*/, 2];
                case 5:
                    _i++;
                    return [3 /*break*/, 1];
                case 6: return [2 /*return*/, imports];
            }
        });
    });
}
function runGenerateSchemaDic(name, dicPath, fieldNamesPath, typescript, out, moldbImportPath, addAliases) {
    if (typescript === void 0) { typescript = false; }
    return __awaiter(this, void 0, void 0, function () {
        var dic, dicVersion, dicName, version, frames, imports, schema;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, parseCifText(fs.readFileSync(dicPath, 'utf8')).run()];
                case 1:
                    dic = _a.sent();
                    if (dic.isError)
                        throw dic;
                    dicVersion = getDicVersion(dic.result.blocks[0]);
                    dicName = getDicNamespace(dic.result.blocks[0]);
                    version = "Dictionary versions: ".concat(dicName, " ").concat(dicVersion, ".");
                    frames = __spreadArray([], dic.result.blocks[0].saveFrames, true);
                    return [4 /*yield*/, resolveImports(frames, path.dirname(dicPath))];
                case 2:
                    imports = _a.sent();
                    schema = generateSchema(frames, imports);
                    return [4 /*yield*/, runGenerateSchema(name, version, schema, fieldNamesPath, typescript, out, moldbImportPath, addAliases)];
                case 3:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function runGenerateSchema(name, version, schema, fieldNamesPath, typescript, out, moldbImportPath, addAliases) {
    if (typescript === void 0) { typescript = false; }
    return __awaiter(this, void 0, void 0, function () {
        var filter, _a, output;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!fieldNamesPath) return [3 /*break*/, 2];
                    return [4 /*yield*/, getFieldNamesFilter(fieldNamesPath)];
                case 1:
                    _a = _b.sent();
                    return [3 /*break*/, 3];
                case 2:
                    _a = undefined;
                    _b.label = 3;
                case 3:
                    filter = _a;
                    output = typescript ? generate(name, version, schema, filter, moldbImportPath, addAliases) : JSON.stringify(schema, undefined, 4);
                    if (out) {
                        fs.writeFileSync(out, output);
                    }
                    else {
                        console.log(output);
                    }
                    return [2 /*return*/];
            }
        });
    });
}
function getFieldNamesFilter(fieldNamesPath) {
    return __awaiter(this, void 0, void 0, function () {
        var fieldNamesStr, parsed, csvFile, fieldNamesCol, fieldNames, filter;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    fieldNamesStr = fs.readFileSync(fieldNamesPath, 'utf8');
                    return [4 /*yield*/, parseCsv(fieldNamesStr, { noColumnNames: true }).run()];
                case 1:
                    parsed = _a.sent();
                    if (parsed.isError)
                        throw parser.error;
                    csvFile = parsed.result;
                    fieldNamesCol = csvFile.table.getColumn('0');
                    if (!fieldNamesCol)
                        throw new Error('error getting fields columns');
                    fieldNames = fieldNamesCol.toStringArray();
                    filter = {};
                    fieldNames.forEach(function (name, i) {
                        var _a = name.split('.'), category = _a[0], field = _a[1];
                        // console.log(category, field)
                        if (!filter[category])
                            filter[category] = {};
                        filter[category][field] = true;
                    });
                    return [2 /*return*/, filter];
            }
        });
    });
}
function ensureMmcifDicAvailable() {
    return __awaiter(this, void 0, void 0, function () { return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, ensureDicAvailable(MMCIF_DIC_PATH, MMCIF_DIC_URL)];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    }); });
}
function ensureIhmDicAvailable() {
    return __awaiter(this, void 0, void 0, function () { return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, ensureDicAvailable(IHM_DIC_PATH, IHM_DIC_URL)];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    }); });
}
function ensureMaDicAvailable() {
    return __awaiter(this, void 0, void 0, function () { return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, ensureDicAvailable(MA_DIC_PATH, MA_DIC_URL)];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    }); });
}
function ensureCifCoreDicAvailable() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, ensureDicAvailable(CIF_CORE_DIC_PATH, CIF_CORE_DIC_URL)];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, ensureDicAvailable(CIF_CORE_ENUM_PATH, CIF_CORE_ENUM_URL)];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, ensureDicAvailable(CIF_CORE_ATTR_PATH, CIF_CORE_ATTR_URL)];
                case 3:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function ensureDicAvailable(dicPath, dicUrl) {
    return __awaiter(this, void 0, void 0, function () {
        var name_1, data, _a, _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    if (!(FORCE_DIC_DOWNLOAD || !fs.existsSync(dicPath))) return [3 /*break*/, 3];
                    name_1 = dicUrl.substr(dicUrl.lastIndexOf('/') + 1);
                    console.log("downloading ".concat(name_1, "..."));
                    return [4 /*yield*/, fetch(dicUrl)];
                case 1:
                    data = _d.sent();
                    if (!fs.existsSync(DIC_DIR)) {
                        fs.mkdirSync(DIC_DIR);
                    }
                    _b = (_a = fs).writeFileSync;
                    _c = [dicPath];
                    return [4 /*yield*/, data.text()];
                case 2:
                    _b.apply(_a, _c.concat([_d.sent()]));
                    console.log("done downloading ".concat(name_1));
                    _d.label = 3;
                case 3: return [2 /*return*/];
            }
        });
    });
}
var DIC_DIR = path.resolve(__dirname, '../../../../build/dics/');
var MMCIF_DIC_PATH = "".concat(DIC_DIR, "/mmcif_pdbx_v50.dic");
var MMCIF_DIC_URL = 'http://mmcif.wwpdb.org/dictionaries/ascii/mmcif_pdbx_v50.dic';
var IHM_DIC_PATH = "".concat(DIC_DIR, "/ihm-extension.dic");
var IHM_DIC_URL = 'https://raw.githubusercontent.com/ihmwg/IHM-dictionary/master/ihm-extension.dic';
var MA_DIC_PATH = "".concat(DIC_DIR, "/ma-extension.dic");
var MA_DIC_URL = 'https://raw.githubusercontent.com/ihmwg/ModelCIF/master/dist/mmcif_ma.dic';
var CIF_CORE_DIC_PATH = "".concat(DIC_DIR, "/cif_core.dic");
var CIF_CORE_DIC_URL = 'https://raw.githubusercontent.com/COMCIFS/cif_core/master/cif_core.dic';
var CIF_CORE_ENUM_PATH = "".concat(DIC_DIR, "/templ_enum.cif");
var CIF_CORE_ENUM_URL = 'https://raw.githubusercontent.com/COMCIFS/cif_core/master/templ_enum.cif';
var CIF_CORE_ATTR_PATH = "".concat(DIC_DIR, "/templ_attr.cif");
var CIF_CORE_ATTR_URL = 'https://raw.githubusercontent.com/COMCIFS/cif_core/master/templ_attr.cif';
var parser = new argparse.ArgumentParser({
    add_help: true,
    description: 'Create schema from mmcif dictionary (v50 plus IHM and entity_branch extensions, downloaded from wwPDB)'
});
parser.add_argument('--preset', '-p', {
    default: '',
    choices: ['', 'mmCIF', 'CCD', 'BIRD', 'CifCore'],
    help: 'Preset name'
});
parser.add_argument('--name', '-n', {
    default: '',
    help: 'Schema name'
});
parser.add_argument('--out', '-o', {
    help: 'Generated schema output path, if not given printed to stdout'
});
parser.add_argument('--targetFormat', '-tf', {
    default: 'typescript-molstar',
    choices: ['typescript-molstar', 'json-internal'],
    help: 'Target format'
});
parser.add_argument('--dicPath', '-d', {
    default: '',
    help: 'Path to dictionary'
});
parser.add_argument('--fieldNamesPath', '-fn', {
    default: '',
    help: 'Field names to include'
});
parser.add_argument('--forceDicDownload', '-f', {
    action: 'store_true',
    help: 'Force download of dictionaries'
});
parser.add_argument('--moldataImportPath', '-mip', {
    default: 'molstar/lib/mol-data',
    help: 'mol-data import path (for typescript target only)'
});
parser.add_argument('--addAliases', '-aa', {
    action: 'store_true',
    help: 'Add field name/path aliases'
});
var args = parser.parse_args();
var FORCE_DIC_DOWNLOAD = args.forceDicDownload;
switch (args.preset) {
    case 'mmCIF':
        args.name = 'mmCIF';
        args.dic = 'mmCIF';
        args.fieldNamesPath = path.resolve(__dirname, '../../../../data/cif-field-names/mmcif-field-names.csv');
        break;
    case 'CCD':
        args.name = 'CCD';
        args.dic = 'mmCIF';
        args.fieldNamesPath = path.resolve(__dirname, '../../../../data/cif-field-names/ccd-field-names.csv');
        break;
    case 'BIRD':
        args.name = 'BIRD';
        args.dic = 'mmCIF';
        args.fieldNamesPath = path.resolve(__dirname, '../../../../data/cif-field-names/bird-field-names.csv');
        break;
    case 'CifCore':
        args.name = 'CifCore';
        args.dic = 'CifCore';
        args.fieldNamesPath = path.resolve(__dirname, '../../../../data/cif-field-names/cif-core-field-names.csv');
        break;
}
if (args.name) {
    var typescript = args.targetFormat === 'typescript-molstar';
    if (args.dicPath) {
        runGenerateSchemaDic(args.name, args.dicPath, args.fieldNamesPath, typescript, args.out, args.moldataImportPath, args.addAliases).catch(function (e) {
            console.error(e);
        });
    }
    else if (args.dic === 'mmCIF') {
        runGenerateSchemaMmcif(args.name, args.fieldNamesPath, typescript, args.out, args.moldataImportPath, args.addAliases).catch(function (e) {
            console.error(e);
        });
    }
    else if (args.dic === 'CifCore') {
        runGenerateSchemaCifCore(args.name, args.fieldNamesPath, typescript, args.out, args.moldataImportPath, args.addAliases).catch(function (e) {
            console.error(e);
        });
    }
}
