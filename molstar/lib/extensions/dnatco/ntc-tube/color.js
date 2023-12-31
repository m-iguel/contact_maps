/**
 * Copyright (c) 2018-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Michal Malý <michal.maly@ibt.cas.cz>
 * @author Jiří Černý <jiri.cerny@ibt.cas.cz>
 */
import { __assign } from "tslib";
import { ErrorColor, NtCColors } from '../color';
import { NtCTubeProvider } from './property';
import { NtCTubeTypes as NTT } from './types';
import { Dnatco } from '../property';
import { ColorTheme } from '../../../mol-theme/color';
import { Color, ColorMap } from '../../../mol-util/color';
import { getColorMapParams } from '../../../mol-util/color/params';
import { ParamDefinition as PD } from '../../../mol-util/param-definition';
import { TableLegend } from '../../../mol-util/legend';
import { ObjectKeys } from '../../../mol-util/type-helpers';
var Description = 'Assigns colors to NtC Tube segments';
var NtCTubeColors = ColorMap(__assign(__assign({}, NtCColors), { residueMarker: Color(0x222222), stepBoundaryMarker: Color(0x656565) }));
export var NtCTubeColorThemeParams = {
    colors: PD.MappedStatic('default', {
        'default': PD.EmptyGroup(),
        'custom': PD.Group(getColorMapParams(NtCTubeColors)),
        'uniform': PD.Color(Color(0xEEEEEE)),
    }),
    markResidueBoundaries: PD.Boolean(true),
    markSegmentBoundaries: PD.Boolean(true),
};
export function getNtCTubeColorThemeParams(ctx) {
    return PD.clone(NtCTubeColorThemeParams);
}
export function NtCTubeColorTheme(ctx, props) {
    var colorMap = props.colors.name === 'default'
        ? NtCTubeColors
        : props.colors.name === 'custom'
            ? props.colors.params
            : ColorMap(__assign(__assign({}, Object.fromEntries(ObjectKeys(NtCTubeColors).map(function (item) { return [item, props.colors.params]; }))), { residueMarker: NtCTubeColors.residueMarker, stepBoundaryMarker: NtCTubeColors.stepBoundaryMarker }));
    function color(location, isSecondary) {
        var _a;
        if (NTT.isLocation(location)) {
            var data = location.data;
            var step = data.step, kind = data.kind;
            var key = void 0;
            if (kind === 'upper')
                key = step.NtC + '_Upr';
            else if (kind === 'lower')
                key = step.NtC + '_Lwr';
            else if (kind === 'residue-boundary')
                key = (!props.markResidueBoundaries ? step.NtC + '_Lwr' : 'residueMarker');
            else /* segment-boundary */
                key = (!props.markSegmentBoundaries ? step.NtC + '_Lwr' : 'stepBoundaryMarker');
            return (_a = colorMap[key]) !== null && _a !== void 0 ? _a : ErrorColor;
        }
        return ErrorColor;
    }
    return {
        factory: NtCTubeColorTheme,
        granularity: 'group',
        color: color,
        props: props,
        description: Description,
        legend: TableLegend(ObjectKeys(colorMap).map(function (k) { return [k.replace('_', ' '), colorMap[k]]; }).concat([['Error', ErrorColor]])),
    };
}
export var NtCTubeColorThemeProvider = {
    name: 'ntc-tube',
    label: 'NtC Tube',
    category: ColorTheme.Category.Residue,
    factory: NtCTubeColorTheme,
    getParams: getNtCTubeColorThemeParams,
    defaultValues: PD.getDefaultValues(NtCTubeColorThemeParams),
    isApplicable: function (ctx) { return !!ctx.structure && ctx.structure.models.some(function (m) { return Dnatco.isApplicable(m); }); },
    ensureCustomProperties: {
        attach: function (ctx, data) { return data.structure ? NtCTubeProvider.attach(ctx, data.structure.models[0], void 0, true) : Promise.resolve(); },
        detach: function (data) { return data.structure && NtCTubeProvider.ref(data.structure.models[0], false); }
    }
};
