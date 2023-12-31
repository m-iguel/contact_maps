/**
 * Copyright (c) 2020-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { __assign } from "tslib";
import { createProgram } from './program';
import { createShader } from './shader';
import { createFramebuffer } from './framebuffer';
import { createAttributeBuffer, createElementsBuffer } from './buffer';
import { createReferenceCache } from '../../mol-util/reference-cache';
import { hashString, hashFnv32a } from '../../mol-data/util';
import { createRenderbuffer } from './renderbuffer';
import { createTexture, createCubeTexture } from './texture';
import { createVertexArray } from './vertex-array';
function defineValueHash(v) {
    return typeof v === 'boolean' ? (v ? 1 : 0) :
        typeof v === 'number' ? (v * 10000) : hashString(v);
}
function wrapCached(resourceItem) {
    var wrapped = __assign(__assign({}, resourceItem.value), { destroy: function () {
            resourceItem.free();
        } });
    return wrapped;
}
export function createResources(gl, state, stats, extensions) {
    var sets = {
        attribute: new Set(),
        elements: new Set(),
        framebuffer: new Set(),
        program: new Set(),
        renderbuffer: new Set(),
        shader: new Set(),
        texture: new Set(),
        cubeTexture: new Set(),
        vertexArray: new Set(),
    };
    function wrap(name, resource) {
        sets[name].add(resource);
        stats.resourceCounts[name] += 1;
        return __assign(__assign({}, resource), { destroy: function () {
                resource.destroy();
                sets[name].delete(resource);
                stats.resourceCounts[name] -= 1;
            } });
    }
    var shaderCache = createReferenceCache(function (props) { return JSON.stringify(props); }, function (props) { return wrap('shader', createShader(gl, props)); }, function (shader) { shader.destroy(); });
    function getShader(type, source) {
        return wrapCached(shaderCache.get({ type: type, source: source }));
    }
    var programCache = createReferenceCache(function (props) {
        var _a;
        var array = [props.shaderCode.id];
        var variant = (((_a = props.defineValues.dRenderVariant) === null || _a === void 0 ? void 0 : _a.ref.value) || '');
        Object.keys(props.defineValues).forEach(function (k) {
            var _a, _b;
            if (!((_b = (_a = props.shaderCode).ignoreDefine) === null || _b === void 0 ? void 0 : _b.call(_a, k, variant, props.defineValues))) {
                array.push(hashString(k), defineValueHash(props.defineValues[k].ref.value));
            }
        });
        return hashFnv32a(array).toString();
    }, function (props) { return wrap('program', createProgram(gl, state, extensions, getShader, props)); }, function (program) { program.destroy(); });
    return {
        attribute: function (array, itemSize, divisor, usageHint) {
            return wrap('attribute', createAttributeBuffer(gl, state, extensions, array, itemSize, divisor, usageHint));
        },
        elements: function (array, usageHint) {
            return wrap('elements', createElementsBuffer(gl, array, usageHint));
        },
        framebuffer: function () {
            return wrap('framebuffer', createFramebuffer(gl));
        },
        program: function (defineValues, shaderCode, schema) {
            return wrapCached(programCache.get({ defineValues: defineValues, shaderCode: shaderCode, schema: schema }));
        },
        renderbuffer: function (format, attachment, width, height) {
            return wrap('renderbuffer', createRenderbuffer(gl, format, attachment, width, height));
        },
        shader: getShader,
        texture: function (kind, format, type, filter) {
            return wrap('texture', createTexture(gl, extensions, kind, format, type, filter));
        },
        cubeTexture: function (faces, mipmaps, onload) {
            return wrap('cubeTexture', createCubeTexture(gl, faces, mipmaps, onload));
        },
        vertexArray: function (program, attributeBuffers, elementsBuffer) {
            return wrap('vertexArray', createVertexArray(gl, extensions, program, attributeBuffers, elementsBuffer));
        },
        getByteCounts: function () {
            var texture = 0;
            sets.texture.forEach(function (r) {
                texture += r.getByteCount();
            });
            sets.cubeTexture.forEach(function (r) {
                texture += r.getByteCount();
            });
            var attribute = 0;
            sets.attribute.forEach(function (r) {
                attribute += r.length * 4;
            });
            var elements = 0;
            sets.elements.forEach(function (r) {
                elements += r.length * 4;
            });
            return { texture: texture, attribute: attribute, elements: elements };
        },
        reset: function () {
            sets.attribute.forEach(function (r) { return r.reset(); });
            sets.elements.forEach(function (r) { return r.reset(); });
            sets.framebuffer.forEach(function (r) { return r.reset(); });
            sets.renderbuffer.forEach(function (r) { return r.reset(); });
            sets.shader.forEach(function (r) { return r.reset(); });
            sets.program.forEach(function (r) { return r.reset(); });
            sets.vertexArray.forEach(function (r) { return r.reset(); });
            sets.texture.forEach(function (r) { return r.reset(); });
        },
        destroy: function () {
            sets.attribute.forEach(function (r) { return r.destroy(); });
            sets.elements.forEach(function (r) { return r.destroy(); });
            sets.framebuffer.forEach(function (r) { return r.destroy(); });
            sets.renderbuffer.forEach(function (r) { return r.destroy(); });
            sets.shader.forEach(function (r) { return r.destroy(); });
            sets.program.forEach(function (r) { return r.destroy(); });
            sets.vertexArray.forEach(function (r) { return r.destroy(); });
            sets.texture.forEach(function (r) { return r.destroy(); });
            shaderCache.clear();
            programCache.clear();
        }
    };
}
