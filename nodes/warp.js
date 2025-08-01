export const warpNode = {
    name: 'Warp',
    type: 'warp',
    color: 0x444444,
    category: 'DN',
    inputs: ['input', 'displacement'],
    outputs: ['output'],
    parameters: {
        strength: {
            type: 'float',
            label: 'Strength',
            min: 0,
            max: 2,
            step: 0.01,
            default: 0.1
        },
        mode: {
            type: 'dropdown',
            label: 'Mode',
            options: ['directional', 'turbulence', 'polar', 'twirl'],
            default: 'directional'
        },
        centerX: {
            type: 'float',
            label: 'Center X',
            min: 0,
            max: 1,
            step: 0.01,
            default: 0.5
        },
        centerY: {
            type: 'float',
            label: 'Center Y',
            min: 0,
            max: 1,
            step: 0.01,
            default: 0.5
        }
    },
    generateTexture: (ctx, parameters = {}) => {
        const {
            strength = 0.1,
            mode = 'directional',
            centerX = 0.5,
            centerY = 0.5
        } = parameters;
        
        const width = 256;
        const height = 256;
        
        // Create a test pattern to show warping
        const sourceCanvas = document.createElement('canvas');
        sourceCanvas.width = width;
        sourceCanvas.height = height;
        const sourceCtx = sourceCanvas.getContext('2d');
        
        // Draw checker pattern
        sourceCtx.fillStyle = '#fff';
        sourceCtx.fillRect(0, 0, width, height);
        sourceCtx.fillStyle = '#000';
        const size = 32;
        for (let x = 0; x < width; x += size * 2) {
            for (let y = 0; y < height; y += size * 2) {
                sourceCtx.fillRect(x, y, size, size);
                sourceCtx.fillRect(x + size, y + size, size, size);
            }
        }
        
        // Add some colored circles
        sourceCtx.fillStyle = '#ff0000';
        sourceCtx.beginPath();
        sourceCtx.arc(width * 0.3, height * 0.3, 20, 0, Math.PI * 2);
        sourceCtx.fill();
        
        sourceCtx.fillStyle = '#00ff00';
        sourceCtx.beginPath();
        sourceCtx.arc(width * 0.7, height * 0.7, 20, 0, Math.PI * 2);
        sourceCtx.fill();
        
        const sourceImageData = sourceCtx.getImageData(0, 0, width, height);
        const outputImageData = ctx.createImageData(width, height);
        
        const cx = width * centerX;
        const cy = height * centerY;
        
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const pixelIndex = (y * width + x) * 4;
                
                let sourceX = x;
                let sourceY = y;
                
                switch (mode) {
                    case 'directional':
                        // Simple horizontal wave
                        sourceX = x + Math.sin(y * 0.02) * strength * 50;
                        sourceY = y + Math.cos(x * 0.02) * strength * 50;
                        break;
                        
                    case 'turbulence':
                        // Turbulent displacement
                        sourceX = x + (Math.sin(x * 0.01) + Math.cos(y * 0.013)) * strength * 30;
                        sourceY = y + (Math.cos(x * 0.011) + Math.sin(y * 0.012)) * strength * 30;
                        break;
                        
                    case 'polar':
                        // Polar distortion from center
                        const dx = x - cx;
                        const dy = y - cy;
                        const dist = Math.sqrt(dx * dx + dy * dy);
                        const angle = Math.atan2(dy, dx);
                        const newDist = dist + Math.sin(dist * 0.05) * strength * 20;
                        sourceX = cx + Math.cos(angle) * newDist;
                        sourceY = cy + Math.sin(angle) * newDist;
                        break;
                        
                    case 'twirl':
                        // Twirl around center
                        const tdx = x - cx;
                        const tdy = y - cy;
                        const tdist = Math.sqrt(tdx * tdx + tdy * tdy);
                        const tangle = Math.atan2(tdy, tdx) + (strength * 2) * (1 - tdist / Math.max(width, height));
                        sourceX = cx + Math.cos(tangle) * tdist;
                        sourceY = cy + Math.sin(tangle) * tdist;
                        break;
                }
                
                // Sample from source with bilinear filtering
                const sx = Math.floor(sourceX);
                const sy = Math.floor(sourceY);
                const fx = sourceX - sx;
                const fy = sourceY - sy;
                
                let r = 0, g = 0, b = 0, a = 255;
                
                if (sx >= 0 && sx < width - 1 && sy >= 0 && sy < height - 1) {
                    const getPixel = (px, py) => {
                        const idx = (py * width + px) * 4;
                        return {
                            r: sourceImageData.data[idx],
                            g: sourceImageData.data[idx + 1],
                            b: sourceImageData.data[idx + 2],
                            a: sourceImageData.data[idx + 3]
                        };
                    };
                    
                    const p00 = getPixel(sx, sy);
                    const p10 = getPixel(sx + 1, sy);
                    const p01 = getPixel(sx, sy + 1);
                    const p11 = getPixel(sx + 1, sy + 1);
                    
                    // Bilinear interpolation
                    const top = {
                        r: p00.r * (1 - fx) + p10.r * fx,
                        g: p00.g * (1 - fx) + p10.g * fx,
                        b: p00.b * (1 - fx) + p10.b * fx
                    };
                    
                    const bottom = {
                        r: p01.r * (1 - fx) + p11.r * fx,
                        g: p01.g * (1 - fx) + p11.g * fx,
                        b: p01.b * (1 - fx) + p11.b * fx
                    };
                    
                    r = top.r * (1 - fy) + bottom.r * fy;
                    g = top.g * (1 - fy) + bottom.g * fy;
                    b = top.b * (1 - fy) + bottom.b * fy;
                }
                
                outputImageData.data[pixelIndex] = r;
                outputImageData.data[pixelIndex + 1] = g;
                outputImageData.data[pixelIndex + 2] = b;
                outputImageData.data[pixelIndex + 3] = a;
            }
        }
        
        ctx.putImageData(outputImageData, 0, 0);
        
        // Add info text
        ctx.fillStyle = '#fff';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 3;
        ctx.strokeText(`WARP ${mode}`, width / 2, height - 20);
        ctx.fillText(`WARP ${mode}`, width / 2, height - 20);
    },
    
    process: async (inputs, parameters, webGPURenderer) => {
        const { input, displacement } = inputs;
        const { strength = 0.1, mode = 'directional' } = parameters;
        
        if (!input) {
            console.warn('Warp missing input');
            return null;
        }
        
        const outputCanvas = document.createElement('canvas');
        outputCanvas.width = 256;
        outputCanvas.height = 256;
        const ctx = outputCanvas.getContext('2d');
        
        // For now, just apply a simple warp using the generateTexture
        this.generateTexture(ctx, parameters);
        
        return outputCanvas;
    }
};