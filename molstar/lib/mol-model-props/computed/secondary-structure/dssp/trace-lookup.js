/**
 * Copyright (c) 2019-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { GridLookup3D } from '../../../../mol-math/geometry';
import { SortedArray } from '../../../../mol-data/int';
import { getBoundary } from '../../../../mol-math/geometry/boundary';
export function calcUnitProteinTraceLookup3D(unit, unitProteinResidues) {
    var _a = unit.model.atomicConformation, x = _a.x, y = _a.y, z = _a.z;
    var traceElementIndex = unit.model.atomicHierarchy.derived.residue.traceElementIndex;
    var indices = new Uint32Array(unitProteinResidues.length);
    for (var i = 0, il = unitProteinResidues.length; i < il; ++i) {
        indices[i] = traceElementIndex[unitProteinResidues[i]];
    }
    var position = { x: x, y: y, z: z, indices: SortedArray.ofSortedArray(indices) };
    return GridLookup3D(position, getBoundary(position));
}
