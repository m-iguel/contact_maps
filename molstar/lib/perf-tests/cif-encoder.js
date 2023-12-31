/**
 * Copyright (c) 2017 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { CifWriter } from '../mol-io/writer/cif';
import * as fs from 'fs';
var category1fields = [
    CifWriter.Field.str('f1', function (i) { return 'v' + i; }),
    CifWriter.Field.int('f2', function (i) { return i * i; }),
    CifWriter.Field.float('f3', function (i) { return Math.random(); }),
];
var category2fields = [
    CifWriter.Field.str('e1', function (i) { return 'v\n' + i; }),
    CifWriter.Field.int('e2', function (i) { return i * i; }),
    CifWriter.Field.float('e3', function (i) { return Math.random(); }),
];
function getCat(name) {
    return {
        name: name,
        instance: function (ctx) {
            return { fields: ctx.fields, source: [{ rowCount: ctx.rowCount }] };
        }
    };
}
function testText() {
    var enc = CifWriter.createEncoder();
    var filter = {
        includeCategory: function (cat) { return true; },
        includeField: function (cat, field) { return !(cat === 'cat2' && field === 'e2'); }
    };
    enc.startDataBlock('test');
    enc.setFilter(filter);
    enc.writeCategory(getCat('cat1'), [{ rowCount: 5, fields: category1fields }]);
    enc.writeCategory(getCat('cat2'), [{ rowCount: 1, fields: category2fields }]);
    console.log(enc.getData());
}
testText();
function testBinary() {
    var enc = CifWriter.createEncoder({ binary: true });
    var filter = {
        includeCategory: function (cat) { return true; },
        includeField: function (cat, field) { return !(cat === 'cat2' && field === 'e2'); }
    };
    enc.startDataBlock('test');
    enc.setFilter(filter);
    enc.writeCategory(getCat('cat1'), [{ rowCount: 5, fields: category1fields }]);
    enc.writeCategory(getCat('cat2'), [{ rowCount: 1, fields: category2fields }]);
    enc.encode();
    var data = enc.getData();
    fs.writeFileSync('e:/test/mol-star/test.bcif', Buffer.from(data));
    console.log('written binary');
}
testBinary();
