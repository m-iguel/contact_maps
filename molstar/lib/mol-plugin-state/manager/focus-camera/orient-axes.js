/**
 * Copyright (c) 2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Adam Midlik <midlik@gmail.com>
 */
import { __assign } from "tslib";
import { Mat3, Vec3 } from '../../../mol-math/linear-algebra';
import { PrincipalAxes } from '../../../mol-math/linear-algebra/matrix/principal-axes';
import { StructureElement, StructureProperties } from '../../../mol-model/structure';
/** Minimum number of atoms necessary for running PCA.
 * If enough atoms cannot be selected, XYZ axes will be used instead of PCA axes. */
var MIN_ATOMS_FOR_PCA = 3;
/** Rotation matrices for the basic rotations by 90 degrees */
export var ROTATION_MATRICES = {
    // The order of elements in the matrices in column-wise (F-style)
    identity: Mat3.create(1, 0, 0, 0, 1, 0, 0, 0, 1),
    rotX90: Mat3.create(1, 0, 0, 0, 0, 1, 0, -1, 0),
    rotY90: Mat3.create(0, 0, -1, 0, 1, 0, 1, 0, 0),
    rotZ90: Mat3.create(0, 1, 0, -1, 0, 0, 0, 0, 1),
    rotX270: Mat3.create(1, 0, 0, 0, 0, -1, 0, 1, 0),
    rotY270: Mat3.create(0, 0, 1, 0, 1, 0, -1, 0, 0),
    rotZ270: Mat3.create(0, -1, 0, 1, 0, 0, 0, 0, 1),
    rotX180: Mat3.create(1, 0, 0, 0, -1, 0, 0, 0, -1),
    rotY180: Mat3.create(-1, 0, 0, 0, 1, 0, 0, 0, -1),
    rotZ180: Mat3.create(-1, 0, 0, 0, -1, 0, 0, 0, 1),
};
/** Return transformation which will align the PCA axes of an atomic structure
 * (or multiple structures) to the Cartesian axes x, y, z
 * (transformed = rotation * (coords - origin)).
 *
 * There are always 4 equally good rotations to do this (4 flips).
 * If `referenceRotation` is provided, select the one nearest to `referenceRotation`.
 * Otherwise use arbitrary rules to ensure the orientation after transform does not depend on the original orientation.
 */
export function structureLayingTransform(structures, referenceRotation) {
    var coords = smartSelectCoords(structures, MIN_ATOMS_FOR_PCA);
    return layingTransform(coords, referenceRotation);
}
/** Return transformation which will align the PCA axes of a sequence
 * of points to the Cartesian axes x, y, z
 * (transformed = rotation * (coords - origin)).
 *
 * `coords` is a flattened array of 3D coordinates (i.e. the first 3 values are x, y, and z of the first point etc.).
 *
 * There are always 4 equally good rotations to do this (4 flips).
 * If `referenceRotation` is provided, select the one nearest to `referenceRotation`.
 * Otherwise use arbitrary rules to ensure the orientation after transform does not depend on the original orientation.
 */
export function layingTransform(coords, referenceRotation) {
    if (coords.length === 0) {
        console.warn('Skipping PCA, no atoms');
        return { rotation: ROTATION_MATRICES.identity, origin: Vec3.zero() };
    }
    var axes = PrincipalAxes.calculateMomentsAxes(coords);
    var normAxes = PrincipalAxes.calculateNormalizedAxes(axes);
    var R = mat3FromRows(normAxes.dirA, normAxes.dirB, normAxes.dirC);
    avoidMirrorRotation(R); // The SVD implementation seems to always provide proper rotation, but just to be sure
    var flip = referenceRotation ? minimalFlip(R, referenceRotation) : canonicalFlip(coords, R, axes.origin);
    Mat3.mul(R, flip, R);
    return { rotation: R, origin: normAxes.origin };
}
/** Try these selection strategies until having at least `minAtoms` atoms:
 * 1. only trace atoms (e.g. C-alpha and O3')
 * 2. all non-hydrogen atoms with exception of water (HOH)
 * 3. all atoms
 * Return the coordinates in a flattened array (in triples).
 * If the total number of atoms is less than `minAtoms`, return only those. */
