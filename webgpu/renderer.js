// WebGPU renderer for node operations

import { vertexShader, createFragmentShader } from './shaders.js';

export class WebGPURenderer {
    constructor() {
        this.device = null;
        this.context = null;
        this.initialized = false;
        this.pipelines = new Map();
        this.uniformBuffer = null;
        this.sampler = null;
    }

    async initialize() {
        console.log('🔍 Checking WebGPU support...');
        
        if (!navigator.gpu) {
            console.error('❌ WebGPU API not found in navigator');
            console.log('Your browser:', navigator.userAgent);
            return false;
        }
        
        console.log('✅ WebGPU API found');

        try {
            console.log('🔍 Requesting GPU adapter...');
            const adapter = await navigator.gpu.requestAdapter({
                powerPreference: 'high-performance'
            });
            
            if (!adapter) {
                console.error('❌ No WebGPU adapter found');
                console.log('This might be due to:');
                console.log('- Hardware acceleration disabled in Chrome');
                console.log('- GPU blacklisted');
                console.log('- Running in a VM or remote desktop');
                return false;
            }
            
            console.log('✅ GPU adapter found');
            
            // Try to get adapter info (not available in all browsers)
            try {
                if (adapter.requestAdapterInfo) {
                    const info = await adapter.requestAdapterInfo();
                    console.log('📊 GPU Info:', info);
                } else {
                    console.log('📊 GPU Info: requestAdapterInfo not available');
                }
            } catch (e) {
                console.log('📊 GPU Info: Could not retrieve adapter info');
            }

            console.log('🔍 Requesting GPU device...');
            this.device = await adapter.requestDevice();
            
            // Create sampler
            this.sampler = this.device.createSampler({
                magFilter: 'linear',
                minFilter: 'linear',
                addressModeU: 'clamp-to-edge',
                addressModeV: 'clamp-to-edge'
            });

            // Create uniform buffer
            this.uniformBuffer = this.device.createBuffer({
                size: 16, // 4 floats (mix factor + padding)
                usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
            });

            console.log('✅ GPU device acquired successfully');
            
            this.initialized = true;
            console.log('🎉 WebGPU renderer fully initialized!');
            return true;
        } catch (error) {
            console.error('❌ Failed to initialize WebGPU:', error);
            console.error('Error details:', error.message);
            console.error('Stack trace:', error.stack);
            return false;
        }
    }

    createPipeline(blendMode, format) {
        if (this.pipelines.has(blendMode)) {
            return this.pipelines.get(blendMode);
        }

        const pipeline = this.device.createRenderPipeline({
            layout: 'auto',
            vertex: {
                module: this.device.createShaderModule({
                    code: vertexShader
                }),
                entryPoint: 'main'
            },
            fragment: {
                module: this.device.createShaderModule({
                    code: createFragmentShader(blendMode)
                }),
                entryPoint: 'main',
                targets: [{
                    format: format
                }]
            },
            primitive: {
                topology: 'triangle-strip',
                stripIndexFormat: 'uint32'
            }
        });

        this.pipelines.set(blendMode, pipeline);
        return pipeline;
    }

    createTextureFromCanvas(canvas) {
        const texture = this.device.createTexture({
            size: [canvas.width, canvas.height],
            format: 'rgba8unorm',
            usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT
        });

        this.device.queue.copyExternalImageToTexture(
            { source: canvas },
            { texture: texture },
            [canvas.width, canvas.height]
        );

        return texture;
    }

    async blend(bgCanvas, fgCanvas, outputCanvas, blendMode = 'mix', mixFactor = 0.5) {
        if (!this.initialized) {
            console.warn('WebGPU renderer not initialized');
            return false;
        }

        const context = outputCanvas.getContext('webgpu');
        if (!context) {
            console.warn('Failed to get WebGPU context');
            return false;
        }

        const format = navigator.gpu.getPreferredCanvasFormat();
        context.configure({
            device: this.device,
            format: format
        });

        // Create textures from input canvases
        const bgTexture = this.createTextureFromCanvas(bgCanvas);
        const fgTexture = this.createTextureFromCanvas(fgCanvas);

        // Get or create pipeline for blend mode
        const pipeline = this.createPipeline(blendMode, format);

        // Update uniforms
        const uniformData = new Float32Array([mixFactor, 0, 0, 0]);
        this.device.queue.writeBuffer(this.uniformBuffer, 0, uniformData);

        // Create bind group
        const bindGroup = this.device.createBindGroup({
            layout: pipeline.getBindGroupLayout(0),
            entries: [
                { binding: 0, resource: bgTexture.createView() },
                { binding: 1, resource: fgTexture.createView() },
                { binding: 2, resource: this.sampler },
                { binding: 3, resource: { buffer: this.uniformBuffer } }
            ]
        });

        // Render
        const commandEncoder = this.device.createCommandEncoder();
        const renderPass = commandEncoder.beginRenderPass({
            colorAttachments: [{
                view: context.getCurrentTexture().createView(),
                clearValue: { r: 0, g: 0, b: 0, a: 1 },
                loadOp: 'clear',
                storeOp: 'store'
            }]
        });

        renderPass.setPipeline(pipeline);
        renderPass.setBindGroup(0, bindGroup);
        renderPass.draw(4);
        renderPass.end();

        this.device.queue.submit([commandEncoder.finish()]);

        // Clean up textures
        bgTexture.destroy();
        fgTexture.destroy();

        return true;
    }


}

// Singleton instance
export const webGPURenderer = new WebGPURenderer();