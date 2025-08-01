export const bendNode = {
    name: 'Bend',
    type: 'bend',
    color: 0x444444,
    category: 'DN',
    inputs: ['input'],
    outputs: ['output'],
    parameters: {
        strength: {
            type: 'float',
            label: 'Strength',
            min: -2,
            max: 2,
            step: 0.01,
            default: 0.5
        },
        direction: {
            type: 'dropdown',
            label: 'Direction',
            options: ['horizontal', 'vertical', 'radial'],
            default: 'horizontal'
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
        },
        frequency: {
            type: 'float',
            label: 'Frequency',
            min: 0.1,
            max: 10,
            step: 0.1,
            default: 1.0
        }
    },
    generateTexture: (ctx, parameters = {}) => {
        const {
            strength = 0.5,
            direction = 'horizontal',
            centerX = 0.5,
            centerY = 0.5,
            frequency = 1.0
        } = parameters;
        
        const width = 256;
        const height = 256;
        
        // Create a test pattern to show bending
        const sourceCanvas = document.createElement('canvas');
        sourceCanvas.width = width;
        sourceCanvas.height = height;
        const sourceCtx = sourceCanvas.getContext('2d');
        
        // Draw grid pattern
        sourceCtx.fillStyle = '#fff';
        sourceCtx.fillRect(0, 0, width, height);
        sourceCtx.strokeStyle = '#000';
        sourceCtx.lineWidth = 1;
        
        // Vertical lines
        for (let x = 0; x < width; x += 20) {
            sourceCtx.beginPath();
            sourceCtx.moveTo(x, 0);
            sourceCtx.lineTo(x, height);
            sourceCtx.stroke();
        }
        
        // Horizontal lines
        for (let y = 0; y < height; y += 20) {
            sourceCtx.beginPath();
            sourceCtx.moveTo(0, y);
            sourceCtx.lineTo(width, y);
            sourceCtx.stroke();
        }
        
        // Add some colored rectangles
        sourceCtx.fillStyle = '#ff0000';
        sourceCtx.fillRect(50, 50, 40, 40);
        sourceCtx.fillStyle = '#00ff00';
        sourceCtx.fillRect(150, 150, 40, 40);
        sourceCtx.fillStyle = '#0000ff';
        sourceCtx.fillRect(100, 180, 40, 40);
        
        const sourceImageData = sourceCtx.getImageData(0, 0, width, height);
        const outputImageData = ctx.createImageData(width, height);
        
        const cx = width * centerX;
        const cy = height * centerY;
        
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const pixelIndex = (y * width + x) * 4;
                
                let sourceX = x;
                let sourceY = y;
                
                switch (direction) {
                    case 'horizontal':
                        // Bend horizontally based on vertical position
                        const bendAmount = Math.sin((y / height) * Math.PI * frequency) * strength * 50;
                        sourceX = x + bendAmount;
                        break;
                        
                    case 'vertical':
                        // Bend vertically based on horizontal position
                        const vBendAmount = Math.sin((x / width) * Math.PI * frequency) * strength * 50;
                        sourceY = y + vBendAmount;
                        break;
                        
                    case 'radial':
                        // Radial bending from center
                        const dx = x - cx;
                        const dy = y - cy;
                        const distance = Math.sqrt(dx * dx + dy * dy);
                        const angle = Math.atan2(dy, dx);
                        
                        if (distance > 0) {
                            const bendFactor = Math.sin(distance * 0.02 * frequency) * strength * 20;
                            const newDistance = distance + bendFactor;
                            sourceX = cx + Math.cos(angle) * newDistance;
                            sourceY = cy + Math.sin(angle) * newDistance;
                        }
                        break;
                }
                
                // Sample from source with bilinear filtering
                const sx = Math.floor(sourceX);
                const sy = Math.floor(sourceY);
                const fx = sourceX - sx;
                const fy = sourceY - sy;
                
                let r = 255, g = 255, b = 255, a = 255; // Default to white
                
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
                } else if (sx >= 0 && sx < width && sy >= 0 && sy < height) {
                    // Edge case - just sample nearest
                    const idx = (sy * width + sx) * 4;
                    r = sourceImageData.data[idx];
                    g = sourceImageData.data[idx + 1];
                    b = sourceImageData.data[idx + 2];
                }
                
                outputImageData.data[pixelIndex] = r;
                outputImageData.data[pixelIndex + 1] = g;
                outputImageData.data[pixelIndex + 2] = b;
                outputImageData.data[pixelIndex + 3] = a;
            }
        }
        
        ctx.putImageData(outputImageData, 0, 0);
        
        // Draw center indicator for radial mode
        if (direction === 'radial') {
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(cx, cy, 5, 0, Math.PI * 2);
            ctx.stroke();
        }
        
        // Add info text
        ctx.fillStyle = '#fff';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 3;
        ctx.strokeText(`BEND ${direction}`, width / 2, height - 20);
        ctx.fillText(`BEND ${direction}`, width / 2, height - 20);
    },
    
    process: async (inputs, parameters, webGPURenderer) => {
        const { input } = inputs;
        const { strength = 0.5, direction = 'horizontal' } = parameters;
        
        if (!input) {
            console.warn('Bend missing input');
            return null;
        }
        
        const outputCanvas = document.createElement('canvas');
        outputCanvas.width = 256;
        outputCanvas.height = 256;
        const ctx = outputCanvas.getContext('2d');
        
        // For now, use the generateTexture method
        this.generateTexture(ctx, parameters);
        
        return outputCanvas;
    }
};