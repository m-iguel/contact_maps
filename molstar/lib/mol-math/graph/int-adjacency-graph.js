/**
 * Copyright (c) 2018-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { arrayPickIndices, cantorPairing } from '../../mol-data/util';
import { LinkedIndex, SortedArray } from '../../mol-data/int';
export var IntAdjacencyGraph;
(function (IntAdjacencyGraph) {
    function areEqual(a, b) {
        if (a === b)
            return true;
        if (a.vertexCount !== b.vertexCount || a.edgeCount !== b.edgeCount)
            return false;
        var aa = a.a, ab = a.b, ao = a.offset;
        var ba = b.a, bb = b.b, bo = b.offset;
        for (var i = 0, _i = a.a.length; i < _i; i++) {
            if (aa[i] !== ba[i])
                return false;
        }
        for (var i = 0, _i = a.b.length; i < _i; i++) {
            if (ab[i] !== bb[i])
                return false;
        }
        for (var i = 0, _i = a.offset.length; i < _i; i++) {
            if (ao[i] !== bo[i])
                return false;
        }
        for (var _a = 0, _b = Object.keys(a.edgeProps); _a < _b.length; _a++) {
            var k = _b[_a];
            var pa = a.edgeProps[k], pb = b.edgeProps[k];
            if (!pb)
                return false;
            for (var i = 0, _i = pa.length; i < _i; i++) {
                if (pa[i] !== pb[i])
                    return false;
            }
        }
        return true;
    }
    IntAdjacencyGraph.areEqual = areEqual;
    var IntGraphImpl = /** @class */ (function () {
        function IntGraphImpl(offset, a, b, edgeCount, edgeProps, props) {
            this.offset = offset;
            this.a = a;
            this.b = b;
            this.edgeCount = edgeCount;
            this.props = props;
            this.vertexCount = offset.length - 1;
            this.edgeProps = (edgeProps || {});
        }
        IntGraphImpl.prototype.getEdgeIndex = function (i, j) {
            var a, b;
            if (i < j) {
                a = i;
                b = j;
            }
            else {
                a = j;
                b = i;
            }
            for (var t = this.offset[a], _t = this.offset[a + 1]; t < _t; t++) {
                if (this.b[t] === b)
                    return t;
            }
            return -1;
        };
        IntGraphImpl.prototype.getDirectedEdgeIndex = function (i, j) {
            for (var t = this.offset[i], _t = this.offset[i + 1]; t < _t; t++) {
                if (this.b[t] === j)
                    return t;
            }
            return -1;
        };
        IntGraphImpl.prototype.getVertexEdgeCount = function (i) {
            return this.offset[i + 1] - this.offset[i];
        };
        return IntGraphImpl;
    }());
    function create(offset, a, b, edgeCount, edgeProps, props) {
        return new IntGraphImpl(offset, a, b, edgeCount, edgeProps, props);
    }
    IntAdjacencyGraph.create = create;
    var EdgeBuilder = /** @class */ (function () {
        function EdgeBuilder(vertexCount, xs, ys) {
            this.vertexCount = vertexCount;
            this.xs = xs;
            this.ys = ys;
            this.current = 0;
            this.curA = 0;
            this.curB = 0;
            this.edgeCount = xs.length;
            this.offsets = new Int32Array(this.vertexCount + 1);
            this.bucketFill = new Int32Array(this.vertexCount);
            var bucketSizes = new Int32Array(this.vertexCount);
            for (var i = 0, _i = this.xs.length; i < _i; i++)
                bucketSizes[this.xs[i]]++;
            for (var i = 0, _i = this.ys.length; i < _i; i++)
                bucketSizes[this.ys[i]]++;
            var offset = 0;
            for (var i = 0; i < this.vertexCount; i++) {
                this.offsets[i] = offset;
                offset += bucketSizes[i];
            }
            this.offsets[this.vertexCount] = offset;
            this.slotCount = offset;
            this.a = new Int32Array(offset);
            this.b = new Int32Array(offset);
        }
        EdgeBuilder.prototype.createGraph = function (edgeProps, props) {
            return create(this.offsets, this.a, this.b, this.edgeCount, edgeProps, props);
        };
        /**
         * @example
         *   const property = new Int32Array(builder.slotCount);
         *   for (let i = 0; i < builder.edgeCount; i++) {
         *     builder.addNextEdge();
         *     builder.assignProperty(property, srcProp[i]);
         *   }
         *   return builder.createGraph({ property });
         */
        EdgeBuilder.prototype.addNextEdge = function () {
            var a = this.xs[this.current], b = this.ys[this.current];
            var oa = this.offsets[a] + this.bucketFill[a];
            this.a[oa] = a;
            this.b[oa] = b;
            this.bucketFill[a]++;
            var ob = this.offsets[b] + this.bucketFill[b];
            this.a[ob] = b;
            this.b[ob] = a;
            this.bucketFill[b]++;
            this.current++;
            this.curA = oa;
            this.curB = ob;
        };
        /** Builds property-less graph */
        EdgeBuilder.prototype.addAllEdges = function () {
            for (var i = 0; i < this.edgeCount; i++) {
                this.addNextEdge();
            }
        };
        EdgeBuilder.prototype.assignProperty = function (prop, value) {
            prop[this.curA] = value;
            prop[this.curB] = value;
        };
        EdgeBuilder.prototype.assignDirectedProperty = function (propA, valueA, propB, valueB) {
            propA[this.curA] = valueA;
            propA[this.curB] = valueB;
            propB[this.curB] = valueA;
            propB[this.curA] = valueB;
        };
        return EdgeBuilder;
    }());
    IntAdjacencyGraph.EdgeBuilder = EdgeBuilder;
    var DirectedEdgeBuilder = /** @class */ (function () {
        function DirectedEdgeBuilder(vertexCount, xs, ys) {
            this.vertexCount = vertexCount;
            this.xs = xs;
            this.ys = ys;
            this.current = 0;
            this.curA = 0;
            this.edgeCount = xs.length;
            this.offsets = new Int32Array(this.vertexCount + 1);
            this.bucketFill = new Int32Array(this.vertexCount);
            var bucketSizes = new Int32Array(this.vertexCount);
            for (var i = 0, _i = this.xs.length; i < _i; i++)
                bucketSizes[this.xs[i]]++;
            var offset = 0;
            for (var i = 0; i < this.vertexCount; i++) {
                this.offsets[i] = offset;
                offset += bucketSizes[i];
            }
            this.offsets[this.vertexCount] = offset;
            this.slotCount = offset;
            this.a = new Int32Array(offset);
            this.b = new Int32Array(offset);
        }
        DirectedEdgeBuilder.prototype.createGraph = function (edgeProps, props) {
            return create(this.offsets, this.a, this.b, this.edgeCount, edgeProps, props);
        };
        /**
         * @example
         *   const property = new Int32Array(builder.slotCount);
         *   for (let i = 0; i < builder.edgeCount; i++) {
         *     builder.addNextEdge();
         *     builder.assignProperty(property, srcProp[i]);
         *   }
         *   return builder.createGraph({ property });
         */
        DirectedEdgeBuilder.prototype.addNextEdge = function () {
            var a = this.xs[this.current], b = this.ys[this.current];
            var oa = this.offsets[a] + this.bucketFill[a];
            this.a[oa] = a;
            this.b[oa] = b;
            this.bucketFill[a]++;
            this.current++;
            this.curA = oa;
        };
        /** Builds property-less graph */
        DirectedEdgeBuilder.prototype.addAllEdges = function () {
            for (var i = 0; i < this.edgeCount; i++) {
                this.addNextEdge();
            }
        };
        DirectedEdgeBuilder.prototype.assignProperty = function (prop, value) {
            prop[this.curA] = value;
        };
        return DirectedEdgeBuilder;
    }());
    IntAdjacencyGraph.DirectedEdgeBuilder = DirectedEdgeBuilder;
    var UniqueEdgeBuilder = /** @class */ (function () {
        function UniqueEdgeBuilder(vertexCount) {
            this.vertexCount = vertexCount;
            this.xs = [];
            this.ys = [];
            this.included = new Set();
        }
        UniqueEdgeBuilder.prototype.addEdge = function (i, j) {
            var u = i, v = j;
            if (i > j) {
                u = j;
                v = i;
            }
            var id = cantorPairing(u, v);
            if (this.included.has(id))
                return false;
            this.included.add(id);
            this.xs[this.xs.length] = u;
            this.ys[this.ys.length] = v;
            return true;
        };
        UniqueEdgeBuilder.prototype.getGraph = function () {
            return fromVertexPairs(this.vertexCount, this.xs, this.ys);
        };
        // if we cant to add custom props as well
        UniqueEdgeBuilder.prototype.getEdgeBuiler = function () {
            return new EdgeBuilder(this.vertexCount, this.xs, this.ys);
        };
        return UniqueEdgeBuilder;
    }());
    IntAdjacencyGraph.UniqueEdgeBuilder = UniqueEdgeBuilder;
    function fromVertexPairs(vertexCount, xs, ys) {
        var graphBuilder = new IntAdjacencyGraph.EdgeBuilder(vertexCount, xs, ys);
        graphBuilder.addAllEdges();
        return graphBuilder.createGraph({});
    }
    IntAdjacencyGraph.fromVertexPairs = fromVertexPairs;
    function induceByVertices(graph, vertexIndices, props) {
        var b = graph.b, offset = graph.offset, vertexCount = graph.vertexCount, edgeProps = graph.edgeProps;
        var vertexMap = new Int32Array(vertexCount);
        for (var i = 0, _i = vertexIndices.length; i < _i; i++)
            vertexMap[vertexIndices[i]] = i + 1;
        var newEdgeCount = 0;
        for (var i = 0; i < vertexCount; i++) {
            if (vertexMap[i] === 0)
                continue;
            for (var j = offset[i], _j = offset[i + 1]; j < _j; j++) {
                if (b[j] > i && vertexMap[b[j]] !== 0)
                    newEdgeCount++;
            }
        }
        var newOffsets = new Int32Array(vertexIndices.length + 1);
        var edgeIndices = new Int32Array(2 * newEdgeCount);
        var newA = new Int32Array(2 * newEdgeCount);
        var newB = new Int32Array(2 * newEdgeCount);
        var eo = 0, vo = 0;
        for (var i = 0; i < vertexCount; i++) {
            if (vertexMap[i] === 0)
                continue;
            var aa = vertexMap[i] - 1;
            for (var j = offset[i], _j = offset[i + 1]; j < _j; j++) {
                var bb = vertexMap[b[j]];
                if (bb === 0)
                    continue;
                newA[eo] = aa;
                newB[eo] = bb - 1;
                edgeIndices[eo] = j;
                eo++;
            }
            newOffsets[++vo] = eo;
        }
        var newEdgeProps = {};
        for (var _a = 0, _b = Object.keys(edgeProps); _a < _b.length; _a++) {
            var key = _b[_a];
            newEdgeProps[key] = arrayPickIndices(edgeProps[key], edgeIndices);
        }
        return create(newOffsets, newA, newB, newEdgeCount, newEdgeProps, props);
    }
    IntAdjacencyGraph.induceByVertices = induceByVertices;
    function connectedComponents(graph) {
        var vCount = graph.vertexCount;
        if (vCount === 0)
            return { componentCount: 0, componentIndex: new Int32Array(0) };
        if (graph.edgeCount === 0) {
            var componentIndex_1 = new Int32Array(vCount);
            for (var i = 0, _i = vCount; i < _i; i++) {
                componentIndex_1[i] = i;
            }
            return { componentCount: vCount, componentIndex: componentIndex_1 };
        }
        var componentIndex = new Int32Array(vCount);
        for (var i = 0, _i = vCount; i < _i; i++)
            componentIndex[i] = -1;
        var currentComponent = 0;
        componentIndex[0] = currentComponent;
        var offset = graph.offset, neighbor = graph.b;
        var stack = [0];
        var list = LinkedIndex(vCount);
        list.remove(0);
        while (stack.length > 0) {
            var v = stack.pop();
            var cIdx = componentIndex[v];
            for (var eI = offset[v], _eI = offset[v + 1]; eI < _eI; eI++) {
                var n = neighbor[eI];
                if (!list.has(n))
                    continue;
                list.remove(n);
                stack.push(n);
                componentIndex[n] = cIdx;
            }
            // check if we visited all vertices.
            // If not, create a new component and continue.
            if (stack.length === 0 && list.head >= 0) {
                stack.push(list.head);
                componentIndex[list.head] = ++currentComponent;
                list.remove(list.head);
            }
        }
        return { componentCount: vCount, componentIndex: componentIndex };
    }
    IntAdjacencyGraph.connectedComponents = connectedComponents;
    /**
     * Check if any vertex in `verticesA` is connected to any vertex in `verticesB`
     * via at most `maxDistance` edges.
     *
     * Returns true if verticesA and verticesB are intersecting.
     */
    function areVertexSetsConnected(graph, verticesA, verticesB, maxDistance) {
        // check if A and B are intersecting, this handles maxDistance = 0
        if (SortedArray.areIntersecting(verticesA, verticesB))
            return true;
        if (maxDistance < 1)
            return false;
        var visited = new Set();
        for (var i = 0, il = verticesA.length; i < il; ++i) {
            visited.add(verticesA[i]);
        }
        return areVertexSetsConnectedImpl(graph, verticesA, verticesB, maxDistance, visited);
    }
    IntAdjacencyGraph.areVertexSetsConnected = areVertexSetsConnected;
})(IntAdjacencyGraph || (IntAdjacencyGraph = {}));
function areVertexSetsConnectedImpl(graph, frontier, target, distance, visited) {
    var neighbor = graph.b, offset = graph.offset;
    var newFrontier = [];
    for (var i = 0, il = frontier.length; i < il; ++i) {
        var src = frontier[i];
        for (var j = offset[src], jl = offset[src + 1]; j < jl; ++j) {
            var other = neighbor[j];
            if (visited.has(other))
                continue;
            if (SortedArray.has(target, other))
                return true;
            visited.add(other);
            newFrontier[newFrontier.length] = other;
        }
    }
    return distance > 1 ? areVertexSetsConnectedImpl(graph, newFrontier, target, distance - 1, visited) : false;
}
