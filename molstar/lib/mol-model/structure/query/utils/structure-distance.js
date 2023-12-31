/**
 * Copyright (c) 2017 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { Vec3 } from '../../../../mol-math/linear-algebra';
export function checkStructureMinMaxDistance(ctx, a, b, minDist, maxDist, elementRadius) {
    if (a.elementCount === 0 || b.elementCount === 0)
        return true;
    if (a.elementCount <= b.elementCount)
        return MinMaxDist.check(ctx, a, b, minDist, maxDist, elementRadius);
    return MinMaxDist.check(ctx, b, a, minDist, maxDist, elementRadius);
}
export function checkStructureMaxRadiusDistance(ctx, a, b, maxDist, elementRadius) {
    if (a.elementCount === 0 || b.elementCount === 0)
        return true;
    if (a.elementCount <= b.elementCount)
        return MaxRadiusDist.check(ctx, a, b, maxDist, elementRadius);
    return MaxRadiusDist.check(ctx, b, a, maxDist, elementRadius);
}
var MinMaxDist;
(function (MinMaxDist) {
    var distVec = Vec3.zero();
    function inUnit(ctx, unit, p, eRadius, minDist, maxDist, elementRadius) {
        var elements = unit.elements, position = unit.conformation.position, dV = distVec;
        ctx.element.unit = unit;
        var withinRange = false;
        for (var i = 0, _i = elements.length; i < _i; i++) {
            var e = elements[i];
            ctx.element.element = e;
            var d = Math.max(0, Vec3.distance(p, position(e, dV)) - eRadius - elementRadius(ctx));
            if (d < minDist)
                return 0 /* Result.BelowMin */;
            if (d < maxDist)
                withinRange = true;
        }
        return withinRange ? 1 /* Result.WithinMax */ : 2 /* Result.Miss */;
    }
    function toPoint(ctx, s, point, radius, minDist, maxDist, elementRadius) {
        var units = s.units;
        var withinRange = false;
        for (var i = 0, _i = units.length; i < _i; i++) {
            var iu = inUnit(ctx, units[i], point, radius, minDist, maxDist, elementRadius);
            if (iu === 0 /* Result.BelowMin */)
                return 0 /* Result.BelowMin */;
            if (iu === 1 /* Result.WithinMax */)
                withinRange = true;
        }
        return withinRange ? 1 /* Result.WithinMax */ : 2 /* Result.Miss */;
    }
    var distPivot = Vec3.zero();
    function check(ctx, a, b, minDist, maxDist, elementRadius) {
        if (a.elementCount === 0 || b.elementCount === 0)
            return 0;
        var units = a.units;
        var withinRange = false;
        ctx.element.structure = a;
        for (var i = 0, _i = units.length; i < _i; i++) {
            var unit = units[i];
            var elements = unit.elements, position = unit.conformation.position;
            ctx.element.unit = unit;
            for (var i_1 = 0, _i_1 = elements.length; i_1 < _i_1; i_1++) {
                var e = elements[i_1];
                ctx.element.element = e;
                var tp = toPoint(ctx, b, position(e, distPivot), elementRadius(ctx), minDist, maxDist, elementRadius);
                if (tp === 0 /* Result.BelowMin */)
                    return false;
                if (tp === 1 /* Result.WithinMax */)
                    withinRange = true;
            }
        }
        return withinRange;
    }
    MinMaxDist.check = check;
})(MinMaxDist || (MinMaxDist = {}));
var MaxRadiusDist;
(function (MaxRadiusDist) {
    var distVec = Vec3.zero();
    function inUnit(ctx, unit, p, eRadius, maxDist, elementRadius) {
        var elements = unit.elements, position = unit.conformation.position, dV = distVec;
        ctx.element.unit = unit;
        for (var i = 0, _i = elements.length; i < _i; i++) {
            var e = elements[i];
            ctx.element.element = e;
            if (Math.max(0, Vec3.distance(p, position(e, dV)) - eRadius - elementRadius(ctx)) <= maxDist)
                return true;
        }
        return false;
    }
    function toPoint(ctx, s, point, radius, maxDist, elementRadius) {
        var units = s.units;
        for (var i = 0, _i = units.length; i < _i; i++) {
            if (inUnit(ctx, units[i], point, radius, maxDist, elementRadius))
                return true;
        }
        return false;
    }
    var distPivot = Vec3.zero();
    function check(ctx, a, b, maxDist, elementRadius) {
        if (a.elementCount === 0 || b.elementCount === 0)
            return 0;
        var units = a.units;
        ctx.element.structure = a;
        for (var i = 0, _i = units.length; i < _i; i++) {
            var unit = units[i];
            ctx.element.unit = unit;
            var elements = unit.elements, position = unit.conformation.position;
            for (var i_2 = 0, _i_2 = elements.length; i_2 < _i_2; i_2++) {
                var e = elements[i_2];
                ctx.element.element = e;
                if (toPoint(ctx, b, position(e, distPivot), elementRadius(ctx), maxDist, elementRadius))
                    return true;
            }
        }
        return false;
    }
    MaxRadiusDist.check = check;
})(MaxRadiusDist || (MaxRadiusDist = {}));
