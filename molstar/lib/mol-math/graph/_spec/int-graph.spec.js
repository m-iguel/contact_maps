/**
 * Copyright (c) 2017-2018 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { IntAdjacencyGraph } from '../int-adjacency-graph';
describe('IntGraph', function () {
    var vc = 3;
    var xs = [0, 1, 2];
    var ys = [1, 2, 0];
    var _prop = [10, 11, 12];
    var builder = new IntAdjacencyGraph.EdgeBuilder(vc, xs, ys);
    var prop = new Array(builder.slotCount);
    for (var i = 0; i < builder.edgeCount; i++) {
        builder.addNextEdge();
        builder.assignProperty(prop, _prop[i]);
    }
    var graph = builder.createGraph({ prop: prop });
    it('triangle-edgeCount', function () { return expect(graph.edgeCount).toBe(3); });
    it('triangle-vertexEdgeCounts', function () {
        expect(graph.getVertexEdgeCount(0)).toBe(2);
        expect(graph.getVertexEdgeCount(1)).toBe(2);
        expect(graph.getVertexEdgeCount(2)).toBe(2);
    });
    it('triangle-propAndEdgeIndex', function () {
        var prop = graph.edgeProps.prop;
        expect(prop[graph.getEdgeIndex(0, 1)]).toBe(10);
        expect(prop[graph.getEdgeIndex(1, 2)]).toBe(11);
        expect(prop[graph.getEdgeIndex(2, 0)]).toBe(12);
    });
    it('induce', function () {
        var induced = IntAdjacencyGraph.induceByVertices(graph, [1, 2]);
        expect(induced.vertexCount).toBe(2);
        expect(induced.edgeCount).toBe(1);
        expect(induced.edgeProps.prop[induced.getEdgeIndex(0, 1)]).toBe(11);
    });
});
