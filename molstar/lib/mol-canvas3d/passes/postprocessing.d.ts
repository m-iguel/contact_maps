/**
 * Copyright (c) 2019-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author Áron Samuel Kovács <aron.kovacs@mail.muni.cz>
 * @author Ludovic Autin <ludovic.autin@gmail.com>
 */
import { WebGLContext } from '../../mol-gl/webgl/context';
import { ParamDefinition as PD } from '../../mol-util/param-definition';
import { RenderTarget } from '../../mol-gl/webgl/render-target';
import { DrawPass } from './draw';
import { ICamera } from '../../mol-canvas3d/camera';
import { Color } from '../../mol-util/color';
import { BackgroundPass } from './background';
import { AssetManager } from '../../mol-util/assets';
import { Light } from '../../mol-gl/renderer';
export declare const PostprocessingParams: {
    occlusion: PD.Mapped<PD.NamedParams<PD.Normalize<unknown>, "off"> | PD.NamedParams<PD.Normalize<{
        samples: number;
        multiScale: PD.NamedParams<PD.Normalize<unknown>, "off"> | PD.NamedParams<PD.Normalize<{
            levels: any;
            nearThreshold: any;
            farThreshold: any;
        }>, "on">;
        radius: number;
        bias: number;
        blurKernelSize: number;
        resolutionScale: number;
        color: Color;
    }>, "on">>;
    shadow: PD.Mapped<PD.NamedParams<PD.Normalize<unknown>, "off"> | PD.NamedParams<PD.Normalize<{
        steps: number;
        bias: number;
        maxDistance: number;
        tolerance: number;
    }>, "on">>;
    outline: PD.Mapped<PD.NamedParams<PD.Normalize<unknown>, "off"> | PD.NamedParams<PD.Normalize<{
        scale: number;
        threshold: number;
        color: Color;
        includeTransparent: boolean;
    }>, "on">>;
    antialiasing: PD.Mapped<PD.NamedParams<PD.Normalize<unknown>, "off"> | PD.NamedParams<PD.Normalize<{
        edgeThreshold: number;
        maxSearchSteps: number;
    }>, "smaa"> | PD.NamedParams<PD.Normalize<{
        edgeThresholdMin: number;
        edgeThresholdMax: number;
        iterations: number;
        subpixelQuality: number;
    }>, "fxaa">>;
    background: PD.Group<PD.Normalize<{
        variant: PD.NamedParams<PD.Normalize<unknown>, "off"> | PD.NamedParams<PD.Normalize<{
            coverage: any;
            opacity: any;
            saturation: any;
            lightness: any;
            source: any;
            blur: any;
        }>, "image"> | PD.NamedParams<PD.Normalize<{
            centerColor: any;
            edgeColor: any;
            ratio: any;
            coverage: any;
        }>, "radialGradient"> | PD.NamedParams<PD.Normalize<{
            opacity: any;
            saturation: any;
            lightness: any;
            faces: any;
            blur: any;
        }>, "skybox"> | PD.NamedParams<PD.Normalize<{
            topColor: any;
            bottomColor: any;
            ratio: any;
            coverage: any;
        }>, "horizontalGradient">;
    }>>;
};
export type PostprocessingProps = PD.Values<typeof PostprocessingParams>;
export declare class PostprocessingPass {
    private readonly webgl;
    private readonly drawPass;
    static isEnabled(props: PostprocessingProps): boolean;
    static isTransparentOutlineEnabled(props: PostprocessingProps): boolean;
    readonly target: RenderTarget;
    private readonly outlinesTarget;
    private readonly outlinesRenderable;
    private readonly shadowsTarget;
    private readonly shadowsRenderable;
    private readonly ssaoFramebuffer;
    private readonly ssaoBlurFirstPassFramebuffer;
    private readonly ssaoBlurSecondPassFramebuffer;
    private readonly downsampledDepthTarget;
    private readonly downsampleDepthRenderable;
    private readonly depthHalfTarget;
    private readonly depthHalfRenderable;
    private readonly depthQuarterTarget;
    private readonly depthQuarterRenderable;
    private readonly ssaoDepthTexture;
    private readonly ssaoDepthBlurProxyTexture;
    private readonly ssaoRenderable;
    private readonly ssaoBlurFirstPassRenderable;
    private readonly ssaoBlurSecondPassRenderable;
    private nSamples;
    private blurKernelSize;
    private downsampleFactor;
    private readonly renderable;
    private ssaoScale;
    private calcSsaoScale;
    private levels;
    private readonly bgColor;
    readonly background: BackgroundPass;
    constructor(webgl: WebGLContext, assetManager: AssetManager, drawPass: DrawPass);
    setSize(width: number, height: number): void;
    private updateState;
    private occlusionOffset;
    setOcclusionOffset(x: number, y: number): void;
    private transparentBackground;
    setTransparentBackground(value: boolean): void;
    render(camera: ICamera, toDrawingBuffer: boolean, transparentBackground: boolean, backgroundColor: Color, props: PostprocessingProps, light: Light): void;
}
export declare class AntialiasingPass {
    private drawPass;
    static isEnabled(props: PostprocessingProps): boolean;
    readonly target: RenderTarget;
    private readonly fxaa;
    private readonly smaa;
    constructor(webgl: WebGLContext, drawPass: DrawPass);
    setSize(width: number, height: number): void;
    private _renderFxaa;
    private _renderSmaa;
    render(camera: ICamera, toDrawingBuffer: boolean, props: PostprocessingProps): void;
}
