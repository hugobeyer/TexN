export const checkerNode = {
    name: 'Checker',
    type: 'checker',
    color: 0x444444,
    outputs: ['color'],
    generateTexture: (ctx) => {
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, 256, 256);
        ctx.fillStyle = '#000';
        const size = 32;
        for (let x = 0; x < 256; x += size * 2) {
            for (let y = 0; y < 256; y += size * 2) {
                ctx.fillRect(x, y, size, size);
                ctx.fillRect(x + size, y + size, size, size);
            }
        }
    }
}; 