/**
 * Copyright (c) 2018-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { StructureElement } from '../structure';
import { now } from '../../../mol-util/now';
import { defaultBondTest } from './queries/internal';
var QueryContext = /** @class */ (function () {
    function QueryContext(structure, options) {
        this.currentElementStack = [];
        this.currentAtomicBondStack = [];
        this.currentStructureStack = [];
        this.inputStructureStack = [];
        this.timeCreated = now();
        /** Current element */
        this.element = StructureElement.Location.create(void 0);
        this.currentStructure = void 0;
        /** Current bond between atoms */
        this.atomicBond = new QueryContextBondInfo();
        /** Supply this from the outside. Used by the internal.generator.current symbol */
        this.currentSelection = void 0;
        this.inputStructure = structure;
        this.timeoutMs = (options && options.timeoutMs) || 0;
        this.currentSelection = options && options.currentSelection;
    }
    QueryContext.prototype.pushCurrentElement = function () {
        this.currentElementStack[this.currentElementStack.length] = this.element;
        this.element = StructureElement.Location.create(void 0);
        return this.element;
    };
    QueryContext.prototype.popCurrentElement = function () {
        this.element = this.currentElementStack.pop();
    };
    QueryContext.prototype.pushCurrentBond = function () {
        if (this.atomicBond)
            this.currentAtomicBondStack.push(this.atomicBond);
        this.atomicBond = new QueryContextBondInfo();
        return this.atomicBond;
    };
    QueryContext.prototype.popCurrentBond = function () {
        if (this.currentAtomicBondStack.length > 0) {
            this.atomicBond = this.currentAtomicBondStack.pop();
        }
        else {
            this.atomicBond = void 0;
        }
    };
    QueryContext.prototype.pushCurrentStructure = function () {
        if (this.currentStructure)
            this.currentStructureStack.push(this.currentStructure);
    };
    QueryContext.prototype.popCurrentStructure = function () {
        if (this.currentStructureStack.length)
            this.currentStructure = this.currentStructureStack.pop();
        else
            this.currentStructure = void 0;
    };
    QueryContext.prototype.pushInputStructure = function (structure) {
        this.inputStructureStack.push(this.inputStructure);
        this.inputStructure = structure;
    };
    QueryContext.prototype.popInputStructure = function () {
        if (this.inputStructureStack.length === 0)
            throw new Error('Must push before pop.');
        this.inputStructure = this.inputStructureStack.pop();
    };
    QueryContext.prototype.throwIfTimedOut = function () {
        if (this.timeoutMs === 0)
            return;
        if (now() - this.timeCreated > this.timeoutMs) {
            throw new Error("The query took too long to execute (> ".concat(this.timeoutMs / 1000, "s)."));
        }
    };
    QueryContext.prototype.tryGetCurrentSelection = function () {
        if (!this.currentSelection)
            throw new Error('The current selection is not assigned.');
        return this.currentSelection;
    };
    return QueryContext;
}());
export { QueryContext };
var QueryContextBondInfo = /** @class */ (function () {
    function QueryContextBondInfo() {
        this.a = StructureElement.Location.create(void 0);
        this.aIndex = 0;
        this.b = StructureElement.Location.create(void 0);
        this.bIndex = 0;
        this.type = 0 /* BondType.Flag.None */;
        this.order = 0;
        this.key = -1;
        this.testFn = defaultBondTest;
    }
    QueryContextBondInfo.prototype.setStructure = function (s) {
        this.a.structure = s;
        this.b.structure = s;
    };
    QueryContextBondInfo.prototype.setTestFn = function (fn) {
        this.testFn = fn || defaultBondTest;
    };
    QueryContextBondInfo.prototype.test = function (ctx, trySwap) {
        if (this.testFn(ctx))
            return true;
        if (trySwap) {
            this.swap();
            return this.testFn(ctx);
        }
        return false;
    };
    QueryContextBondInfo.prototype.swap = function () {
        // const sA = this.a.structure;
        // this.a.structure = this.b.structure;
        // this.b.structure = sA;
        var idxA = this.aIndex;
        this.aIndex = this.bIndex;
        this.bIndex = idxA;
        var unitA = this.a.unit;
        this.a.unit = this.b.unit;
        this.b.unit = unitA;
        var eA = this.a.element;
        this.a.element = this.b.element;
        this.b.element = eA;
    };
    Object.defineProperty(QueryContextBondInfo.prototype, "length", {
        get: function () {
            return StructureElement.Location.distance(this.a, this.b);
        },
        enumerable: false,
        configurable: true
    });
    return QueryContextBondInfo;
}());
