/**
 * Copyright (c) 2018-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { StateAction, StateTransformer } from '../../mol-state';
import { ParamDefinition as PD } from '../../mol-util/param-definition';
import { PluginStateObject } from '../objects';
export declare const PdbDownloadProvider: {
    rcsb: PD.Group<PD.Normalize<{
        encoding: "cif" | "bcif";
    }>>;
    pdbe: PD.Group<PD.Normalize<{
        variant: "updated" | "updated-bcif" | "updtaed-bcif" | "archival";
    }>>;
    pdbj: PD.Group<PD.Normalize<unknown>>;
};
export type PdbDownloadProvider = keyof typeof PdbDownloadProvider;
export { DownloadStructure };
type DownloadStructure = typeof DownloadStructure;
declare const DownloadStructure: StateAction<PluginStateObject.Root, void, PD.Normalize<{
    source: PD.NamedParams<PD.Normalize<{
        provider: any;
        options: any;
    }>, "pdb"> | PD.NamedParams<PD.Normalize<{
        url: any;
        format: any;
        isBinary: any;
        label: any;
        options: any;
    }>, "url"> | PD.NamedParams<PD.Normalize<{
        id: any;
        options: any;
    }>, "alphafolddb"> | PD.NamedParams<PD.Normalize<{
        id: any;
        options: any;
    }>, "modelarchive"> | PD.NamedParams<PD.Normalize<{
        provider: any;
        options: any;
    }>, "pdb-dev"> | PD.NamedParams<PD.Normalize<{
        id: any;
        options: any;
    }>, "swissmodel"> | PD.NamedParams<PD.Normalize<{
        id: any;
        options: any;
    }>, "pubchem">;
}>>;
export declare const UpdateTrajectory: StateAction<import("../../mol-state/object").StateObject<any, import("../../mol-state/object").StateObject.Type<any>>, void, PD.Normalize<{
    action: "reset" | "advance";
    by: number | undefined;
}>>;
export declare const EnableModelCustomProps: StateAction<PluginStateObject.Molecule.Model, Promise<import("../../mol-state").StateObjectSelector<PluginStateObject.Molecule.Model, StateTransformer<import("../../mol-state/object").StateObject<any, import("../../mol-state/object").StateObject.Type<any>>, import("../../mol-state/object").StateObject<any, import("../../mol-state/object").StateObject.Type<any>>, any>>>, PD.Normalize<{
    autoAttach: string[];
    properties: PD.Normalize<{
        [x: string]: any;
    }>;
}>>;
export declare const EnableStructureCustomProps: StateAction<PluginStateObject.Molecule.Structure, Promise<import("../../mol-state").StateObjectSelector<PluginStateObject.Molecule.Structure, StateTransformer<import("../../mol-state/object").StateObject<any, import("../../mol-state/object").StateObject.Type<any>>, import("../../mol-state/object").StateObject<any, import("../../mol-state/object").StateObject.Type<any>>, any>>>, PD.Normalize<{
    autoAttach: string[];
    properties: PD.Normalize<{
        [x: string]: any;
    }>;
}>>;
export declare const AddTrajectory: StateAction<PluginStateObject.Root, void, PD.Normalize<{
    model: string;
    coordinates: string;
}>>;
export declare const LoadTrajectory: StateAction<PluginStateObject.Root, void, PD.Normalize<{
    source: PD.NamedParams<PD.Normalize<{
        model: any;
        coordinates: any;
    }>, "url"> | PD.NamedParams<PD.Normalize<{
        model: any;
        coordinates: any;
    }>, "file">;
}>>;
