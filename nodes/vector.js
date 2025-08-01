export const vectorNode = {
    name: 'Vector',
    type: 'vector',
    color: 0x444444,
    category: 'CN',
    outputs: ['vector'],
    parameters: {
        x: {
            type: 'float',
            label: 'X',
            min: -1,
            max: 1,
            step: 0.01,
            default: 0
        },
        y: {
            type: 'float',
            label: 'Y',
            min: -1,
            max: 1,
            step: 0.01,
            default: 0
        },
        length: {
            type: 'float',
            label: 'Length',
            min: 0,
            max: 2,
            step: 0.01,
            default: 1
        },
        angle: {
            type: 'float',
            label: 'Angle',
            min: 0,
            max: 360,
            step: 1,
            default: 0
        },
        mode: {
            type: 'dropdown',
            label: 'Mode',
            options: ['xy', 'polar'],
            default: 'xy'
        }
    },
    generateTexture: (ctx, parameters = {}) => {
        const {
            x = 0,
            y = 0,
            length = 1,
            angle = 0,
            mode = 'xy'
        } = parameters;
        
        const width = 256;
        const height = 256;
        const centerX = width / 2;
        const centerY = height / 2;
        
        // Calculate final vector
        let finalX = x;
        let finalY = y;
        
        if (mode === 'polar') {
            const angleRad = (angle * Math.PI) / 180;
            finalX = Math.cos(angleRad) * length;
            finalY = Math.sin(angleRad) * length;
        }
        
        // Normalize to 0-1 range for color mapping
        const normalizedX = (finalX + 1) / 2;
        const normalizedY = (finalY + 1) / 2;
        
        // Create vector field visualization
        const imageData = ctx.createImageData(width, height);
        
        for (let py = 0; py < height; py++) {
            for (let px = 0; px < width; px++) {
                const pixelIndex = (py * width + px) * 4;
                
                // Use X for red channel, Y for green channel
                const r = Math.floor(normalizedX * 255);
                const g = Math.floor(normalizedY * 255);
                const b = 128; // Constant blue
                
                imageData.data[pixelIndex] = r;
                imageData.data[pixelIndex + 1] = g;
                imageData.data[pixelIndex + 2] = b;
                imageData.data[pixelIndex + 3] = 255;
            }
        }
        
        ctx.putImageData(imageData, 0, 0);
        
        // Draw vector arrow
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        const arrowEndX = centerX + finalX * 60;
        const arrowEndY = centerY - finalY * 60; // Flip Y for screen coordinates
        ctx.lineTo(arrowEndX, arrowEndY);
        ctx.stroke();
        
        // Draw arrowhead
        const headLength = 15;
        const headAngle = Math.PI / 6;
        const vectorAngle = Math.atan2(arrowEndY - centerY, arrowEndX - centerX);
        
        ctx.beginPath();
        ctx.moveTo(arrowEndX, arrowEndY);
        ctx.lineTo(
            arrowEndX - headLength * Math.cos(vectorAngle - headAngle),
            arrowEndY - headLength * Math.sin(vectorAngle - headAngle)
        );
        ctx.moveTo(arrowEndX, arrowEndY);
        ctx.lineTo(
            arrowEndX - headLength * Math.cos(vectorAngle + headAngle),
            arrowEndY - headLength * Math.sin(vectorAngle + headAngle)
        );
        ctx.stroke();
        
        // Add info text
        ctx.fillStyle = '#fff';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 3;
        ctx.strokeText(`VECTOR`, width / 2, height - 40);
        ctx.fillText(`VECTOR`, width / 2, height - 40);
        ctx.strokeText(`X: ${finalX.toFixed(2)} Y: ${finalY.toFixed(2)}`, width / 2, height - 20);
        ctx.fillText(`X: ${finalX.toFixed(2)} Y: ${finalY.toFixed(2)}`, width / 2, height - 20);
    },
    
    process: async (inputs, parameters, webGPURenderer) => {
        const outputCanvas = document.createElement('canvas');
        outputCanvas.width = 256;
        outputCanvas.height = 256;
        const ctx = outputCanvas.getContext('2d');
        
        // Use the generateTexture function
        this.generateTexture(ctx, parameters);
        
        return outputCanvas;
    }
};