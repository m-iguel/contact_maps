/**
 * Copyright (c) 2020-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { WebGLContext } from '../../mol-gl/webgl/context';
import { Scene } from '../../mol-gl/scene';
import { Vec3, Mat3 } from '../../mol-math/linear-algebra';
import { Sphere3D } from '../../mol-math/geometry';
import { ParamDefinition as PD } from '../../mol-util/param-definition';
import { PickingId } from '../../mol-geo/geometry/picking';
import { Camera } from '../camera';
import { DataLoci, Loci } from '../../mol-model/loci';
import { MarkerAction } from '../../mol-util/marker-action';
export declare const HandleHelperParams: {
    handle: PD.Mapped<PD.NamedParams<PD.Normalize<unknown>, "off"> | PD.NamedParams<PD.Normalize<{
        alpha: number;
        ignoreLight: boolean;
        colorX: import("../../mol-util/color").Color;
        colorY: import("../../mol-util/color").Color;
        colorZ: import("../../mol-util/color").Color;
        scale: number;
        doubleSided: boolean;
        flipSided: boolean;
        flatShaded: boolean;
        xrayShaded: boolean | "inverted";
        transparentBackfaces: string;
        bumpFrequency: number;
        bumpAmplitude: number;
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
    }>, "on">>;
};
export type HandleHelperParams = typeof HandleHelperParams;
export type HandleHelperProps = PD.Values<HandleHelperParams>;
export declare class HandleHelper {
    private webgl;
    scene: Scene;
    props: HandleHelperProps;
    private renderObject;
    private pixelRatio;
    private _transform;
    getBoundingSphere(out: Sphere3D, instanceId: number): Sphere3D;
    setProps(props: Partial<HandleHelperProps>): void;
    get isEnabled(): boolean;
    update(camera: Camera, position: Vec3, rotation: Mat3): void;
    getLoci(pickingId: PickingId): {
        kind: "empty-loci";
    } | DataLoci<HandleHelper, {
        groupId: number;
        instanceId: number;
    }>;
    private eachGroup;
    mark(loci: Loci, action: MarkerAction): boolean;
    constructor(webgl: WebGLContext, props?: Partial<HandleHelperProps>);
}
export declare const HandleGroup: {
    readonly None: 0;
    readonly TranslateScreenXY: 1;
    readonly TranslateObjectX: 3;
    readonly TranslateObjectY: 4;
    readonly TranslateObjectZ: 5;
};
declare function HandleLoci(handleHelper: HandleHelper, groupId: number, instanceId: number): DataLoci<HandleHelper, {
    groupId: number;
    instanceId: number;
}>;
export type HandleLoci = ReturnType<typeof HandleLoci>;
export declare function isHandleLoci(x: Loci): x is HandleLoci;
export {};
