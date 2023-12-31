/**
 * Copyright (c) 2022-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { __assign } from "tslib";
import { QuadPositions, } from '../../mol-gl/compute/util';
import { createComputeRenderable } from '../../mol-gl/renderable';
import { AttributeSpec, DefineSpec, TextureSpec, UniformSpec, ValueSpec } from '../../mol-gl/renderable/schema';
import { ShaderCode } from '../../mol-gl/shader-code';
import { background_frag } from '../../mol-gl/shader/background.frag';
import { background_vert } from '../../mol-gl/shader/background.vert';
import { createComputeRenderItem } from '../../mol-gl/webgl/render-item';
import { createNullTexture } from '../../mol-gl/webgl/texture';
import { Mat4 } from '../../mol-math/linear-algebra/3d/mat4';
import { ValueCell } from '../../mol-util/value-cell';
import { ParamDefinition as PD } from '../../mol-util/param-definition';
import { isTimingMode } from '../../mol-util/debug';
import { Camera } from '../camera';
import { Vec3 } from '../../mol-math/linear-algebra/3d/vec3';
import { Vec2 } from '../../mol-math/linear-algebra/3d/vec2';
import { Color } from '../../mol-util/color';
import { Asset } from '../../mol-util/assets';
import { Vec4 } from '../../mol-math/linear-algebra/3d/vec4';
import { isPowerOfTwo } from '../../mol-math/misc';
var SharedParams = {
    opacity: PD.Numeric(1, { min: 0.0, max: 1.0, step: 0.01 }),
    saturation: PD.Numeric(0, { min: -1, max: 1, step: 0.01 }),
    lightness: PD.Numeric(0, { min: -1, max: 1, step: 0.01 }),
};
var SkyboxParams = __assign({ faces: PD.MappedStatic('urls', {
        urls: PD.Group({
            nx: PD.Text('', { label: 'Negative X / Left' }),
            ny: PD.Text('', { label: 'Negative Y / Bottom' }),
            nz: PD.Text('', { label: 'Negative Z / Back' }),
            px: PD.Text('', { label: 'Positive X / Right' }),
            py: PD.Text('', { label: 'Positive Y / Top' }),
            pz: PD.Text('', { label: 'Positive Z / Front' }),
        }, { isExpanded: true, label: 'URLs' }),
        files: PD.Group({
            nx: PD.File({ label: 'Negative X / Left', accept: 'image/*' }),
            ny: PD.File({ label: 'Negative Y / Bottom', accept: 'image/*' }),
            nz: PD.File({ label: 'Negative Z / Back', accept: 'image/*' }),
            px: PD.File({ label: 'Positive X / Right', accept: 'image/*' }),
            py: PD.File({ label: 'Positive Y / Top', accept: 'image/*' }),
            pz: PD.File({ label: 'Positive Z / Front', accept: 'image/*' }),
        }, { isExpanded: true, label: 'Files' }),
    }), blur: PD.Numeric(0, { min: 0.0, max: 1.0, step: 0.01 }, { description: 'Note, this only works in WebGL2 or when "EXT_shader_texture_lod" is available.' }) }, SharedParams);
var ImageParams = __assign(__assign({ source: PD.MappedStatic('url', {
        url: PD.Text(''),
        file: PD.File({ accept: 'image/*' }),
    }), blur: PD.Numeric(0, { min: 0.0, max: 1.0, step: 0.01 }, { description: 'Note, this only works in WebGL2 or with power-of-two images and when "EXT_shader_texture_lod" is available.' }) }, SharedParams), { coverage: PD.Select('viewport', PD.arrayToOptions(['viewport', 'canvas'])) });
var HorizontalGradientParams = {
    topColor: PD.Color(Color(0xDDDDDD)),
    bottomColor: PD.Color(Color(0xEEEEEE)),
    ratio: PD.Numeric(0.5, { min: 0.0, max: 1.0, step: 0.01 }),
    coverage: PD.Select('viewport', PD.arrayToOptions(['viewport', 'canvas'])),
};
var RadialGradientParams = {
    centerColor: PD.Color(Color(0xDDDDDD)),
    edgeColor: PD.Color(Color(0xEEEEEE)),
    ratio: PD.Numeric(0.5, { min: 0.0, max: 1.0, step: 0.01 }),
    coverage: PD.Select('viewport', PD.arrayToOptions(['viewport', 'canvas'])),
};
export var BackgroundParams = {
    variant: PD.MappedStatic('off', {
        off: PD.EmptyGroup(),
        skybox: PD.Group(SkyboxParams, { isExpanded: true }),
        image: PD.Group(ImageParams, { isExpanded: true }),
        horizontalGradient: PD.Group(HorizontalGradientParams, { isExpanded: true }),
        radialGradient: PD.Group(RadialGradientParams, { isExpanded: true }),
    }, { label: 'Environment' }),
};
var BackgroundPass = /** @class */ (function () {
    function BackgroundPass(webgl, assetManager, width, height) {
        this.webgl = webgl;
        this.assetManager = assetManager;
        this.camera = new Camera();
        this.target = Vec3();
        this.position = Vec3();
        this.dir = Vec3();
        this.renderable = getBackgroundRenderable(webgl, width, height);
    }
    BackgroundPass.prototype.setSize = function (width, height) {
        var _a = this.renderable.values.uTexSize.ref.value, w = _a[0], h = _a[1];
        if (width !== w || height !== h) {
            ValueCell.update(this.renderable.values.uTexSize, Vec2.set(this.renderable.values.uTexSize.ref.value, width, height));
        }
    };
    BackgroundPass.prototype.clearSkybox = function () {
        var _this = this;
        if (this.skybox !== undefined) {
            this.skybox.texture.destroy();
            this.skybox.assets.forEach(function (a) { return _this.assetManager.release(a); });
            this.skybox = undefined;
        }
    };
    BackgroundPass.prototype.updateSkybox = function (camera, props, onload) {
        var _this = this;
        var _a;
        var tf = (_a = this.skybox) === null || _a === void 0 ? void 0 : _a.props.faces;
        var f = props.faces.params;
        if (!f.nx || !f.ny || !f.nz || !f.px || !f.py || !f.pz) {
            this.clearSkybox();
            onload === null || onload === void 0 ? void 0 : onload(false);
            return;
        }
        if (!this.skybox || !tf || !areSkyboxTexturePropsEqual(props.faces, this.skybox.props.faces)) {
            this.clearSkybox();
            var _b = getSkyboxTexture(this.webgl, this.assetManager, props.faces, function (errored) {
                if (_this.skybox)
                    _this.skybox.loaded = !errored;
                onload === null || onload === void 0 ? void 0 : onload(true);
            }), texture = _b.texture, assets = _b.assets;
            this.skybox = { texture: texture, props: __assign({}, props), assets: assets, loaded: false };
            ValueCell.update(this.renderable.values.tSkybox, texture);
            this.renderable.update();
        }
        else {
            onload === null || onload === void 0 ? void 0 : onload(false);
        }
        if (!this.skybox)
            return;
        var cam = camera;
        if (camera.state.mode === 'orthographic') {
            this.camera.setState(__assign(__assign({}, camera.state), { mode: 'perspective' }));
            this.camera.update();
            cam = this.camera;
        }
        var m = this.renderable.values.uViewDirectionProjectionInverse.ref.value;
        Vec3.sub(this.dir, cam.state.position, cam.state.target);
        Vec3.setMagnitude(this.dir, this.dir, 0.1);
        Vec3.copy(this.position, this.dir);
        Mat4.lookAt(m, this.position, this.target, cam.state.up);
        Mat4.mul(m, cam.projection, m);
        Mat4.invert(m, m);
        ValueCell.update(this.renderable.values.uViewDirectionProjectionInverse, m);
        ValueCell.updateIfChanged(this.renderable.values.uBlur, props.blur);
        ValueCell.updateIfChanged(this.renderable.values.uOpacity, props.opacity);
        ValueCell.updateIfChanged(this.renderable.values.uSaturation, props.saturation);
        ValueCell.updateIfChanged(this.renderable.values.uLightness, props.lightness);
        ValueCell.updateIfChanged(this.renderable.values.dVariant, 'skybox');
        this.renderable.update();
    };
    BackgroundPass.prototype.clearImage = function () {
        if (this.image !== undefined) {
            this.image.texture.destroy();
            this.assetManager.release(this.image.asset);
            this.image = undefined;
        }
    };
    BackgroundPass.prototype.updateImage = function (props, onload) {
        var _this = this;
        if (!props.source.params) {
            this.clearImage();
            onload === null || onload === void 0 ? void 0 : onload(false);
            return;
        }
        if (!this.image || !this.image.props.source.params || !areImageTexturePropsEqual(props.source, this.image.props.source)) {
            this.clearImage();
            var _a = getImageTexture(this.webgl, this.assetManager, props.source, function (errored) {
                if (_this.image)
                    _this.image.loaded = !errored;
                onload === null || onload === void 0 ? void 0 : onload(true);
            }), texture = _a.texture, asset = _a.asset;
            this.image = { texture: texture, props: __assign({}, props), asset: asset, loaded: false };
            ValueCell.update(this.renderable.values.tImage, texture);
            this.renderable.update();
        }
        else {
            onload === null || onload === void 0 ? void 0 : onload(false);
        }
        if (!this.image)
            return;
        ValueCell.updateIfChanged(this.renderable.values.uBlur, props.blur);
        ValueCell.updateIfChanged(this.renderable.values.uOpacity, props.opacity);
        ValueCell.updateIfChanged(this.renderable.values.uSaturation, props.saturation);
        ValueCell.updateIfChanged(this.renderable.values.uLightness, props.lightness);
        ValueCell.updateIfChanged(this.renderable.values.uViewportAdjusted, props.coverage === 'viewport' ? true : false);
        ValueCell.updateIfChanged(this.renderable.values.dVariant, 'image');
        this.renderable.update();
    };
    BackgroundPass.prototype.updateImageScaling = function () {
        var _a, _b;
        var v = this.renderable.values;
        var _c = v.uTexSize.ref.value, w = _c[0], h = _c[1];
        var iw = ((_a = this.image) === null || _a === void 0 ? void 0 : _a.texture.getWidth()) || 0;
        var ih = ((_b = this.image) === null || _b === void 0 ? void 0 : _b.texture.getHeight()) || 0;
        var r = w / h;
        var ir = iw / ih;
        // responsive scaling with offset
        if (r < ir) {
            ValueCell.update(v.uImageScale, Vec2.set(v.uImageScale.ref.value, iw * h / ih, h));
        }
        else {
            ValueCell.update(v.uImageScale, Vec2.set(v.uImageScale.ref.value, w, ih * w / iw));
        }
        var _d = v.uImageScale.ref.value, rw = _d[0], rh = _d[1];
        var sr = rw / rh;
        if (sr > r) {
            ValueCell.update(v.uImageOffset, Vec2.set(v.uImageOffset.ref.value, (1 - r / sr) / 2, 0));
        }
        else {
            ValueCell.update(v.uImageOffset, Vec2.set(v.uImageOffset.ref.value, 0, (1 - sr / r) / 2));
        }
    };
    BackgroundPass.prototype.updateGradient = function (colorA, colorB, ratio, variant, viewportAdjusted) {
        ValueCell.update(this.renderable.values.uGradientColorA, Color.toVec3Normalized(this.renderable.values.uGradientColorA.ref.value, colorA));
        ValueCell.update(this.renderable.values.uGradientColorB, Color.toVec3Normalized(this.renderable.values.uGradientColorB.ref.value, colorB));
        ValueCell.updateIfChanged(this.renderable.values.uGradientRatio, ratio);
        ValueCell.updateIfChanged(this.renderable.values.uViewportAdjusted, viewportAdjusted);
        ValueCell.updateIfChanged(this.renderable.values.dVariant, variant);
        this.renderable.update();
    };
    BackgroundPass.prototype.update = function (camera, props, onload) {
        if (props.variant.name === 'off') {
            this.clearSkybox();
            this.clearImage();
            onload === null || onload === void 0 ? void 0 : onload(false);
            return;
        }
        else if (props.variant.name === 'skybox') {
            this.clearImage();
            this.updateSkybox(camera, props.variant.params, onload);
        }
        else if (props.variant.name === 'image') {
            this.clearSkybox();
            this.updateImage(props.variant.params, onload);
        }
        else if (props.variant.name === 'horizontalGradient') {
            this.clearSkybox();
            this.clearImage();
            this.updateGradient(props.variant.params.topColor, props.variant.params.bottomColor, props.variant.params.ratio, props.variant.name, props.variant.params.coverage === 'viewport' ? true : false);
            onload === null || onload === void 0 ? void 0 : onload(false);
        }
        else if (props.variant.name === 'radialGradient') {
            this.clearSkybox();
            this.clearImage();
            this.updateGradient(props.variant.params.centerColor, props.variant.params.edgeColor, props.variant.params.ratio, props.variant.name, props.variant.params.coverage === 'viewport' ? true : false);
            onload === null || onload === void 0 ? void 0 : onload(false);
        }
        var _a = camera.viewport, x = _a.x, y = _a.y, width = _a.width, height = _a.height;
        ValueCell.update(this.renderable.values.uViewport, Vec4.set(this.renderable.values.uViewport.ref.value, x, y, width, height));
    };
    BackgroundPass.prototype.isEnabled = function (props) {
        return !!((this.skybox && this.skybox.loaded) ||
            (this.image && this.image.loaded) ||
            props.variant.name === 'horizontalGradient' ||
            props.variant.name === 'radialGradient');
    };
    BackgroundPass.prototype.isReady = function () {
        return !!((this.skybox && this.skybox.loaded) ||
            (this.image && this.image.loaded) ||
            this.renderable.values.dVariant.ref.value === 'horizontalGradient' ||
            this.renderable.values.dVariant.ref.value === 'radialGradient');
    };
    BackgroundPass.prototype.render = function () {
        if (!this.isReady())
            return;
        if (this.renderable.values.dVariant.ref.value === 'image') {
            this.updateImageScaling();
        }
        if (isTimingMode)
            this.webgl.timer.mark('BackgroundPass.render');
        this.renderable.render();
        if (isTimingMode)
            this.webgl.timer.markEnd('BackgroundPass.render');
    };
    BackgroundPass.prototype.dispose = function () {
        this.clearSkybox();
        this.clearImage();
    };
    return BackgroundPass;
}());
export { BackgroundPass };
//
var SkyboxName = 'background-skybox';
function getCubeAssets(assetManager, faces) {
    if (faces.name === 'urls') {
        return {
            nx: Asset.getUrlAsset(assetManager, faces.params.nx),
            ny: Asset.getUrlAsset(assetManager, faces.params.ny),
            nz: Asset.getUrlAsset(assetManager, faces.params.nz),
            px: Asset.getUrlAsset(assetManager, faces.params.px),
            py: Asset.getUrlAsset(assetManager, faces.params.py),
            pz: Asset.getUrlAsset(assetManager, faces.params.pz),
        };
    }
    else {
        return {
            nx: faces.params.nx,
            ny: faces.params.ny,
            nz: faces.params.nz,
            px: faces.params.px,
            py: faces.params.py,
            pz: faces.params.pz,
        };
    }
}
function getCubeFaces(assetManager, cubeAssets) {
    var resolve = function (asset) {
        return assetManager.resolve(asset, 'binary').run().then(function (a) { return new Blob([a.data]); });
    };
    return {
        nx: resolve(cubeAssets.nx),
        ny: resolve(cubeAssets.ny),
        nz: resolve(cubeAssets.nz),
        px: resolve(cubeAssets.px),
        py: resolve(cubeAssets.py),
        pz: resolve(cubeAssets.pz),
    };
}
function getSkyboxHash(faces) {
    var _a, _b, _c, _d, _e, _f;
    if (faces.name === 'urls') {
        return "".concat(SkyboxName, "_").concat(faces.params.nx, "|").concat(faces.params.ny, "|").concat(faces.params.nz, "|").concat(faces.params.px, "|").concat(faces.params.py, "|").concat(faces.params.pz);
    }
    else {
        return "".concat(SkyboxName, "_").concat((_a = faces.params.nx) === null || _a === void 0 ? void 0 : _a.id, "|").concat((_b = faces.params.ny) === null || _b === void 0 ? void 0 : _b.id, "|").concat((_c = faces.params.nz) === null || _c === void 0 ? void 0 : _c.id, "|").concat((_d = faces.params.px) === null || _d === void 0 ? void 0 : _d.id, "|").concat((_e = faces.params.py) === null || _e === void 0 ? void 0 : _e.id, "|").concat((_f = faces.params.pz) === null || _f === void 0 ? void 0 : _f.id);
    }
}
function areSkyboxTexturePropsEqual(facesA, facesB) {
    return getSkyboxHash(facesA) === getSkyboxHash(facesB);
}
function getSkyboxTexture(ctx, assetManager, faces, onload) {
    var cubeAssets = getCubeAssets(assetManager, faces);
    var cubeFaces = getCubeFaces(assetManager, cubeAssets);
    var assets = [cubeAssets.nx, cubeAssets.ny, cubeAssets.nz, cubeAssets.px, cubeAssets.py, cubeAssets.pz];
    var texture = ctx.resources.cubeTexture(cubeFaces, true, onload);
    return { texture: texture, assets: assets };
}
//
var ImageName = 'background-image';
function getImageHash(source) {
    var _a;
    if (source.name === 'url') {
        return "".concat(ImageName, "_").concat(source.params);
    }
    else {
        return "".concat(ImageName, "_").concat((_a = source.params) === null || _a === void 0 ? void 0 : _a.id);
    }
}
function areImageTexturePropsEqual(sourceA, sourceB) {
    return getImageHash(sourceA) === getImageHash(sourceB);
}
function getImageTexture(ctx, assetManager, source, onload) {
    var texture = ctx.resources.texture('image-uint8', 'rgba', 'ubyte', 'linear');
    var img = new Image();
    img.onload = function () {
        texture.load(img);
        if (ctx.isWebGL2 || (isPowerOfTwo(img.width) && isPowerOfTwo(img.height))) {
            texture.mipmap();
        }
        onload === null || onload === void 0 ? void 0 : onload();
    };
    img.onerror = function () {
        onload === null || onload === void 0 ? void 0 : onload(true);
    };
    var asset = source.name === 'url'
        ? Asset.getUrlAsset(assetManager, source.params)
        : source.params;
    assetManager.resolve(asset, 'binary').run().then(function (a) {
        var blob = new Blob([a.data]);
        img.src = URL.createObjectURL(blob);
    });
    return { texture: texture, asset: asset };
}
//
var BackgroundSchema = {
    drawCount: ValueSpec('number'),
    instanceCount: ValueSpec('number'),
    aPosition: AttributeSpec('float32', 2, 0),
    tSkybox: TextureSpec('texture', 'rgba', 'ubyte', 'linear'),
    tImage: TextureSpec('texture', 'rgba', 'ubyte', 'linear'),
    uImageScale: UniformSpec('v2'),
    uImageOffset: UniformSpec('v2'),
    uTexSize: UniformSpec('v2'),
    uViewport: UniformSpec('v4'),
    uViewportAdjusted: UniformSpec('b'),
    uViewDirectionProjectionInverse: UniformSpec('m4'),
    uGradientColorA: UniformSpec('v3'),
    uGradientColorB: UniformSpec('v3'),
    uGradientRatio: UniformSpec('f'),
    uBlur: UniformSpec('f'),
    uOpacity: UniformSpec('f'),
    uSaturation: UniformSpec('f'),
    uLightness: UniformSpec('f'),
    dVariant: DefineSpec('string', ['skybox', 'image', 'verticalGradient', 'horizontalGradient', 'radialGradient']),
};
var SkyboxShaderCode = ShaderCode('background', background_vert, background_frag, {
    shaderTextureLod: 'optional'
});
function getBackgroundRenderable(ctx, width, height) {
    var values = {
        drawCount: ValueCell.create(6),
        instanceCount: ValueCell.create(1),
        aPosition: ValueCell.create(QuadPositions),
        tSkybox: ValueCell.create(createNullTexture()),
        tImage: ValueCell.create(createNullTexture()),
        uImageScale: ValueCell.create(Vec2()),
        uImageOffset: ValueCell.create(Vec2()),
        uTexSize: ValueCell.create(Vec2.create(width, height)),
        uViewport: ValueCell.create(Vec4()),
        uViewportAdjusted: ValueCell.create(true),
        uViewDirectionProjectionInverse: ValueCell.create(Mat4()),
        uGradientColorA: ValueCell.create(Vec3()),
        uGradientColorB: ValueCell.create(Vec3()),
        uGradientRatio: ValueCell.create(0.5),
        uBlur: ValueCell.create(0),
        uOpacity: ValueCell.create(1),
        uSaturation: ValueCell.create(0),
        uLightness: ValueCell.create(0),
        dVariant: ValueCell.create('skybox'),
    };
    var schema = __assign({}, BackgroundSchema);
    var renderItem = createComputeRenderItem(ctx, 'triangles', SkyboxShaderCode, schema, values);
    return createComputeRenderable(renderItem, values);
}
