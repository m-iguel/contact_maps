/**
 * Copyright (c) 2021 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { createContext } from '../webgl/context';
export function getGLContext(width, height) {
    var gl = require('gl')(width, height, {
        alpha: true,
        depth: true,
        premultipliedAlpha: true,
        preserveDrawingBuffer: true,
        antialias: true,
    });
    return createContext(gl);
}
export function tryGetGLContext(width, height, requiredExtensions) {
    try {
        var ctx = getGLContext(width, height);
        if ((requiredExtensions === null || requiredExtensions === void 0 ? void 0 : requiredExtensions.fragDepth) && !ctx.extensions.fragDepth)
            return;
        return ctx;
    }
    catch (e) {
        return;
    }
}