function smartSelectCoords(structures, minAtoms) {
    var coords;
    coords = selectCoords(structures, { onlyTrace: true });
    if (coords.length >= 3 * minAtoms)
        return coords;
    coords = selectCoords(structures, { skipHydrogens: true, skipWater: true });
    if (coords.length >= 3 * minAtoms)
        return coords;
    coords = selectCoords(structures, {});
    return coords;
}
/** Select coordinates of atoms in `structures` as a flattened array (in triples).
 * If `onlyTrace`, include only trace atoms (CA, O3');
 * if `skipHydrogens`, skip all hydrogen atoms;
 * if `skipWater`, skip all water residues. */
function selectCoords(structures, options) {
    var onlyTrace = options.onlyTrace, skipHydrogens = options.skipHydrogens, skipWater = options.skipWater;
    var _a = StructureProperties.atom, x = _a.x, y = _a.y, z = _a.z, type_symbol = _a.type_symbol, label_comp_id = _a.label_comp_id;
    var coords = [];
    for (var _i = 0, structures_1 = structures; _i < structures_1.length; _i++) {
        var struct = structures_1[_i];
        var loc = StructureElement.Location.create(struct);
        for (var _b = 0, _c = struct.units; _b < _c.length; _b++) {
            var unit = _c[_b];
            loc.unit = unit;
            var elements = onlyTrace ? unit.polymerElements : unit.elements;
            for (var i = 0; i < elements.length; i++) {
                loc.element = elements[i];
                if (skipHydrogens && type_symbol(loc) === 'H')
                    continue;
                if (skipWater && label_comp_id(loc) === 'HOH')
                    continue;
                coords.push(x(loc), y(loc), z(loc));
            }
        }
    }
    return coords;
}
/** Return a flip around XYZ axes which minimizes the difference between flip*rotation and referenceRotation. */
function minimalFlip(rotation, referenceRotation) {
    var bestFlip = ROTATION_MATRICES.identity;
    var bestScore = 0; // there will always be at least one positive score
    var aux = Mat3();
    for (var _i = 0, _a = [ROTATION_MATRICES.identity, ROTATION_MATRICES.rotX180, ROTATION_MATRICES.rotY180, ROTATION_MATRICES.rotZ180]; _i < _a.length; _i++) {
        var flip = _a[_i];
        var score = Mat3.innerProduct(Mat3.mul(aux, flip, rotation), referenceRotation);
        if (score > bestScore) {
            bestFlip = flip;
            bestScore = score;
        }
    }
    return bestFlip;
}
/** Return a rotation matrix (flip) that should be applied to `coords` (after being rotated by `rotation`)
 * to ensure a deterministic "canonical" rotation.
 * There are 4 flips to choose from (one identity and three 180-degree rotations around the X, Y, and Z axes).
 * One of these 4 possible results is selected so that:
 *   1) starting and ending coordinates tend to be more in front (z > 0), middle more behind (z < 0).
 *   2) starting coordinates tend to be more left-top (x < y), ending more right-bottom (x > y).
 * These rules are arbitrary, but try to avoid ties for at least some basic symmetries.
 * Provided `origin` parameter MUST be the mean of the coordinates, otherwise it will not work!
 */
