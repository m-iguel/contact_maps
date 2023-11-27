#!/usr/bin/env python
# coding: utf-8

import sys
import pandas as pd
from Bio.PDB import PDBParser, PPBuilder
import numpy as np

#inputs

structure_pdb=sys.argv[1]
pdb_id=structure_pdb.split("/")[-1].split(".pdb")[0]
IC_MUT=sys.argv[2]
IC_CONF=sys.argv[3]
pdb_visualization=sys.argv[4]


parser = PDBParser()
structure = parser.get_structure(pdb_id, structure_pdb)

#this retrieves the coordinates of a residue
def get_residue_coordinates(structure, chain_id, residue_id):
   for model in structure:
       for chain in model:
           if chain.id == chain_id:
               for residue in chain:
                  if residue.id[1] == residue_id:
                      return residue['CA'].get_coord()
   return None

def format_row(row):
   a = ', '.join(map(str, row['coord_Res1']))
   b = ', '.join(map(str, row['coord_Res2']))
   color = row['contact_color']
   return f"\t\t\t{{a: Vec3.create({a}), b: Vec3.create({b}), color: Color({color})}}"
    


#process Configurational data
IC_conf=pd.read_csv(IC_CONF, sep='\t')
IC_conf=IC_conf[(IC_conf['FreqConts']>0.5)&(IC_conf['ICtotal']>0.5)][['Res1','Res2','FstConserved']]
# Apply the function to each row and create the new columns
IC_conf['coord_Res1'] = IC_conf.apply(lambda row: get_residue_coordinates(structure, 'A', row['Res1']), axis=1)
IC_conf['coord_Res2'] = IC_conf.apply(lambda row: get_residue_coordinates(structure, 'A', row['Res2']), axis=1)
IC_conf['contact_color'] = np.where(IC_conf['FstConserved'] == 'MAX', '0xff0000',
                            np.where(IC_conf['FstConserved'] == 'NEU', '0xbfbfbf',
                                    np.where(IC_conf['FstConserved'] == 'MIN', '0x00ff00', 'Unknown')))

#create the coloring vector
IC_conf['formatted_string'] = IC_conf.apply(format_row, axis=1)




#process Mutational data

IC_mut=pd.read_csv(IC_MUT, sep='\t')
IC_mut=IC_mut[(IC_mut['FreqConts']>0.5)&(IC_mut['ICtotal']>0.5)][['Res1','Res2','FstConserved']]
# Apply the function to each row and create the new columns
IC_mut['coord_Res1'] = IC_mut.apply(lambda row: get_residue_coordinates(structure, 'A', row['Res1']), axis=1)
IC_mut['coord_Res2'] = IC_mut.apply(lambda row: get_residue_coordinates(structure, 'A', row['Res2']), axis=1)
IC_mut['contact_color'] = np.where(IC_mut['FstConserved'] == 'MAX', '0xff0000',
                            np.where(IC_mut['FstConserved'] == 'NEU', '0xbfbfbf',
                                    np.where(IC_mut['FstConserved'] == 'MIN', '0x00ff00', 'Unknown')))

#create the coloring vector
IC_mut['formatted_string'] = IC_mut.apply(format_row, axis=1)


