/**
 * Copyright (c) 2019-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { __assign, __awaiter, __generator } from "tslib";
import { createPluginUI } from '../../mol-plugin-ui/react18';
import { DefaultPluginUISpec } from '../../mol-plugin-ui/spec';
import { PluginCommands } from '../../mol-plugin/commands';
import { Asset } from '../../mol-util/assets';
import { Color } from '../../mol-util/color';
import './index.html';
import { PluginStateObject } from '../../mol-plugin-state/objects';
import { StateTransformer } from '../../../lib/mol-state/transformer';
import { ParamDefinition } from '../../mol-util/param-definition';
import { Vec3 } from '../../mol-math/linear-algebra';
import { StateTransforms } from '../../mol-plugin-state/transforms';
import { Mesh } from '../../mol-geo/geometry/mesh/mesh';
import { MeshBuilder } from '../../mol-geo/geometry/mesh/mesh-builder';
import { addFixedCountDashedCylinder } from '../../mol-geo/geometry/mesh/builder/cylinder';
import { Shape } from '../../mol-model/shape';
require('mol-plugin-ui/skin/light.scss');
// Provided code
var Transform = StateTransformer.builderFactory('my-namespace'); // change the namespaces here
var CreateAtomPairsProvider = Transform({
    name: 'draw-lines-provider',
    display: { name: 'Atom Pairs' },
    from: PluginStateObject.Root,
    to: PluginStateObject.Shape.Provider,
    params: {
        lines: ParamDefinition.Value([], { isHidden: true })
    }
})({
    apply: function (_a) {
        var params = _a.params;
        return new PluginStateObject.Shape.Provider({
            label: 'Pairs',
            data: { lines: params.lines },
            params: Mesh.Params,
            geometryUtils: Mesh.Utils,
            getShape: function (_, data) { return createLinesShape(data); }
        }, { label: 'Lines' });
    }
});
function createLinesShape(_a) {
    var lines = _a.lines;
    var lineRadius = 0.08;
    var builder = MeshBuilder.createState(512, 512);
    for (var i = 0; i < lines.length; i++) {
        builder.currentGroup = i;
        var l = lines[i];
        var dist = Vec3.distance(l.a, l.b);
        addFixedCountDashedCylinder(builder, l.a, l.b, 1, Math.ceil(dist * 4) + 1, true, { bottomCap: true, topCap: true, radiusBottom: lineRadius, radiusTop: lineRadius });
    }
    return Shape.create('Atom Pairs', {}, MeshBuilder.getMesh(builder), function (g) { return lines[g].color; }, function () { return 1; }, function (g) { return "Distance: ".concat(round(Vec3.distance(lines[g].a, lines[g].b), 2), " Ang"); });
}
var Canvas3DPresets = {
    illustrative: {
        canvas3d: {
            postprocessing: {
                occlusion: {
                    name: 'on',
                    params: {
                        samples: 32,
                        multiScale: { name: 'off', params: {} },
                        radius: 5,
                        bias: 0.8,
                        blurKernelSize: 15,
                        resolutionScale: 5,
                        color: Color(0x00000000),
                    }
                },
                outline: {
                    name: 'on',
                    params: {
                        scale: 1,
                        threshold: 0.33,
                        color: Color(0x000000),
                        includeTransparent: true,
                    }
                },
                shadow: {
                    name: 'on',
                    params: { color: Color(0x000000) }
                },
            },
            renderer: {
                ambientIntensity: 1.0,
                light: []
            }
        }
    },
};
var LightingDemo = /** @class */ (function () {
    function LightingDemo() {
        this.radius = 5;
        this.bias = 1.1;
        this.preset = 'illustrative';
    }
    // Method to initialize the plugin
    LightingDemo.prototype.init = function (target) {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = this;
                        return [4 /*yield*/, createPluginUI(typeof target === 'string' ? document.getElementById(target) : target, __assign(__assign({}, DefaultPluginUISpec()), { layout: {
                                    initial: {
                                        isExpanded: false,
                                        showControls: false
                                    },
                                }, components: {
                                    controls: { left: 'none', right: 'none', top: 'none', bottom: 'none' }
                                } }))];
                    case 1:
                        _a.plugin = _b.sent();
                        this.setPreset('illustrative');
                        return [2 /*return*/];
                }
            });
        });
    };
    // Method to set the preset of the 3D canvas
    LightingDemo.prototype.setPreset = function (preset) {
        var _a;
        var props = Canvas3DPresets[preset];
        if (((_a = props.canvas3d.postprocessing.occlusion) === null || _a === void 0 ? void 0 : _a.name) === 'on') {
            props.canvas3d.postprocessing.occlusion.params.radius = this.radius;
            props.canvas3d.postprocessing.occlusion.params.bias = this.bias;
        }
        PluginCommands.Canvas3D.SetSettings(this.plugin, {
            settings: __assign(__assign({}, props), { renderer: __assign(__assign({}, this.plugin.canvas3d.props.renderer), props.canvas3d.renderer), postprocessing: __assign(__assign({}, this.plugin.canvas3d.props.postprocessing), props.canvas3d.postprocessing) })
        });
    };
    // Method to load and render the structure from a URL
    LightingDemo.prototype.load = function (_a, radius, bias) {
        var url = _a.url, _b = _a.format, format = _b === void 0 ? 'pdb' : _b, _c = _a.isBinary, isBinary = _c === void 0 ? true : _c, _d = _a.assemblyId, assemblyId = _d === void 0 ? '' : _d;
        return __awaiter(this, void 0, void 0, function () {
            var data, trajectory, model, structure, polymer, myLinesData, update;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0: return [4 /*yield*/, this.plugin.clear()];
                    case 1:
                        _e.sent();
                        return [4 /*yield*/, this.plugin.builders.data.download({ url: Asset.Url(url), isBinary: isBinary }, { state: { isGhost: true } })];
                    case 2:
                        data = _e.sent();
                        return [4 /*yield*/, this.plugin.builders.structure.parseTrajectory(data, format)];
                    case 3:
                        trajectory = _e.sent();
                        return [4 /*yield*/, this.plugin.builders.structure.createModel(trajectory)];
                    case 4:
                        model = _e.sent();
                        return [4 /*yield*/, this.plugin.builders.structure.createStructure(model, assemblyId ? { name: 'assembly', params: { id: assemblyId } } : { name: 'model', params: {} })];
                    case 5:
                        structure = _e.sent();
                        return [4 /*yield*/, this.plugin.builders.structure.tryCreateComponentStatic(structure, 'polymer')];
                    case 6:
                        polymer = _e.sent();
                        if (!polymer) return [3 /*break*/, 8];
                        return [4 /*yield*/, this.plugin.builders.structure.representation.addRepresentation(polymer, { type: 'cartoon', color: 'uniform', colorParams: { value: 0x00999999 } })];
                    case 7:
                        _e.sent();
                        _e.label = 8;
                    case 8:
                        myLinesData = [
                            { a: Vec3.create(4.041, 3.101, 1.056), b: Vec3.create(9.881, 10.974, 1.954), color: Color(0xbfbfbf) },
                            { a: Vec3.create(4.041, 3.101, 1.056), b: Vec3.create(2.568, 11.34, 8.683), color: Color(0xbfbfbf) },
                            { a: Vec3.create(4.041, 3.101, 1.056), b: Vec3.create(3.717, 0.776, 8.63), color: Color(0xbfbfbf) },
                            { a: Vec3.create(4.041, 3.101, 1.056), b: Vec3.create(11.372, 0.8, 6.38), color: Color(0x00ff00) },
                            { a: Vec3.create(5.047, 6.689, 1.671), b: Vec3.create(9.881, 10.974, 1.954), color: Color(0xbfbfbf) },
                            { a: Vec3.create(8.771, 7.398, 1.888), b: Vec3.create(13.589, -1.1, 3.926), color: Color(0x00ff00) },
                            { a: Vec3.create(8.771, 7.398, 1.888), b: Vec3.create(11.372, 0.8, 6.38), color: Color(0x00ff00) },
                            { a: Vec3.create(8.771, 7.398, 1.888), b: Vec3.create(14.882, 4.529, 5.937), color: Color(0xbfbfbf) },
                            { a: Vec3.create(8.771, 7.398, 1.888), b: Vec3.create(16.146, 10.207, 8.106), color: Color(0x00ff00) },
                            { a: Vec3.create(9.881, 10.974, 1.954), b: Vec3.create(13.81, 13.85, 5.054), color: Color(0xbfbfbf) },
                            { a: Vec3.create(9.881, 10.974, 1.954), b: Vec3.create(12.373, 14.45, 8.533), color: Color(0xbfbfbf) },
                            { a: Vec3.create(9.881, 10.974, 1.954), b: Vec3.create(11.317, 17.967, 7.51), color: Color(0xbfbfbf) },
                            { a: Vec3.create(9.881, 10.974, 1.954), b: Vec3.create(8.972, 16.651, 4.785), color: Color(0xbfbfbf) },
                            { a: Vec3.create(9.881, 10.974, 1.954), b: Vec3.create(5.633, 10.167, 10.626), color: Color(0xbfbfbf) },
                            { a: Vec3.create(9.881, 10.974, 1.954), b: Vec3.create(14.882, 4.529, 5.937), color: Color(0xbfbfbf) },
                            { a: Vec3.create(13.344, 12.339, 1.591), b: Vec3.create(11.317, 17.967, 7.51), color: Color(0xbfbfbf) },
                            { a: Vec3.create(13.344, 12.339, 1.591), b: Vec3.create(8.972, 16.651, 4.785), color: Color(0xbfbfbf) },
                            { a: Vec3.create(13.344, 12.339, 1.591), b: Vec3.create(18.71, 7.421, 7.688), color: Color(0xbfbfbf) },
                            { a: Vec3.create(13.344, 12.339, 1.591), b: Vec3.create(16.146, 10.207, 8.106), color: Color(0x00ff00) },
                            { a: Vec3.create(13.81, 13.85, 5.054), b: Vec3.create(11.317, 17.967, 7.51), color: Color(0xbfbfbf) },
                            { a: Vec3.create(13.81, 13.85, 5.054), b: Vec3.create(8.972, 16.651, 4.785), color: Color(0xbfbfbf) },
                            { a: Vec3.create(13.81, 13.85, 5.054), b: Vec3.create(18.71, 7.421, 7.688), color: Color(0xbfbfbf) },
                            { a: Vec3.create(13.81, 13.85, 5.054), b: Vec3.create(16.146, 10.207, 8.106), color: Color(0x00ff00) },
                            { a: Vec3.create(12.373, 14.45, 8.533), b: Vec3.create(8.972, 16.651, 4.785), color: Color(0xbfbfbf) },
                            { a: Vec3.create(12.373, 14.45, 8.533), b: Vec3.create(6.906, 14.765, 7.36), color: Color(0xbfbfbf) },
                            { a: Vec3.create(12.373, 14.45, 8.533), b: Vec3.create(16.146, 10.207, 8.106), color: Color(0x00ff00) },
                            { a: Vec3.create(12.373, 14.45, 8.533), b: Vec3.create(13.131, 12.816, 17.827), color: Color(0x00ff00) },
                            { a: Vec3.create(12.373, 14.45, 8.533), b: Vec3.create(11.761, 16.309, 18.096), color: Color(0xbfbfbf) },
                            { a: Vec3.create(11.317, 17.967, 7.51), b: Vec3.create(16.146, 10.207, 8.106), color: Color(0x00ff00) },
                            { a: Vec3.create(11.317, 17.967, 7.51), b: Vec3.create(16.862, 17.526, 16.81), color: Color(0xbfbfbf) },
                            { a: Vec3.create(8.972, 16.651, 4.785), b: Vec3.create(4.244, 16.096, 9.65), color: Color(0xbfbfbf) },
                            { a: Vec3.create(6.906, 14.765, 7.36), b: Vec3.create(4.137, 14.354, 13.042), color: Color(0xbfbfbf) },
                            { a: Vec3.create(6.906, 14.765, 7.36), b: Vec3.create(1.039, 12.444, 11.951), color: Color(0xbfbfbf) },
                            { a: Vec3.create(6.906, 14.765, 7.36), b: Vec3.create(5.633, 10.167, 10.626), color: Color(0xbfbfbf) },
                            { a: Vec3.create(6.906, 14.765, 7.36), b: Vec3.create(5.46, 5.438, 8.859), color: Color(0xbfbfbf) },
                            { a: Vec3.create(6.906, 14.765, 7.36), b: Vec3.create(16.146, 10.207, 8.106), color: Color(0xbfbfbf) },
                            { a: Vec3.create(4.244, 16.096, 9.65), b: Vec3.create(2.568, 11.34, 8.683), color: Color(0xbfbfbf) },
                            { a: Vec3.create(4.244, 16.096, 9.65), b: Vec3.create(5.633, 10.167, 10.626), color: Color(0xbfbfbf) },
                            { a: Vec3.create(4.244, 16.096, 9.65), b: Vec3.create(3.356, 8.301, 12.978), color: Color(0x00ff00) },
                            { a: Vec3.create(4.244, 16.096, 9.65), b: Vec3.create(1.937, 6.599, 9.875), color: Color(0xbfbfbf) },
                            { a: Vec3.create(4.137, 14.354, 13.042), b: Vec3.create(2.568, 11.34, 8.683), color: Color(0xbfbfbf) },
                            { a: Vec3.create(4.137, 14.354, 13.042), b: Vec3.create(5.633, 10.167, 10.626), color: Color(0xbfbfbf) },
                            { a: Vec3.create(4.137, 14.354, 13.042), b: Vec3.create(3.356, 8.301, 12.978), color: Color(0x00ff00) },
                            { a: Vec3.create(4.137, 14.354, 13.042), b: Vec3.create(3.907, 9.825, 19.549), color: Color(0xbfbfbf) },
                            { a: Vec3.create(4.137, 14.354, 13.042), b: Vec3.create(8.692, 13.508, 20.889), color: Color(0xbfbfbf) },
                            { a: Vec3.create(4.137, 14.354, 13.042), b: Vec3.create(11.761, 16.309, 18.096), color: Color(0xff0000) },
                            { a: Vec3.create(1.039, 12.444, 11.951), b: Vec3.create(3.356, 8.301, 12.978), color: Color(0x00ff00) },
                            { a: Vec3.create(1.039, 12.444, 11.951), b: Vec3.create(1.937, 6.599, 9.875), color: Color(0xbfbfbf) },
                            { a: Vec3.create(1.039, 12.444, 11.951), b: Vec3.create(8.08, 11.478, 17.711), color: Color(0xbfbfbf) },
                            { a: Vec3.create(2.568, 11.34, 8.683), b: Vec3.create(5.46, 5.438, 8.859), color: Color(0xbfbfbf) },
                            { a: Vec3.create(5.633, 10.167, 10.626), b: Vec3.create(1.937, 6.599, 9.875), color: Color(0xbfbfbf) },
                            { a: Vec3.create(5.633, 10.167, 10.626), b: Vec3.create(5.826, 4.017, 12.38), color: Color(0x00ff00) },
                            { a: Vec3.create(5.633, 10.167, 10.626), b: Vec3.create(15.928, 10.541, 11.891), color: Color(0xbfbfbf) },
                            { a: Vec3.create(5.633, 10.167, 10.626), b: Vec3.create(4.3, 6.288, 18.3), color: Color(0xbfbfbf) },
                            { a: Vec3.create(5.633, 10.167, 10.626), b: Vec3.create(9.139, 8.283, 19.473), color: Color(0x00ff00) },
                            { a: Vec3.create(5.633, 10.167, 10.626), b: Vec3.create(13.131, 12.816, 17.827), color: Color(0x00ff00) },
                            { a: Vec3.create(5.633, 10.167, 10.626), b: Vec3.create(11.761, 16.309, 18.096), color: Color(0xbfbfbf) },
                            { a: Vec3.create(3.356, 8.301, 12.978), b: Vec3.create(5.46, 5.438, 8.859), color: Color(0x00ff00) },
                            { a: Vec3.create(3.356, 8.301, 12.978), b: Vec3.create(5.826, 4.017, 12.38), color: Color(0x00ff00) },
                            { a: Vec3.create(3.356, 8.301, 12.978), b: Vec3.create(4.3, 6.288, 18.3), color: Color(0xbfbfbf) },
                            { a: Vec3.create(3.356, 8.301, 12.978), b: Vec3.create(3.907, 9.825, 19.549), color: Color(0x00ff00) },
                            { a: Vec3.create(3.356, 8.301, 12.978), b: Vec3.create(9.139, 8.283, 19.473), color: Color(0x00ff00) },
                            { a: Vec3.create(3.356, 8.301, 12.978), b: Vec3.create(8.08, 11.478, 17.711), color: Color(0x00ff00) },
                            { a: Vec3.create(1.937, 6.599, 9.875), b: Vec3.create(4.3, 6.288, 18.3), color: Color(0xff0000) },
                            { a: Vec3.create(5.46, 5.438, 8.859), b: Vec3.create(2.488, 2.115, 11.956), color: Color(0xbfbfbf) },
                            { a: Vec3.create(5.46, 5.438, 8.859), b: Vec3.create(3.717, 0.776, 8.63), color: Color(0xbfbfbf) },
                            { a: Vec3.create(5.46, 5.438, 8.859), b: Vec3.create(6.804, -0.484, 10.49), color: Color(0x00ff00) },
                            { a: Vec3.create(5.46, 5.438, 8.859), b: Vec3.create(11.372, 0.8, 6.38), color: Color(0x00ff00) },
                            { a: Vec3.create(5.46, 5.438, 8.859), b: Vec3.create(14.882, 4.529, 5.937), color: Color(0xbfbfbf) },
                            { a: Vec3.create(5.46, 5.438, 8.859), b: Vec3.create(16.146, 10.207, 8.106), color: Color(0x00ff00) },
                            { a: Vec3.create(5.46, 5.438, 8.859), b: Vec3.create(4.3, 6.288, 18.3), color: Color(0xbfbfbf) },
                            { a: Vec3.create(5.826, 4.017, 12.38), b: Vec3.create(3.717, 0.776, 8.63), color: Color(0xbfbfbf) },
                            { a: Vec3.create(5.826, 4.017, 12.38), b: Vec3.create(6.804, -0.484, 10.49), color: Color(0x00ff00) },
                            { a: Vec3.create(5.826, 4.017, 12.38), b: Vec3.create(4.53, -1.982, 13.183), color: Color(0x00ff00) },
                            { a: Vec3.create(5.826, 4.017, 12.38), b: Vec3.create(11.372, 0.8, 6.38), color: Color(0x00ff00) },
                            { a: Vec3.create(5.826, 4.017, 12.38), b: Vec3.create(13.818, 5.313, 9.555), color: Color(0x00ff00) },
                            { a: Vec3.create(5.826, 4.017, 12.38), b: Vec3.create(11.396, 1.361, 18.511), color: Color(0x00ff00) },
                            { a: Vec3.create(5.826, 4.017, 12.38), b: Vec3.create(4.281, 4.768, 21.777), color: Color(0x00ff00) },
                            { a: Vec3.create(5.826, 4.017, 12.38), b: Vec3.create(4.3, 6.288, 18.3), color: Color(0xbfbfbf) },
                            { a: Vec3.create(5.826, 4.017, 12.38), b: Vec3.create(3.907, 9.825, 19.549), color: Color(0x00ff00) },
                            { a: Vec3.create(5.826, 4.017, 12.38), b: Vec3.create(9.139, 8.283, 19.473), color: Color(0x00ff00) },
                            { a: Vec3.create(5.826, 4.017, 12.38), b: Vec3.create(8.08, 11.478, 17.711), color: Color(0x00ff00) },
                            { a: Vec3.create(5.826, 4.017, 12.38), b: Vec3.create(13.131, 12.816, 17.827), color: Color(0x00ff00) },
                            { a: Vec3.create(2.488, 2.115, 11.956), b: Vec3.create(4.53, -1.982, 13.183), color: Color(0xbfbfbf) },
                            { a: Vec3.create(3.717, 0.776, 8.63), b: Vec3.create(2.68, -3.822, 10.411), color: Color(0xbfbfbf) },
                            { a: Vec3.create(3.717, 0.776, 8.63), b: Vec3.create(9.8, -4.494, 3.39), color: Color(0xbfbfbf) },
                            { a: Vec3.create(3.717, 0.776, 8.63), b: Vec3.create(10.62, -4.22, 7.104), color: Color(0xbfbfbf) },
                            { a: Vec3.create(3.717, 0.776, 8.63), b: Vec3.create(4.3, 6.288, 18.3), color: Color(0xff0000) },
                            { a: Vec3.create(6.804, -0.484, 10.49), b: Vec3.create(2.68, -3.822, 10.411), color: Color(0x00ff00) },
                            { a: Vec3.create(6.804, -0.484, 10.49), b: Vec3.create(7.013, -6.604, 12.205), color: Color(0xbfbfbf) },
                            { a: Vec3.create(6.804, -0.484, 10.49), b: Vec3.create(10.62, -4.22, 7.104), color: Color(0x00ff00) },
                            { a: Vec3.create(6.804, -0.484, 10.49), b: Vec3.create(11.372, 0.8, 6.38), color: Color(0x00ff00) },
                            { a: Vec3.create(6.804, -0.484, 10.49), b: Vec3.create(13.949, 0.377, 9.191), color: Color(0x00ff00) },
                            { a: Vec3.create(6.804, -0.484, 10.49), b: Vec3.create(14.882, 4.529, 5.937), color: Color(0x00ff00) },
                            { a: Vec3.create(6.804, -0.484, 10.49), b: Vec3.create(13.818, 5.313, 9.555), color: Color(0x00ff00) },
                            { a: Vec3.create(6.804, -0.484, 10.49), b: Vec3.create(16.025, 1.452, 15.706), color: Color(0x00ff00) },
                            { a: Vec3.create(6.804, -0.484, 10.49), b: Vec3.create(11.396, 1.361, 18.511), color: Color(0x00ff00) },
                            { a: Vec3.create(6.804, -0.484, 10.49), b: Vec3.create(4.3, 6.288, 18.3), color: Color(0xbfbfbf) },
                            { a: Vec3.create(6.804, -0.484, 10.49), b: Vec3.create(9.139, 8.283, 19.473), color: Color(0x00ff00) },
                            { a: Vec3.create(4.53, -1.982, 13.183), b: Vec3.create(11.396, 1.361, 18.511), color: Color(0x00ff00) },
                            { a: Vec3.create(4.53, -1.982, 13.183), b: Vec3.create(4.281, 4.768, 21.777), color: Color(0xbfbfbf) },
                            { a: Vec3.create(2.68, -3.822, 10.411), b: Vec3.create(7.013, -6.604, 12.205), color: Color(0xbfbfbf) },
                            { a: Vec3.create(2.68, -3.822, 10.411), b: Vec3.create(5.011, -9.772, 8.156), color: Color(0xbfbfbf) },
                            { a: Vec3.create(2.68, -3.822, 10.411), b: Vec3.create(11.372, 0.8, 6.38), color: Color(0x00ff00) },
                            { a: Vec3.create(5.853, -5.24, 8.87), b: Vec3.create(4.332, -9.294, 11.844), color: Color(0xbfbfbf) },
                            { a: Vec3.create(5.853, -5.24, 8.87), b: Vec3.create(5.011, -9.772, 8.156), color: Color(0xbfbfbf) },
                            { a: Vec3.create(5.853, -5.24, 8.87), b: Vec3.create(9.131, -11.946, 5.482), color: Color(0xbfbfbf) },
                            { a: Vec3.create(5.853, -5.24, 8.87), b: Vec3.create(10.62, -4.22, 7.104), color: Color(0xbfbfbf) },
                            { a: Vec3.create(5.853, -5.24, 8.87), b: Vec3.create(14.362, -3.834, 6.485), color: Color(0xff0000) },
                            { a: Vec3.create(5.853, -5.24, 8.87), b: Vec3.create(13.589, -1.1, 3.926), color: Color(0xbfbfbf) },
                            { a: Vec3.create(5.853, -5.24, 8.87), b: Vec3.create(13.949, 0.377, 9.191), color: Color(0xbfbfbf) },
                            { a: Vec3.create(7.013, -6.604, 12.205), b: Vec3.create(10.62, -4.22, 7.104), color: Color(0xbfbfbf) },
                            { a: Vec3.create(7.013, -6.604, 12.205), b: Vec3.create(11.372, 0.8, 6.38), color: Color(0xbfbfbf) },
                            { a: Vec3.create(7.013, -6.604, 12.205), b: Vec3.create(13.949, 0.377, 9.191), color: Color(0xbfbfbf) },
                            { a: Vec3.create(7.013, -6.604, 12.205), b: Vec3.create(11.396, 1.361, 18.511), color: Color(0xbfbfbf) },
                            { a: Vec3.create(7.013, -6.604, 12.205), b: Vec3.create(12.507, -1.875, 20.16), color: Color(0xbfbfbf) },
                            { a: Vec3.create(4.332, -9.294, 11.844), b: Vec3.create(5.976, -13.286, 7.095), color: Color(0xbfbfbf) },
                            { a: Vec3.create(4.332, -9.294, 11.844), b: Vec3.create(10.62, -4.22, 7.104), color: Color(0x00ff00) },
                            { a: Vec3.create(5.011, -9.772, 8.156), b: Vec3.create(11.5, -9.072, 6.39), color: Color(0xbfbfbf) },
                            { a: Vec3.create(5.011, -9.772, 8.156), b: Vec3.create(11.913, -7.618, 2.891), color: Color(0xbfbfbf) },
                            { a: Vec3.create(5.976, -13.286, 7.095), b: Vec3.create(11.5, -9.072, 6.39), color: Color(0xbfbfbf) },
                            { a: Vec3.create(9.131, -11.946, 5.482), b: Vec3.create(11.913, -7.618, 2.891), color: Color(0xbfbfbf) },
                            { a: Vec3.create(9.131, -11.946, 5.482), b: Vec3.create(9.8, -4.494, 3.39), color: Color(0x00ff00) },
                            { a: Vec3.create(9.131, -11.946, 5.482), b: Vec3.create(10.62, -4.22, 7.104), color: Color(0x00ff00) },
                            { a: Vec3.create(9.131, -11.946, 5.482), b: Vec3.create(14.362, -3.834, 6.485), color: Color(0xbfbfbf) },
                            { a: Vec3.create(11.5, -9.072, 6.39), b: Vec3.create(9.8, -4.494, 3.39), color: Color(0xbfbfbf) },
                            { a: Vec3.create(11.5, -9.072, 6.39), b: Vec3.create(14.362, -3.834, 6.485), color: Color(0xff0000) },
                            { a: Vec3.create(11.913, -7.618, 2.891), b: Vec3.create(14.362, -3.834, 6.485), color: Color(0xff0000) },
                            { a: Vec3.create(9.8, -4.494, 3.39), b: Vec3.create(14.362, -3.834, 6.485), color: Color(0xbfbfbf) },
                            { a: Vec3.create(9.8, -4.494, 3.39), b: Vec3.create(13.589, -1.1, 3.926), color: Color(0x00ff00) },
                            { a: Vec3.create(9.8, -4.494, 3.39), b: Vec3.create(11.372, 0.8, 6.38), color: Color(0x00ff00) },
                            { a: Vec3.create(10.62, -4.22, 7.104), b: Vec3.create(13.589, -1.1, 3.926), color: Color(0x00ff00) },
                            { a: Vec3.create(10.62, -4.22, 7.104), b: Vec3.create(11.372, 0.8, 6.38), color: Color(0x00ff00) },
                            { a: Vec3.create(10.62, -4.22, 7.104), b: Vec3.create(13.949, 0.377, 9.191), color: Color(0x00ff00) },
                            { a: Vec3.create(14.362, -3.834, 6.485), b: Vec3.create(13.949, 0.377, 9.191), color: Color(0xbfbfbf) },
                            { a: Vec3.create(14.362, -3.834, 6.485), b: Vec3.create(16.895, 1.478, 6.984), color: Color(0xff0000) },
                            { a: Vec3.create(13.589, -1.1, 3.926), b: Vec3.create(13.949, 0.377, 9.191), color: Color(0x00ff00) },
                            { a: Vec3.create(13.589, -1.1, 3.926), b: Vec3.create(14.882, 4.529, 5.937), color: Color(0xbfbfbf) },
                            { a: Vec3.create(11.372, 0.8, 6.38), b: Vec3.create(14.882, 4.529, 5.937), color: Color(0x00ff00) },
                            { a: Vec3.create(11.372, 0.8, 6.38), b: Vec3.create(13.818, 5.313, 9.555), color: Color(0x00ff00) },
                            { a: Vec3.create(13.949, 0.377, 9.191), b: Vec3.create(13.818, 5.313, 9.555), color: Color(0x00ff00) },
                            { a: Vec3.create(13.949, 0.377, 9.191), b: Vec3.create(11.396, 1.361, 18.511), color: Color(0x00ff00) },
                            { a: Vec3.create(16.895, 1.478, 6.984), b: Vec3.create(13.818, 5.313, 9.555), color: Color(0xbfbfbf) },
                            { a: Vec3.create(16.895, 1.478, 6.984), b: Vec3.create(18.71, 7.421, 7.688), color: Color(0xbfbfbf) },
                            { a: Vec3.create(16.895, 1.478, 6.984), b: Vec3.create(16.025, 1.452, 15.706), color: Color(0xbfbfbf) },
                            { a: Vec3.create(14.882, 4.529, 5.937), b: Vec3.create(17.476, 5.337, 10.633), color: Color(0xbfbfbf) },
                            { a: Vec3.create(14.882, 4.529, 5.937), b: Vec3.create(18.71, 7.421, 7.688), color: Color(0xbfbfbf) },
                            { a: Vec3.create(14.882, 4.529, 5.937), b: Vec3.create(15.928, 10.541, 11.891), color: Color(0xbfbfbf) },
                            { a: Vec3.create(13.818, 5.313, 9.555), b: Vec3.create(18.71, 7.421, 7.688), color: Color(0x00ff00) },
                            { a: Vec3.create(13.818, 5.313, 9.555), b: Vec3.create(16.146, 10.207, 8.106), color: Color(0x00ff00) },
                            { a: Vec3.create(13.818, 5.313, 9.555), b: Vec3.create(18.755, 4.134, 15.65), color: Color(0xbfbfbf) },
                            { a: Vec3.create(13.818, 5.313, 9.555), b: Vec3.create(16.025, 1.452, 15.706), color: Color(0xbfbfbf) },
                            { a: Vec3.create(13.818, 5.313, 9.555), b: Vec3.create(13.87, 4.019, 19.615), color: Color(0x00ff00) },
                            { a: Vec3.create(13.818, 5.313, 9.555), b: Vec3.create(11.396, 1.361, 18.511), color: Color(0x00ff00) },
                            { a: Vec3.create(13.818, 5.313, 9.555), b: Vec3.create(9.139, 8.283, 19.473), color: Color(0x00ff00) },
                            { a: Vec3.create(13.818, 5.313, 9.555), b: Vec3.create(13.131, 12.816, 17.827), color: Color(0x00ff00) },
                            { a: Vec3.create(17.476, 5.337, 10.633), b: Vec3.create(15.928, 10.541, 11.891), color: Color(0xbfbfbf) },
                            { a: Vec3.create(17.476, 5.337, 10.633), b: Vec3.create(19.734, 10.588, 12.26), color: Color(0xbfbfbf) },
                            { a: Vec3.create(17.476, 5.337, 10.633), b: Vec3.create(19.178, 9.728, 15.931), color: Color(0xbfbfbf) },
                            { a: Vec3.create(17.476, 5.337, 10.633), b: Vec3.create(18.755, 4.134, 15.65), color: Color(0xbfbfbf) },
                            { a: Vec3.create(17.476, 5.337, 10.633), b: Vec3.create(16.025, 1.452, 15.706), color: Color(0xbfbfbf) },
                            { a: Vec3.create(17.476, 5.337, 10.633), b: Vec3.create(13.87, 4.019, 19.615), color: Color(0x00ff00) },
                            { a: Vec3.create(18.71, 7.421, 7.688), b: Vec3.create(15.928, 10.541, 11.891), color: Color(0xbfbfbf) },
                            { a: Vec3.create(18.71, 7.421, 7.688), b: Vec3.create(19.734, 10.588, 12.26), color: Color(0xbfbfbf) },
                            { a: Vec3.create(16.146, 10.207, 8.106), b: Vec3.create(19.734, 10.588, 12.26), color: Color(0x00ff00) },
                            { a: Vec3.create(16.146, 10.207, 8.106), b: Vec3.create(13.131, 12.816, 17.827), color: Color(0x00ff00) },
                            { a: Vec3.create(15.928, 10.541, 11.891), b: Vec3.create(19.178, 9.728, 15.931), color: Color(0xbfbfbf) },
                            { a: Vec3.create(15.928, 10.541, 11.891), b: Vec3.create(20.031, 5.245, 19.067), color: Color(0xbfbfbf) },
                            { a: Vec3.create(15.928, 10.541, 11.891), b: Vec3.create(18.755, 4.134, 15.65), color: Color(0xbfbfbf) },
                            { a: Vec3.create(15.928, 10.541, 11.891), b: Vec3.create(13.87, 4.019, 19.615), color: Color(0x00ff00) },
                            { a: Vec3.create(15.928, 10.541, 11.891), b: Vec3.create(9.139, 8.283, 19.473), color: Color(0x00ff00) },
                            { a: Vec3.create(15.928, 10.541, 11.891), b: Vec3.create(13.131, 12.816, 17.827), color: Color(0x00ff00) },
                            { a: Vec3.create(15.928, 10.541, 11.891), b: Vec3.create(17.039, 15.556, 20.015), color: Color(0xbfbfbf) },
                            { a: Vec3.create(15.928, 10.541, 11.891), b: Vec3.create(16.862, 17.526, 16.81), color: Color(0xbfbfbf) },
                            { a: Vec3.create(19.734, 10.588, 12.26), b: Vec3.create(22.113, 8.159, 17.786), color: Color(0xbfbfbf) },
                            { a: Vec3.create(19.734, 10.588, 12.26), b: Vec3.create(18.755, 4.134, 15.65), color: Color(0xbfbfbf) },
                            { a: Vec3.create(19.734, 10.588, 12.26), b: Vec3.create(13.131, 12.816, 17.827), color: Color(0x00ff00) },
                            { a: Vec3.create(19.734, 10.588, 12.26), b: Vec3.create(17.039, 15.556, 20.015), color: Color(0xbfbfbf) },
                            { a: Vec3.create(19.734, 10.588, 12.26), b: Vec3.create(16.862, 17.526, 16.81), color: Color(0xbfbfbf) },
                            { a: Vec3.create(19.734, 10.588, 12.26), b: Vec3.create(21.236, 19.868, 18.107), color: Color(0xbfbfbf) },
                            { a: Vec3.create(19.734, 10.588, 12.26), b: Vec3.create(19.977, 22.768, 15.969), color: Color(0xbfbfbf) },
                            { a: Vec3.create(19.178, 9.728, 15.931), b: Vec3.create(20.031, 5.245, 19.067), color: Color(0xbfbfbf) },
                            { a: Vec3.create(19.178, 9.728, 15.931), b: Vec3.create(18.755, 4.134, 15.65), color: Color(0xbfbfbf) },
                            { a: Vec3.create(19.178, 9.728, 15.931), b: Vec3.create(16.025, 1.452, 15.706), color: Color(0xbfbfbf) },
                            { a: Vec3.create(19.178, 9.728, 15.931), b: Vec3.create(16.396, 1.173, 19.513), color: Color(0xbfbfbf) },
                            { a: Vec3.create(19.178, 9.728, 15.931), b: Vec3.create(13.87, 4.019, 19.615), color: Color(0x00ff00) },
                            { a: Vec3.create(19.178, 9.728, 15.931), b: Vec3.create(9.139, 8.283, 19.473), color: Color(0x00ff00) },
                            { a: Vec3.create(19.178, 9.728, 15.931), b: Vec3.create(13.131, 12.816, 17.827), color: Color(0x00ff00) },
                            { a: Vec3.create(19.178, 9.728, 15.931), b: Vec3.create(16.862, 17.526, 16.81), color: Color(0xbfbfbf) },
                            { a: Vec3.create(19.178, 9.728, 15.931), b: Vec3.create(21.236, 19.868, 18.107), color: Color(0xbfbfbf) },
                            { a: Vec3.create(22.113, 8.159, 17.786), b: Vec3.create(18.755, 4.134, 15.65), color: Color(0xbfbfbf) },
                            { a: Vec3.create(22.113, 8.159, 17.786), b: Vec3.create(16.396, 1.173, 19.513), color: Color(0xff0000) },
                            { a: Vec3.create(22.113, 8.159, 17.786), b: Vec3.create(21.236, 19.868, 18.107), color: Color(0xbfbfbf) },
                            { a: Vec3.create(20.031, 5.245, 19.067), b: Vec3.create(16.025, 1.452, 15.706), color: Color(0xbfbfbf) },
                            { a: Vec3.create(20.031, 5.245, 19.067), b: Vec3.create(16.396, 1.173, 19.513), color: Color(0xff0000) },
                            { a: Vec3.create(20.031, 5.245, 19.067), b: Vec3.create(13.87, 4.019, 19.615), color: Color(0x00ff00) },
                            { a: Vec3.create(20.031, 5.245, 19.067), b: Vec3.create(11.396, 1.361, 18.511), color: Color(0x00ff00) },
                            { a: Vec3.create(20.031, 5.245, 19.067), b: Vec3.create(17.039, 15.556, 20.015), color: Color(0xff0000) },
                            { a: Vec3.create(18.755, 4.134, 15.65), b: Vec3.create(13.87, 4.019, 19.615), color: Color(0x00ff00) },
                            { a: Vec3.create(18.755, 4.134, 15.65), b: Vec3.create(11.396, 1.361, 18.511), color: Color(0x00ff00) },
                            { a: Vec3.create(18.755, 4.134, 15.65), b: Vec3.create(12.507, -1.875, 20.16), color: Color(0xbfbfbf) },
                            { a: Vec3.create(16.025, 1.452, 15.706), b: Vec3.create(11.396, 1.361, 18.511), color: Color(0x00ff00) },
                            { a: Vec3.create(16.025, 1.452, 15.706), b: Vec3.create(12.507, -1.875, 20.16), color: Color(0xbfbfbf) },
                            { a: Vec3.create(16.025, 1.452, 15.706), b: Vec3.create(14.173, -0.533, 23.321), color: Color(0xbfbfbf) },
                            { a: Vec3.create(16.396, 1.173, 19.513), b: Vec3.create(11.396, 1.361, 18.511), color: Color(0x00ff00) },
                            { a: Vec3.create(16.396, 1.173, 19.513), b: Vec3.create(12.507, -1.875, 20.16), color: Color(0xbfbfbf) },
                            { a: Vec3.create(16.396, 1.173, 19.513), b: Vec3.create(14.173, -0.533, 23.321), color: Color(0xff0000) },
                            { a: Vec3.create(13.87, 4.019, 19.615), b: Vec3.create(12.507, -1.875, 20.16), color: Color(0x00ff00) },
                            { a: Vec3.create(13.87, 4.019, 19.615), b: Vec3.create(12.373, 2.69, 24.373), color: Color(0x00ff00) },
                            { a: Vec3.create(13.87, 4.019, 19.615), b: Vec3.create(6.225, 6.818, 26.537), color: Color(0x00ff00) },
                            { a: Vec3.create(13.87, 4.019, 19.615), b: Vec3.create(6.603, 3.569, 24.536), color: Color(0x00ff00) },
                            { a: Vec3.create(13.87, 4.019, 19.615), b: Vec3.create(6.562, 8.985, 22.165), color: Color(0x00ff00) },
                            { a: Vec3.create(13.87, 4.019, 19.615), b: Vec3.create(9.139, 8.283, 19.473), color: Color(0x00ff00) },
                            { a: Vec3.create(13.87, 4.019, 19.615), b: Vec3.create(12.089, 11.895, 21.355), color: Color(0x00ff00) },
                            { a: Vec3.create(13.87, 4.019, 19.615), b: Vec3.create(13.131, 12.816, 17.827), color: Color(0x00ff00) },
                            { a: Vec3.create(13.87, 4.019, 19.615), b: Vec3.create(17.039, 15.556, 20.015), color: Color(0xbfbfbf) },
                            { a: Vec3.create(11.396, 1.361, 18.511), b: Vec3.create(14.173, -0.533, 23.321), color: Color(0x00ff00) },
                            { a: Vec3.create(11.396, 1.361, 18.511), b: Vec3.create(12.373, 2.69, 24.373), color: Color(0x00ff00) },
                            { a: Vec3.create(11.396, 1.361, 18.511), b: Vec3.create(6.603, 3.569, 24.536), color: Color(0x00ff00) },
                            { a: Vec3.create(11.396, 1.361, 18.511), b: Vec3.create(9.139, 8.283, 19.473), color: Color(0x00ff00) },
                            { a: Vec3.create(12.507, -1.875, 20.16), b: Vec3.create(12.373, 2.69, 24.373), color: Color(0xbfbfbf) },
                            { a: Vec3.create(12.507, -1.875, 20.16), b: Vec3.create(6.603, 3.569, 24.536), color: Color(0xbfbfbf) },
                            { a: Vec3.create(14.173, -0.533, 23.321), b: Vec3.create(6.603, 3.569, 24.536), color: Color(0xbfbfbf) },
                            { a: Vec3.create(12.373, 2.69, 24.373), b: Vec3.create(12.286, 3.666, 30.655), color: Color(0xbfbfbf) },
                            { a: Vec3.create(12.373, 2.69, 24.373), b: Vec3.create(11.565, 7.408, 31.226), color: Color(0xbfbfbf) },
                            { a: Vec3.create(12.373, 2.69, 24.373), b: Vec3.create(6.225, 6.818, 26.537), color: Color(0xbfbfbf) },
                            { a: Vec3.create(12.373, 2.69, 24.373), b: Vec3.create(6.603, 3.569, 24.536), color: Color(0xbfbfbf) },
                            { a: Vec3.create(12.373, 2.69, 24.373), b: Vec3.create(4.281, 4.768, 21.777), color: Color(0xbfbfbf) },
                            { a: Vec3.create(12.373, 2.69, 24.373), b: Vec3.create(6.562, 8.985, 22.165), color: Color(0xbfbfbf) },
                            { a: Vec3.create(12.373, 2.69, 24.373), b: Vec3.create(9.139, 8.283, 19.473), color: Color(0x00ff00) },
                            { a: Vec3.create(13.967, 4.48, 27.332), b: Vec3.create(6.225, 6.818, 26.537), color: Color(0xbfbfbf) },
                            { a: Vec3.create(12.286, 3.666, 30.655), b: Vec3.create(6.225, 6.818, 26.537), color: Color(0xbfbfbf) },
                            { a: Vec3.create(11.565, 7.408, 31.226), b: Vec3.create(6.225, 6.818, 26.537), color: Color(0xbfbfbf) },
                            { a: Vec3.create(11.565, 7.408, 31.226), b: Vec3.create(6.603, 3.569, 24.536), color: Color(0xbfbfbf) },
                            { a: Vec3.create(11.565, 7.408, 31.226), b: Vec3.create(4.281, 4.768, 21.777), color: Color(0xbfbfbf) },
                            { a: Vec3.create(6.225, 6.818, 26.537), b: Vec3.create(4.281, 4.768, 21.777), color: Color(0xbfbfbf) },
                            { a: Vec3.create(6.225, 6.818, 26.537), b: Vec3.create(6.562, 8.985, 22.165), color: Color(0xbfbfbf) },
                            { a: Vec3.create(6.225, 6.818, 26.537), b: Vec3.create(9.139, 8.283, 19.473), color: Color(0x00ff00) },
                            { a: Vec3.create(6.225, 6.818, 26.537), b: Vec3.create(8.692, 13.508, 20.889), color: Color(0xbfbfbf) },
                            { a: Vec3.create(6.603, 3.569, 24.536), b: Vec3.create(4.3, 6.288, 18.3), color: Color(0xbfbfbf) },
                            { a: Vec3.create(6.603, 3.569, 24.536), b: Vec3.create(9.139, 8.283, 19.473), color: Color(0x00ff00) },
                            { a: Vec3.create(4.281, 4.768, 21.777), b: Vec3.create(3.907, 9.825, 19.549), color: Color(0xbfbfbf) },
                            { a: Vec3.create(4.281, 4.768, 21.777), b: Vec3.create(9.139, 8.283, 19.473), color: Color(0x00ff00) },
                            { a: Vec3.create(4.281, 4.768, 21.777), b: Vec3.create(8.692, 13.508, 20.889), color: Color(0xbfbfbf) },
                            { a: Vec3.create(4.3, 6.288, 18.3), b: Vec3.create(6.562, 8.985, 22.165), color: Color(0xbfbfbf) },
                            { a: Vec3.create(4.3, 6.288, 18.3), b: Vec3.create(8.08, 11.478, 17.711), color: Color(0xbfbfbf) },
                            { a: Vec3.create(3.907, 9.825, 19.549), b: Vec3.create(9.139, 8.283, 19.473), color: Color(0x00ff00) },
                            { a: Vec3.create(3.907, 9.825, 19.549), b: Vec3.create(8.692, 13.508, 20.889), color: Color(0xbfbfbf) },
                            { a: Vec3.create(6.562, 8.985, 22.165), b: Vec3.create(12.089, 11.895, 21.355), color: Color(0xbfbfbf) },
                            { a: Vec3.create(9.139, 8.283, 19.473), b: Vec3.create(8.692, 13.508, 20.889), color: Color(0x00ff00) },
                            { a: Vec3.create(9.139, 8.283, 19.473), b: Vec3.create(12.089, 11.895, 21.355), color: Color(0x00ff00) },
                            { a: Vec3.create(9.139, 8.283, 19.473), b: Vec3.create(13.131, 12.816, 17.827), color: Color(0x00ff00) },
                            { a: Vec3.create(8.08, 11.478, 17.711), b: Vec3.create(13.131, 12.816, 17.827), color: Color(0x00ff00) },
                            { a: Vec3.create(8.08, 11.478, 17.711), b: Vec3.create(11.761, 16.309, 18.096), color: Color(0xbfbfbf) },
                            { a: Vec3.create(8.692, 13.508, 20.889), b: Vec3.create(13.131, 12.816, 17.827), color: Color(0x00ff00) },
                            { a: Vec3.create(8.692, 13.508, 20.889), b: Vec3.create(13.736, 17.034, 21.229), color: Color(0xbfbfbf) },
                            { a: Vec3.create(12.089, 11.895, 21.355), b: Vec3.create(13.736, 17.034, 21.229), color: Color(0xbfbfbf) },
                            { a: Vec3.create(13.131, 12.816, 17.827), b: Vec3.create(13.736, 17.034, 21.229), color: Color(0x00ff00) },
                            { a: Vec3.create(13.131, 12.816, 17.827), b: Vec3.create(16.862, 17.526, 16.81), color: Color(0x00ff00) },
                            { a: Vec3.create(11.761, 16.309, 18.096), b: Vec3.create(17.039, 15.556, 20.015), color: Color(0xff0000) },
                            { a: Vec3.create(11.761, 16.309, 18.096), b: Vec3.create(16.862, 17.526, 16.81), color: Color(0xbfbfbf) },
                            { a: Vec3.create(13.736, 17.034, 21.229), b: Vec3.create(16.862, 17.526, 16.81), color: Color(0xbfbfbf) },
                            { a: Vec3.create(17.039, 15.556, 20.015), b: Vec3.create(16.038, 20.773, 18.654), color: Color(0xff0000) },
                            { a: Vec3.create(17.039, 15.556, 20.015), b: Vec3.create(18.911, 20.266, 21.084), color: Color(0xff0000) },
                            { a: Vec3.create(17.039, 15.556, 20.015), b: Vec3.create(21.236, 19.868, 18.107), color: Color(0xff0000) },
                            { a: Vec3.create(17.039, 15.556, 20.015), b: Vec3.create(19.977, 22.768, 15.969), color: Color(0xff0000) },
                            { a: Vec3.create(16.862, 17.526, 16.81), b: Vec3.create(18.911, 20.266, 21.084), color: Color(0xbfbfbf) },
                            { a: Vec3.create(16.862, 17.526, 16.81), b: Vec3.create(21.236, 19.868, 18.107), color: Color(0xbfbfbf) },
                            { a: Vec3.create(16.862, 17.526, 16.81), b: Vec3.create(19.977, 22.768, 15.969), color: Color(0xbfbfbf) },
                            { a: Vec3.create(16.038, 20.773, 18.654), b: Vec3.create(21.236, 19.868, 18.107), color: Color(0xbfbfbf) },
                            { a: Vec3.create(16.038, 20.773, 18.654), b: Vec3.create(19.977, 22.768, 15.969), color: Color(0xbfbfbf) },
                            { a: Vec3.create(18.911, 20.266, 21.084), b: Vec3.create(19.977, 22.768, 15.969), color: Color(0xbfbfbf) }
                        ];
                        update = this.plugin.build();
                        update.toRoot()
                            .apply(CreateAtomPairsProvider, { lines: myLinesData })
                            .apply(StateTransforms.Representation.ShapeRepresentation3D);
                        return [4 /*yield*/, update.commit()];
                    case 9:
                        _e.sent();
                        this.radius = radius;
                        this.bias = bias;
                        this.setPreset(this.preset);
                        return [2 /*return*/];
                }
            });
        });
    };
    return LightingDemo;
}());
var LightingDemo2 = /** @class */ (function () {
    function LightingDemo2() {
        this.radius = 5;
        this.bias = 1.1;
        this.preset = 'illustrative';
    }
    // Method to initialize the plugin
    LightingDemo2.prototype.init = function (target) {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = this;
                        return [4 /*yield*/, createPluginUI(typeof target === 'string' ? document.getElementById(target) : target, __assign(__assign({}, DefaultPluginUISpec()), { layout: {
                                    initial: {
                                        isExpanded: false,
                                        showControls: false
                                    },
                                }, components: {
                                    controls: { left: 'none', right: 'none', top: 'none', bottom: 'none' }
                                } }))];
                    case 1:
                        _a.plugin = _b.sent();
                        this.setPreset('illustrative');
                        return [2 /*return*/];
                }
            });
        });
    };
    // Method to set the preset of the 3D canvas
    LightingDemo2.prototype.setPreset = function (preset) {
        var _a;
        var props = Canvas3DPresets[preset];
        if (((_a = props.canvas3d.postprocessing.occlusion) === null || _a === void 0 ? void 0 : _a.name) === 'on') {
            props.canvas3d.postprocessing.occlusion.params.radius = this.radius;
            props.canvas3d.postprocessing.occlusion.params.bias = this.bias;
        }
        PluginCommands.Canvas3D.SetSettings(this.plugin, {
            settings: __assign(__assign({}, props), { renderer: __assign(__assign({}, this.plugin.canvas3d.props.renderer), props.canvas3d.renderer), postprocessing: __assign(__assign({}, this.plugin.canvas3d.props.postprocessing), props.canvas3d.postprocessing) })
        });
    };
    // Method to load and render the structure from a URL
    LightingDemo2.prototype.load = function (_a, radius, bias) {
        var url = _a.url, _b = _a.format, format = _b === void 0 ? 'pdb' : _b, _c = _a.isBinary, isBinary = _c === void 0 ? true : _c, _d = _a.assemblyId, assemblyId = _d === void 0 ? '' : _d;
        return __awaiter(this, void 0, void 0, function () {
            var data, trajectory, model, structure, polymer, myLinesData, update;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0: return [4 /*yield*/, this.plugin.clear()];
                    case 1:
                        _e.sent();
                        return [4 /*yield*/, this.plugin.builders.data.download({ url: Asset.Url(url), isBinary: isBinary }, { state: { isGhost: true } })];
                    case 2:
                        data = _e.sent();
                        return [4 /*yield*/, this.plugin.builders.structure.parseTrajectory(data, format)];
                    case 3:
                        trajectory = _e.sent();
                        return [4 /*yield*/, this.plugin.builders.structure.createModel(trajectory)];
                    case 4:
                        model = _e.sent();
                        return [4 /*yield*/, this.plugin.builders.structure.createStructure(model, assemblyId ? { name: 'assembly', params: { id: assemblyId } } : { name: 'model', params: {} })];
                    case 5:
                        structure = _e.sent();
                        return [4 /*yield*/, this.plugin.builders.structure.tryCreateComponentStatic(structure, 'polymer')];
                    case 6:
                        polymer = _e.sent();
                        if (!polymer) return [3 /*break*/, 8];
                        return [4 /*yield*/, this.plugin.builders.structure.representation.addRepresentation(polymer, { type: 'cartoon', color: 'uniform', colorParams: { value: 0x00999999 } })];
                    case 7:
                        _e.sent();
                        _e.label = 8;
                    case 8:
                        myLinesData = [
                            { a: Vec3.create(4.041, 3.101, 1.056), b: Vec3.create(8.771, 7.398, 1.888), color: Color(0x00ff00) },
                            { a: Vec3.create(4.041, 3.101, 1.056), b: Vec3.create(9.881, 10.974, 1.954), color: Color(0xbfbfbf) },
                            { a: Vec3.create(4.041, 3.101, 1.056), b: Vec3.create(2.568, 11.34, 8.683), color: Color(0xbfbfbf) },
                            { a: Vec3.create(4.041, 3.101, 1.056), b: Vec3.create(1.937, 6.599, 9.875), color: Color(0xbfbfbf) },
                            { a: Vec3.create(4.041, 3.101, 1.056), b: Vec3.create(5.46, 5.438, 8.859), color: Color(0x00ff00) },
                            { a: Vec3.create(4.041, 3.101, 1.056), b: Vec3.create(2.488, 2.115, 11.956), color: Color(0x00ff00) },
                            { a: Vec3.create(4.041, 3.101, 1.056), b: Vec3.create(3.717, 0.776, 8.63), color: Color(0xbfbfbf) },
                            { a: Vec3.create(4.041, 3.101, 1.056), b: Vec3.create(11.372, 0.8, 6.38), color: Color(0x00ff00) },
                            { a: Vec3.create(5.047, 6.689, 1.671), b: Vec3.create(9.881, 10.974, 1.954), color: Color(0xbfbfbf) },
                            { a: Vec3.create(5.047, 6.689, 1.671), b: Vec3.create(2.568, 11.34, 8.683), color: Color(0xbfbfbf) },
                            { a: Vec3.create(8.771, 7.398, 1.888), b: Vec3.create(13.344, 12.339, 1.591), color: Color(0xbfbfbf) },
                            { a: Vec3.create(8.771, 7.398, 1.888), b: Vec3.create(5.46, 5.438, 8.859), color: Color(0x00ff00) },
                            { a: Vec3.create(8.771, 7.398, 1.888), b: Vec3.create(13.589, -1.1, 3.926), color: Color(0xbfbfbf) },
                            { a: Vec3.create(8.771, 7.398, 1.888), b: Vec3.create(11.372, 0.8, 6.38), color: Color(0x00ff00) },
                            { a: Vec3.create(8.771, 7.398, 1.888), b: Vec3.create(14.882, 4.529, 5.937), color: Color(0x00ff00) },
                            { a: Vec3.create(8.771, 7.398, 1.888), b: Vec3.create(16.146, 10.207, 8.106), color: Color(0x00ff00) },
                            { a: Vec3.create(9.881, 10.974, 1.954), b: Vec3.create(12.373, 14.45, 8.533), color: Color(0xbfbfbf) },
                            { a: Vec3.create(9.881, 10.974, 1.954), b: Vec3.create(11.317, 17.967, 7.51), color: Color(0xbfbfbf) },
                            { a: Vec3.create(9.881, 10.974, 1.954), b: Vec3.create(8.972, 16.651, 4.785), color: Color(0xbfbfbf) },
                            { a: Vec3.create(9.881, 10.974, 1.954), b: Vec3.create(2.568, 11.34, 8.683), color: Color(0x00ff00) },
                            { a: Vec3.create(9.881, 10.974, 1.954), b: Vec3.create(5.633, 10.167, 10.626), color: Color(0xbfbfbf) },
                            { a: Vec3.create(9.881, 10.974, 1.954), b: Vec3.create(5.46, 5.438, 8.859), color: Color(0xbfbfbf) },
                            { a: Vec3.create(9.881, 10.974, 1.954), b: Vec3.create(14.882, 4.529, 5.937), color: Color(0x00ff00) },
                            { a: Vec3.create(9.881, 10.974, 1.954), b: Vec3.create(16.146, 10.207, 8.106), color: Color(0xbfbfbf) },
                            { a: Vec3.create(13.344, 12.339, 1.591), b: Vec3.create(12.373, 14.45, 8.533), color: Color(0xbfbfbf) },
                            { a: Vec3.create(13.344, 12.339, 1.591), b: Vec3.create(11.317, 17.967, 7.51), color: Color(0xbfbfbf) },
                            { a: Vec3.create(13.344, 12.339, 1.591), b: Vec3.create(8.972, 16.651, 4.785), color: Color(0xbfbfbf) },
                            { a: Vec3.create(13.344, 12.339, 1.591), b: Vec3.create(18.71, 7.421, 7.688), color: Color(0xbfbfbf) },
                            { a: Vec3.create(13.344, 12.339, 1.591), b: Vec3.create(16.146, 10.207, 8.106), color: Color(0xbfbfbf) },
                            { a: Vec3.create(13.81, 13.85, 5.054), b: Vec3.create(11.317, 17.967, 7.51), color: Color(0xbfbfbf) },
                            { a: Vec3.create(13.81, 13.85, 5.054), b: Vec3.create(8.972, 16.651, 4.785), color: Color(0xbfbfbf) },
                            { a: Vec3.create(13.81, 13.85, 5.054), b: Vec3.create(6.906, 14.765, 7.36), color: Color(0xbfbfbf) },
                            { a: Vec3.create(13.81, 13.85, 5.054), b: Vec3.create(18.71, 7.421, 7.688), color: Color(0x00ff00) },
                            { a: Vec3.create(13.81, 13.85, 5.054), b: Vec3.create(16.146, 10.207, 8.106), color: Color(0xbfbfbf) },
                            { a: Vec3.create(12.373, 14.45, 8.533), b: Vec3.create(8.972, 16.651, 4.785), color: Color(0xbfbfbf) },
                            { a: Vec3.create(12.373, 14.45, 8.533), b: Vec3.create(6.906, 14.765, 7.36), color: Color(0x00ff00) },
                            { a: Vec3.create(12.373, 14.45, 8.533), b: Vec3.create(5.633, 10.167, 10.626), color: Color(0x00ff00) },
                            { a: Vec3.create(12.373, 14.45, 8.533), b: Vec3.create(18.71, 7.421, 7.688), color: Color(0xbfbfbf) },
                            { a: Vec3.create(12.373, 14.45, 8.533), b: Vec3.create(16.146, 10.207, 8.106), color: Color(0x00ff00) },
                            { a: Vec3.create(12.373, 14.45, 8.533), b: Vec3.create(15.928, 10.541, 11.891), color: Color(0x00ff00) },
                            { a: Vec3.create(12.373, 14.45, 8.533), b: Vec3.create(19.734, 10.588, 12.26), color: Color(0xbfbfbf) },
                            { a: Vec3.create(12.373, 14.45, 8.533), b: Vec3.create(13.131, 12.816, 17.827), color: Color(0x00ff00) },
                            { a: Vec3.create(12.373, 14.45, 8.533), b: Vec3.create(11.761, 16.309, 18.096), color: Color(0xbfbfbf) },
                            { a: Vec3.create(12.373, 14.45, 8.533), b: Vec3.create(16.862, 17.526, 16.81), color: Color(0xbfbfbf) },
                            { a: Vec3.create(11.317, 17.967, 7.51), b: Vec3.create(16.146, 10.207, 8.106), color: Color(0xbfbfbf) },
                            { a: Vec3.create(8.972, 16.651, 4.785), b: Vec3.create(4.244, 16.096, 9.65), color: Color(0xbfbfbf) },
                            { a: Vec3.create(8.972, 16.651, 4.785), b: Vec3.create(2.568, 11.34, 8.683), color: Color(0xbfbfbf) },
                            { a: Vec3.create(8.972, 16.651, 4.785), b: Vec3.create(16.146, 10.207, 8.106), color: Color(0xbfbfbf) },
                            { a: Vec3.create(6.906, 14.765, 7.36), b: Vec3.create(4.137, 14.354, 13.042), color: Color(0xbfbfbf) },
                            { a: Vec3.create(6.906, 14.765, 7.36), b: Vec3.create(1.039, 12.444, 11.951), color: Color(0xbfbfbf) },
                            { a: Vec3.create(6.906, 14.765, 7.36), b: Vec3.create(2.568, 11.34, 8.683), color: Color(0xff0000) },
                            { a: Vec3.create(6.906, 14.765, 7.36), b: Vec3.create(5.633, 10.167, 10.626), color: Color(0xbfbfbf) },
                            { a: Vec3.create(6.906, 14.765, 7.36), b: Vec3.create(3.356, 8.301, 12.978), color: Color(0xbfbfbf) },
                            { a: Vec3.create(6.906, 14.765, 7.36), b: Vec3.create(5.46, 5.438, 8.859), color: Color(0xbfbfbf) },
                            { a: Vec3.create(6.906, 14.765, 7.36), b: Vec3.create(16.146, 10.207, 8.106), color: Color(0xbfbfbf) },
                            { a: Vec3.create(6.906, 14.765, 7.36), b: Vec3.create(8.08, 11.478, 17.711), color: Color(0xbfbfbf) },
                            { a: Vec3.create(4.244, 16.096, 9.65), b: Vec3.create(1.039, 12.444, 11.951), color: Color(0xbfbfbf) },
                            { a: Vec3.create(4.244, 16.096, 9.65), b: Vec3.create(2.568, 11.34, 8.683), color: Color(0xbfbfbf) },
                            { a: Vec3.create(4.244, 16.096, 9.65), b: Vec3.create(5.633, 10.167, 10.626), color: Color(0xbfbfbf) },
                            { a: Vec3.create(4.244, 16.096, 9.65), b: Vec3.create(3.356, 8.301, 12.978), color: Color(0xbfbfbf) },
                            { a: Vec3.create(4.137, 14.354, 13.042), b: Vec3.create(2.568, 11.34, 8.683), color: Color(0x00ff00) },
                            { a: Vec3.create(4.137, 14.354, 13.042), b: Vec3.create(5.633, 10.167, 10.626), color: Color(0xbfbfbf) },
                            { a: Vec3.create(4.137, 14.354, 13.042), b: Vec3.create(3.356, 8.301, 12.978), color: Color(0xbfbfbf) },
                            { a: Vec3.create(4.137, 14.354, 13.042), b: Vec3.create(3.907, 9.825, 19.549), color: Color(0x00ff00) },
                            { a: Vec3.create(4.137, 14.354, 13.042), b: Vec3.create(8.692, 13.508, 20.889), color: Color(0x00ff00) },
                            { a: Vec3.create(4.137, 14.354, 13.042), b: Vec3.create(11.761, 16.309, 18.096), color: Color(0x00ff00) },
                            { a: Vec3.create(1.039, 12.444, 11.951), b: Vec3.create(5.633, 10.167, 10.626), color: Color(0xbfbfbf) },
                            { a: Vec3.create(1.039, 12.444, 11.951), b: Vec3.create(3.356, 8.301, 12.978), color: Color(0x00ff00) },
                            { a: Vec3.create(1.039, 12.444, 11.951), b: Vec3.create(1.937, 6.599, 9.875), color: Color(0xbfbfbf) },
                            { a: Vec3.create(1.039, 12.444, 11.951), b: Vec3.create(8.08, 11.478, 17.711), color: Color(0xbfbfbf) },
                            { a: Vec3.create(2.568, 11.34, 8.683), b: Vec3.create(3.356, 8.301, 12.978), color: Color(0xbfbfbf) },
                            { a: Vec3.create(2.568, 11.34, 8.683), b: Vec3.create(1.937, 6.599, 9.875), color: Color(0xff0000) },
                            { a: Vec3.create(2.568, 11.34, 8.683), b: Vec3.create(5.46, 5.438, 8.859), color: Color(0xbfbfbf) },
                            { a: Vec3.create(5.633, 10.167, 10.626), b: Vec3.create(5.46, 5.438, 8.859), color: Color(0x00ff00) },
                            { a: Vec3.create(5.633, 10.167, 10.626), b: Vec3.create(5.826, 4.017, 12.38), color: Color(0x00ff00) },
                            { a: Vec3.create(5.633, 10.167, 10.626), b: Vec3.create(13.818, 5.313, 9.555), color: Color(0x00ff00) },
                            { a: Vec3.create(5.633, 10.167, 10.626), b: Vec3.create(16.146, 10.207, 8.106), color: Color(0x00ff00) },
                            { a: Vec3.create(5.633, 10.167, 10.626), b: Vec3.create(15.928, 10.541, 11.891), color: Color(0x00ff00) },
                            { a: Vec3.create(5.633, 10.167, 10.626), b: Vec3.create(9.139, 8.283, 19.473), color: Color(0x00ff00) },
                            { a: Vec3.create(5.633, 10.167, 10.626), b: Vec3.create(13.131, 12.816, 17.827), color: Color(0x00ff00) },
                            { a: Vec3.create(5.633, 10.167, 10.626), b: Vec3.create(11.761, 16.309, 18.096), color: Color(0xbfbfbf) },
                            { a: Vec3.create(3.356, 8.301, 12.978), b: Vec3.create(5.46, 5.438, 8.859), color: Color(0x00ff00) },
                            { a: Vec3.create(3.356, 8.301, 12.978), b: Vec3.create(5.826, 4.017, 12.38), color: Color(0x00ff00) },
                            { a: Vec3.create(3.356, 8.301, 12.978), b: Vec3.create(2.488, 2.115, 11.956), color: Color(0xbfbfbf) },
                            { a: Vec3.create(3.356, 8.301, 12.978), b: Vec3.create(4.3, 6.288, 18.3), color: Color(0xbfbfbf) },
                            { a: Vec3.create(3.356, 8.301, 12.978), b: Vec3.create(3.907, 9.825, 19.549), color: Color(0xbfbfbf) },
                            { a: Vec3.create(3.356, 8.301, 12.978), b: Vec3.create(9.139, 8.283, 19.473), color: Color(0x00ff00) },
                            { a: Vec3.create(1.937, 6.599, 9.875), b: Vec3.create(4.3, 6.288, 18.3), color: Color(0x00ff00) },
                            { a: Vec3.create(5.46, 5.438, 8.859), b: Vec3.create(3.717, 0.776, 8.63), color: Color(0xbfbfbf) },
                            { a: Vec3.create(5.46, 5.438, 8.859), b: Vec3.create(6.804, -0.484, 10.49), color: Color(0x00ff00) },
                            { a: Vec3.create(5.46, 5.438, 8.859), b: Vec3.create(11.372, 0.8, 6.38), color: Color(0x00ff00) },
                            { a: Vec3.create(5.46, 5.438, 8.859), b: Vec3.create(13.818, 5.313, 9.555), color: Color(0x00ff00) },
                            { a: Vec3.create(5.46, 5.438, 8.859), b: Vec3.create(16.146, 10.207, 8.106), color: Color(0x00ff00) },
                            { a: Vec3.create(5.46, 5.438, 8.859), b: Vec3.create(8.08, 11.478, 17.711), color: Color(0x00ff00) },
                            { a: Vec3.create(5.826, 4.017, 12.38), b: Vec3.create(3.717, 0.776, 8.63), color: Color(0x00ff00) },
                            { a: Vec3.create(5.826, 4.017, 12.38), b: Vec3.create(6.804, -0.484, 10.49), color: Color(0x00ff00) },
                            { a: Vec3.create(5.826, 4.017, 12.38), b: Vec3.create(11.372, 0.8, 6.38), color: Color(0x00ff00) },
                            { a: Vec3.create(5.826, 4.017, 12.38), b: Vec3.create(13.818, 5.313, 9.555), color: Color(0x00ff00) },
                            { a: Vec3.create(5.826, 4.017, 12.38), b: Vec3.create(11.396, 1.361, 18.511), color: Color(0x00ff00) },
                            { a: Vec3.create(5.826, 4.017, 12.38), b: Vec3.create(4.281, 4.768, 21.777), color: Color(0xbfbfbf) },
                            { a: Vec3.create(5.826, 4.017, 12.38), b: Vec3.create(4.3, 6.288, 18.3), color: Color(0x00ff00) },
                            { a: Vec3.create(5.826, 4.017, 12.38), b: Vec3.create(3.907, 9.825, 19.549), color: Color(0x00ff00) },
                            { a: Vec3.create(5.826, 4.017, 12.38), b: Vec3.create(9.139, 8.283, 19.473), color: Color(0x00ff00) },
                            { a: Vec3.create(5.826, 4.017, 12.38), b: Vec3.create(13.131, 12.816, 17.827), color: Color(0x00ff00) },
                            { a: Vec3.create(2.488, 2.115, 11.956), b: Vec3.create(6.804, -0.484, 10.49), color: Color(0x00ff00) },
                            { a: Vec3.create(2.488, 2.115, 11.956), b: Vec3.create(4.53, -1.982, 13.183), color: Color(0xbfbfbf) },
                            { a: Vec3.create(2.488, 2.115, 11.956), b: Vec3.create(4.3, 6.288, 18.3), color: Color(0xbfbfbf) },
                            { a: Vec3.create(3.717, 0.776, 8.63), b: Vec3.create(2.68, -3.822, 10.411), color: Color(0xbfbfbf) },
                            { a: Vec3.create(3.717, 0.776, 8.63), b: Vec3.create(9.8, -4.494, 3.39), color: Color(0x00ff00) },
                            { a: Vec3.create(3.717, 0.776, 8.63), b: Vec3.create(10.62, -4.22, 7.104), color: Color(0xbfbfbf) },
                            { a: Vec3.create(3.717, 0.776, 8.63), b: Vec3.create(11.372, 0.8, 6.38), color: Color(0xbfbfbf) },
                            { a: Vec3.create(3.717, 0.776, 8.63), b: Vec3.create(4.3, 6.288, 18.3), color: Color(0x00ff00) },
                            { a: Vec3.create(6.804, -0.484, 10.49), b: Vec3.create(2.68, -3.822, 10.411), color: Color(0xbfbfbf) },
                            { a: Vec3.create(6.804, -0.484, 10.49), b: Vec3.create(5.853, -5.24, 8.87), color: Color(0xbfbfbf) },
                            { a: Vec3.create(6.804, -0.484, 10.49), b: Vec3.create(10.62, -4.22, 7.104), color: Color(0xbfbfbf) },
                            { a: Vec3.create(6.804, -0.484, 10.49), b: Vec3.create(11.372, 0.8, 6.38), color: Color(0x00ff00) },
                            { a: Vec3.create(6.804, -0.484, 10.49), b: Vec3.create(13.949, 0.377, 9.191), color: Color(0x00ff00) },
                            { a: Vec3.create(6.804, -0.484, 10.49), b: Vec3.create(14.882, 4.529, 5.937), color: Color(0x00ff00) },
                            { a: Vec3.create(6.804, -0.484, 10.49), b: Vec3.create(13.818, 5.313, 9.555), color: Color(0x00ff00) },
                            { a: Vec3.create(6.804, -0.484, 10.49), b: Vec3.create(16.025, 1.452, 15.706), color: Color(0x00ff00) },
                            { a: Vec3.create(6.804, -0.484, 10.49), b: Vec3.create(11.396, 1.361, 18.511), color: Color(0x00ff00) },
                            { a: Vec3.create(6.804, -0.484, 10.49), b: Vec3.create(9.139, 8.283, 19.473), color: Color(0x00ff00) },
                            { a: Vec3.create(4.53, -1.982, 13.183), b: Vec3.create(5.853, -5.24, 8.87), color: Color(0xbfbfbf) },
                            { a: Vec3.create(4.53, -1.982, 13.183), b: Vec3.create(4.332, -9.294, 11.844), color: Color(0xbfbfbf) },
                            { a: Vec3.create(4.53, -1.982, 13.183), b: Vec3.create(6.603, 3.569, 24.536), color: Color(0xbfbfbf) },
                            { a: Vec3.create(4.53, -1.982, 13.183), b: Vec3.create(4.281, 4.768, 21.777), color: Color(0xbfbfbf) },
                            { a: Vec3.create(2.68, -3.822, 10.411), b: Vec3.create(7.013, -6.604, 12.205), color: Color(0xbfbfbf) },
                            { a: Vec3.create(2.68, -3.822, 10.411), b: Vec3.create(4.332, -9.294, 11.844), color: Color(0xbfbfbf) },
                            { a: Vec3.create(2.68, -3.822, 10.411), b: Vec3.create(5.011, -9.772, 8.156), color: Color(0xbfbfbf) },
                            { a: Vec3.create(2.68, -3.822, 10.411), b: Vec3.create(9.8, -4.494, 3.39), color: Color(0xbfbfbf) },
                            { a: Vec3.create(2.68, -3.822, 10.411), b: Vec3.create(10.62, -4.22, 7.104), color: Color(0xbfbfbf) },
                            { a: Vec3.create(2.68, -3.822, 10.411), b: Vec3.create(11.372, 0.8, 6.38), color: Color(0xbfbfbf) },
                            { a: Vec3.create(5.853, -5.24, 8.87), b: Vec3.create(4.332, -9.294, 11.844), color: Color(0xbfbfbf) },
                            { a: Vec3.create(5.853, -5.24, 8.87), b: Vec3.create(5.011, -9.772, 8.156), color: Color(0xff0000) },
                            { a: Vec3.create(5.853, -5.24, 8.87), b: Vec3.create(9.131, -11.946, 5.482), color: Color(0xbfbfbf) },
                            { a: Vec3.create(5.853, -5.24, 8.87), b: Vec3.create(11.5, -9.072, 6.39), color: Color(0xbfbfbf) },
                            { a: Vec3.create(5.853, -5.24, 8.87), b: Vec3.create(11.913, -7.618, 2.891), color: Color(0xbfbfbf) },
                            { a: Vec3.create(5.853, -5.24, 8.87), b: Vec3.create(10.62, -4.22, 7.104), color: Color(0xbfbfbf) },
                            { a: Vec3.create(5.853, -5.24, 8.87), b: Vec3.create(14.362, -3.834, 6.485), color: Color(0xbfbfbf) },
                            { a: Vec3.create(5.853, -5.24, 8.87), b: Vec3.create(13.589, -1.1, 3.926), color: Color(0xbfbfbf) },
                            { a: Vec3.create(5.853, -5.24, 8.87), b: Vec3.create(13.949, 0.377, 9.191), color: Color(0xbfbfbf) },
                            { a: Vec3.create(7.013, -6.604, 12.205), b: Vec3.create(5.011, -9.772, 8.156), color: Color(0xbfbfbf) },
                            { a: Vec3.create(7.013, -6.604, 12.205), b: Vec3.create(11.5, -9.072, 6.39), color: Color(0xbfbfbf) },
                            { a: Vec3.create(7.013, -6.604, 12.205), b: Vec3.create(10.62, -4.22, 7.104), color: Color(0xff0000) },
                            { a: Vec3.create(7.013, -6.604, 12.205), b: Vec3.create(11.372, 0.8, 6.38), color: Color(0xbfbfbf) },
                            { a: Vec3.create(7.013, -6.604, 12.205), b: Vec3.create(13.949, 0.377, 9.191), color: Color(0xbfbfbf) },
                            { a: Vec3.create(7.013, -6.604, 12.205), b: Vec3.create(11.396, 1.361, 18.511), color: Color(0xbfbfbf) },
                            { a: Vec3.create(7.013, -6.604, 12.205), b: Vec3.create(12.507, -1.875, 20.16), color: Color(0xff0000) },
                            { a: Vec3.create(4.332, -9.294, 11.844), b: Vec3.create(5.976, -13.286, 7.095), color: Color(0xbfbfbf) },
                            { a: Vec3.create(4.332, -9.294, 11.844), b: Vec3.create(10.62, -4.22, 7.104), color: Color(0xbfbfbf) },
                            { a: Vec3.create(5.011, -9.772, 8.156), b: Vec3.create(9.131, -11.946, 5.482), color: Color(0xbfbfbf) },
                            { a: Vec3.create(5.011, -9.772, 8.156), b: Vec3.create(11.5, -9.072, 6.39), color: Color(0xbfbfbf) },
                            { a: Vec3.create(5.011, -9.772, 8.156), b: Vec3.create(11.913, -7.618, 2.891), color: Color(0xbfbfbf) },
                            { a: Vec3.create(5.011, -9.772, 8.156), b: Vec3.create(9.8, -4.494, 3.39), color: Color(0xbfbfbf) },
                            { a: Vec3.create(5.011, -9.772, 8.156), b: Vec3.create(10.62, -4.22, 7.104), color: Color(0xbfbfbf) },
                            { a: Vec3.create(9.131, -11.946, 5.482), b: Vec3.create(9.8, -4.494, 3.39), color: Color(0xbfbfbf) },
                            { a: Vec3.create(9.131, -11.946, 5.482), b: Vec3.create(10.62, -4.22, 7.104), color: Color(0xbfbfbf) },
                            { a: Vec3.create(9.131, -11.946, 5.482), b: Vec3.create(14.362, -3.834, 6.485), color: Color(0xbfbfbf) },
                            { a: Vec3.create(11.5, -9.072, 6.39), b: Vec3.create(14.362, -3.834, 6.485), color: Color(0xff0000) },
                            { a: Vec3.create(11.5, -9.072, 6.39), b: Vec3.create(13.589, -1.1, 3.926), color: Color(0xbfbfbf) },
                            { a: Vec3.create(11.5, -9.072, 6.39), b: Vec3.create(13.949, 0.377, 9.191), color: Color(0xbfbfbf) },
                            { a: Vec3.create(11.913, -7.618, 2.891), b: Vec3.create(10.62, -4.22, 7.104), color: Color(0xbfbfbf) },
                            { a: Vec3.create(11.913, -7.618, 2.891), b: Vec3.create(14.362, -3.834, 6.485), color: Color(0xff0000) },
                            { a: Vec3.create(11.913, -7.618, 2.891), b: Vec3.create(13.589, -1.1, 3.926), color: Color(0xbfbfbf) },
                            { a: Vec3.create(9.8, -4.494, 3.39), b: Vec3.create(11.372, 0.8, 6.38), color: Color(0xbfbfbf) },
                            { a: Vec3.create(10.62, -4.22, 7.104), b: Vec3.create(13.589, -1.1, 3.926), color: Color(0xbfbfbf) },
                            { a: Vec3.create(10.62, -4.22, 7.104), b: Vec3.create(11.372, 0.8, 6.38), color: Color(0x00ff00) },
                            { a: Vec3.create(10.62, -4.22, 7.104), b: Vec3.create(13.949, 0.377, 9.191), color: Color(0x00ff00) },
                            { a: Vec3.create(14.362, -3.834, 6.485), b: Vec3.create(11.372, 0.8, 6.38), color: Color(0xbfbfbf) },
                            { a: Vec3.create(14.362, -3.834, 6.485), b: Vec3.create(13.949, 0.377, 9.191), color: Color(0xff0000) },
                            { a: Vec3.create(13.589, -1.1, 3.926), b: Vec3.create(13.949, 0.377, 9.191), color: Color(0xbfbfbf) },
                            { a: Vec3.create(13.589, -1.1, 3.926), b: Vec3.create(16.895, 1.478, 6.984), color: Color(0xff0000) },
                            { a: Vec3.create(13.589, -1.1, 3.926), b: Vec3.create(14.882, 4.529, 5.937), color: Color(0xbfbfbf) },
                            { a: Vec3.create(11.372, 0.8, 6.38), b: Vec3.create(16.895, 1.478, 6.984), color: Color(0xbfbfbf) },
                            { a: Vec3.create(11.372, 0.8, 6.38), b: Vec3.create(14.882, 4.529, 5.937), color: Color(0x00ff00) },
                            { a: Vec3.create(11.372, 0.8, 6.38), b: Vec3.create(13.818, 5.313, 9.555), color: Color(0x00ff00) },
                            { a: Vec3.create(13.949, 0.377, 9.191), b: Vec3.create(14.882, 4.529, 5.937), color: Color(0x00ff00) },
                            { a: Vec3.create(13.949, 0.377, 9.191), b: Vec3.create(13.818, 5.313, 9.555), color: Color(0x00ff00) },
                            { a: Vec3.create(13.949, 0.377, 9.191), b: Vec3.create(17.476, 5.337, 10.633), color: Color(0xbfbfbf) },
                            { a: Vec3.create(13.949, 0.377, 9.191), b: Vec3.create(18.755, 4.134, 15.65), color: Color(0xbfbfbf) },
                            { a: Vec3.create(13.949, 0.377, 9.191), b: Vec3.create(16.025, 1.452, 15.706), color: Color(0x00ff00) },
                            { a: Vec3.create(13.949, 0.377, 9.191), b: Vec3.create(11.396, 1.361, 18.511), color: Color(0x00ff00) },
                            { a: Vec3.create(13.949, 0.377, 9.191), b: Vec3.create(12.507, -1.875, 20.16), color: Color(0xbfbfbf) },
                            { a: Vec3.create(16.895, 1.478, 6.984), b: Vec3.create(13.818, 5.313, 9.555), color: Color(0xbfbfbf) },
                            { a: Vec3.create(16.895, 1.478, 6.984), b: Vec3.create(17.476, 5.337, 10.633), color: Color(0xff0000) },
                            { a: Vec3.create(14.882, 4.529, 5.937), b: Vec3.create(17.476, 5.337, 10.633), color: Color(0x00ff00) },
                            { a: Vec3.create(14.882, 4.529, 5.937), b: Vec3.create(18.71, 7.421, 7.688), color: Color(0xbfbfbf) },
                            { a: Vec3.create(14.882, 4.529, 5.937), b: Vec3.create(16.146, 10.207, 8.106), color: Color(0xbfbfbf) },
                            { a: Vec3.create(14.882, 4.529, 5.937), b: Vec3.create(15.928, 10.541, 11.891), color: Color(0x00ff00) },
                            { a: Vec3.create(13.818, 5.313, 9.555), b: Vec3.create(18.71, 7.421, 7.688), color: Color(0xbfbfbf) },
                            { a: Vec3.create(13.818, 5.313, 9.555), b: Vec3.create(16.146, 10.207, 8.106), color: Color(0x00ff00) },
                            { a: Vec3.create(13.818, 5.313, 9.555), b: Vec3.create(15.928, 10.541, 11.891), color: Color(0xbfbfbf) },
                            { a: Vec3.create(13.818, 5.313, 9.555), b: Vec3.create(19.178, 9.728, 15.931), color: Color(0xbfbfbf) },
                            { a: Vec3.create(13.818, 5.313, 9.555), b: Vec3.create(18.755, 4.134, 15.65), color: Color(0xbfbfbf) },
                            { a: Vec3.create(13.818, 5.313, 9.555), b: Vec3.create(16.025, 1.452, 15.706), color: Color(0x00ff00) },
                            { a: Vec3.create(13.818, 5.313, 9.555), b: Vec3.create(13.87, 4.019, 19.615), color: Color(0x00ff00) },
                            { a: Vec3.create(13.818, 5.313, 9.555), b: Vec3.create(11.396, 1.361, 18.511), color: Color(0x00ff00) },
                            { a: Vec3.create(13.818, 5.313, 9.555), b: Vec3.create(9.139, 8.283, 19.473), color: Color(0x00ff00) },
                            { a: Vec3.create(13.818, 5.313, 9.555), b: Vec3.create(13.131, 12.816, 17.827), color: Color(0x00ff00) },
                            { a: Vec3.create(17.476, 5.337, 10.633), b: Vec3.create(16.146, 10.207, 8.106), color: Color(0xbfbfbf) },
                            { a: Vec3.create(17.476, 5.337, 10.633), b: Vec3.create(15.928, 10.541, 11.891), color: Color(0xbfbfbf) },
                            { a: Vec3.create(17.476, 5.337, 10.633), b: Vec3.create(19.734, 10.588, 12.26), color: Color(0xbfbfbf) },
                            { a: Vec3.create(17.476, 5.337, 10.633), b: Vec3.create(19.178, 9.728, 15.931), color: Color(0x00ff00) },
                            { a: Vec3.create(17.476, 5.337, 10.633), b: Vec3.create(20.031, 5.245, 19.067), color: Color(0xbfbfbf) },
                            { a: Vec3.create(17.476, 5.337, 10.633), b: Vec3.create(18.755, 4.134, 15.65), color: Color(0xff0000) },
                            { a: Vec3.create(17.476, 5.337, 10.633), b: Vec3.create(16.025, 1.452, 15.706), color: Color(0xbfbfbf) },
                            { a: Vec3.create(17.476, 5.337, 10.633), b: Vec3.create(13.87, 4.019, 19.615), color: Color(0xbfbfbf) },
                            { a: Vec3.create(18.71, 7.421, 7.688), b: Vec3.create(15.928, 10.541, 11.891), color: Color(0x00ff00) },
                            { a: Vec3.create(18.71, 7.421, 7.688), b: Vec3.create(19.734, 10.588, 12.26), color: Color(0x00ff00) },
                            { a: Vec3.create(16.146, 10.207, 8.106), b: Vec3.create(19.734, 10.588, 12.26), color: Color(0xbfbfbf) },
                            { a: Vec3.create(16.146, 10.207, 8.106), b: Vec3.create(13.131, 12.816, 17.827), color: Color(0x00ff00) },
                            { a: Vec3.create(15.928, 10.541, 11.891), b: Vec3.create(19.178, 9.728, 15.931), color: Color(0x00ff00) },
                            { a: Vec3.create(15.928, 10.541, 11.891), b: Vec3.create(20.031, 5.245, 19.067), color: Color(0xbfbfbf) },
                            { a: Vec3.create(15.928, 10.541, 11.891), b: Vec3.create(18.755, 4.134, 15.65), color: Color(0xbfbfbf) },
                            { a: Vec3.create(15.928, 10.541, 11.891), b: Vec3.create(13.87, 4.019, 19.615), color: Color(0x00ff00) },
                            { a: Vec3.create(15.928, 10.541, 11.891), b: Vec3.create(9.139, 8.283, 19.473), color: Color(0x00ff00) },
                            { a: Vec3.create(15.928, 10.541, 11.891), b: Vec3.create(12.089, 11.895, 21.355), color: Color(0x00ff00) },
                            { a: Vec3.create(15.928, 10.541, 11.891), b: Vec3.create(13.131, 12.816, 17.827), color: Color(0x00ff00) },
                            { a: Vec3.create(15.928, 10.541, 11.891), b: Vec3.create(17.039, 15.556, 20.015), color: Color(0x00ff00) },
                            { a: Vec3.create(15.928, 10.541, 11.891), b: Vec3.create(16.862, 17.526, 16.81), color: Color(0x00ff00) },
                            { a: Vec3.create(19.734, 10.588, 12.26), b: Vec3.create(22.113, 8.159, 17.786), color: Color(0xbfbfbf) },
                            { a: Vec3.create(19.734, 10.588, 12.26), b: Vec3.create(18.755, 4.134, 15.65), color: Color(0xbfbfbf) },
                            { a: Vec3.create(19.734, 10.588, 12.26), b: Vec3.create(13.131, 12.816, 17.827), color: Color(0xbfbfbf) },
                            { a: Vec3.create(19.734, 10.588, 12.26), b: Vec3.create(17.039, 15.556, 20.015), color: Color(0xbfbfbf) },
                            { a: Vec3.create(19.734, 10.588, 12.26), b: Vec3.create(16.862, 17.526, 16.81), color: Color(0x00ff00) },
                            { a: Vec3.create(19.734, 10.588, 12.26), b: Vec3.create(21.236, 19.868, 18.107), color: Color(0xbfbfbf) },
                            { a: Vec3.create(19.734, 10.588, 12.26), b: Vec3.create(19.977, 22.768, 15.969), color: Color(0xbfbfbf) },
                            { a: Vec3.create(19.178, 9.728, 15.931), b: Vec3.create(20.031, 5.245, 19.067), color: Color(0xbfbfbf) },
                            { a: Vec3.create(19.178, 9.728, 15.931), b: Vec3.create(18.755, 4.134, 15.65), color: Color(0xbfbfbf) },
                            { a: Vec3.create(19.178, 9.728, 15.931), b: Vec3.create(16.025, 1.452, 15.706), color: Color(0x00ff00) },
                            { a: Vec3.create(19.178, 9.728, 15.931), b: Vec3.create(16.396, 1.173, 19.513), color: Color(0x00ff00) },
                            { a: Vec3.create(19.178, 9.728, 15.931), b: Vec3.create(13.87, 4.019, 19.615), color: Color(0x00ff00) },
                            { a: Vec3.create(19.178, 9.728, 15.931), b: Vec3.create(9.139, 8.283, 19.473), color: Color(0x00ff00) },
                            { a: Vec3.create(19.178, 9.728, 15.931), b: Vec3.create(12.089, 11.895, 21.355), color: Color(0x00ff00) },
                            { a: Vec3.create(19.178, 9.728, 15.931), b: Vec3.create(17.039, 15.556, 20.015), color: Color(0x00ff00) },
                            { a: Vec3.create(19.178, 9.728, 15.931), b: Vec3.create(16.862, 17.526, 16.81), color: Color(0x00ff00) },
                            { a: Vec3.create(19.178, 9.728, 15.931), b: Vec3.create(21.236, 19.868, 18.107), color: Color(0xbfbfbf) },
                            { a: Vec3.create(22.113, 8.159, 17.786), b: Vec3.create(18.755, 4.134, 15.65), color: Color(0xbfbfbf) },
                            { a: Vec3.create(22.113, 8.159, 17.786), b: Vec3.create(16.396, 1.173, 19.513), color: Color(0xbfbfbf) },
                            { a: Vec3.create(22.113, 8.159, 17.786), b: Vec3.create(17.039, 15.556, 20.015), color: Color(0xbfbfbf) },
                            { a: Vec3.create(22.113, 8.159, 17.786), b: Vec3.create(21.236, 19.868, 18.107), color: Color(0xbfbfbf) },
                            { a: Vec3.create(20.031, 5.245, 19.067), b: Vec3.create(16.025, 1.452, 15.706), color: Color(0xbfbfbf) },
                            { a: Vec3.create(20.031, 5.245, 19.067), b: Vec3.create(16.396, 1.173, 19.513), color: Color(0xbfbfbf) },
                            { a: Vec3.create(20.031, 5.245, 19.067), b: Vec3.create(13.87, 4.019, 19.615), color: Color(0xff0000) },
                            { a: Vec3.create(20.031, 5.245, 19.067), b: Vec3.create(11.396, 1.361, 18.511), color: Color(0xbfbfbf) },
                            { a: Vec3.create(20.031, 5.245, 19.067), b: Vec3.create(14.173, -0.533, 23.321), color: Color(0xff0000) },
                            { a: Vec3.create(20.031, 5.245, 19.067), b: Vec3.create(17.039, 15.556, 20.015), color: Color(0xbfbfbf) },
                            { a: Vec3.create(18.755, 4.134, 15.65), b: Vec3.create(16.396, 1.173, 19.513), color: Color(0xff0000) },
                            { a: Vec3.create(18.755, 4.134, 15.65), b: Vec3.create(13.87, 4.019, 19.615), color: Color(0xbfbfbf) },
                            { a: Vec3.create(18.755, 4.134, 15.65), b: Vec3.create(11.396, 1.361, 18.511), color: Color(0xbfbfbf) },
                            { a: Vec3.create(18.755, 4.134, 15.65), b: Vec3.create(12.507, -1.875, 20.16), color: Color(0xbfbfbf) },
                            { a: Vec3.create(16.025, 1.452, 15.706), b: Vec3.create(13.87, 4.019, 19.615), color: Color(0x00ff00) },
                            { a: Vec3.create(16.025, 1.452, 15.706), b: Vec3.create(12.507, -1.875, 20.16), color: Color(0xbfbfbf) },
                            { a: Vec3.create(16.025, 1.452, 15.706), b: Vec3.create(14.173, -0.533, 23.321), color: Color(0xbfbfbf) },
                            { a: Vec3.create(16.396, 1.173, 19.513), b: Vec3.create(11.396, 1.361, 18.511), color: Color(0xbfbfbf) },
                            { a: Vec3.create(16.396, 1.173, 19.513), b: Vec3.create(12.507, -1.875, 20.16), color: Color(0xff0000) },
                            { a: Vec3.create(16.396, 1.173, 19.513), b: Vec3.create(12.373, 2.69, 24.373), color: Color(0xbfbfbf) },
                            { a: Vec3.create(13.87, 4.019, 19.615), b: Vec3.create(12.507, -1.875, 20.16), color: Color(0xbfbfbf) },
                            { a: Vec3.create(13.87, 4.019, 19.615), b: Vec3.create(14.173, -0.533, 23.321), color: Color(0xbfbfbf) },
                            { a: Vec3.create(13.87, 4.019, 19.615), b: Vec3.create(12.373, 2.69, 24.373), color: Color(0xbfbfbf) },
                            { a: Vec3.create(13.87, 4.019, 19.615), b: Vec3.create(6.225, 6.818, 26.537), color: Color(0xbfbfbf) },
                            { a: Vec3.create(13.87, 4.019, 19.615), b: Vec3.create(6.603, 3.569, 24.536), color: Color(0xbfbfbf) },
                            { a: Vec3.create(13.87, 4.019, 19.615), b: Vec3.create(6.562, 8.985, 22.165), color: Color(0xbfbfbf) },
                            { a: Vec3.create(13.87, 4.019, 19.615), b: Vec3.create(9.139, 8.283, 19.473), color: Color(0x00ff00) },
                            { a: Vec3.create(13.87, 4.019, 19.615), b: Vec3.create(13.131, 12.816, 17.827), color: Color(0x00ff00) },
                            { a: Vec3.create(13.87, 4.019, 19.615), b: Vec3.create(17.039, 15.556, 20.015), color: Color(0x00ff00) },
                            { a: Vec3.create(11.396, 1.361, 18.511), b: Vec3.create(14.173, -0.533, 23.321), color: Color(0xbfbfbf) },
                            { a: Vec3.create(11.396, 1.361, 18.511), b: Vec3.create(12.373, 2.69, 24.373), color: Color(0xbfbfbf) },
                            { a: Vec3.create(11.396, 1.361, 18.511), b: Vec3.create(6.603, 3.569, 24.536), color: Color(0xbfbfbf) },
                            { a: Vec3.create(11.396, 1.361, 18.511), b: Vec3.create(9.139, 8.283, 19.473), color: Color(0x00ff00) },
                            { a: Vec3.create(12.507, -1.875, 20.16), b: Vec3.create(6.603, 3.569, 24.536), color: Color(0xbfbfbf) },
                            { a: Vec3.create(14.173, -0.533, 23.321), b: Vec3.create(6.603, 3.569, 24.536), color: Color(0xbfbfbf) },
                            { a: Vec3.create(12.373, 2.69, 24.373), b: Vec3.create(11.565, 7.408, 31.226), color: Color(0xbfbfbf) },
                            { a: Vec3.create(12.373, 2.69, 24.373), b: Vec3.create(9.664, 7.823, 27.957), color: Color(0xbfbfbf) },
                            { a: Vec3.create(12.373, 2.69, 24.373), b: Vec3.create(6.225, 6.818, 26.537), color: Color(0xbfbfbf) },
                            { a: Vec3.create(12.373, 2.69, 24.373), b: Vec3.create(6.603, 3.569, 24.536), color: Color(0xbfbfbf) },
                            { a: Vec3.create(12.373, 2.69, 24.373), b: Vec3.create(4.281, 4.768, 21.777), color: Color(0xbfbfbf) },
                            { a: Vec3.create(12.373, 2.69, 24.373), b: Vec3.create(6.562, 8.985, 22.165), color: Color(0xbfbfbf) },
                            { a: Vec3.create(12.373, 2.69, 24.373), b: Vec3.create(9.139, 8.283, 19.473), color: Color(0xbfbfbf) },
                            { a: Vec3.create(12.373, 2.69, 24.373), b: Vec3.create(12.089, 11.895, 21.355), color: Color(0xbfbfbf) },
                            { a: Vec3.create(13.967, 4.48, 27.332), b: Vec3.create(11.565, 7.408, 31.226), color: Color(0xbfbfbf) },
                            { a: Vec3.create(13.967, 4.48, 27.332), b: Vec3.create(9.664, 7.823, 27.957), color: Color(0xbfbfbf) },
                            { a: Vec3.create(12.286, 3.666, 30.655), b: Vec3.create(6.603, 3.569, 24.536), color: Color(0xbfbfbf) },
                            { a: Vec3.create(12.286, 3.666, 30.655), b: Vec3.create(6.562, 8.985, 22.165), color: Color(0xbfbfbf) },
                            { a: Vec3.create(11.565, 7.408, 31.226), b: Vec3.create(6.225, 6.818, 26.537), color: Color(0xbfbfbf) },
                            { a: Vec3.create(11.565, 7.408, 31.226), b: Vec3.create(6.603, 3.569, 24.536), color: Color(0xbfbfbf) },
                            { a: Vec3.create(11.565, 7.408, 31.226), b: Vec3.create(4.281, 4.768, 21.777), color: Color(0xbfbfbf) },
                            { a: Vec3.create(9.664, 7.823, 27.957), b: Vec3.create(4.281, 4.768, 21.777), color: Color(0xbfbfbf) },
                            { a: Vec3.create(6.225, 6.818, 26.537), b: Vec3.create(4.281, 4.768, 21.777), color: Color(0xbfbfbf) },
                            { a: Vec3.create(6.225, 6.818, 26.537), b: Vec3.create(9.139, 8.283, 19.473), color: Color(0xbfbfbf) },
                            { a: Vec3.create(6.603, 3.569, 24.536), b: Vec3.create(6.562, 8.985, 22.165), color: Color(0xbfbfbf) },
                            { a: Vec3.create(6.603, 3.569, 24.536), b: Vec3.create(9.139, 8.283, 19.473), color: Color(0xbfbfbf) },
                            { a: Vec3.create(4.281, 4.768, 21.777), b: Vec3.create(3.907, 9.825, 19.549), color: Color(0xbfbfbf) },
                            { a: Vec3.create(4.281, 4.768, 21.777), b: Vec3.create(6.562, 8.985, 22.165), color: Color(0xbfbfbf) },
                            { a: Vec3.create(4.281, 4.768, 21.777), b: Vec3.create(9.139, 8.283, 19.473), color: Color(0xbfbfbf) },
                            { a: Vec3.create(4.281, 4.768, 21.777), b: Vec3.create(8.08, 11.478, 17.711), color: Color(0xbfbfbf) },
                            { a: Vec3.create(4.281, 4.768, 21.777), b: Vec3.create(8.692, 13.508, 20.889), color: Color(0xbfbfbf) },
                            { a: Vec3.create(4.3, 6.288, 18.3), b: Vec3.create(6.562, 8.985, 22.165), color: Color(0xbfbfbf) },
                            { a: Vec3.create(4.3, 6.288, 18.3), b: Vec3.create(9.139, 8.283, 19.473), color: Color(0xbfbfbf) },
                            { a: Vec3.create(4.3, 6.288, 18.3), b: Vec3.create(8.08, 11.478, 17.711), color: Color(0xbfbfbf) },
                            { a: Vec3.create(6.562, 8.985, 22.165), b: Vec3.create(8.08, 11.478, 17.711), color: Color(0xbfbfbf) },
                            { a: Vec3.create(6.562, 8.985, 22.165), b: Vec3.create(12.089, 11.895, 21.355), color: Color(0xbfbfbf) },
                            { a: Vec3.create(9.139, 8.283, 19.473), b: Vec3.create(8.692, 13.508, 20.889), color: Color(0xbfbfbf) },
                            { a: Vec3.create(9.139, 8.283, 19.473), b: Vec3.create(13.131, 12.816, 17.827), color: Color(0x00ff00) },
                            { a: Vec3.create(8.08, 11.478, 17.711), b: Vec3.create(12.089, 11.895, 21.355), color: Color(0x00ff00) },
                            { a: Vec3.create(8.692, 13.508, 20.889), b: Vec3.create(13.131, 12.816, 17.827), color: Color(0xbfbfbf) },
                            { a: Vec3.create(8.692, 13.508, 20.889), b: Vec3.create(11.761, 16.309, 18.096), color: Color(0xff0000) },
                            { a: Vec3.create(8.692, 13.508, 20.889), b: Vec3.create(13.736, 17.034, 21.229), color: Color(0xbfbfbf) },
                            { a: Vec3.create(12.089, 11.895, 21.355), b: Vec3.create(13.736, 17.034, 21.229), color: Color(0xbfbfbf) },
                            { a: Vec3.create(12.089, 11.895, 21.355), b: Vec3.create(17.039, 15.556, 20.015), color: Color(0xbfbfbf) },
                            { a: Vec3.create(13.131, 12.816, 17.827), b: Vec3.create(13.736, 17.034, 21.229), color: Color(0xbfbfbf) },
                            { a: Vec3.create(13.131, 12.816, 17.827), b: Vec3.create(17.039, 15.556, 20.015), color: Color(0x00ff00) },
                            { a: Vec3.create(13.131, 12.816, 17.827), b: Vec3.create(16.862, 17.526, 16.81), color: Color(0xbfbfbf) },
                            { a: Vec3.create(11.761, 16.309, 18.096), b: Vec3.create(16.862, 17.526, 16.81), color: Color(0xff0000) },
                            { a: Vec3.create(11.761, 16.309, 18.096), b: Vec3.create(16.038, 20.773, 18.654), color: Color(0xff0000) },
                            { a: Vec3.create(13.736, 17.034, 21.229), b: Vec3.create(16.862, 17.526, 16.81), color: Color(0x00ff00) },
                            { a: Vec3.create(13.736, 17.034, 21.229), b: Vec3.create(16.038, 20.773, 18.654), color: Color(0xff0000) },
                            { a: Vec3.create(17.039, 15.556, 20.015), b: Vec3.create(16.038, 20.773, 18.654), color: Color(0xbfbfbf) },
                            { a: Vec3.create(17.039, 15.556, 20.015), b: Vec3.create(21.236, 19.868, 18.107), color: Color(0xbfbfbf) },
                            { a: Vec3.create(17.039, 15.556, 20.015), b: Vec3.create(19.977, 22.768, 15.969), color: Color(0xbfbfbf) },
                            { a: Vec3.create(16.862, 17.526, 16.81), b: Vec3.create(18.911, 20.266, 21.084), color: Color(0xbfbfbf) },
                            { a: Vec3.create(16.038, 20.773, 18.654), b: Vec3.create(21.236, 19.868, 18.107), color: Color(0xbfbfbf) },
                            { a: Vec3.create(16.038, 20.773, 18.654), b: Vec3.create(19.977, 22.768, 15.969), color: Color(0xbfbfbf) },
                            { a: Vec3.create(18.911, 20.266, 21.084), b: Vec3.create(19.977, 22.768, 15.969), color: Color(0xbfbfbf) }
                        ];
                        update = this.plugin.build();
                        update.toRoot()
                            .apply(CreateAtomPairsProvider, { lines: myLinesData })
                            .apply(StateTransforms.Representation.ShapeRepresentation3D);
                        return [4 /*yield*/, update.commit()];
                    case 9:
                        _e.sent();
                        this.radius = radius;
                        this.bias = bias;
                        this.setPreset(this.preset);
                        return [2 /*return*/];
                }
            });
        });
    };
    return LightingDemo2;
}());
// Assign instance of LightingDemo to the global window object
window.LightingDemo = new LightingDemo();
// Assign instance of LightingDemo2 to the global window object
window.LightingDemo2 = new LightingDemo2();
