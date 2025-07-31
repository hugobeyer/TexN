export const testNode = {
    name: 'Test',
    type: 'test',
    color: 0x666666,
    inputs: ['input'],
    outputs: ['output'],
    parameters: {
        enabled: {
            type: 'bool',
            label: 'Enabled',
            default: true
        },
        strength: {
            type: 'float',
            label: 'Strength',
            min: 0,
            max: 2,
            default: 1.0
        },
        iterations: {
            type: 'int',
            label: 'Iterations',
            min: 1,
            max: 10,
            default: 3
        },
        name: {
            type: 'string',
            label: 'Name',
            default: 'test'
        },
        mode: {
            type: 'dropdown',
            label: 'Mode',
            options: ['simple', 'advanced', 'expert'],
            default: 'simple'
        }
    },
    generateTexture: (ctx, parameters = {}) => {
        // Simple test texture - just a colored square
        ctx.fillStyle = parameters.enabled ? '#00ff00' : '#ff0000';
        ctx.fillRect(0, 0, 256, 256);
        
        // Add some text showing the parameters
        ctx.fillStyle = '#ffffff';
        ctx.font = '16px monospace';
        ctx.fillText(`${parameters.name || 'test'}`, 10, 30);
        ctx.fillText(`Strength: ${(parameters.strength || 1).toFixed(2)}`, 10, 50);
        ctx.fillText(`Iterations: ${parameters.iterations || 3}`, 10, 70);
        ctx.fillText(`Mode: ${parameters.mode || 'simple'}`, 10, 90);
        ctx.fillText(`Enabled: ${parameters.enabled ? 'YES' : 'NO'}`, 10, 110);
        
        return ctx.canvas;
    },
    
    process: async (inputs) => {
        // For testing, just return a canvas
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');
        
        // Use the generateTexture function with current parameters
        return this.generateTexture(ctx, inputs.parameters || {});
    }
};