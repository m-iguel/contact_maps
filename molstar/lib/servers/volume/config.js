/**
 * Copyright (c) 2019-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { __assign } from "tslib";
import * as argparse from 'argparse';
import { ObjectKeys } from '../../mol-util/type-helpers';
import { VOLUME_SERVER_HEADER } from './server/version';
import * as fs from 'fs';
var DefaultServerConfig = {
    apiPrefix: '/VolumeServer',
    defaultPort: 1337,
    shutdownTimeoutMinutes: 24 * 60,
    shutdownTimeoutVarianceMinutes: 60,
    idMap: []
};
function addLimitsArgs(parser) {
    parser.add_argument('--maxRequestBlockCount', {
        default: DefaultLimitsConfig.maxRequestBlockCount,
        metavar: 'COUNT',
        help: "Maximum number of blocks that could be read in 1 query.\nThis is somewhat tied to the maxOutputSizeInVoxelCountByPrecisionLevel\nin that the <maximum number of voxel> = maxRequestBlockCount * <block size>^3.\nThe default block size is 96 which corresponds to 28,311,552 voxels with 32 max blocks."
    });
    parser.add_argument('--maxFractionalBoxVolume', {
        default: DefaultLimitsConfig.maxFractionalBoxVolume,
        metavar: 'VOLUME',
        help: "The maximum fractional volume of the query box (to prevent queries that are too big)."
    });
    parser.add_argument('--maxOutputSizeInVoxelCountByPrecisionLevel', {
        nargs: '+',
        default: DefaultLimitsConfig.maxOutputSizeInVoxelCountByPrecisionLevel,
        metavar: 'LEVEL',
        help: "What is the (approximate) maximum desired size in voxel count by precision level\nRule of thumb: <response gzipped size> in [<voxel count> / 8, <voxel count> / 4].\nThe maximum number of voxels is tied to maxRequestBlockCount."
    });
}
function addServerArgs(parser) {
    parser.add_argument('--apiPrefix', {
        default: DefaultServerConfig.apiPrefix,
        metavar: 'PREFIX',
        help: "Specify the prefix of the API, i.e. <host>/<apiPrefix>/<API queries>"
    });
    parser.add_argument('--defaultPort', {
        default: DefaultServerConfig.defaultPort,
        metavar: 'PORT',
        type: 'int',
        help: "Specify the port the server is running on"
    });
    parser.add_argument('--shutdownTimeoutMinutes', {
        default: DefaultServerConfig.shutdownTimeoutMinutes,
        metavar: 'TIME',
        type: 'int',
        help: "0 for off, server will shut down after this amount of minutes."
    });
    parser.add_argument('--shutdownTimeoutVarianceMinutes', {
        default: DefaultServerConfig.shutdownTimeoutVarianceMinutes,
        metavar: 'VARIANCE',
        type: 'int',
        help: "modifies the shutdown timer by +/- timeoutVarianceMinutes (to avoid multiple instances shutting at the same time)"
    });
    parser.add_argument('--idMap', {
        nargs: 2,
        action: 'append',
        metavar: ['TYPE', 'PATH'],
        help: [
            'Map `id`s for a `type` to a file path.',
            'Example: x-ray \'../../data/mdb/xray/${id}-ccp4.mdb\'',
            '',
            '  - JS expressions can be used inside ${}, e.g. \'${id.substr(1, 2)}/${id}.mdb\'',
            '  - Can be specified multiple times.',
            '  - The `TYPE` variable (e.g. `x-ray`) is arbitrary and depends on how you plan to use the server.',
            '    By default, Mol* Viewer uses `x-ray` and `em`, but any particular use case may vary. '
        ].join('\n'),
    });
}
function addJsonConfigArgs(parser) {
    parser.add_argument('--cfg', {
        help: [
            'JSON config file path',
            'If a property is not specified, cmd line param/OS variable/default value are used.'
        ].join('\n'),
        required: false,
    });
    parser.add_argument('--printCfg', { help: 'Print current config for validation and exit.', required: false, action: 'store_true' });
    parser.add_argument('--cfgTemplate', { help: 'Prints default JSON config template to be modified and exits.', required: false, action: 'store_true' });
}
export var ServerConfig = __assign({}, DefaultServerConfig);
function setServerConfig(config) {
    for (var _i = 0, _a = ObjectKeys(ServerConfig); _i < _a.length; _i++) {
        var k = _a[_i];
        if (config[k] !== void 0)
            ServerConfig[k] = config[k];
    }
}
function validateServerConfig() {
    if (!ServerConfig.idMap || ServerConfig.idMap.length === 0) {
        throw new Error("Please provide 'idMap' configuration. See [-h] for available options.");
    }
}
var DefaultLimitsConfig = {
    maxRequestBlockCount: 32,
    maxFractionalBoxVolume: 1024,
    maxOutputSizeInVoxelCountByPrecisionLevel: [
        0.5 * 1024 * 1024,
        1 * 1024 * 1024,
        2 * 1024 * 1024,
        4 * 1024 * 1024,
        8 * 1024 * 1024,
        16 * 1024 * 1024,
        24 * 1024 * 1024
    ]
};
export var LimitsConfig = __assign({}, DefaultLimitsConfig);
function setLimitsConfig(config) {
    for (var _i = 0, _a = ObjectKeys(LimitsConfig); _i < _a.length; _i++) {
        var k = _a[_i];
        if (config[k] !== void 0)
            LimitsConfig[k] = config[k];
    }
}
function setConfig(config) {
    setServerConfig(config);
    setLimitsConfig(config);
}
var ServerConfigTemplate = __assign(__assign(__assign({}, DefaultServerConfig), { idMap: [
        ['x-ray', './path-to-xray-data/${id.substr(1, 2)}/${id}.mdb'],
        ['em', './path-to-em-data/emd-${id}.mdb']
    ] }), DefaultLimitsConfig);
export function configureServer() {
    var parser = new argparse.ArgumentParser({
        // version: VOLUME_SERVER_VERSION,
        add_help: true,
        description: VOLUME_SERVER_HEADER
    });
    addJsonConfigArgs(parser);
    addServerArgs(parser);
    addLimitsArgs(parser);
    var config = parser.parse_args();
    if (!!config.cfgTemplate) {
        console.log(JSON.stringify(ServerConfigTemplate, null, 2));
        process.exit(0);
    }
    try {
        setConfig(config); // sets the config for global use
        if (config.cfg) {
            var cfg = JSON.parse(fs.readFileSync(config.cfg, 'utf8'));
            setConfig(cfg);
        }
        if (config.printCfg) {
            console.log(JSON.stringify(__assign(__assign({}, ServerConfig), LimitsConfig), null, 2));
            process.exit(0);
        }
        validateServerConfig();
    }
    catch (e) {
        console.error('' + e);
        process.exit(1);
    }
}
export function configureLocal() {
    var parser = new argparse.ArgumentParser({
        // version: VOLUME_SERVER_VERSION,
        add_help: true,
        description: VOLUME_SERVER_HEADER
    });
    parser.add_argument('--jobs', { help: "Path to a JSON file with job specification.", required: false });
    parser.add_argument('--jobsTemplate', { help: 'Print example template for jobs.json and exit.', required: false, action: 'store_true' });
    addJsonConfigArgs(parser);
    addLimitsArgs(parser);
    var config = parser.parse_args();
    if (config.cfgTemplate) {
        console.log(JSON.stringify(DefaultLimitsConfig, null, 2));
        process.exit(0);
    }
    try {
        setLimitsConfig(config); // sets the config for global use
        if (config.cfg) {
            var cfg = JSON.parse(fs.readFileSync(config.cfg, 'utf8'));
            setLimitsConfig(cfg);
        }
        if (config.printCfg) {
            console.log(JSON.stringify(LimitsConfig, null, 2));
            process.exit(0);
        }
        return config;
    }
    catch (e) {
        console.error('' + e);
        process.exit(1);
    }
}
