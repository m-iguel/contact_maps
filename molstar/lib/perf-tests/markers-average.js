import * as B from 'benchmark';
function uint8ForLoop(array, count) {
    if (count === 0)
        return 0;
    var sum = 0;
    for (var i = 0; i < count; ++i) {
        sum += array[i] && 1;
    }
    return sum / count;
}
function uint32ForLoop(array, count) {
    if (count === 0)
        return 0;
    var view = new Uint32Array(array.buffer, 0, array.buffer.byteLength >> 2);
    var viewEnd = (count - 4) >> 2;
    var backStart = 4 * viewEnd;
    var sum = 0;
    for (var i = 0; i < viewEnd; ++i) {
        var v = view[i];
        sum += ((v & 0xFF) && 1) + ((v & 0xFF00) && 1) + ((v & 0xFF0000) && 1) + ((v & 0xFF000000) && 1);
    }
    for (var i = backStart; i < count; ++i) {
        sum += array[i] && 1;
    }
    return sum / count;
}
function uint32ForLoopAddOnlyBaseline(array, count) {
    if (count === 0)
        return 0;
    var view = new Uint32Array(array.buffer, 0, array.buffer.byteLength >> 2);
    var viewEnd = (count - 4) >> 2;
    var backStart = 4 * viewEnd;
    var sum = 0;
    for (var i = 0; i < viewEnd; ++i) {
        var v = view[i];
        sum += v;
    }
    for (var i = backStart; i < count; ++i) {
        sum += array[i] && 1;
    }
    return sum / count;
}
function createTypedLut() {
    var lut = new Uint8Array(0x0303 + 1);
    lut[0x0001] = 1;
    lut[0x0002] = 1;
    lut[0x0003] = 1;
    lut[0x0100] = 1;
    lut[0x0200] = 1;
    lut[0x0300] = 1;
    lut[0x0101] = 2;
    lut[0x0201] = 2;
    lut[0x0301] = 2;
    lut[0x0102] = 2;
    lut[0x0202] = 2;
    lut[0x0302] = 2;
    lut[0x0103] = 2;
    lut[0x0203] = 2;
    lut[0x0303] = 2;
    return lut;
}
function createNativeLut() {
    var lut = [];
    for (var i = 0, il = 0x0303 + 1; i < il; ++i)
        lut[i] = 0;
    lut[0x0000] = 0;
    lut[0x0001] = 1;
    lut[0x0002] = 1;
    lut[0x0003] = 1;
    lut[0x0100] = 1;
    lut[0x0200] = 1;
    lut[0x0300] = 1;
    lut[0x0101] = 2;
    lut[0x0201] = 2;
    lut[0x0301] = 2;
    lut[0x0102] = 2;
    lut[0x0202] = 2;
    lut[0x0302] = 2;
    lut[0x0103] = 2;
    lut[0x0203] = 2;
    lut[0x0303] = 2;
    return lut;
}
function createTypedLut2bits() {
    var lut = new Uint8Array(256);
    for (var a = 0; a < 4; ++a) {
        for (var b = 0; b < 4; ++b) {
            for (var c = 0; c < 4; ++c) {
                for (var d = 0; d < 4; ++d) {
                    var i = d | c << 2 | b << 4 | a << 6;
                    var v = (a && 1) + (b && 1) + (c && 1) + (d && 1);
                    lut[i] = v;
                    // console.log([a, b, c, d], i, v);
                }
            }
        }
    }
    return lut;
}
var lutNative = createNativeLut();
var lutTyped = createTypedLut();
var lutTyped2bits = createTypedLut2bits();
function uint32ForLoopWithLutNative(array, count) {
    if (count === 0)
        return 0;
    var view = new Uint32Array(array.buffer, 0, array.buffer.byteLength >> 2);
    var viewEnd = (count - 4) >> 2;
    var backStart = 4 * viewEnd;
    var sum = 0;
    for (var i = 0; i < viewEnd; ++i) {
        var v = view[i];
        sum += lutNative[v & 0xFFFF] + lutNative[v >> 16];
    }
    for (var i = backStart; i < count; ++i) {
        sum += array[i] && 1;
    }
    return sum / count;
}
function uint32ForLoopWithLutTyped(array, count) {
    if (count === 0)
        return 0;
    var view = new Uint32Array(array.buffer, 0, array.buffer.byteLength >> 2);
    var viewEnd = (count - 4) >> 2;
    var backStart = 4 * viewEnd;
    var sum = 0;
    for (var i = 0; i < viewEnd; ++i) {
        var v = view[i];
        sum += lutTyped[v & 0xFFFF] + lutTyped[v >> 16];
    }
    for (var i = backStart; i < count; ++i) {
        sum += array[i] && 1;
    }
    return sum / count;
}
function uint32ForLoopWithLut2bits(array, count) {
    if (count === 0)
        return 0;
    var view = new Uint32Array(array.buffer, 0, array.buffer.byteLength >> 2);
    var viewEnd = (count - 4) >> 2;
    var backStart = 4 * viewEnd;
    var sum = 0;
    for (var i = 0; i < viewEnd; ++i) {
        var v = view[i];
        sum += lutTyped2bits[(v >> 18 | v >> 12 | v >> 6 | v) & 0xFF];
    }
    for (var i = backStart; i < count; ++i) {
        sum += array[i] && 1;
    }
    return sum / count;
}
function createData(elements, instances) {
    var data = new Uint8Array(4000 * 5000);
    var start = Math.floor(instances / 2);
    data.fill(1, start, start + elements);
    return data;
}
;
export function run(elements, instances) {
    var suite = new B.Suite();
    var count = elements * instances;
    var data = createData(elements, instances);
    console.log('uint8ForLoop', uint8ForLoop(data, count));
    console.log('uint32ForLoop', uint32ForLoop(data, count));
    console.log('uint32ForLoopWithLutNative', uint32ForLoopWithLutNative(data, count));
    console.log('uint32ForLoopWithLutTyped', uint32ForLoopWithLutTyped(data, count));
    console.log('uint32ForLoopWithLut2bits', uint32ForLoopWithLut2bits(data, count));
    suite
        .add('uint8ForLoop', function () { return uint8ForLoop(data, count); })
        .add('uint32ForLoop', function () { return uint32ForLoop(data, count); })
        .add('uint32ForLoopAddOnlyBaseline', function () { return uint32ForLoopAddOnlyBaseline(data, count); })
        .add('uint32ForLoopWithLutNative', function () { return uint32ForLoopWithLutNative(data, count); })
        .add('uint32ForLoopWithLutTyped', function () { return uint32ForLoopWithLutTyped(data, count); })
        .add('uint32ForLoopWithLut2bits', function () { return uint32ForLoopWithLut2bits(data, count); })
        .on('cycle', function (e) { return console.log(String(e.target)); })
        .run();
}
// console.log(createTypedLut2bits());
// run(5000, 4000);
// uint8ForLoop 0.00025
// uint32ForLoop 0.00025
// uint32ForLoopWithLutNative 0.00025
// uint32ForLoopWithLutTyped 0.00025
// uint32ForLoopWithLut2bits 0.00025
// uint8ForLoop x 49.84 ops/sec ±3.30% (64 runs sampled)
// uint32ForLoop x 97.70 ops/sec ±1.71% (71 runs sampled)
// uint32ForLoopAddOnlyBaseline x 220 ops/sec ±2.49% (85 runs sampled)
// uint32ForLoopWithLutNative x 135 ops/sec ±1.71% (76 runs sampled)
// uint32ForLoopWithLutTyped x 137 ops/sec ±1.69% (77 runs sampled)
// uint32ForLoopWithLut2bits x 111 ops/sec ±2.73% (70 runs sampled)
