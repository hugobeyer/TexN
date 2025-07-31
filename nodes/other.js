const defaultTexture = (ctx) => {
    ctx.fillStyle = '#333';
    ctx.fillRect(0, 0, 256, 256);
    ctx.strokeStyle = '#666';
    ctx.lineWidth = 2;
    for (let i = 0; i < 256; i += 16) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, 256);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(256, i);
        ctx.stroke();
    }
};

export const distortNode = { name: 'Distort', type: 'distort', color: 0x444444, inputs: ['input', 'distortion'], outputs: ['output'], generateTexture: defaultTexture };
export const dxdyNode = { name: 'DXDY Offset', type: 'dxdy', color: 0x444444, inputs: ['input'], outputs: ['output'], generateTexture: defaultTexture };
export const containerNode = { name: 'Container', type: 'container', color: 0x444444, inputs: ['input'], outputs: ['output'], generateTexture: defaultTexture }; 