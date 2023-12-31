/**
 * Copyright (c) 2018-2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * Taken/adapted from DensityServer (https://github.com/dsehnal/DensityServer)
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { __awaiter, __generator, __spreadArray } from "tslib";
import * as Api from './api';
import * as Coords from './algebra/coordinate';
import { ConsoleLogger } from '../../../mol-util/console-logger';
import { State } from './state';
import { LimitsConfig, ServerConfig } from '../config';
import { interpolate } from '../../../mol-util/string';
import { getSchema, shortcutIconLink } from './web-schema';
import { swaggerUiIndexHandler, swaggerUiAssetsHandler } from '../../common/swagger-ui';
export function init(app) {
    app.locals.mapFile = getMapFileFn();
    function makePath(p) {
        return "".concat(ServerConfig.apiPrefix, "/").concat(p);
    }
    // Header
    app.get(makePath(':source/:id/?$'), function (req, res) { return getHeader(req, res); });
    // Box /:src/:id/box/:a1,:a2,:a3/:b1,:b2,:b3?text=0|1&space=cartesian|fractional
    app.get(makePath(':source/:id/box/:a1,:a2,:a3/:b1,:b2,:b3/?'), function (req, res) { return queryBox(req, res, getQueryParams(req, false)); });
    // Cell /:src/:id/cell/?text=0|1&space=cartesian|fractional
    app.get(makePath(':source/:id/cell/?'), function (req, res) { return queryBox(req, res, getQueryParams(req, true)); });
    app.get(makePath('openapi.json'), function (req, res) {
        res.writeHead(200, {
            'Content-Type': 'application/json; charset=utf-8',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'X-Requested-With'
        });
        res.end(JSON.stringify(getSchema()));
    });
    app.use(makePath(''), swaggerUiAssetsHandler());
    app.get(makePath(''), swaggerUiIndexHandler({
        openapiJsonUrl: makePath('openapi.json'),
        apiPrefix: ServerConfig.apiPrefix,
        title: 'VolumeServer API',
        shortcutIconLink: shortcutIconLink
    }));
}
function getMapFileFn() {
    var map = new Function('type', 'id', 'interpolate', __spreadArray(__spreadArray([
        'id = id.toLowerCase()',
        'switch (type.toLowerCase()) {'
    ], ServerConfig.idMap.map(function (mapping) {
        var type = mapping[0], path = mapping[1];
        return "    case '".concat(type, "': return interpolate('").concat(path, "', { id });");
    }), true), [
        '    default: return void 0;',
        '}'
    ], false).join('\n'));
    return function (type, id) { return map(type, id, interpolate); };
}
function wrapResponse(fn, res) {
    return {
        do404: function () {
            if (!this.headerWritten) {
                res.writeHead(404);
                this.headerWritten = true;
            }
            this.end();
        },
        writeHeader: function (binary) {
            if (this.headerWritten)
                return;
            res.writeHead(200, {
                'Content-Type': binary ? 'application/octet-stream' : 'text/plain; charset=utf-8',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'X-Requested-With',
                'Content-Disposition': "inline; filename=\"".concat(fn, "\"")
            });
            this.headerWritten = true;
        },
        writeBinary: function (data) {
            if (!this.headerWritten)
                this.writeHeader(true);
            return res.write(Buffer.from(data.buffer));
        },
        writeString: function (data) {
            if (!this.headerWritten)
                this.writeHeader(false);
            return res.write(data);
        },
        end: function () {
            if (this.ended)
                return;
            res.end();
            this.ended = true;
        },
        ended: false,
        headerWritten: false
    };
}
function getSourceInfo(req) {
    return {
        filename: req.app.locals.mapFile(req.params.source, req.params.id),
        id: "".concat(req.params.source, "/").concat(req.params.id)
    };
}
function validateSourceAndId(req, res) {
    if (!req.params.source || req.params.source.length > 32 || !req.params.id || req.params.id.length > 32) {
        res.writeHead(404);
        res.end();
        ConsoleLogger.error("Query Box", 'Invalid source and/or id');
        return true;
    }
    return false;
}
function getHeader(req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var headerWritten, _a, filename, id, header, e_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (validateSourceAndId(req, res)) {
                        return [2 /*return*/];
                    }
                    headerWritten = false;
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, 4, 5]);
                    _a = getSourceInfo(req), filename = _a.filename, id = _a.id;
                    return [4 /*yield*/, Api.getExtendedHeaderJson(filename, id)];
                case 2:
                    header = _b.sent();
                    if (!header) {
                        res.writeHead(404);
                        return [2 /*return*/];
                    }
                    res.writeHead(200, {
                        'Content-Type': 'application/json; charset=utf-8',
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Headers': 'X-Requested-With'
                    });
                    headerWritten = true;
                    res.write(header);
                    return [3 /*break*/, 5];
                case 3:
                    e_1 = _b.sent();
                    ConsoleLogger.error("Header ".concat(req.params.source, "/").concat(req.params.id), e_1);
                    if (!headerWritten) {
                        res.writeHead(404);
                    }
                    return [3 /*break*/, 5];
                case 4:
                    res.end();
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    });
}
function getQueryParams(req, isCell) {
    var a = [+req.params.a1, +req.params.a2, +req.params.a3];
    var b = [+req.params.b1, +req.params.b2, +req.params.b3];
    var detail = Math.min(Math.max(0, (+req.query.detail) | 0), LimitsConfig.maxOutputSizeInVoxelCountByPrecisionLevel.length - 1);
    var isCartesian = (req.query.space || '').toLowerCase() !== 'fractional';
    var box = isCell
        ? { kind: 'Cell' }
        : (isCartesian
            ? { kind: 'Cartesian', a: Coords.cartesian(a[0], a[1], a[2]), b: Coords.cartesian(b[0], b[1], b[2]) }
            : { kind: 'Fractional', a: Coords.fractional(a[0], a[1], a[2]), b: Coords.fractional(b[0], b[1], b[2]) });
    var asBinary = (req.query.encoding || '').toLowerCase() !== 'cif';
    var sourceFilename = req.app.locals.mapFile(req.params.source, req.params.id);
    return {
        sourceFilename: sourceFilename,
        sourceId: "".concat(req.params.source, "/").concat(req.params.id),
        asBinary: asBinary,
        box: box,
        detail: detail
    };
}
function queryBox(req, res, params) {
    return __awaiter(this, void 0, void 0, function () {
        var outputFilename, response, ok, e_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (validateSourceAndId(req, res)) {
                        return [2 /*return*/];
                    }
                    outputFilename = Api.getOutputFilename(req.params.source, req.params.id, params);
                    response = wrapResponse(outputFilename, res);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    if (!params.sourceFilename) {
                        response.do404();
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, Api.queryBox(params, function () { return response; })];
                case 2:
                    ok = _a.sent();
                    if (!ok) {
                        response.do404();
                        return [2 /*return*/];
                    }
                    return [3 /*break*/, 5];
                case 3:
                    e_2 = _a.sent();
                    ConsoleLogger.error("Query Box ".concat(JSON.stringify(req.params || {}), " | ").concat(JSON.stringify(req.query || {})), e_2);
                    response.do404();
                    return [3 /*break*/, 5];
                case 4:
                    response.end();
                    queryDone();
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    });
}
function queryDone() {
    if (State.shutdownOnZeroPending) {
        process.exit(0);
    }
}
