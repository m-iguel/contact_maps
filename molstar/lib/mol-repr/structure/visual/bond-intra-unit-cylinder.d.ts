/**
 * Copyright (c) 2018-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { ParamDefinition as PD } from '../../../mol-util/param-definition';
import { Structure } from '../../../mol-model/structure';
import { UnitsVisual } from '../units-visual';
import { WebGLContext } from '../../../mol-gl/webgl/context';
export declare const IntraUnitBondCylinderParams: {
    sizeFactor: PD.Numeric;
    sizeAspectRatio: PD.Numeric;
    tryUseImpostor: PD.BooleanParam;
    includeParent: PD.BooleanParam;
    adjustCylinderLength: PD.BooleanParam;
    includeTypes: PD.MultiSelect<"covalent" | "metal-coordination" | "hydrogen-bond" | "disulfide" | "aromatic" | "computed">;
    excludeTypes: PD.MultiSelect<"covalent" | "metal-coordination" | "hydrogen-bond" | "disulfide" | "aromatic" | "computed">;
    ignoreHydrogens: PD.BooleanParam;
    ignoreHydrogensVariant: PD.Select<"all" | "non-polar">;
    aromaticBonds: PD.BooleanParam;
    multipleBonds: PD.Select<"offset" | "off" | "symmetric">;
    linkScale: PD.Numeric;
    linkSpacing: PD.Numeric;
    linkCap: PD.BooleanParam;
    aromaticScale: PD.Numeric;
    aromaticSpacing: PD.Numeric;
    aromaticDashCount: PD.Numeric;
    dashCount: PD.Numeric;
    dashScale: PD.Numeric;
    dashCap: PD.BooleanParam;
    stubCap: PD.BooleanParam;
    radialSegments: PD.Numeric;
    unitKinds: PD.MultiSelect<"spheres" | "gaussians" | "atomic">;
    doubleSided: PD.BooleanParam;
    ignoreLight: PD.BooleanParam;
    xrayShaded: PD.Select<boolean | "inverted">;
    transparentBackfaces: PD.Select<string>;
    solidInterior: PD.BooleanParam;
    bumpFrequency: PD.Numeric;
    bumpAmplitude: PD.Numeric;
    alpha: PD.Numeric;
    quality: PD.Select<"auto" | "medium" | "high" | "low" | "custom" | "highest" | "higher" | "lower" | "lowest">;
    material: PD.Group<PD.Normalize<{
        metalness: number;
        roughness: number;
        bumpiness: number;
    }>>;
    clip: PD.Group<PD.Normalize<{
        variant: import("../../../mol-util/clip").Clip.Variant;
        objects: PD.Normalize<{
            type: any;
            invert: any;
            position: any;
            rotation: any;
            scale: any;
        }>[];
    }>>;
    instanceGranularity: PD.BooleanParam;
    flipSided: PD.BooleanParam;
    flatShaded: PD.BooleanParam;
};
export type IntraUnitBondCylinderParams = typeof IntraUnitBondCylinderParams;
export declare function IntraUnitBondCylinderVisual(materialId: number, structure: Structure, props: PD.Values<IntraUnitBondCylinderParams>, webgl?: WebGLContext): UnitsVisual<{
    sizeFactor: PD.Numeric;
    sizeAspectRatio: PD.Numeric;
    tryUseImpostor: PD.BooleanParam;
    includeParent: PD.BooleanParam;
    adjustCylinderLength: PD.BooleanParam;
    includeTypes: PD.MultiSelect<"covalent" | "metal-coordination" | "hydrogen-bond" | "disulfide" | "aromatic" | "computed">;
    excludeTypes: PD.MultiSelect<"covalent" | "metal-coordination" | "hydrogen-bond" | "disulfide" | "aromatic" | "computed">;
    ignoreHydrogens: PD.BooleanParam;
    ignoreHydrogensVariant: PD.Select<"all" | "non-polar">;
    aromaticBonds: PD.BooleanParam;
    multipleBonds: PD.Select<"offset" | "off" | "symmetric">;
    linkScale: PD.Numeric;
    linkSpacing: PD.Numeric;
    linkCap: PD.BooleanParam;
    aromaticScale: PD.Numeric;
    aromaticSpacing: PD.Numeric;
    aromaticDashCount: PD.Numeric;
    dashCount: PD.Numeric;
    dashScale: PD.Numeric;
    dashCap: PD.BooleanParam;
    stubCap: PD.BooleanParam;
    radialSegments: PD.Numeric;
    unitKinds: PD.MultiSelect<"spheres" | "gaussians" | "atomic">;
    doubleSided: PD.BooleanParam;
    ignoreLight: PD.BooleanParam;
    xrayShaded: PD.Select<boolean | "inverted">;
    transparentBackfaces: PD.Select<string>;
    solidInterior: PD.BooleanParam;
    bumpFrequency: PD.Numeric;
    bumpAmplitude: PD.Numeric;
    alpha: PD.Numeric;
    quality: PD.Select<"auto" | "medium" | "high" | "low" | "custom" | "highest" | "higher" | "lower" | "lowest">;
    material: PD.Group<PD.Normalize<{
        metalness: number;
        roughness: number;
        bumpiness: number;
    }>>;
    clip: PD.Group<PD.Normalize<{
        variant: import("../../../mol-util/clip").Clip.Variant;
        objects: PD.Normalize<{
            type: any;
            invert: any;
            position: any;
            rotation: any;
            scale: any;
        }>[];
    }>>;
    instanceGranularity: PD.BooleanParam;
    flipSided: PD.BooleanParam;
    flatShaded: PD.BooleanParam;
}>;
export declare function IntraUnitBondCylinderImpostorVisual(materialId: number): UnitsVisual<IntraUnitBondCylinderParams>;
export declare function IntraUnitBondCylinderMeshVisual(materialId: number): UnitsVisual<IntraUnitBondCylinderParams>;
