# Molstar visualizers for FrustraEvo Server

Molstar visualizers to render the Single Residue, Configurational and Mutational contact maps in a Webpack for FrustraEvo Server.


### Requirements:

+ Node Package Manager (npm) (manager for JavaScript software packages).

### Instructions to run the webpack in a local server:

1. Clone this repository.

`git clone https://github.com/m-iguel/contact_maps.git`

Optionally, you can remove the following files and repostitory, since we will be creating them afterwards:

    * ./src/apps/playground/index.ts
    * ./src/apps/playground/index.html
    * ./webpack-config-common.js
    * ./build/

3. Run the script with the following arguments:

     * Structure data (FrustraEvoResults/Data/PDB_A.pdb)
     * IC Single Residue file (FrustraEvoResults/OutputFiles/IC_SingleRes_XXXXXX
     * IC Mutational file (FrustraEvoResults/OutputFiles/IC_Mut_XXXXXX
     * IC Configurational file (FrustraEvoResults/OutputFiles/IC_Conf_XXXXXX
     * Structure Visualization (FrustraEvoResults/Data/PDB_A.done/VisualizationScrips/PDB_A.pdb

From your root directory:
```
python3 parse_contact_maps.py FrustraEvo_2023715141047268466/Data/1AYI_A.pdb FrustraEvo_2023715141047268466/OutPutFiles/IC_SingleRes_2023715141047268466 FrustraEvo_2023715141047268466/OutPutFiles/IC_Mut_2023715141047268466 FrustraEvo_2023715141047268466/OutPutFiles/IC_Conf_2023715141047268466 FrustraEvo_2023715141047268466/Data/1AYI_A.done/VisualizationScrips/1AYI_A.pdb
```

3. The following files will be created
   
    * ./src/apps/playground/index.ts
    * ./src/apps/playground/index.html
    * ./webpack-config-common.js

4. Run the webpack
   
   `npm run watch-playground`

6. The build/ directory is created.
7. Open a local server:

     `python3 -m http.server`

8. Navigate to build/playground/index.html
9. The visualizer is now loaded and rendering three visualizers: Single Residue (left), Mutational (center) and Configurational (right).
