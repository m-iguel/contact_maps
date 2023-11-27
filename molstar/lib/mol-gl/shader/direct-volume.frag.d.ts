/**
 * Copyright (c) 2017-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author Michael Krone <michael.krone@uni-tuebingen.de>
 */
export declare const directVolume_frag = "\nprecision highp float;\nprecision highp int;\n\n#include common\n#include light_frag_params\n\n#if dClipObjectCount != 0\n    uniform int uClipObjectType[dClipObjectCount];\n    uniform bool uClipObjectInvert[dClipObjectCount];\n    uniform vec3 uClipObjectPosition[dClipObjectCount];\n    uniform vec4 uClipObjectRotation[dClipObjectCount];\n    uniform vec3 uClipObjectScale[dClipObjectCount];\n#endif\n#include common_clip\n\n#include read_from_texture\n#include texture3d_from_1d_trilinear\n#include texture3d_from_2d_nearest\n#include texture3d_from_2d_linear\n\nuniform mat4 uProjection, uTransform, uModelView, uModel, uView;\nuniform vec3 uCameraDir;\n\nuniform sampler2D tDepth;\nuniform vec2 uDrawingBufferSize;\n\nvarying vec3 vOrigPos;\nvarying float vInstance;\nvarying vec4 vBoundingSphere;\nvarying mat4 vTransform;\n\nuniform mat4 uInvView;\nuniform vec3 uGridDim;\nuniform vec3 uBboxSize;\nuniform sampler2D tTransferTex;\nuniform float uTransferScale;\nuniform float uStepScale;\nuniform float uJumpLength;\n\nuniform int uObjectId;\nuniform int uVertexCount;\nuniform int uInstanceCount;\nuniform int uGroupCount;\n\n#if defined(dColorMarker)\n    uniform vec3 uHighlightColor;\n    uniform vec3 uSelectColor;\n    uniform vec3 uDimColor;\n    uniform float uHighlightStrength;\n    uniform float uSelectStrength;\n    uniform float uDimStrength;\n    uniform int uMarkerPriority;\n    uniform float uMarkerAverage;\n\n    uniform float uMarker;\n    uniform vec2 uMarkerTexDim;\n    uniform sampler2D tMarker;\n#endif\n\nuniform float uMetalness;\nuniform float uRoughness;\n\nuniform float uFogNear;\nuniform float uFogFar;\nuniform vec3 uFogColor;\n\nuniform float uAlpha;\nuniform bool uTransparentBackground;\nuniform float uXrayEdgeFalloff;\nuniform float uExposure;\n\nuniform int uRenderMask;\n\nuniform float uNear;\nuniform float uFar;\nuniform float uIsOrtho;\n\nuniform vec3 uCellDim;\nuniform vec3 uCameraPosition;\nuniform mat4 uCartnToUnit;\n\n#if __VERSION__ != 100\n    // for webgl1 this is given as a 'define'\n    uniform int uMaxSteps;\n#endif\n\n#if defined(dGridTexType_2d)\n    precision highp sampler2D;\n    uniform sampler2D tGridTex;\n    uniform vec3 uGridTexDim;\n#elif defined(dGridTexType_3d)\n    precision highp sampler3D;\n    uniform sampler3D tGridTex;\n#endif\n\n#if defined(dColorType_uniform)\n    uniform vec3 uColor;\n#elif defined(dColorType_texture)\n    uniform vec2 uColorTexDim;\n    uniform sampler2D tColor;\n#endif\n\n#ifdef dOverpaint\n    #if defined(dOverpaintType_groupInstance) || defined(dOverpaintType_vertexInstance)\n        uniform vec2 uOverpaintTexDim;\n        uniform sampler2D tOverpaint;\n    #endif\n#endif\n\n#ifdef dUsePalette\n    uniform sampler2D tPalette;\n#endif\n\n#if defined(dGridTexType_2d)\n    vec4 textureVal(vec3 pos) {\n        return texture3dFrom2dLinear(tGridTex, pos + (vec3(0.5, 0.5, 0.0) / uGridDim), uGridDim, uGridTexDim.xy);\n    }\n    vec4 textureGroup(vec3 pos) {\n        return texture3dFrom2dNearest(tGridTex, pos + (vec3(0.5, 0.5, 0.0) / uGridDim), uGridDim, uGridTexDim.xy);\n    }\n#elif defined(dGridTexType_3d)\n    vec4 textureVal(vec3 pos) {\n        return texture(tGridTex, pos + (vec3(0.5) / uGridDim));\n    }\n    vec4 textureGroup(vec3 pos) {\n        return texelFetch(tGridTex, ivec3(pos * uGridDim), 0);\n    }\n#endif\n\nfloat calcDepth(const in vec3 pos) {\n    vec2 clipZW = pos.z * uProjection[2].zw + uProjection[3].zw;\n    return 0.5 + 0.5 * clipZW.x / clipZW.y;\n}\n\nfloat transferFunction(float value) {\n    return texture2D(tTransferTex, vec2(value, 0.0)).a;\n}\n\nfloat getDepth(const in vec2 coords) {\n    #ifdef depthTextureSupport\n        return texture2D(tDepth, coords).r;\n    #else\n        return unpackRGBAToDepth(texture2D(tDepth, coords));\n    #endif\n}\n\nconst float gradOffset = 0.5;\n\nvec3 v3m4(vec3 p, mat4 m) {\n    return (m * vec4(p, 1.0)).xyz;\n}\n\nfloat preFogAlphaBlended = 0.0;\n\nvec4 raymarch(vec3 startLoc, vec3 step, vec3 rayDir) {\n    mat3 normalMatrix = transpose3(inverse3(mat3(uModelView * vTransform)));\n    mat4 cartnToUnit = uCartnToUnit * inverse4(vTransform);\n    #if defined(dClipVariant_pixel) && dClipObjectCount != 0\n        mat4 modelTransform = uModel * vTransform * uTransform;\n    #endif\n    mat4 modelViewTransform = uModelView * vTransform * uTransform;\n\n    vec3 scaleVol = vec3(1.0) / uGridDim;\n    vec3 pos = startLoc;\n    vec4 cell;\n    float prevValue = -1.0;\n    float value = 0.0;\n    vec4 src = vec4(0.0);\n    vec4 dst = vec4(0.0);\n    float fragmentDepth;\n\n    vec3 posMin = vec3(0.0);\n    vec3 posMax = vec3(1.0) - vec3(1.0) / uGridDim;\n\n    vec3 unitPos;\n\n    vec3 nextPos;\n    float nextValue;\n\n    vec4 material;\n    vec4 overpaint;\n    float metalness = uMetalness;\n    float roughness = uRoughness;\n\n    vec3 gradient = vec3(1.0);\n    vec3 dx = vec3(gradOffset * scaleVol.x, 0.0, 0.0);\n    vec3 dy = vec3(0.0, gradOffset * scaleVol.y, 0.0);\n    vec3 dz = vec3(0.0, 0.0, gradOffset * scaleVol.z);\n\n    float maxDist = min(vBoundingSphere.w * 2.0, uFar - uNear);\n    float maxDistSq = maxDist * maxDist;\n\n    for (int i = 0; i < uMaxSteps; ++i) {\n        // break when beyond bounding-sphere or far-plane\n        vec3 distVec = startLoc - pos;\n        if (dot(distVec, distVec) > maxDistSq) break;\n\n        unitPos = v3m4(pos, cartnToUnit);\n\n        // continue when outside of grid\n        if (unitPos.x > posMax.x || unitPos.y > posMax.y || unitPos.z > posMax.z ||\n            unitPos.x < posMin.x || unitPos.y < posMin.y || unitPos.z < posMin.z\n        ) {\n            prevValue = value;\n            pos += step;\n            continue;\n        }\n\n        cell = textureVal(unitPos);\n        value = cell.a; // current voxel value\n\n        if (uJumpLength > 0.0 && value < 0.01) {\n            nextPos = pos + rayDir * uJumpLength;\n            nextValue = textureVal(v3m4(nextPos, cartnToUnit)).a;\n            if (nextValue < 0.01) {\n                prevValue = nextValue;\n                pos = nextPos;\n                continue;\n            }\n        }\n\n        vec4 mvPosition = modelViewTransform * vec4(unitPos * uGridDim, 1.0);\n        if (calcDepth(mvPosition.xyz) > getDepth(gl_FragCoord.xy / uDrawingBufferSize))\n            break;\n\n        #if defined(dClipVariant_pixel) && dClipObjectCount != 0\n            vec3 vModelPosition = v3m4(unitPos * uGridDim, modelTransform);\n            if (clipTest(vec4(vModelPosition, 0.0))) {\n                prevValue = value;\n                pos += step;\n                continue;\n            }\n        #endif\n\n        vec3 vViewPosition = mvPosition.xyz;\n        material.a = transferFunction(value);\n\n        #ifdef dPackedGroup\n            float group = unpackRGBToInt(textureGroup(floor(unitPos * uGridDim + 0.5) / uGridDim).rgb);\n        #else\n            vec3 g = floor(unitPos * uGridDim + 0.5);\n            // note that we swap x and z because the texture is flipped around y\n            #if defined(dAxisOrder_012)\n                float group = g.z + g.y * uGridDim.z + g.x * uGridDim.z * uGridDim.y; // 210\n            #elif defined(dAxisOrder_021)\n                float group = g.y + g.z * uGridDim.y + g.x * uGridDim.y * uGridDim.z; // 120\n            #elif defined(dAxisOrder_102)\n                float group = g.z + g.x * uGridDim.z + g.y * uGridDim.z * uGridDim.x; // 201\n            #elif defined(dAxisOrder_120)\n                float group = g.x + g.z * uGridDim.x + g.y * uGridDim.x * uGridDim.z; // 021\n            #elif defined(dAxisOrder_201)\n                float group = g.y + g.x * uGridDim.y + g.z * uGridDim.y * uGridDim.x; // 102\n            #elif defined(dAxisOrder_210)\n                float group = g.x + g.y * uGridDim.x + g.z * uGridDim.x * uGridDim.y; // 012\n            #endif\n        #endif\n\n        #if defined(dColorType_direct) && defined(dUsePalette)\n            material.rgb = texture2D(tPalette, vec2(value, 0.0)).rgb;\n        #elif defined(dColorType_uniform)\n            material.rgb = uColor;\n        #elif defined(dColorType_instance)\n            material.rgb = readFromTexture(tColor, vInstance, uColorTexDim).rgb;\n        #elif defined(dColorType_group)\n            material.rgb = readFromTexture(tColor, group, uColorTexDim).rgb;\n        #elif defined(dColorType_groupInstance)\n            material.rgb = readFromTexture(tColor, vInstance * float(uGroupCount) + group, uColorTexDim).rgb;\n        #elif defined(dColorType_vertex)\n            material.rgb = texture3dFrom1dTrilinear(tColor, unitPos, uGridDim, uColorTexDim, 0.0).rgb;\n        #elif defined(dColorType_vertexInstance)\n            material.rgb = texture3dFrom1dTrilinear(tColor, unitPos, uGridDim, uColorTexDim, vInstance * float(uVertexCount)).rgb;\n        #endif\n\n        #ifdef dOverpaint\n            #if defined(dOverpaintType_groupInstance)\n                overpaint = readFromTexture(tOverpaint, vInstance * float(uGroupCount) + group, uOverpaintTexDim);\n            #elif defined(dOverpaintType_vertexInstance)\n                overpaint = texture3dFrom1dTrilinear(tOverpaint, unitPos, uGridDim, uOverpaintTexDim, vInstance * float(uVertexCount));\n            #endif\n\n            material.rgb = mix(material.rgb, overpaint.rgb, overpaint.a);\n        #endif\n\n        #ifdef dIgnoreLight\n            gl_FragColor.rgb = material.rgb;\n        #else\n            if (material.a >= 0.01) {\n                #ifdef dPackedGroup\n                    // compute gradient by central differences\n                    gradient.x = textureVal(unitPos - dx).a - textureVal(unitPos + dx).a;\n                    gradient.y = textureVal(unitPos - dy).a - textureVal(unitPos + dy).a;\n                    gradient.z = textureVal(unitPos - dz).a - textureVal(unitPos + dz).a;\n                #else\n                    gradient = cell.xyz * 2.0 - 1.0;\n                #endif\n                vec3 normal = -normalize(normalMatrix * normalize(gradient));\n                #include apply_light_color\n            } else {\n                gl_FragColor.rgb = material.rgb;\n            }\n        #endif\n\n        gl_FragColor.a = material.a * uAlpha * uTransferScale;\n\n        #if defined(dColorMarker)\n            float marker = uMarker;\n            if (uMarker == -1.0) {\n                marker = readFromTexture(tMarker, vInstance * float(uGroupCount) + group, uMarkerTexDim).a;\n                marker = floor(marker * 255.0 + 0.5); // rounding required to work on some cards on win\n            }\n        #endif\n        #include apply_marker_color\n\n        preFogAlphaBlended = (1.0 - preFogAlphaBlended) * gl_FragColor.a + preFogAlphaBlended;\n        fragmentDepth = calcDepth(mvPosition.xyz);\n        #include apply_fog\n\n        src = gl_FragColor;\n\n        if (!uTransparentBackground) {\n            // done in 'apply_fog' otherwise\n            src.rgb *= src.a;\n        }\n        dst = (1.0 - dst.a) * src + dst; // standard blending\n\n        // break if the color is opaque enough\n        if (dst.a > 0.95)\n            break;\n\n        pos += step;\n    }\n\n    return dst;\n}\n\n// TODO: support float texture for higher precision values???\n// TODO: support clipping exclusion texture support\n\nvoid main() {\n    if (gl_FrontFacing)\n        discard;\n\n    vec3 rayDir = mix(normalize(vOrigPos - uCameraPosition), uCameraDir, uIsOrtho);\n    vec3 step = rayDir * uStepScale;\n\n    float boundingSphereNear = distance(vBoundingSphere.xyz, uCameraPosition) - vBoundingSphere.w;\n    float d = max(uNear, boundingSphereNear) - mix(0.0, distance(vOrigPos, uCameraPosition), uIsOrtho);\n    vec3 start = mix(uCameraPosition, vOrigPos, uIsOrtho) + (d * rayDir);\n    gl_FragColor = raymarch(start, step, rayDir);\n\n    float fragmentDepth = calcDepth((uModelView * vec4(start, 1.0)).xyz);\n    float preFogAlpha = clamp(preFogAlphaBlended, 0.0, 1.0);\n    #include wboit_write\n}\n";