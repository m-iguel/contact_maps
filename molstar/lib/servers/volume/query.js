#!/usr/bin/env node
/**
 * Copyright (c) 2018-2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * Taken/adapted from DensityServer (https://github.com/dsehnal/DensityServer)
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { __awaiter, __generator } from "tslib";
import * as fs from 'fs';
import { configureLocal } from './config';
import * as LocalApi from './server/local-api';
var config = configureLocal();
if (config.jobsTemplate) {
    var exampleJobs = [{
            source: {
                filename: "g:/test/mdb/xray-1tqn.mdb",
                name: 'xray',
                id: '1tqn',
            },
            query: {
                kind: 'box',
                space: 'cartesian',
                bottomLeft: [-42.996, -64.169, -45.335],
                topRight: [8.768, 15.316, 21.599]
            },
            params: {
                forcedSamplingLevel: 2,
                asBinary: true
            },
            outputFolder: 'g:/test/local-test'
        }, {
            source: {
                filename: "g:/test/mdb/emd-8116.mdb",
                name: 'em',
                id: '8116',
            },
            query: {
                kind: 'cell'
            },
            params: {
                detail: 4,
                asBinary: true
            },
            outputFolder: 'g:/test/local-test',
            outputFilename: '8116_cell.bcif'
        }];
    console.log(JSON.stringify(exampleJobs, null, 2));
    process.exit();
}
function run() {
    return __awaiter(this, void 0, void 0, function () {
        var jobs;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    try {
                        if (!config.jobs) {
                            throw new Error("Please provide 'jobs' argument. See [-h] for help.");
                        }
                        jobs = JSON.parse(fs.readFileSync(config.jobs, 'utf-8'));
                    }
                    catch (e) {
                        console.error('' + e);
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, LocalApi.run(jobs)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
run();
