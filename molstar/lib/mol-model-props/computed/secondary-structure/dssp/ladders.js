/**
 * Copyright (c) 2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author Sebastian Bittrich <sebastian.bittrich@rcsb.org>
 */
function shouldExtendLadder(ladder, bridge) {
    // in order to extend ladders, same type must be present
    if (bridge.type !== ladder.type)
        return false;
    // only extend if residue 1 is sequence neighbor with regard to ladder
    if (bridge.partner1 !== ladder.firstEnd + 1)
        return false;
    if (bridge.type === 0 /* BridgeType.PARALLEL */) {
        if (bridge.partner2 === ladder.secondEnd + 1) {
            return true;
        }
    }
    else {
        if (bridge.partner2 === ladder.secondStart - 1) {
            return true;
        }
    }
    return false;
}
/**
 * For beta structures, we define: a bulge-linked ladder consists of two ladders or bridges of the same type
 * connected by at most one extra residue of one strand and at most four extra residues  on the other strand,
 * all residues in bulge-linked ladders are marked E, including any extra residues.
 */
function resemblesBulge(ladder1, ladder2) {
    if (!(ladder1.type === ladder2.type && ladder2.firstStart - ladder1.firstEnd < 6 &&
        ladder1.firstStart < ladder2.firstStart && ladder2.nextLadder === 0))
        return false;
    if (ladder1.type === 0 /* BridgeType.PARALLEL */) {
        return bulgeCriterion2(ladder1, ladder2);
    }
    else {
        return bulgeCriterion2(ladder2, ladder1);
    }
}
function bulgeCriterion2(ladder1, ladder2) {
    return ladder2.secondStart - ladder1.secondEnd > 0 && ((ladder2.secondStart - ladder1.secondEnd < 6 &&
        ladder2.firstStart - ladder1.firstEnd < 3) || ladder2.secondStart - ladder1.secondEnd < 3);
}
/**
 * ladder=: set of one or more consecutive bridges of identical type
 *
 * Type: E
 */
export function assignLadders(ctx) {
    var bridges = ctx.bridges, ladders = ctx.ladders;
    // create ladders
    for (var bridgeIndex = 0; bridgeIndex < bridges.length; bridgeIndex++) {
        var bridge = bridges[bridgeIndex];
        var found = false;
        for (var ladderIndex = 0; ladderIndex < ladders.length; ladderIndex++) {
            var ladder = ladders[ladderIndex];
            if (shouldExtendLadder(ladder, bridge)) {
                found = true;
                ladder.firstEnd++;
                if (bridge.type === 0 /* BridgeType.PARALLEL */) {
                    ladder.secondEnd++;
                }
                else {
                    ladder.secondStart--;
                }
            }
        }
        // no suitable assignment: create new ladder with single bridge as content
        if (!found) {
            ladders[ladders.length] = {
                previousLadder: 0,
                nextLadder: 0,
                firstStart: bridge.partner1,
                firstEnd: bridge.partner1,
                secondStart: bridge.partner2,
                secondEnd: bridge.partner2,
                type: bridge.type
            };
        }
    }
    // connect ladders
    for (var ladderIndex1 = 0; ladderIndex1 < ladders.length; ladderIndex1++) {
        var ladder1 = ladders[ladderIndex1];
        for (var ladderIndex2 = ladderIndex1; ladderIndex2 < ladders.length; ladderIndex2++) {
            var ladder2 = ladders[ladderIndex2];
            if (resemblesBulge(ladder1, ladder2)) {
                ladder1.nextLadder = ladderIndex2;
                ladder2.previousLadder = ladderIndex1;
            }
        }
    }
}
