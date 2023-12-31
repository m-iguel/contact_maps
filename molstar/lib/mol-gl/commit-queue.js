/**
 * Copyright (c) 2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { LinkedList } from '../mol-data/generic';
var CommitQueue = /** @class */ (function () {
    function CommitQueue() {
        this.removeList = LinkedList();
        this.removeMap = new Map();
        this.addList = LinkedList();
        this.addMap = new Map();
    }
    Object.defineProperty(CommitQueue.prototype, "isEmpty", {
        get: function () {
            return this.removeList.count === 0 && this.addList.count === 0;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(CommitQueue.prototype, "size", {
        get: function () {
            return this.removeMap.size + this.addMap.size;
        },
        enumerable: false,
        configurable: true
    });
    CommitQueue.prototype.add = function (o) {
        if (this.removeMap.has(o)) {
            var a = this.removeMap.get(o);
            this.removeMap.delete(o);
            this.removeList.remove(a);
        }
        if (this.addMap.has(o))
            return;
        var b = this.addList.addLast(o);
        this.addMap.set(o, b);
    };
    CommitQueue.prototype.remove = function (o) {
        if (this.addMap.has(o)) {
            var a = this.addMap.get(o);
            this.addMap.delete(o);
            this.addList.remove(a);
        }
        if (this.removeMap.has(o))
            return;
        var b = this.removeList.addLast(o);
        this.removeMap.set(o, b);
    };
    CommitQueue.prototype.tryGetRemove = function () {
        var o = this.removeList.removeFirst();
        if (o)
            this.removeMap.delete(o);
        return o;
    };
    CommitQueue.prototype.tryGetAdd = function () {
        var o = this.addList.removeFirst();
        if (o)
            this.addMap.delete(o);
        return o;
    };
    return CommitQueue;
}());
export { CommitQueue };
