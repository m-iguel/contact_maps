/**
 * Copyright (c) 2018 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import * as fs from 'fs';
import * as path from 'path';
import * as argparse from 'argparse';
import { runMaster } from './parallel';
function description() {
    var exampleCfg = {
        numProcesses: 1,
        customProperties: {
            sources: [
                'wwpdb'
            ],
            params: {
                wwPDB: {
                    chemCompBondTablePath: './build/data/ccb.bcif'
                }
            }
        }
    };
    return "Preprocess CIF files to include custom properties and convert them to BinaryCIF format.\n\nExample cfg.json: ".concat(JSON.stringify(exampleCfg, null, 2));
}
var cmdParser = new argparse.ArgumentParser({
    add_help: true,
    description: description()
});
cmdParser.add_argument('--input', '-i', { help: 'Input filename', required: false });
cmdParser.add_argument('--outCIF', '-oc', { help: 'Output CIF filename', required: false });
cmdParser.add_argument('--outBCIF', '-ob', { help: 'Output BinaryCIF filename', required: false });
// TODO: add back? cmdParser.addArgument(['--bulk', '-b'], { help: 'Bulk JSON ({ numProcesses?: number, entries: { source: string, cif?: string, bcif?: string }[] })', required: false });
cmdParser.add_argument('--cfg', '-c', { help: 'Config file path', required: false });
cmdParser.add_argument('--folderIn', '-fin', { help: 'Convert folder', required: false });
cmdParser.add_argument('--folderOutCIF', '-foc', { help: 'Convert folder text output', required: false });
cmdParser.add_argument('--folderOutBCIF', '-fob', { help: 'Convert folder binary output', required: false });
cmdParser.add_argument('--folderNumProcesses', '-fp', { help: 'Convert folder num processes', required: false });
var cmdArgs = cmdParser.parse_args();
if (Object.keys(cmdArgs).filter(function (k) { return cmdArgs[k] !== null; }).length === 0 || typeof cmdArgs.help !== 'undefined') {
    cmdParser.print_help();
    process.exit(0);
}
var entries = [];
var config = { numProcesses: cmdArgs.folderIn ? +(cmdArgs.folderNumProcesses || 1) : 1, customProperties: void 0 };
if (cmdArgs.input)
    entries.push({ source: cmdArgs.input, cif: cmdArgs.outCIF, bcif: cmdArgs.outBCIF });
// else if (cmdArgs.bulk) runBulk(cmdArgs.bulk);
else if (cmdArgs.folderIn)
    findEntries();
if (cmdArgs.cfg) {
    config = JSON.parse(fs.readFileSync(cmdArgs.cfg, 'utf8'));
}
runMaster(config, entries);
function findEntries() {
    var files = fs.readdirSync(cmdArgs.folderIn);
    var cifTest = /\.cif$/;
    for (var _i = 0, files_1 = files; _i < files_1.length; _i++) {
        var f = files_1[_i];
        if (!cifTest.test(f))
            continue;
        entries.push({
            source: path.join(cmdArgs.folderIn, f),
            cif: cmdArgs.folderOutCIF ? path.join(cmdArgs.folderOutCIF, f) : void 0,
            bcif: cmdArgs.folderOutBCIF ? path.join(cmdArgs.folderOutBCIF, path.parse(f).name + '.bcif') : void 0,
        });
    }
}
// example:
// node build\node_modules\servers\model\preprocess -i e:\test\Quick\1cbs_updated.cif -oc e:\test\mol-star\model\1cbs.cif -ob e:\test\mol-star\model\1cbs.bcif
