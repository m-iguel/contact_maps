/**
 * Copyright (c) 2019-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { __assign } from "tslib";
import { ValueCell } from '../../../mol-util';
import { Sphere3D } from '../../../mol-math/geometry';
import { ParamDefinition as PD } from '../../../mol-util/param-definition';
import { LocationIterator, PositionLocation } from '../../../mol-geo/util/location-iterator';
import { createColors } from '../color-data';
import { createMarkers } from '../marker-data';
import { BaseGeometry } from '../base';
import { createEmptyOverpaint } from '../overpaint-data';
import { createEmptyTransparency } from '../transparency-data';
import { calculateTransformBoundingSphere } from '../../../mol-gl/renderable/util';
import { createNullTexture } from '../../../mol-gl/webgl/texture';
import { Vec2, Vec3, Vec4 } from '../../../mol-math/linear-algebra';
import { createEmptyClipping } from '../clipping-data';
import { NullLocation } from '../../../mol-model/location';
import { createEmptySubstance } from '../substance-data';
export var TextureMesh;
(function (TextureMesh) {
    var DoubleBuffer = /** @class */ (function () {
        function DoubleBuffer() {
            this.index = 0;
            this.textures = [];
        }
        DoubleBuffer.prototype.get = function () {
            return this.textures[this.index];
        };
        DoubleBuffer.prototype.set = function (vertex, group, normal) {
            this.textures[this.index] = Object.assign(this.textures[this.index] || {}, {
                vertex: vertex,
                group: group,
                normal: normal
            });
            this.index = (this.index + 1) % 2;
        };
        DoubleBuffer.prototype.destroy = function () {
            for (var _i = 0, _a = this.textures; _i < _a.length; _i++) {
                var buffer = _a[_i];
                buffer.vertex.destroy();
                buffer.group.destroy();
                buffer.normal.destroy();
            }
        };
        return DoubleBuffer;
    }());
    TextureMesh.DoubleBuffer = DoubleBuffer;
    function create(vertexCount, groupCount, vertexTexture, groupTexture, normalTexture, boundingSphere, textureMesh) {
        var width = vertexTexture.getWidth();
        var height = vertexTexture.getHeight();
        if (textureMesh) {
            textureMesh.vertexCount = vertexCount;
            textureMesh.groupCount = groupCount;
            ValueCell.update(textureMesh.geoTextureDim, Vec2.set(textureMesh.geoTextureDim.ref.value, width, height));
            ValueCell.update(textureMesh.vertexTexture, vertexTexture);
            ValueCell.update(textureMesh.groupTexture, groupTexture);
            ValueCell.update(textureMesh.normalTexture, normalTexture);
            textureMesh.doubleBuffer.set(vertexTexture, groupTexture, normalTexture);
            Sphere3D.copy(textureMesh.boundingSphere, boundingSphere);
            return textureMesh;
        }
        else {
            return {
                kind: 'texture-mesh',
                vertexCount: vertexCount,
                groupCount: groupCount,
                geoTextureDim: ValueCell.create(Vec2.create(width, height)),
                vertexTexture: ValueCell.create(vertexTexture),
                groupTexture: ValueCell.create(groupTexture),
                normalTexture: ValueCell.create(normalTexture),
                varyingGroup: ValueCell.create(false),
                doubleBuffer: new DoubleBuffer(),
                boundingSphere: Sphere3D.clone(boundingSphere),
                meta: {}
            };
        }
    }
    TextureMesh.create = create;
    function createEmpty(textureMesh) {
        var vt = textureMesh ? textureMesh.vertexTexture.ref.value : createNullTexture();
        var gt = textureMesh ? textureMesh.groupTexture.ref.value : createNullTexture();
        var nt = textureMesh ? textureMesh.normalTexture.ref.value : createNullTexture();
        var bs = textureMesh ? textureMesh.boundingSphere : Sphere3D();
        return create(0, 0, vt, gt, nt, bs, textureMesh);
    }
    TextureMesh.createEmpty = createEmpty;
    TextureMesh.Params = __assign(__assign({}, BaseGeometry.Params), { doubleSided: PD.Boolean(false, BaseGeometry.CustomQualityParamInfo), flipSided: PD.Boolean(false, BaseGeometry.ShadingCategory), flatShaded: PD.Boolean(false, BaseGeometry.ShadingCategory), ignoreLight: PD.Boolean(false, BaseGeometry.ShadingCategory), xrayShaded: PD.Select(false, [[false, 'Off'], [true, 'On'], ['inverted', 'Inverted']], BaseGeometry.ShadingCategory), transparentBackfaces: PD.Select('off', PD.arrayToOptions(['off', 'on', 'opaque']), BaseGeometry.ShadingCategory), bumpFrequency: PD.Numeric(0, { min: 0, max: 10, step: 0.1 }, BaseGeometry.ShadingCategory), bumpAmplitude: PD.Numeric(1, { min: 0, max: 5, step: 0.1 }, BaseGeometry.ShadingCategory) });
    TextureMesh.Utils = {
        Params: TextureMesh.Params,
        createEmpty: createEmpty,
        createValues: createValues,
        createValuesSimple: createValuesSimple,
        updateValues: updateValues,
        updateBoundingSphere: updateBoundingSphere,
        createRenderableState: createRenderableState,
        updateRenderableState: updateRenderableState,
        createPositionIterator: createPositionIterator,
    };
    var TextureMeshName = 'texture-mesh';
    function createPositionIterator(textureMesh, transform) {
        var webgl = textureMesh.meta.webgl;
        if (!webgl)
            return LocationIterator(1, 1, 1, function () { return NullLocation; });
        if (!webgl.namedFramebuffers[TextureMeshName]) {
            webgl.namedFramebuffers[TextureMeshName] = webgl.resources.framebuffer();
        }
        var framebuffer = webgl.namedFramebuffers[TextureMeshName];
        var _a = textureMesh.geoTextureDim.ref.value, width = _a[0], height = _a[1];
        var vertices = new Float32Array(width * height * 4);
        framebuffer.bind();
        textureMesh.vertexTexture.ref.value.attachFramebuffer(framebuffer, 0);
        webgl.readPixels(0, 0, width, height, vertices);
        var groupCount = textureMesh.vertexCount;
        var instanceCount = transform.instanceCount.ref.value;
        var location = PositionLocation();
        var p = location.position;
        var v = vertices;
        var m = transform.aTransform.ref.value;
        var getLocation = function (groupIndex, instanceIndex) {
            if (instanceIndex < 0) {
                Vec3.fromArray(p, v, groupIndex * 4);
            }
            else {
                Vec3.transformMat4Offset(p, v, m, 0, groupIndex * 4, instanceIndex * 16);
            }
            return location;
        };
        return LocationIterator(groupCount, instanceCount, 1, getLocation);
    }
    function createValues(textureMesh, transform, locationIt, theme, props) {
        var instanceCount = locationIt.instanceCount, groupCount = locationIt.groupCount;
        var positionIt = TextureMesh.Utils.createPositionIterator(textureMesh, transform);
        var color = createColors(locationIt, positionIt, theme.color);
        var marker = props.instanceGranularity
            ? createMarkers(instanceCount, 'instance')
            : createMarkers(instanceCount * groupCount, 'groupInstance');
        var overpaint = createEmptyOverpaint();
        var transparency = createEmptyTransparency();
        var substance = createEmptySubstance();
        var clipping = createEmptyClipping();
        var counts = { drawCount: textureMesh.vertexCount, vertexCount: textureMesh.vertexCount, groupCount: groupCount, instanceCount: instanceCount };
        var invariantBoundingSphere = Sphere3D.clone(textureMesh.boundingSphere);
        var boundingSphere = calculateTransformBoundingSphere(invariantBoundingSphere, transform.aTransform.ref.value, instanceCount, 0);
        return __assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign({ dGeometryType: ValueCell.create('textureMesh'), uGeoTexDim: textureMesh.geoTextureDim, tPosition: textureMesh.vertexTexture, tGroup: textureMesh.groupTexture, tNormal: textureMesh.normalTexture, dVaryingGroup: textureMesh.varyingGroup, boundingSphere: ValueCell.create(boundingSphere), invariantBoundingSphere: ValueCell.create(invariantBoundingSphere), uInvariantBoundingSphere: ValueCell.create(Vec4.ofSphere(invariantBoundingSphere)) }, color), marker), overpaint), transparency), substance), clipping), transform), BaseGeometry.createValues(props, counts)), { uDoubleSided: ValueCell.create(props.doubleSided), dFlatShaded: ValueCell.create(props.flatShaded), dFlipSided: ValueCell.create(props.flipSided), dIgnoreLight: ValueCell.create(props.ignoreLight), dXrayShaded: ValueCell.create(props.xrayShaded === 'inverted' ? 'inverted' : props.xrayShaded === true ? 'on' : 'off'), dTransparentBackfaces: ValueCell.create(props.transparentBackfaces), uBumpFrequency: ValueCell.create(props.bumpFrequency), uBumpAmplitude: ValueCell.create(props.bumpAmplitude), meta: ValueCell.create(textureMesh.meta) });
    }
    function createValuesSimple(textureMesh, props, colorValue, sizeValue, transform) {
        var s = BaseGeometry.createSimple(colorValue, sizeValue, transform);
        var p = __assign(__assign({}, PD.getDefaultValues(TextureMesh.Params)), props);
        return createValues(textureMesh, s.transform, s.locationIterator, s.theme, p);
    }
    function updateValues(values, props) {
        BaseGeometry.updateValues(values, props);
        ValueCell.updateIfChanged(values.uDoubleSided, props.doubleSided);
        ValueCell.updateIfChanged(values.dFlatShaded, props.flatShaded);
        ValueCell.updateIfChanged(values.dFlipSided, props.flipSided);
        ValueCell.updateIfChanged(values.dIgnoreLight, props.ignoreLight);
        ValueCell.updateIfChanged(values.dXrayShaded, props.xrayShaded === 'inverted' ? 'inverted' : props.xrayShaded === true ? 'on' : 'off');
        ValueCell.updateIfChanged(values.dTransparentBackfaces, props.transparentBackfaces);
        ValueCell.updateIfChanged(values.uBumpFrequency, props.bumpFrequency);
        ValueCell.updateIfChanged(values.uBumpAmplitude, props.bumpAmplitude);
    }
    function updateBoundingSphere(values, textureMesh) {
        var invariantBoundingSphere = Sphere3D.clone(textureMesh.boundingSphere);
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
})(TextureMesh || (TextureMesh = {}));
