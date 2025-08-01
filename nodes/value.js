export const valueNode = {
    name: 'Value',
    type: 'value',
    color: 0x444444,
    category: 'CN',
    outputs: ['value'],
    parameters: {
        value: {
            type: 'float',
            label: 'Value',
            min: 0,
            max: 1,
            step: 0.01,
            default: 0.5
        },
        remap: {
            type: 'bool',
            label: 'Remap',
            default: false
        },
        remapMin: {
            type: 'float',
            label: 'Remap Min',
            min: -10,
            max: 10,
            step: 0.1,
            default: 0
        },
        remapMax: {
            type: 'float',
            label: 'Remap Max',
            min: -10,
            max: 10,
            step: 0.1,
            default: 1
        }
    },
    generateTexture: (ctx, parameters = {}) => {
        const {
            value = 0.5,
            remap = false,
            remapMin = 0,
            remapMax = 1
        } = parameters;
        
        const width = 256;
        const height = 256;
        
        // Calculate final value
        let finalValue = value;
        if (remap) {
            finalValue = remapMin + (remapMax - remapMin) * value;
        }
        
        // Convert to grayscale (0-255)
        const grayValue = Math.floor(Math.max(0, Math.min(1, finalValue)) * 255);
        const color = `rgb(${grayValue}, ${grayValue}, ${grayValue})`;
        
        // Fill with solid gray value
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, width, height);
        
        // Add info text
        ctx.fillStyle = grayValue > 128 ? '#000' : '#fff';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`VALUE`, width / 2, height / 2 - 20);
        ctx.fillText(`${finalValue.toFixed(3)}`, width / 2, height / 2);
        ctx.fillText(`Gray: ${grayValue}`, width / 2, height / 2 + 20);
        
        // Add gradient bar at bottom
        const barHeight = 20;
        const barY = height - barHeight - 10;
        const gradient = ctx.createLinearGradient(20, 0, width - 20, 0);
        gradient.addColorStop(0, '#000');
        gradient.addColorStop(1, '#fff');
        ctx.fillStyle = gradient;
        ctx.fillRect(20, barY, width - 40, barHeight);
        
        // Add marker for current value
        const markerX = 20 + (width - 40) * value;
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(markerX - 2, barY - 5, 4, barHeight + 10);
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