/**
 * Copyright (c) 2018 Mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { MonadicParser as P } from '../../mol-util/monadic-parser';
import { Expression } from './expression';
import { MolScriptBuilder as B } from './builder';
import { assertUnreachable } from '../../mol-util/type-helpers';
export function parseMolScript(input) {
    return Language.parse(input);
}
var Language;
(function (Language) {
    var ASTNode;
    (function (ASTNode) {
        function str(value) { return { kind: 'string', value: value }; }
        ASTNode.str = str;
        function symb(value) { return { kind: 'symbol', value: value }; }
        ASTNode.symb = symb;
        function list(bracket, nodes) { return { kind: 'list', bracket: bracket, nodes: nodes }; }
        ASTNode.list = list;
        function comment(value) { return { kind: 'comment', value: value }; }
        ASTNode.comment = comment;
    })(ASTNode || (ASTNode = {}));
    var ws = P.regexp(/[\n\r\s]*/);
    var Expr = P.lazy(function () { return (P.alt(Str, List, Symb, Comment).trim(ws)); });
    var Str = P.takeWhile(function (c) { return c !== '`'; }).trim('`').map(ASTNode.str);
    var Symb = P.regexp(/[^()\[\]{};`,\n\r\s]+/).map(ASTNode.symb);
    var Comment = P.regexp(/\s*;+([^\n\r]*)\n/, 1).map(ASTNode.comment);
    var Args = Expr.many();
    var List1 = Args.wrap('(', ')').map(function (args) { return ASTNode.list('(', args); });
    var List2 = Args.wrap('[', ']').map(function (args) { return ASTNode.list('[', args); });
    var List3 = Args.wrap('{', '}').map(function (args) { return ASTNode.list('{', args); });
    var List = P.alt(List1, List2, List3);
    var Expressions = Expr.many();
    function getAST(input) { return Expressions.tryParse(input); }
    function visitExpr(expr) {
        switch (expr.kind) {
            case 'string': return expr.value;
            case 'symbol': {
                var value = expr.value;
                if (value.length > 1) {
                    var fst = value.charAt(0);
                    switch (fst) {
                        case '.': return B.atomName(value.substr(1));
                        case '_': return B.struct.type.elementSymbol([value.substr(1)]);
                    }
                }
                if (value === 'true')
                    return true;
                if (value === 'false')
                    return false;
                if (isNumber(value))
                    return +value;
                return Expression.Symbol(value);
            }
            case 'list': {
                switch (expr.bracket) {
                    case '[': return B.core.type.list(withoutComments(expr.nodes).map(visitExpr));
                    case '{': return B.core.type.set(withoutComments(expr.nodes).map(visitExpr));
                    case '(': {
                        if (expr.nodes[0].kind === 'comment')
                            throw new Error('Invalid expression');
                        var head = visitExpr(expr.nodes[0]);
                        return Expression.Apply(head, getArgs(expr.nodes));
                    }
                    default: assertUnreachable(expr.bracket);
                }
            }
            default: assertUnreachable(expr);
        }
    }
    function getArgs(nodes) {
        if (nodes.length <= 1)
            return void 0;
        if (!hasNamedArgs(nodes)) {
            var args_1 = [];
            for (var i = 1, _i = nodes.length; i < _i; i++) {
                var n = nodes[i];
                if (n.kind === 'comment')
                    continue;
                args_1[args_1.length] = visitExpr(n);
            }
            return args_1;
        }
        var args = {};
        var allNumeric = true;
        var pos = 0;
        for (var i = 1, _i = nodes.length; i < _i; i++) {
            var n = nodes[i];
            if (n.kind === 'comment')
                continue;
            if (n.kind === 'symbol' && n.value.length > 1 && n.value.charAt(0) === ':') {
                var name_1 = n.value.substr(1);
                ++i;
                while (i < _i && nodes[i].kind === 'comment') {
                    i++;
                }
                if (i >= _i)
                    throw new Error("There must be a value foolowed a named arg ':".concat(name_1, "'."));
                if (nodes[i].kind === 'comment')
                    throw new Error('Invalid expression');
                args[name_1] = visitExpr(nodes[i]);
                if (isNaN(+name_1))
                    allNumeric = false;
            }
            else {
                args[pos++] = visitExpr(n);
            }
        }
        if (allNumeric) {
            var keys = Object.keys(args).map(function (a) { return +a; }).sort(function (a, b) { return a - b; });
            var isArray = true;
            for (var i = 0, _i = keys.length; i < _i; i++) {
                if (keys[i] !== i) {
                    isArray = false;
                    break;
                }
            }
            if (isArray) {
                var arrayArgs = [];
                for (var i = 0, _i = keys.length; i < _i; i++) {
                    arrayArgs[i] = args[i];
                }
                return arrayArgs;
            }
        }
        return args;
    }
    function hasNamedArgs(nodes) {
        for (var i = 1, _i = nodes.length; i < _i; i++) {
            var n = nodes[i];
            if (n.kind === 'symbol' && n.value.length > 1 && n.value.charAt(0) === ':')
                return true;
        }
        return false;
    }
    function withoutComments(nodes) {
        var hasComment = false;
        for (var i = 0, _i = nodes.length; i < _i; i++) {
            if (nodes[i].kind === 'comment') {
                hasComment = true;
                break;
            }
        }
        if (!hasComment)
            return nodes;
        return nodes.filter(function (n) { return n.kind !== 'comment'; });
    }
    function isNumber(value) {
        return /-?(0|[1-9][0-9]*)([.][0-9]+)?([eE][+-]?[0-9]+)?/.test(value) && !isNaN(+value);
    }
    function parse(input) {
        var ast = getAST(input);
        var ret = [];
        for (var _a = 0, ast_1 = ast; _a < ast_1.length; _a++) {
            var expr = ast_1[_a];
            if (expr.kind === 'comment')
                continue;
            ret[ret.length] = visitExpr(expr);
        }
        return ret;
    }
    Language.parse = parse;
})(Language || (Language = {}));
