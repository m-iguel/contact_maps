import { __awaiter, __generator } from "tslib";
import * as Data from '../../reader/cif/data-model';
import { CifWriter } from '../cif';
import { decodeMsgPack } from '../../common/msgpack/decode';
import { Field } from '../../reader/cif/binary/field';
import { TextEncoder } from '../cif/encoder/text';
import * as C from '../cif/encoder';
import { Column, Database, Table } from '../../../mol-data/db';
import { parseCifText } from '../../reader/cif/text/parser';
var cartn_x = Data.CifField.ofNumbers([1.001, 1.002, 1.003, 1.004, 1.005, 1.006, 1.007, 1.008, 1.009]);
var cartn_y = Data.CifField.ofNumbers([-3.0, -2.666, -2.3333, -2.0, -1.666, -1.333, -1.0, -0.666, -0.333]);
var cartn_z = Data.CifField.ofNumbers([1, 2, 3, 4, 5, 6, 7, 8, 9].map(function (i) { return Math.sqrt(i); }));
var label_seq_id = Data.CifField.ofNumbers([1, 2, 3, 6, 11, 23, 47, 106, 235]);
var atom_site = Data.CifCategory.ofFields('atom_site', { 'Cartn_x': cartn_x, 'Cartn_y': cartn_y, 'Cartn_z': cartn_z, 'label_seq_id': label_seq_id });
var field1 = Data.CifField.ofNumbers([1, 2, 3, 6, 11, 23, 47, 106, 235]);
var field2 = Data.CifField.ofNumbers([-1, -2, -3, -6, -11, -23, -47, -106, -235]);
var other_fields = Data.CifCategory.ofFields('other_fields', { 'field1': field1, 'field2': field2 });
var encoding_aware_encoder = CifWriter.createEncoder({
    binary: true,
    binaryAutoClassifyEncoding: true,
    binaryEncodingPovider: CifWriter.createEncodingProviderFromJsonConfig([
        {
            'categoryName': 'atom_site',
            'columnName': 'Cartn_y',
            'encoding': 'rle',
            'precision': 0
        },
        {
            'categoryName': 'atom_site',
            'columnName': 'Cartn_z',
            'encoding': 'delta',
            'precision': 1
        },
        {
            'categoryName': 'atom_site',
            'columnName': 'label_seq_id',
            'encoding': 'delta-rle'
        }
    ])
});
test('cif writer value escaping', function () { return __awaiter(void 0, void 0, void 0, function () {
    var values, table, encoder, data, result, cat, parsed, i;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                values = ['1', ' ', '  ', " ' ", "a'", "b\"", "\"", '  a  ', "\"'\"", "'\"", "\na"];
                table = Table.ofArrays({ values: Column.Schema.str }, { values: values });
                encoder = new TextEncoder();
                C.Encoder.writeDatabase(encoder, 'test', Database.ofTables('test', { test: table._schema }, { test: table }));
                encoder.encode();
                data = encoder.getData();
                return [4 /*yield*/, parseCifText(data).run()];
            case 1:
                result = _b.sent();
                if (result.isError) {
                    expect(false).toBe(true);
                    return [2 /*return*/];
                }
                cat = result.result.blocks[0].categories['test'];
                parsed = (_a = cat.getField('values')) === null || _a === void 0 ? void 0 : _a.toStringArray();
                expect(values.length).toBe(parsed === null || parsed === void 0 ? void 0 : parsed.length);
                for (i = 0; i < values.length; i++) {
                    expect(values[i]).toBe(parsed === null || parsed === void 0 ? void 0 : parsed[i]);
                }
                return [2 /*return*/];
        }
    });
}); });
describe('encoding-config', function () {
    var decoded = process(encoding_aware_encoder);
    var decoded_atom_site = decoded.blocks[0].categories['atom_site'];
    var decoded_cartn_x = decoded_atom_site.getField('Cartn_x');
    var decoded_cartn_y = decoded_atom_site.getField('Cartn_y');
    var decoded_cartn_z = decoded_atom_site.getField('Cartn_z');
    var decoded_label_seq_id = decoded_atom_site.getField('label_seq_id');
    var delta = 0.001;
    function assert(e, a) {
        expect(e.length).toBe(a.length);
        for (var i = 0; i < e.length; i++) {
            expect(Math.abs(e[i] - a[i])).toBeLessThan(delta);
        }
    }
    function join(field) {
        return field.binaryEncoding.map(function (e) { return e.kind; }).join();
    }
    it('strategy', function () {
        expect(join(decoded_cartn_x)).toBe('FixedPoint,Delta,IntegerPacking,ByteArray');
        expect(join(decoded_cartn_y)).toBe('FixedPoint,RunLength,IntegerPacking,ByteArray');
        expect(join(decoded_cartn_z)).toBe('FixedPoint,Delta,IntegerPacking,ByteArray');
        expect(join(decoded_label_seq_id)).toBe('Delta,RunLength,IntegerPacking,ByteArray');
    });
    it('precision', function () {
        assert(decoded_cartn_x.toFloatArray(), cartn_x.toFloatArray());
        assert(decoded_cartn_y.toFloatArray(), cartn_y.toFloatArray().map(function (d) { return Math.round(d); }));
        assert(decoded_cartn_z.toFloatArray(), cartn_z.toFloatArray().map(function (d) { return Math.round(d * 10) / 10; }));
        assert(decoded_label_seq_id.toIntArray(), label_seq_id.toIntArray());
    });
});
var filter_aware_encoder1 = CifWriter.createEncoder({
    binary: true,
    binaryAutoClassifyEncoding: true
});
filter_aware_encoder1.setFilter(C.Category.filterOf('atom_site\n' +
    '\n' +
    'atom_site.Cartn_x\n' +
    'atom_site.Cartn_y\n'));
