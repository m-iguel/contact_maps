/**
 * Copyright (c) 2018-2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
export var AtomicNumbers = {
    'H': 1, 'D': 1, 'T': 1, 'HE': 2, 'LI': 3, 'BE': 4, 'B': 5, 'C': 6, 'N': 7, 'O': 8, 'F': 9, 'NE': 10, 'NA': 11, 'MG': 12, 'AL': 13, 'SI': 14, 'P': 15, 'S': 16, 'CL': 17, 'AR': 18, 'K': 19, 'CA': 20, 'SC': 21, 'TI': 22, 'V': 23, 'CR': 24, 'MN': 25, 'FE': 26, 'CO': 27, 'NI': 28, 'CU': 29, 'ZN': 30, 'GA': 31, 'GE': 32, 'AS': 33, 'SE': 34, 'BR': 35, 'KR': 36, 'RB': 37, 'SR': 38, 'Y': 39, 'ZR': 40, 'NB': 41, 'MO': 42, 'TC': 43, 'RU': 44, 'RH': 45, 'PD': 46, 'AG': 47, 'CD': 48, 'IN': 49, 'SN': 50, 'SB': 51, 'TE': 52, 'I': 53, 'XE': 54, 'CS': 55, 'BA': 56, 'LA': 57, 'CE': 58, 'PR': 59, 'ND': 60, 'PM': 61, 'SM': 62, 'EU': 63, 'GD': 64, 'TB': 65, 'DY': 66, 'HO': 67, 'ER': 68, 'TM': 69, 'YB': 70, 'LU': 71, 'HF': 72, 'TA': 73, 'W': 74, 'RE': 75, 'OS': 76, 'IR': 77, 'PT': 78, 'AU': 79, 'HG': 80, 'TL': 81, 'PB': 82, 'BI': 83, 'PO': 84, 'AT': 85, 'RN': 86, 'FR': 87, 'RA': 88, 'AC': 89, 'TH': 90, 'PA': 91, 'U': 92, 'NP': 93, 'PU': 94, 'AM': 95, 'CM': 96, 'BK': 97, 'CF': 98, 'ES': 99, 'FM': 100, 'MD': 101, 'NO': 102, 'LR': 103, 'RF': 104, 'DB': 105, 'SG': 106, 'BH': 107, 'HS': 108, 'MT': 109
};
// http://dx.doi.org/10.1021/jp8111556 (or 2.0)
export var ElementVdwRadii = {
    1: 1.1, 2: 1.4, 3: 1.81, 4: 1.53, 5: 1.92, 6: 1.7, 7: 1.55, 8: 1.52, 9: 1.47, 10: 1.54, 11: 2.27, 12: 1.73, 13: 1.84, 14: 2.1, 15: 1.8, 16: 1.8, 17: 1.75, 18: 1.88, 19: 2.75, 20: 2.31, 21: 2.3, 22: 2.15, 23: 2.05, 24: 2.05, 25: 2.05, 26: 2.05, 27: 2.0, 28: 2.0, 29: 2.0, 30: 2.1, 31: 1.87, 32: 2.11, 33: 1.85, 34: 1.9, 35: 1.83, 36: 2.02, 37: 3.03, 38: 2.49, 39: 2.4, 40: 2.3, 41: 2.15, 42: 2.1, 43: 2.05, 44: 2.05, 45: 2.0, 46: 2.05, 47: 2.1, 48: 2.2, 49: 2.2, 50: 1.93, 51: 2.17, 52: 2.06, 53: 1.98, 54: 2.16, 55: 3.43, 56: 2.68, 57: 2.5, 58: 2.48, 59: 2.47, 60: 2.45, 61: 2.43, 62: 2.42, 63: 2.4, 64: 2.38, 65: 2.37, 66: 2.35, 67: 2.33, 68: 2.32, 69: 2.3, 70: 2.28, 71: 2.27, 72: 2.25, 73: 2.2, 74: 2.1, 75: 2.05, 76: 2.0, 77: 2.0, 78: 2.05, 79: 2.1, 80: 2.05, 81: 1.96, 82: 2.02, 83: 2.07, 84: 1.97, 85: 2.02, 86: 2.2, 87: 3.48, 88: 2.83, 89: 2.0, 90: 2.4, 91: 2.0, 92: 2.3, 93: 2.0, 94: 2.0, 95: 2.0, 96: 2.0, 97: 2.0, 98: 2.0, 99: 2.0, 100: 2.0, 101: 2.0, 102: 2.0, 103: 2.0, 104: 2.0, 105: 2.0, 106: 2.0, 107: 2.0, 108: 2.0, 109: 2.0
};
// https://doi.org/10.1515/pac-2015-0305 (table 2, 3, and 4)
export var ElementAtomWeights = {
    1: 1.008, 2: 4.0026, 3: 6.94, 4: 9.0122, 5: 10.81, 6: 10.81, 7: 14.007, 8: 15.999, 9: 18.998, 10: 20.180, 11: 22.990, 12: 24.305, 13: 26.982, 14: 28.085, 15: 30.974, 16: 32.06, 17: 35.45, 18: 39.948, 19: 39.098, 20: 40.078, 21: 44.956, 22: 47.867, 23: 50.942, 24: 51.996, 25: 54.938, 26: 55.845, 27: 58.933, 28: 58.693, 29: 63.546, 30: 65.38, 31: 69.723, 32: 72.630, 33: 74.922, 34: 78.971, 35: 79.904, 36: 83.798, 37: 85.468, 38: 87.62, 39: 88.906, 40: 91.224, 41: 92.906, 42: 95.95, 43: 96.906, 44: 101.07, 45: 102.91, 46: 106.42, 47: 107.87, 48: 112.41, 49: 114.82, 50: 118.71, 51: 121.76, 52: 127.60, 53: 127.60, 54: 131.29, 55: 132.91, 56: 137.33, 57: 138.91, 58: 140.12, 59: 140.91, 60: 144.24, 61: 144.912, 62: 150.36, 63: 151.96, 64: 157.25, 65: 158.93, 66: 162.50, 67: 164.93, 68: 167.26, 69: 168.93, 70: 173.05, 71: 174.97, 72: 178.49, 73: 180.95, 74: 183.84, 75: 186.21, 76: 190.23, 77: 192.22, 78: 195.08, 79: 196.97, 80: 200.59, 81: 204.38, 82: 207.2, 83: 208.98, 84: 1.97, 85: 2.02, 86: 2.2, 87: 3.48, 88: 2.83, 89: 2.0, 90: 232.04, 91: 231.04, 92: 238.03, 93: 237.048, 94: 244.064, 95: 243.061, 96: 247.070, 97: 247.070, 98: 251.079, 99: 252.083, 100: 257.095, 101: 258.098, 102: 259.101, 103: 262.110, 104: 267.122, 105: 270.131, 106: 271.134, 107: 270.133, 108: 270.134, 109: 278.156
};
export var DefaultVdwRadius = 1.7; // C
export var DefaultAtomWeight = 10.81; // C
export var DefaultAtomNumber = 0;
export function VdwRadius(element) {
    var i = AtomicNumbers[element];
    return i === void 0 ? DefaultVdwRadius : ElementVdwRadii[i];
}
export function AtomWeight(element) {
    var i = AtomicNumbers[element];
    return i === void 0 ? DefaultAtomWeight : ElementAtomWeights[i];
}
export function AtomNumber(element) {
    var i = AtomicNumbers[element];
    return i === void 0 ? DefaultAtomNumber : i;
}
