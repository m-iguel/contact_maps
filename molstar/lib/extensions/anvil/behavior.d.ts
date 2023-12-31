/**
 * Copyright (c) 2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author Sebastian Bittrich <sebastian.bittrich@rcsb.org>
 */
import { ParamDefinition as PD } from '../../mol-util/param-definition';
import { StructureRepresentationPresetProvider } from '../../mol-plugin-state/builder/structure/representation-preset';
import { StateObjectRef, StateTransformer, StateTransform } from '../../mol-state';
import { PluginBehavior } from '../../mol-plugin/behavior';
import { PluginStateObject } from '../../mol-plugin-state/objects';
import { PluginContext } from '../../mol-plugin/context';
import { StructureSelectionQuery } from '../../mol-plugin-state/helpers/structure-selection-query';
export declare const ANVILMembraneOrientation: StateTransformer<PluginBehavior.Category, PluginBehavior.Behavior, {
    autoAttach: boolean;
}>;
export declare const isTransmembrane: StructureSelectionQuery;
export { MembraneOrientation3D };
type MembraneOrientation3D = typeof MembraneOrientation3D;
declare const MembraneOrientation3D: StateTransformer<PluginStateObject.Molecule.Structure, PluginStateObject.Shape.Representation3D, PD.Normalize<{
    visuals: ("bilayer-planes" | "bilayer-rims")[];
    lineSizeAttenuation: boolean;
    linesSize: number;
    dashedLines: boolean;
    color: import("../../mol-util/color").Color;
    radiusFactor: number;
    sizeFactor: number;
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
    sectorOpacity: number;
    doubleSided: boolean;
    flipSided: boolean;
    flatShaded: boolean;
    ignoreLight: boolean;
    xrayShaded: boolean | "inverted";
    transparentBackfaces: string;
    bumpFrequency: number;
    bumpAmplitude: number;
}>>;
export declare const MembraneOrientationPreset: StructureRepresentationPresetProvider<{
    ignoreHydrogens: boolean | undefined;
    ignoreHydrogensVariant: "all" | "non-polar" | undefined;
    ignoreLight: boolean | undefined;
    quality: "auto" | "medium" | "high" | "low" | "custom" | "highest" | "higher" | "lower" | "lowest" | undefined;
    theme: PD.Normalize<{
        globalName: any;
        globalColorParams: any;
        carbonColor: any;
        symmetryColor: any;
        symmetryColorParams: any;
        focus: any;
    }> | undefined;
}, {
    components?: undefined;
    representations?: undefined;
} | {
    components: {
        polymer: import("../../mol-state").StateObjectSelector<PluginStateObject.Molecule.Structure, StateTransformer<import("../../mol-state/object").StateObject<any, import("../../mol-state/object").StateObject.Type<any>>, import("../../mol-state/object").StateObject<any, import("../../mol-state/object").StateObject.Type<any>>, any>> | undefined;
    } | {
        all: import("../../mol-state").StateObjectSelector<PluginStateObject.Molecule.Structure, StateTransformer<import("../../mol-state/object").StateObject<any, import("../../mol-state/object").StateObject.Type<any>>, import("../../mol-state/object").StateObject<any, import("../../mol-state/object").StateObject.Type<any>>, any>> | undefined;
        branched: undefined;
    } | undefined;
    representations: {
        membraneOrientation: import("../../mol-state").StateObjectSelector<PluginStateObject.Shape.Representation3D, StateTransformer<import("../../mol-state/object").StateObject<any, import("../../mol-state/object").StateObject.Type<any>>, import("../../mol-state/object").StateObject<any, import("../../mol-state/object").StateObject.Type<any>>, any>>;
    } | {
        membraneOrientation: import("../../mol-state").StateObjectSelector<PluginStateObject.Shape.Representation3D, StateTransformer<import("../../mol-state/object").StateObject<any, import("../../mol-state/object").StateObject.Type<any>>, import("../../mol-state/object").StateObject<any, import("../../mol-state/object").StateObject.Type<any>>, any>>;
        polymer: import("../../mol-state").StateObjectSelector<PluginStateObject.Molecule.Structure.Representation3D, StateTransformer<import("../../mol-state/object").StateObject<any, import("../../mol-state/object").StateObject.Type<any>>, import("../../mol-state/object").StateObject<any, import("../../mol-state/object").StateObject.Type<any>>, any>>;
    } | {
        membraneOrientation: import("../../mol-state").StateObjectSelector<PluginStateObject.Shape.Representation3D, StateTransformer<import("../../mol-state/object").StateObject<any, import("../../mol-state/object").StateObject.Type<any>>, import("../../mol-state/object").StateObject<any, import("../../mol-state/object").StateObject.Type<any>>, any>>;
        all: import("../../mol-state").StateObjectSelector<PluginStateObject.Molecule.Structure.Representation3D, StateTransformer<import("../../mol-state/object").StateObject<any, import("../../mol-state/object").StateObject.Type<any>>, import("../../mol-state/object").StateObject<any, import("../../mol-state/object").StateObject.Type<any>>, any>>;
    };
}>;
export declare function tryCreateMembraneOrientation(plugin: PluginContext, structure: StateObjectRef<PluginStateObject.Molecule.Structure>, params?: StateTransformer.Params<MembraneOrientation3D>, initialState?: Partial<StateTransform.State>): Promise<import("../../mol-state").StateObjectSelector<PluginStateObject.Shape.Representation3D, StateTransformer<import("../../mol-state/object").StateObject<any, import("../../mol-state/object").StateObject.Type<any>>, import("../../mol-state/object").StateObject<any, import("../../mol-state/object").StateObject.Type<any>>, any>>>;
