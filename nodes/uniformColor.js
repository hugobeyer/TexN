export const uniformColorNode = {
    name: 'Uniform Color',
    type: 'uniformColor',
    color: 0x444444,
    outputs: ['color'],
    generateTexture: (ctx) => {
        const gradient = ctx.createLinearGradient(0, 0, 256, 256);
        gradient.addColorStop(0, '#4a90e2');
        gradient.addColorStop(1, '#50c878');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 256, 256);
    }
}; 