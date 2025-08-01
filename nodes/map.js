export const mapNode = {
    name: 'Map',
    type: 'map',
    color: 0x444444,
    category: 'UN',
    inputs: ['input'],
    outputs: ['output'],
    parameters: {
        inputMin: {
            type: 'float',
            label: 'Input Min',
            min: -2,
            max: 2,
            step: 0.01,
            default: 0
        },
        inputMax: {
            type: 'float',
            label: 'Input Max',
            min: -2,
            max: 2,
            step: 0.01,
            default: 1
        },
        outputMin: {
            type: 'float',
            label: 'Output Min',
            min: -2,
            max: 2,
            step: 0.01,
            default: 0
        },
        outputMax: {
            type: 'float',
            label: 'Output Max',
            min: -2,
            max: 2,
            step: 0.01,
            default: 1
        },
        clamp: {
            type: 'bool',
            label: 'Clamp Output',
            default: true
        }
    },
    generateTexture: (ctx, parameters = {}) => {
        const {
            inputMin = 0,
            inputMax = 1,
            outputMin = 0,
            outputMax = 1,
            clamp = true
        } = parameters;
        
        const width = 256;
        const height = 256;
        
        // Create demonstration
        const imageData = ctx.createImageData(width, height);
        
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const pixelIndex = (y * width + x) * 4;
                
                // Input value from -0.5 to 1.5 (to show mapping)
                const inputValue = (x / width) * 2 - 0.5;
                
                // Map the value
                const normalizedInput = (inputValue - inputMin) / (inputMax - inputMin);
                let outputValue = outputMin + normalizedInput * (outputMax - outputMin);
                
                if (clamp) {
                    outputValue = Math.max(0, Math.min(1, outputValue));
                }
                
                // Show input on top half, output on bottom half
                const isTop = y < height / 2;
                const displayValue = isTop ? inputValue : outputValue;
                
                // Map to grayscale (0.5 = middle gray)
                const grayValue = Math.floor(Math.max(0, Math.min(1, displayValue * 0.5 + 0.5)) * 255);
                
                // Color coding
                let r = grayValue;
                let g = grayValue;
                let b = grayValue;
                
                // Blue tint for negative values
                if (displayValue < 0) {
                    b = Math.min(255, b + 100);
                }
                // Red tint for values > 1
                if (displayValue > 1) {
                    r = Math.min(255, r + 100);
                }
                
                imageData.data[pixelIndex] = r;
                imageData.data[pixelIndex + 1] = g;
                imageData.data[pixelIndex + 2] = b;
                imageData.data[pixelIndex + 3] = 255;
            }
        }
        
        ctx.putImageData(imageData, 0, 0);
        
        // Draw input range indicators
        const inputMinX = ((inputMin + 0.5) / 2) * width;
        const inputMaxX = ((inputMax + 0.5) / 2) * width;
        
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(inputMinX, 0);
        ctx.lineTo(inputMinX, height / 2);
        ctx.stroke();
        
        ctx.strokeStyle = '#ff00ff';
        ctx.beginPath();
        ctx.moveTo(inputMaxX, 0);
        ctx.lineTo(inputMaxX, height / 2);
        ctx.stroke();
        
        // Draw output range indicators
        const outputMinX = ((outputMin + 0.5) / 2) * width;
        const outputMaxX = ((outputMax + 0.5) / 2) * width;
        
        ctx.strokeStyle = '#ffff00';
        ctx.beginPath();
        ctx.moveTo(outputMinX, height / 2);
        ctx.lineTo(outputMinX, height);
        ctx.stroke();
        
        ctx.strokeStyle = '#00ffff';
        ctx.beginPath();
        ctx.moveTo(outputMaxX, height / 2);
        ctx.lineTo(outputMaxX, height);
        ctx.stroke();
        
        // Add labels
        ctx.fillStyle = '#fff';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        
        ctx.strokeText('INPUT', width / 2, 20);
        ctx.fillText('INPUT', width / 2, 20);
        
        ctx.strokeText('MAP', width / 2, height / 2 + 15);
        ctx.fillText('MAP', width / 2, height / 2 + 15);
        
        ctx.strokeText(`${inputMin.toFixed(1)}→${outputMin.toFixed(1)}`, width / 4, height - 10);
        ctx.fillText(`${inputMin.toFixed(1)}→${outputMin.toFixed(1)}`, width / 4, height - 10);
        
        ctx.strokeText(`${inputMax.toFixed(1)}→${outputMax.toFixed(1)}`, 3 * width / 4, height - 10);
        ctx.fillText(`${inputMax.toFixed(1)}→${outputMax.toFixed(1)}`, 3 * width / 4, height - 10);
    },
    
    process: async (inputs, parameters, webGPURenderer) => {
        const { input } = inputs;
        const {
            inputMin = 0,
            inputMax = 1,
            outputMin = 0,
            outputMax = 1,
            clamp = true
        } = parameters;
        
        if (!input) {
            console.warn('Map missing input');
            return null;
        }
        
        const outputCanvas = document.createElement('canvas');
        outputCanvas.width = 256;
        outputCanvas.height = 256;
        const ctx = outputCanvas.getContext('2d');
        
        // Draw input first
        ctx.drawImage(input, 0, 0);
        
        // Apply mapping operation
        const imageData = ctx.getImageData(0, 0, outputCanvas.width, outputCanvas.height);
        const inputRange = inputMax - inputMin;
        const outputRange = outputMax - outputMin;
        
        for (let i = 0; i < imageData.data.length; i += 4) {
            const r = imageData.data[i] / 255;
            const g = imageData.data[i + 1] / 255;
            const b = imageData.data[i + 2] / 255;
            
            // Map each channel
            const mapValue = (value) => {
                const normalized = (value - inputMin) / inputRange;
                let mapped = outputMin + normalized * outputRange;
                if (clamp) {
                    mapped = Math.max(0, Math.min(1, mapped));
                }
                return mapped;
            };
            
            const rOut = mapValue(r);
            const gOut = mapValue(g);
            const bOut = mapValue(b);
            
            imageData.data[i] = rOut * 255;
            imageData.data[i + 1] = gOut * 255;
            imageData.data[i + 2] = bOut * 255;
        }
        
        ctx.putImageData(imageData, 0, 0);
        
        return outputCanvas;
    }
};