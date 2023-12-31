/**
 * Copyright (c) 2018-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { ParamDefinition as PD } from '../../../mol-util/param-definition';
import { PluginBehavior } from '../../../mol-plugin/behavior/behavior';
import { PluginStateObject } from '../../../mol-plugin-state/objects';
import { PluginContext } from '../../../mol-plugin/context';
import { StateTransformer, StateAction, StateObject, StateTransform, StateObjectRef } from '../../../mol-state';
import { StructureRepresentationPresetProvider } from '../../../mol-plugin-state/builder/structure/representation-preset';
export declare const RCSBAssemblySymmetry: StateTransformer<PluginBehavior.Category, PluginBehavior.Behavior, {
    autoAttach: boolean;
}>;
export declare const InitAssemblySymmetry3D: StateAction<PluginStateObject.Molecule.Structure, void, PD.Normalize<{}>>;
export { AssemblySymmetry3D };
type AssemblySymmetry3D = typeof AssemblySymmetry3D;
declare const AssemblySymmetry3D: StateTransformer<PluginStateObject.Molecule.Structure, PluginStateObject.Shape.Representation3D, PD.Normalize<{
    visuals: ("axes" | "cage")[];
    cageColor: import("../../../mol-util/color").Color;
    scale: number;
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
    axesColor: PD.NamedParams<PD.Normalize<{
        colorValue: any;
    }>, "uniform"> | PD.NamedParams<PD.Normalize<unknown>, "byOrder">;
}>>;
export declare const AssemblySymmetryPresetParams: {
    ignoreHydrogens: PD.Base<boolean | undefined>;
    ignoreHydrogensVariant: PD.Base<"all" | "non-polar" | undefined>;
    ignoreLight: PD.Base<boolean | undefined>;
    quality: PD.Base<"auto" | "medium" | "high" | "low" | "custom" | "highest" | "higher" | "lower" | "lowest" | undefined>;
    theme: PD.Base<PD.Normalize<{
        globalName: "uniform" | "occupancy" | "element-index" | "element-symbol" | "hydrophobicity" | "shape-group" | "uncertainty" | "carbohydrate-symbol" | "chain-id" | "operator-name" | "entity-id" | "entity-source" | "model-index" | "structure-index" | "molecule-type" | "polymer-id" | "polymer-index" | "residue-name" | "secondary-structure" | "sequence-id" | "unit-index" | "illustrative" | "trajectory-index" | "operator-hkl" | "partial-charge" | "atom-id" | "volume-value" | "volume-segment" | "external-volume" | "cartoon" | undefined;
        globalColorParams: any;
        carbonColor: "element-symbol" | "chain-id" | "operator-name" | undefined;
        symmetryColor: "uniform" | "occupancy" | "element-index" | "element-symbol" | "hydrophobicity" | "shape-group" | "uncertainty" | "carbohydrate-symbol" | "chain-id" | "operator-name" | "entity-id" | "entity-source" | "model-index" | "structure-index" | "molecule-type" | "polymer-id" | "polymer-index" | "residue-name" | "secondary-structure" | "sequence-id" | "unit-index" | "illustrative" | "trajectory-index" | "operator-hkl" | "partial-charge" | "atom-id" | "volume-value" | "volume-segment" | "external-volume" | "cartoon" | undefined;
        symmetryColorParams: any;
        focus: PD.Normalize<{
            name: any;
            params: any;
        }> | undefined;
    }> | undefined>;
};
export declare const AssemblySymmetryPreset: StructureRepresentationPresetProvider<{
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
        polymer: import("../../../mol-state").StateObjectSelector<PluginStateObject.Molecule.Structure, StateTransformer<StateObject<any, StateObject.Type<any>>, StateObject<any, StateObject.Type<any>>, any>> | undefined;
    } | {
        all: import("../../../mol-state").StateObjectSelector<PluginStateObject.Molecule.Structure, StateTransformer<StateObject<any, StateObject.Type<any>>, StateObject<any, StateObject.Type<any>>, any>> | undefined;
        branched: undefined;
    } | undefined;
    representations: {
        assemblySymmetry: import("../../../mol-state").StateObjectSelector<PluginStateObject.Shape.Representation3D, StateTransformer<StateObject<any, StateObject.Type<any>>, StateObject<any, StateObject.Type<any>>, any>>;
    } | {
        assemblySymmetry: import("../../../mol-state").StateObjectSelector<PluginStateObject.Shape.Representation3D, StateTransformer<StateObject<any, StateObject.Type<any>>, StateObject<any, StateObject.Type<any>>, any>>;
        polymer: import("../../../mol-state").StateObjectSelector<PluginStateObject.Molecule.Structure.Representation3D, StateTransformer<StateObject<any, StateObject.Type<any>>, StateObject<any, StateObject.Type<any>>, any>>;
    } | {
        assemblySymmetry: import("../../../mol-state").StateObjectSelector<PluginStateObject.Shape.Representation3D, StateTransformer<StateObject<any, StateObject.Type<any>>, StateObject<any, StateObject.Type<any>>, any>>;
        all: import("../../../mol-state").StateObjectSelector<PluginStateObject.Molecule.Structure.Representation3D, StateTransformer<StateObject<any, StateObject.Type<any>>, StateObject<any, StateObject.Type<any>>, any>>;
    };
}>;
export declare function tryCreateAssemblySymmetry(plugin: PluginContext, structure: StateObjectRef<PluginStateObject.Molecule.Structure>, params?: StateTransformer.Params<AssemblySymmetry3D>, initialState?: Partial<StateTransform.State>): Promise<import("../../../mol-state").StateObjectSelector<PluginStateObject.Shape.Representation3D, StateTransformer<StateObject<any, StateObject.Type<any>>, StateObject<any, StateObject.Type<any>>, any>>>;
