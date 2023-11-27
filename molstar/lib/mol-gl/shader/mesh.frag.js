/**
 * Copyright (c) 2018-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
export var mesh_frag = "\nprecision highp float;\nprecision highp int;\n\n#define bumpEnabled\n\n#include common\n#include common_frag_params\n#include color_frag_params\n#include light_frag_params\n#include normal_frag_params\n#include common_clip\n\nvoid main() {\n    #include clip_pixel\n\n    // Workaround for buggy gl_FrontFacing (e.g. on some integrated Intel GPUs)\n    vec3 fdx = dFdx(vViewPosition);\n    vec3 fdy = dFdy(vViewPosition);\n    vec3 faceNormal = normalize(cross(fdx,fdy));\n    bool frontFacing = dot(vNormal, faceNormal) > 0.0;\n\n    #if defined(dFlipSided)\n        interior = frontFacing;\n    #else\n        interior = !frontFacing;\n    #endif\n\n    float fragmentDepth = gl_FragCoord.z;\n    #include assign_material_color\n\n    #if defined(dRenderVariant_pick)\n        #include check_picking_alpha\n        #ifdef requiredDrawBuffers\n            gl_FragColor = vObject;\n            gl_FragData[1] = vInstance;\n            gl_FragData[2] = vGroup;\n            gl_FragData[3] = packDepthToRGBA(fragmentDepth);\n        #else\n            gl_FragColor = vColor;\n        #endif\n    #elif defined(dRenderVariant_depth)\n        gl_FragColor = material;\n    #elif defined(dRenderVariant_marking)\n        gl_FragColor = material;\n    #elif defined(dRenderVariant_color)\n        #if defined(dFlatShaded)\n            vec3 normal = -faceNormal;\n        #else\n            vec3 normal = -normalize(vNormal);\n            if (uDoubleSided) normal *= float(frontFacing) * 2.0 - 1.0;\n        #endif\n        #include apply_light_color\n\n        #include apply_interior_color\n        #include apply_marker_color\n        #include apply_fog\n        #include wboit_write\n        #include dpoit_write\n    #endif\n}\n";