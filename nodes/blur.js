export const blurNode = {
    name: 'Blur',
    type: 'blur',
    color: 0x444444,
    category: 'FX',
    inputs: ['input'],
    outputs: ['output'],
    parameters: {
        radius: {
            type: 'float',
            label: 'Radius',
            min: 0,
            max: 20,
            step: 0.1,
            default: 2.0
        },
        type: {
            type: 'dropdown',
            label: 'Type',
            options: ['gaussian', 'box', 'motion'],
            default: 'gaussian'
        },
        direction: {
            type: 'float',
            label: 'Direction',
            min: 0,
            max: 360,
            step: 1,
            default: 0
        },
        quality: {
            type: 'dropdown',
            label: 'Quality',
            options: ['low', 'medium', 'high'],
            default: 'medium'
        }
    },
    generateTexture: (ctx, parameters = {}) => {
        const {
            radius = 2.0,
            type = 'gaussian',
            direction = 0,
            quality = 'medium'
        } = parameters;
        
        const width = 256;
        const height = 256;
        
        // Create a test pattern with sharp edges
        const sourceCanvas = document.createElement('canvas');
        sourceCanvas.width = width;
        sourceCanvas.height = height;
        const sourceCtx = sourceCanvas.getContext('2d');
        
        // White background
        sourceCtx.fillStyle = '#fff';
        sourceCtx.fillRect(0, 0, width, height);
        
        // Black shapes with sharp edges
        sourceCtx.fillStyle = '#000';
        sourceCtx.fillRect(50, 50, 60, 60);
        
        sourceCtx.beginPath();
        sourceCtx.arc(180, 80, 30, 0, Math.PI * 2);
        sourceCtx.fill();
        
        // Diagonal line
        sourceCtx.strokeStyle = '#000';
        sourceCtx.lineWidth = 4;
        sourceCtx.beginPath();
        sourceCtx.moveTo(30, 150);
        sourceCtx.lineTo(200, 200);
        sourceCtx.stroke();
        
        // Text
        sourceCtx.fillStyle = '#000';
        sourceCtx.font = 'bold 24px Arial';
        sourceCtx.fillText('BLUR', 120, 180);
        
        const sourceImageData = sourceCtx.getImageData(0, 0, width, height);
        const outputImageData = ctx.createImageData(width, height);
        
        // Apply blur effect
        const blurRadius = Math.max(1, radius);
        const samples = quality === 'low' ? 9 : quality === 'medium' ? 25 : 49;
        const kernelSize = Math.floor(Math.sqrt(samples));
        
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const pixelIndex = (y * width + x) * 4;
                
                let r = 0, g = 0, b = 0, a = 0;
                let totalWeight = 0;
                
                // Sample surrounding pixels
                const halfKernel = Math.floor(kernelSize / 2);
                
                for (let ky = -halfKernel; ky <= halfKernel; ky++) {
                    for (let kx = -halfKernel; kx <= halfKernel; kx++) {
                        let sampleX, sampleY;
                        
                        switch (type) {
                            case 'gaussian':
                                sampleX = x + kx * (blurRadius / halfKernel);
                                sampleY = y + ky * (blurRadius / halfKernel);
                                break;
                                
                            case 'box':
                                sampleX = x + kx * (blurRadius / halfKernel);
                                sampleY = y + ky * (blurRadius / halfKernel);
                                break;
                                
                            case 'motion':
                                const motionX = Math.cos(direction * Math.PI / 180) * kx * (blurRadius / halfKernel);
                                const motionY = Math.sin(direction * Math.PI / 180) * ky * (blurRadius / halfKernel);
                                sampleX = x + motionX;
                                sampleY = y + motionY;
                                break;
                                
                            default:
                                sampleX = x + kx;
                                sampleY = y + ky;
                        }
                        
                        const sx = Math.floor(sampleX);
                        const sy = Math.floor(sampleY);
                        
                        if (sx >= 0 && sx < width && sy >= 0 && sy < height) {
                            const sampleIndex = (sy * width + sx) * 4;
                            
                            // Calculate weight based on blur type
                            let weight = 1;
                            if (type === 'gaussian') {
                                const distance = Math.sqrt(kx * kx + ky * ky);
                                weight = Math.exp(-(distance * distance) / (2 * (blurRadius / 3) * (blurRadius / 3)));
                            }
                            
                            r += sourceImageData.data[sampleIndex] * weight;
                            g += sourceImageData.data[sampleIndex + 1] * weight;
                            b += sourceImageData.data[sampleIndex + 2] * weight;
                            a += sourceImageData.data[sampleIndex + 3] * weight;
                            totalWeight += weight;
                        }
                    }
                }
                
                if (totalWeight > 0) {
                    outputImageData.data[pixelIndex] = r / totalWeight;
                    outputImageData.data[pixelIndex + 1] = g / totalWeight;
                    outputImageData.data[pixelIndex + 2] = b / totalWeight;
                    outputImageData.data[pixelIndex + 3] = a / totalWeight;
                } else {
                    // Fallback to original pixel
                    outputImageData.data[pixelIndex] = sourceImageData.data[pixelIndex];
                    outputImageData.data[pixelIndex + 1] = sourceImageData.data[pixelIndex + 1];
                    outputImageData.data[pixelIndex + 2] = sourceImageData.data[pixelIndex + 2];
                    outputImageData.data[pixelIndex + 3] = sourceImageData.data[pixelIndex + 3];
                }
            }
        }
        
        ctx.putImageData(outputImageData, 0, 0);
        
        // Add info text
        ctx.fillStyle = '#666';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`${type.toUpperCase()} BLUR r=${radius.toFixed(1)}`, width / 2, height - 10);
    },
    
    process: async (inputs, parameters, webGPURenderer) => {
        const { input } = inputs;
        const { radius = 2.0, type = 'gaussian' } = parameters;
        
        if (!input) {
            console.warn('Blur missing input');
            return null;
        }
        
        const outputCanvas = document.createElement('canvas');
        outputCanvas.width = 256;
        outputCanvas.height = 256;
        const ctx = outputCanvas.getContext('2d');
        
        // For now, use a simple canvas filter for blur
        ctx.filter = `blur(${radius}px)`;
        ctx.drawImage(input, 0, 0);
        ctx.filter = 'none';
        
        return outputCanvas;
    }
};