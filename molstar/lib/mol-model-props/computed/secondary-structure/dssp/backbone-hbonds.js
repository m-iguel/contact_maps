/**
 * Copyright (c) 2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author Sebastian Bittrich <sebastian.bittrich@rcsb.org>
 */
import { IntAdjacencyGraph } from '../../../../mol-math/graph';
import { Vec3 } from '../../../../mol-math/linear-algebra';
/** max distance between two C-alpha atoms to check for hbond */
var caMaxDist = 9.0;
/**
 * Constant for electrostatic energy in kcal/mol
 *      f  *  q1 *   q2
 * Q = -332 * 0.42 * 0.20
 *
 * f is the dimensional factor
 *
 * q1 and q2 are partial charges which are placed on the C,O
 * (+q1,-q1) and N,H (-q2,+q2)
 */
var Q = -27.888;
/** cutoff for hbonds in kcal/mol, must be lower to be consider as an hbond */
var hbondEnergyCutoff = -0.5;
/** prevent extremely low hbond energies */
var hbondEnergyMinimal = -9.9;
/**
 * E = Q * (1/r(ON) + l/r(CH) - l/r(OH) - l/r(CN))
 */
function calcHbondEnergy(oPos, cPos, nPos, hPos) {
    var distOH = Vec3.distance(oPos, hPos);
    var distCH = Vec3.distance(cPos, hPos);
    var distCN = Vec3.distance(cPos, nPos);
    var distON = Vec3.distance(oPos, nPos);
    var e1 = Q / distOH - Q / distCH;
    var e2 = Q / distCN - Q / distON;
    var e = e1 + e2;
    // cap lowest possible energy
    if (e < hbondEnergyMinimal)
        return hbondEnergyMinimal;
    return e;
}
export function calcUnitBackboneHbonds(unit, proteinInfo, lookup3d) {
    var residueIndices = proteinInfo.residueIndices, cIndices = proteinInfo.cIndices, hIndices = proteinInfo.hIndices, nIndices = proteinInfo.nIndices, oIndices = proteinInfo.oIndices;
    var index = unit.model.atomicHierarchy.index;
    var invariantPosition = unit.conformation.invariantPosition;
    var traceElementIndex = unit.model.atomicHierarchy.derived.residue.traceElementIndex;
    var residueCount = residueIndices.length;
    var oAtomResidues = [];
    var nAtomResidues = [];
    var energies = [];
    var oPos = Vec3();
    var cPos = Vec3();
    var caPos = Vec3();
    var nPos = Vec3();
    var hPos = Vec3();
    var cPosPrev = Vec3();
    var oPosPrev = Vec3();
    for (var i = 0, il = residueIndices.length; i < il; ++i) {
        var oPI = i;
        var oRI = residueIndices[i];
        var oAtom = oIndices[oPI];
        var cAtom = cIndices[oPI];
        var caAtom = traceElementIndex[oRI];
        // continue if residue is missing O or C atom
        if (oAtom === -1 || cAtom === -1)
            continue;
        // ignore C-terminal residue as acceptor
        if (index.findAtomOnResidue(oRI, 'OXT') !== -1)
            continue;
        invariantPosition(oAtom, oPos);
        invariantPosition(cAtom, cPos);
        invariantPosition(caAtom, caPos);
        var _a = lookup3d.find(caPos[0], caPos[1], caPos[2], caMaxDist), indices = _a.indices, count = _a.count;
        for (var j = 0; j < count; ++j) {
            var nPI = indices[j];
            // ignore bonds within a residue or to prev or next residue
            if (nPI === oPI || nPI - 1 === oPI || nPI + 1 === oPI)
                continue;
            var nAtom = nIndices[nPI];
            if (nAtom === -1)
                continue;
            invariantPosition(nAtom, nPos);
            var hAtom = hIndices[nPI];
            if (hAtom === -1) {
                // approximate calculation of H position, TODO factor out
                if (nPI === 0)
                    continue;
                var nPIprev = nPI - 1;
                var oAtomPrev = oIndices[nPIprev];
                var cAtomPrev = cIndices[nPIprev];
                if (oAtomPrev === -1 || cAtomPrev === -1)
                    continue;
                invariantPosition(oAtomPrev, oPosPrev);
                invariantPosition(cAtomPrev, cPosPrev);
                Vec3.sub(hPos, cPosPrev, oPosPrev);
                var dist = Vec3.distance(oPosPrev, cPosPrev);
                Vec3.scaleAndAdd(hPos, nPos, hPos, 1 / dist);
            }
            else {
                invariantPosition(hAtom, hPos);
            }
            var e = calcHbondEnergy(oPos, cPos, nPos, hPos);
            if (e > hbondEnergyCutoff)
                continue;
            oAtomResidues[oAtomResidues.length] = oPI;
            nAtomResidues[nAtomResidues.length] = nPI;
            energies[energies.length] = e;
        }
    }
    return buildHbondGraph(residueCount, oAtomResidues, nAtomResidues, energies);
}
function buildHbondGraph(residueCount, oAtomResidues, nAtomResidues, energies) {
    var builder = new IntAdjacencyGraph.DirectedEdgeBuilder(residueCount, oAtomResidues, nAtomResidues);
    var _energies = new Float32Array(builder.slotCount);
    for (var i = 0, _i = builder.edgeCount; i < _i; i++) {
        builder.addNextEdge();
        builder.assignProperty(_energies, energies[i]);
    }
    return builder.createGraph({ energies: energies });
}
