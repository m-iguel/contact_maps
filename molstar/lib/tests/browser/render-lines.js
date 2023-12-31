/**
 * Copyright (c) 2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import './index.html';
import { resizeCanvas } from '../../mol-canvas3d/util';
import { Canvas3D, Canvas3DContext } from '../../mol-canvas3d/canvas3d';
import { LinesBuilder } from '../../mol-geo/geometry/lines/lines-builder';
import { Mat4 } from '../../mol-math/linear-algebra';
import { DodecahedronCage } from '../../mol-geo/primitive/dodecahedron';
import { Lines } from '../../mol-geo/geometry/lines/lines';
import { Color } from '../../mol-util/color';
import { createRenderObject } from '../../mol-gl/render-object';
import { Representation } from '../../mol-repr/representation';
import { ParamDefinition } from '../../mol-util/param-definition';
import { AssetManager } from '../../mol-util/assets';
var parent = document.getElementById('app');
parent.style.width = '100%';
parent.style.height = '100%';
var canvas = document.createElement('canvas');
parent.appendChild(canvas);
resizeCanvas(canvas, parent);
var assetManager = new AssetManager();
var canvas3d = Canvas3D.create(Canvas3DContext.fromCanvas(canvas, assetManager));
canvas3d.animate();
function linesRepr() {
    var linesBuilder = LinesBuilder.create();
    var t = Mat4.identity();
    var dodecahedronCage = DodecahedronCage();
    linesBuilder.addCage(t, dodecahedronCage, 0);
    var lines = linesBuilder.getLines();
    var props = ParamDefinition.getDefaultValues(Lines.Utils.Params);
    var values = Lines.Utils.createValuesSimple(lines, props, Color(0xFF0000), 3);
    var state = Lines.Utils.createRenderableState(props);
    var renderObject = createRenderObject('lines', values, state, -1);
    var repr = Representation.fromRenderObject('cage-lines', renderObject);
    return repr;
}
canvas3d.add(linesRepr());
canvas3d.requestCameraReset();
