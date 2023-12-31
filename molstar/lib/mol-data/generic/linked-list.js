/**
 * Copyright (c) 2017 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
function LinkedList() {
    return new LinkedListImpl();
}
function createListNode(value) {
    return { previous: null, next: null, inList: true, value: value };
}
var LinkedListImpl = /** @class */ (function () {
    function LinkedListImpl() {
        this.count = 0;
        this.first = null;
        this.last = null;
    }
    LinkedListImpl.prototype.addFirst = function (value) {
        var node = createListNode(value);
        node.inList = true;
        if (this.first)
            this.first.previous = node;
        node.next = this.first;
        this.first = node;
        this.count++;
        if (!this.last)
            this.last = node;
        return node;
    };
    LinkedListImpl.prototype.addLast = function (value) {
        var node = createListNode(value);
        if (this.last !== null) {
            this.last.next = node;
        }
        node.previous = this.last;
        this.last = node;
        if (this.first === null) {
            this.first = node;
        }
        node.inList = true;
        this.count++;
        return node;
    };
    LinkedListImpl.prototype.removeFirst = function () {
        var fst = this.first;
        if (fst) {
            this.remove(fst);
            return fst.value;
        }
        return void 0;
    };
    LinkedListImpl.prototype.removeLast = function () {
        var last = this.last;
        if (last) {
            this.remove(last);
            return last.value;
        }
        return void 0;
    };
    LinkedListImpl.prototype.remove = function (node) {
        if (!node.inList)
            return;
        node.inList = false;
        if (node.previous !== null) {
            node.previous.next = node.next;
        }
        else if ( /* first == item*/node.previous === null) {
            this.first = node.next;
        }
        if (node.next !== null) {
            node.next.previous = node.previous;
        }
        else if ( /* last == item*/node.next === null) {
            this.last = node.previous;
        }
        node.next = null;
        node.previous = null;
        this.count--;
    };
    LinkedListImpl.prototype.find = function (value) {
        var current = this.first;
        while (current !== null) {
            if (current.value === value)
                return current;
            current = current.next;
        }
        return void 0;
    };
    return LinkedListImpl;
}());
export { LinkedList };
