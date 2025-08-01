export const voronoiNode = {
    name: 'Voronoi',
    type: 'voronoi',
    color: 0x444444,
    category: 'GN',
    outputs: ['color'],
    parameters: {
        scale: {
            type: 'float',
            label: 'Scale',
            min: 1,
            max: 50,
            step: 1,
            default: 10
        },
        randomness: {
            type: 'float',
            label: 'Randomness',
            min: 0,
            max: 1,
            step: 0.01,
            default: 1.0
        },
        colorMode: {
            type: 'dropdown',
            label: 'Color Mode',
            options: ['distance', 'cells', 'edges', 'smooth'],
            default: 'distance'
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
        const {
            scale = 10,
            randomness = 1.0,
            colorMode = 'distance',
            seed = 42
        } = parameters;
        
        const width = 256;
        const height = 256;
        
        // Seeded random function
        let seedValue = seed;
        const random = () => {
            const x = Math.sin(seedValue++) * 10000;
            return x - Math.floor(x);
        };
        
        // Generate Voronoi points
        const points = [];
        const numPoints = Math.floor(scale);
        
        for (let i = 0; i < numPoints; i++) {
            points.push({
                x: random() * width,
                y: random() * height,
                color: {
                    r: Math.floor(random() * 255),
                    g: Math.floor(random() * 255),
                    b: Math.floor(random() * 255)
                }
            });
        }
        
        const imageData = ctx.createImageData(width, height);
        
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                let minDist = Infinity;
                let closestPoint = null;
                let secondClosest = Infinity;
                
                // Find closest and second closest points
                for (const point of points) {
                    const dx = x - point.x;
                    const dy = y - point.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    
                    if (dist < minDist) {
                        secondClosest = minDist;
                        minDist = dist;
                        closestPoint = point;
                    } else if (dist < secondClosest) {
                        secondClosest = dist;
                    }
                }
                
                const pixelIndex = (y * width + x) * 4;
                let r, g, b;
                
                switch (colorMode) {
                    case 'distance':
                        const distValue = Math.min(minDist / 50, 1) * 255;
                        r = g = b = distValue;
                        break;
                        
                    case 'cells':
                        r = closestPoint.color.r;
                        g = closestPoint.color.g;
                        b = closestPoint.color.b;
                        break;
                        
                    case 'edges':
                        const edgeValue = Math.max(0, (secondClosest - minDist) * 10);
                        r = g = b = Math.min(edgeValue * 255, 255);
                        break;
                        
                    case 'smooth':
                        const smoothFactor = Math.min(minDist / 30, 1);
                        r = closestPoint.color.r * (1 - smoothFactor) + 255 * smoothFactor;
                        g = closestPoint.color.g * (1 - smoothFactor) + 255 * smoothFactor;
                        b = closestPoint.color.b * (1 - smoothFactor) + 255 * smoothFactor;
                        break;
                        
                    default:
                        r = g = b = 128;
                }
                
                imageData.data[pixelIndex] = r;
                imageData.data[pixelIndex + 1] = g;
                imageData.data[pixelIndex + 2] = b;
                imageData.data[pixelIndex + 3] = 255;
            }
        }
        
        ctx.putImageData(imageData, 0, 0);
        
        // Add info text
        ctx.fillStyle = '#fff';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 3;
        ctx.strokeText(`VORONOI ${colorMode}`, width / 2, height - 20);
        ctx.fillText(`VORONOI ${colorMode}`, width / 2, height - 20);
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