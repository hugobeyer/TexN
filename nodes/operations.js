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

export const multiplyNode = { name: 'Multiply', type: 'multiply', color: 0x444444, inputs: ['a', 'b'], outputs: ['result'], generateTexture: defaultTexture };
export const addNode = { name: 'Add', type: 'add', color: 0x444444, inputs: ['a', 'b'], outputs: ['result'], generateTexture: defaultTexture };
export const divideNode = { name: 'Divide', type: 'divide', color: 0x444444, inputs: ['a', 'b'], outputs: ['result'], generateTexture: defaultTexture };
export const subtractNode = { name: 'Subtract', type: 'subtract', color: 0x444444, inputs: ['a', 'b'], outputs: ['result'], generateTexture: defaultTexture };
export const differenceNode = { name: 'Difference', type: 'difference', color: 0x444444, inputs: ['a', 'b'], outputs: ['result'], generateTexture: defaultTexture };
export const exclusionNode = { name: 'Exclusion', type: 'exclusion', color: 0x444444, inputs: ['a', 'b'], outputs: ['result'], generateTexture: defaultTexture };
export const overlayNode = { name: 'Overlay', type: 'overlay', color: 0x444444, inputs: ['a', 'b'], outputs: ['result'], generateTexture: defaultTexture };
export const addsubNode = { name: 'Add/Sub', type: 'addsub', color: 0x444444, inputs: ['a', 'b'], outputs: ['result'], generateTexture: defaultTexture }; 