/**
 * Copyright (c) 2018-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { StructureElement } from '../../mol-model/structure';
import { Volume } from '../../mol-model/volume';
import { PluginContext } from '../../mol-plugin/context';
import { VolumeRepresentationRegistry } from '../../mol-repr/volume/registry';
import { StateTransformer } from '../../mol-state';
import { ColorTheme } from '../../mol-theme/color';
import { SizeTheme } from '../../mol-theme/size';
import { ParamDefinition as PD } from '../../mol-util/param-definition';
import { PluginStateObject as SO } from '../objects';
import { Color } from '../../mol-util/color';
import { Script } from '../../mol-script/script';
import { Clipping } from '../../mol-theme/clipping';
export { StructureRepresentation3D };
export { ExplodeStructureRepresentation3D };
export { SpinStructureRepresentation3D };
export { UnwindStructureAssemblyRepresentation3D };
export { OverpaintStructureRepresentation3DFromScript };
export { OverpaintStructureRepresentation3DFromBundle };
export { TransparencyStructureRepresentation3DFromScript };
export { TransparencyStructureRepresentation3DFromBundle };
export { SubstanceStructureRepresentation3DFromScript };
export { SubstanceStructureRepresentation3DFromBundle };
export { ClippingStructureRepresentation3DFromScript };
export { ClippingStructureRepresentation3DFromBundle };
export { ThemeStrengthRepresentation3D };
export { VolumeRepresentation3D };
type StructureRepresentation3D = typeof StructureRepresentation3D;
declare const StructureRepresentation3D: StateTransformer<SO.Molecule.Structure, SO.Molecule.Structure.Representation3D, PD.Normalize<{
    type: PD.NamedParams<any, string>;
    colorTheme: PD.NamedParams<any, string>;
    sizeTheme: PD.NamedParams<any, string>;
}>>;
type UnwindStructureAssemblyRepresentation3D = typeof UnwindStructureAssemblyRepresentation3D;
declare const UnwindStructureAssemblyRepresentation3D: StateTransformer<SO.Molecule.Structure.Representation3D, SO.Molecule.Structure.Representation3DState, PD.Normalize<{
    t: number;
}>>;
type ExplodeStructureRepresentation3D = typeof ExplodeStructureRepresentation3D;
declare const ExplodeStructureRepresentation3D: StateTransformer<SO.Molecule.Structure.Representation3D, SO.Molecule.Structure.Representation3DState, PD.Normalize<{
    t: number;
}>>;
type SpinStructureRepresentation3D = typeof SpinStructureRepresentation3D;
declare const SpinStructureRepresentation3D: StateTransformer<SO.Molecule.Structure.Representation3D, SO.Molecule.Structure.Representation3DState, PD.Normalize<{
    axis: PD.NamedParams<PD.Normalize<{
        principalAxis: any;
    }>, "structure"> | PD.NamedParams<PD.Normalize<{
        vector: any;
    }>, "custom">;
    origin: PD.NamedParams<PD.Normalize<unknown>, "structure"> | PD.NamedParams<PD.Normalize<{
        vector: any;
    }>, "custom">;
    t: number;
}>>;
type OverpaintStructureRepresentation3DFromScript = typeof OverpaintStructureRepresentation3DFromScript;
declare const OverpaintStructureRepresentation3DFromScript: StateTransformer<SO.Molecule.Structure.Representation3D, SO.Molecule.Structure.Representation3DState, PD.Normalize<{
    layers: PD.Normalize<{
        script: Script;
        color: Color;
        clear: boolean;
    }>[];
}>>;
type OverpaintStructureRepresentation3DFromBundle = typeof OverpaintStructureRepresentation3DFromBundle;
declare const OverpaintStructureRepresentation3DFromBundle: StateTransformer<SO.Molecule.Structure.Representation3D, SO.Molecule.Structure.Representation3DState, PD.Normalize<{
    layers: PD.Normalize<{
        bundle: StructureElement.Bundle;
        color: Color;
        clear: boolean;
    }>[];
}>>;
type TransparencyStructureRepresentation3DFromScript = typeof TransparencyStructureRepresentation3DFromScript;
declare const TransparencyStructureRepresentation3DFromScript: StateTransformer<SO.Molecule.Structure.Representation3D, SO.Molecule.Structure.Representation3DState, PD.Normalize<{
    layers: PD.Normalize<{
        script: Script;
        value: number;
    }>[];
}>>;
type TransparencyStructureRepresentation3DFromBundle = typeof TransparencyStructureRepresentation3DFromBundle;
declare const TransparencyStructureRepresentation3DFromBundle: StateTransformer<SO.Molecule.Structure.Representation3D, SO.Molecule.Structure.Representation3DState, PD.Normalize<{
    layers: PD.Normalize<{
        bundle: StructureElement.Bundle;
        value: number;
    }>[];
}>>;
type SubstanceStructureRepresentation3DFromScript = typeof SubstanceStructureRepresentation3DFromScript;
declare const SubstanceStructureRepresentation3DFromScript: StateTransformer<SO.Molecule.Structure.Representation3D, SO.Molecule.Structure.Representation3DState, PD.Normalize<{
    layers: PD.Normalize<{
        script: Script;
        material: {
            metalness: number;
            roughness: number;
            bumpiness: number;
        };
        clear: boolean;
    }>[];
}>>;
type SubstanceStructureRepresentation3DFromBundle = typeof SubstanceStructureRepresentation3DFromBundle;
declare const SubstanceStructureRepresentation3DFromBundle: StateTransformer<SO.Molecule.Structure.Representation3D, SO.Molecule.Structure.Representation3DState, PD.Normalize<{
    layers: PD.Normalize<{
        bundle: StructureElement.Bundle;
        material: {
            metalness: number;
            roughness: number;
            bumpiness: number;
        };
        clear: boolean;
    }>[];
}>>;
type ClippingStructureRepresentation3DFromScript = typeof ClippingStructureRepresentation3DFromScript;
declare const ClippingStructureRepresentation3DFromScript: StateTransformer<SO.Molecule.Structure.Representation3D, SO.Molecule.Structure.Representation3DState, PD.Normalize<{
    layers: PD.Normalize<{
        script: Script;
        groups: Clipping.Groups.Flag;
    }>[];
}>>;
type ClippingStructureRepresentation3DFromBundle = typeof ClippingStructureRepresentation3DFromBundle;
declare const ClippingStructureRepresentation3DFromBundle: StateTransformer<SO.Molecule.Structure.Representation3D, SO.Molecule.Structure.Representation3DState, PD.Normalize<{
    layers: PD.Normalize<{
        bundle: StructureElement.Bundle;
        groups: Clipping.Groups.Flag;
    }>[];
}>>;
type ThemeStrengthRepresentation3D = typeof ThemeStrengthRepresentation3D;
declare const ThemeStrengthRepresentation3D: StateTransformer<SO.Molecule.Structure.Representation3D, SO.Molecule.Structure.Representation3DState, PD.Normalize<{
    overpaintStrength: number;
    transparencyStrength: number;
    substanceStrength: number;
}>>;
export declare namespace VolumeRepresentation3DHelpers {
    function getDefaultParams(ctx: PluginContext, name: VolumeRepresentationRegistry.BuiltIn, volume: Volume, volumeParams?: Partial<PD.Values<PD.Params>>, colorName?: ColorTheme.BuiltIn, colorParams?: Partial<ColorTheme.Props>, sizeName?: SizeTheme.BuiltIn, sizeParams?: Partial<SizeTheme.Props>): StateTransformer.Params<VolumeRepresentation3D>;
    function getDefaultParamsStatic(ctx: PluginContext, name: VolumeRepresentationRegistry.BuiltIn, volumeParams?: Partial<PD.Values<PD.Params>>, colorName?: ColorTheme.BuiltIn, colorParams?: Partial<ColorTheme.Props>, sizeName?: SizeTheme.BuiltIn, sizeParams?: Partial<SizeTheme.Props>): StateTransformer.Params<VolumeRepresentation3D>;
    function getDescription(props: any): string | undefined;
}
type VolumeRepresentation3D = typeof VolumeRepresentation3D;
declare const VolumeRepresentation3D: StateTransformer<SO.Volume.Data, SO.Volume.Representation3D, PD.Normalize<{
    type: PD.NamedParams<any, string>;
    colorTheme: PD.NamedParams<any, string>;
    sizeTheme: PD.NamedParams<any, string>;
}>>;
export { ShapeRepresentation3D };
type ShapeRepresentation3D = typeof ShapeRepresentation3D;
declare const ShapeRepresentation3D: StateTransformer<SO.Shape.Provider, SO.Shape.Representation3D, PD.Normalize<{}>>;
export { ModelUnitcell3D };
type ModelUnitcell3D = typeof ModelUnitcell3D;
declare const ModelUnitcell3D: StateTransformer<SO.Molecule.Model, SO.Shape.Representation3D, PD.Normalize<{
    cellColor: Color;
    cellScale: number;
    ref: "origin" | "model";
    attachment: "center" | "corner";
    doubleSided: boolean;
    flipSided: boolean;
    flatShaded: boolean;
    ignoreLight: boolean;
    xrayShaded: boolean | "inverted";
    transparentBackfaces: string;
    bumpFrequency: number;
    bumpAmplitude: number;
    alpha: number;
    quality: "auto" | "medium" | "high" | "low" | "custom" | "highest" | "higher" | "lower" | "lowest";
    material: PD.Normalize<{
        metalness: number;
        roughness: number;
        bumpiness: number;
    }>;
    clip: PD.Normalize<{
        variant: any;
        objects: any;
    }>;
    instanceGranularity: boolean;
}>>;
export { StructureBoundingBox3D };
type StructureBoundingBox3D = typeof StructureBoundingBox3D;
declare const StructureBoundingBox3D: StateTransformer<SO.Molecule.Structure, SO.Shape.Representation3D, PD.Normalize<{
    doubleSided: boolean;
    flipSided: boolean;
    flatShaded: boolean;
    ignoreLight: boolean;
    xrayShaded: boolean | "inverted";
    transparentBackfaces: string;
    bumpFrequency: number;
    bumpAmplitude: number;
    alpha: number;
    quality: "auto" | "medium" | "high" | "low" | "custom" | "highest" | "higher" | "lower" | "lowest";
    material: PD.Normalize<{
        metalness: number;
        roughness: number;
        bumpiness: number;
    }>;
    clip: PD.Normalize<{
        variant: any;
        objects: any;
    }>;
    instanceGranularity: boolean;
    radius: number;
    color: Color;
}>>;
export { StructureSelectionsDistance3D };
type StructureSelectionsDistance3D = typeof StructureSelectionsDistance3D;
declare const StructureSelectionsDistance3D: StateTransformer<SO.Molecule.Structure.Selections, SO.Shape.Representation3D, PD.Normalize<{
    visuals: ("lines" | "text")[];
    unitLabel: string;
    borderWidth: number;
    customText: string;
    textColor: Color;
    textSize: number;
    sizeFactor: number;
    borderColor: Color;
    offsetX: number;
    offsetY: number;
    offsetZ: number;
    background: boolean;
    backgroundMargin: number;
    backgroundColor: Color;
    backgroundOpacity: number;
    tether: boolean;
    tetherLength: number;
    tetherBaseWidth: number;
    attachment: "bottom-left" | "bottom-center" | "bottom-right" | "middle-left" | "middle-center" | "middle-right" | "top-left" | "top-center" | "top-right";
    fontFamily: import("../../mol-geo/geometry/text/font-atlas").FontFamily;
    fontQuality: number;
    fontStyle: import("../../mol-geo/geometry/text/font-atlas").FontStyle;
    fontVariant: import("../../mol-geo/geometry/text/font-atlas").FontVariant;
    fontWeight: import("../../mol-geo/geometry/text/font-atlas").FontWeight;
    alpha: number;
    quality: "auto" | "medium" | "high" | "low" | "custom" | "highest" | "higher" | "lower" | "lowest";
    material: PD.Normalize<{
        metalness: number;
        roughness: number;
        bumpiness: number;
    }>;
    clip: PD.Normalize<{
        variant: any;
        objects: any;
    }>;
    instanceGranularity: boolean;
    lineSizeAttenuation: boolean;
    linesColor: Color;
    linesSize: number;
    dashLength: number;
}>>;
export { StructureSelectionsAngle3D };
type StructureSelectionsAngle3D = typeof StructureSelectionsAngle3D;
declare const StructureSelectionsAngle3D: StateTransformer<SO.Molecule.Structure.Selections, SO.Shape.Representation3D, PD.Normalize<{
    visuals: ("text" | "vectors" | "sector" | "arc")[];
    borderWidth: number;
    customText: string;
    textColor: Color;
    textSize: number;
    sizeFactor: number;
    borderColor: Color;
    offsetX: number;
    offsetY: number;
    offsetZ: number;
    background: boolean;
    backgroundMargin: number;
    backgroundColor: Color;
    backgroundOpacity: number;
    tether: boolean;
    tetherLength: number;
    tetherBaseWidth: number;
    attachment: "bottom-left" | "bottom-center" | "bottom-right" | "middle-left" | "middle-center" | "middle-right" | "top-left" | "top-center" | "top-right";
    fontFamily: import("../../mol-geo/geometry/text/font-atlas").FontFamily;
    fontQuality: number;
    fontStyle: import("../../mol-geo/geometry/text/font-atlas").FontStyle;
    fontVariant: import("../../mol-geo/geometry/text/font-atlas").FontVariant;
    fontWeight: import("../../mol-geo/geometry/text/font-atlas").FontWeight;
    alpha: number;
    quality: "auto" | "medium" | "high" | "low" | "custom" | "highest" | "higher" | "lower" | "lowest";
    material: PD.Normalize<{
        metalness: number;
        roughness: number;
        bumpiness: number;
    }>;
    clip: PD.Normalize<{
        variant: any;
        objects: any;
    }>;
    instanceGranularity: boolean;
    ignoreLight: boolean;
    sectorOpacity: number;
    color: Color;
    arcScale: number;
    doubleSided: boolean;
    flipSided: boolean;
    flatShaded: boolean;
    xrayShaded: boolean | "inverted";
    transparentBackfaces: string;
    bumpFrequency: number;
    bumpAmplitude: number;
    lineSizeAttenuation: boolean;
    linesSize: number;
    dashLength: number;
}>>;
export { StructureSelectionsDihedral3D };
type StructureSelectionsDihedral3D = typeof StructureSelectionsDihedral3D;
declare const StructureSelectionsDihedral3D: StateTransformer<SO.Molecule.Structure.Selections, SO.Shape.Representation3D, PD.Normalize<{
    visuals: ("text" | "vectors" | "sector" | "arc" | "extenders" | "arms" | "connector")[];
    borderWidth: number;
    customText: string;
    textColor: Color;
    textSize: number;
    sizeFactor: number;
    borderColor: Color;
    offsetX: number;
    offsetY: number;
    offsetZ: number;
    background: boolean;
    backgroundMargin: number;
    backgroundColor: Color;
    backgroundOpacity: number;
    tether: boolean;
    tetherLength: number;
    tetherBaseWidth: number;
    attachment: "bottom-left" | "bottom-center" | "bottom-right" | "middle-left" | "middle-center" | "middle-right" | "top-left" | "top-center" | "top-right";
    fontFamily: import("../../mol-geo/geometry/text/font-atlas").FontFamily;
    fontQuality: number;
    fontStyle: import("../../mol-geo/geometry/text/font-atlas").FontStyle;
    fontVariant: import("../../mol-geo/geometry/text/font-atlas").FontVariant;
    fontWeight: import("../../mol-geo/geometry/text/font-atlas").FontWeight;
    alpha: number;
    quality: "auto" | "medium" | "high" | "low" | "custom" | "highest" | "higher" | "lower" | "lowest";
    material: PD.Normalize<{
        metalness: number;
        roughness: number;
        bumpiness: number;
    }>;
    clip: PD.Normalize<{
        variant: any;
        objects: any;
    }>;
    instanceGranularity: boolean;
    ignoreLight: boolean;
    sectorOpacity: number;
    color: Color;
    arcScale: number;
    doubleSided: boolean;
    flipSided: boolean;
    flatShaded: boolean;
    xrayShaded: boolean | "inverted";
    transparentBackfaces: string;
    bumpFrequency: number;
    bumpAmplitude: number;
    lineSizeAttenuation: boolean;
    linesSize: number;
    dashLength: number;
}>>;
export { StructureSelectionsLabel3D };
type StructureSelectionsLabel3D = typeof StructureSelectionsLabel3D;
declare const StructureSelectionsLabel3D: StateTransformer<SO.Molecule.Structure.Selections, SO.Shape.Representation3D, PD.Normalize<{
    scaleByRadius: boolean;
    visuals: "text"[];
    offsetZ: number;
    borderWidth: number;
    customText: string;
    textColor: Color;
    textSize: number;
    sizeFactor: number;
    borderColor: Color;
    offsetX: number;
    offsetY: number;
    background: boolean;
    backgroundMargin: number;
    backgroundColor: Color;
    backgroundOpacity: number;
    tether: boolean;
    tetherLength: number;
    tetherBaseWidth: number;
    attachment: "bottom-left" | "bottom-center" | "bottom-right" | "middle-left" | "middle-center" | "middle-right" | "top-left" | "top-center" | "top-right";
    fontFamily: import("../../mol-geo/geometry/text/font-atlas").FontFamily;
    fontQuality: number;
    fontStyle: import("../../mol-geo/geometry/text/font-atlas").FontStyle;
    fontVariant: import("../../mol-geo/geometry/text/font-atlas").FontVariant;
    fontWeight: import("../../mol-geo/geometry/text/font-atlas").FontWeight;
    alpha: number;
    quality: "auto" | "medium" | "high" | "low" | "custom" | "highest" | "higher" | "lower" | "lowest";
    material: PD.Normalize<{
        metalness: number;
        roughness: number;
        bumpiness: number;
    }>;
    clip: PD.Normalize<{
        variant: any;
        objects: any;
    }>;
    instanceGranularity: boolean;
}>>;
export { StructureSelectionsOrientation3D };
type StructureSelectionsOrientation3D = typeof StructureSelectionsOrientation3D;
declare const StructureSelectionsOrientation3D: StateTransformer<SO.Molecule.Structure.Selections, SO.Shape.Representation3D, PD.Normalize<{
    visuals: ("box" | "axes" | "ellipsoid")[];
    color: Color;
    scaleFactor: number;
    radiusScale: number;
    doubleSided: boolean;
    flipSided: boolean;
    flatShaded: boolean;
    ignoreLight: boolean;
    xrayShaded: boolean | "inverted";
    transparentBackfaces: string;
    bumpFrequency: number;
    bumpAmplitude: number;
    alpha: number;
    quality: "auto" | "medium" | "high" | "low" | "custom" | "highest" | "higher" | "lower" | "lowest";
    material: PD.Normalize<{
        metalness: number;
        roughness: number;
        bumpiness: number;
    }>;
    clip: PD.Normalize<{
        variant: any;
        objects: any;
    }>;
    instanceGranularity: boolean;
}>>;
export { StructureSelectionsPlane3D };
type StructureSelectionsPlane3D = typeof StructureSelectionsPlane3D;
declare const StructureSelectionsPlane3D: StateTransformer<SO.Molecule.Structure.Selections, SO.Shape.Representation3D, PD.Normalize<{
    visuals: "plane"[];
    color: Color;
    scaleFactor: number;
    doubleSided: boolean;
    flipSided: boolean;
    flatShaded: boolean;
    ignoreLight: boolean;
    xrayShaded: boolean | "inverted";
    transparentBackfaces: string;
    bumpFrequency: number;
    bumpAmplitude: number;
    alpha: number;
    quality: "auto" | "medium" | "high" | "low" | "custom" | "highest" | "higher" | "lower" | "lowest";
    material: PD.Normalize<{
        metalness: number;
        roughness: number;
        bumpiness: number;
    }>;
    clip: PD.Normalize<{
        variant: any;
        objects: any;
    }>;
    instanceGranularity: boolean;
}>>;
