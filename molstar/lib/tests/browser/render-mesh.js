/**
 * Copyright (c) 2019-2021 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import './index.html';
import { resizeCanvas } from '../../mol-canvas3d/util';
import { Canvas3D, Canvas3DContext } from '../../mol-canvas3d/canvas3d';
import { MeshBuilder } from '../../mol-geo/geometry/mesh/mesh-builder';
import { Mat4 } from '../../mol-math/linear-algebra';
import { HexagonalPrismCage } from '../../mol-geo/primitive/prism';
import { SpikedBall } from '../../mol-geo/primitive/spiked-ball';
import { Mesh } from '../../mol-geo/geometry/mesh/mesh';
import { Color } from '../../mol-util/color';
import { createRenderObject } from '../../mol-gl/render-object';
import { Representation } from '../../mol-repr/representation';
import { Torus } from '../../mol-geo/primitive/torus';
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
function meshRepr() {
    var builderState = MeshBuilder.createState();
    var t = Mat4.identity();
    Mat4.scaleUniformly(t, t, 10);
    MeshBuilder.addCage(builderState, t, HexagonalPrismCage(), 0.05, 2, 20);
    var t2 = Mat4.identity();
    Mat4.scaleUniformly(t2, t2, 1);
    MeshBuilder.addPrimitive(builderState, t2, SpikedBall(3));
    var t3 = Mat4.identity();
    Mat4.scaleUniformly(t3, t3, 8);
    MeshBuilder.addPrimitive(builderState, t3, Torus({ tubularSegments: 64, radialSegments: 32, tube: 0.1 }));
    var mesh = MeshBuilder.getMesh(builderState);
    var props = ParamDefinition.getDefaultValues(Mesh.Utils.Params);
    var values = Mesh.Utils.createValuesSimple(mesh, props, Color(0xFF4433), 1);
    var state = Mesh.Utils.createRenderableState(props);
    var renderObject = createRenderObject('mesh', values, state, -1);
    console.log('mesh', renderObject);
    var repr = Representation.fromRenderObject('mesh', renderObject);
    return repr;
}
canvas3d.add(meshRepr());
canvas3d.requestCameraReset();