#DEFINE STRINGS
str1='''

/**
 * Copyright (c) 2019-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */

import { Canvas3DProps } from '../../mol-canvas3d/canvas3d';
import { BuiltInTrajectoryFormat } from '../../mol-plugin-state/formats/trajectory';
import { createPluginUI } from '../../mol-plugin-ui/react18';
import { PluginUIContext } from '../../mol-plugin-ui/context';
import { DefaultPluginUISpec } from '../../mol-plugin-ui/spec';
import { PluginCommands } from '../../mol-plugin/commands';
import { Asset } from '../../mol-util/assets';
import { Color } from '../../mol-util/color';
import './index.html';
import { Structure, StructureElement, StructureProperties } from '../../mol-model/structure';
import { StructureMeasurementManager } from '../../mol-plugin-state/manager/structure/measurement';
import { Loci } from '../../mol-model/structure/structure/element/loci';
import { PluginStateObject } from '../../mol-plugin-state/objects';
import { SequenceWrapper } from '../../mol-plugin-ui/sequence/wrapper';
import { getChainOptions, getModelEntityOptions, getOperatorOptions, getSequenceWrapper } from '../../mol-plugin-ui/sequence';
import { StateTransformer } from '../../../lib/mol-state/transformer';
import { ParamDefinition } from '../../mol-util/param-definition'
import { Vec3 } from '../../mol-math/linear-algebra';
import { StateTransforms } from '../../mol-plugin-state/transforms';
import { Mesh } from '../../mol-geo/geometry/mesh/mesh';
import { MeshBuilder } from '../../mol-geo/geometry/mesh/mesh-builder';
import { addCylinder } from '../../mol-geo/geometry/mesh/builder/cylinder';
import { addFixedCountDashedCylinder } from '../../mol-geo/geometry/mesh/builder/cylinder';
import { Shape } from '../../mol-model/shape';


require('mol-plugin-ui/skin/light.scss');


// Provided code
const Transform = StateTransformer.builderFactory('my-namespace'); // change the namespaces here
const CreateAtomPairsProvider = Transform({
    name: 'draw-lines-provider',
    display: { name: 'Atom Pairs' },
    from: PluginStateObject.Root,
    to: PluginStateObject.Shape.Provider,
    params: {
        lines: ParamDefinition.Value<Line[]>([], { isHidden: true })
    }
})({
    apply({ params }) {
        return new PluginStateObject.Shape.Provider({
            label: 'Pairs',
            data: { lines: params.lines },
            params: Mesh.Params,
            geometryUtils: Mesh.Utils,
            getShape: (_, data) => createLinesShape(data)
        }, { label: 'Lines' });
    }
});

interface Line {
    a: Vec3;
    b: Vec3;
    color: Color;
}

function createLinesShape({ lines }: { lines: Line[] }) {
    const lineRadius = 0.08;

    const builder = MeshBuilder.createState(512, 512);
    for (let i = 0; i < lines.length; i++) {
        builder.currentGroup = i;

        const l = lines[i];
        const dist = Vec3.distance(l.a, l.b);
        addFixedCountDashedCylinder(builder, l.a, l.b, 1, Math.ceil(dist * 4) + 1, true, { bottomCap: true, topCap: true, radiusBottom: lineRadius, radiusTop: lineRadius })      
    }

    return Shape.create(
        'Atom Pairs',
        {},
        MeshBuilder.getMesh(builder),
        g => lines[g].color,
        () => 1,
        g => `Distance: ${round(Vec3.distance(lines[g].a, lines[g].b), 2)} Ang`
    );
}

type LoadParams = { url: string, format?: BuiltInTrajectoryFormat, isBinary?: boolean, assemblyId?: string }

type _Preset = Pick<Canvas3DProps, 'postprocessing' | 'renderer'>
type Preset = { [K in keyof _Preset]: Partial<_Preset[K]> }

const Canvas3DPresets = {
    illustrative: {
        canvas3d: <Preset>{
            postprocessing: {
                occlusion: {
                    name: 'on',
                    params: {
                        samples: 32,
                        multiScale: { name: 'off', params: {} },
                        radius: 5,
                        bias: 0.8,
                        blurKernelSize: 15,
                        resolutionScale: 5,
                        color: Color(0x00000000),
                    }
                },
                outline: {
                    name: 'on',
                    params: {
                        scale: 1,
                        threshold: 0.33,
                        color: Color(0x000000),
                        includeTransparent: true,
                    }
                },
                shadow: {
                    name: 'on',
                    params: {color: Color(0x000000)}
                },
            },
            renderer: {
                ambientIntensity: 1.0,
                light: []
            }
        }
    },

};


type Canvas3DPreset = keyof typeof Canvas3DPresets

class LightingDemo {
    // Class properties
    plugin: PluginUIContext;
    private radius = 5;
    private bias = 1.1;
    private preset: Canvas3DPreset = 'illustrative';

    // Method to initialize the plugin
    async init(target: string | HTMLElement) {
        this.plugin = await createPluginUI(typeof target === 'string' ? document.getElementById(target)! : target, {
            ...DefaultPluginUISpec(),
            layout: {
                initial: {
                    isExpanded: false,
                    showControls: false
                },
            },
            components: {
                controls: { left: 'none', right: 'none', top: 'none', bottom: 'none' }
            }
        });
        this.setPreset('illustrative');
    }

    // Method to set the preset of the 3D canvas
    setPreset(preset: Canvas3DPreset) {
        const props = Canvas3DPresets[preset];
        if (props.canvas3d.postprocessing.occlusion?.name === 'on') {
            props.canvas3d.postprocessing.occlusion.params.radius = this.radius;
            props.canvas3d.postprocessing.occlusion.params.bias = this.bias;
        }
        PluginCommands.Canvas3D.SetSettings(this.plugin, {
            settings: {
                ...props,
                renderer: {
                    ...this.plugin.canvas3d!.props.renderer,
                    ...props.canvas3d.renderer
                },
                postprocessing: {
                    ...this.plugin.canvas3d!.props.postprocessing,
                    ...props.canvas3d.postprocessing
                },
            }
        });
    }

    // Method to load and render the structure from a URL
    async load({ url, format = 'pdb', isBinary = true, assemblyId = '' }: LoadParams, radius: number, bias: number) {
        await this.plugin.clear();
        const data = await this.plugin.builders.data.download({ url: Asset.Url(url), isBinary }, { state: { isGhost: true } });
        const trajectory = await this.plugin.builders.structure.parseTrajectory(data, format);
        const model = await this.plugin.builders.structure.createModel(trajectory);
        let structure: any = await this.plugin.builders.structure.createStructure(model, assemblyId ? { name: 'assembly', params: { id: assemblyId } } : { name: 'model', params: {} });

        const polymer = await this.plugin.builders.structure.tryCreateComponentStatic(structure, 'polymer');
        if (polymer) await this.plugin.builders.structure.representation.addRepresentation(polymer, { type: 'cartoon', color: 'uniform', colorParams: { value: 0x00999999 });

        // Define your lines data
        const myLinesData = [
'''


