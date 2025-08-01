export const gradientNode = {
    name: 'Gradient',
    type: 'gradient',
    color: 0x444444,
    category: 'GN',
    outputs: ['color'],
    parameters: {
        type: {
            type: 'dropdown',
            label: 'Type',
            options: ['linear', 'radial', 'angular', 'diamond'],
            default: 'linear'
        },
        startColor: {
            type: 'color',
            label: 'Start Color',
            default: '#000000'
        },
        endColor: {
            type: 'color',
            label: 'End Color',
            default: '#ffffff'
        },
        angle: {
            type: 'float',
            label: 'Angle',
            min: 0,
            max: 360,
            step: 1,
            default: 0
        },
        centerX: {
            type: 'float',
            label: 'Center X',
            min: 0,
            max: 1,
            step: 0.01,
            default: 0.5
        },
        centerY: {
            type: 'float',
            label: 'Center Y',
            min: 0,
            max: 1,
            step: 0.01,
            default: 0.5
        },
        scale: {
            type: 'float',
            label: 'Scale',
            min: 0.1,
            max: 5,
            step: 0.1,
            default: 1.0
        }
    },
    generateTexture: (ctx, parameters = {}) => {
        const {
            type = 'linear',
            startColor = '#000000',
            endColor = '#ffffff',
            angle = 0,
            centerX = 0.5,
            centerY = 0.5,
            scale = 1.0
        } = parameters;
        
        const width = 256;
        const height = 256;
        const cx = width * centerX;
        const cy = height * centerY;
        
        let gradient;
        
        switch (type) {
            case 'linear':
                const angleRad = (angle * Math.PI) / 180;
                const x1 = cx - Math.cos(angleRad) * width * scale / 2;
                const y1 = cy - Math.sin(angleRad) * height * scale / 2;
                const x2 = cx + Math.cos(angleRad) * width * scale / 2;
                const y2 = cy + Math.sin(angleRad) * height * scale / 2;
                gradient = ctx.createLinearGradient(x1, y1, x2, y2);
                break;
                
            case 'radial':
                const radius = Math.max(width, height) * scale / 2;
                gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
                break;
                
            case 'angular':
                // Angular gradient approximation using conic gradient fallback
                gradient = ctx.createLinearGradient(0, 0, width, height);
                gradient.addColorStop(0, startColor);
                gradient.addColorStop(0.25, endColor);
                gradient.addColorStop(0.5, startColor);
                gradient.addColorStop(0.75, endColor);
                gradient.addColorStop(1, startColor);
                break;
                
            case 'diamond':
                // Diamond gradient approximation
                gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(width, height) * scale / 2);
                break;
                
            default:
                gradient = ctx.createLinearGradient(0, 0, width, height);
        }
        
        if (type !== 'angular') {
            gradient.addColorStop(0, startColor);
            gradient.addColorStop(1, endColor);
        }
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
        
        // Add info text
        ctx.fillStyle = '#fff';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 3;
        ctx.strokeText(`${type.toUpperCase()}`, width / 2, height - 20);
        ctx.fillText(`${type.toUpperCase()}`, width / 2, height - 20);
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