export const checkerNode = {
    name: 'Checker',
    type: 'checker',
    color: 0x444444,
    outputs: ['color'],
    parameters: {
        size: {
            type: 'int',
            label: 'Size',
            min: 8,
            max: 128,
            step: 8,
            default: 32
        },
        color1: {
            type: 'color',
            label: 'Color 1',
            default: '#ffffff'
        },
        color2: {
            type: 'color',
            label: 'Color 2',
            default: '#000000'
        }
    },
    generateTexture: (ctx, parameters = {}) => {
        const { size = 32, color1 = '#ffffff', color2 = '#000000' } = parameters;
        ctx.fillStyle = color1;
        ctx.fillRect(0, 0, 256, 256);
        ctx.fillStyle = color2;
        for (let x = 0; x < 256; x += size * 2) {
            for (let y = 0; y < 256; y += size * 2) {
                ctx.fillRect(x, y, size, size);
                ctx.fillRect(x + size, y + size, size, size);
            }
        }
    }
}; 