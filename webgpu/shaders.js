// Modular WebGPU shader definitions

export const blendModes = {
    mix: {
        name: 'Mix',
        code: `
            fn blend_mix(bg: vec4<f32>, fg: vec4<f32>, factor: f32) -> vec4<f32> {
                return mix(bg, fg, factor);
            }
        `
    },
    add: {
        name: 'Add',
        code: `
            fn blend_add(bg: vec4<f32>, fg: vec4<f32>, factor: f32) -> vec4<f32> {
                return bg + fg * factor;
            }
        `
    },
    multiply: {
        name: 'Multiply',
        code: `
            fn blend_multiply(bg: vec4<f32>, fg: vec4<f32>, factor: f32) -> vec4<f32> {
                return mix(bg, bg * fg, factor);
            }
        `
    },
    screen: {
        name: 'Screen',
        code: `
            fn blend_screen(bg: vec4<f32>, fg: vec4<f32>, factor: f32) -> vec4<f32> {
                let screen = vec4<f32>(1.0) - (vec4<f32>(1.0) - bg) * (vec4<f32>(1.0) - fg);
                return mix(bg, screen, factor);
            }
        `
    },
    overlay: {
        name: 'Overlay',
        code: `
            fn blend_overlay(bg: vec4<f32>, fg: vec4<f32>, factor: f32) -> vec4<f32> {
                var overlay: vec4<f32>;
                overlay.r = select(
                    2.0 * bg.r * fg.r,
                    1.0 - 2.0 * (1.0 - bg.r) * (1.0 - fg.r),
                    bg.r > 0.5
                );
                overlay.g = select(
                    2.0 * bg.g * fg.g,
                    1.0 - 2.0 * (1.0 - bg.g) * (1.0 - fg.g),
                    bg.g > 0.5
                );
                overlay.b = select(
                    2.0 * bg.b * fg.b,
                    1.0 - 2.0 * (1.0 - bg.b) * (1.0 - fg.b),
                    bg.b > 0.5
                );
                overlay.a = mix(bg.a, fg.a, factor);
                return mix(bg, overlay, factor);
            }
        `
    },
    difference: {
        name: 'Difference',
        code: `
            fn blend_difference(bg: vec4<f32>, fg: vec4<f32>, factor: f32) -> vec4<f32> {
                return mix(bg, abs(bg - fg), factor);
            }
        `
    }
};

export const vertexShader = `
struct VertexOutput {
    @builtin(position) position: vec4<f32>,
    @location(0) uv: vec2<f32>
};

@vertex
fn main(@builtin(vertex_index) vertexIndex: u32) -> VertexOutput {
    var output: VertexOutput;
    
    // Create a full-screen triangle
    let x = f32((vertexIndex & 1u) * 2u);
    let y = f32((vertexIndex >> 1u) * 2u);
    
    output.position = vec4<f32>(x * 2.0 - 1.0, 1.0 - y * 2.0, 0.0, 1.0);
    output.uv = vec2<f32>(x, y);
    
    return output;
}
`;

export function createFragmentShader(blendMode) {
    const blendFunction = blendModes[blendMode] || blendModes.mix;
    
    return `
${blendFunction.code}

@group(0) @binding(0) var bgTexture: texture_2d<f32>;
@group(0) @binding(1) var fgTexture: texture_2d<f32>;
@group(0) @binding(2) var textureSampler: sampler;

struct Uniforms {
    mixFactor: f32,
    padding: vec3<f32>
};
@group(0) @binding(3) var<uniform> uniforms: Uniforms;

@fragment
fn main(@location(0) uv: vec2<f32>) -> @location(0) vec4<f32> {
    let bg = textureSample(bgTexture, textureSampler, uv);
    let fg = textureSample(fgTexture, textureSampler, uv);
    
    return blend_${blendMode}(bg, fg, uniforms.mixFactor);
}
    `;
}