/**
 * Copyright (c) 2020-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { __assign } from "tslib";
import { ValueCell } from '../../../mol-util';
import { Vec3, Vec4 } from '../../../mol-math/linear-algebra';
import { transformPositionArray, createGroupMapping } from '../../util';
import { createColors } from '../color-data';
import { createMarkers } from '../marker-data';
import { createSizes, getMaxSize } from '../size-data';
import { LocationIterator, PositionLocation } from '../../util/location-iterator';
import { ParamDefinition as PD } from '../../../mol-util/param-definition';
import { calculateInvariantBoundingSphere, calculateTransformBoundingSphere } from '../../../mol-gl/renderable/util';
import { Sphere3D } from '../../../mol-math/geometry';
import { BaseGeometry } from '../base';
import { createEmptyOverpaint } from '../overpaint-data';
import { createEmptyTransparency } from '../transparency-data';
import { hashFnv32a } from '../../../mol-data/util';
import { createEmptyClipping } from '../clipping-data';
import { createEmptySubstance } from '../substance-data';
export var Cylinders;
(function (Cylinders) {
    function create(mappings, indices, groups, starts, ends, scales, caps, cylinderCount, cylinders) {
        return cylinders ?
            update(mappings, indices, groups, starts, ends, scales, caps, cylinderCount, cylinders) :
            fromArrays(mappings, indices, groups, starts, ends, scales, caps, cylinderCount);
    }
    Cylinders.create = create;
    function createEmpty(cylinders) {
        var mb = cylinders ? cylinders.mappingBuffer.ref.value : new Float32Array(0);
        var ib = cylinders ? cylinders.indexBuffer.ref.value : new Uint32Array(0);
        var gb = cylinders ? cylinders.groupBuffer.ref.value : new Float32Array(0);
        var sb = cylinders ? cylinders.startBuffer.ref.value : new Float32Array(0);
        var eb = cylinders ? cylinders.endBuffer.ref.value : new Float32Array(0);
        var ab = cylinders ? cylinders.scaleBuffer.ref.value : new Float32Array(0);
        var cb = cylinders ? cylinders.capBuffer.ref.value : new Float32Array(0);
        return create(mb, ib, gb, sb, eb, ab, cb, 0, cylinders);
    }
    Cylinders.createEmpty = createEmpty;
    function hashCode(cylinders) {
        return hashFnv32a([
            cylinders.cylinderCount, cylinders.mappingBuffer.ref.version, cylinders.indexBuffer.ref.version,
            cylinders.groupBuffer.ref.version, cylinders.startBuffer.ref.version, cylinders.endBuffer.ref.version, cylinders.scaleBuffer.ref.version, cylinders.capBuffer.ref.version
        ]);
    }
    function fromArrays(mappings, indices, groups, starts, ends, scales, caps, cylinderCount) {
        var boundingSphere = Sphere3D();
        var groupMapping;
        var currentHash = -1;
        var currentGroup = -1;
        var cylinders = {
            kind: 'cylinders',
            cylinderCount: cylinderCount,
            mappingBuffer: ValueCell.create(mappings),
            indexBuffer: ValueCell.create(indices),
            groupBuffer: ValueCell.create(groups),
            startBuffer: ValueCell.create(starts),
            endBuffer: ValueCell.create(ends),
            scaleBuffer: ValueCell.create(scales),
            capBuffer: ValueCell.create(caps),
            get boundingSphere() {
                var newHash = hashCode(cylinders);
                if (newHash !== currentHash) {
                    var s = calculateInvariantBoundingSphere(cylinders.startBuffer.ref.value, cylinders.cylinderCount * 6, 6);
                    var e = calculateInvariantBoundingSphere(cylinders.endBuffer.ref.value, cylinders.cylinderCount * 6, 6);
                    Sphere3D.expandBySphere(boundingSphere, s, e);
                    currentHash = newHash;
                }
                return boundingSphere;
            },
            get groupMapping() {
                if (cylinders.groupBuffer.ref.version !== currentGroup) {
                    groupMapping = createGroupMapping(cylinders.groupBuffer.ref.value, cylinders.cylinderCount, 6);
                    currentGroup = cylinders.groupBuffer.ref.version;
                }
                return groupMapping;
            },
            setBoundingSphere: function (sphere) {
                Sphere3D.copy(boundingSphere, sphere);
                currentHash = hashCode(cylinders);
            }
        };
        return cylinders;
    }
    function update(mappings, indices, groups, starts, ends, scales, caps, cylinderCount, cylinders) {
        if (cylinderCount > cylinders.cylinderCount) {
            ValueCell.update(cylinders.mappingBuffer, mappings);
            ValueCell.update(cylinders.indexBuffer, indices);
        }
        cylinders.cylinderCount = cylinderCount;
        ValueCell.update(cylinders.groupBuffer, groups);
        ValueCell.update(cylinders.startBuffer, starts);
        ValueCell.update(cylinders.endBuffer, ends);
        ValueCell.update(cylinders.scaleBuffer, scales);
        ValueCell.update(cylinders.capBuffer, caps);
        return cylinders;
    }
    function transform(cylinders, t) {
        var start = cylinders.startBuffer.ref.value;
        transformPositionArray(t, start, 0, cylinders.cylinderCount * 6);
        ValueCell.update(cylinders.startBuffer, start);
        var end = cylinders.endBuffer.ref.value;
        transformPositionArray(t, end, 0, cylinders.cylinderCount * 6);
        ValueCell.update(cylinders.endBuffer, end);
    }
    Cylinders.transform = transform;
    //
    Cylinders.Params = __assign(__assign({}, BaseGeometry.Params), { sizeFactor: PD.Numeric(1, { min: 0, max: 10, step: 0.1 }), sizeAspectRatio: PD.Numeric(1, { min: 0, max: 3, step: 0.01 }), doubleSided: PD.Boolean(false, BaseGeometry.CustomQualityParamInfo), ignoreLight: PD.Boolean(false, BaseGeometry.ShadingCategory), xrayShaded: PD.Select(false, [[false, 'Off'], [true, 'On'], ['inverted', 'Inverted']], BaseGeometry.ShadingCategory), transparentBackfaces: PD.Select('off', PD.arrayToOptions(['off', 'on', 'opaque']), BaseGeometry.ShadingCategory), solidInterior: PD.Boolean(true, BaseGeometry.ShadingCategory), bumpFrequency: PD.Numeric(0, { min: 0, max: 10, step: 0.1 }, BaseGeometry.ShadingCategory), bumpAmplitude: PD.Numeric(1, { min: 0, max: 5, step: 0.1 }, BaseGeometry.ShadingCategory) });
    Cylinders.Utils = {
        Params: Cylinders.Params,
        createEmpty: createEmpty,
        createValues: createValues,
        createValuesSimple: createValuesSimple,
        updateValues: updateValues,
        updateBoundingSphere: updateBoundingSphere,
        createRenderableState: createRenderableState,
        updateRenderableState: updateRenderableState,
        createPositionIterator: createPositionIterator
    };
    function createPositionIterator(cylinders, transform) {
        var groupCount = cylinders.cylinderCount * 6;
        var instanceCount = transform.instanceCount.ref.value;
        var location = PositionLocation();
        var p = location.position;
        var s = cylinders.startBuffer.ref.value;
        var e = cylinders.endBuffer.ref.value;
        var m = transform.aTransform.ref.value;
        var getLocation = function (groupIndex, instanceIndex) {
            var v = groupIndex % 6 === 0 ? s : e;
            if (instanceIndex < 0) {
                Vec3.fromArray(p, v, groupIndex * 3);
            }
            else {
                Vec3.transformMat4Offset(p, v, m, 0, groupIndex * 3, instanceIndex * 16);
            }
            return location;
        };
        return LocationIterator(groupCount, instanceCount, 2, getLocation);
    }
    function createValues(cylinders, transform, locationIt, theme, props) {
        var instanceCount = locationIt.instanceCount, groupCount = locationIt.groupCount;
        var positionIt = createPositionIterator(cylinders, transform);
        var color = createColors(locationIt, positionIt, theme.color);
        var size = createSizes(locationIt, theme.size);
        var marker = props.instanceGranularity
            ? createMarkers(instanceCount, 'instance')
            : createMarkers(instanceCount * groupCount, 'groupInstance');
        var overpaint = createEmptyOverpaint();
        var transparency = createEmptyTransparency();
        var material = createEmptySubstance();
        var clipping = createEmptyClipping();
        var counts = { drawCount: cylinders.cylinderCount * 4 * 3, vertexCount: cylinders.cylinderCount * 6, groupCount: groupCount, instanceCount: instanceCount };
        var padding = getMaxSize(size) * props.sizeFactor;
        var invariantBoundingSphere = Sphere3D.clone(cylinders.boundingSphere);
        var boundingSphere = calculateTransformBoundingSphere(invariantBoundingSphere, transform.aTransform.ref.value, instanceCount, 0);
        return __assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign({ dGeometryType: ValueCell.create('cylinders'), aMapping: cylinders.mappingBuffer, aGroup: cylinders.groupBuffer, aStart: cylinders.startBuffer, aEnd: cylinders.endBuffer, aScale: cylinders.scaleBuffer, aCap: cylinders.capBuffer, elements: cylinders.indexBuffer, boundingSphere: ValueCell.create(boundingSphere), invariantBoundingSphere: ValueCell.create(invariantBoundingSphere), uInvariantBoundingSphere: ValueCell.create(Vec4.ofSphere(invariantBoundingSphere)) }, color), size), marker), overpaint), transparency), material), clipping), transform), { padding: ValueCell.create(padding) }), BaseGeometry.createValues(props, counts)), { uSizeFactor: ValueCell.create(props.sizeFactor * props.sizeAspectRatio), uDoubleSided: ValueCell.create(props.doubleSided), dIgnoreLight: ValueCell.create(props.ignoreLight), dXrayShaded: ValueCell.create(props.xrayShaded === 'inverted' ? 'inverted' : props.xrayShaded === true ? 'on' : 'off'), dTransparentBackfaces: ValueCell.create(props.transparentBackfaces), dSolidInterior: ValueCell.create(props.solidInterior), uBumpFrequency: ValueCell.create(props.bumpFrequency), uBumpAmplitude: ValueCell.create(props.bumpAmplitude) });
    }
    function createValuesSimple(cylinders, props, colorValue, sizeValue, transform) {
        var s = BaseGeometry.createSimple(colorValue, sizeValue, transform);
        var p = __assign(__assign({}, PD.getDefaultValues(Cylinders.Params)), props);
        return createValues(cylinders, s.transform, s.locationIterator, s.theme, p);
    }
    function updateValues(values, props) {
        BaseGeometry.updateValues(values, props);
        ValueCell.updateIfChanged(values.uSizeFactor, props.sizeFactor * props.sizeAspectRatio);
        ValueCell.updateIfChanged(values.uDoubleSided, props.doubleSided);
        ValueCell.updateIfChanged(values.dIgnoreLight, props.ignoreLight);
        ValueCell.updateIfChanged(values.dXrayShaded, props.xrayShaded === 'inverted' ? 'inverted' : props.xrayShaded === true ? 'on' : 'off');
        ValueCell.updateIfChanged(values.dTransparentBackfaces, props.transparentBackfaces);
        ValueCell.updateIfChanged(values.dSolidInterior, props.solidInterior);
        ValueCell.updateIfChanged(values.uBumpFrequency, props.bumpFrequency);
        ValueCell.updateIfChanged(values.uBumpAmplitude, props.bumpAmplitude);
    }
    function updateBoundingSphere(values, cylinders) {
        var invariantBoundingSphere = Sphere3D.clone(cylinders.boundingSphere);
        var boundingSphere = calculateTransformBoundingSphere(invariantBoundingSphere, values.aTransform.ref.value, values.instanceCount.ref.value, 0);
        if (!Sphere3D.equals(boundingSphere, values.boundingSphere.ref.value)) {
            ValueCell.update(values.boundingSphere, boundingSphere);
        }
        if (!Sphere3D.equals(invariantBoundingSphere, values.invariantBoundingSphere.ref.value)) {
            ValueCell.update(values.invariantBoundingSphere, invariantBoundingSphere);
            ValueCell.update(values.uInvariantBoundingSphere, Vec4.fromSphere(values.uInvariantBoundingSphere.ref.value, invariantBoundingSphere));
        }
    }
    function createRenderableState(props) {
        var state = BaseGeometry.createRenderableState(props);
        updateRenderableState(state, props);
        return state;
    }
    function updateRenderableState(state, props) {
        BaseGeometry.updateRenderableState(state, props);
        state.opaque = state.opaque && !props.xrayShaded;
        state.writeDepth = state.opaque;
    }
})(Cylinders || (Cylinders = {}));
