/**
 * Copyright (c) 2018-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author Adam Midlik <midlik@gmail.com>
 */
import { Camera } from '../mol-canvas3d/camera';
import { PluginCommand } from './command';
import { StateTransform, State, StateAction } from '../mol-state';
import { Canvas3DProps } from '../mol-canvas3d/canvas3d';
import { PluginLayoutStateProps } from './layout';
import { Structure, StructureElement } from '../mol-model/structure';
import { PluginState } from './state';
import { PluginToast } from './util/toast';
import { Vec3 } from '../mol-math/linear-algebra';
export declare const PluginCommands: {
    State: {
        SetCurrentObject: PluginCommand<{
            state: State;
            ref: StateTransform.Ref;
        }>;
        ApplyAction: PluginCommand<{
            state: State;
            action: StateAction.Instance;
            ref?: string | undefined;
        }>;
        Update: PluginCommand<{
            state: State;
            tree: State.Tree | State.Builder;
            options?: Partial<State.UpdateOptions> | undefined;
        }>;
        RemoveObject: PluginCommand<{
            state: State;
            ref: StateTransform.Ref;
            removeParentGhosts?: boolean | undefined;
        }>;
        ToggleExpanded: PluginCommand<{
            state: State;
            ref: StateTransform.Ref;
        }>;
        ToggleVisibility: PluginCommand<{
            state: State;
            ref: StateTransform.Ref;
        }>;
        Snapshots: {
            Add: PluginCommand<{
                name?: string | undefined;
                description?: string | undefined;
                params?: Partial<import("../mol-util/param-definition").ParamDefinition.Values<{
                    durationInMs: import("../mol-util/param-definition").ParamDefinition.Numeric;
                    data: import("../mol-util/param-definition").ParamDefinition.BooleanParam;
                    behavior: import("../mol-util/param-definition").ParamDefinition.BooleanParam;
                    structureSelection: import("../mol-util/param-definition").ParamDefinition.BooleanParam;
                    componentManager: import("../mol-util/param-definition").ParamDefinition.BooleanParam;
                    animation: import("../mol-util/param-definition").ParamDefinition.BooleanParam;
                    startAnimation: import("../mol-util/param-definition").ParamDefinition.BooleanParam;
                    canvas3d: import("../mol-util/param-definition").ParamDefinition.BooleanParam;
                    interactivity: import("../mol-util/param-definition").ParamDefinition.BooleanParam;
                    camera: import("../mol-util/param-definition").ParamDefinition.BooleanParam;
                    cameraTransition: import("../mol-util/param-definition").ParamDefinition.Mapped<import("../mol-util/param-definition").ParamDefinition.NamedParams<import("../mol-util/param-definition").ParamDefinition.Normalize<{
                        durationInMs: number;
                    }>, "animate"> | import("../mol-util/param-definition").ParamDefinition.NamedParams<import("../mol-util/param-definition").ParamDefinition.Normalize<unknown>, "instant">>;
                    image: import("../mol-util/param-definition").ParamDefinition.BooleanParam;
                }>> | undefined;
            }>;
            Replace: PluginCommand<{
                id: string;
                params?: Partial<import("../mol-util/param-definition").ParamDefinition.Values<{
                    durationInMs: import("../mol-util/param-definition").ParamDefinition.Numeric;
                    data: import("../mol-util/param-definition").ParamDefinition.BooleanParam;
                    behavior: import("../mol-util/param-definition").ParamDefinition.BooleanParam;
                    structureSelection: import("../mol-util/param-definition").ParamDefinition.BooleanParam;
                    componentManager: import("../mol-util/param-definition").ParamDefinition.BooleanParam;
                    animation: import("../mol-util/param-definition").ParamDefinition.BooleanParam;
                    startAnimation: import("../mol-util/param-definition").ParamDefinition.BooleanParam;
                    canvas3d: import("../mol-util/param-definition").ParamDefinition.BooleanParam;
                    interactivity: import("../mol-util/param-definition").ParamDefinition.BooleanParam;
                    camera: import("../mol-util/param-definition").ParamDefinition.BooleanParam;
                    cameraTransition: import("../mol-util/param-definition").ParamDefinition.Mapped<import("../mol-util/param-definition").ParamDefinition.NamedParams<import("../mol-util/param-definition").ParamDefinition.Normalize<{
                        durationInMs: number;
                    }>, "animate"> | import("../mol-util/param-definition").ParamDefinition.NamedParams<import("../mol-util/param-definition").ParamDefinition.Normalize<unknown>, "instant">>;
                    image: import("../mol-util/param-definition").ParamDefinition.BooleanParam;
                }>> | undefined;
            }>;
            Move: PluginCommand<{
                id: string;
                dir: -1 | 1;
            }>;
            Remove: PluginCommand<{
                id: string;
            }>;
            Apply: PluginCommand<{
                id: string;
            }>;
            Clear: PluginCommand<{}>;
            Upload: PluginCommand<{
                name?: string | undefined;
                description?: string | undefined;
                playOnLoad?: boolean | undefined;
                serverUrl: string;
                params?: Partial<import("../mol-util/param-definition").ParamDefinition.Values<{
                    durationInMs: import("../mol-util/param-definition").ParamDefinition.Numeric;
                    data: import("../mol-util/param-definition").ParamDefinition.BooleanParam;
                    behavior: import("../mol-util/param-definition").ParamDefinition.BooleanParam;
                    structureSelection: import("../mol-util/param-definition").ParamDefinition.BooleanParam;
                    componentManager: import("../mol-util/param-definition").ParamDefinition.BooleanParam;
                    animation: import("../mol-util/param-definition").ParamDefinition.BooleanParam;
                    startAnimation: import("../mol-util/param-definition").ParamDefinition.BooleanParam;
                    canvas3d: import("../mol-util/param-definition").ParamDefinition.BooleanParam;
                    interactivity: import("../mol-util/param-definition").ParamDefinition.BooleanParam;
                    camera: import("../mol-util/param-definition").ParamDefinition.BooleanParam;
                    cameraTransition: import("../mol-util/param-definition").ParamDefinition.Mapped<import("../mol-util/param-definition").ParamDefinition.NamedParams<import("../mol-util/param-definition").ParamDefinition.Normalize<{
                        durationInMs: number;
                    }>, "animate"> | import("../mol-util/param-definition").ParamDefinition.NamedParams<import("../mol-util/param-definition").ParamDefinition.Normalize<unknown>, "instant">>;
                    image: import("../mol-util/param-definition").ParamDefinition.BooleanParam;
                }>> | undefined;
            }>;
            Fetch: PluginCommand<{
                url: string;
            }>;
            DownloadToFile: PluginCommand<{
                name?: string | undefined;
                type: PluginState.SnapshotType;
                params?: Partial<import("../mol-util/param-definition").ParamDefinition.Values<{
                    durationInMs: import("../mol-util/param-definition").ParamDefinition.Numeric;
                    data: import("../mol-util/param-definition").ParamDefinition.BooleanParam;
                    behavior: import("../mol-util/param-definition").ParamDefinition.BooleanParam;
                    structureSelection: import("../mol-util/param-definition").ParamDefinition.BooleanParam;
                    componentManager: import("../mol-util/param-definition").ParamDefinition.BooleanParam;
                    animation: import("../mol-util/param-definition").ParamDefinition.BooleanParam;
                    startAnimation: import("../mol-util/param-definition").ParamDefinition.BooleanParam;
                    canvas3d: import("../mol-util/param-definition").ParamDefinition.BooleanParam;
                    interactivity: import("../mol-util/param-definition").ParamDefinition.BooleanParam;
                    camera: import("../mol-util/param-definition").ParamDefinition.BooleanParam;
                    cameraTransition: import("../mol-util/param-definition").ParamDefinition.Mapped<import("../mol-util/param-definition").ParamDefinition.NamedParams<import("../mol-util/param-definition").ParamDefinition.Normalize<{
                        durationInMs: number;
                    }>, "animate"> | import("../mol-util/param-definition").ParamDefinition.NamedParams<import("../mol-util/param-definition").ParamDefinition.Normalize<unknown>, "instant">>;
                    image: import("../mol-util/param-definition").ParamDefinition.BooleanParam;
                }>> | undefined;
            }>;
            OpenFile: PluginCommand<{
                file: File;
            }>;
            OpenUrl: PluginCommand<{
                url: string;
                type: PluginState.SnapshotType;
            }>;
        };
    };
    Interactivity: {
        Object: {
            Highlight: PluginCommand<{
                state: State;
                ref: StateTransform.Ref | StateTransform.Ref[];
            }>;
        };
        Structure: {
            Highlight: PluginCommand<{
                loci: StructureElement.Loci;
                isOff?: boolean | undefined;
            }>;
            Select: PluginCommand<{
                loci: StructureElement.Loci;
                isOff?: boolean | undefined;
            }>;
        };
        ClearHighlights: PluginCommand<{}>;
    };
    Layout: {
        Update: PluginCommand<{
            state: Partial<PluginLayoutStateProps>;
        }>;
    };
    Toast: {
        Show: PluginCommand<PluginToast>;
        Hide: PluginCommand<{
            key: string;
        }>;
    };
    Camera: {
        Reset: PluginCommand<{
            durationMs?: number | undefined;
            snapshot?: Partial<Camera.Snapshot> | undefined;
        }>;
        SetSnapshot: PluginCommand<{
            snapshot: Partial<Camera.Snapshot>;
            durationMs?: number | undefined;
        }>;
        Focus: PluginCommand<{
            center: Vec3;
            radius: number;
            durationMs?: number | undefined;
        }>;
        OrientAxes: PluginCommand<{
            structures?: Structure[] | undefined;
            durationMs?: number | undefined;
        }>;
        ResetAxes: PluginCommand<{
            durationMs?: number | undefined;
        }>;
    };
    Canvas3D: {
        SetSettings: PluginCommand<{
            settings: Partial<import("../mol-util/param-definition").ParamDefinition.Values<{
                camera: import("../mol-util/param-definition").ParamDefinition.Group<import("../mol-util/param-definition").ParamDefinition.Normalize<{
                    mode: "perspective" | "orthographic";
                    helper: import("../mol-util/param-definition").ParamDefinition.Normalize<{
                        axes: any;
                    }>;
                    stereo: import("../mol-util/param-definition").ParamDefinition.NamedParams<import("../mol-util/param-definition").ParamDefinition.Normalize<unknown>, "off"> | import("../mol-util/param-definition").ParamDefinition.NamedParams<import("../mol-util/param-definition").ParamDefinition.Normalize<{
                        eyeSeparation: any;
                        focus: any;
                    }>, "on">;
                    fov: number;
                    manualReset: boolean;
                }>>;
                cameraFog: import("../mol-util/param-definition").ParamDefinition.Mapped<import("../mol-util/param-definition").ParamDefinition.NamedParams<import("../mol-util/param-definition").ParamDefinition.Normalize<unknown>, "off"> | import("../mol-util/param-definition").ParamDefinition.NamedParams<import("../mol-util/param-definition").ParamDefinition.Normalize<{
                    intensity: number;
                }>, "on">>;
                cameraClipping: import("../mol-util/param-definition").ParamDefinition.Group<import("../mol-util/param-definition").ParamDefinition.Normalize<{
                    radius: number;
                    far: boolean;
                    minNear: number;
                }>>;
                viewport: import("../mol-util/param-definition").ParamDefinition.Mapped<import("../mol-util/param-definition").ParamDefinition.NamedParams<import("../mol-util/param-definition").ParamDefinition.Normalize<unknown>, "canvas"> | import("../mol-util/param-definition").ParamDefinition.NamedParams<import("../mol-util/param-definition").ParamDefinition.Normalize<{
                    x: number;
                    y: number;
                    width: number;
                    height: number;
                }>, "static-frame"> | import("../mol-util/param-definition").ParamDefinition.NamedParams<import("../mol-util/param-definition").ParamDefinition.Normalize<{
                    x: number;
                    y: number;
                    width: number;
                    height: number;
                }>, "relative-frame">>;
                cameraResetDurationMs: import("../mol-util/param-definition").ParamDefinition.Numeric;
                sceneRadiusFactor: import("../mol-util/param-definition").ParamDefinition.Numeric;
                transparentBackground: import("../mol-util/param-definition").ParamDefinition.BooleanParam;
                dpoitIterations: import("../mol-util/param-definition").ParamDefinition.Numeric;
                multiSample: import("../mol-util/param-definition").ParamDefinition.Group<import("../mol-util/param-definition").ParamDefinition.Normalize<{
                    mode: string;
                    sampleLevel: number;
                }>>;
                postprocessing: import("../mol-util/param-definition").ParamDefinition.Group<import("../mol-util/param-definition").ParamDefinition.Normalize<{
                    occlusion: import("../mol-util/param-definition").ParamDefinition.NamedParams<import("../mol-util/param-definition").ParamDefinition.Normalize<unknown>, "off"> | import("../mol-util/param-definition").ParamDefinition.NamedParams<import("../mol-util/param-definition").ParamDefinition.Normalize<{
                        samples: any;
                        multiScale: any;
                        radius: any;
                        bias: any;
                        blurKernelSize: any;
                        resolutionScale: any;
                        color: any;
                    }>, "on">;
                    shadow: import("../mol-util/param-definition").ParamDefinition.NamedParams<import("../mol-util/param-definition").ParamDefinition.Normalize<unknown>, "off"> | import("../mol-util/param-definition").ParamDefinition.NamedParams<import("../mol-util/param-definition").ParamDefinition.Normalize<{
                        steps: any;
                        bias: any;
                        maxDistance: any;
                        tolerance: any;
                    }>, "on">;
                    outline: import("../mol-util/param-definition").ParamDefinition.NamedParams<import("../mol-util/param-definition").ParamDefinition.Normalize<unknown>, "off"> | import("../mol-util/param-definition").ParamDefinition.NamedParams<import("../mol-util/param-definition").ParamDefinition.Normalize<{
                        scale: any;
                        threshold: any;
                        color: any;
                        includeTransparent: any;
                    }>, "on">;
                    antialiasing: import("../mol-util/param-definition").ParamDefinition.NamedParams<import("../mol-util/param-definition").ParamDefinition.Normalize<unknown>, "off"> | import("../mol-util/param-definition").ParamDefinition.NamedParams<import("../mol-util/param-definition").ParamDefinition.Normalize<{
                        edgeThreshold: any;
                        maxSearchSteps: any;
                    }>, "smaa"> | import("../mol-util/param-definition").ParamDefinition.NamedParams<import("../mol-util/param-definition").ParamDefinition.Normalize<{
                        edgeThresholdMin: any;
                        edgeThresholdMax: any;
                        iterations: any;
                        subpixelQuality: any;
                    }>, "fxaa">;
                    background: import("../mol-util/param-definition").ParamDefinition.Normalize<{
                        variant: any;
                    }>;
                }>>;
                marking: import("../mol-util/param-definition").ParamDefinition.Group<import("../mol-util/param-definition").ParamDefinition.Normalize<{
                    enabled: boolean;
                    highlightEdgeColor: import("../mol-util/color").Color;
                    selectEdgeColor: import("../mol-util/color").Color;
                    edgeScale: number;
                    highlightEdgeStrength: number;
                    selectEdgeStrength: number;
                    ghostEdgeStrength: number;
                    innerEdgeFactor: number;
                }>>;
                renderer: import("../mol-util/param-definition").ParamDefinition.Group<import("../mol-util/param-definition").ParamDefinition.Normalize<{
                    backgroundColor: import("../mol-util/color").Color;
                    pickingAlphaThreshold: number;
                    interiorDarkening: number;
                    interiorColorFlag: boolean;
                    interiorColor: import("../mol-util/color").Color;
                    colorMarker: boolean;
                    highlightColor: import("../mol-util/color").Color;
                    selectColor: import("../mol-util/color").Color;
                    dimColor: import("../mol-util/color").Color;
                    highlightStrength: number;
                    selectStrength: number;
                    dimStrength: number;
                    markerPriority: number;
                    xrayEdgeFalloff: number;
                    exposure: number;
                    light: import("../mol-util/param-definition").ParamDefinition.Normalize<{
                        inclination: number;
                        azimuth: number;
                        color: import("../mol-util/color").Color;
                        intensity: number;
                    }>[];
                    ambientColor: import("../mol-util/color").Color;
                    ambientIntensity: number;
                }>>;
                trackball: import("../mol-util/param-definition").ParamDefinition.Group<import("../mol-util/param-definition").ParamDefinition.Normalize<{
                    noScroll: boolean;
                    rotateSpeed: number;
                    zoomSpeed: number;
                    panSpeed: number;
                    moveSpeed: number;
                    boostMoveFactor: number;
                    flyMode: boolean;
                    animate: import("../mol-util/param-definition").ParamDefinition.NamedParams<import("../mol-util/param-definition").ParamDefinition.Normalize<unknown>, "off"> | import("../mol-util/param-definition").ParamDefinition.NamedParams<import("../mol-util/param-definition").ParamDefinition.Normalize<{
                        speed: any;
                    }>, "spin"> | import("../mol-util/param-definition").ParamDefinition.NamedParams<import("../mol-util/param-definition").ParamDefinition.Normalize<{
                        speed: any;
                        angle: any;
                    }>, "rock">;
                    staticMoving: boolean;
                    dynamicDampingFactor: number;
                    minDistance: number;
                    maxDistance: number;
                    gestureScaleFactor: number;
                    maxWheelDelta: number;
                    bindings: {
                        dragRotate: import("../mol-util/binding").Binding;
                        dragRotateZ: import("../mol-util/binding").Binding;
                        dragPan: import("../mol-util/binding").Binding;
                        dragZoom: import("../mol-util/binding").Binding;
                        dragFocus: import("../mol-util/binding").Binding;
                        dragFocusZoom: import("../mol-util/binding").Binding;
                        scrollZoom: import("../mol-util/binding").Binding;
                        scrollFocus: import("../mol-util/binding").Binding;
                        scrollFocusZoom: import("../mol-util/binding").Binding;
                        keyMoveForward: import("../mol-util/binding").Binding;
                        keyMoveBack: import("../mol-util/binding").Binding;
                        keyMoveLeft: import("../mol-util/binding").Binding;
                        keyMoveRight: import("../mol-util/binding").Binding;
                        keyMoveUp: import("../mol-util/binding").Binding;
                        keyMoveDown: import("../mol-util/binding").Binding;
                        keyRollLeft: import("../mol-util/binding").Binding;
                        keyRollRight: import("../mol-util/binding").Binding;
                        keyPitchUp: import("../mol-util/binding").Binding;
                        keyPitchDown: import("../mol-util/binding").Binding;
                        keyYawLeft: import("../mol-util/binding").Binding;
                        keyYawRight: import("../mol-util/binding").Binding;
                        boostMove: import("../mol-util/binding").Binding;
                        enablePointerLock: import("../mol-util/binding").Binding;
                    };
                    autoAdjustMinMaxDistance: import("../mol-util/param-definition").ParamDefinition.NamedParams<import("../mol-util/param-definition").ParamDefinition.Normalize<unknown>, "off"> | import("../mol-util/param-definition").ParamDefinition.NamedParams<import("../mol-util/param-definition").ParamDefinition.Normalize<{
                        minDistanceFactor: any;
                        minDistancePadding: any;
                        maxDistanceFactor: any;
                        maxDistanceMin: any;
                    }>, "on">;
                }>>;
                interaction: import("../mol-util/param-definition").ParamDefinition.Group<import("../mol-util/param-definition").ParamDefinition.Normalize<{
                    maxFps: number;
                    preferAtomPixelPadding: number;
                }>>;
                debug: import("../mol-util/param-definition").ParamDefinition.Group<import("../mol-util/param-definition").ParamDefinition.Normalize<{
                    sceneBoundingSpheres: boolean;
                    visibleSceneBoundingSpheres: boolean;
                    objectBoundingSpheres: boolean;
                    instanceBoundingSpheres: boolean;
                }>>;
                handle: import("../mol-util/param-definition").ParamDefinition.Group<import("../mol-util/param-definition").ParamDefinition.Normalize<{
                    handle: import("../mol-util/param-definition").ParamDefinition.NamedParams<import("../mol-util/param-definition").ParamDefinition.Normalize<unknown>, "off"> | import("../mol-util/param-definition").ParamDefinition.NamedParams<import("../mol-util/param-definition").ParamDefinition.Normalize<{
                        alpha: any;
                        ignoreLight: any;
                        colorX: any;
                        colorY: any;
                        colorZ: any;
                        scale: any;
                        doubleSided: any;
                        flipSided: any;
                        flatShaded: any;
                        xrayShaded: any;
                        transparentBackfaces: any;
                        bumpFrequency: any;
                        bumpAmplitude: any;
                        quality: any;
                        material: any;
                        clip: any;
                        instanceGranularity: any;
                    }>, "on">;
                }>>;
            }>> | ((old: Canvas3DProps) => Partial<Canvas3DProps> | void);
        }>;
        ResetSettings: PluginCommand<{}>;
    };
};
