/**
 * Copyright (c) 2019-2023 Mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { __assign } from "tslib";
import { IntAdjacencyGraph } from '../../../../mol-math/graph';
import { FormatPropertyProvider } from '../../common/property';
function getGraph(indexA, indexB, props, count) {
    var builder = new IntAdjacencyGraph.EdgeBuilder(count, indexA, indexB);
    var key = new Int32Array(builder.slotCount);
    var operatorA = new Array(builder.slotCount);
    var operatorB = new Array(builder.slotCount);
    var order = new Int8Array(builder.slotCount);
    var distance = new Array(builder.slotCount);
    var flag = new Array(builder.slotCount);
    for (var i = 0, _i = builder.edgeCount; i < _i; i++) {
        builder.addNextEdge();
        builder.assignProperty(key, props.key ? props.key[i] : -1);
        builder.assignDirectedProperty(operatorA, props.operatorA ? props.operatorA[i] : -1, operatorB, props.operatorB ? props.operatorB[i] : -1);
        builder.assignProperty(order, props.order ? props.order[i] : 1);
        builder.assignProperty(distance, props.distance ? props.distance[i] : -1);
        builder.assignProperty(flag, props.flag ? props.flag[i] : 1 /* BondType.Flag.Covalent */);
    }
    return builder.createGraph({ key: key, operatorA: operatorA, operatorB: operatorB, order: order, distance: distance, flag: flag });
}
export var IndexPairBonds;
(function (IndexPairBonds) {
    IndexPairBonds.Descriptor = {
        name: 'index_pair_bonds',
    };
    IndexPairBonds.Provider = FormatPropertyProvider.create(IndexPairBonds.Descriptor, { asDynamic: true });
    IndexPairBonds.DefaultProps = {
        /**
         * If negative, test using element-based threshold, otherwise distance in Angstrom.
         *
         * This option exists to handle bonds in periodic cells. For systems that are
         * made from beads (as opposed to atomic elements), set to a specific distance.
         *
         * Note that `Data` has a `distance` field which allows specifying a distance
         * for each bond individually which takes precedence over this option.
         */
        maxDistance: -1
    };
    function fromData(data, props) {
        if (props === void 0) { props = {}; }
        var p = __assign(__assign({}, IndexPairBonds.DefaultProps), props);
        var pairs = data.pairs, count = data.count;
        var indexA = pairs.indexA.toArray();
        var indexB = pairs.indexB.toArray();
        var key = pairs.key && pairs.key.toArray();
        var operatorA = pairs.operatorA && pairs.operatorA.toArray();
        var operatorB = pairs.operatorB && pairs.operatorB.toArray();
        var order = pairs.order && pairs.order.toArray();
        var distance = pairs.distance && pairs.distance.toArray();
        var flag = pairs.flag && pairs.flag.toArray();
        return {
            bonds: getGraph(indexA, indexB, { key: key, operatorA: operatorA, operatorB: operatorB, order: order, distance: distance, flag: flag }, count),
            maxDistance: p.maxDistance
        };
    }
    IndexPairBonds.fromData = fromData;
    /** Like `getEdgeIndex` but taking `edgeProps.operatorA` and `edgeProps.operatorB` into account */
    function getEdgeIndexForOperators(bonds, i, j, opI, opJ) {
        var a, b, opA, opB;
        if (i < j) {
            a = i;
            b = j;
            opA = opI;
            opB = opJ;
        }
        else {
            a = j;
            b = i;
            opA = opJ;
            opB = opI;
        }
        for (var t = bonds.offset[a], _t = bonds.offset[a + 1]; t < _t; t++) {
            if (bonds.b[t] === b && bonds.edgeProps.operatorA[t] === opA && bonds.edgeProps.operatorB[t] === opB)
                return t;
        }
        return -1;
    }
    IndexPairBonds.getEdgeIndexForOperators = getEdgeIndexForOperators;
})(IndexPairBonds || (IndexPairBonds = {}));
