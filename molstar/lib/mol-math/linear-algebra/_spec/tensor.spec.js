/**
 * Copyright (c) 2017 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { Tensor as T } from '../tensor';
import { Mat4 } from '../3d/mat4';
describe('tensor', function () {
    it('vector', function () {
        var V = T.Vector(3);
        var data = V.create();
        V.set(data, 0, 1);
        V.set(data, 1, 2);
        V.set(data, 2, 3);
        expect(data).toEqual(new Float64Array([1, 2, 3]));
        expect(V.get(data, 0)).toEqual(1);
        expect(V.get(data, 1)).toEqual(2);
        expect(V.get(data, 2)).toEqual(3);
    });
    it('matrix cm', function () {
        var M = T.ColumnMajorMatrix(3, 2, Int32Array);
        var data = M.create();
        // rows: [ [0, 1], [1, 2], [2, 3]  ]
        for (var i = 0; i < 3; i++) {
            for (var j = 0; j < 2; j++) {
                M.set(data, i, j, i + j);
            }
        }
        expect(data).toEqual(new Int32Array([0, 1, 2, 1, 2, 3]));
    });
    it('matrix rm', function () {
        var M = T.RowMajorMatrix(3, 2, Int32Array);
        var data = M.create();
        // rows: [ [0, 1], [1, 2], [2, 3]  ]
        for (var i = 0; i < 3; i++) {
            for (var j = 0; j < 2; j++) {
                M.set(data, i, j, i + j);
            }
        }
        expect(data).toEqual(new Int32Array([0, 1, 1, 2, 2, 3]));
    });
    it('mat4 equiv', function () {
        var M = T.ColumnMajorMatrix(4, 4);
        var data = M.create();
        var m = Mat4();
        for (var i = 0; i < 4; i++) {
            for (var j = 0; j < 4; j++) {
                var v = (i + 1) * (j + 2);
                M.set(data, i, j, v);
                Mat4.setValue(m, i, j, v);
            }
        }
        for (var i = 0; i < 16; i++)
            expect(data[i]).toEqual(m[i]);
    });
    it('2d ij', function () {
        var M = T.Space([3, 4], [0, 1]);
        var data = M.create();
        var exp = new Float64Array(3 * 4);
        var o = 0;
        for (var i = 0; i < 3; i++) {
            for (var j = 0; j < 4; j++) {
                M.set(data, i, j, o);
                expect(M.get(data, i, j)).toBe(o);
                exp[o] = o;
                o++;
            }
        }
        expect(data).toEqual(exp);
    });
    it('2d ji', function () {
        var M = T.Space([3, 4], [1, 0]);
        var data = M.create();
        var exp = new Float64Array(3 * 4);
        var o = 0;
        for (var j = 0; j < 4; j++) {
            for (var i = 0; i < 3; i++) {
                M.set(data, i, j, o);
                expect(M.get(data, i, j)).toBe(o);
                exp[o] = o;
                o++;
            }
        }
        expect(data).toEqual(exp);
    });
    it('3d ijk', function () {
        var M = T.Space([3, 4, 5], [0, 1, 2]);
        var data = M.create();
        var exp = new Float64Array(3 * 4 * 5);
        var o = 0;
        for (var i = 0; i < 3; i++) {
            for (var j = 0; j < 4; j++) {
                for (var k = 0; k < 5; k++) {
                    M.set(data, i, j, k, o);
                    expect(M.get(data, i, j, k)).toBe(o);
                    exp[o] = o;
                    o++;
                }
            }
        }
        expect(data).toEqual(exp);
    });
    it('3d ikj', function () {
        var M = T.Space([3, 3, 3], [0, 2, 1]);
        var data = M.create();
        var exp = new Float64Array(3 * 3 * 3);
        var o = 0;
        for (var i = 0; i < 3; i++) {
            for (var k = 0; k < 3; k++) {
                for (var j = 0; j < 3; j++) {
                    M.set(data, i, j, k, o);
                    expect(M.get(data, i, j, k)).toBe(o);
                    exp[o] = o;
                    o++;
                }
            }
        }
        expect(data).toEqual(exp);
    });
    it('3d jik', function () {
        var M = T.Space([3, 3, 3], [1, 0, 2]);
        var data = M.create();
        var exp = new Float64Array(3 * 3 * 3);
        var o = 0;
        for (var j = 0; j < 3; j++) {
            for (var i = 0; i < 3; i++) {
                for (var k = 0; k < 3; k++) {
                    M.set(data, i, j, k, o);
                    expect(M.get(data, i, j, k)).toBe(o);
                    exp[o] = o;
                    o++;
                }
            }
        }
        expect(data).toEqual(exp);
    });
    it('3d jki', function () {
        var M = T.Space([3, 3, 3], [1, 2, 0]);
        var data = M.create();
        var exp = new Float64Array(3 * 3 * 3);
        var o = 0;
        for (var j = 0; j < 3; j++) {
            for (var k = 0; k < 3; k++) {
                for (var i = 0; i < 3; i++) {
                    M.set(data, i, j, k, o);
                    expect(M.get(data, i, j, k)).toBe(o);
                    exp[o] = o;
                    o++;
                }
            }
        }
        expect(data).toEqual(exp);
    });
    it('3d kij', function () {
        var M = T.Space([3, 3, 3], [2, 0, 1]);
        var data = M.create();
        var exp = new Float64Array(3 * 3 * 3);
        var o = 0;
        for (var k = 0; k < 3; k++) {
            for (var i = 0; i < 3; i++) {
                for (var j = 0; j < 3; j++) {
                    M.set(data, i, j, k, o);
                    expect(M.get(data, i, j, k)).toBe(o);
                    exp[o] = o;
                    o++;
                }
            }
        }
        expect(data).toEqual(exp);
    });
    it('3d kji', function () {
        var M = T.Space([3, 3, 3], [2, 1, 0]);
        var data = M.create();
        var exp = new Float64Array(3 * 3 * 3);
        var o = 0;
        for (var k = 0; k < 3; k++) {
            for (var j = 0; j < 3; j++) {
                for (var i = 0; i < 3; i++) {
                    M.set(data, i, j, k, o);
                    expect(M.get(data, i, j, k)).toBe(o);
                    exp[o] = o;
                    o++;
                }
            }
        }
        expect(data).toEqual(exp);
    });
    it('4d jikl', function () {
        var M = T.Space([2, 3, 4, 5], [1, 0, 2, 3]);
        var data = M.create();
        var exp = new Float64Array(2 * 3 * 4 * 5);
        var o = 0;
        for (var j = 0; j < 3; j++) {
            for (var i = 0; i < 2; i++) {
                for (var k = 0; k < 4; k++) {
                    for (var l = 0; l < 5; l++) {
                        M.set(data, i, j, k, l, o);
                        expect(M.get(data, i, j, k, l)).toBe(o);
                        exp[o] = o;
                        o++;
                    }
                }
            }
        }
        expect(data).toEqual(exp);
    });
    it('4d jilk', function () {
        var M = T.Space([2, 3, 4, 5], [1, 0, 3, 2]);
        var data = M.create();
        var exp = new Float64Array(2 * 3 * 4 * 5);
        var o = 0;
        for (var j = 0; j < 3; j++) {
            for (var i = 0; i < 2; i++) {
                for (var l = 0; l < 5; l++) {
                    for (var k = 0; k < 4; k++) {
                        M.set(data, i, j, k, l, o);
                        expect(M.get(data, i, j, k, l)).toBe(o);
                        exp[o] = o;
                        o++;
                    }
                }
            }
        }
        expect(data).toEqual(exp);
    });
    it('indexing', function () {
        function permutations(inputArr) {
            var result = [];
            function permute(arr, m) {
                if (m === void 0) { m = []; }
                if (arr.length === 0) {
                    result.push(m);
                }
                else {
                    for (var i = 0; i < arr.length; i++) {
                        var curr = arr.slice();
                        var next = curr.splice(i, 1);
                        permute(curr.slice(), m.concat(next));
                    }
                }
            }
            permute(inputArr);
            return result;
        }
        var _loop_1 = function (dim) {
            var axes = [], dims = [];
            var u = [], v = [];
            for (var i = 0; i < dim; i++) {
                axes.push(i);
                dims.push(3);
                u.push(0);
                v.push(0);
            }
            var forEachDim = function (space, d) {
                if (d === dim) {
                    var o = space.dataOffset.apply(space, u);
                    space.getCoords(o, v);
                    for (var e = 0; e < dims.length; e++) {
                        expect(u[e]).toEqual(v[e]);
                        return false;
                    }
                }
                else {
                    for (var i = 0; i < dims[d]; i++) {
                        u[d] = i;
                        if (!forEachDim(space, d + 1))
                            return false;
                    }
                }
                return true;
            };
            for (var _i = 0, _a = permutations(axes); _i < _a.length; _i++) {
                var ao = _a[_i];
                var space = T.Space(dims, ao);
                if (!forEachDim(space, 0))
                    break;
            }
        };
        for (var dim = 1; dim <= 5; dim++) {
            _loop_1(dim);
        }
    });
});
