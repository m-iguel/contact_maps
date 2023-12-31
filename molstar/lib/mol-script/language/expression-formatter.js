/*
 * Copyright (c) 2018 Mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { Expression } from './expression';
var isLiteral = Expression.isLiteral, isSymbol = Expression.isSymbol, isArgumentsArray = Expression.isArgumentsArray;
var Writer = /** @class */ (function () {
    function Writer() {
        this.value = [];
        this.currentLineLength = 0;
        this.prefixLength = 0;
        this._prefix = '';
        this.localPrefix = '';
    }
    Writer.prototype.setLocal = function () {
        this.localPrefix = '  ';
    };
    Writer.prototype.newline = function () {
        this.value.push("\n".concat(this._prefix).concat(this.localPrefix));
        this.currentLineLength = 0;
    };
    Writer.prototype.push = function () {
        this.value.push('(');
        this.currentLineLength = 0;
        this.localPrefix = '';
        this.prefixLength += 2;
        this._prefix = new Array(this.prefixLength + 1).join(' ');
    };
    Writer.prototype.pop = function () {
        this.value.push(')');
        this.prefixLength -= 2;
        this._prefix = new Array(this.prefixLength + 1).join(' ');
    };
    Writer.prototype.append = function (str) {
        if (!this.currentLineLength) {
            this.value.push(str);
            this.currentLineLength = str.length;
        }
        else if (this.currentLineLength + this.prefixLength + this.localPrefix.length + str.length < 80) {
            this.value.push(str);
            this.currentLineLength += str.length;
        }
        else {
            this.setLocal();
            this.newline();
            this.value.push(str);
            this.currentLineLength = str.length;
        }
    };
    Writer.prototype.whitespace = function () {
        if (this.currentLineLength + this.prefixLength + this.localPrefix.length + 1 < 80) {
            this.value.push(' ');
        }
    };
    Writer.prototype.getStr = function () {
        return this.value.join('');
    };
    return Writer;
}());
function _format(e, writer) {
    if (isLiteral(e)) {
        if (typeof e === 'string' && (/\s/.test(e) || !e.length))
            writer.append("`".concat(e, "`"));
        else
            writer.append("".concat(e));
        return;
    }
    if (isSymbol(e)) {
        writer.append("".concat(e.name));
        return;
    }
    writer.push();
    _format(e.head, writer);
    if (!e.args) {
        writer.pop();
        return;
    }
    if (isArgumentsArray(e.args)) {
        var prevLiteral = true;
        for (var _i = 0, _a = e.args; _i < _a.length; _i++) {
            var a = _a[_i];
            if (isLiteral(a)) {
                if (prevLiteral)
                    writer.whitespace();
                else
                    writer.newline();
                prevLiteral = true;
            }
            else {
                prevLiteral = false;
                writer.newline();
            }
            _format(a, writer);
        }
        writer.pop();
        return;
    }
    var keys = Object.keys(e.args);
    if (!keys.length) {
        writer.pop();
        return;
    }
    if (keys.length === 1 && isLiteral(e.args[keys[0]])) {
        writer.whitespace();
        writer.append(":".concat(keys[0]));
        writer.whitespace();
        _format(e.args[keys[0]], writer);
        writer.pop();
        return;
    }
    for (var _b = 0, keys_1 = keys; _b < keys_1.length; _b++) {
        var a = keys_1[_b];
        writer.newline();
        writer.append(":".concat(a));
        writer.whitespace();
        _format(e.args[a], writer);
    }
    writer.pop();
}
export function formatMolScript(e) {
    var writer = new Writer();
    _format(e, writer);
    return writer.getStr();
}
