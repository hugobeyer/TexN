export const twistNode = {
    name: 'Twist',
    type: 'twist',
    color: 0x444444,
    category: 'DN',
    inputs: ['input'],
    outputs: ['output'],
    parameters: {
        angle: {
            type: 'float',
            label: 'Angle',
            min: -720,
            max: 720,
            step: 1,
            default: 45
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
        falloff: {
            type: 'float',
            label: 'Falloff',
            min: 0.1,
            max: 2,
            step: 0.01,
            default: 1.0
        },
        radius: {
            type: 'float',
            label: 'Radius',
            min: 0.1,
            max: 2,
            step: 0.01,
            default: 0.5
        }
    },
    generateTexture: (ctx, parameters = {}) => {
        const {
            angle = 45,
            centerX = 0.5,
            centerY = 0.5,
            falloff = 1.0,
            radius = 0.5
        } = parameters;
        
        const width = 256;
        const height = 256;
        
        // Create a test pattern to show twisting
        const sourceCanvas = document.createElement('canvas');
        sourceCanvas.width = width;
        sourceCanvas.height = height;
        const sourceCtx = sourceCanvas.getContext('2d');
        
        // Draw radial pattern
        const gradient = sourceCtx.createRadialGradient(width/2, height/2, 0, width/2, height/2, width/2);
        gradient.addColorStop(0, '#fff');
        gradient.addColorStop(0.3, '#ff0000');
        gradient.addColorStop(0.6, '#00ff00');
        gradient.addColorStop(1, '#0000ff');
        sourceCtx.fillStyle = gradient;
        sourceCtx.fillRect(0, 0, width, height);
        
        // Add some lines to show the twist
        sourceCtx.strokeStyle = '#000';
        sourceCtx.lineWidth = 2;
        for (let i = 0; i < 8; i++) {
            const lineAngle = (i / 8) * Math.PI * 2;
            sourceCtx.beginPath();
            sourceCtx.moveTo(width/2, height/2);
            sourceCtx.lineTo(
                width/2 + Math.cos(lineAngle) * width/2,
                height/2 + Math.sin(lineAngle) * height/2
            );
            sourceCtx.stroke();
        }
        
        const sourceImageData = sourceCtx.getImageData(0, 0, width, height);
        const outputImageData = ctx.createImageData(width, height);
        
        const cx = width * centerX;
        const cy = height * centerY;
        const maxRadius = Math.max(width, height) * radius;
        const angleRad = (angle * Math.PI) / 180;
        
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const pixelIndex = (y * width + x) * 4;
                
                // Calculate distance from center
                const dx = x - cx;
                const dy = y - cy;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                let sourceX = x;
                let sourceY = y;
                
                if (distance <= maxRadius && distance > 0) {
                    // Calculate twist amount based on distance (stronger at center)
                    const normalizedDistance = distance / maxRadius;
                    const twistAmount = angleRad * Math.pow(1 - normalizedDistance, falloff);
                    
                    // Current angle from center
                    const currentAngle = Math.atan2(dy, dx);
                    
                    // New angle with twist
                    const newAngle = currentAngle + twistAmount;
                    
                    // Calculate new position
                    sourceX = cx + Math.cos(newAngle) * distance;
                    sourceY = cy + Math.sin(newAngle) * distance;
                }
                
                // Sample from source with bilinear filtering
                const sx = Math.floor(sourceX);
                const sy = Math.floor(sourceY);
                const fx = sourceX - sx;
                const fy = sourceY - sy;
                
                let r = 0, g = 0, b = 0, a = 255;
                
                if (sx >= 0 && sx < width - 1 && sy >= 0 && sy < height - 1) {
                    const getPixel = (px, py) => {
                        const idx = (py * width + px) * 4;
                        return {
                            r: sourceImageData.data[idx],
                            g: sourceImageData.data[idx + 1],
                            b: sourceImageData.data[idx + 2],
                            a: sourceImageData.data[idx + 3]
                        };
                    };
                    
                    const p00 = getPixel(sx, sy);
                    const p10 = getPixel(sx + 1, sy);
                    const p01 = getPixel(sx, sy + 1);
                    const p11 = getPixel(sx + 1, sy + 1);
                    
                    // Bilinear interpolation
                    const top = {
                        r: p00.r * (1 - fx) + p10.r * fx,
                        g: p00.g * (1 - fx) + p10.g * fx,
                        b: p00.b * (1 - fx) + p10.b * fx
                    };
                    
                    const bottom = {
                        r: p01.r * (1 - fx) + p11.r * fx,
                        g: p01.g * (1 - fx) + p11.g * fx,
                        b: p01.b * (1 - fx) + p11.b * fx
                    };
                    
                    r = top.r * (1 - fy) + bottom.r * fy;
                    g = top.g * (1 - fy) + bottom.g * fy;
                    b = top.b * (1 - fy) + bottom.b * fy;
                } else if (sx >= 0 && sx < width && sy >= 0 && sy < height) {
                    // Edge case - just sample nearest
                    const idx = (sy * width + sx) * 4;
                    r = sourceImageData.data[idx];
                    g = sourceImageData.data[idx + 1];
                    b = sourceImageData.data[idx + 2];
                }
                
                outputImageData.data[pixelIndex] = r;
                outputImageData.data[pixelIndex + 1] = g;
                outputImageData.data[pixelIndex + 2] = b;
                outputImageData.data[pixelIndex + 3] = a;
            }
        }
        
        ctx.putImageData(outputImageData, 0, 0);
        
        // Draw twist center indicator
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(cx, cy, 5, 0, Math.PI * 2);
        ctx.stroke();
        
        // Add info text
        ctx.fillStyle = '#fff';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 3;
        ctx.strokeText(`TWIST ${angle.toFixed(0)}°`, width / 2, height - 20);
        ctx.fillText(`TWIST ${angle.toFixed(0)}°`, width / 2, height - 20);
    },
    
    process: async (inputs, parameters, webGPURenderer) => {
        const { input } = inputs;
        const { angle = 45, centerX = 0.5, centerY = 0.5, falloff = 1.0, radius = 0.5 } = parameters;
        
        if (!input) {
            console.warn('Twist missing input');
            return null;
        }
        
        const outputCanvas = document.createElement('canvas');
        outputCanvas.width = 256;
        outputCanvas.height = 256;
        const ctx = outputCanvas.getContext('2d');
        
        // For now, use the generateTexture method
        this.generateTexture(ctx, parameters);
        
        return outputCanvas;
    }
};