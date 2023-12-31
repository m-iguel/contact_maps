/**
 * Copyright (c) 2018-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { __awaiter, __generator } from "tslib";
import { parseDcd } from '../../mol-io/reader/dcd/parser';
import { parseGRO } from '../../mol-io/reader/gro/parser';
import { parsePDB } from '../../mol-io/reader/pdb/parser';
import { Mat4, Vec3 } from '../../mol-math/linear-algebra';
import { shapeFromPly } from '../../mol-model-formats/shape/ply';
import { coordinatesFromDcd } from '../../mol-model-formats/structure/dcd';
import { trajectoryFromGRO } from '../../mol-model-formats/structure/gro';
import { trajectoryFromCCD, trajectoryFromMmCIF } from '../../mol-model-formats/structure/mmcif';
import { trajectoryFromPDB } from '../../mol-model-formats/structure/pdb';
import { topologyFromPsf } from '../../mol-model-formats/structure/psf';
import { Model, Queries, QueryContext, Structure, StructureElement, StructureSelection as Sel, ArrayTrajectory } from '../../mol-model/structure';
import { MolScriptBuilder } from '../../mol-script/language/builder';
import { Script } from '../../mol-script/script';
import { StateObject, StateTransformer } from '../../mol-state';
import { Task } from '../../mol-task';
import { deepEqual } from '../../mol-util';
import { ParamDefinition as PD } from '../../mol-util/param-definition';
import { RootStructureDefinition } from '../helpers/root-structure';
import { createStructureComponent, StructureComponentParams, updateStructureComponent } from '../helpers/structure-component';
import { StructureQueryHelper } from '../helpers/structure-query';
import { StructureSelectionQueries } from '../helpers/structure-selection-query';
import { PluginStateObject as SO, PluginStateTransform } from '../objects';
import { parseMol } from '../../mol-io/reader/mol/parser';
import { trajectoryFromMol } from '../../mol-model-formats/structure/mol';
import { trajectoryFromCifCore } from '../../mol-model-formats/structure/cif-core';
import { trajectoryFromCube } from '../../mol-model-formats/structure/cube';
import { parseMol2 } from '../../mol-io/reader/mol2/parser';
import { trajectoryFromMol2 } from '../../mol-model-formats/structure/mol2';
import { parseXtc } from '../../mol-io/reader/xtc/parser';
import { coordinatesFromXtc } from '../../mol-model-formats/structure/xtc';
import { parseXyz } from '../../mol-io/reader/xyz/parser';
import { trajectoryFromXyz } from '../../mol-model-formats/structure/xyz';
import { parseSdf } from '../../mol-io/reader/sdf/parser';
import { trajectoryFromSdf } from '../../mol-model-formats/structure/sdf';
import { assertUnreachable } from '../../mol-util/type-helpers';
import { parseTrr } from '../../mol-io/reader/trr/parser';
import { coordinatesFromTrr } from '../../mol-model-formats/structure/trr';
import { parseNctraj } from '../../mol-io/reader/nctraj/parser';
import { coordinatesFromNctraj } from '../../mol-model-formats/structure/nctraj';
import { topologyFromPrmtop } from '../../mol-model-formats/structure/prmtop';
import { topologyFromTop } from '../../mol-model-formats/structure/top';
export { CoordinatesFromDcd };
export { CoordinatesFromXtc };
export { CoordinatesFromTrr };
export { CoordinatesFromNctraj };
export { TopologyFromPsf };
export { TopologyFromPrmtop };
export { TopologyFromTop };
export { TrajectoryFromModelAndCoordinates };
export { TrajectoryFromBlob };
export { TrajectoryFromMmCif };
export { TrajectoryFromPDB };
export { TrajectoryFromGRO };
export { TrajectoryFromXYZ };
export { TrajectoryFromMOL };
export { TrajectoryFromSDF };
export { TrajectoryFromMOL2 };
export { TrajectoryFromCube };
export { TrajectoryFromCifCore };
export { ModelFromTrajectory };
export { StructureFromTrajectory };
export { StructureFromModel };
export { TransformStructureConformation };
export { StructureSelectionFromExpression };
export { MultiStructureSelectionFromExpression };
export { StructureSelectionFromScript };
export { StructureSelectionFromBundle };
export { StructureComplexElement };
export { StructureComponent };
export { CustomModelProperties };
export { CustomStructureProperties };
export { ShapeFromPly };
var CoordinatesFromDcd = PluginStateTransform.BuiltIn({
    name: 'coordinates-from-dcd',
    display: { name: 'Parse DCD', description: 'Parse DCD binary data.' },
    from: [SO.Data.Binary],
    to: SO.Molecule.Coordinates
})({
    apply: function (_a) {
        var _this = this;
        var a = _a.a;
        return Task.create('Parse DCD', function (ctx) { return __awaiter(_this, void 0, void 0, function () {
            var parsed, coordinates;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, parseDcd(a.data).runInContext(ctx)];
                    case 1:
                        parsed = _a.sent();
                        if (parsed.isError)
                            throw new Error(parsed.message);
                        return [4 /*yield*/, coordinatesFromDcd(parsed.result).runInContext(ctx)];
                    case 2:
                        coordinates = _a.sent();
                        return [2 /*return*/, new SO.Molecule.Coordinates(coordinates, { label: a.label, description: 'Coordinates' })];
                }
            });
        }); });
    }
});
var CoordinatesFromXtc = PluginStateTransform.BuiltIn({
    name: 'coordinates-from-xtc',
    display: { name: 'Parse XTC', description: 'Parse XTC binary data.' },
    from: [SO.Data.Binary],
    to: SO.Molecule.Coordinates
})({
    apply: function (_a) {
        var _this = this;
        var a = _a.a;
        return Task.create('Parse XTC', function (ctx) { return __awaiter(_this, void 0, void 0, function () {
            var parsed, coordinates;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, parseXtc(a.data).runInContext(ctx)];
                    case 1:
                        parsed = _a.sent();
                        if (parsed.isError)
                            throw new Error(parsed.message);
                        return [4 /*yield*/, coordinatesFromXtc(parsed.result).runInContext(ctx)];
                    case 2:
                        coordinates = _a.sent();
                        return [2 /*return*/, new SO.Molecule.Coordinates(coordinates, { label: a.label, description: 'Coordinates' })];
                }
            });
        }); });
    }
});
var CoordinatesFromTrr = PluginStateTransform.BuiltIn({
    name: 'coordinates-from-trr',
    display: { name: 'Parse TRR', description: 'Parse TRR binary data.' },
    from: [SO.Data.Binary],
    to: SO.Molecule.Coordinates
})({
    apply: function (_a) {
        var _this = this;
        var a = _a.a;
        return Task.create('Parse TRR', function (ctx) { return __awaiter(_this, void 0, void 0, function () {
            var parsed, coordinates;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, parseTrr(a.data).runInContext(ctx)];
                    case 1:
                        parsed = _a.sent();
                        if (parsed.isError)
                            throw new Error(parsed.message);
                        return [4 /*yield*/, coordinatesFromTrr(parsed.result).runInContext(ctx)];
                    case 2:
                        coordinates = _a.sent();
                        return [2 /*return*/, new SO.Molecule.Coordinates(coordinates, { label: a.label, description: 'Coordinates' })];
                }
            });
        }); });
    }
});
var CoordinatesFromNctraj = PluginStateTransform.BuiltIn({
    name: 'coordinates-from-nctraj',
    display: { name: 'Parse NCTRAJ', description: 'Parse NCTRAJ binary data.' },
    from: [SO.Data.Binary],
    to: SO.Molecule.Coordinates
})({
    apply: function (_a) {
        var _this = this;
        var a = _a.a;
        return Task.create('Parse NCTRAJ', function (ctx) { return __awaiter(_this, void 0, void 0, function () {
            var parsed, coordinates;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, parseNctraj(a.data).runInContext(ctx)];
                    case 1:
                        parsed = _a.sent();
                        if (parsed.isError)
                            throw new Error(parsed.message);
                        return [4 /*yield*/, coordinatesFromNctraj(parsed.result).runInContext(ctx)];
                    case 2:
                        coordinates = _a.sent();
                        return [2 /*return*/, new SO.Molecule.Coordinates(coordinates, { label: a.label, description: 'Coordinates' })];
                }
            });
        }); });
    }
});
var TopologyFromPsf = PluginStateTransform.BuiltIn({
    name: 'topology-from-psf',
    display: { name: 'PSF Topology', description: 'Create topology from PSF.' },
    from: [SO.Format.Psf],
    to: SO.Molecule.Topology
})({
    apply: function (_a) {
        var _this = this;
        var a = _a.a;
        return Task.create('Create Topology', function (ctx) { return __awaiter(_this, void 0, void 0, function () {
            var topology;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, topologyFromPsf(a.data).runInContext(ctx)];
                    case 1:
                        topology = _a.sent();
                        return [2 /*return*/, new SO.Molecule.Topology(topology, { label: topology.label || a.label, description: 'Topology' })];
                }
            });
        }); });
    }
});
var TopologyFromPrmtop = PluginStateTransform.BuiltIn({
    name: 'topology-from-prmtop',
    display: { name: 'PRMTOP Topology', description: 'Create topology from PRMTOP.' },
    from: [SO.Format.Prmtop],
    to: SO.Molecule.Topology
})({
    apply: function (_a) {
        var _this = this;
        var a = _a.a;
        return Task.create('Create Topology', function (ctx) { return __awaiter(_this, void 0, void 0, function () {
            var topology;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, topologyFromPrmtop(a.data).runInContext(ctx)];
                    case 1:
                        topology = _a.sent();
                        return [2 /*return*/, new SO.Molecule.Topology(topology, { label: topology.label || a.label, description: 'Topology' })];
                }
            });
        }); });
    }
});
var TopologyFromTop = PluginStateTransform.BuiltIn({
    name: 'topology-from-top',
    display: { name: 'TOP Topology', description: 'Create topology from TOP.' },
    from: [SO.Format.Top],
    to: SO.Molecule.Topology
})({
    apply: function (_a) {
        var _this = this;
        var a = _a.a;
        return Task.create('Create Topology', function (ctx) { return __awaiter(_this, void 0, void 0, function () {
            var topology;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, topologyFromTop(a.data).runInContext(ctx)];
                    case 1:
                        topology = _a.sent();
                        return [2 /*return*/, new SO.Molecule.Topology(topology, { label: topology.label || a.label, description: 'Topology' })];
                }
            });
        }); });
    }
});
function getTrajectory(ctx, obj, coordinates) {
    return __awaiter(this, void 0, void 0, function () {
        var topology, model;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!(obj.type === SO.Molecule.Topology.type)) return [3 /*break*/, 2];
                    topology = obj.data;
                    return [4 /*yield*/, Model.trajectoryFromTopologyAndCoordinates(topology, coordinates).runInContext(ctx)];
                case 1: return [2 /*return*/, _a.sent()];
                case 2:
                    if (obj.type === SO.Molecule.Model.type) {
                        model = obj.data;
                        return [2 /*return*/, Model.trajectoryFromModelAndCoordinates(model, coordinates)];
                    }
                    _a.label = 3;
                case 3: throw new Error('no model/topology found');
            }
        });
    });
}
var TrajectoryFromModelAndCoordinates = PluginStateTransform.BuiltIn({
    name: 'trajectory-from-model-and-coordinates',
    display: { name: 'Trajectory from Topology & Coordinates', description: 'Create a trajectory from existing model/topology and coordinates.' },
    from: SO.Root,
    to: SO.Molecule.Trajectory,
    params: {
        modelRef: PD.Text('', { isHidden: true }),
        coordinatesRef: PD.Text('', { isHidden: true }),
    }
})({
    apply: function (_a) {
        var _this = this;
        var params = _a.params, dependencies = _a.dependencies;
        return Task.create('Create trajectory from model/topology and coordinates', function (ctx) { return __awaiter(_this, void 0, void 0, function () {
            var coordinates, trajectory, props;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        coordinates = dependencies[params.coordinatesRef].data;
                        return [4 /*yield*/, getTrajectory(ctx, dependencies[params.modelRef], coordinates)];
                    case 1:
                        trajectory = _a.sent();
                        props = { label: 'Trajectory', description: "".concat(trajectory.frameCount, " model").concat(trajectory.frameCount === 1 ? '' : 's') };
                        return [2 /*return*/, new SO.Molecule.Trajectory(trajectory, props)];
                }
            });
        }); });
    }
});
var TrajectoryFromBlob = PluginStateTransform.BuiltIn({
    name: 'trajectory-from-blob',
    display: { name: 'Parse Blob', description: 'Parse format blob into a single trajectory.' },
    from: SO.Format.Blob,
    to: SO.Molecule.Trajectory
})({
    apply: function (_a) {
        var _this = this;
        var a = _a.a;
        return Task.create('Parse Format Blob', function (ctx) { return __awaiter(_this, void 0, void 0, function () {
            var models, _i, _a, e, block, xs, i, x, i, props;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        models = [];
                        _i = 0, _a = a.data;
                        _b.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 7];
                        e = _a[_i];
                        if (e.kind !== 'cif')
                            return [3 /*break*/, 6];
                        block = e.data.blocks[0];
                        return [4 /*yield*/, trajectoryFromMmCIF(block).runInContext(ctx)];
                    case 2:
                        xs = _b.sent();
                        if (xs.frameCount === 0)
                            throw new Error('No models found.');
                        i = 0;
                        _b.label = 3;
                    case 3:
                        if (!(i < xs.frameCount)) return [3 /*break*/, 6];
                        return [4 /*yield*/, Task.resolveInContext(xs.getFrameAtIndex(i), ctx)];
                    case 4:
                        x = _b.sent();
                        models.push(x);
                        _b.label = 5;
                    case 5:
                        i++;
                        return [3 /*break*/, 3];
                    case 6:
                        _i++;
                        return [3 /*break*/, 1];
                    case 7:
                        for (i = 0; i < models.length; i++) {
                            Model.TrajectoryInfo.set(models[i], { index: i, size: models.length });
                        }
                        props = { label: 'Trajectory', description: "".concat(models.length, " model").concat(models.length === 1 ? '' : 's') };
                        return [2 /*return*/, new SO.Molecule.Trajectory(new ArrayTrajectory(models), props)];
                }
            });
        }); });
    }
});
function trajectoryProps(trajectory) {
    var first = trajectory.representative;
    return { label: "".concat(first.entry), description: "".concat(trajectory.frameCount, " model").concat(trajectory.frameCount === 1 ? '' : 's') };
}
var TrajectoryFromMmCif = PluginStateTransform.BuiltIn({
    name: 'trajectory-from-mmcif',
    display: { name: 'Trajectory from mmCIF', description: 'Identify and create all separate models in the specified CIF data block' },
    from: SO.Format.Cif,
    to: SO.Molecule.Trajectory,
    params: function (a) {
        if (!a) {
            return {
                loadAllBlocks: PD.Optional(PD.Boolean(false, { description: 'If True, ignore Block Header parameter and parse all datablocks into a single trajectory.' })),
                blockHeader: PD.Optional(PD.Text(void 0, { description: 'Header of the block to parse. If none is specifed, the 1st data block in the file is used.', hideIf: function (p) { return p.loadAllBlocks === true; } })),
            };
        }
        var blocks = a.data.blocks;
        return {
            loadAllBlocks: PD.Optional(PD.Boolean(false, { description: 'If True, ignore Block Header parameter and parse all data blocks into a single trajectory.' })),
            blockHeader: PD.Optional(PD.Select(blocks[0] && blocks[0].header, blocks.map(function (b) { return [b.header, b.header]; }), { description: 'Header of the block to parse', hideIf: function (p) { return p.loadAllBlocks === true; } })),
        };
    }
})({
    isApplicable: function (a) { return a.data.blocks.length > 0; },
    apply: function (_a) {
        var _this = this;
        var a = _a.a, params = _a.params;
        return Task.create('Parse mmCIF', function (ctx) { return __awaiter(_this, void 0, void 0, function () {
            var trajectory, models, _i, _a, block, t, i, _b, _c, header_1, block, _d, props;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        if (!params.loadAllBlocks) return [3 /*break*/, 10];
                        models = [];
                        _i = 0, _a = a.data.blocks;
                        _e.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 9];
                        block = _a[_i];
                        if (!ctx.shouldUpdate) return [3 /*break*/, 3];
                        return [4 /*yield*/, ctx.update("Parsing ".concat(block.header, "..."))];
                    case 2:
                        _e.sent();
                        _e.label = 3;
                    case 3: return [4 /*yield*/, trajectoryFromMmCIF(block).runInContext(ctx)];
                    case 4:
                        t = _e.sent();
                        i = 0;
                        _e.label = 5;
                    case 5:
                        if (!(i < t.frameCount)) return [3 /*break*/, 8];
                        _c = (_b = models).push;
                        return [4 /*yield*/, Task.resolveInContext(t.getFrameAtIndex(i), ctx)];
                    case 6:
                        _c.apply(_b, [_e.sent()]);
                        _e.label = 7;
                    case 7:
                        i++;
                        return [3 /*break*/, 5];
                    case 8:
                        _i++;
                        return [3 /*break*/, 1];
                    case 9:
                        trajectory = new ArrayTrajectory(models);
                        return [3 /*break*/, 15];
                    case 10:
                        header_1 = params.blockHeader || a.data.blocks[0].header;
                        block = a.data.blocks.find(function (b) { return b.header === header_1; });
                        if (!block)
                            throw new Error("Data block '".concat([header_1], "' not found."));
                        if (!block.categoryNames.includes('chem_comp_atom')) return [3 /*break*/, 12];
                        return [4 /*yield*/, trajectoryFromCCD(block).runInContext(ctx)];
                    case 11:
                        _d = _e.sent();
                        return [3 /*break*/, 14];
                    case 12: return [4 /*yield*/, trajectoryFromMmCIF(block).runInContext(ctx)];
                    case 13:
                        _d = _e.sent();
                        _e.label = 14;
                    case 14:
                        trajectory = _d;
                        _e.label = 15;
                    case 15:
                        if (trajectory.frameCount === 0)
                            throw new Error('No models found.');
                        props = trajectoryProps(trajectory);
                        return [2 /*return*/, new SO.Molecule.Trajectory(trajectory, props)];
                }
            });
        }); });
    }
});
var TrajectoryFromPDB = PluginStateTransform.BuiltIn({
    name: 'trajectory-from-pdb',
    display: { name: 'Parse PDB', description: 'Parse PDB string and create trajectory.' },
    from: [SO.Data.String],
    to: SO.Molecule.Trajectory,
    params: {
        isPdbqt: PD.Boolean(false)
    }
})({
    apply: function (_a) {
        var _this = this;
        var a = _a.a, params = _a.params;
        return Task.create('Parse PDB', function (ctx) { return __awaiter(_this, void 0, void 0, function () {
            var parsed, models, props;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, parsePDB(a.data, a.label, params.isPdbqt).runInContext(ctx)];
                    case 1:
                        parsed = _a.sent();
                        if (parsed.isError)
                            throw new Error(parsed.message);
                        return [4 /*yield*/, trajectoryFromPDB(parsed.result).runInContext(ctx)];
                    case 2:
                        models = _a.sent();
                        props = trajectoryProps(models);
                        return [2 /*return*/, new SO.Molecule.Trajectory(models, props)];
                }
            });
        }); });
    }
});
var TrajectoryFromGRO = PluginStateTransform.BuiltIn({
    name: 'trajectory-from-gro',
    display: { name: 'Parse GRO', description: 'Parse GRO string and create trajectory.' },
    from: [SO.Data.String],
    to: SO.Molecule.Trajectory
})({
    apply: function (_a) {
        var _this = this;
        var a = _a.a;
        return Task.create('Parse GRO', function (ctx) { return __awaiter(_this, void 0, void 0, function () {
            var parsed, models, props;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, parseGRO(a.data).runInContext(ctx)];
                    case 1:
                        parsed = _a.sent();
                        if (parsed.isError)
                            throw new Error(parsed.message);
                        return [4 /*yield*/, trajectoryFromGRO(parsed.result).runInContext(ctx)];
                    case 2:
                        models = _a.sent();
                        props = trajectoryProps(models);
                        return [2 /*return*/, new SO.Molecule.Trajectory(models, props)];
                }
            });
        }); });
    }
});
var TrajectoryFromXYZ = PluginStateTransform.BuiltIn({
    name: 'trajectory-from-xyz',
    display: { name: 'Parse XYZ', description: 'Parse XYZ string and create trajectory.' },
    from: [SO.Data.String],
    to: SO.Molecule.Trajectory
})({
    apply: function (_a) {
        var _this = this;
        var a = _a.a;
        return Task.create('Parse XYZ', function (ctx) { return __awaiter(_this, void 0, void 0, function () {
            var parsed, models, props;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, parseXyz(a.data).runInContext(ctx)];
                    case 1:
                        parsed = _a.sent();
                        if (parsed.isError)
                            throw new Error(parsed.message);
                        return [4 /*yield*/, trajectoryFromXyz(parsed.result).runInContext(ctx)];
                    case 2:
                        models = _a.sent();
                        props = trajectoryProps(models);
                        return [2 /*return*/, new SO.Molecule.Trajectory(models, props)];
                }
            });
        }); });
    }
});
var TrajectoryFromMOL = PluginStateTransform.BuiltIn({
    name: 'trajectory-from-mol',
    display: { name: 'Parse MOL', description: 'Parse MOL string and create trajectory.' },
    from: [SO.Data.String],
    to: SO.Molecule.Trajectory
})({
    apply: function (_a) {
        var _this = this;
        var a = _a.a;
        return Task.create('Parse MOL', function (ctx) { return __awaiter(_this, void 0, void 0, function () {
            var parsed, models, props;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, parseMol(a.data).runInContext(ctx)];
                    case 1:
                        parsed = _a.sent();
                        if (parsed.isError)
                            throw new Error(parsed.message);
                        return [4 /*yield*/, trajectoryFromMol(parsed.result).runInContext(ctx)];
                    case 2:
                        models = _a.sent();
                        props = trajectoryProps(models);
                        return [2 /*return*/, new SO.Molecule.Trajectory(models, props)];
                }
            });
        }); });
    }
});
var TrajectoryFromSDF = PluginStateTransform.BuiltIn({
    name: 'trajectory-from-sdf',
    display: { name: 'Parse SDF', description: 'Parse SDF string and create trajectory.' },
    from: [SO.Data.String],
    to: SO.Molecule.Trajectory
})({
    apply: function (_a) {
        var _this = this;
        var a = _a.a;
        return Task.create('Parse SDF', function (ctx) { return __awaiter(_this, void 0, void 0, function () {
            var parsed, models, _i, _a, compound, traj_1, i, _b, _c, traj, props;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0: return [4 /*yield*/, parseSdf(a.data).runInContext(ctx)];
                    case 1:
                        parsed = _d.sent();
                        if (parsed.isError)
                            throw new Error(parsed.message);
                        models = [];
                        _i = 0, _a = parsed.result.compounds;
                        _d.label = 2;
                    case 2:
                        if (!(_i < _a.length)) return [3 /*break*/, 8];
                        compound = _a[_i];
                        return [4 /*yield*/, trajectoryFromSdf(compound).runInContext(ctx)];
                    case 3:
                        traj_1 = _d.sent();
                        i = 0;
                        _d.label = 4;
                    case 4:
                        if (!(i < traj_1.frameCount)) return [3 /*break*/, 7];
                        _c = (_b = models).push;
                        return [4 /*yield*/, Task.resolveInContext(traj_1.getFrameAtIndex(i), ctx)];
                    case 5:
                        _c.apply(_b, [_d.sent()]);
                        _d.label = 6;
                    case 6:
                        i++;
                        return [3 /*break*/, 4];
                    case 7:
                        _i++;
                        return [3 /*break*/, 2];
                    case 8:
                        traj = new ArrayTrajectory(models);
                        props = trajectoryProps(traj);
                        return [2 /*return*/, new SO.Molecule.Trajectory(traj, props)];
                }
            });
        }); });
    }
});
var TrajectoryFromMOL2 = PluginStateTransform.BuiltIn({
    name: 'trajectory-from-mol2',
    display: { name: 'Parse MOL2', description: 'Parse MOL2 string and create trajectory.' },
    from: [SO.Data.String],
    to: SO.Molecule.Trajectory
})({
    apply: function (_a) {
        var _this = this;
        var a = _a.a;
        return Task.create('Parse MOL2', function (ctx) { return __awaiter(_this, void 0, void 0, function () {
            var parsed, models, props;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, parseMol2(a.data, a.label).runInContext(ctx)];
                    case 1:
                        parsed = _a.sent();
                        if (parsed.isError)
                            throw new Error(parsed.message);
                        return [4 /*yield*/, trajectoryFromMol2(parsed.result).runInContext(ctx)];
                    case 2:
                        models = _a.sent();
                        props = trajectoryProps(models);
                        return [2 /*return*/, new SO.Molecule.Trajectory(models, props)];
                }
            });
        }); });
    }
});
var TrajectoryFromCube = PluginStateTransform.BuiltIn({
    name: 'trajectory-from-cube',
    display: { name: 'Parse Cube', description: 'Parse Cube file to create a trajectory.' },
    from: SO.Format.Cube,
    to: SO.Molecule.Trajectory
})({
    apply: function (_a) {
        var _this = this;
        var a = _a.a;
        return Task.create('Parse MOL', function (ctx) { return __awaiter(_this, void 0, void 0, function () {
            var models, props;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, trajectoryFromCube(a.data).runInContext(ctx)];
                    case 1:
                        models = _a.sent();
                        props = trajectoryProps(models);
                        return [2 /*return*/, new SO.Molecule.Trajectory(models, props)];
                }
            });
        }); });
    }
});
var TrajectoryFromCifCore = PluginStateTransform.BuiltIn({
    name: 'trajectory-from-cif-core',
    display: { name: 'Parse CIF Core', description: 'Identify and create all separate models in the specified CIF data block' },
    from: SO.Format.Cif,
    to: SO.Molecule.Trajectory,
    params: function (a) {
        if (!a) {
            return {
                blockHeader: PD.Optional(PD.Text(void 0, { description: 'Header of the block to parse. If none is specifed, the 1st data block in the file is used.' }))
            };
        }
        var blocks = a.data.blocks;
        return {
            blockHeader: PD.Optional(PD.Select(blocks[0] && blocks[0].header, blocks.map(function (b) { return [b.header, b.header]; }), { description: 'Header of the block to parse' }))
        };
    }
})({
    apply: function (_a) {
        var _this = this;
        var a = _a.a, params = _a.params;
        return Task.create('Parse CIF Core', function (ctx) { return __awaiter(_this, void 0, void 0, function () {
            var header, block, models, props;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        header = params.blockHeader || a.data.blocks[0].header;
                        block = a.data.blocks.find(function (b) { return b.header === header; });
                        if (!block)
                            throw new Error("Data block '".concat([header], "' not found."));
                        return [4 /*yield*/, trajectoryFromCifCore(block).runInContext(ctx)];
                    case 1:
                        models = _a.sent();
                        if (models.frameCount === 0)
                            throw new Error('No models found.');
                        props = trajectoryProps(models);
                        return [2 /*return*/, new SO.Molecule.Trajectory(models, props)];
                }
            });
        }); });
    }
});
var plus1 = function (v) { return v + 1; }, minus1 = function (v) { return v - 1; };
var ModelFromTrajectory = PluginStateTransform.BuiltIn({
    name: 'model-from-trajectory',
    display: { name: 'Molecular Model', description: 'Create a molecular model from specified index in a trajectory.' },
    from: SO.Molecule.Trajectory,
    to: SO.Molecule.Model,
    params: function (a) {
        if (!a) {
            return { modelIndex: PD.Numeric(0, {}, { description: 'Zero-based index of the model', immediateUpdate: true }) };
        }
        return { modelIndex: PD.Converted(plus1, minus1, PD.Numeric(1, { min: 1, max: a.data.frameCount, step: 1 }, { description: 'Model Index', immediateUpdate: true })) };
    }
})({
    isApplicable: function (a) { return a.data.frameCount > 0; },
    apply: function (_a) {
        var _this = this;
        var a = _a.a, params = _a.params;
        return Task.create('Model from Trajectory', function (ctx) { return __awaiter(_this, void 0, void 0, function () {
            var modelIndex, model, label, description;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        modelIndex = params.modelIndex % a.data.frameCount;
                        if (modelIndex < 0)
                            modelIndex += a.data.frameCount;
                        return [4 /*yield*/, Task.resolveInContext(a.data.getFrameAtIndex(modelIndex), ctx)];
                    case 1:
                        model = _a.sent();
                        label = "Model ".concat(modelIndex + 1);
                        description = a.data.frameCount === 1 ? undefined : "of ".concat(a.data.frameCount);
                        return [2 /*return*/, new SO.Molecule.Model(model, { label: label, description: description })];
                }
            });
        }); });
    },
    interpolate: function (a, b, t) {
        var modelIndex = t >= 1 ? b.modelIndex : a.modelIndex + Math.floor((b.modelIndex - a.modelIndex + 1) * t);
        return { modelIndex: modelIndex };
    },
    dispose: function (_a) {
        var b = _a.b;
        b === null || b === void 0 ? void 0 : b.data.customProperties.dispose();
    }
});
var StructureFromTrajectory = PluginStateTransform.BuiltIn({
    name: 'structure-from-trajectory',
    display: { name: 'Structure from Trajectory', description: 'Create a molecular structure from a trajectory.' },
    from: SO.Molecule.Trajectory,
    to: SO.Molecule.Structure
})({
    apply: function (_a) {
        var _this = this;
        var a = _a.a;
        return Task.create('Build Structure', function (ctx) { return __awaiter(_this, void 0, void 0, function () {
            var s, props;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Structure.ofTrajectory(a.data, ctx)];
                    case 1:
                        s = _a.sent();
                        props = { label: 'Ensemble', description: Structure.elementDescription(s) };
                        return [2 /*return*/, new SO.Molecule.Structure(s, props)];
                }
            });
        }); });
    },
    dispose: function (_a) {
        var b = _a.b;
        b === null || b === void 0 ? void 0 : b.data.customPropertyDescriptors.dispose();
    }
});
var StructureFromModel = PluginStateTransform.BuiltIn({
    name: 'structure-from-model',
    display: { name: 'Structure', description: 'Create a molecular structure (model, assembly, or symmetry) from the specified model.' },
    from: SO.Molecule.Model,
    to: SO.Molecule.Structure,
    params: function (a) { return RootStructureDefinition.getParams(a && a.data); }
})({
    canAutoUpdate: function (_a) {
        var oldParams = _a.oldParams, newParams = _a.newParams;
        return RootStructureDefinition.canAutoUpdate(oldParams.type, newParams.type);
    },
    apply: function (_a, plugin) {
        var _this = this;
        var a = _a.a, params = _a.params;
        return Task.create('Build Structure', function (ctx) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, RootStructureDefinition.create(plugin, ctx, a.data, params && params.type)];
            });
        }); });
    },
    update: function (_a) {
        var a = _a.a, b = _a.b, oldParams = _a.oldParams, newParams = _a.newParams;
        if (!deepEqual(oldParams, newParams))
            return StateTransformer.UpdateResult.Recreate;
        if (b.data.model === a.data)
            return StateTransformer.UpdateResult.Unchanged;
        if (!Model.areHierarchiesEqual(a.data, b.data.model))
            return StateTransformer.UpdateResult.Recreate;
        b.data = b.data.remapModel(a.data);
        return StateTransformer.UpdateResult.Updated;
    },
    dispose: function (_a) {
        var b = _a.b;
        b === null || b === void 0 ? void 0 : b.data.customPropertyDescriptors.dispose();
    }
});
var _translation = Vec3(), _m = Mat4(), _n = Mat4();
var TransformStructureConformation = PluginStateTransform.BuiltIn({
    name: 'transform-structure-conformation',
    display: { name: 'Transform Conformation' },
    isDecorator: true,
    from: SO.Molecule.Structure,
    to: SO.Molecule.Structure,
    params: {
        transform: PD.MappedStatic('components', {
            components: PD.Group({
                axis: PD.Vec3(Vec3.create(1, 0, 0)),
                angle: PD.Numeric(0, { min: -180, max: 180, step: 0.1 }),
                translation: PD.Vec3(Vec3.create(0, 0, 0)),
            }, { isFlat: true }),
            matrix: PD.Group({
                data: PD.Mat4(Mat4.identity()),
                transpose: PD.Boolean(false)
            }, { isFlat: true })
        }, { label: 'Kind' })
    }
})({
    canAutoUpdate: function (_a) {
        var newParams = _a.newParams;
        return newParams.transform.name !== 'matrix';
    },
    apply: function (_a) {
        // TODO: optimze
        // TODO: think of ways how to fast-track changes to this for animations
        var a = _a.a, params = _a.params;
        var transform = Mat4();
        if (params.transform.name === 'components') {
            var _b = params.transform.params, axis = _b.axis, angle = _b.angle, translation = _b.translation;
            var center = a.data.boundary.sphere.center;
            Mat4.fromTranslation(_m, Vec3.negate(_translation, center));
            Mat4.fromTranslation(_n, Vec3.add(_translation, center, translation));
            var rot = Mat4.fromRotation(Mat4(), Math.PI / 180 * angle, Vec3.normalize(Vec3(), axis));
            Mat4.mul3(transform, _n, rot, _m);
        }
        else if (params.transform.name === 'matrix') {
            Mat4.copy(transform, params.transform.params.data);
            if (params.transform.params.transpose)
                Mat4.transpose(transform, transform);
        }
        var s = Structure.transform(a.data, transform);
        return new SO.Molecule.Structure(s, { label: a.label, description: "".concat(a.description, " [Transformed]") });
    },
    dispose: function (_a) {
        var b = _a.b;
        b === null || b === void 0 ? void 0 : b.data.customPropertyDescriptors.dispose();
    }
    // interpolate(src, tar, t) {
    //     // TODO: optimize
    //     const u = Mat4.fromRotation(Mat4(), Math.PI / 180 * src.angle, Vec3.normalize(Vec3(), src.axis));
    //     Mat4.setTranslation(u, src.translation);
    //     const v = Mat4.fromRotation(Mat4(), Math.PI / 180 * tar.angle, Vec3.normalize(Vec3(), tar.axis));
    //     Mat4.setTranslation(v, tar.translation);
    //     const m = SymmetryOperator.slerp(Mat4(), u, v, t);
    //     const rot = Mat4.getRotation(Quat.zero(), m);
    //     const axis = Vec3();
    //     const angle = Quat.getAxisAngle(axis, rot);
    //     const translation = Mat4.getTranslation(Vec3(), m);
    //     return { axis, angle, translation };
    // }
});
var StructureSelectionFromExpression = PluginStateTransform.BuiltIn({
    name: 'structure-selection-from-expression',
    display: { name: 'Selection', description: 'Create a molecular structure from the specified expression.' },
    from: SO.Molecule.Structure,
    to: SO.Molecule.Structure,
    params: function () { return ({
        expression: PD.Value(MolScriptBuilder.struct.generator.all, { isHidden: true }),
        label: PD.Optional(PD.Text('', { isHidden: true }))
    }); }
})({
    apply: function (_a) {
        var a = _a.a, params = _a.params, cache = _a.cache;
        var _b = StructureQueryHelper.createAndRun(a.data, params.expression), selection = _b.selection, entry = _b.entry;
        cache.entry = entry;
        if (Sel.isEmpty(selection))
            return StateObject.Null;
        var s = Sel.unionStructure(selection);
        var props = { label: "".concat(params.label || 'Selection'), description: Structure.elementDescription(s) };
        return new SO.Molecule.Structure(s, props);
    },
    update: function (_a) {
        var a = _a.a, b = _a.b, oldParams = _a.oldParams, newParams = _a.newParams, cache = _a.cache;
        if (oldParams.expression !== newParams.expression)
            return StateTransformer.UpdateResult.Recreate;
        var entry = cache.entry;
        if (entry.currentStructure === a.data) {
            return StateTransformer.UpdateResult.Unchanged;
        }
        var selection = StructureQueryHelper.updateStructure(entry, a.data);
        if (Sel.isEmpty(selection))
            return StateTransformer.UpdateResult.Null;
        StructureQueryHelper.updateStructureObject(b, selection, newParams.label);
        return StateTransformer.UpdateResult.Updated;
    },
    dispose: function (_a) {
        var b = _a.b;
        b === null || b === void 0 ? void 0 : b.data.customPropertyDescriptors.dispose();
    }
});
var MultiStructureSelectionFromExpression = PluginStateTransform.BuiltIn({
    name: 'structure-multi-selection-from-expression',
    display: { name: 'Multi-structure Measurement Selection', description: 'Create selection object from multiple structures.' },
    from: SO.Root,
    to: SO.Molecule.Structure.Selections,
    params: function () { return ({
        selections: PD.ObjectList({
            key: PD.Text(void 0, { description: 'A unique key.' }),
            ref: PD.Text(),
            groupId: PD.Optional(PD.Text()),
            expression: PD.Value(MolScriptBuilder.struct.generator.empty)
        }, function (e) { return e.ref; }, { isHidden: true }),
        isTransitive: PD.Optional(PD.Boolean(false, { isHidden: true, description: 'Remap the selections from the original structure if structurally equivalent.' })),
        label: PD.Optional(PD.Text('', { isHidden: true }))
    }); }
})({
    apply: function (_a) {
        var params = _a.params, cache = _a.cache, dependencies = _a.dependencies;
        var entries = new Map();
        var selections = [];
        var totalSize = 0;
        for (var _i = 0, _b = params.selections; _i < _b.length; _i++) {
            var sel = _b[_i];
            var _c = StructureQueryHelper.createAndRun(dependencies[sel.ref].data, sel.expression), selection = _c.selection, entry = _c.entry;
            entries.set(sel.key, entry);
            var loci = Sel.toLociWithSourceUnits(selection);
            selections.push({ key: sel.key, loci: loci, groupId: sel.groupId });
            totalSize += StructureElement.Loci.size(loci);
        }
        cache.entries = entries;
        var props = { label: "".concat(params.label || 'Multi-selection'), description: "".concat(params.selections.length, " source(s), ").concat(totalSize, " element(s) total") };
        return new SO.Molecule.Structure.Selections(selections, props);
    },
    update: function (_a) {
        var b = _a.b, oldParams = _a.oldParams, newParams = _a.newParams, cache = _a.cache, dependencies = _a.dependencies;
        if (!!oldParams.isTransitive !== !!newParams.isTransitive)
            return StateTransformer.UpdateResult.Recreate;
        var cacheEntries = cache.entries;
        var entries = new Map();
        var current = new Map();
        for (var _i = 0, _b = b.data; _i < _b.length; _i++) {
            var e = _b[_i];
            current.set(e.key, e);
        }
        var changed = false;
        var totalSize = 0;
        var selections = [];
        for (var _c = 0, _d = newParams.selections; _c < _d.length; _c++) {
            var sel = _d[_c];
            var structure = dependencies[sel.ref].data;
            var recreate = false;
            if (cacheEntries.has(sel.key)) {
                var entry = cacheEntries.get(sel.key);
                if (StructureQueryHelper.isUnchanged(entry, sel.expression, structure) && current.has(sel.key)) {
                    var loci = current.get(sel.key);
                    if (loci.groupId !== sel.groupId) {
                        loci.groupId = sel.groupId;
                        changed = true;
                    }
                    entries.set(sel.key, entry);
                    selections.push(loci);
                    totalSize += StructureElement.Loci.size(loci.loci);
                    continue;
                }
                if (entry.expression !== sel.expression) {
                    recreate = true;
                }
                else {
                    // TODO: properly support "transitive" queries. For that Structure.areUnitAndIndicesEqual needs to be fixed;
                    var update_1 = false;
                    if (!!newParams.isTransitive) {
                        if (Structure.areUnitIdsAndIndicesEqual(entry.originalStructure, structure)) {
                            var selection = StructureQueryHelper.run(entry, entry.originalStructure);
                            entry.currentStructure = structure;
                            entries.set(sel.key, entry);
                            var loci = StructureElement.Loci.remap(Sel.toLociWithSourceUnits(selection), structure);
                            selections.push({ key: sel.key, loci: loci, groupId: sel.groupId });
                            totalSize += StructureElement.Loci.size(loci);
                            changed = true;
                        }
                        else {
                            update_1 = true;
                        }
                    }
                    else {
                        update_1 = true;
                    }
                    if (update_1) {
                        changed = true;
                        var selection = StructureQueryHelper.updateStructure(entry, structure);
                        entries.set(sel.key, entry);
                        var loci = Sel.toLociWithSourceUnits(selection);
                        selections.push({ key: sel.key, loci: loci, groupId: sel.groupId });
                        totalSize += StructureElement.Loci.size(loci);
                    }
                }
            }
            else {
                recreate = true;
            }
            if (recreate) {
                changed = true;
                // create new selection
                var _e = StructureQueryHelper.createAndRun(structure, sel.expression), selection = _e.selection, entry = _e.entry;
                entries.set(sel.key, entry);
                var loci = Sel.toLociWithSourceUnits(selection);
                selections.push({ key: sel.key, loci: loci });
                totalSize += StructureElement.Loci.size(loci);
            }
        }
        if (!changed)
            return StateTransformer.UpdateResult.Unchanged;
        cache.entries = entries;
        b.data = selections;
        b.label = "".concat(newParams.label || 'Multi-selection');
        b.description = "".concat(selections.length, " source(s), ").concat(totalSize, " element(s) total");
        return StateTransformer.UpdateResult.Updated;
    }
});
var StructureSelectionFromScript = PluginStateTransform.BuiltIn({
    name: 'structure-selection-from-script',
    display: { name: 'Selection', description: 'Create a molecular structure from the specified script.' },
    from: SO.Molecule.Structure,
    to: SO.Molecule.Structure,
    params: function () { return ({
        script: PD.Script({ language: 'mol-script', expression: '(sel.atom.atom-groups :residue-test (= atom.resname ALA))' }),
        label: PD.Optional(PD.Text(''))
    }); }
})({
    apply: function (_a) {
        var a = _a.a, params = _a.params, cache = _a.cache;
        var _b = StructureQueryHelper.createAndRun(a.data, params.script), selection = _b.selection, entry = _b.entry;
        cache.entry = entry;
        var s = Sel.unionStructure(selection);
        var props = { label: "".concat(params.label || 'Selection'), description: Structure.elementDescription(s) };
        return new SO.Molecule.Structure(s, props);
    },
    update: function (_a) {
        var a = _a.a, b = _a.b, oldParams = _a.oldParams, newParams = _a.newParams, cache = _a.cache;
        if (!Script.areEqual(oldParams.script, newParams.script)) {
            return StateTransformer.UpdateResult.Recreate;
        }
        var entry = cache.entry;
        if (entry.currentStructure === a.data) {
            return StateTransformer.UpdateResult.Unchanged;
        }
        var selection = StructureQueryHelper.updateStructure(entry, a.data);
        StructureQueryHelper.updateStructureObject(b, selection, newParams.label);
        return StateTransformer.UpdateResult.Updated;
    },
    dispose: function (_a) {
        var b = _a.b;
        b === null || b === void 0 ? void 0 : b.data.customPropertyDescriptors.dispose();
    }
});
var StructureSelectionFromBundle = PluginStateTransform.BuiltIn({
    name: 'structure-selection-from-bundle',
    display: { name: 'Selection', description: 'Create a molecular structure from the specified structure-element bundle.' },
    from: SO.Molecule.Structure,
    to: SO.Molecule.Structure,
    params: function () { return ({
        bundle: PD.Value(StructureElement.Bundle.Empty, { isHidden: true }),
        label: PD.Optional(PD.Text('', { isHidden: true }))
    }); }
})({
    apply: function (_a) {
        var a = _a.a, params = _a.params, cache = _a.cache;
        if (params.bundle.hash !== a.data.hashCode) {
            return StateObject.Null;
        }
        cache.source = a.data;
        var s = StructureElement.Bundle.toStructure(params.bundle, a.data);
        if (s.elementCount === 0)
            return StateObject.Null;
        var props = { label: "".concat(params.label || 'Selection'), description: Structure.elementDescription(s) };
        return new SO.Molecule.Structure(s, props);
    },
    update: function (_a) {
        var a = _a.a, b = _a.b, oldParams = _a.oldParams, newParams = _a.newParams, cache = _a.cache;
        if (!StructureElement.Bundle.areEqual(oldParams.bundle, newParams.bundle)) {
            return StateTransformer.UpdateResult.Recreate;
        }
        if (newParams.bundle.hash !== a.data.hashCode) {
            return StateTransformer.UpdateResult.Null;
        }
        if (cache.source === a.data) {
            return StateTransformer.UpdateResult.Unchanged;
        }
        cache.source = a.data;
        var s = StructureElement.Bundle.toStructure(newParams.bundle, a.data);
        if (s.elementCount === 0)
            return StateTransformer.UpdateResult.Null;
        b.label = "".concat(newParams.label || 'Selection');
        b.description = Structure.elementDescription(s);
        b.data = s;
        return StateTransformer.UpdateResult.Updated;
    },
    dispose: function (_a) {
        var b = _a.b;
        b === null || b === void 0 ? void 0 : b.data.customPropertyDescriptors.dispose();
    }
});
export var StructureComplexElementTypes = {
    'polymer': 'polymer',
    'protein': 'protein',
    'nucleic': 'nucleic',
    'water': 'water',
    'branched': 'branched',
    'ligand': 'ligand',
    'non-standard': 'non-standard',
    'coarse': 'coarse',
    // Legacy
    'atomic-sequence': 'atomic-sequence',
    'atomic-het': 'atomic-het',
    'spheres': 'spheres'
};
var StructureComplexElementTypeTuples = PD.objectToOptions(StructureComplexElementTypes);
var StructureComplexElement = PluginStateTransform.BuiltIn({
    name: 'structure-complex-element',
    display: { name: 'Complex Element', description: 'Create a molecular structure from the specified model.' },
    from: SO.Molecule.Structure,
    to: SO.Molecule.Structure,
    params: { type: PD.Select('atomic-sequence', StructureComplexElementTypeTuples, { isHidden: true }) }
})({
    apply: function (_a) {
        // TODO: update function.
        var a = _a.a, params = _a.params;
        var query, label;
        switch (params.type) {
            case 'polymer':
                query = StructureSelectionQueries.polymer.query;
                label = 'Polymer';
                break;
            case 'protein':
                query = StructureSelectionQueries.protein.query;
                label = 'Protein';
                break;
            case 'nucleic':
                query = StructureSelectionQueries.nucleic.query;
                label = 'Nucleic';
                break;
            case 'water':
                query = Queries.internal.water();
                label = 'Water';
                break;
            case 'branched':
                query = StructureSelectionQueries.branchedPlusConnected.query;
                label = 'Branched';
                break;
            case 'ligand':
                query = StructureSelectionQueries.ligandPlusConnected.query;
                label = 'Ligand';
                break;
            case 'non-standard':
                query = StructureSelectionQueries.nonStandardPolymer.query;
                label = 'Non-standard';
                break;
            case 'coarse':
                query = StructureSelectionQueries.coarse.query;
                label = 'Coarse';
                break;
            case 'atomic-sequence':
                query = Queries.internal.atomicSequence();
                label = 'Sequence';
                break;
            case 'atomic-het':
                query = Queries.internal.atomicHet();
                label = 'HET Groups/Ligands';
                break;
            case 'spheres':
                query = Queries.internal.spheres();
                label = 'Coarse Spheres';
                break;
            default: assertUnreachable(params.type);
        }
        var result = query(new QueryContext(a.data));
        var s = Sel.unionStructure(result);
        if (s.elementCount === 0)
            return StateObject.Null;
        return new SO.Molecule.Structure(s, { label: label, description: Structure.elementDescription(s) });
    },
    dispose: function (_a) {
        var b = _a.b;
        b === null || b === void 0 ? void 0 : b.data.customPropertyDescriptors.dispose();
    }
});
var StructureComponent = PluginStateTransform.BuiltIn({
    name: 'structure-component',
    display: { name: 'Component', description: 'A molecular structure component.' },
    from: SO.Molecule.Structure,
    to: SO.Molecule.Structure,
    params: StructureComponentParams
})({
    apply: function (_a) {
        var a = _a.a, params = _a.params, cache = _a.cache;
        return createStructureComponent(a.data, params, cache);
    },
    update: function (_a) {
        var a = _a.a, b = _a.b, oldParams = _a.oldParams, newParams = _a.newParams, cache = _a.cache;
        return updateStructureComponent(a.data, b, oldParams, newParams, cache);
    },
    dispose: function (_a) {
        var b = _a.b;
        b === null || b === void 0 ? void 0 : b.data.customPropertyDescriptors.dispose();
    }
});
var CustomModelProperties = PluginStateTransform.BuiltIn({
    name: 'custom-model-properties',
    display: { name: 'Custom Model Properties' },
    isDecorator: true,
    from: SO.Molecule.Model,
    to: SO.Molecule.Model,
    params: function (a, ctx) {
        return ctx.customModelProperties.getParams(a === null || a === void 0 ? void 0 : a.data);
    }
})({
    apply: function (_a, ctx) {
        var _this = this;
        var a = _a.a, params = _a.params;
        return Task.create('Custom Props', function (taskCtx) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, attachModelProps(a.data, ctx, taskCtx, params)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, new SO.Molecule.Model(a.data, { label: a.label, description: a.description })];
                }
            });
        }); });
    },
    update: function (_a, ctx) {
        var _this = this;
        var a = _a.a, b = _a.b, oldParams = _a.oldParams, newParams = _a.newParams;
        return Task.create('Custom Props', function (taskCtx) { return __awaiter(_this, void 0, void 0, function () {
            var _i, _a, name_1, property;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        b.data = a.data;
                        b.label = a.label;
                        b.description = a.description;
                        for (_i = 0, _a = oldParams.autoAttach; _i < _a.length; _i++) {
                            name_1 = _a[_i];
                            property = ctx.customModelProperties.get(name_1);
                            if (!property)
                                continue;
                            a.data.customProperties.reference(property.descriptor, false);
                        }
                        return [4 /*yield*/, attachModelProps(a.data, ctx, taskCtx, newParams)];
                    case 1:
                        _b.sent();
                        return [2 /*return*/, StateTransformer.UpdateResult.Updated];
                }
            });
        }); });
    },
    dispose: function (_a) {
        var b = _a.b;
        b === null || b === void 0 ? void 0 : b.data.customProperties.dispose();
    }
});
function attachModelProps(model, ctx, taskCtx, params) {
    return __awaiter(this, void 0, void 0, function () {
        var propertyCtx, autoAttach, properties, _i, _a, name_2, property, props, e_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    propertyCtx = { runtime: taskCtx, assetManager: ctx.managers.asset };
                    autoAttach = params.autoAttach, properties = params.properties;
                    _i = 0, _a = Object.keys(properties);
                    _b.label = 1;
                case 1:
                    if (!(_i < _a.length)) return [3 /*break*/, 8];
                    name_2 = _a[_i];
                    property = ctx.customModelProperties.get(name_2);
                    props = properties[name_2];
                    if (!(autoAttach.includes(name_2) || property.isHidden)) return [3 /*break*/, 6];
                    _b.label = 2;
                case 2:
                    _b.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, property.attach(propertyCtx, model, props, true)];
                case 3:
                    _b.sent();
                    return [3 /*break*/, 5];
                case 4:
                    e_1 = _b.sent();
                    ctx.log.warn("Error attaching model prop '".concat(name_2, "': ").concat(e_1));
                    return [3 /*break*/, 5];
                case 5: return [3 /*break*/, 7];
                case 6:
                    property.set(model, props);
                    _b.label = 7;
                case 7:
                    _i++;
                    return [3 /*break*/, 1];
                case 8: return [2 /*return*/];
            }
        });
    });
}
var CustomStructureProperties = PluginStateTransform.BuiltIn({
    name: 'custom-structure-properties',
    display: { name: 'Custom Structure Properties' },
    isDecorator: true,
    from: SO.Molecule.Structure,
    to: SO.Molecule.Structure,
    params: function (a, ctx) {
        return ctx.customStructureProperties.getParams(a === null || a === void 0 ? void 0 : a.data.root);
    }
})({
    apply: function (_a, ctx) {
        var _this = this;
        var a = _a.a, params = _a.params;
        return Task.create('Custom Props', function (taskCtx) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, attachStructureProps(a.data.root, ctx, taskCtx, params)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, new SO.Molecule.Structure(a.data, { label: a.label, description: a.description })];
                }
            });
        }); });
    },
    update: function (_a, ctx) {
        var _this = this;
        var a = _a.a, b = _a.b, oldParams = _a.oldParams, newParams = _a.newParams;
        if (a.data !== b.data)
            return StateTransformer.UpdateResult.Recreate;
        return Task.create('Custom Props', function (taskCtx) { return __awaiter(_this, void 0, void 0, function () {
            var _i, _a, name_3, property;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        b.data = a.data;
                        b.label = a.label;
                        b.description = a.description;
                        for (_i = 0, _a = oldParams.autoAttach; _i < _a.length; _i++) {
                            name_3 = _a[_i];
                            property = ctx.customStructureProperties.get(name_3);
                            if (!property)
                                continue;
                            a.data.customPropertyDescriptors.reference(property.descriptor, false);
                        }
                        return [4 /*yield*/, attachStructureProps(a.data.root, ctx, taskCtx, newParams)];
                    case 1:
                        _b.sent();
                        return [2 /*return*/, StateTransformer.UpdateResult.Updated];
                }
            });
        }); });
    },
    dispose: function (_a) {
        var b = _a.b;
        b === null || b === void 0 ? void 0 : b.data.customPropertyDescriptors.dispose();
    }
});
function attachStructureProps(structure, ctx, taskCtx, params) {
    return __awaiter(this, void 0, void 0, function () {
        var propertyCtx, autoAttach, properties, _i, _a, name_4, property, props, e_2;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    propertyCtx = { runtime: taskCtx, assetManager: ctx.managers.asset };
                    autoAttach = params.autoAttach, properties = params.properties;
                    _i = 0, _a = Object.keys(properties);
                    _b.label = 1;
                case 1:
                    if (!(_i < _a.length)) return [3 /*break*/, 8];
                    name_4 = _a[_i];
                    property = ctx.customStructureProperties.get(name_4);
                    props = properties[name_4];
                    if (!(autoAttach.includes(name_4) || property.isHidden)) return [3 /*break*/, 6];
                    _b.label = 2;
                case 2:
                    _b.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, property.attach(propertyCtx, structure, props, true)];
                case 3:
                    _b.sent();
                    return [3 /*break*/, 5];
                case 4:
                    e_2 = _b.sent();
                    ctx.log.warn("Error attaching structure prop '".concat(name_4, "': ").concat(e_2));
                    return [3 /*break*/, 5];
                case 5: return [3 /*break*/, 7];
                case 6:
                    property.set(structure, props);
                    _b.label = 7;
                case 7:
                    _i++;
                    return [3 /*break*/, 1];
                case 8: return [2 /*return*/];
            }
        });
    });
}
var ShapeFromPly = PluginStateTransform.BuiltIn({
    name: 'shape-from-ply',
    display: { name: 'Shape from PLY', description: 'Create Shape from PLY data' },
    from: SO.Format.Ply,
    to: SO.Shape.Provider,
    params: function (a) {
        return {};
    }
})({
    apply: function (_a) {
        var _this = this;
        var a = _a.a, params = _a.params;
        return Task.create('Create shape from PLY', function (ctx) { return __awaiter(_this, void 0, void 0, function () {
            var shape, props;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, shapeFromPly(a.data, params).runInContext(ctx)];
                    case 1:
                        shape = _a.sent();
                        props = { label: 'Shape' };
                        return [2 /*return*/, new SO.Shape.Provider(shape, props)];
                }
            });
        }); });
    }
});
