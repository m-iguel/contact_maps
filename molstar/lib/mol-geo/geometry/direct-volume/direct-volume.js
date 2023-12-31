/**
 * Copyright (c) 2018-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { __assign } from "tslib";
import { hashFnv32a } from '../../../mol-data/util';
import { LocationIterator, PositionLocation } from '../../../mol-geo/util/location-iterator';
import { calculateTransformBoundingSphere } from '../../../mol-gl/renderable/util';
import { createNullTexture } from '../../../mol-gl/webgl/texture';
import { Box3D, Sphere3D } from '../../../mol-math/geometry';
import { Mat4, Vec2, Vec3, Vec4 } from '../../../mol-math/linear-algebra';
import { ValueCell } from '../../../mol-util';
import { ParamDefinition as PD } from '../../../mol-util/param-definition';
import { Box } from '../../primitive/box';
import { BaseGeometry } from '../base';
import { createColors } from '../color-data';
import { createMarkers } from '../marker-data';
import { createEmptyOverpaint } from '../overpaint-data';
import { createEmptyTransparency } from '../transparency-data';
import { createTransferFunctionTexture, getControlPointsFromVec2Array } from './transfer-function';
import { createEmptyClipping } from '../clipping-data';
import { Grid } from '../../../mol-model/volume';
import { createEmptySubstance } from '../substance-data';
var VolumeBox = Box();
export var DirectVolume;
(function (DirectVolume) {
    function create(bbox, gridDimension, transform, unitToCartn, cellDim, texture, stats, packedGroup, axisOrder, directVolume) {
        return directVolume ?
            update(bbox, gridDimension, transform, unitToCartn, cellDim, texture, stats, packedGroup, axisOrder, directVolume) :
            fromData(bbox, gridDimension, transform, unitToCartn, cellDim, texture, stats, packedGroup, axisOrder);
    }
    DirectVolume.create = create;
    function hashCode(directVolume) {
        return hashFnv32a([
            directVolume.bboxSize.ref.version, directVolume.gridDimension.ref.version,
            directVolume.gridTexture.ref.version, directVolume.transform.ref.version,
            directVolume.gridStats.ref.version
        ]);
    }
    function fromData(bbox, gridDimension, transform, unitToCartn, cellDim, texture, stats, packedGroup, axisOrder) {
        var boundingSphere = Sphere3D();
        var currentHash = -1;
        var width = texture.getWidth();
        var height = texture.getHeight();
        var depth = texture.getDepth();
        var directVolume = {
            kind: 'direct-volume',
            gridDimension: ValueCell.create(gridDimension),
            gridTexture: ValueCell.create(texture),
            gridTextureDim: ValueCell.create(Vec3.create(width, height, depth)),
            gridStats: ValueCell.create(Vec4.create(stats.min, stats.max, stats.mean, stats.sigma)),
            bboxMin: ValueCell.create(bbox.min),
            bboxMax: ValueCell.create(bbox.max),
            bboxSize: ValueCell.create(Vec3.sub(Vec3(), bbox.max, bbox.min)),
            transform: ValueCell.create(transform),
            cellDim: ValueCell.create(cellDim),
            unitToCartn: ValueCell.create(unitToCartn),
            cartnToUnit: ValueCell.create(Mat4.invert(Mat4(), unitToCartn)),
            get boundingSphere() {
                var newHash = hashCode(directVolume);
                if (newHash !== currentHash) {
                    var b = getBoundingSphere(directVolume.gridDimension.ref.value, directVolume.transform.ref.value);
                    Sphere3D.copy(boundingSphere, b);
                    currentHash = newHash;
                }
                return boundingSphere;
            },
            packedGroup: ValueCell.create(packedGroup),
            axisOrder: ValueCell.create(axisOrder),
            setBoundingSphere: function (sphere) {
                Sphere3D.copy(boundingSphere, sphere);
                currentHash = hashCode(directVolume);
            }
        };
        return directVolume;
    }
    function update(bbox, gridDimension, transform, unitToCartn, cellDim, texture, stats, packedGroup, axisOrder, directVolume) {
        var width = texture.getWidth();
        var height = texture.getHeight();
        var depth = texture.getDepth();
        ValueCell.update(directVolume.gridDimension, gridDimension);
        ValueCell.update(directVolume.gridTexture, texture);
        ValueCell.update(directVolume.gridTextureDim, Vec3.set(directVolume.gridTextureDim.ref.value, width, height, depth));
        ValueCell.update(directVolume.gridStats, Vec4.set(directVolume.gridStats.ref.value, stats.min, stats.max, stats.mean, stats.sigma));
        ValueCell.update(directVolume.bboxMin, bbox.min);
        ValueCell.update(directVolume.bboxMax, bbox.max);
        ValueCell.update(directVolume.bboxSize, Vec3.sub(directVolume.bboxSize.ref.value, bbox.max, bbox.min));
        ValueCell.update(directVolume.transform, transform);
        ValueCell.update(directVolume.cellDim, cellDim);
        ValueCell.update(directVolume.unitToCartn, unitToCartn);
        ValueCell.update(directVolume.cartnToUnit, Mat4.invert(Mat4(), unitToCartn));
        ValueCell.updateIfChanged(directVolume.packedGroup, packedGroup);
        ValueCell.updateIfChanged(directVolume.axisOrder, Vec3.fromArray(directVolume.axisOrder.ref.value, axisOrder, 0));
        return directVolume;
    }
    function createEmpty(directVolume) {
        var bbox = Box3D();
        var gridDimension = Vec3();
        var transform = Mat4.identity();
        var unitToCartn = Mat4.identity();
        var cellDim = Vec3();
        var texture = createNullTexture();
        var stats = Grid.One.stats;
        var packedGroup = false;
        var axisOrder = Vec3.create(0, 1, 2);
        return create(bbox, gridDimension, transform, unitToCartn, cellDim, texture, stats, packedGroup, axisOrder, directVolume);
    }
    DirectVolume.createEmpty = createEmpty;
    DirectVolume.Params = __assign(__assign({}, BaseGeometry.Params), { ignoreLight: PD.Boolean(false, BaseGeometry.ShadingCategory), xrayShaded: PD.Select(false, [[false, 'Off'], [true, 'On'], ['inverted', 'Inverted']], BaseGeometry.ShadingCategory), controlPoints: PD.LineGraph([
            Vec2.create(0.19, 0.0), Vec2.create(0.2, 0.05), Vec2.create(0.25, 0.05), Vec2.create(0.26, 0.0),
            Vec2.create(0.79, 0.0), Vec2.create(0.8, 0.05), Vec2.create(0.85, 0.05), Vec2.create(0.86, 0.0),
        ], { isEssential: true }), stepsPerCell: PD.Numeric(3, { min: 1, max: 10, step: 1 }), jumpLength: PD.Numeric(0, { min: 0, max: 20, step: 0.1 }) });
    DirectVolume.Utils = {
        Params: DirectVolume.Params,
        createEmpty: createEmpty,
        createValues: createValues,
        createValuesSimple: createValuesSimple,
        updateValues: updateValues,
        updateBoundingSphere: updateBoundingSphere,
        createRenderableState: createRenderableState,
        updateRenderableState: updateRenderableState,
        createPositionIterator: createPositionIterator
    };
    function createPositionIterator(directVolume, transform) {
        var t = directVolume.transform.ref.value;
        var _a = directVolume.gridDimension.ref.value, x = _a[0], y = _a[1], z = _a[2];
        var groupCount = x * y * z;
        var instanceCount = transform.instanceCount.ref.value;
        var location = PositionLocation();
        var p = location.position;
        var m = transform.aTransform.ref.value;
        var getLocation = function (groupIndex, instanceIndex) {
            var k = Math.floor(groupIndex / z);
            p[0] = Math.floor(k / y);
            p[1] = k % y;
            p[2] = groupIndex % z;
            Vec3.transformMat4(p, p, t);
            if (instanceIndex >= 0) {
                Vec3.transformMat4Offset(p, p, m, 0, 0, instanceIndex * 16);
            }
            return location;
        };
        return LocationIterator(groupCount, instanceCount, 1, getLocation);
    }
    function getMaxSteps(gridDim, stepsPerCell) {
        return Math.ceil(Vec3.magnitude(gridDim) * stepsPerCell);
    }
    function getStepScale(cellDim, stepsPerCell) {
        return Math.min.apply(Math, cellDim) * (1 / stepsPerCell);
    }
    function getTransferScale(stepsPerCell) {
        return (1 / stepsPerCell);
    }
    function createValues(directVolume, transform, locationIt, theme, props) {
        var gridTexture = directVolume.gridTexture, gridTextureDim = directVolume.gridTextureDim, gridStats = directVolume.gridStats;
        var bboxSize = directVolume.bboxSize, bboxMin = directVolume.bboxMin, bboxMax = directVolume.bboxMax, gridDimension = directVolume.gridDimension, gridTransform = directVolume.transform;
        var instanceCount = locationIt.instanceCount, groupCount = locationIt.groupCount;
        var positionIt = DirectVolume.Utils.createPositionIterator(directVolume, transform);
        var color = createColors(locationIt, positionIt, theme.color);
        var marker = props.instanceGranularity
            ? createMarkers(instanceCount, 'instance')
            : createMarkers(instanceCount * groupCount, 'groupInstance');
        var overpaint = createEmptyOverpaint();
        var transparency = createEmptyTransparency();
        var material = createEmptySubstance();
        var clipping = createEmptyClipping();
        var _a = gridDimension.ref.value, x = _a[0], y = _a[1], z = _a[2];
        var counts = { drawCount: VolumeBox.indices.length, vertexCount: x * y * z, groupCount: groupCount, instanceCount: instanceCount };
        var invariantBoundingSphere = Sphere3D.clone(directVolume.boundingSphere);
        var boundingSphere = calculateTransformBoundingSphere(invariantBoundingSphere, transform.aTransform.ref.value, instanceCount, 0);
        var controlPoints = getControlPointsFromVec2Array(props.controlPoints);
        var transferTex = createTransferFunctionTexture(controlPoints);
        return __assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign({ dGeometryType: ValueCell.create('directVolume') }, color), marker), overpaint), transparency), material), clipping), transform), BaseGeometry.createValues(props, counts)), { aPosition: ValueCell.create(VolumeBox.vertices), elements: ValueCell.create(VolumeBox.indices), boundingSphere: ValueCell.create(boundingSphere), invariantBoundingSphere: ValueCell.create(invariantBoundingSphere), uInvariantBoundingSphere: ValueCell.create(Vec4.ofSphere(invariantBoundingSphere)), uBboxMin: bboxMin, uBboxMax: bboxMax, uBboxSize: bboxSize, uMaxSteps: ValueCell.create(getMaxSteps(gridDimension.ref.value, props.stepsPerCell)), uStepScale: ValueCell.create(getStepScale(directVolume.cellDim.ref.value, props.stepsPerCell)), uJumpLength: ValueCell.create(props.jumpLength), uTransform: gridTransform, uGridDim: gridDimension, tTransferTex: transferTex, uTransferScale: ValueCell.create(getTransferScale(props.stepsPerCell)), dGridTexType: ValueCell.create(gridTexture.ref.value.getDepth() > 0 ? '3d' : '2d'), uGridTexDim: gridTextureDim, tGridTex: gridTexture, uGridStats: gridStats, uCellDim: directVolume.cellDim, uCartnToUnit: directVolume.cartnToUnit, uUnitToCartn: directVolume.unitToCartn, dPackedGroup: directVolume.packedGroup, dAxisOrder: ValueCell.create(directVolume.axisOrder.ref.value.join('')), dIgnoreLight: ValueCell.create(props.ignoreLight), dXrayShaded: ValueCell.create(props.xrayShaded === 'inverted' ? 'inverted' : props.xrayShaded === true ? 'on' : 'off') });
    }
    function createValuesSimple(directVolume, props, colorValue, sizeValue, transform) {
        var s = BaseGeometry.createSimple(colorValue, sizeValue, transform);
        var p = __assign(__assign({}, PD.getDefaultValues(DirectVolume.Params)), props);
        return createValues(directVolume, s.transform, s.locationIterator, s.theme, p);
    }
    function updateValues(values, props) {
        BaseGeometry.updateValues(values, props);
        ValueCell.updateIfChanged(values.dIgnoreLight, props.ignoreLight);
        ValueCell.updateIfChanged(values.dXrayShaded, props.xrayShaded === 'inverted' ? 'inverted' : props.xrayShaded === true ? 'on' : 'off');
        var controlPoints = getControlPointsFromVec2Array(props.controlPoints);
        createTransferFunctionTexture(controlPoints, values.tTransferTex);
        ValueCell.updateIfChanged(values.uMaxSteps, getMaxSteps(values.uGridDim.ref.value, props.stepsPerCell));
        ValueCell.updateIfChanged(values.uStepScale, getStepScale(values.uCellDim.ref.value, props.stepsPerCell));
        ValueCell.updateIfChanged(values.uTransferScale, getTransferScale(props.stepsPerCell));
        ValueCell.updateIfChanged(values.uJumpLength, props.jumpLength);
    }
    function updateBoundingSphere(values, directVolume) {
        var invariantBoundingSphere = Sphere3D.clone(directVolume.boundingSphere);
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
        state.opaque = false;
        state.writeDepth = false;
        return state;
    }
    function updateRenderableState(state, props) {
        BaseGeometry.updateRenderableState(state, props);
        state.opaque = false;
        state.writeDepth = false;
    }
})(DirectVolume || (DirectVolume = {}));
//
function getBoundingSphere(gridDimension, gridTransform) {
    return Sphere3D.fromDimensionsAndTransform(Sphere3D(), gridDimension, gridTransform);
}