str2='''
        ];

        // Apply the CreateAtomPairsProvider transformer to create the representation
        const update = this.plugin.build();
        update.toRoot()
            .apply(CreateAtomPairsProvider, { lines: myLinesData })
            .apply(StateTransforms.Representation.ShapeRepresentation3D);
        await update.commit();

        this.radius = radius;
        this.bias = bias;
        this.setPreset(this.preset);
    }
}

class LightingDemo2 {
   // Class properties
   plugin: PluginUIContext;
   private radius = 5;
   private bias = 1.1;
   private preset: Canvas3DPreset = 'illustrative';

   // Method to initialize the plugin
   async init(target: string | HTMLElement) {
       this.plugin = await createPluginUI(typeof target === 'string' ? document.getElementById(target)! : target, {
           ...DefaultPluginUISpec(),
           layout: {
               initial: {
                  isExpanded: false,
                  showControls: false
               },
           },
           components: {
               controls: { left: 'none', right: 'none', top: 'none', bottom: 'none' }
           }
       });
       this.setPreset('illustrative');
   }

   // Method to set the preset of the 3D canvas
   setPreset(preset: Canvas3DPreset) {
       const props = Canvas3DPresets[preset];
       if (props.canvas3d.postprocessing.occlusion?.name === 'on') {
           props.canvas3d.postprocessing.occlusion.params.radius = this.radius;
           props.canvas3d.postprocessing.occlusion.params.bias = this.bias;
       }
       PluginCommands.Canvas3D.SetSettings(this.plugin, {
           settings: {
               ...props,
               renderer: {
                  ...this.plugin.canvas3d!.props.renderer,
                  ...props.canvas3d.renderer
               },
               postprocessing: {
                  ...this.plugin.canvas3d!.props.postprocessing,
                  ...props.canvas3d.postprocessing
               },
           }
       });
   }

   // Method to load and render the structure from a URL
   async load({ url, format = 'pdb', isBinary = true, assemblyId = '' }: LoadParams, radius: number, bias: number) {
       await this.plugin.clear();
       const data = await this.plugin.builders.data.download({ url: Asset.Url(url), isBinary }, { state: { isGhost: true } });
       const trajectory = await this.plugin.builders.structure.parseTrajectory(data, format);
       const model = await this.plugin.builders.structure.createModel(trajectory);
       let structure: any = await this.plugin.builders.structure.createStructure(model, assemblyId ? { name: 'assembly', params: { id: assemblyId } } : { name: 'model', params: {} });

       const polymer = await this.plugin.builders.structure.tryCreateComponentStatic(structure, 'polymer');
       if (polymer) await this.plugin.builders.structure.representation.addRepresentation(polymer, { type: 'cartoon', color: 'uniform', colorParams: { value: 0x00999999 });

       // Define your lines data
       const myLinesData = [
'''


