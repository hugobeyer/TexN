export const sharpenNode = {
    name: 'Sharpen',
    type: 'sharpen',
    color: 0x444444,
    category: 'FX',
    inputs: ['input'],
    outputs: ['output'],
    parameters: {
        strength: {
            type: 'float',
            label: 'Strength',
            min: 0,
            max: 5,
            step: 0.1,
            default: 1.0
        },
        type: {
            type: 'dropdown',
            label: 'Type',
            options: ['laplacian', 'unsharp_mask', 'high_pass'],
            default: 'laplacian'
        },
        threshold: {
            type: 'float',
            label: 'Threshold',
            min: 0,
            max: 0.5,
            step: 0.01,
            default: 0.1
        }
    },
    generateTexture: (ctx, parameters = {}) => {
        const {
            strength = 1.0,
            type = 'laplacian',
            threshold = 0.1
        } = parameters;
        
        const width = 256;
        const height = 256;
        
        // Create a test pattern with soft edges that can be sharpened
        const sourceCanvas = document.createElement('canvas');
        sourceCanvas.width = width;
        sourceCanvas.height = height;
        const sourceCtx = sourceCanvas.getContext('2d');
        
        // Create a slightly blurred image first
        sourceCtx.fillStyle = '#888';
        sourceCtx.fillRect(0, 0, width, height);
        
        // Draw some shapes with gradients (soft edges)
        const gradient1 = sourceCtx.createRadialGradient(80, 80, 10, 80, 80, 40);
        gradient1.addColorStop(0, '#fff');
        gradient1.addColorStop(1, '#888');
        sourceCtx.fillStyle = gradient1;
        sourceCtx.fillRect(40, 40, 80, 80);
        
        const gradient2 = sourceCtx.createRadialGradient(180, 180, 20, 180, 180, 50);
        gradient2.addColorStop(0, '#000');
        gradient2.addColorStop(1, '#888');
        sourceCtx.fillStyle = gradient2;
        sourceCtx.beginPath();
        sourceCtx.arc(180, 180, 50, 0, Math.PI * 2);
        sourceCtx.fill();
        
        // Add some text with slight blur
        sourceCtx.filter = 'blur(1px)';
        sourceCtx.fillStyle = '#000';
        sourceCtx.font = 'bold 20px Arial';
        sourceCtx.fillText('SHARP', 130, 120);
        sourceCtx.filter = 'none';
        
        const sourceImageData = sourceCtx.getImageData(0, 0, width, height);
        const outputImageData = ctx.createImageData(width, height);
        
        // Apply sharpening filter
        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                const pixelIndex = (y * width + x) * 4;
                
                // Get surrounding pixels for convolution
                const getPixel = (px, py) => {
                    const idx = (py * width + px) * 4;
                    return {
                        r: sourceImageData.data[idx],
                        g: sourceImageData.data[idx + 1],
                        b: sourceImageData.data[idx + 2]
                    };
                };
                
                const center = getPixel(x, y);
                const top = getPixel(x, y - 1);
                const bottom = getPixel(x, y + 1);
                const left = getPixel(x - 1, y);
                const right = getPixel(x + 1, y);
                
                let r, g, b;
                
                switch (type) {
                    case 'laplacian':
                        // Laplacian kernel: [0,-1,0; -1,5,-1; 0,-1,0]
                        r = center.r * 5 - top.r - bottom.r - left.r - right.r;
                        g = center.g * 5 - top.g - bottom.g - left.g - right.g;
                        b = center.b * 5 - top.b - bottom.b - left.b - right.b;
                        
                        // Apply strength
                        r = center.r + (r - center.r) * strength;
                        g = center.g + (g - center.g) * strength;
                        b = center.b + (b - center.b) * strength;
                        break;
                        
                    case 'unsharp_mask':
                        // Calculate local average (blur)
                        const avgR = (center.r + top.r + bottom.r + left.r + right.r) / 5;
                        const avgG = (center.g + top.g + bottom.g + left.g + right.g) / 5;
                        const avgB = (center.b + top.b + bottom.b + left.b + right.b) / 5;
                        
                        // Unsharp mask: original + strength * (original - blurred)
                        r = center.r + strength * (center.r - avgR);
                        g = center.g + strength * (center.g - avgG);
                        b = center.b + strength * (center.b - avgB);
                        break;
                        
                    case 'high_pass':
                        // High pass filter
                        const hpR = center.r - (top.r + bottom.r + left.r + right.r) / 4;
                        const hpG = center.g - (top.g + bottom.g + left.g + right.g) / 4;
                        const hpB = center.b - (top.b + bottom.b + left.b + right.b) / 4;
                        
                        // Apply threshold and strength
                        const intensityR = Math.abs(hpR) / 255;
                        const intensityG = Math.abs(hpG) / 255;
                        const intensityB = Math.abs(hpB) / 255;
                        
                        r = intensityR > threshold ? center.r + hpR * strength : center.r;
                        g = intensityG > threshold ? center.g + hpG * strength : center.g;
                        b = intensityB > threshold ? center.b + hpB * strength : center.b;
                        break;
                        
                    default:
                        r = center.r;
                        g = center.g;
                        b = center.b;
                }
                
                // Clamp values
                outputImageData.data[pixelIndex] = Math.max(0, Math.min(255, r));
                outputImageData.data[pixelIndex + 1] = Math.max(0, Math.min(255, g));
                outputImageData.data[pixelIndex + 2] = Math.max(0, Math.min(255, b));
                outputImageData.data[pixelIndex + 3] = sourceImageData.data[pixelIndex + 3];
            }
        }
        
        // Copy edge pixels unchanged
        for (let x = 0; x < width; x++) {
            // Top and bottom rows
            for (let edge = 0; edge < 4; edge++) {
                outputImageData.data[x * 4 + edge] = sourceImageData.data[x * 4 + edge];
                outputImageData.data[((height - 1) * width + x) * 4 + edge] = 
                    sourceImageData.data[((height - 1) * width + x) * 4 + edge];
            }
        }
        
        for (let y = 0; y < height; y++) {
            // Left and right columns
            for (let edge = 0; edge < 4; edge++) {
                outputImageData.data[(y * width) * 4 + edge] = sourceImageData.data[(y * width) * 4 + edge];
                outputImageData.data[(y * width + width - 1) * 4 + edge] = 
                    sourceImageData.data[(y * width + width - 1) * 4 + edge];
            }
        }
        
        ctx.putImageData(outputImageData, 0, 0);
        
        // Add info text
        ctx.fillStyle = '#fff';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.strokeText(`${type.toUpperCase()} ${strength.toFixed(1)}x`, width / 2, height - 10);
        ctx.fillText(`${type.toUpperCase()} ${strength.toFixed(1)}x`, width / 2, height - 10);
    },
    
    process: async (inputs, parameters, webGPURenderer) => {
        const { input } = inputs;
        const { strength = 1.0, type = 'laplacian' } = parameters;
        
        if (!input) {
            console.warn('Sharpen missing input');
            return null;
        }
        
        const outputCanvas = document.createElement('canvas');
        outputCanvas.width = 256;
        outputCanvas.height = 256;
        const ctx = outputCanvas.getContext('2d');
        
        // For now, use the generateTexture method which includes the sharpening algorithm
        ctx.drawImage(input, 0, 0);
        
        // Apply simple sharpening using convolution
        const imageData = ctx.getImageData(0, 0, outputCanvas.width, outputCanvas.height);
        const data = imageData.data;
        const width = imageData.width;
        const height = imageData.height;
        
        // Simple sharpening kernel
        const sharpenKernel = [
            0, -1, 0,
            -1, 5, -1,
            0, -1, 0
        ];
        
        const tempData = new Uint8ClampedArray(data);
        
        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                const idx = (y * width + x) * 4;
                
                for (let c = 0; c < 3; c++) { // RGB channels
                    let sum = 0;
                    for (let ky = -1; ky <= 1; ky++) {
                        for (let kx = -1; kx <= 1; kx++) {
                            const kernelIdx = (ky + 1) * 3 + (kx + 1);
                            const pixelIdx = ((y + ky) * width + (x + kx)) * 4 + c;
                            sum += tempData[pixelIdx] * sharpenKernel[kernelIdx] * strength;
                        }
                    }
                    data[idx + c] = Math.max(0, Math.min(255, sum));
                }
            }
        }
        
        ctx.putImageData(imageData, 0, 0);
        
        return outputCanvas;
    }
};