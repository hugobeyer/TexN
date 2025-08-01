export const noiseNode = {
    name: 'Noise',
    type: 'noise',
    color: 0x444444,
    outputs: ['color'],
    parameters: {
        scale: {
            type: 'float',
            label: 'Scale',
            min: 0.1,
            max: 10,
            step: 0.1,
            default: 1.0
        },
        seed: {
            type: 'int',
            label: 'Seed',
            min: 0,
            max: 1000,
            default: 42
        }
    },
    generateTexture: (ctx, parameters = {}) => {
        const { scale = 1.0, seed = 42 } = parameters;
        const imageData = ctx.createImageData(256, 256);
        for (let i = 0; i < imageData.data.length; i += 4) {
            const noise = Math.random() * 255;
            imageData.data[i] = noise;
            imageData.data[i + 1] = noise;
            imageData.data[i + 2] = noise;
            imageData.data[i + 3] = 255;
        }
        ctx.putImageData(imageData, 0, 0);
    }
}; 