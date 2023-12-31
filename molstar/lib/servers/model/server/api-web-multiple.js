/**
 * Copyright (c) 2018-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
export function getMultiQuerySpecFilename() {
    var date = new Date();
    return "result_".concat(date.getMonth() + 1, "-").concat(date.getDate(), "-").concat(date.getHours(), "-").concat(date.getMinutes(), "-").concat(date.getSeconds(), ".tar.gz");
}
