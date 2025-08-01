export const clampNode = {
    name: 'Clamp',
    type: 'clamp',
    color: 0x444444,
    category: 'UN',
    inputs: ['input'],
    outputs: ['output'],
    parameters: {
        min: {
            type: 'float',
            label: 'Min',
            min: 0,
            max: 1,
            step: 0.01,
            default: 0
        },
        max: {
            type: 'float',
            label: 'Max',
            min: 0,
            max: 1,
            step: 0.01,
            default: 1
        },
        mode: {
            type: 'dropdown',
            label: 'Mode',
            options: ['clamp', 'wrap', 'mirror'],
            default: 'clamp'
        }
    },
    generateTexture: (ctx, parameters = {}) => {
        const { min = 0, max = 1, mode = 'clamp' } = parameters;
        
        const width = 256;
        const height = 256;
        
        // Create demonstration - input gradient from 0 to 1
        const imageData = ctx.createImageData(width, height);
        
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const pixelIndex = (y * width + x) * 4;
                
                // Input value from 0 to 1.5 (to show clamping)
                const inputValue = (x / width) * 1.5;
                let outputValue = inputValue;
                
                switch (mode) {
                    case 'clamp':
                        outputValue = Math.max(min, Math.min(max, inputValue));
                        break;
                        
                    case 'wrap':
                        if (inputValue < min) {
                            outputValue = max - ((min - inputValue) % (max - min));
                        } else if (inputValue > max) {
                            outputValue = min + ((inputValue - max) % (max - min));
                        } else {
                            outputValue = inputValue;
                        }
                        break;
                        
                    case 'mirror':
                        const range = max - min;
                        if (inputValue < min) {
                            const excess = min - inputValue;
                            const cycles = Math.floor(excess / range);
                            const remainder = excess % range;
                            outputValue = cycles % 2 === 0 ? min + remainder : max - remainder;
                        } else if (inputValue > max) {
                            const excess = inputValue - max;
                            const cycles = Math.floor(excess / range);
                            const remainder = excess % range;
                            outputValue = cycles % 2 === 0 ? max - remainder : min + remainder;
                        } else {
                            outputValue = inputValue;
                        }
                        break;
                }
                
                // Map to color - show input on top half, output on bottom half
                const isTop = y < height / 2;
                const value = isTop ? inputValue : outputValue;
                const grayValue = Math.floor(Math.max(0, Math.min(1, value)) * 255);
                
                // Color code: red for clamped areas, normal gray otherwise
                let r = grayValue;
                let g = grayValue;
                let b = grayValue;
                
                if (!isTop && mode === 'clamp') {
                    if (inputValue < min || inputValue > max) {
                        r = Math.min(255, grayValue + 100); // Red tint for clamped areas
                    }
                }
                
                imageData.data[pixelIndex] = r;
                imageData.data[pixelIndex + 1] = g;
                imageData.data[pixelIndex + 2] = b;
                imageData.data[pixelIndex + 3] = 255;
            }
        }
        
        ctx.putImageData(imageData, 0, 0);
        
        // Draw min/max indicators
        const minX = (min / 1.5) * width;
        const maxX = (max / 1.5) * width;
        
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(minX, 0);
        ctx.lineTo(minX, height);
        ctx.stroke();
        
        ctx.strokeStyle = '#ff00ff';
        ctx.beginPath();
        ctx.moveTo(maxX, 0);
        ctx.lineTo(maxX, height);
        ctx.stroke();
        
        // Add labels
        ctx.fillStyle = '#fff';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 3;
        
        ctx.strokeText('INPUT', width / 2, 30);
        ctx.fillText('INPUT', width / 2, 30);
        
        ctx.strokeText(`${mode.toUpperCase()}`, width / 2, height / 2 + 15);
        ctx.fillText(`${mode.toUpperCase()}`, width / 2, height / 2 + 15);
        
        ctx.strokeText(`Min: ${min.toFixed(2)} Max: ${max.toFixed(2)}`, width / 2, height - 15);
        ctx.fillText(`Min: ${min.toFixed(2)} Max: ${max.toFixed(2)}`, width / 2, height - 15);
    },
    
    process: async (inputs, parameters, webGPURenderer) => {
        const { input } = inputs;
        const { min = 0, max = 1, mode = 'clamp' } = parameters;
        
        if (!input) {
            console.warn('Clamp missing input');
            return null;
        }
        
        const outputCanvas = document.createElement('canvas');
        outputCanvas.width = 256;
        outputCanvas.height = 256;
        const ctx = outputCanvas.getContext('2d');
        
        // Draw input first
        ctx.drawImage(input, 0, 0);
        
        // Apply clamp operation (simplified CPU version)
        const imageData = ctx.getImageData(0, 0, outputCanvas.width, outputCanvas.height);
        
        for (let i = 0; i < imageData.data.length; i += 4) {
            const r = imageData.data[i] / 255;
            const g = imageData.data[i + 1] / 255;
            const b = imageData.data[i + 2] / 255;
            
            let rOut = r, gOut = g, bOut = b;
            
            switch (mode) {
                case 'clamp':
                    rOut = Math.max(min, Math.min(max, r));
                    gOut = Math.max(min, Math.min(max, g));
                    bOut = Math.max(min, Math.min(max, b));
                    break;
                    
                case 'wrap':
                    rOut = min + ((r - min) % (max - min));
                    gOut = min + ((g - min) % (max - min));
                    bOut = min + ((b - min) % (max - min));
                    break;
                    
                case 'mirror':
                    const range = max - min;
                    const mirrorValue = (value) => {
                        if (value < min || value > max) {
                            const excess = value < min ? min - value : value - max;
                            const cycles = Math.floor(excess / range);
                            const remainder = excess % range;
                            return value < min ? 
                                (cycles % 2 === 0 ? min + remainder : max - remainder) :
                                (cycles % 2 === 0 ? max - remainder : min + remainder);
                        }
                        return value;
                    };
                    rOut = mirrorValue(r);
                    gOut = mirrorValue(g);
                    bOut = mirrorValue(b);
                    break;
            }
            
            imageData.data[i] = rOut * 255;
            imageData.data[i + 1] = gOut * 255;
            imageData.data[i + 2] = bOut * 255;
        }
        
        ctx.putImageData(imageData, 0, 0);
        
        return outputCanvas;
    }
};