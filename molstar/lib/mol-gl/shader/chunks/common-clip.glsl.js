/**
 * Copyright (c) 2020-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Ludovic Autin <autin@scripps.edu>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
export var common_clip = "\n#if dClipObjectCount != 0\n    vec3 quaternionTransform(const in vec4 q, const in vec3 v) {\n        vec3 t = 2.0 * cross(q.xyz, v);\n        return v + q.w * t + cross(q.xyz, t);\n    }\n\n    vec4 computePlane(const in vec3 normal, const in vec3 inPoint) {\n        return vec4(normalize(normal), -dot(normal, inPoint));\n    }\n\n    float planeSD(const in vec4 plane, const in vec3 center) {\n        return -dot(plane.xyz, center - plane.xyz * -plane.w);\n    }\n\n    float sphereSD(const in vec3 position, const in vec4 rotation, const in vec3 size, const in vec3 center) {\n        return (\n            length(quaternionTransform(vec4(-rotation.x, -rotation.y, -rotation.z, rotation.w), center - position) / size) - 1.0\n        ) * min(min(size.x, size.y), size.z);\n    }\n\n    float cubeSD(const in vec3 position, const in vec4 rotation, const in vec3 size, const in vec3 center) {\n        vec3 d = abs(quaternionTransform(vec4(-rotation.x, -rotation.y, -rotation.z, rotation.w), center - position)) - size;\n        return min(max(d.x, max(d.y, d.z)), 0.0) + length(max(d, 0.0));\n    }\n\n    float cylinderSD(const in vec3 position, const in vec4 rotation, const in vec3 size, const in vec3 center) {\n        vec3 t = quaternionTransform(vec4(-rotation.x, -rotation.y, -rotation.z, rotation.w), center - position);\n\n        vec2 d = abs(vec2(length(t.xz), t.y)) - size.xy;\n        return min(max(d.x, d.y), 0.0) + length(max(d, 0.0));\n    }\n\n    float infiniteConeSD(const in vec3 position, const in vec4 rotation, const in vec3 size, const in vec3 center) {\n        vec3 t = quaternionTransform(vec4(-rotation.x, -rotation.y, -rotation.z, rotation.w), center - position);\n\n        float q = length(t.xy);\n        return dot(size.xy, vec2(q, t.z));\n    }\n\n    float getSignedDistance(const in vec3 center, const in int type, const in vec3 position, const in vec4 rotation, const in vec3 scale) {\n        if (type == 1) {\n            vec3 normal = quaternionTransform(rotation, vec3(0.0, 1.0, 0.0));\n            vec4 plane = computePlane(normal, position);\n            return planeSD(plane, center);\n        } else if (type == 2) {\n            return sphereSD(position, rotation, scale * 0.5, center);\n        } else if (type == 3) {\n            return cubeSD(position, rotation, scale * 0.5, center);\n        } else if (type == 4) {\n            return cylinderSD(position, rotation, scale * 0.5, center);\n        } else if (type == 5) {\n            return infiniteConeSD(position, rotation, scale * 0.5, center);\n        } else {\n            return 0.1;\n        }\n    }\n\n    #if __VERSION__ == 100\n        // 8-bit\n        int bitwiseAnd(const in int a, const in int b) {\n            int d = 128;\n            int result = 0;\n            for (int i = 0; i < 8; ++i) {\n                if (d <= 0) break;\n                if (a >= d && b >= d) result += d;\n                if (a >= d) a -= d;\n                if (b >= d) b -= d;\n                d /= 2;\n            }\n            return result;\n        }\n\n        bool hasBit(const in int mask, const in int bit) {\n            return bitwiseAnd(mask, bit) == 0;\n        }\n    #else\n        bool hasBit(const in int mask, const in int bit) {\n            return (mask & bit) == 0;\n        }\n    #endif\n\n    bool clipTest(const in vec4 sphere) {\n        // flag is a bit-flag for clip-objects to ignore (note, object ids start at 1 not 0)\n        #if defined(dClipping)\n            int flag = int(floor(vClipping * 255.0 + 0.5));\n        #else\n            int flag = 0;\n        #endif\n\n        #pragma unroll_loop_start\n        for (int i = 0; i < dClipObjectCount; ++i) {\n            if (flag == 0 || hasBit(flag, UNROLLED_LOOP_INDEX + 1)) {\n                // TODO take sphere radius into account?\n                bool test = getSignedDistance(sphere.xyz, uClipObjectType[i], uClipObjectPosition[i], uClipObjectRotation[i], uClipObjectScale[i]) <= 0.0;\n                if ((!uClipObjectInvert[i] && test) || (uClipObjectInvert[i] && !test)) {\n                    return true;\n                }\n            }\n        }\n        #pragma unroll_loop_end\n        return false;\n    }\n#endif\n";