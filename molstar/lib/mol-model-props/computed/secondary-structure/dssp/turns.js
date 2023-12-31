/**
 * Copyright (c) 2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author Sebastian Bittrich <sebastian.bittrich@rcsb.org>
 */
/**
 * The basic turn pattern is a single H bond of type (i, i + n).
 * We assign an n-turn at residue i if there is an H bond from CO(i) to NH(i + n),
 * i.e., “n-turn(i)=: Hbond(i, i + n), n = 3, 4, 5.”
 *
 * Type: T
 */
export function assignTurns(ctx) {
    var proteinInfo = ctx.proteinInfo, hbonds = ctx.hbonds, flags = ctx.flags;
    var turnFlag = [1024 /* DSSPType.Flag.T3S */, 2048 /* DSSPType.Flag.T4S */, 4096 /* DSSPType.Flag.T5S */, 128 /* DSSPType.Flag.T3 */, 256 /* DSSPType.Flag.T4 */, 512 /* DSSPType.Flag.T5 */];
    for (var idx = 0; idx < 3; idx++) {
        for (var i = 0, il = proteinInfo.residueIndices.length - 1; i < il; ++i) {
            // check if hbond exists
            if (hbonds.getDirectedEdgeIndex(i, i + idx + 3) !== -1) {
                flags[i] |= turnFlag[idx + 3] | turnFlag[idx];
                if (ctx.params.oldDefinition) {
                    for (var k = 1; k < idx + 3; ++k) {
                        flags[i + k] |= turnFlag[idx + 3] | 64 /* DSSPType.Flag.T */;
                    }
                }
                else {
                    for (var k = 0; k <= idx + 3; ++k) {
                        flags[i + k] |= turnFlag[idx + 3] | 64 /* DSSPType.Flag.T */;
                    }
                }
            }
        }
    }
}
