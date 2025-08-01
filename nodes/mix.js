export const mixNode = {
    name: 'Mix',
    type: 'mix',
    color: 0x444444,
    category: 'UN',
    inputs: ['a', 'b', 'factor'],
    outputs: ['result'],
    parameters: {
        factor: {
            type: 'float',
            label: 'Mix Factor',
            min: 0,
            max: 1,
            step: 0.01,
            default: 0.5
        },
        clamp: {
            type: 'bool',
            label: 'Clamp Result',
            default: true
        }
    },
    generateTexture: (ctx, parameters = {}) => {
        const { factor = 0.5, clamp = true } = parameters;
        
        const width = 256;
        const height = 256;
        
        // Create demonstration gradient A (red to black)
        const gradientA = ctx.createLinearGradient(0, 0, width, 0);
        gradientA.addColorStop(0, '#ff0000');
        gradientA.addColorStop(1, '#000000');
        
        // Create demonstration gradient B (blue to white)
        const gradientB = ctx.createLinearGradient(0, 0, width, 0);
        gradientB.addColorStop(0, '#0000ff');
        gradientB.addColorStop(1, '#ffffff');
        
        // Draw A on top half
        ctx.fillStyle = gradientA;
        ctx.fillRect(0, 0, width, height / 3);
        
        // Draw B on middle third
        ctx.fillStyle = gradientB;
        ctx.fillRect(0, height / 3, width, height / 3);
        
        // Draw mix result on bottom third
        const imageData = ctx.createImageData(width, height / 3);
        
        for (let y = 0; y < height / 3; y++) {
            for (let x = 0; x < width; x++) {
                const pixelIndex = (y * width + x) * 4;
                
                // Calculate A and B colors for this position
                const t = x / width;
                const rA = 255 * (1 - t);
                const gA = 0;
                const bA = 0;
                
                const rB = 255 * t;
                const gB = 255 * t;
                const bB = 255;
                
                // Mix the colors
                let rMix = rA * (1 - factor) + rB * factor;
                let gMix = gA * (1 - factor) + gB * factor;
                let bMix = bA * (1 - factor) + bB * factor;
                
                if (clamp) {
                    rMix = Math.max(0, Math.min(255, rMix));
                    gMix = Math.max(0, Math.min(255, gMix));
                    bMix = Math.max(0, Math.min(255, bMix));
                }
                
                imageData.data[pixelIndex] = rMix;
                imageData.data[pixelIndex + 1] = gMix;
                imageData.data[pixelIndex + 2] = bMix;
                imageData.data[pixelIndex + 3] = 255;
            }
        }
        
        ctx.putImageData(imageData, 0, height * 2 / 3);
        
        // Add labels
        ctx.fillStyle = '#fff';
        ctx.font = '12px Arial';
        ctx.textAlign = 'left';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 3;
        
        ctx.strokeText('A', 10, 20);
        ctx.fillText('A', 10, 20);
        
        ctx.strokeText('B', 10, height / 3 + 20);
        ctx.fillText('B', 10, height / 3 + 20);
        
        ctx.strokeText(`MIX ${(factor * 100).toFixed(0)}%`, 10, height * 2 / 3 + 20);
        ctx.fillText(`MIX ${(factor * 100).toFixed(0)}%`, 10, height * 2 / 3 + 20);
    },
    
    process: async (inputs, parameters, webGPURenderer) => {
        const { a, b } = inputs;
        const { factor = 0.5, clamp = true } = parameters;
        
        console.log('Mix processing with factor:', factor);
        
        if (!a || !b) {
            console.warn('Mix missing inputs - a:', !!a, 'b:', !!b);
            return null;
        }
        
        const outputCanvas = document.createElement('canvas');
        outputCanvas.width = 256;
        outputCanvas.height = 256;
        const ctx = outputCanvas.getContext('2d');
        
        // Get pixel data from both inputs
        const tempCanvasA = document.createElement('canvas');
        tempCanvasA.width = 256;
        tempCanvasA.height = 256;
        const tempCtxA = tempCanvasA.getContext('2d');
        tempCtxA.drawImage(a, 0, 0);
        const imageDataA = tempCtxA.getImageData(0, 0, 256, 256);
        
        const tempCanvasB = document.createElement('canvas');
        tempCanvasB.width = 256;
        tempCanvasB.height = 256;
        const tempCtxB = tempCanvasB.getContext('2d');
        tempCtxB.drawImage(b, 0, 0);
        const imageDataB = tempCtxB.getImageData(0, 0, 256, 256);
        
        // Create output image data
        const outputImageData = ctx.createImageData(256, 256);
        
        // Mix the pixels: result = A * (1-factor) + B * factor
        for (let i = 0; i < imageDataA.data.length; i += 4) {
            const rA = imageDataA.data[i];
            const gA = imageDataA.data[i + 1];
            const bA = imageDataA.data[i + 2];
            const aA = imageDataA.data[i + 3];
            
            const rB = imageDataB.data[i];
            const gB = imageDataB.data[i + 1];
            const bB = imageDataB.data[i + 2];
            const aB = imageDataB.data[i + 3];
            
            // Linear interpolation: A * (1-t) + B * t
            let rOut = rA * (1 - factor) + rB * factor;
            let gOut = gA * (1 - factor) + gB * factor;
            let bOut = bA * (1 - factor) + bB * factor;
            let aOut = aA * (1 - factor) + aB * factor;
            
            if (clamp) {
                rOut = Math.max(0, Math.min(255, rOut));
                gOut = Math.max(0, Math.min(255, gOut));
                bOut = Math.max(0, Math.min(255, bOut));
                aOut = Math.max(0, Math.min(255, aOut));
            }
            
            outputImageData.data[i] = rOut;
            outputImageData.data[i + 1] = gOut;
            outputImageData.data[i + 2] = bOut;
            outputImageData.data[i + 3] = aOut;
        }
        
        ctx.putImageData(outputImageData, 0, 0);
        
        return outputCanvas;
    }
};