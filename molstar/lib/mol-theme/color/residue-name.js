/**
 * Copyright (c) 2018-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { Color, ColorMap } from '../../mol-util/color';
import { StructureElement, Unit, Bond } from '../../mol-model/structure';
import { ParamDefinition as PD } from '../../mol-util/param-definition';
import { TableLegend } from '../../mol-util/legend';
import { getAdjustedColorMap } from '../../mol-util/color/color';
import { getColorMapParams } from '../../mol-util/color/params';
import { ColorThemeCategory } from './categories';
// protein colors from Jmol http://jmol.sourceforge.net/jscolors/
export var ResidueNameColors = ColorMap({
    // standard amino acids
    'ALA': 0x8CFF8C,
    'ARG': 0x00007C,
    'ASN': 0xFF7C70,
    'ASP': 0xA00042,
    'CYS': 0xFFFF70,
    'GLN': 0xFF4C4C,
    'GLU': 0x660000,
    'GLY': 0xEEEEEE,
    'HIS': 0x7070FF,
    'ILE': 0x004C00,
    'LEU': 0x455E45,
    'LYS': 0x4747B8,
    'MET': 0xB8A042,
    'PHE': 0x534C52,
    'PRO': 0x525252,
    'SER': 0xFF7042,
    'THR': 0xB84C00,
    'TRP': 0x4F4600,
    'TYR': 0x8C704C,
    'VAL': 0xFF8CFF,
    // rna bases
    'A': 0xDC143C,
    'G': 0x32CD32,
    'I': 0x9ACD32,
    'C': 0xFFD700,
    'T': 0x4169E1,
    'U': 0x40E0D0,
    // dna bases
    'DA': 0xDC143C,
    'DG': 0x32CD32,
    'DI': 0x9ACD32,
    'DC': 0xFFD700,
    'DT': 0x4169E1,
    'DU': 0x40E0D0,
    // peptide bases
    'APN': 0xDC143C,
    'GPN': 0x32CD32,
    'CPN': 0xFFD700,
    'TPN': 0x4169E1,
});
var DefaultResidueNameColor = Color(0xFF00FF);
var Description = 'Assigns a color to every residue according to its name.';
export var ResidueNameColorThemeParams = {
    saturation: PD.Numeric(0, { min: -6, max: 6, step: 0.1 }),
    lightness: PD.Numeric(1, { min: -6, max: 6, step: 0.1 }),
    colors: PD.MappedStatic('default', {
        'default': PD.EmptyGroup(),
        'custom': PD.Group(getColorMapParams(ResidueNameColors))
    })
};
export function getResidueNameColorThemeParams(ctx) {
    return ResidueNameColorThemeParams; // TODO return copy
}
function getAtomicCompId(unit, element) {
    return unit.model.atomicHierarchy.atoms.label_comp_id.value(element);
}
function getCoarseCompId(unit, element) {
    var seqIdBegin = unit.coarseElements.seq_id_begin.value(element);
    var seqIdEnd = unit.coarseElements.seq_id_end.value(element);
    if (seqIdBegin === seqIdEnd) {
        var entityKey = unit.coarseElements.entityKey[element];
        var seq = unit.model.sequence.byEntityKey[entityKey].sequence;
        return seq.compId.value(seqIdBegin - 1); // 1-indexed
    }
}
export function residueNameColor(colorMap, residueName) {
    var c = colorMap[residueName];
    return c === undefined ? DefaultResidueNameColor : c;
}
export function ResidueNameColorTheme(ctx, props) {
    var colorMap = getAdjustedColorMap(props.colors.name === 'default' ? ResidueNameColors : props.colors.params, props.saturation, props.lightness);
    function color(location) {
        if (StructureElement.Location.is(location)) {
            if (Unit.isAtomic(location.unit)) {
                var compId = getAtomicCompId(location.unit, location.element);
                return residueNameColor(colorMap, compId);
            }
            else {
                var compId = getCoarseCompId(location.unit, location.element);
                if (compId)
                    return residueNameColor(colorMap, compId);
            }
        }
        else if (Bond.isLocation(location)) {
            if (Unit.isAtomic(location.aUnit)) {
                var compId = getAtomicCompId(location.aUnit, location.aUnit.elements[location.aIndex]);
                return residueNameColor(colorMap, compId);
            }
            else {
                var compId = getCoarseCompId(location.aUnit, location.aUnit.elements[location.aIndex]);
                if (compId)
                    return residueNameColor(colorMap, compId);
            }
        }
        return DefaultResidueNameColor;
    }
    return {
        factory: ResidueNameColorTheme,
        granularity: 'group',
        preferSmoothing: true,
        color: color,
        props: props,
        description: Description,
        legend: TableLegend(Object.keys(colorMap).map(function (name) {
            return [name, colorMap[name]];
        }).concat([['Unknown', DefaultResidueNameColor]]))
    };
}
export var ResidueNameColorThemeProvider = {
    name: 'residue-name',
    label: 'Residue Name',
    category: ColorThemeCategory.Residue,
    factory: ResidueNameColorTheme,
    getParams: getResidueNameColorThemeParams,
    defaultValues: PD.getDefaultValues(ResidueNameColorThemeParams),
    isApplicable: function (ctx) { return !!ctx.structure; }
};
