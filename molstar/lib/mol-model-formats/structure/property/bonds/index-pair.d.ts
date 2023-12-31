/**
 * Copyright (c) 2019-2023 Mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { CustomPropertyDescriptor } from '../../../../mol-model/custom-property';
import { IntAdjacencyGraph } from '../../../../mol-math/graph';
import { Column } from '../../../../mol-data/db';
import { FormatPropertyProvider } from '../../common/property';
import { BondType } from '../../../../mol-model/structure/model/types';
import { ElementIndex } from '../../../../mol-model/structure';
export type IndexPairsProps = {
    readonly key: ArrayLike<number>;
    readonly operatorA: ArrayLike<number>;
    readonly operatorB: ArrayLike<number>;
    readonly order: ArrayLike<number>;
    readonly distance: ArrayLike<number>;
    readonly flag: ArrayLike<BondType.Flag>;
};
export type IndexPairs = IntAdjacencyGraph<ElementIndex, IndexPairsProps>;
export type IndexPairBonds = {
    bonds: IndexPairs;
    maxDistance: number;
};
export declare namespace IndexPairBonds {
    const Descriptor: CustomPropertyDescriptor;
    const Provider: FormatPropertyProvider<IndexPairBonds>;
    type Data = {
        pairs: {
            indexA: Column<number>;
            indexB: Column<number>;
            key?: Column<number>;
            /** Operator key for indexA. Used in bond computation. */
            operatorA?: Column<number>;
            /** Operator key for indexB. Used in bond computation. */
            operatorB?: Column<number>;
            order?: Column<number>;
            /**
             * Useful for bonds in periodic cells. That is, only bonds within the given
             * distance are added. This allows for bond between periodic image but
             * avoids unwanted bonds with wrong distances. If negative, test using the
             * `maxDistance` option from `Props`.
             */
            distance?: Column<number>;
            flag?: Column<BondType.Flag>;
        };
        count: number;
    };
    const DefaultProps: {
        /**
         * If negative, test using element-based threshold, otherwise distance in Angstrom.
         *
         * This option exists to handle bonds in periodic cells. For systems that are
         * made from beads (as opposed to atomic elements), set to a specific distance.
         *
         * Note that `Data` has a `distance` field which allows specifying a distance
         * for each bond individually which takes precedence over this option.
         */
        maxDistance: number;
    };
    type Props = typeof DefaultProps;
    function fromData(data: Data, props?: Partial<Props>): IndexPairBonds;
    /** Like `getEdgeIndex` but taking `edgeProps.operatorA` and `edgeProps.operatorB` into account */
    function getEdgeIndexForOperators(bonds: IndexPairs, i: ElementIndex, j: ElementIndex, opI: number, opJ: number): number;
}