var filter_aware_encoder2 = CifWriter.createEncoder({
    binary: true
});
filter_aware_encoder2.setFilter(C.Category.filterOf('!atom_site\n' +
    '\n' +
    '!other_fields.field2\n'));
describe('filtering-config', function () {
    var decoded1 = process(filter_aware_encoder1);
    var atom_site1 = decoded1.blocks[0].categories['atom_site'];
    var cartn_x1 = atom_site1.getField('Cartn_x');
    var cartn_y1 = atom_site1.getField('Cartn_y');
    var cartn_z1 = atom_site1.getField('Cartn_z');
    var label_seq_id1 = atom_site1.getField('label_seq_id');
    var fields1 = decoded1.blocks[0].categories['other_fields'];
    it('whitelist-filtering', function () {
        expect(atom_site1).toBeDefined();
        expect(cartn_x1).toBeDefined();
        expect(cartn_y1).toBeDefined();
        expect(cartn_z1).toBeUndefined();
        expect(label_seq_id1).toBeUndefined();
        expect(fields1).toBeUndefined();
    });
    var decoded2 = process(filter_aware_encoder2);
    var atom_site2 = decoded2.blocks[0].categories['atom_site'];
    var fields2 = decoded2.blocks[0].categories['other_fields'];
    var field12 = fields2.getField('field1');
    var field22 = fields2.getField('field2');
    it('blacklist-filtering', function () {
        expect(atom_site2).toBeUndefined();
        expect(fields2).toBeDefined();
        expect(field12).toBeDefined();
        expect(field22).toBeUndefined();
    });
});
function process(encoder) {
    encoder.startDataBlock('test');
    for (var _i = 0, _a = [atom_site, other_fields]; _i < _a.length; _i++) {
        var cat = _a[_i];
        var fields = [];
        for (var _b = 0, _c = cat.fieldNames; _b < _c.length; _b++) {
            var f = _c[_b];
            fields.push(wrap(f, cat.getField(f)));
        }
        encoder.writeCategory(getCategoryInstanceProvider(cat, fields));
    }
    var encoded = encoder.getData();
    var unpacked = decodeMsgPack(encoded);
    return Data.CifFile(unpacked.dataBlocks.map(function (block) {
        var cats = Object.create(null);
        for (var _i = 0, _a = block.categories; _i < _a.length; _i++) {
            var cat = _a[_i];
            cats[cat.name.substr(1)] = Category(cat);
        }
        return Data.CifBlock(block.categories.map(function (c) { return c.name.substr(1); }), cats, block.header);
    }));
}
function getCategoryInstanceProvider(cat, fields) {
    return {
        name: cat.name,
        instance: function () { return CifWriter.categoryInstance(fields, { data: cat, rowCount: cat.rowCount }); }
    };
}
function wrap(name, field) {
    var type = Data.getCifFieldType(field);
    if (type['@type'] === 'str') {
        return { name: name, type: 0 /* CifWriter.Field.Type.Str */, value: field.str, valueKind: field.valueKind };
    }
    else if (type['@type'] === 'float') {
        return { name: name, type: 2 /* CifWriter.Field.Type.Float */, value: field.float, valueKind: field.valueKind };
    }
    else {
        return { name: name, type: 1 /* CifWriter.Field.Type.Int */, value: field.int, valueKind: field.valueKind };
    }
}
function Category(data) {
    var map = Object.create(null);
    var cache = Object.create(null);
    for (var _i = 0, _a = data.columns; _i < _a.length; _i++) {
        var col = _a[_i];
        map[col.name] = col;
    }
    return {
        rowCount: data.rowCount,
        name: data.name.substr(1),
        fieldNames: data.columns.map(function (c) { return c.name; }),
        getField: function (name) {
            var col = map[name];
            if (!col)
                return void 0;
            if (!!cache[name])
                return cache[name];
            cache[name] = Field(col);
            return cache[name];
        }
    };
}
