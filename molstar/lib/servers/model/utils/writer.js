/**
 * Copyright (c) 2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import * as fs from 'fs';
import * as path from 'path';
import { makeDir } from '../../../mol-util/make-dir';
import { encodeTarHeader, END_OF_TAR } from './tar';
import * as zlib from 'zlib';
var SimpleResponseResultWriter = /** @class */ (function () {
    function SimpleResponseResultWriter(fn, res, isBinary, isDownload) {
        this.fn = fn;
        this.res = res;
        this.isBinary = isBinary;
        this.isDownload = isDownload;
        this.ended = false;
        this.headerWritten = false;
    }
    SimpleResponseResultWriter.prototype.beginEntry = function (name) {
        throw new Error('Not supported');
    };
    SimpleResponseResultWriter.prototype.endEntry = function () {
        throw new Error('Not supported');
    };
    SimpleResponseResultWriter.prototype.doError = function (code, message) {
        if (code === void 0) { code = 404; }
        if (message === void 0) { message = 'Not Found.'; }
        if (!this.headerWritten) {
            this.headerWritten = true;
            this.res.status(code).send(message);
        }
        this.end();
    };
    SimpleResponseResultWriter.prototype.writeHeader = function () {
        if (this.headerWritten)
            return;
        this.headerWritten = true;
        this.res.writeHead(200, {
            // TODO there seems to be a bug in swagger-ui - front-end will freeze for cif delivered as text/plain (forcing binary is a hack to circumvent this)
            'Content-Type': this.isBinary ? 'application/octet-stream' : 'text/plain; charset=utf-8',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'X-Requested-With',
            'Content-Disposition': "".concat(this.isDownload ? 'attachment' : 'inline', "; filename=\"").concat(this.fn, "\"")
        });
    };
    SimpleResponseResultWriter.prototype.writeBinary = function (data) {
        this.writeHeader();
        return this.res.write(Buffer.from(data.buffer, data.byteOffset, data.byteLength));
    };
    SimpleResponseResultWriter.prototype.writeString = function (data) {
        this.writeHeader();
        return this.res.write(data);
    };
    SimpleResponseResultWriter.prototype.end = function () {
        if (this.ended)
            return;
        this.res.end();
        this.ended = true;
    };
    return SimpleResponseResultWriter;
}());
export { SimpleResponseResultWriter };
var TarballResponseResultWriter = /** @class */ (function () {
    function TarballResponseResultWriter(fn, res) {
        this.fn = fn;
        this.res = res;
        this.ended = false;
        this.headerWritten = false;
        this.stream = zlib.createGzip({ level: 6, memLevel: 9, chunkSize: 16 * 16384 });
        this.entrySize = 0;
    }
    TarballResponseResultWriter.prototype.beginEntry = function (name, size) {
        this.writeHeader();
        var header = encodeTarHeader({ name: name, size: size });
        this.entrySize = size;
        this.stream.write(header);
    };
    TarballResponseResultWriter.prototype.endEntry = function () {
        var size = this.entrySize & 511;
        if (size)
            this.stream.write(END_OF_TAR.slice(0, 512 - size));
    };
    TarballResponseResultWriter.prototype.doError = function (code, message) {
        if (code === void 0) { code = 404; }
        if (message === void 0) { message = 'Not Found.'; }
        if (!this.headerWritten) {
            this.headerWritten = true;
            this.res.status(code).send(message);
        }
        this.end();
    };
    TarballResponseResultWriter.prototype.writeHeader = function () {
        var _this = this;
        if (this.headerWritten)
            return;
        this.stream.pipe(this.res, { end: true });
        this.stream.on('end', function () { return _this.res.end(); });
        this.headerWritten = true;
        this.res.writeHead(200, {
            'Content-Type': 'application/tar+gzip',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'X-Requested-With',
            'Content-Disposition': "inline; filename=\"".concat(this.fn, "\"")
        });
    };
    TarballResponseResultWriter.prototype.writeBinary = function (data) {
        this.writeHeader();
        return !!this.stream.write(Buffer.from(data.buffer, data.byteOffset, data.byteLength));
    };
    TarballResponseResultWriter.prototype.writeString = function (data) {
        this.writeHeader();
        return !!this.stream.write(data);
    };
    TarballResponseResultWriter.prototype.end = function () {
        if (this.ended)
            return;
        this.ended = true;
        if (!this.headerWritten) {
            return;
        }
        this.stream.write(END_OF_TAR);
        this.stream.end();
    };
    return TarballResponseResultWriter;
}());
export { TarballResponseResultWriter };
var FileResultWriter = /** @class */ (function () {
    function FileResultWriter(fn) {
        this.fn = fn;
        this.file = void 0;
        this.ended = false;
        this.opened = false;
    }
    FileResultWriter.prototype.beginEntry = function (name) {
        throw new Error('Not supported');
    };
    FileResultWriter.prototype.endEntry = function () {
        throw new Error('Not supported');
    };
    FileResultWriter.prototype.open = function () {
        if (this.opened)
            return;
        makeDir(path.dirname(this.fn));
        this.file = fs.createWriteStream(this.fn);
        this.opened = true;
    };
    FileResultWriter.prototype.writeBinary = function (data) {
        var _a;
        this.open();
        (_a = this.file) === null || _a === void 0 ? void 0 : _a.write(Buffer.from(data.buffer, data.byteOffset, data.byteLength));
        return true;
    };
    FileResultWriter.prototype.writeString = function (data) {
        var _a;
        this.open();
        (_a = this.file) === null || _a === void 0 ? void 0 : _a.write(data);
        return true;
    };
    FileResultWriter.prototype.end = function () {
        var _a;
        if (!this.opened || this.ended)
            return;
        (_a = this.file) === null || _a === void 0 ? void 0 : _a.end();
        this.ended = true;
    };
    return FileResultWriter;
}());
export { FileResultWriter };
var TarballFileResultWriter = /** @class */ (function () {
    function TarballFileResultWriter(fn, gzipLevel) {
        if (gzipLevel === void 0) { gzipLevel = 6; }
        this.fn = fn;
        this.gzipLevel = gzipLevel;
        this.file = void 0;
        this.ended = false;
        this.opened = false;
        this.stream = zlib.createGzip({ level: this.gzipLevel, memLevel: 9, chunkSize: 16 * 16384 });
        this.entrySize = 0;
    }
    TarballFileResultWriter.prototype.beginEntry = function (name, size) {
        var header = encodeTarHeader({ name: name, size: size });
        this.entrySize = size;
        this.stream.write(header);
    };
    TarballFileResultWriter.prototype.endEntry = function () {
        var size = this.entrySize & 511;
        if (size)
            this.stream.write(END_OF_TAR.slice(0, 512 - size));
    };
    TarballFileResultWriter.prototype.open = function () {
        if (this.opened)
            return;
        makeDir(path.dirname(this.fn));
        this.file = fs.createWriteStream(this.fn);
        this.stream.pipe(this.file, { end: true });
        this.opened = true;
    };
    TarballFileResultWriter.prototype.writeBinary = function (data) {
        this.open();
        this.stream.write(Buffer.from(data.buffer, data.byteOffset, data.byteLength));
        return true;
    };
    TarballFileResultWriter.prototype.writeString = function (data) {
        this.open();
        this.stream.write(data);
        return true;
    };
    TarballFileResultWriter.prototype.end = function () {
        if (!this.opened || this.ended)
            return;
        this.stream.write(END_OF_TAR);
        this.stream.end();
        this.ended = true;
    };
    return TarballFileResultWriter;
}());
export { TarballFileResultWriter };
