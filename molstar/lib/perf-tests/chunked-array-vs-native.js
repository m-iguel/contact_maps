import * as B from 'benchmark';
import { ChunkedArray } from '../mol-data/util';
function testNative(size) {
    var xs = new Array(size);
    for (var i = 0; i < size; i++)
        xs[i] = i * i;
    return xs;
}
function testChunkedTyped(size, chunk) {
    var xs = ChunkedArray.create(Int32Array, 1, chunk);
    for (var i = 0; i < size; i++)
        ChunkedArray.add(xs, i * i);
    return ChunkedArray.compact(xs);
}
function testChunkedNative(size, chunk) {
    var xs = ChunkedArray.create(Array, 1, chunk);
    for (var i = 0; i < size; i++)
        ChunkedArray.add(xs, i * i);
    return ChunkedArray.compact(xs);
}
var suite = new B.Suite();
var N = 70000;
suite
    .add('native', function () { return testNative(N); })
    // .add('chunkedT 0.1k', () => testChunkedTyped(N, 100, false))
    // .add('chunkedT 4k', () => testChunkedTyped(N, 4096, false))
    .add('chunkedT 4k lin', function () { return testChunkedTyped(N, 4096); })
    // .add('chunkedT N / 2', () => testChunkedTyped(N, N / 2, false))
    // .add('chunkedT N', () => testChunkedTyped(N, N, false))
    // .add('chunkedT 2 * N', () => testChunkedTyped(N, 2 * N, false))
    .add('chunkedN N', function () { return testChunkedNative(N, N); })
    .add('chunkedN 0.1k', function () { return testChunkedNative(N, 100); })
    .add('chunkedN N / 2', function () { return testChunkedNative(N, N / 2); })
    .add('chunkedN 2 * N', function () { return testChunkedNative(N, 2 * N); })
    .on('cycle', function (e) {
    console.log(String(e.target));
})
    .run();
// console.log(testChunkedTyped(10, 16));
