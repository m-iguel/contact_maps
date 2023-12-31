/**
 * Copyright (c) 2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { __assign, __awaiter, __generator } from "tslib";
import './index.html';
import { Canvas3D, Canvas3DContext } from '../../mol-canvas3d/canvas3d';
import { CIF } from '../../mol-io/reader/cif';
import { Structure } from '../../mol-model/structure';
import { ColorTheme } from '../../mol-theme/color';
import { SizeTheme } from '../../mol-theme/size';
import { CartoonRepresentationProvider } from '../../mol-repr/structure/representation/cartoon';
import { trajectoryFromMmCIF } from '../../mol-model-formats/structure/mmcif';
import { MolecularSurfaceRepresentationProvider } from '../../mol-repr/structure/representation/molecular-surface';
import { BallAndStickRepresentationProvider } from '../../mol-repr/structure/representation/ball-and-stick';
import { GaussianSurfaceRepresentationProvider } from '../../mol-repr/structure/representation/gaussian-surface';
import { resizeCanvas } from '../../mol-canvas3d/util';
import { Representation } from '../../mol-repr/representation';
import { throttleTime } from 'rxjs/operators';
import { MarkerAction } from '../../mol-util/marker-action';
import { EveryLoci } from '../../mol-model/loci';
import { lociLabel } from '../../mol-theme/label';
import { InteractionsRepresentationProvider } from '../../mol-model-props/computed/representations/interactions';
import { InteractionsProvider } from '../../mol-model-props/computed/interactions';
import { SecondaryStructureProvider } from '../../mol-model-props/computed/secondary-structure';
import { SyncRuntimeContext } from '../../mol-task/execution/synchronous';
import { AssetManager } from '../../mol-util/assets';
import { MembraneOrientationProvider } from '../../extensions/anvil/prop';
import { MembraneOrientationRepresentationProvider } from '../../extensions/anvil/representation';
var parent = document.getElementById('app');
parent.style.width = '100%';
parent.style.height = '100%';
var canvas = document.createElement('canvas');
parent.appendChild(canvas);
resizeCanvas(canvas, parent);
var assetManager = new AssetManager();
var canvas3d = Canvas3D.create(Canvas3DContext.fromCanvas(canvas, assetManager));
canvas3d.animate();
var info = document.createElement('div');
info.style.position = 'absolute';
info.style.fontFamily = 'sans-serif';
info.style.fontSize = '16pt';
info.style.bottom = '20px';
info.style.right = '20px';
info.style.color = 'white';
parent.appendChild(info);
var prevReprLoci = Representation.Loci.Empty;
canvas3d.input.move.pipe(throttleTime(100)).subscribe(function (_a) {
    var _b;
    var x = _a.x, y = _a.y;
    var pickingId = (_b = canvas3d.identify(x, y)) === null || _b === void 0 ? void 0 : _b.id;
    var label = '';
    if (pickingId) {
        var reprLoci = canvas3d.getLoci(pickingId);
        label = lociLabel(reprLoci.loci);
        if (!Representation.Loci.areEqual(prevReprLoci, reprLoci)) {
            canvas3d.mark(prevReprLoci, MarkerAction.RemoveHighlight);
            canvas3d.mark(reprLoci, MarkerAction.Highlight);
            prevReprLoci = reprLoci;
        }
    }
    else {
        canvas3d.mark({ loci: EveryLoci }, MarkerAction.RemoveHighlight);
        prevReprLoci = Representation.Loci.Empty;
    }
    info.innerHTML = label;
});
function parseCif(data) {
    return __awaiter(this, void 0, void 0, function () {
        var comp, parsed;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    comp = CIF.parse(data);
                    return [4 /*yield*/, comp.run()];
                case 1:
                    parsed = _a.sent();
                    if (parsed.isError)
                        throw parsed;
                    return [2 /*return*/, parsed.result];
            }
        });
    });
}
function downloadCif(url, isBinary) {
    return __awaiter(this, void 0, void 0, function () {
        var data, _a, _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0: return [4 /*yield*/, fetch(url)];
                case 1:
                    data = _d.sent();
                    _a = parseCif;
                    if (!isBinary) return [3 /*break*/, 3];
                    _c = Uint8Array.bind;
                    return [4 /*yield*/, data.arrayBuffer()];
                case 2:
                    _b = new (_c.apply(Uint8Array, [void 0, _d.sent()]))();
                    return [3 /*break*/, 5];
                case 3: return [4 /*yield*/, data.text()];
                case 4:
                    _b = _d.sent();
                    _d.label = 5;
                case 5: return [2 /*return*/, _a.apply(void 0, [_b])];
            }
        });
    });
}
function downloadFromPdb(pdb) {
    return __awaiter(this, void 0, void 0, function () {
        var parsed;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, downloadCif("https://models.rcsb.org/".concat(pdb, ".bcif"), true)];
                case 1:
                    parsed = _a.sent();
                    return [2 /*return*/, parsed.blocks[0]];
            }
        });
    });
}
function getModels(frame) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, trajectoryFromMmCIF(frame).run()];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
function getStructure(model) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, Structure.ofModel(model)];
        });
    });
}
var reprCtx = {
    webgl: canvas3d.webgl,
    colorThemeRegistry: ColorTheme.createRegistry(),
    sizeThemeRegistry: SizeTheme.createRegistry()
};
function getCartoonRepr() {
    return CartoonRepresentationProvider.factory(reprCtx, CartoonRepresentationProvider.getParams);
}
function getInteractionRepr() {
    return InteractionsRepresentationProvider.factory(reprCtx, InteractionsRepresentationProvider.getParams);
}
function getBallAndStickRepr() {
    return BallAndStickRepresentationProvider.factory(reprCtx, BallAndStickRepresentationProvider.getParams);
}
function getMolecularSurfaceRepr() {
    return MolecularSurfaceRepresentationProvider.factory(reprCtx, MolecularSurfaceRepresentationProvider.getParams);
}
function getGaussianSurfaceRepr() {
    return GaussianSurfaceRepresentationProvider.factory(reprCtx, GaussianSurfaceRepresentationProvider.getParams);
}
function getMembraneOrientationRepr() {
    return MembraneOrientationRepresentationProvider.factory(reprCtx, MembraneOrientationRepresentationProvider.getParams);
}
function init() {
    return __awaiter(this, void 0, void 0, function () {
        var ctx, cif, models, structure, show, cartoonRepr, interactionRepr, ballAndStickRepr, molecularSurfaceRepr, gaussianSurfaceRepr, membraneOrientationRepr;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    ctx = { runtime: SyncRuntimeContext, assetManager: assetManager };
                    return [4 /*yield*/, downloadFromPdb('3pqr')];
                case 1:
                    cif = _a.sent();
                    return [4 /*yield*/, getModels(cif)];
                case 2:
                    models = _a.sent();
                    return [4 /*yield*/, getStructure(models.representative)];
                case 3:
                    structure = _a.sent();
                    console.time('compute SecondaryStructure');
                    return [4 /*yield*/, SecondaryStructureProvider.attach(ctx, structure)];
                case 4:
                    _a.sent();
                    console.timeEnd('compute SecondaryStructure');
                    console.time('compute Membrane Orientation');
                    return [4 /*yield*/, MembraneOrientationProvider.attach(ctx, structure)];
                case 5:
                    _a.sent();
                    console.timeEnd('compute Membrane Orientation');
                    console.time('compute Interactions');
                    return [4 /*yield*/, InteractionsProvider.attach(ctx, structure)];
                case 6:
                    _a.sent();
                    console.timeEnd('compute Interactions');
                    console.log(InteractionsProvider.get(structure).value);
                    show = {
                        cartoon: true,
                        interaction: true,
                        ballAndStick: true,
                        molecularSurface: false,
                        gaussianSurface: false,
                        membrane: true
                    };
                    cartoonRepr = getCartoonRepr();
                    interactionRepr = getInteractionRepr();
                    ballAndStickRepr = getBallAndStickRepr();
                    molecularSurfaceRepr = getMolecularSurfaceRepr();
                    gaussianSurfaceRepr = getGaussianSurfaceRepr();
                    membraneOrientationRepr = getMembraneOrientationRepr();
                    if (!show.cartoon) return [3 /*break*/, 8];
                    cartoonRepr.setTheme({
                        color: reprCtx.colorThemeRegistry.create('element-symbol', { structure: structure }),
                        size: reprCtx.sizeThemeRegistry.create('uniform', { structure: structure })
                    });
                    return [4 /*yield*/, cartoonRepr.createOrUpdate(__assign(__assign({}, CartoonRepresentationProvider.defaultValues), { quality: 'auto' }), structure).run()];
                case 7:
                    _a.sent();
                    _a.label = 8;
                case 8:
                    if (!show.interaction) return [3 /*break*/, 10];
                    interactionRepr.setTheme({
                        color: reprCtx.colorThemeRegistry.create('interaction-type', { structure: structure }),
                        size: reprCtx.sizeThemeRegistry.create('uniform', { structure: structure })
                    });
                    return [4 /*yield*/, interactionRepr.createOrUpdate(__assign(__assign({}, InteractionsRepresentationProvider.defaultValues), { quality: 'auto' }), structure).run()];
                case 9:
                    _a.sent();
                    _a.label = 10;
                case 10:
                    if (!show.ballAndStick) return [3 /*break*/, 12];
                    ballAndStickRepr.setTheme({
                        color: reprCtx.colorThemeRegistry.create('element-symbol', { structure: structure }),
                        size: reprCtx.sizeThemeRegistry.create('uniform', { structure: structure }, { value: 1 })
                    });
                    return [4 /*yield*/, ballAndStickRepr.createOrUpdate(__assign(__assign({}, BallAndStickRepresentationProvider.defaultValues), { quality: 'auto' }), structure).run()];
                case 11:
                    _a.sent();
                    _a.label = 12;
                case 12:
                    if (!show.molecularSurface) return [3 /*break*/, 14];
                    molecularSurfaceRepr.setTheme({
                        color: reprCtx.colorThemeRegistry.create('secondary-structure', { structure: structure }),
                        size: reprCtx.sizeThemeRegistry.create('physical', { structure: structure })
                    });
                    console.time('molecular surface');
                    return [4 /*yield*/, molecularSurfaceRepr.createOrUpdate(__assign(__assign({}, MolecularSurfaceRepresentationProvider.defaultValues), { quality: 'custom', alpha: 0.5, flatShaded: true, doubleSided: true, resolution: 0.3 }), structure).run()];
                case 13:
                    _a.sent();
                    console.timeEnd('molecular surface');
                    _a.label = 14;
                case 14:
                    if (!show.gaussianSurface) return [3 /*break*/, 16];
                    gaussianSurfaceRepr.setTheme({
                        color: reprCtx.colorThemeRegistry.create('secondary-structure', { structure: structure }),
                        size: reprCtx.sizeThemeRegistry.create('physical', { structure: structure })
                    });
                    console.time('gaussian surface');
                    return [4 /*yield*/, gaussianSurfaceRepr.createOrUpdate(__assign(__assign({}, GaussianSurfaceRepresentationProvider.defaultValues), { quality: 'custom', alpha: 1.0, flatShaded: true, doubleSided: true, resolution: 0.3 }), structure).run()];
                case 15:
                    _a.sent();
                    console.timeEnd('gaussian surface');
                    _a.label = 16;
                case 16:
                    if (!show.membrane) return [3 /*break*/, 18];
                    return [4 /*yield*/, membraneOrientationRepr.createOrUpdate(__assign(__assign({}, MembraneOrientationRepresentationProvider.defaultValues), { quality: 'auto' }), structure).run()];
                case 17:
                    _a.sent();
                    _a.label = 18;
                case 18:
                    if (show.cartoon)
                        canvas3d.add(cartoonRepr);
                    if (show.interaction)
                        canvas3d.add(interactionRepr);
                    if (show.ballAndStick)
                        canvas3d.add(ballAndStickRepr);
                    if (show.molecularSurface)
                        canvas3d.add(molecularSurfaceRepr);
                    if (show.gaussianSurface)
                        canvas3d.add(gaussianSurfaceRepr);
                    if (show.membrane)
                        canvas3d.add(membraneOrientationRepr);
                    canvas3d.requestCameraReset();
                    return [2 /*return*/];
            }
        });
    });
}
init();
