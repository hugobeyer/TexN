export const blendNode = {
    name: 'Blend',
    type: 'blend',
    color: 0x444444,
    inputs: ['fg', 'bg'],
    outputs: ['color'],
    parameters: {
        mode: {
            type: 'dropdown',
            label: 'Mode',
            options: ['mix', 'add', 'multiply', 'screen', 'overlay', 'difference'],
            default: 'mix'
        },
        mix: {
            type: 'float',
            label: 'Mix',
            min: 0,
            max: 1,
            step: 0.01,
            default: 0.5
        }
    },
    // Node-specific data for processing
    processor: {
        type: 'blend',
        requiresWebGPU: true
    },
    generateTexture: (ctx, parameters = { mode: 'mix', mix: 0.5 }) => {
        const mix = parameters.mix || 0.5;
        const mode = parameters.mode || 'mix';
        
        // Create a simple blend visualization
        const width = 256;
        const height = 256;
        
        // Create gradient backgrounds for demonstration
        const gradient1 = ctx.createLinearGradient(0, 0, width, height);
        gradient1.addColorStop(0, '#ff0000');
        gradient1.addColorStop(1, '#00ff00');
        
        const gradient2 = ctx.createLinearGradient(0, height, width, 0);
        gradient2.addColorStop(0, '#0000ff');
        gradient2.addColorStop(1, '#ffff00');
        
        // Draw background gradient
        ctx.fillStyle = gradient1;
        ctx.fillRect(0, 0, width, height);
        
        // Apply blend mode
        ctx.globalAlpha = mix;
        switch (mode) {
            case 'multiply':
                ctx.globalCompositeOperation = 'multiply';
                break;
            case 'screen':
                ctx.globalCompositeOperation = 'screen';
                break;
            case 'overlay':
                ctx.globalCompositeOperation = 'overlay';
                break;
            case 'difference':
                ctx.globalCompositeOperation = 'difference';
                break;
            case 'add':
                ctx.globalCompositeOperation = 'lighter';
                break;
            default:
                ctx.globalCompositeOperation = 'source-over';
        }
        
        // Draw foreground gradient with blend
        ctx.fillStyle = gradient2;
        ctx.fillRect(0, 0, width, height);
        
        // Reset composite operation
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = 1.0;
        
        // Add some visual indicators
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.strokeRect(10, 10, width - 20, height - 20);
        
        // Add info text
        ctx.fillStyle = '#fff';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`${mode.toUpperCase()}: ${(mix * 100).toFixed(0)}%`, width / 2, height - 20);
    },
    // Process with actual inputs (when connected)
    process: async (inputs, parameters, webGPURenderer) => {
        const { bg, fg } = inputs;
        const { mode, mix } = parameters;
        
        console.log('Blend process called with:', {
            inputs: Object.keys(inputs),
            hasBackground: !!bg,
            hasForeground: !!fg,
            mode,
            mix
        });
        
        if (!bg || !fg) {
            console.warn('Blend missing inputs - bg:', !!bg, 'fg:', !!fg);
            // Return default texture if inputs not connected
            return null;
        }
        
        const outputCanvas = document.createElement('canvas');
        outputCanvas.width = 256;
        outputCanvas.height = 256;
        
        // WebGPU only - no fallback
        if (!webGPURenderer || !webGPURenderer.initialized) {
            console.error('WebGPU is required but not available');
            // Create error canvas
            const ctx = outputCanvas.getContext('2d');
            ctx.fillStyle = '#ff0000';
            ctx.fillRect(0, 0, outputCanvas.width, outputCanvas.height);
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 16px JetBrains Mono';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('WebGPU Required', outputCanvas.width/2, outputCanvas.height/2);
            return outputCanvas;
        }
        
        // Use WebGPU for blending
        const success = await webGPURenderer.blend(bg, fg, outputCanvas, mode, mix);
        if (!success) {
            console.error('WebGPU blend failed');
        }
        
        return outputCanvas;
    }
}; 