/**
 * Copyright (c) 2019-2021 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Ludovic Autin <ludovic.autin@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { Vec3, Quat, Mat4 } from '../../mol-math/linear-algebra';
var a0Tmp = Vec3();
var a1Tmp = Vec3();
var a2Tmp = Vec3();
var a3Tmp = Vec3();
function CubicInterpolate(out, y0, y1, y2, y3, mu) {
    var mu2 = mu * mu;
    Vec3.sub(a0Tmp, y3, y2);
    Vec3.sub(a0Tmp, a0Tmp, y0);
    Vec3.add(a0Tmp, a0Tmp, y1);
    Vec3.sub(a1Tmp, y0, y1);
    Vec3.sub(a1Tmp, a1Tmp, a0Tmp);
    Vec3.sub(a2Tmp, y2, y0);
    Vec3.copy(a3Tmp, y1);
    out[0] = a0Tmp[0] * mu * mu2 + a1Tmp[0] * mu2 + a2Tmp[0] * mu + a3Tmp[0];
    out[1] = a0Tmp[1] * mu * mu2 + a1Tmp[1] * mu2 + a2Tmp[1] * mu + a3Tmp[1];
    out[2] = a0Tmp[2] * mu * mu2 + a1Tmp[2] * mu2 + a2Tmp[2] * mu + a3Tmp[2];
    return out;
}
var cp0 = Vec3();
var cp1 = Vec3();
var cp2 = Vec3();
var cp3 = Vec3();
var currentPosition = Vec3();
function ResampleControlPoints(points, segmentLength) {
    var nP = points.length / 3;
    // insert a point at the end and at the begining
    // controlPoints.Insert(0, controlPoints[0] + (controlPoints[0] - controlPoints[1]) / 2.0f);
    // controlPoints.Add(controlPoints[nP - 1] + (controlPoints[nP - 1] - controlPoints[nP - 2]) / 2.0f);
    var resampledControlPoints = [];
    // resampledControlPoints.Add(controlPoints[0]);
    // resampledControlPoints.Add(controlPoints[1]);
    var idx = 1;
    // const currentPosition = Vec3.create(points[idx * 3], points[idx * 3 + 1], points[idx * 3 + 2])
    Vec3.fromArray(currentPosition, points, idx * 3);
    var lerpValue = 0.0;
    // Normalize the distance between control points
    while (true) {
        if (idx + 2 >= nP)
            break;
        Vec3.fromArray(cp0, points, (idx - 1) * 3);
        Vec3.fromArray(cp1, points, idx * 3);
        Vec3.fromArray(cp2, points, (idx + 1) * 3);
        Vec3.fromArray(cp3, points, (idx + 2) * 3);
        // const cp0 = Vec3.create(points[(idx-1)*3], points[(idx-1)*3+1], points[(idx-1)*3+2]) // controlPoints[currentPointId - 1];
        // const cp1 = Vec3.create(points[idx*3], points[idx*3+1], points[idx*3+2]) // controlPoints[currentPointId];
        // const cp2 = Vec3.create(points[(idx+1)*3], points[(idx+1)*3+1], points[(idx+1)*3+2]) // controlPoints[currentPointId + 1];
        // const cp3 = Vec3.create(points[(idx+2)*3], points[(idx+2)*3+1], points[(idx+2)*3+2]); // controlPoints[currentPointId + 2];
        var found = false;
        for (; lerpValue <= 1; lerpValue += 0.01) {
            // lerp?slerp
            // let candidate:Vec3 = Vec3.lerp(Vec3.zero(), cp0, cp1, lerpValue);
            // const candidate:Vec3 = Vec3.bezier(Vec3.zero(), cp0, cp1, cp2, cp3, lerpValue);
            var candidate = CubicInterpolate(Vec3(), cp0, cp1, cp2, cp3, lerpValue);
            var d = Vec3.distance(currentPosition, candidate);
            if (d > segmentLength) {
                resampledControlPoints.push(candidate);
                Vec3.copy(currentPosition, candidate);
                found = true;
                break;
            }
        }
        if (!found) {
            lerpValue = 0;
            idx += 1;
        }
    }
    return resampledControlPoints;
}
var prevV = Vec3();
var tmpV1 = Vec3();
var tmpV2 = Vec3();
var tmpV3 = Vec3();
// easier to align to theses normals
function GetSmoothNormals(points) {
    var nP = points.length;
    var smoothNormals = [];
    if (points.length < 3) {
        for (var i = 0; i < points.length; ++i)
            smoothNormals.push(Vec3.normalize(Vec3(), points[i]));
        return smoothNormals;
    }
    var p0 = points[0];
    var p1 = points[1];
    var p2 = points[2];
    var p21 = Vec3.sub(tmpV1, p2, p1);
    var p01 = Vec3.sub(tmpV2, p0, p1);
    var p0121 = Vec3.cross(tmpV3, p01, p21);
    Vec3.normalize(prevV, p0121);
    smoothNormals.push(Vec3.clone(prevV));
    for (var i = 1; i < points.length - 1; ++i) {
        p0 = points[i - 1];
        p1 = points[i];
        p2 = points[i + 1];
        var t = Vec3.normalize(tmpV1, Vec3.sub(tmpV1, p2, p0));
        var b = Vec3.normalize(tmpV2, Vec3.cross(tmpV2, t, prevV));
        var n = Vec3.normalize(Vec3(), Vec3.cross(tmpV3, t, b));
        Vec3.negate(n, n);
        Vec3.copy(prevV, n);
        smoothNormals.push(n);
    }
    var last = Vec3();
    Vec3.normalize(last, Vec3.cross(last, Vec3.sub(tmpV1, points[nP - 3], points[nP - 2]), Vec3.sub(tmpV2, points[nP - 2], points[nP - 1])));
    smoothNormals.push(last);
    return smoothNormals;
}
var frameTmpV1 = Vec3();
var frameTmpV2 = Vec3();
var frameTmpV3 = Vec3();
function getFrame(reference, tangent) {
    var t = Vec3.normalize(Vec3(), tangent);
    // make reference vector orthogonal to tangent
    var proj_r_to_t = Vec3.scale(frameTmpV1, tangent, Vec3.dot(reference, tangent) / Vec3.dot(tangent, tangent));
    var r = Vec3.normalize(Vec3(), Vec3.sub(frameTmpV2, reference, proj_r_to_t));
    // make bitangent vector orthogonal to the others
    var s = Vec3.normalize(Vec3(), Vec3.cross(frameTmpV3, t, r));
    return { t: t, r: r, s: s };
}
var mfTmpV1 = Vec3();
var mfTmpV2 = Vec3();
var mfTmpV3 = Vec3();
var mfTmpV4 = Vec3();
var mfTmpV5 = Vec3();
var mfTmpV6 = Vec3();
var mfTmpV7 = Vec3();
var mfTmpV8 = Vec3();
var mfTmpV9 = Vec3();
// easier to align to theses normals
// https://github.com/bzamecnik/gpg/blob/master/rotation-minimizing-frame/rmf.py
function GetMiniFrame(points, normals) {
    var frames = [];
    var t0 = Vec3.normalize(mfTmpV1, Vec3.sub(mfTmpV1, points[1], points[0]));
    frames.push(getFrame(normals[0], t0));
    for (var i = 0; i < points.length - 2; ++i) {
        var t2 = Vec3.normalize(mfTmpV1, Vec3.sub(mfTmpV1, points[i + 2], points[i + 1]));
        var v1 = Vec3.sub(mfTmpV2, points[i + 1], points[i]); // this is tangeant
        var c1 = Vec3.dot(v1, v1);
        // compute r_i^L = R_1 * r_i
        var v1r = Vec3.scale(mfTmpV3, v1, (2.0 / c1) * Vec3.dot(v1, frames[i].r));
        var ref_L_i = Vec3.sub(mfTmpV4, frames[i].r, v1r);
        // compute t_i^L = R_1 * t_i
        var v1t = Vec3.scale(mfTmpV5, v1, (2.0 / c1) * Vec3.dot(v1, frames[i].t));
        var tan_L_i = Vec3.sub(mfTmpV6, frames[i].t, v1t);
        // # compute reflection vector of R_2
        var v2 = Vec3.sub(mfTmpV7, t2, tan_L_i);
        var c2 = Vec3.dot(v2, v2);
        // compute r_(i+1) = R_2 * r_i^L
        var v2l = Vec3.scale(mfTmpV8, v1, (2.0 / c2) * Vec3.dot(v2, ref_L_i));
        var ref_next = Vec3.sub(mfTmpV9, ref_L_i, v2l); // ref_L_i - (2 / c2) * v2.dot(ref_L_i) * v2
        frames.push(getFrame(ref_next, t2)); // frames.append(Frame(ref_next, tangents[i+1]))
    }
    return frames;
}
var rpTmpVec1 = Vec3();
export function getMatFromResamplePoints(points, segmentLength, resample) {
    var new_points = [];
    if (resample)
        new_points = ResampleControlPoints(points, segmentLength);
    else {
        for (var idx = 0; idx < points.length / 3; ++idx) {
            new_points.push(Vec3.fromArray(Vec3.zero(), points, idx * 3));
        }
    }
    var npoints = new_points.length;
    var new_normal = GetSmoothNormals(new_points);
    var frames = GetMiniFrame(new_points, new_normal);
    var limit = npoints;
    var transforms = [];
    var pti = Vec3.copy(rpTmpVec1, new_points[0]);
    for (var i = 0; i < npoints - 2; ++i) {
        var pti1 = new_points[i + 1]; // Vec3.create(points[(i+1)*3],points[(i+1)*3+1],points[(i+1)*3+2]);
        var d = Vec3.distance(pti, pti1);
        if (d >= segmentLength) {
            // use twist or random?
            var quat = Quat.rotationTo(Quat.zero(), Vec3.create(0, 0, 1), frames[i].t); // Quat.rotationTo(Quat.zero(), Vec3.create(0,0,1),new_normal[i]);//Quat.rotationTo(Quat.zero(), Vec3.create(0,0,1),direction);new_normal
            var rq = Quat.setAxisAngle(Quat.zero(), frames[i].t, Math.random() * 3.60); // Quat.setAxisAngle(Quat.zero(),direction, Math.random()*3.60 );//Quat.identity();//
            var m = Mat4.fromQuat(Mat4.zero(), Quat.multiply(Quat.zero(), rq, quat)); // Mat4.fromQuat(Mat4.zero(),Quat.multiply(Quat.zero(),quat1,quat2));//Mat4.fromQuat(Mat4.zero(),quat);//Mat4.identity();//Mat4.fromQuat(Mat4.zero(),Quat.multiply(Quat.zero(),rq,quat));
            // let pos:Vec3 = Vec3.add(Vec3.zero(),pti1,pti)
            // pos = Vec3.scale(pos,pos,1.0/2.0);
            // Vec3.makeRotation(Mat4.zero(),Vec3.create(0,0,1),frames[i].t);//
            Mat4.setTranslation(m, pti1);
            // let m2:Mat4 = GetTubePropertiesMatrix(pti,pti1);
            // let q:Quat = Quat.rotationTo(Quat.zero(), Vec3.create(0,1,0),Vec3.create(0,0,1))
            // m2=Mat4.mul(Mat4.identity(),Mat4.fromQuat(Mat4.zero(),q),m2);
            transforms.push(m);
            Vec3.copy(pti, pti1);
        }
        if (transforms.length >= limit)
            break;
    }
    return transforms;
}