function canonicalFlip(coords, rotation, origin) {
    var pcaX = Vec3.create(Mat3.getValue(rotation, 0, 0), Mat3.getValue(rotation, 0, 1), Mat3.getValue(rotation, 0, 2));
    var pcaY = Vec3.create(Mat3.getValue(rotation, 1, 0), Mat3.getValue(rotation, 1, 1), Mat3.getValue(rotation, 1, 2));
    var pcaZ = Vec3.create(Mat3.getValue(rotation, 2, 0), Mat3.getValue(rotation, 2, 1), Mat3.getValue(rotation, 2, 2));
    var n = Math.floor(coords.length / 3);
    var v = Vec3();
    var xCum = 0;
    var yCum = 0;
    var zCum = 0;
    for (var i = 0; i < n; i++) {
        Vec3.fromArray(v, coords, 3 * i);
        Vec3.sub(v, v, origin);
        xCum += i * Vec3.dot(v, pcaX);
        yCum += i * Vec3.dot(v, pcaY);
        zCum += veeSlope(i, n) * Vec3.dot(v, pcaZ);
        // Thanks to subtracting `origin` from `coords` the slope functions `i` and `veeSlope(i, n)`
        // don't have to have zero sum (can be shifted up or down):
        //     sum{(slope[i]+shift)*(coords[i]-origin).PCA} =
        //     = sum{slope[i]*coords[i].PCA - slope[i]*origin.PCA + shift*coords[i].PCA - shift*origin.PCA} =
        //     = sum{slope[i]*(coords[i]-origin).PCA} + shift*sum{coords[i]-origin}.PCA =
        //     = sum{slope[i]*(coords[i]-origin).PCA}
    }
    var wrongFrontBack = zCum < 0;
    var wrongLeftTopRightBottom = wrongFrontBack ? xCum + yCum < 0 : xCum - yCum < 0;
    if (wrongLeftTopRightBottom && wrongFrontBack) {
        return ROTATION_MATRICES.rotY180; // flip around Y = around X then Z
    }
    else if (wrongFrontBack) {
        return ROTATION_MATRICES.rotX180; // flip around X
    }
    else if (wrongLeftTopRightBottom) {
        return ROTATION_MATRICES.rotZ180; // flip around Z
    }
    else {
        return ROTATION_MATRICES.identity; // do not flip
    }
}
/** Auxiliary function defined for i in [0, n), linearly decreasing from 0 to n/2
 * and then increasing back from n/2 to n, resembling letter V. */
function veeSlope(i, n) {
    var mid = Math.floor(n / 2);
    if (i < mid) {
        if (n % 2)
            return mid - i;
        else
            return mid - i - 1;
    }
    else {
        return i - mid;
    }
}
function mat3FromRows(row0, row1, row2) {
    var m = Mat3();
    Mat3.setValue(m, 0, 0, row0[0]);
    Mat3.setValue(m, 0, 1, row0[1]);
    Mat3.setValue(m, 0, 2, row0[2]);
    Mat3.setValue(m, 1, 0, row1[0]);
    Mat3.setValue(m, 1, 1, row1[1]);
    Mat3.setValue(m, 1, 2, row1[2]);
    Mat3.setValue(m, 2, 0, row2[0]);
    Mat3.setValue(m, 2, 1, row2[1]);
    Mat3.setValue(m, 2, 2, row2[2]);
    return m;
}
/** Check if a rotation matrix includes mirroring and invert Z axis in such case, to ensure a proper rotation (in-place). */
function avoidMirrorRotation(rot) {
    if (Mat3.determinant(rot) < 0) {
        Mat3.setValue(rot, 2, 0, -Mat3.getValue(rot, 2, 0));
        Mat3.setValue(rot, 2, 1, -Mat3.getValue(rot, 2, 1));
        Mat3.setValue(rot, 2, 2, -Mat3.getValue(rot, 2, 2));
    }
}
/** Return a new camera snapshot with the same target and camera distance from the target as `old`
 * but with diferent orientation.
 * The actual rotation applied to the camera is the inverse of `rotation`,
 * which creates the same effect as if `rotation` were applied to the whole scene without moving the camera.
 * The rotation is relative to the default camera orientation (not to the current orientation). */
export function changeCameraRotation(old, rotation) {
    var cameraRotation = Mat3.invert(Mat3(), rotation);
    var dist = Vec3.distance(old.position, old.target);
    var relPosition = Vec3.transformMat3(Vec3(), Vec3.create(0, 0, dist), cameraRotation);
    var newUp = Vec3.transformMat3(Vec3(), Vec3.create(0, 1, 0), cameraRotation);
    var newPosition = Vec3.add(Vec3(), old.target, relPosition);
    return __assign(__assign({}, old), { position: newPosition, up: newUp });
}
