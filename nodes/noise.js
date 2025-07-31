export const noiseNode = {
    name: 'Noise',
    type: 'noise',
    color: 0x444444,
    outputs: ['color'],
    generateTexture: (ctx) => {
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