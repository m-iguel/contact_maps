/**
 * Copyright (c) 2017-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * Code-generated 'BIRD' schema file. Dictionary versions: mmCIF 5.371, IHM 1.22, MA 1.4.5.
 *
 * @author molstar/ciftools package
 */
import { Database, Column } from '../../../../mol-data/db';
import Schema = Column.Schema;
export declare const BIRD_Schema: {
    /**
     * Data items in the PDBX_REFERENCE_MOLECULE category record
     * reference information about small polymer molecules.
     */
    pdbx_reference_molecule: {
        /**
         * The value of _pdbx_reference_molecule.prd_id is the unique identifier
         * for the reference molecule in this family.
         *
         * By convention this ID uniquely identifies the reference molecule in
         * in the PDB reference dictionary.
         *
         * The ID has the template form PRD_dddddd (e.g. PRD_000001)
         */
        prd_id: Schema.Str;
        /**
         * Formula mass in daltons of the entity.
         */
        formula_weight: Schema.Float;
        /**
         * The formula for the reference entity. Formulae are written
         * according to the rules:
         *
         * 1. Only recognised element symbols may be used.
         *
         * 2. Each element symbol is followed by a 'count' number. A count
         * of '1' may be omitted.
         *
         * 3. A space or parenthesis must separate each element symbol and
         * its count, but in general parentheses are not used.
         *
         * 4. The order of elements depends on whether or not carbon is
         * present. If carbon is present, the order should be: C, then
         * H, then the other elements in alphabetical order of their
         * symbol. If carbon is not present, the elements are listed
         * purely in alphabetic order of their symbol. This is the
         * 'Hill' system used by Chemical Abstracts.
         */
        formula: Schema.Str;
        /**
         * Defines the structural classification of the entity.
         */
        type: Schema.Aliased<"unknown" | "non-polymer" | "peptide-like" | "macrolide" | "amino acid" | "aminoglycoside" | "anthracycline" | "anthraquinone" | "ansamycin" | "chalkophore" | "chromophore" | "glycopeptide" | "cyclic depsipeptide" | "cyclic lipopeptide" | "cyclic peptide" | "heterocyclic" | "imino sugar" | "keto acid" | "lipoglycopeptide" | "lipopeptide" | "nucleoside" | "oligopeptide" | "oligosaccharide" | "peptaibol" | "polycyclic" | "polypeptide" | "polysaccharide" | "quinolone" | "thiolactone" | "thiopeptide" | "siderophore" | "chalkophore, polypeptide">;
        /**
         * Evidence for the assignment of _pdbx_reference_molecule.type
         */
        type_evidence_code: Schema.Str;
        /**
         * Broadly defines the function of the entity.
         */
        class: Schema.Aliased<"unknown" | "antagonist" | "antibiotic" | "anticancer" | "anticoagulant" | "antifungal" | "antigen" | "antiinflammatory" | "antimicrobial" | "antineoplastic" | "antiparasitic" | "antiretroviral" | "anthelmintic" | "antithrombotic" | "antitumor" | "antiviral" | "caspase inhibitor" | "chaperone binding" | "enzyme inhibitor" | "drug delivery" | "glycan component" | "growth factor" | "immunosuppressant" | "inducer" | "inhibitor" | "lantibiotic" | "metabolism" | "metal transport" | "nutrient" | "oxidation-reduction" | "protein binding" | "receptor" | "substrate analog" | "synthetic opioid" | "thrombin inhibitor" | "transition state mimetic" | "transport activator" | "trypsin inhibitor" | "toxin" | "water retention" | "anticoagulant, antithrombotic" | "antibiotic, antimicrobial" | "antibiotic, anthelmintic" | "antibiotic, antineoplastic" | "antimicrobial, antiretroviral" | "antimicrobial, antitumor" | "antimicrobial, antiparasitic, antibiotic" | "thrombin inhibitor, trypsin inhibitor">;
        /**
         * Evidence for the assignment of _pdbx_reference_molecule.class
         */
        class_evidence_code: Schema.Str;
        /**
         * A name of the entity.
         */
        name: Schema.Str;
        /**
         * Defines how this entity is represented in PDB data files.
         */
        represent_as: Schema.Aliased<"polymer" | "branched" | "single molecule">;
        /**
         * For entities represented as single molecules, the identifier
         * corresponding to the chemical definition for the molecule.
         */
        chem_comp_id: Schema.Str;
        /**
         * Special details about this molecule.
         */
        compound_details: Schema.Str;
        /**
         * Description of this molecule.
         */
        description: Schema.Str;
        /**
         * The PDB accession code for the entry containing a representative example of this molecule.
         */
        representative_PDB_id_code: Schema.Str;
        /**
         * Defines the current PDB release status for this molecule definition.
         */
        release_status: Schema.Aliased<"wait" | "rel" | "hold" | "obs">;
        /**
         * Assigns the identifier for the reference molecule which have been replaced
         * by this reference molecule.
         * Multiple molecule identifier codes should be separated by commas.
         */
        replaces: Schema.Str;
        /**
         * Assigns the identifier of the reference molecule that has replaced this molecule.
         */
        replaced_by: Schema.Str;
    };
    /**
     * Data items in the PDBX_REFERENCE_ENTITY_LIST category record
     * the list of entities within each reference molecule.
     */
    pdbx_reference_entity_list: {
        /**
         * The value of _pdbx_reference_entity_list.prd_id is a reference
         * _pdbx_reference_molecule.prd_id in the PDBX_REFERENCE_MOLECULE category.
         */
        prd_id: Schema.Str;
        /**
         * The value of _pdbx_reference_entity_list.ref_entity_id is a unique identifier
         * the a constituent entity within this reference molecule.
         */
        ref_entity_id: Schema.Str;
        /**
         * Defines the polymer characteristic of the entity.
         */
        type: Schema.Aliased<"non-polymer" | "polymer" | "branched" | "polymer-like">;
        /**
         * Additional details about this entity.
         */
        details: Schema.Str;
        /**
         * The component number of this entity within the molecule.
         */
        component_id: Schema.Int;
    };
    /**
     * Data items in the PDBX_REFERENCE_ENTITY_NONPOLY category record
     * the list of entities within each reference molecule.
     */
    pdbx_reference_entity_nonpoly: {
        /**
         * The value of _pdbx_reference_entity_nonpoly.prd_id is a reference
         * _pdbx_reference_entity_list.prd_id in the PDBX_REFERENCE_ENTITY_LIST category.
         */
        prd_id: Schema.Str;
        /**
         * The value of _pdbx_reference_entity_nonpoly.ref_entity_id is a reference
         * to _pdbx_reference_entity_list.ref_entity_id in PDBX_REFERENCE_ENTITY_LIST category.
         */
        ref_entity_id: Schema.Str;
        /**
         * A name of the non-polymer entity.
         */
        name: Schema.Str;
        /**
         * For non-polymer entities, the identifier corresponding
         * to the chemical definition for the molecule.
         */
        chem_comp_id: Schema.Str;
    };
    /**
     * Data items in the PDBX_REFERENCE_ENTITY_LINK category give details about
     * the linkages between entities within reference molecules.
     */
    pdbx_reference_entity_link: {
        /**
         * The value of _pdbx_reference_entity_link.link_id uniquely identifies
         * linkages between entities with a molecule.
         */
        link_id: Schema.Int;
        /**
         * The value of _pdbx_reference_entity_link.prd_id is a reference
         * _pdbx_reference_entity_list.prd_id in the PDBX_REFERENCE_ENTITY_LIST category.
         */
        prd_id: Schema.Str;
        /**
         * A description of special aspects of a linkage between
         * chemical components in the structure.
         */
        details: Schema.Str;
        /**
         * The reference entity id of the first of the two entities joined by the
         * linkage.
         *
         * This data item is a pointer to _pdbx_reference_entity_list.ref_entity_id
         * in the PDBX_REFERENCE_ENTITY_LIST category.
         */
        ref_entity_id_1: Schema.Str;
        /**
         * The reference entity id of the second of the two entities joined by the
         * linkage.
         *
         * This data item is a pointer to _pdbx_reference_entity_list.ref_entity_id
         * in the PDBX_REFERENCE_ENTITY_LIST category.
         */
        ref_entity_id_2: Schema.Str;
        /**
         * For a polymer entity, the sequence number in the first of
         * the two entities containing the linkage.
         *
         * This data item is a pointer to _pdbx_reference_entity_poly_seq.num
         * in the PDBX_REFERENCE_ENTITY_POLY_SEQ category.
         */
        entity_seq_num_1: Schema.Int;
        /**
         * For a polymer entity, the sequence number in the second of
         * the two entities containing the linkage.
         *
         * This data item is a pointer to _pdbx_reference_entity_poly_seq.num
         * in the PDBX_REFERENCE_ENTITY_POLY_SEQ category.
         */
        entity_seq_num_2: Schema.Int;
        /**
         * The component identifier in the first of the two entities containing the linkage.
         *
         * For polymer entities, this data item is a pointer to _pdbx_reference_entity_poly_seq.mon_id
         * in the PDBX_REFERENCE_ENTITY_POLY_SEQ category.
         *
         * For non-polymer entities, this data item is a pointer to
         * _pdbx_reference_entity_nonpoly.chem_comp_id in the
         * PDBX_REFERENCE_ENTITY_NONPOLY category.
         */
        comp_id_1: Schema.Str;
        /**
         * The component identifier in the second of the two entities containing the linkage.
         *
         * For polymer entities, this data item is a pointer to _pdbx_reference_entity_poly_seq.mon_id
         * in the PDBX_REFERENCE_ENTITY_POLY_SEQ category.
         *
         * For non-polymer entities, this data item is a pointer to
         * _pdbx_reference_entity_nonpoly.chem_comp_id in the
         * PDBX_REFERENCE_ENTITY_NONPOLY category.
         */
        comp_id_2: Schema.Str;
        /**
         * The atom identifier/name in the first of the two entities containing the linkage.
         */
        atom_id_1: Schema.Str;
        /**
         * The atom identifier/name in the second of the two entities containing the linkage.
         */
        atom_id_2: Schema.Str;
        /**
         * The bond order target for the chemical linkage.
         */
        value_order: Schema.Aliased<"sing" | "doub" | "trip" | "quad" | "arom" | "poly" | "delo" | "pi">;
        /**
         * The entity component identifier for the first of two entities containing the linkage.
         */
        component_1: Schema.Int;
        /**
         * The entity component identifier for the second of two entities containing the linkage.
         */
        component_2: Schema.Int;
        /**
         * A code indicating the entity types involved in the linkage.
         */
        link_class: Schema.Aliased<"PP" | "PN" | "NP" | "NN">;
    };
    /**
     * Data items in the PDBX_REFERENCE_ENTITY_POLY_LINK category give details about
     * polymer linkages including both standard and non-standard linkages between
     * polymer componnents.
     */
    pdbx_reference_entity_poly_link: {
        /**
         * The value of _pdbx_reference_entity_poly_link.link_id uniquely identifies
         * a linkage within a polymer entity.
         */
        link_id: Schema.Int;
        /**
         * The value of _pdbx_reference_entity_poly_link.prd_id is a reference
         * _pdbx_reference_entity_list.prd_id in the PDBX_REFERENCE_ENTITY_POLY category.
         */
        prd_id: Schema.Str;
        /**
         * The reference entity id of the polymer entity containing the linkage.
         *
         * This data item is a pointer to _pdbx_reference_entity_poly.ref_entity_id
         * in the PDBX_REFERENCE_ENTITY_POLY category.
         */
        ref_entity_id: Schema.Str;
        /**
         * The entity component identifier entity containing the linkage.
         */
        component_id: Schema.Int;
        /**
         * For a polymer entity, the sequence number in the first of
         * the two components making the linkage.
         *
         * This data item is a pointer to _pdbx_reference_entity_poly_seq.num
         * in the PDBX_REFERENCE_ENTITY_POLY_SEQ category.
         */
        entity_seq_num_1: Schema.Int;
        /**
         * For a polymer entity, the sequence number in the second of
         * the two components making the linkage.
         *
         * This data item is a pointer to _pdbx_reference_entity_poly_seq.num
         * in the PDBX_REFERENCE_ENTITY_POLY_SEQ category.
         */
        entity_seq_num_2: Schema.Int;
        /**
         * The component identifier in the first of the two components making the
         * linkage.
         *
         * This data item is a pointer to _pdbx_reference_entity_poly_seq.mon_id
         * in the PDBX_REFERENCE_ENTITY_POLY_SEQ category.
         */
        comp_id_1: Schema.Str;
        /**
         * The component identifier in the second of the two components making the
         * linkage.
         *
         * This data item is a pointer to _pdbx_reference_entity_poly_seq.mon_id
         * in the PDBX_REFERENCE_ENTITY_POLY_SEQ category.
         */
        comp_id_2: Schema.Str;
        /**
         * The atom identifier/name in the first of the two components making
         * the linkage.
         */
        atom_id_1: Schema.Str;
        /**
         * The atom identifier/name in the second of the two components making
         * the linkage.
         */
        atom_id_2: Schema.Str;
        /**
         * The bond order target for the non-standard linkage.
         */
        value_order: Schema.Aliased<"sing" | "doub" | "trip" | "quad" | "arom" | "poly" | "delo" | "pi">;
    };
    /**
     * Data items in the PDBX_REFERENCE_ENTITY_POLY category record details about
     * the polymer, such as the type of the polymer, the number of
     * monomers and whether it has nonstandard features.
     */
    pdbx_reference_entity_poly: {
        /**
         * The value of _pdbx_reference_entity_poly.prd_id is a reference
         * _pdbx_reference_entity_list.prd_id in the  PDBX_REFERENCE_ENTITY_LIST category.
         */
        prd_id: Schema.Str;
        /**
         * The value of _pdbx_reference_entity_poly.ref_entity_id is a reference
         * to _pdbx_reference_entity_list.ref_entity_id in PDBX_REFERENCE_ENTITY_LIST category.
         */
        ref_entity_id: Schema.Str;
        /**
         * The type of the polymer.
         */
        type: Schema.Aliased<"peptide-like" | "oligosaccharide" | "nucleic-acid-like" | "polysaccharide-like">;
        /**
         * The database code for this source information
         */
        db_code: Schema.Str;
        /**
         * The database name for this source information
         */
        db_name: Schema.Str;
    };
    /**
     * Data items in the PDBX_REFERENCE_ENTITY_POLY_SEQ category specify the sequence
     * of monomers in a polymer.
     */
    pdbx_reference_entity_poly_seq: {
        /**
         * The value of _pdbx_reference_entity_poly_seq.prd_id is a reference
         * _pdbx_reference_entity_poly.prd_id in the  PDBX_REFERENCE_ENTITY_POLY category.
         */
        prd_id: Schema.Str;
        /**
         * The value of _pdbx_reference_entity_poly_seq.ref_entity_id is a reference
         * to _pdbx_reference_entity_poly.ref_entity_id in PDBX_REFERENCE_ENTITY_POLY category.
         */
        ref_entity_id: Schema.Str;
        /**
         * This data item is the chemical component identifier of monomer.
         */
        mon_id: Schema.Str;
        /**
         * This data item is the chemical component identifier for the parent component corresponding to this monomer.
         */
        parent_mon_id: Schema.Str;
        /**
         * The value of _pdbx_reference_entity_poly_seq.num must uniquely and sequentially
         * identify a record in the PDBX_REFERENCE_ENTITY_POLY_SEQ list.
         *
         * This value is conforms to author numbering conventions and does not map directly
         * to the numbering conventions used for _entity_poly_seq.num.
         */
        num: Schema.Int;
        /**
         * A flag to indicate that this monomer is observed in the instance example.
         */
        observed: Schema.Aliased<"y" | "n">;
        /**
         * A flag to indicate that sequence heterogeneity at this monomer position.
         */
        hetero: Schema.Aliased<"y" | "n">;
    };
    /**
     * Additional features associated with the reference entity.
     */
    pdbx_reference_entity_sequence: {
        /**
         * The value of _pdbx_reference_entity_sequence.prd_id is a reference
         * _pdbx_reference_entity_list.prd_id in the  PDBX_REFERENCE_ENTITY_LIST category.
         */
        prd_id: Schema.Str;
        /**
         * The value of _pdbx_reference_entity_sequence.ref_entity_id is a reference
         * to _pdbx_reference_entity_list.ref_entity_id in PDBX_REFERENCE_ENTITY_LIST category.
         */
        ref_entity_id: Schema.Str;
        /**
         * The monomer type for the sequence.
         */
        type: Schema.Aliased<"saccharide" | "peptide-like">;
        /**
         * A flag to indicate a non-ribosomal entity.
         */
        NRP_flag: Schema.Aliased<"N" | "Y">;
        /**
         * The one-letter-code sequence for this entity.  Non-standard monomers are represented as 'X'.
         */
        one_letter_codes: Schema.Str;
    };
    /**
     * Data items in the PDBX_REFERENCE_ENTITY_SRC_NAT category record
     * details of the source from which the entity was obtained.
     */
    pdbx_reference_entity_src_nat: {
        /**
         * The value of _pdbx_reference_entity_src_nat.prd_id is a reference
         * _pdbx_reference_entity_list.prd_id in the  PDBX_REFERENCE_ENTITY_LIST category.
         */
        prd_id: Schema.Str;
        /**
         * The value of _pdbx_reference_entity_src_nat.ref_entity_id is a reference
         * to _pdbx_reference_entity_list.ref_entity_id in PDBX_REFERENCE_ENTITY_LIST category.
         */
        ref_entity_id: Schema.Str;
        /**
         * The value of _pdbx_reference_entity_src_nat.ordinal distinguishes
         * source details for this entity.
         */
        ordinal: Schema.Int;
        /**
         * The scientific name of the organism from which the entity was isolated.
         */
        organism_scientific: Schema.Str;
        /**
         * The NCBI TaxId of the organism from which the entity was isolated.
         */
        taxid: Schema.Str;
        /**
         * The database code for this source information
         */
        db_code: Schema.Str;
        /**
         * The database name for this source information
         */
        db_name: Schema.Str;
    };
    /**
     * Data items in the PDBX_PRD_AUDIT category records
     * the status and tracking information for this molecule.
     */
    pdbx_prd_audit: {
        /**
         * This data item is a pointer to _pdbx_reference_molecule.prd_id in the
         * pdbx_reference_molecule category.
         */
        prd_id: Schema.Str;
        /**
         * The date associated with this audit record.
         */
        date: Schema.Str;
        /**
         * An identifier for the wwPDB site creating or modifying the molecule.
         */
        processing_site: Schema.Aliased<"RCSB" | "PDBE" | "PDBJ" | "BMRB" | "PDBC">;
        /**
         * The action associated with this audit record.
         */
        action_type: Schema.Aliased<"Initial release" | "Create molecule" | "Modify type" | "Modify class" | "Modify molecule name" | "Modify representation" | "Modify sequence" | "Modify linkage" | "Modify taxonomy organism" | "Modify audit" | "Other modification" | "Obsolete molecule">;
    };
};
export type BIRD_Schema = typeof BIRD_Schema;
export interface BIRD_Database extends Database<BIRD_Schema> {
}
