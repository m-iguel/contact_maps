/**
 * Copyright (c) 2018-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { idFactory } from '../../mol-util/id-factory';
var getNextVertexArrayId = idFactory();
function getVertexArray(extensions) {
    var vertexArrayObject = extensions.vertexArrayObject;
    if (!vertexArrayObject) {
        throw new Error('VertexArrayObject not supported');
    }
    var vertexArray = vertexArrayObject.createVertexArray();
    if (!vertexArray) {
        throw new Error('Could not create WebGL vertex array');
    }
    return vertexArray;
}
function getVertexArrayObject(extensions) {
    var vertexArrayObject = extensions.vertexArrayObject;
    if (vertexArrayObject === null) {
        throw new Error('VertexArrayObject not supported');
    }
    return vertexArrayObject;
}
export function createVertexArray(gl, extensions, program, attributeBuffers, elementsBuffer) {
    var id = getNextVertexArrayId();
    var vertexArray = getVertexArray(extensions);
    var vertexArrayObject = getVertexArrayObject(extensions);
    function update() {
        vertexArrayObject.bindVertexArray(vertexArray);
        if (elementsBuffer)
            elementsBuffer.bind();
        program.bindAttributes(attributeBuffers);
        vertexArrayObject.bindVertexArray(null);
    }
    update();
    var destroyed = false;
    return {
        id: id,
        bind: function () {
            vertexArrayObject.bindVertexArray(vertexArray);
        },
        update: update,
        reset: function () {
            vertexArray = getVertexArray(extensions);
            vertexArrayObject = getVertexArrayObject(extensions);
            update();
        },
        destroy: function () {
            if (destroyed)
                return;
            if (elementsBuffer) {
                // workaround for ANGLE/Chromium bug
                // - https://bugs.chromium.org/p/angleproject/issues/detail?id=6599
                // - https://bugs.chromium.org/p/chromium/issues/detail?id=1272238
                vertexArrayObject.bindVertexArray(vertexArray);
                gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
            }
            vertexArrayObject.deleteVertexArray(vertexArray);
            destroyed = true;
        }
    };
}
