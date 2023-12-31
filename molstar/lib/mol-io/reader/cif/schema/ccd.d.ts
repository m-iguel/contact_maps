/**
 * Copyright (c) 2017-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * Code-generated 'CCD' schema file. Dictionary versions: mmCIF 5.371, IHM 1.22, MA 1.4.5.
 *
 * @author molstar/ciftools package
 */
import { Database, Column } from '../../../../mol-data/db';
import Schema = Column.Schema;
export declare const CCD_Schema: {
    /**
     * Data items in the CHEM_COMP category give details about each
     * of the chemical components from which the relevant chemical
     * structures can be constructed, such as name, mass or charge.
     *
     * The related categories CHEM_COMP_ATOM, CHEM_COMP_BOND,
     * CHEM_COMP_ANGLE etc. describe the detailed geometry of these
     * chemical components.
     */
    chem_comp: {
        /**
         * The formula for the chemical component. Formulae are written
         * according to the following rules:
         *
         * (1) Only recognized element symbols may be used.
         *
         * (2) Each element symbol is followed by a 'count' number. A count
         * of '1' may be omitted.
         *
         * (3) A space or parenthesis must separate each cluster of
         * (element symbol + count), but in general parentheses are
         * not used.
         *
         * (4) The order of elements depends on whether carbon is
         * present or not. If carbon is present, the order should be:
         * C, then H, then the other elements in alphabetical order
         * of their symbol. If carbon is not present, the elements
         * are listed purely in alphabetic order of their symbol. This
         * is the 'Hill' system used by Chemical Abstracts.
         */
        formula: Schema.Str;
        /**
         * Formula mass in daltons of the chemical component.
         */
        formula_weight: Schema.Float;
        /**
         * The value of _chem_comp.id must uniquely identify each item in
         * the CHEM_COMP list.
         *
         * For protein polymer entities, this is the three-letter code for
         * the amino acid.
         *
         * For nucleic acid polymer entities, this is the one-letter code
         * for the base.
         */
        id: Schema.Str;
        /**
         * The identifier for the parent component of the nonstandard
         * component. May be be a comma separated list if this component
         * is derived from multiple components.
         *
         * Items in this indirectly point to _chem_comp.id in
         * the CHEM_COMP category.
         */
        mon_nstd_parent_comp_id: Schema.List<string>;
        /**
         * The full name of the component.
         */
        name: Schema.Str;
        /**
         * For standard polymer components, the one-letter code for
         * the component.   For non-standard polymer components, the
         * one-letter code for parent component if this exists;
         * otherwise, the one-letter code should be given as 'X'.
         *
         * Components that derived from multiple parents components
         * are described by a sequence of one-letter-codes.
         */
        one_letter_code: Schema.Str;
        /**
         * For standard polymer components, the common three-letter code for
         * the component.   Non-standard polymer components and non-polymer
         * components are also assigned three-letter-codes.
         *
         * For ambiguous polymer components three-letter code should
         * be given as 'UNK'.  Ambiguous ions are assigned the code 'UNX'.
         * Ambiguous non-polymer components are assigned the code 'UNL'.
         */
        three_letter_code: Schema.Str;
        /**
         * For standard polymer components, the type of the monomer.
         * Note that monomers that will form polymers are of three types:
         * linking monomers, monomers with some type of N-terminal (or 5')
         * cap and monomers with some type of C-terminal (or 3') cap.
         */
        type: Schema.Aliased<"other" | "d-peptide linking" | "l-peptide linking" | "d-peptide nh3 amino terminus" | "l-peptide nh3 amino terminus" | "d-peptide cooh carboxy terminus" | "l-peptide cooh carboxy terminus" | "dna linking" | "rna linking" | "l-rna linking" | "l-dna linking" | "dna oh 5 prime terminus" | "rna oh 5 prime terminus" | "dna oh 3 prime terminus" | "rna oh 3 prime terminus" | "d-saccharide, beta linking" | "d-saccharide, alpha linking" | "l-saccharide, beta linking" | "l-saccharide, alpha linking" | "l-saccharide" | "d-saccharide" | "saccharide" | "non-polymer" | "peptide linking" | "peptide-like" | "l-gamma-peptide, c-delta linking" | "d-gamma-peptide, c-delta linking" | "l-beta-peptide, c-gamma linking" | "d-beta-peptide, c-gamma linking">;
        /**
         * Synonym list for the component.
         */
        pdbx_synonyms: Schema.List<string>;
        /**
         * A preliminary classification used by PDB.
         */
        pdbx_type: Schema.Str;
        /**
         * A preliminary classification used by PDB to indicate
         * that the chemistry of this component while described
         * as clearly as possible is still ambiguous.  Software
         * tools may not be able to process this component
         * definition.
         */
        pdbx_ambiguous_flag: Schema.Str;
        /**
         * Identifies the _chem_comp.id of the component that
         * has replaced this component.
         */
        pdbx_replaced_by: Schema.Str;
        /**
         * Identifies the _chem_comp.id's of the components
         * which have been replaced by this component.
         * Multiple id codes should be separated by commas.
         */
        pdbx_replaces: Schema.Str;
        /**
         * The net integer charge assigned to this component. This is the
         * formal charge assignment normally found in chemical diagrams.
         */
        pdbx_formal_charge: Schema.Int;
        /**
         * This data item provides additional details about the model coordinates
         * in the component definition.
         */
        pdbx_model_coordinates_details: Schema.Str;
        /**
         * This data item identifies the PDB database code from which the heavy
         * atom model coordinates were obtained.
         */
        pdbx_model_coordinates_db_code: Schema.Str;
        /**
         * This data item identifies the source of the ideal coordinates in the
         * component definition.
         */
        pdbx_ideal_coordinates_details: Schema.Str;
        /**
         * This data item identifies if ideal coordinates are missing in this definition.
         */
        pdbx_ideal_coordinates_missing_flag: Schema.Aliased<"y" | "n">;
        /**
         * This data item identifies if model coordinates are missing in this definition.
         */
        pdbx_model_coordinates_missing_flag: Schema.Aliased<"y" | "n">;
        /**
         * Date component was added to database.
         */
        pdbx_initial_date: Schema.Str;
        /**
         * Date component was last modified.
         */
        pdbx_modified_date: Schema.Str;
        /**
         * This data item holds the current release status for the component.
         */
        pdbx_release_status: Schema.Aliased<"REL" | "HOLD" | "HPUB" | "OBS" | "DEL" | "REF_ONLY">;
        /**
         * This data item identifies the deposition site that processed
         * this chemical component defintion.
         */
        pdbx_processing_site: Schema.Aliased<"RCSB" | "PDBE" | "PDBJ" | "PDBC" | "EBI">;
    };
    /**
     * Data items in the CHEM_COMP_ATOM category record details about
     * the atoms in a chemical component. Specifying the atomic
     * coordinates for the components in this category is an
     * alternative to specifying the structure of the component
     * via bonds, angles, planes etc. in the appropriate
     * CHEM_COMP subcategories.
     */
    chem_comp_atom: {
        /**
         * An alternative identifier for the atom. This data item would be
         * used in cases where alternative nomenclatures exist for labelling
         * atoms in a group.
         */
        alt_atom_id: Schema.Str;
        /**
         * The value of _chem_comp_atom.atom_id must uniquely identify
         * each atom in each monomer in the CHEM_COMP_ATOM list.
         *
         * The atom identifiers need not be unique over all atoms in the
         * data block; they need only be unique for each atom in a
         * component.
         *
         * Note that this item need not be a number; it can be any unique
         * identifier.
         */
        atom_id: Schema.Str;
        /**
         * The net integer charge assigned to this atom. This is the
         * formal charge assignment normally found in chemical diagrams.
         */
        charge: Schema.Int;
        /**
         * The x component of the coordinates for this atom in this
         * component specified as orthogonal angstroms. The choice of
         * reference axis frame for the coordinates is arbitrary.
         *
         * The set of coordinates input for the entity here is intended to
         * correspond to the atomic model used to generate restraints for
         * structure refinement, not to atom sites in the ATOM_SITE
         * list.
         */
        model_Cartn_x: Schema.Coordinate;
        /**
         * The y component of the coordinates for this atom in this
         * component specified as orthogonal angstroms. The choice of
         * reference axis frame for the coordinates is arbitrary.
         *
         * The set of coordinates input for the entity here is intended to
         * correspond to the atomic model used to generate restraints for
         * structure refinement, not to atom sites in the ATOM_SITE
         * list.
         */
        model_Cartn_y: Schema.Coordinate;
        /**
         * The z component of the coordinates for this atom in this
         * component specified as orthogonal angstroms. The choice of
         * reference axis frame for the coordinates is arbitrary.
         *
         * The set of coordinates input for the entity here is intended to
         * correspond to the atomic model used to generate restraints for
         * structure refinement, not to atom sites in the ATOM_SITE
         * list.
         */
        model_Cartn_z: Schema.Coordinate;
        /**
         * This data item is a pointer to _chem_comp.id in the CHEM_COMP
         * category.
         */
        comp_id: Schema.Str;
        /**
         * The code used to identify the atom species representing
         * this atom type. Normally this code is the element
         * symbol.
         */
        type_symbol: Schema.Str;
        /**
         * Atom name alignment offset in PDB atom field.
         */
        pdbx_align: Schema.Int;
        /**
         * Ordinal index for the component atom list.
         */
        pdbx_ordinal: Schema.Int;
        /**
         * An alternative x component of the coordinates for this atom in this
         * component specified as orthogonal angstroms.
         */
        pdbx_model_Cartn_x_ideal: Schema.Coordinate;
        /**
         * An alternative y component of the coordinates for this atom in this
         * component specified as orthogonal angstroms.
         */
        pdbx_model_Cartn_y_ideal: Schema.Coordinate;
        /**
         * An alternative z component of the coordinates for this atom in this
         * component specified as orthogonal angstroms.
         */
        pdbx_model_Cartn_z_ideal: Schema.Coordinate;
        /**
         * The chiral configuration of the atom that is a chiral center.
         */
        pdbx_stereo_config: Schema.Aliased<"s" | "r" | "n">;
        /**
         * A flag indicating an aromatic atom.
         */
        pdbx_aromatic_flag: Schema.Aliased<"y" | "n">;
        /**
         * A flag indicating a leaving atom.
         */
        pdbx_leaving_atom_flag: Schema.Aliased<"y" | "n">;
    };
    /**
     * Data items in the CHEM_COMP_BOND category record details about
     * the bonds between atoms in a chemical component. Target values
     * may be specified as bond orders, as a distance between the two
     * atoms, or both.
     */
    chem_comp_bond: {
        /**
         * The ID of the first of the two atoms that define the bond.
         *
         * This data item is a pointer to _chem_comp_atom.atom_id in the
         * CHEM_COMP_ATOM category.
         */
        atom_id_1: Schema.Str;
        /**
         * The ID of the second of the two atoms that define the bond.
         *
         * This data item is a pointer to _chem_comp_atom.atom_id in the
         * CHEM_COMP_ATOM category.
         */
        atom_id_2: Schema.Str;
        /**
         * This data item is a pointer to _chem_comp.id in the CHEM_COMP
         * category.
         */
        comp_id: Schema.Str;
        /**
         * The value that should be taken as the target for the chemical
         * bond associated with the specified atoms, expressed as a bond
         * order.
         */
        value_order: Schema.Aliased<"sing" | "doub" | "trip" | "quad" | "arom" | "poly" | "delo" | "pi">;
        /**
         * Ordinal index for the component bond list.
         */
        pdbx_ordinal: Schema.Int;
        /**
         * Stereochemical configuration across a double bond.
         */
        pdbx_stereo_config: Schema.Aliased<"z" | "n" | "e">;
        /**
         * A flag indicating an aromatic bond.
         */
        pdbx_aromatic_flag: Schema.Aliased<"y" | "n">;
    };
    /**
     * Data items in the CHEM_COMP_DESCRIPTOR category provide
     * string descriptors of component chemical structure.
     */
    pdbx_chem_comp_descriptor: {
        /**
         * This data item is a pointer to _chem_comp.id in the CHEM_COMP
         * category.
         */
        comp_id: Schema.Str;
        /**
         * This data item contains the descriptor value for this
         * component.
         */
        descriptor: Schema.Str;
        /**
         * This data item contains the descriptor type.
         */
        type: Schema.Aliased<"smiles_cannonical" | "smiles_canonical" | "smiles" | "inchi" | "inchi_main" | "inchi_main_formula" | "inchi_main_connect" | "inchi_main_hatom" | "inchi_charge" | "inchi_stereo" | "inchi_isotope" | "inchi_fixedh" | "inchi_reconnect" | "inchikey">;
        /**
         * This data item contains the name of the program
         * or library used to compute the descriptor.
         */
        program: Schema.Str;
        /**
         * This data item contains the version of the program
         * or library used to compute the descriptor.
         */
        program_version: Schema.Str;
    };
    /**
     * Data items in the CHEM_COMP_IDENTIFIER category provide
     * identifiers for chemical components.
     */
    pdbx_chem_comp_identifier: {
        /**
         * This data item is a pointer to _chem_comp.id in the CHEM_COMP
         * category.
         */
        comp_id: Schema.Str;
        /**
         * This data item contains the identifier value for this
         * component.
         */
        identifier: Schema.Str;
        /**
         * This data item contains the identifier type.
         */
        type: Schema.Aliased<"COMMON NAME" | "SYSTEMATIC NAME" | "CAS REGISTRY NUMBER" | "PUBCHEM Identifier" | "MDL Identifier" | "SYNONYM" | "CONDENSED IUPAC CARB SYMBOL" | "IUPAC CARB SYMBOL" | "SNFG CARB SYMBOL" | "CONDENSED IUPAC CARBOHYDRATE SYMBOL" | "IUPAC CARBOHYDRATE SYMBOL" | "SNFG CARBOHYDRATE SYMBOL">;
        /**
         * This data item contains the name of the program
         * or library used to compute the identifier.
         */
        program: Schema.Str;
        /**
         * This data item contains the version of the program
         * or library used to compute the identifier.
         */
        program_version: Schema.Str;
    };
};
export type CCD_Schema = typeof CCD_Schema;
export interface CCD_Database extends Database<CCD_Schema> {
}