str3='''
       ];

       // Apply the CreateAtomPairsProvider transformer to create the representation
       const update = this.plugin.build();
       update.toRoot()
           .apply(CreateAtomPairsProvider, { lines: myLinesData })
           .apply(StateTransforms.Representation.ShapeRepresentation3D);
       await update.commit();

       this.radius = radius;
       this.bias = bias;
       this.setPreset(this.preset);
   }
}

// Assign instance of LightingDemo to the global window object
(window as any).LightingDemo = new LightingDemo();

// Assign instance of LightingDemo2 to the global window object
(window as any).LightingDemo2 = new LightingDemo2();

'''


html_string = (
    '<!DOCTYPE html>\n'
    '<html lang="en">\n'
    '    <head>\n'
    '        <meta charset="utf-8" />\n'
    '        <meta name="viewport" content="width=device-width, user-scalable=no, minimum-scale=1.0, maximum-scale=1.0">\n'
    '        <title>Mol* Lighting Demo</title>\n'
    '        <style>\n'
    '            * {\n'
    '                margin: 0;\n'
    '                padding: 0;\n'
    '                box-sizing: border-box;\n'
    '            }\n'
    '           #visualizers {\n'
    '  	        	display: flex; /* Add this line to apply Flexbox layout */\n'
    '    	        height: 100vh;\n'
    '  		        gap: 20px;\n'
  	'	         }\n'
    '            #app {\n'
    '                position: relative;\n'
    '                width: 400px;\n'
    '                height: 400px;\n'
    '            }\n'
    '            #app2 {\n'
    '                position: relative;\n'
    '                width: 400px;\n'
    '                height: 400px;\n'
    '            }\n'
    '        </style>\n'
    '        <link rel="stylesheet" type="text/css" href="molstar.css" />\n'
    '        <script type="text/javascript" src="./molstar.js"></script>\n'
    '    </head>\n'
    '    <body>\n'
    '        <div id=\'controls\'></div>\n'
    '        <div id="visualizers">\n'
    '            <div id="app"></div>\n'
    '            <div id="app2"></div>\n'
    '        </div>\n'
    '        <script>\n'
    '            LightingDemo.init(\'app\').then(() => {\n'
    '                LightingDemo.load({ url: \'./' + pdb_id + '.pdb\', format: \'pdb\', isBinary: false, assemblyId: 0 }, 5, 1.3);\n'
    '            });\n'
    '            LightingDemo2.init(\'app2\').then(() => {\n'
    '                LightingDemo2.load({ url: \'./' + pdb_id + '.pdb\', format: \'pdb\', isBinary: false, assemblyId: 0 }, 5, 1.3);\n'
    '            });\n'
    '        </script>\n'
    '    </body>\n'
    '</html>\n'
)


