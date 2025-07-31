import { noiseNode } from './noise.js';
import { checkerNode } from './checker.js';
import { blendNode } from './blend.js';
import { uniformColorNode } from './uniformColor.js';
import { testNode } from './test.js';
import { 
    multiplyNode, addNode, divideNode, subtractNode, 
    differenceNode, exclusionNode, overlayNode, addsubNode 
} from './operations.js';
import { distortNode, dxdyNode, containerNode } from './other.js';

// Assign categories to nodes
Object.assign(noiseNode, { category: 'GN' });        // Generator
Object.assign(checkerNode, { category: 'GN' });      // Generator
Object.assign(uniformColorNode, { category: 'CN' }); // Constant
Object.assign(blendNode, { category: 'MN' });        // Math
Object.assign(multiplyNode, { category: 'MN' });     // Math
Object.assign(addNode, { category: 'MN' });          // Math
Object.assign(divideNode, { category: 'MN' });       // Math
Object.assign(subtractNode, { category: 'MN' });     // Math
Object.assign(differenceNode, { category: 'MN' });   // Math
Object.assign(exclusionNode, { category: 'MN' });    // Math
Object.assign(overlayNode, { category: 'MN' });      // Math
Object.assign(addsubNode, { category: 'MN' });       // Math
Object.assign(distortNode, { category: 'DN' });      // Deform
Object.assign(dxdyNode, { category: 'UN' });         // Utility
Object.assign(containerNode, { category: 'UN' });    // Utility
Object.assign(testNode, { category: 'UN' });         // Utility

export const allNodes = {
    noise: noiseNode,
    checker: checkerNode,
    blend: blendNode,
    uniformColor: uniformColorNode,
    test: testNode,
    multiply: multiplyNode,
    add: addNode,
    divide: divideNode,
    subtract: subtractNode,
    difference: differenceNode,
    exclusion: exclusionNode,
    overlay: overlayNode,
    addsub: addsubNode,
    distort: distortNode,
    dxdy: dxdyNode,
    container: containerNode
}; 