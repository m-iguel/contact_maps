import { __assign, __spreadArray } from "tslib";
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * Copyright (c) 2020-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import * as React from 'react';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { shallowEqual } from '../../mol-util/object';
import { useBehavior } from '../hooks/use-behavior';
var _ScreenshotPreview = function (props) {
    var plugin = props.plugin, cropFrameColor = props.cropFrameColor;
    var helper = plugin.helpers.viewportScreenshot;
    var _a = useState(null), currentCanvas = _a[0], setCurrentCanvas = _a[1];
    var canvasRef = useRef(null);
    var propsRef = useRef(props);
    useEffect(function () {
        propsRef.current = props;
    }, Object.values(props));
    useEffect(function () {
        if (currentCanvas !== canvasRef.current) {
            setCurrentCanvas(canvasRef.current);
        }
    });
    useEffect(function () {
        var _a;
        var isDirty = false;
        var subs = [];
        function subscribe(xs, f) {
            if (!xs)
                return;
            subs.push(xs.subscribe(f));
        }
        function preview() {
            var p = propsRef.current;
            if (!p.suspend && canvasRef.current) {
                drawPreview(helper, canvasRef.current, p.customBackground, p.borderColor, p.borderWidth);
            }
            if (!canvasRef.current)
                isDirty = true;
        }
        var interval = setInterval(function () {
            if (isDirty) {
                isDirty = false;
                preview();
            }
        }, 1000 / 8);
        subscribe(plugin.events.canvas3d.settingsUpdated, function () { return isDirty = true; });
        subscribe((_a = plugin.canvas3d) === null || _a === void 0 ? void 0 : _a.didDraw, function () { return isDirty = true; });
        subscribe(plugin.state.data.behaviors.isUpdating, function (v) {
            if (!v)
                isDirty = true;
        });
        subscribe(helper === null || helper === void 0 ? void 0 : helper.behaviors.values, function () { return isDirty = true; });
        subscribe(helper === null || helper === void 0 ? void 0 : helper.behaviors.cropParams, function () { return isDirty = true; });
        var resizeObserver = void 0;
        if (typeof ResizeObserver !== 'undefined') {
            resizeObserver = new ResizeObserver(function () { return isDirty = true; });
        }
        var canvas = canvasRef.current;
        resizeObserver === null || resizeObserver === void 0 ? void 0 : resizeObserver.observe(canvas);
        preview();
        return function () {
            clearInterval(interval);
            subs.forEach(function (s) { return s.unsubscribe(); });
            resizeObserver === null || resizeObserver === void 0 ? void 0 : resizeObserver.unobserve(canvas);
        };
    }, [helper]);
    useLayoutEffect(function () {
        if (canvasRef.current) {
            drawPreview(helper, canvasRef.current, props.customBackground, props.borderColor, props.borderWidth);
        }
    }, __spreadArray([], Object.values(props), true));
    return _jsx(_Fragment, { children: _jsxs("div", { style: { position: 'relative', width: '100%', height: '100%' }, children: [_jsx("canvas", { ref: canvasRef, onContextMenu: function (e) { e.preventDefault(); e.stopPropagation(); }, style: { display: 'block', width: '100%', height: '100%' } }), _jsx(ViewportFrame, { plugin: plugin, canvas: currentCanvas, color: cropFrameColor })] }) });
};
export var ScreenshotPreview = React.memo(_ScreenshotPreview, function (prev, next) { return shallowEqual(prev, next); });
function drawPreview(helper, target, customBackground, borderColor, borderWidth) {
    if (!helper)
        return;
    var _a = helper.getPreview(), canvas = _a.canvas, width = _a.width, height = _a.height;
    var ctx = target.getContext('2d');
    if (!ctx)
        return;
    var w = target.clientWidth;
    var h = target.clientHeight;
    target.width = w;
    target.height = h;
    ctx.clearRect(0, 0, w, h);
    var frame = getViewportFrame(width, height, w, h);
    if (customBackground) {
        ctx.fillStyle = customBackground;
        ctx.fillRect(frame.x, frame.y, frame.width, frame.height);
    }
    else if (helper.values.transparent) {
        // must be an odd number
        var s = 13;
        for (var i = 0; i < frame.width; i += s) {
            for (var j = 0; j < frame.height; j += s) {
                ctx.fillStyle = (i + j) % 2 ? '#ffffff' : '#bfbfbf';
                var x = frame.x + i, y = frame.y + j;
                var w_1 = i + s > frame.width ? frame.width - i : s;
                var h_1 = j + s > frame.height ? frame.height - j : s;
                ctx.fillRect(x, y, w_1, h_1);
            }
        }
    }
    ctx.drawImage(canvas, frame.x, frame.y, frame.width, frame.height);
    if (borderColor && borderWidth) {
        var w_2 = borderWidth;
        ctx.rect(frame.x, frame.y, frame.width, frame.height);
        ctx.rect(frame.x + w_2, frame.y + w_2, frame.width - 2 * w_2, frame.height - 2 * w_2);
        ctx.fillStyle = borderColor;
        ctx.fill('evenodd');
    }
}
function ViewportFrame(_a) {
    var _b;
    var plugin = _a.plugin, canvas = _a.canvas, _c = _a.color, color = _c === void 0 ? 'rgba(255, 87, 45, 0.75)' : _c;
    var helper = plugin.helpers.viewportScreenshot;
    var params = useBehavior(helper === null || helper === void 0 ? void 0 : helper.behaviors.values);
    var cropParams = useBehavior(helper === null || helper === void 0 ? void 0 : helper.behaviors.cropParams);
    var crop = useBehavior(helper === null || helper === void 0 ? void 0 : helper.behaviors.relativeCrop);
    var cropFrameRef = useRef({ x: 0, y: 0, width: 0, height: 0 });
    useBehavior((params === null || params === void 0 ? void 0 : params.resolution.name) === 'viewport' ? (_b = plugin.canvas3d) === null || _b === void 0 ? void 0 : _b.resized : void 0);
    var _d = React.useState(''), drag = _d[0], setDrag = _d[1];
    var _e = useState([0, 0]), start = _e[0], setStart = _e[1];
    var _f = useState([0, 0]), current = _f[0], setCurrent = _f[1];
    if (!helper || !canvas || !crop)
        return null;
    var _g = helper.getSizeAndViewport(), width = _g.width, height = _g.height;
    var frame = getViewportFrame(width, height, canvas.clientWidth, canvas.clientHeight);
    var cropFrame = {
        x: frame.x + Math.floor(frame.width * crop.x),
        y: frame.y + Math.floor(frame.height * crop.y),
        width: Math.ceil(frame.width * crop.width),
        height: Math.ceil(frame.height * crop.height)
    };
    var rectCrop = toRect(cropFrame);
    var rectFrame = toRect(frame);
    if (drag === 'move') {
        rectCrop.l += current[0] - start[0];
        rectCrop.r += current[0] - start[0];
        rectCrop.t += current[1] - start[1];
        rectCrop.b += current[1] - start[1];
    }
    else if (drag) {
        if (drag.indexOf('left') >= 0) {
            rectCrop.l += current[0] - start[0];
        }
        else if (drag.indexOf('right') >= 0) {
            rectCrop.r += current[0] - start[0];
        }
        if (drag.indexOf('top') >= 0) {
            rectCrop.t += current[1] - start[1];
        }
        else if (drag.indexOf('bottom') >= 0) {
            rectCrop.b += current[1] - start[1];
        }
    }
    if (rectCrop.l > rectCrop.r) {
        var t = rectCrop.l;
        rectCrop.l = rectCrop.r;
        rectCrop.r = t;
    }
    if (rectCrop.t > rectCrop.b) {
        var t = rectCrop.t;
        rectCrop.t = rectCrop.b;
        rectCrop.b = t;
    }
    var pad = 40;
    rectCrop.l = Math.min(rectFrame.r - pad, Math.max(rectFrame.l, rectCrop.l));
    rectCrop.r = Math.max(rectFrame.l + pad, Math.min(rectFrame.r, rectCrop.r));
    rectCrop.t = Math.min(rectFrame.b - pad, Math.max(rectFrame.t, rectCrop.t));
    rectCrop.b = Math.max(rectFrame.t + pad, Math.min(rectFrame.b, rectCrop.b));
    cropFrame.x = rectCrop.l;
    cropFrame.y = rectCrop.t;
    cropFrame.width = rectCrop.r - rectCrop.l + 1;
    cropFrame.height = rectCrop.b - rectCrop.t + 1;
    cropFrameRef.current = cropFrame;
    var onMove = function (e) {
        e.preventDefault();
        setCurrent([e.pageX, e.pageY]);
    };
    var onTouchMove = function (e) {
        e.preventDefault();
        var t = e.touches[0];
        setCurrent([t.pageX, t.pageY]);
    };
    var onTouchStart = function (e) {
        e.preventDefault();
        setDrag(e.currentTarget.getAttribute('data-drag'));
        var t = e.touches[0];
        var p = [t.pageX, t.pageY];
        setStart(p);
        setCurrent(p);
        window.addEventListener('touchend', onTouchEnd);
        window.addEventListener('touchmove', onTouchMove);
    };
    var onStart = function (e) {
        e.preventDefault();
        setDrag(e.currentTarget.getAttribute('data-drag'));
        var p = [e.pageX, e.pageY];
        setStart(p);
        setCurrent(p);
        window.addEventListener('mouseup', onEnd);
        window.addEventListener('mousemove', onMove);
    };
    var onEnd = function () {
        window.removeEventListener('mouseup', onEnd);
        window.removeEventListener('mousemove', onMove);
        finish();
    };
    var onTouchEnd = function () {
        window.removeEventListener('touchend', onTouchEnd);
        window.removeEventListener('touchmove', onTouchMove);
        finish();
    };
    function finish() {
        var cropFrame = cropFrameRef.current;
        if (cropParams === null || cropParams === void 0 ? void 0 : cropParams.auto) {
            helper === null || helper === void 0 ? void 0 : helper.behaviors.cropParams.next(__assign(__assign({}, cropParams), { auto: false }));
        }
        helper === null || helper === void 0 ? void 0 : helper.behaviors.relativeCrop.next({
            x: (cropFrame.x - frame.x) / frame.width,
            y: (cropFrame.y - frame.y) / frame.height,
            width: cropFrame.width / frame.width,
            height: cropFrame.height / frame.height
        });
        setDrag('');
        var p = [0, 0];
        setStart(p);
        setCurrent(p);
    }
    var contextMenu = function (e) {
        e.preventDefault();
        e.stopPropagation();
    };
    var d = 4;
    var border = "3px solid ".concat(color);
    var transparent = 'transparent';
    return _jsxs(_Fragment, { children: [_jsx("div", { "data-drag": 'move', style: { position: 'absolute', left: cropFrame.x, top: cropFrame.y, width: cropFrame.width, height: cropFrame.height, border: border, cursor: 'move' }, onMouseDown: onStart, onTouchStart: onTouchStart, draggable: false, onContextMenu: contextMenu }), _jsx("div", { "data-drag": 'left', style: { position: 'absolute', left: cropFrame.x - d, top: cropFrame.y + d, width: 4 * d, height: cropFrame.height - d, background: transparent, cursor: 'w-resize' }, onMouseDown: onStart, onTouchStart: onTouchStart, draggable: false, onContextMenu: contextMenu }), _jsx("div", { "data-drag": 'right', style: { position: 'absolute', left: rectCrop.r - 2 * d, top: cropFrame.y, width: 4 * d, height: cropFrame.height - d, background: transparent, cursor: 'w-resize' }, onMouseDown: onStart, onTouchStart: onTouchStart, draggable: false, onContextMenu: contextMenu }), _jsx("div", { "data-drag": 'top', style: { position: 'absolute', left: cropFrame.x - d, top: cropFrame.y - d, width: cropFrame.width + 2 * d, height: 4 * d, background: transparent, cursor: 'n-resize' }, onMouseDown: onStart, onTouchStart: onTouchStart, draggable: false, onContextMenu: contextMenu }), _jsx("div", { "data-drag": 'bottom', style: { position: 'absolute', left: cropFrame.x - d, top: rectCrop.b - 2 * d, width: cropFrame.width + 2 * d, height: 4 * d, background: transparent, cursor: 'n-resize' }, onMouseDown: onStart, onTouchStart: onTouchStart, draggable: false, onContextMenu: contextMenu }), _jsx("div", { "data-drag": 'top, left', style: { position: 'absolute', left: rectCrop.l - d, top: rectCrop.t - d, width: 4 * d, height: 4 * d, background: transparent, cursor: 'nw-resize' }, onMouseDown: onStart, onTouchStart: onTouchStart, draggable: false, onContextMenu: contextMenu }), _jsx("div", { "data-drag": 'bottom, right', style: { position: 'absolute', left: rectCrop.r - 2 * d, top: rectCrop.b - 2 * d, width: 4 * d, height: 4 * d, background: transparent, cursor: 'nw-resize' }, onMouseDown: onStart, onTouchStart: onTouchStart, draggable: false, onContextMenu: contextMenu }), _jsx("div", { "data-drag": 'top, right', style: { position: 'absolute', left: rectCrop.r - 2 * d, top: rectCrop.t - d, width: 4 * d, height: 4 * d, background: transparent, cursor: 'ne-resize' }, onMouseDown: onStart, onTouchStart: onTouchStart, draggable: false, onContextMenu: contextMenu }), _jsx("div", { "data-drag": 'bottom, left', style: { position: 'absolute', left: rectCrop.l - d, top: rectCrop.b - 2 * d, width: 4 * d, height: 4 * d, background: transparent, cursor: 'ne-resize' }, onMouseDown: onStart, onTouchStart: onTouchStart, draggable: false, onContextMenu: contextMenu })] });
}
function toRect(viewport) {
    return { l: viewport.x, t: viewport.y, r: viewport.x + viewport.width - 1, b: viewport.y + viewport.height - 1 };
}
function getViewportFrame(srcWidth, srcHeight, w, h) {
    var a0 = srcWidth / srcHeight;
    var a1 = w / h;
    if (a0 <= a1) {
        var t = h * a0;
        return { x: Math.round((w - t) / 2), y: 0, width: Math.round(t), height: h };
    }
    else {
        var t = w / a0;
        return { x: 0, y: Math.round((h - t) / 2), width: w, height: Math.round(t) };
    }
}