webpack_config_string = '''const path = require('path');
const fs = require('fs');
const webpack = require('webpack');
const ExtraWatchWebpackPlugin = require('extra-watch-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const VERSION = require('./package.json').version;

class VersionFilePlugin {
  apply() {
      fs.writeFileSync(
          path.resolve(__dirname, 'lib/mol-plugin/version.js'),
          `export var PLUGIN_VERSION = '${VERSION}';\\nexport var PLUGIN_VERSION_DATE = new Date(typeof __MOLSTAR_DEBUG_TIMESTAMP__ !== 'undefined' ? __MOLSTAR_DEBUG_TIMESTAMP__ : ${new Date().valueOf()});`);
  }
}

const sharedConfig = {
  module: {
      rules: [
          {
              test: /\.(html|ico)$/,
              use: [{
                loader: 'file-loader',
                options: { name: '[name].[ext]' }
              }]
          },
          {
              test: /\.pdb$/,
              use: 'file-loader',
          },
          {
              test: /\.(s*)css$/,
              use: [
                MiniCssExtractPlugin.loader,
                { loader: 'css-loader', options: { sourceMap: false } },
                { loader: 'sass-loader', options: { sourceMap: false } },
              ]
          },
          {
              test: /\.(jpg)$/i,
              type: 'asset/resource',
          },
      ]
  },
  plugins: [
      new ExtraWatchWebpackPlugin({
          files: [
              './lib/**/*.scss',
              './lib/**/*.html'
          ],
      }),
      new webpack.DefinePlugin({
          'process.env.DEBUG': JSON.stringify(process.env.DEBUG),
          '__MOLSTAR_DEBUG_TIMESTAMP__': webpack.DefinePlugin.runtimeValue(() => `${new Date().valueOf()}`, true)
      }),
      new MiniCssExtractPlugin({ filename: 'molstar.css' }),
      new VersionFilePlugin(),
      new CopyPlugin({
          patterns: [
              { from: '../STRING', to: 'PDB' },
          ],
      }), // Add this line
  ],
  resolve: {
      modules: [
          'node_modules',
          path.resolve(__dirname, 'lib/')
      ],
      fallback: {
          fs: false,
          crypto: require.resolve('crypto-browserify'),
          path: require.resolve('path-browserify'),
          stream: require.resolve('stream-browserify'),
      }
  },
  watchOptions: {
      aggregateTimeout: 750
  }
};

function createEntry(src, outFolder, outFilename, isNode) {
   return {
       target: isNode ? 'node' : void 0,
       entry: path.resolve(__dirname, `lib/${src}.js`),
       output: { filename: `${outFilename}.js`, path: path.resolve(__dirname, `build/${outFolder}`) },
       ...sharedConfig
   };
}

function createEntryPoint(name, dir, out, library) {
   return {
       entry: path.resolve(__dirname, `lib/${dir}/${name}.js`),
       output: { filename: `${library || name}.js`, path: path.resolve(__dirname, `build/${out}`), library: library || out, libraryTarget: 'umd', assetModuleFilename: 'images/[hash][ext][query]', 'publicPath': '' },
       ...sharedConfig
   };
}

function createNodeEntryPoint(name, dir, out) {
   return {
       target: 'node',
       entry: path.resolve(__dirname, `lib/${dir}/${name}.js`),
       output: { filename: `${name}.js`, path: path.resolve(__dirname, `build/${out}`) },
       externals: {
           argparse: 'require("argparse")',
           'node-fetch': 'require("node-fetch")',
           'util.promisify': 'require("util.promisify")',
           xhr2: 'require("xhr2")',
       },
       ...sharedConfig
   };
}

function createApp(name, library) { return createEntryPoint('index', `apps/${name}`, name, library); }
function createExample(name) { return createEntry(`examples/${name}/index`, `examples/${name}`, 'index'); }
function createBrowserTest(name) { return createEntryPoint(name, 'tests/browser', 'tests'); }
function createNodeApp(name) { return createNodeEntryPoint('index', `apps/${name}`, name); }

module.exports = {
   createApp,
   createEntry,
   createExample,
   createBrowserTest,
   createNodeEntryPoint,
   createNodeApp
};
'''

# Replace STRING and PDB in the JavaScript code
webpack_config_string = webpack_config_string.replace('STRING', pdb_visualization).replace('PDB', pdb_id+".pdb")


#Write the files
with open('molstar/src/apps/playground/index.ts','w') as f:
    f.write(str1)
    for i in IC_mut['formatted_string'].values:
        f.write(i+'\n')
    f.write(str2)
    for i in IC_conf['formatted_string'].values:
        f.write(i+'\n')
    f.write(str3)

with open('molstar/src/apps/playground/index.html','w') as file:
    file.write(html_string)

with open('molstar/webpack.config.common.js','w') as file:
    file.write(webpack_config_string)

