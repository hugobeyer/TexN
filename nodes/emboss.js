export const embossNode = {
    name: 'Emboss',
    type: 'emboss',
    color: 0x444444,
    category: 'FX',
    inputs: ['input'],
    outputs: ['output'],
    parameters: {
        strength: {
            type: 'float',
            label: 'Strength',
            min: 0,
            max: 3,
            step: 0.1,
            default: 1.0
        },
        direction: {
            type: 'float',
            label: 'Direction',
            min: 0,
            max: 360,
            step: 1,
            default: 45
        },
        depth: {
            type: 'float',
            label: 'Depth',
            min: 0.1,
            max: 3,
            step: 0.1,
            default: 1.0
        },
        type: {
            type: 'dropdown',
            label: 'Type',
            options: ['standard', 'outline', 'bevel'],
            default: 'standard'
        }
    },
    generateTexture: (ctx, parameters = {}) => {
        const {
            strength = 1.0,
            direction = 45,
            depth = 1.0,
            type = 'standard'
        } = parameters;
        
        const width = 256;
        const height = 256;
        
        // Create a test pattern with various shapes
        const sourceCanvas = document.createElement('canvas');
        sourceCanvas.width = width;
        sourceCanvas.height = height;
        const sourceCtx = sourceCanvas.getContext('2d');
        
        // Gray background
        sourceCtx.fillStyle = '#808080';
        sourceCtx.fillRect(0, 0, width, height);
        
        // White shapes
        sourceCtx.fillStyle = '#ffffff';
        sourceCtx.fillRect(50, 50, 60, 60);
        
        sourceCtx.beginPath();
        sourceCtx.arc(180, 80, 30, 0, Math.PI * 2);
        sourceCtx.fill();
        
        // Black shape
        sourceCtx.fillStyle = '#000000';
        sourceCtx.beginPath();
        sourceCtx.arc(80, 180, 25, 0, Math.PI * 2);
        sourceCtx.fill();
        
        // Text
        sourceCtx.fillStyle = '#cccccc';
        sourceCtx.font = 'bold 24px Arial';
        sourceCtx.fillText('3D', 140, 180);
        
        const sourceImageData = sourceCtx.getImageData(0, 0, width, height);
        const outputImageData = ctx.createImageData(width, height);
        
        // Convert direction to radians and calculate offset
        const angleRad = (direction * Math.PI) / 180;
        const offsetX = Math.round(Math.cos(angleRad) * depth);
        const offsetY = Math.round(Math.sin(angleRad) * depth);
        
        // Apply emboss effect
        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                const pixelIndex = (y * width + x) * 4;
                
                const getPixel = (px, py) => {
                    if (px < 0 || px >= width || py < 0 || py >= height) {
                        return { r: 128, g: 128, b: 128 }; // Gray for out of bounds
                    }
                    const idx = (py * width + px) * 4;
                    return {
                        r: sourceImageData.data[idx],
                        g: sourceImageData.data[idx + 1],
                        b: sourceImageData.data[idx + 2]
                    };
                };
                
                const current = getPixel(x, y);
                let r, g, b;
                
                switch (type) {
                    case 'standard':
                        // Standard emboss using offset sampling
                        const light = getPixel(x - offsetX, y - offsetY);
                        const shadow = getPixel(x + offsetX, y + offsetY);
                        
                        // Calculate luminance difference
                        const lightLum = (light.r + light.g + light.b) / 3;
                        const shadowLum = (shadow.r + shadow.g + shadow.b) / 3;
                        const diff = (lightLum - shadowLum) * strength;
                        
                        // Apply emboss effect
                        const embossValue = 128 + diff;
                        r = g = b = Math.max(0, Math.min(255, embossValue));
                        break;
                        
                    case 'outline':
                        // Edge detection for outline effect
                        const top = getPixel(x, y - 1);
                        const bottom = getPixel(x, y + 1);
                        const left = getPixel(x - 1, y);
                        const right = getPixel(x + 1, y);
                        
                        // Sobel edge detection
                        const gx = (top.r + 2 * current.r + bottom.r) - (left.r + 2 * current.r + right.r);
                        const gy = (left.r + 2 * current.r + right.r) - (top.r + 2 * current.r + bottom.r);
                        const edge = Math.sqrt(gx * gx + gy * gy) * strength;
                        
                        const outlineValue = 255 - Math.min(255, edge);
                        r = g = b = outlineValue;
                        break;
                        
                    case 'bevel':
                        // Bevel effect using gradient
                        const centerLum = (current.r + current.g + current.b) / 3;
                        
                        // Sample in light direction
                        const bevelLight = getPixel(x - offsetX, y - offsetY);
                        const bevelShadow = getPixel(x + offsetX, y + offsetY);
                        
                        const bevelLightLum = (bevelLight.r + bevelLight.g + bevelLight.b) / 3;
                        const bevelShadowLum = (bevelShadow.r + bevelShadow.g + bevelShadow.b) / 3;
                        
                        const bevelDiff = (bevelLightLum - bevelShadowLum) * strength * 0.5;
                        
                        // Apply to original color
                        r = Math.max(0, Math.min(255, current.r + bevelDiff));
                        g = Math.max(0, Math.min(255, current.g + bevelDiff));
                        b = Math.max(0, Math.min(255, current.b + bevelDiff));
                        break;
                        
                    default:
                        r = current.r;
                        g = current.g;
                        b = current.b;
                }
                
                outputImageData.data[pixelIndex] = r;
                outputImageData.data[pixelIndex + 1] = g;
                outputImageData.data[pixelIndex + 2] = b;
                outputImageData.data[pixelIndex + 3] = 255;
            }
        }
        
        // Handle edges by copying from source
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
        ctx.fillStyle = type === 'standard' ? '#fff' : '#000';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.strokeStyle = type === 'standard' ? '#000' : '#fff';
        ctx.lineWidth = 2;
        ctx.strokeText(`${type.toUpperCase()} ${direction}°`, width / 2, height - 10);
        ctx.fillText(`${type.toUpperCase()} ${direction}°`, width / 2, height - 10);
    },
    
    process: async (inputs, parameters, webGPURenderer) => {
        const { input } = inputs;
        const { strength = 1.0, direction = 45, type = 'standard' } = parameters;
        
        if (!input) {
            console.warn('Emboss missing input');
            return null;
        }
        
        const outputCanvas = document.createElement('canvas');
        outputCanvas.width = 256;
        outputCanvas.height = 256;
        const ctx = outputCanvas.getContext('2d');
        
        // Draw input first
        ctx.drawImage(input, 0, 0);
        
        // Apply emboss effect
        const imageData = ctx.getImageData(0, 0, outputCanvas.width, outputCanvas.height);
        const data = imageData.data;
        const width = imageData.width;
        const height = imageData.height;
        
        const tempData = new Uint8ClampedArray(data);
        
        // Simple emboss kernel based on direction
        const angleRad = (direction * Math.PI) / 180;
        const offsetX = Math.round(Math.cos(angleRad));
        const offsetY = Math.round(Math.sin(angleRad));
        
        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                const idx = (y * width + x) * 4;
                const lightIdx = ((y - offsetY) * width + (x - offsetX)) * 4;
                const shadowIdx = ((y + offsetY) * width + (x + offsetX)) * 4;
                
                if (lightIdx >= 0 && lightIdx < data.length && shadowIdx >= 0 && shadowIdx < data.length) {
                    for (let c = 0; c < 3; c++) { // RGB channels
                        const lightValue = tempData[lightIdx + c];
                        const shadowValue = tempData[shadowIdx + c];
                        const diff = (lightValue - shadowValue) * strength;
                        data[idx + c] = Math.max(0, Math.min(255, 128 + diff));
                    }
                }
            }
        }
        
        ctx.putImageData(imageData, 0, 0);
        
        return outputCanvas;
    }
};