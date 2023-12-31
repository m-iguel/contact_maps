/**
 * Copyright (c) 2017-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
function SecondaryStructure(type, key, elements, getIndex) {
    return { type: type, key: key, elements: elements, getIndex: getIndex };
}
export { SecondaryStructure };
