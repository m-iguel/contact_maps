/**
 * Copyright (c) 2018-2021 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { List } from 'immutable';
import * as React from 'react';
import { LogEntry } from '../mol-util/log-entry';
import { PluginUIComponent } from './base';
import { PluginUIContext } from './context';
export declare class Plugin extends React.Component<{
    plugin: PluginUIContext;
    children?: any;
}, {}> {
    render(): import("react/jsx-runtime").JSX.Element;
}
export declare class PluginContextContainer extends React.Component<{
    plugin: PluginUIContext;
    children?: any;
}> {
    render(): import("react/jsx-runtime").JSX.Element;
}
export declare class ControlsWrapper extends PluginUIComponent {
    render(): import("react/jsx-runtime").JSX.Element;
}
export declare class DefaultViewport extends PluginUIComponent {
    render(): import("react/jsx-runtime").JSX.Element;
}
export declare class Log extends PluginUIComponent<{}, {
    entries: List<LogEntry>;
}> {
    private wrapper;
    componentDidMount(): void;
    componentDidUpdate(): void;
    state: {
        entries: List<LogEntry>;
    };
    private scrollToBottom;
    render(): import("react/jsx-runtime").JSX.Element;
}
