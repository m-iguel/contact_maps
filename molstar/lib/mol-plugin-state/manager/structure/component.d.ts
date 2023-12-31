/**
 * Copyright (c) 2019-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { PluginContext } from '../../../mol-plugin/context';
import { StateTransformer } from '../../../mol-state';
import { ColorTheme } from '../../../mol-theme/color';
import { SizeTheme } from '../../../mol-theme/size';
import { ParamDefinition as PD } from '../../../mol-util/param-definition';
import { StructureRepresentationPresetProvider } from '../../builder/structure/representation-preset';
import { StatefulPluginComponent } from '../../component';
import { StructureSelectionQuery } from '../../helpers/structure-selection-query';
import { StructureRepresentation3D } from '../../transforms/representation';
import { StructureHierarchyRef, StructureComponentRef, StructureRef, StructureRepresentationRef } from './hierarchy-state';
import { Clip } from '../../../mol-util/clip';
export { StructureComponentManager };
interface StructureComponentManagerState {
    options: StructureComponentManager.Options;
}
declare class StructureComponentManager extends StatefulPluginComponent<StructureComponentManagerState> {
    plugin: PluginContext;
    readonly events: {
        optionsUpdated: import("rxjs").Subject<undefined>;
    };
    get currentStructures(): readonly StructureRef[];
    get pivotStructure(): StructureRef | undefined;
    _setSnapshotState(options: StructureComponentManager.Options): void;
    setOptions(options: StructureComponentManager.Options): Promise<void>;
    private updateReprParams;
    private updateInterationProps;
    applyPreset<P extends StructureRepresentationPresetProvider>(structures: ReadonlyArray<StructureRef>, provider: P, params?: StructureRepresentationPresetProvider.Params<P>): Promise<any>;
    private syncPreset;
    clear(structures: ReadonlyArray<StructureRef>): Promise<void>;
    selectThis(components: ReadonlyArray<StructureComponentRef>): void;
    canBeModified(ref: StructureHierarchyRef): boolean;
    modifyByCurrentSelection(components: ReadonlyArray<StructureComponentRef>, action: StructureComponentManager.ModifyAction): Promise<void>;
    toggleVisibility(components: ReadonlyArray<StructureComponentRef>, reprPivot?: StructureRepresentationRef): void;
    removeRepresentations(components: ReadonlyArray<StructureComponentRef>, pivot?: StructureRepresentationRef): Promise<void> | undefined;
    updateRepresentations(components: ReadonlyArray<StructureComponentRef>, pivot: StructureRepresentationRef, params: StateTransformer.Params<StructureRepresentation3D>): Promise<void>;
    /**
     * To update theme for all selected structures, use
     *   plugin.dataTransaction(async () => {
     *      for (const s of structure.hierarchy.selection.structures) await updateRepresentationsTheme(s.componets, ...);
     *   }, { canUndo: 'Update Theme' });
     */
    updateRepresentationsTheme<C extends ColorTheme.BuiltIn, S extends SizeTheme.BuiltIn>(components: ReadonlyArray<StructureComponentRef>, params: StructureComponentManager.UpdateThemeParams<C, S>): Promise<any> | undefined;
    updateRepresentationsTheme<C extends ColorTheme.BuiltIn, S extends SizeTheme.BuiltIn>(components: ReadonlyArray<StructureComponentRef>, params: (c: StructureComponentRef, r: StructureRepresentationRef) => StructureComponentManager.UpdateThemeParams<C, S>): Promise<any> | undefined;
    addRepresentation(components: ReadonlyArray<StructureComponentRef>, type: string): Promise<void> | undefined;
    private tryFindComponent;
    add(params: StructureComponentManager.AddParams, structures?: ReadonlyArray<StructureRef>): Promise<void>;
    applyTheme(params: StructureComponentManager.ThemeParams, structures?: ReadonlyArray<StructureRef>): Promise<void>;
    private modifyComponent;
    updateLabel(component: StructureComponentRef, label: string): void;
    private get dataState();
    private clearComponents;
    constructor(plugin: PluginContext);
}
declare namespace StructureComponentManager {
    const OptionsParams: {
        hydrogens: PD.Select<"all" | "hide-all" | "only-polar">;
        visualQuality: PD.Select<"auto" | "medium" | "high" | "low" | "custom" | "highest" | "higher" | "lower" | "lowest">;
        ignoreLight: PD.BooleanParam;
        materialStyle: PD.Group<PD.Normalize<{
            metalness: number;
            roughness: number;
            bumpiness: number;
        }>>;
        clipObjects: PD.Group<PD.Normalize<{
            variant: Clip.Variant;
            objects: PD.Normalize<{
                type: any;
                invert: any;
                position: any;
                rotation: any;
                scale: any;
            }>[];
        }>>;
        interactions: PD.Group<PD.Normalize<{
            providers: PD.Normalize<{
                ionic: any;
                'pi-stacking': any;
                'cation-pi': any;
                'halogen-bonds': any;
                'hydrogen-bonds': any;
                'weak-hydrogen-bonds': any;
                hydrophobic: any;
                'metal-coordination': any;
            }>;
            contacts: PD.Normalize<{
                lineOfSightDistFactor: any;
            }>;
        }>>;
    };
    type Options = PD.Values<typeof OptionsParams>;
    function getAddParams(plugin: PluginContext, params?: {
        pivot?: StructureRef;
        allowNone: boolean;
        hideSelection?: boolean;
        checkExisting?: boolean;
    }): {
        selection: PD.Select<StructureSelectionQuery>;
        representation: PD.Select<string>;
        options: PD.Group<PD.Normalize<{
            label: string;
            checkExisting: boolean;
        }>>;
    };
    type AddParams = {
        selection: StructureSelectionQuery;
        options: {
            checkExisting: boolean;
            label: string;
        };
        representation: string;
    };
    function getThemeParams(plugin: PluginContext, pivot: StructureRef | StructureComponentRef | undefined): {
        selection: PD.Select<StructureSelectionQuery>;
        action: PD.Mapped<PD.NamedParams<PD.Normalize<{
            color: import("../../../mol-util/color").Color;
        }>, "color"> | PD.NamedParams<PD.Normalize<{
            material: PD.Normalize<{
                metalness: number;
                roughness: number;
                bumpiness: number;
            }>;
        }>, "material"> | PD.NamedParams<PD.Normalize<{
            value: number;
        }>, "transparency"> | PD.NamedParams<PD.Normalize<{
            excludeGroups: ("one" | "two" | "three" | "four" | "five" | "six")[];
        }>, "clipping"> | PD.NamedParams<PD.Normalize<unknown>, "resetColor"> | PD.NamedParams<PD.Normalize<unknown>, "resetMaterial">>;
        representations: PD.MultiSelect<string>;
    };
    type ThemeParams = PD.Values<ReturnType<typeof getThemeParams>>;
    function getRepresentationTypes(plugin: PluginContext, pivot: StructureRef | StructureComponentRef | undefined): [string, string][];
    type ModifyAction = 'union' | 'subtract' | 'intersect';
    interface UpdateThemeParams<C extends ColorTheme.BuiltIn, S extends SizeTheme.BuiltIn> {
        /**
         * this works for any theme name (use 'name as any'), but code completion will break
         */
        color?: C | 'default';
        colorParams?: ColorTheme.BuiltInParams<C>;
        size?: S | 'default';
        sizeParams?: SizeTheme.BuiltInParams<S>;
    }
}
