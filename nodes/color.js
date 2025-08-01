export const colorNode = {
    name: 'Color',
    type: 'color',
    color: 0x444444,
    category: 'CN',
    outputs: ['color'],
    parameters: {
        color: {
            type: 'color',
            label: 'Color',
            default: '#ff0000'
        },
        brightness: {
            type: 'float',
            label: 'Brightness',
            min: 0,
            max: 2,
            step: 0.01,
            default: 1.0
        },
        saturation: {
            type: 'float',
            label: 'Saturation',
            min: 0,
            max: 2,
            step: 0.01,
            default: 1.0
        },
        hueShift: {
            type: 'float',
            label: 'Hue Shift',
            min: -180,
            max: 180,
            step: 1,
            default: 0
        }
    },
    generateTexture: (ctx, parameters = {}) => {
        const {
            color = '#ff0000',
            brightness = 1.0,
            saturation = 1.0,
            hueShift = 0
        } = parameters;
        
        const width = 256;
        const height = 256;
        
        // Parse color
        const hex = color.replace('#', '');
        let r = parseInt(hex.substr(0, 2), 16);
        let g = parseInt(hex.substr(2, 2), 16);
        let b = parseInt(hex.substr(4, 2), 16);
        
        // Convert to HSL for adjustments
        const max = Math.max(r, g, b) / 255;
        const min = Math.min(r, g, b) / 255;
        const diff = max - min;
        const sum = max + min;
        
        let h = 0;
        if (diff !== 0) {
            if (max === r / 255) h = ((g / 255 - b / 255) / diff) % 6;
            else if (max === g / 255) h = (b / 255 - r / 255) / diff + 2;
            else h = (r / 255 - g / 255) / diff + 4;
        }
        h = h * 60;
        if (h < 0) h += 360;
        
        const l = sum / 2;
        const s = diff === 0 ? 0 : diff / (1 - Math.abs(2 * l - 1));
        
        // Apply adjustments
        h = (h + hueShift) % 360;
        if (h < 0) h += 360;
        const adjustedS = Math.max(0, Math.min(1, s * saturation));
        const adjustedL = Math.max(0, Math.min(1, l * brightness));
        
        // Convert back to RGB
        const c = (1 - Math.abs(2 * adjustedL - 1)) * adjustedS;
        const x = c * (1 - Math.abs((h / 60) % 2 - 1));
        const m = adjustedL - c / 2;
        
        let rFinal, gFinal, bFinal;
        if (h < 60) { rFinal = c; gFinal = x; bFinal = 0; }
        else if (h < 120) { rFinal = x; gFinal = c; bFinal = 0; }
        else if (h < 180) { rFinal = 0; gFinal = c; bFinal = x; }
        else if (h < 240) { rFinal = 0; gFinal = x; bFinal = c; }
        else if (h < 300) { rFinal = x; gFinal = 0; bFinal = c; }
        else { rFinal = c; gFinal = 0; bFinal = x; }
        
        rFinal = Math.round((rFinal + m) * 255);
        gFinal = Math.round((gFinal + m) * 255);
        bFinal = Math.round((bFinal + m) * 255);
        
        const finalColor = `rgb(${rFinal}, ${gFinal}, ${bFinal})`;
        
        // Fill with solid color
        ctx.fillStyle = finalColor;
        ctx.fillRect(0, 0, width, height);
        
        // Add info text
        ctx.fillStyle = rFinal + gFinal + bFinal > 384 ? '#000' : '#fff';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`COLOR`, width / 2, height / 2 - 10);
        ctx.fillText(`${color}`, width / 2, height / 2 + 10);
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