import { noiseNode } from './noise.js';
import { checkerNode } from './checker.js';

import { uniformColorNode } from './uniformColor.js';
import { testNode } from './test.js';
import { 
    multiplyNode, addNode, divideNode, subtractNode, 
    differenceNode, exclusionNode, overlayNode, addsubNode 
} from './operations.js';
import { distortNode, dxdyNode, containerNode } from './other.js';

// New Generator nodes
import { gradientNode } from './gradient.js';
import { voronoiNode } from './voronoi.js';

// New Constant nodes  
import { colorNode } from './color.js';
import { valueNode } from './value.js';
import { vectorNode } from './vector.js';

// New Utility nodes
import { mixNode } from './mix.js';
import { clampNode } from './clamp.js';
import { mapNode } from './map.js';

// New Deform nodes
import { warpNode } from './warp.js';
import { twistNode } from './twist.js';
import { bendNode } from './bend.js';

// New Effect nodes
import { blurNode } from './blur.js';
import { sharpenNode } from './sharpen.js';
import { embossNode } from './emboss.js';

// Assign categories to nodes
Object.assign(noiseNode, { category: 'GN' });        // Generator
Object.assign(checkerNode, { category: 'GN' });      // Generator
Object.assign(gradientNode, { category: 'GN' });     // Generator
Object.assign(voronoiNode, { category: 'GN' });      // Generator

Object.assign(uniformColorNode, { category: 'CN' }); // Constant
Object.assign(colorNode, { category: 'CN' });        // Constant
Object.assign(valueNode, { category: 'CN' });        // Constant
Object.assign(vectorNode, { category: 'CN' });       // Constant


Object.assign(multiplyNode, { category: 'MN' });     // Math
Object.assign(addNode, { category: 'MN' });          // Math
Object.assign(divideNode, { category: 'MN' });       // Math
Object.assign(subtractNode, { category: 'MN' });     // Math
Object.assign(differenceNode, { category: 'MN' });   // Math
Object.assign(exclusionNode, { category: 'MN' });    // Math
Object.assign(overlayNode, { category: 'MN' });      // Math
Object.assign(addsubNode, { category: 'MN' });       // Math

Object.assign(mixNode, { category: 'UN' });          // Utility
Object.assign(clampNode, { category: 'UN' });        // Utility
Object.assign(mapNode, { category: 'UN' });          // Utility
Object.assign(dxdyNode, { category: 'UN' });         // Utility
Object.assign(containerNode, { category: 'UN' });    // Utility
Object.assign(testNode, { category: 'UN' });         // Utility

Object.assign(distortNode, { category: 'DN' });      // Deform
Object.assign(warpNode, { category: 'DN' });         // Deform
Object.assign(twistNode, { category: 'DN' });        // Deform
Object.assign(bendNode, { category: 'DN' });         // Deform

Object.assign(blurNode, { category: 'FX' });         // Effect
Object.assign(sharpenNode, { category: 'FX' });      // Effect
Object.assign(embossNode, { category: 'FX' });       // Effect

export const allNodes = {
    // Generators
    noise: noiseNode,
    checker: checkerNode,
    gradient: gradientNode,
    voronoi: voronoiNode,
    
    // Constants
    uniformColor: uniformColorNode,
    color: colorNode,
    uniform: uniformColorNode, // Alias for backward compatibility
    value: valueNode,
    vector: vectorNode,
    
    // Math
    multiply: multiplyNode,
    add: addNode,
    divide: divideNode,
    subtract: subtractNode,
    difference: differenceNode,
    exclusion: exclusionNode,
    overlay: overlayNode,
    addsub: addsubNode,
    
    // Utility
    mix: mixNode,
    clamp: clampNode,
    map: mapNode,
    dxdy: dxdyNode,
    container: containerNode,
    test: testNode,
    
    // Deform
    distort: distortNode,
    warp: warpNode,
    twist: twistNode,
    bend: bendNode,
    
    // Effects
    blur: blurNode,
    sharpen: sharpenNode,
    emboss: embossNode
}; 