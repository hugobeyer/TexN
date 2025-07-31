// Parameter System Module
// Handles creation and management of node parameter UI

export class ParameterSystem {
    constructor(node, nodeConfig) {
        this.node = node;
        this.nodeConfig = nodeConfig;
        this.parameterPanel = null;
        this.parameterVisuals = [];
        this.parameterPanelTargetAlpha = 0;
    }

    createParameterPanel() {
        if (!this.node.config.parameters || this.parameterPanel) return;
        
        // Create PIXI container for parameters
        this.parameterPanel = new PIXI.Container();
        // Position below node, accounting for scale
        this.parameterPanel.x = (this.node.width * this.nodeConfig.scale) / 2; // Center horizontally
        this.parameterPanel.y = this.node.height * this.nodeConfig.scale + 40; // Below the node with 40px gap
        this.parameterPanel.visible = false; // Start hidden
        this.parameterPanel.alpha = 0; // Start transparent
        this.parameterPanelTargetAlpha = 0; // Target is also hidden initially
        
        // Configure parameter panel for interaction
        this.parameterPanel.interactive = true;
        this.parameterPanel.eventMode = 'static';
        this.parameterPanel.interactiveChildren = true;
        

        
        // Add to node container so it follows the node
        this.node.container.addChild(this.parameterPanel);
        
        // Move parameter panel to top so it receives events
        this.node.container.setChildIndex(this.parameterPanel, this.node.container.children.length - 1);
        

        
        // Initialize parameters from config
        this.createParametersFromConfig();
        
        // Create PIXI visual representations
        this.createPixiParameterVisuals();

    }

    createParametersFromConfig() {
        if (!this.node.config.parameters) return;
        
        // Initialize node parameters with default values and infer types
        Object.entries(this.node.config.parameters).forEach(([paramKey, param]) => {
            // Set default value
            this.node.parameters[paramKey] = param.default !== undefined ? param.default : this.getDefaultForType(param.type);
            
            // Auto-detect type if not specified
            if (!param.type) {
                param.type = this.inferType(param.default);
            }
        });
    }
    
    getDefaultForType(type) {
        switch(type) {
            case 'bool': return false;
            case 'int': return 0;
            case 'float': return 0.0;
            case 'string': return '';
            case 'dropdown': return '';
            default: return 0;
        }
    }
    
    inferType(value) {
        if (typeof value === 'boolean') return 'bool';
        if (typeof value === 'string') return 'string';
        if (typeof value === 'number') {
            return Number.isInteger(value) ? 'int' : 'float';
        }
        if (Array.isArray(value)) return 'dropdown';
        return 'float'; // default fallback
    }

    createPixiParameterVisuals() {

        
        if (!this.parameterPanel) return;
        
        // Clear existing visuals
        this.parameterPanel.removeChildren();
        this.parameterVisuals = [];
        
        if (!this.node.config.parameters) {
            console.error('No parameters in config!');
            return;
        }
        
        let yOffset = 0;
        const paramWidth = this.node.width * this.nodeConfig.scale;
        const spacing = 25;
        
        Object.entries(this.node.config.parameters).forEach(([paramKey, param], index) => {
            const paramVisual = {
                key: paramKey,
                param: param,
                graphics: new PIXI.Graphics(),
                text: new PIXI.Text(param.label, {
                    fontFamily: 'JetBrains Mono',
                    fontSize: 11,
                    fill: 0xffffff,  // White text
                    align: 'center',
                    resolution: 2
                }),
                value: this.node.parameters[paramKey],
                type: param.type
            };
            
            // Scale down text
            paramVisual.text.scale.set(0.8);
            
            // Create value text for all types that need it
            if (['dropdown', 'int', 'float', 'string', 'bool'].includes(param.type)) {
                let displayValue = this.node.parameters[paramKey];
                
                // Format value for display
                if (param.type === 'float') {
                    displayValue = displayValue.toFixed(2);
                } else if (param.type === 'bool') {
                    displayValue = displayValue ? 'ON' : 'OFF';
                }
                
                paramVisual.valueText = new PIXI.Text(displayValue, {
                    fontFamily: 'JetBrains Mono',
                    fontSize: 10,
                    fill: 0xff6600,  // Orange color
                    align: 'right',
                    resolution: 2
                });
                paramVisual.valueText.scale.set(0.8);
                paramVisual.valueText.y = yOffset;
                paramVisual.valueText.x = paramWidth / 2 - 5; // Right side of bar
                paramVisual.valueText.anchor.set(1, 0.5);
            }
            
            // Position elements
            paramVisual.graphics.y = yOffset;
            paramVisual.text.y = yOffset - 15; // Above the bar
            paramVisual.text.x = 0; // Centered
            paramVisual.text.anchor.set(0.5, 0.5);
            
            // Make interactive
            paramVisual.graphics.interactive = true;
            paramVisual.graphics.eventMode = 'static'; // Ensure events work
            paramVisual.graphics.cursor = 'pointer';
            paramVisual.graphics.hitArea = new PIXI.Rectangle(-paramWidth/2, -6, paramWidth, 12);
    
            

            

            
            // Handle interactions based on type
            switch (param.type) {
                case 'float':
                case 'slider': // Legacy support
                    this.setupFloatSliderInteraction(paramVisual);
                    break;
                case 'int':
                    this.setupIntSliderInteraction(paramVisual);
                    break;
                case 'bool':
                    this.setupBoolInteraction(paramVisual);
                    break;
                case 'string':
                    this.setupStringInteraction(paramVisual);
                    break;
                case 'dropdown':
                    this.setupDropdownInteraction(paramVisual);
                    break;
            }
            
            // Add to container
            this.parameterPanel.addChild(paramVisual.graphics);
            this.parameterPanel.addChild(paramVisual.text);
            if (paramVisual.valueText) {
                this.parameterPanel.addChild(paramVisual.valueText);
            }
            
            this.parameterVisuals.push(paramVisual);
            yOffset += spacing;
        });
        
        // Initial draw
        this.updateParameterVisuals();
        

    }

    setupFloatSliderInteraction(paramVisual) {
        let isDragging = false;
        let startX = 0;
        let startValue = 0;
        
        // Use document events for reliable dragging
        const handleMouseMove = (e) => {
            if (!isDragging) return;
            
            const deltaX = e.clientX - startX;
            const range = paramVisual.param.max - paramVisual.param.min;
            const deltaValue = (deltaX / (this.node.width * this.nodeConfig.scale)) * range;
            
            let newValue = startValue + deltaValue;
            newValue = Math.max(paramVisual.param.min, Math.min(paramVisual.param.max, newValue));
            
            this.node.parameters[paramVisual.key] = newValue;
            paramVisual.value = newValue;
            
            this.updateParameterVisuals();
            this.node.updateNodeTexture();
        };
        
        const handleMouseUp = () => {
            if (!isDragging) return;
            isDragging = false;
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            
            // Allow node deselection again
            window.parameterInteractionInProgress = false;
        };
        
        paramVisual.graphics.on('pointerdown', (e) => {
            isDragging = true;
            startX = e.data.global.x;
            startValue = this.node.parameters[paramVisual.key];
            e.stopPropagation();
            
            // Prevent node deselection during parameter interaction
            window.parameterInteractionInProgress = true;
            
            // Add document listeners for reliable dragging
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        });
    }

    setupIntSliderInteraction(paramVisual) {
        let isDragging = false;
        let startX = 0;
        let startValue = 0;
        
        // Use document events for reliable dragging
        const handleMouseMove = (e) => {
            if (!isDragging) return;
            
            const deltaX = e.clientX - startX;
            const range = (paramVisual.param.max || 100) - (paramVisual.param.min || 0);
            const deltaValue = (deltaX / (this.node.width * this.nodeConfig.scale)) * range;
            
            let newValue = Math.round(startValue + deltaValue); // Round to integer
            newValue = Math.max(paramVisual.param.min || 0, Math.min(paramVisual.param.max || 100, newValue));
            
            this.node.parameters[paramVisual.key] = newValue;
            paramVisual.value = newValue;
            
            this.updateParameterVisuals();
            this.node.updateNodeTexture();
        };
        
        const handleMouseUp = () => {
            if (!isDragging) return;
            isDragging = false;
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            
            // Allow node deselection again
            window.parameterInteractionInProgress = false;
        };
        
        paramVisual.graphics.on('pointerdown', (e) => {
            isDragging = true;
            startX = e.data.global.x;
            startValue = this.node.parameters[paramVisual.key];
            e.stopPropagation();
            
            // Prevent node deselection during parameter interaction
            window.parameterInteractionInProgress = true;
            
            // Add document listeners for reliable dragging
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        });
    }

    setupBoolInteraction(paramVisual) {
        paramVisual.graphics.on('pointerdown', (e) => {
            e.stopPropagation();
            
            // Prevent node deselection during parameter interaction
            window.parameterInteractionInProgress = true;
            
            // Toggle boolean value
            this.node.parameters[paramVisual.key] = !this.node.parameters[paramVisual.key];
            
            this.updateParameterVisuals();
            this.node.updateNodeTexture();
            
            // Allow node deselection again after a brief delay
            setTimeout(() => {
                window.parameterInteractionInProgress = false;
            }, 100);
        });
    }

    setupStringInteraction(paramVisual) {
        paramVisual.graphics.on('pointerdown', (e) => {
            e.stopPropagation();
            
            // Prevent node deselection during parameter interaction
            window.parameterInteractionInProgress = true;
            
            // Create text input for string editing
            const currentValue = this.node.parameters[paramVisual.key];
            const newValue = prompt(`Enter ${paramVisual.param.label}:`, currentValue);
            
            if (newValue !== null) {
                this.node.parameters[paramVisual.key] = newValue;
                this.updateParameterVisuals();
                this.node.updateNodeTexture();
            }
            
            // Allow node deselection again
            window.parameterInteractionInProgress = false;
        });
    }

    setupDropdownInteraction(paramVisual) {
        paramVisual.graphics.on('pointerdown', (e) => {
            e.stopPropagation();
            
            // Prevent node deselection during parameter interaction
            window.parameterInteractionInProgress = true;
            
            // Calculate which segment was clicked
            const localX = e.data.global.x - paramVisual.graphics.worldTransform.tx;
            const width = this.node.width * this.nodeConfig.scale;
            const segmentWidth = width / paramVisual.param.options.length;
            const clickX = localX + width/2; // Convert to 0-based from left edge
            const segmentIndex = Math.floor(clickX / segmentWidth);
            
            // Clamp to valid range
            const validIndex = Math.max(0, Math.min(segmentIndex, paramVisual.param.options.length - 1));
            
            // Set the selected option
            this.node.parameters[paramVisual.key] = paramVisual.param.options[validIndex];
            paramVisual.valueText.text = paramVisual.param.options[validIndex];
            
            this.updateParameterVisuals(); // Refresh to show new selection
            this.node.updateNodeTexture();
            
            // Allow node deselection again after a brief delay
            setTimeout(() => {
                window.parameterInteractionInProgress = false;
            }, 100);
        });
    }

    updateParameterVisuals() {
        const zoom = this.node.container.parent?.scale?.x || 1;
        let detailLevel = 'full';
        
        if (zoom < 0.3) detailLevel = 'minimal';
        else if (zoom < 0.6) detailLevel = 'simplified';
        
        this.parameterVisuals.forEach(paramVisual => {
            const graphics = paramVisual.graphics;
            graphics.clear();
            
            const width = this.node.width * this.nodeConfig.scale;
            const height = 3; // Thin bar
            

            
            if (['float', 'int', 'slider'].includes(paramVisual.type)) {
                const value = this.node.parameters[paramVisual.key];
                const min = paramVisual.param.min || 0;
                const max = paramVisual.param.max || (paramVisual.type === 'int' ? 100 : 1);
                const normalized = (value - min) / (max - min);
                
                if (detailLevel === 'full') {
                    // Draw gray background bar
                    graphics.beginFill(0x555555, 0.8);
                    graphics.drawRect(-width/2, -height/2, width, height);
                    graphics.endFill();
                    
                    // Draw fill based on value
                    if (normalized > 0) {
                        graphics.beginFill(0x888888, 1);
                        graphics.drawRect(-width/2, -height/2, width * normalized, height);
                        graphics.endFill();
                    }
                    
                    // Update value text
                    if (paramVisual.valueText) {
                        if (paramVisual.type === 'int') {
                            paramVisual.valueText.text = value.toString();
                        } else {
                            paramVisual.valueText.text = value.toFixed(2);
                        }
                        paramVisual.valueText.x = width/2 - 5; // Right side of bar
                        paramVisual.valueText.y = paramVisual.graphics.y;
                        paramVisual.valueText.visible = true;
                        paramVisual.valueText.alpha = 1.0; // Full opacity
                        paramVisual.valueText.style.fill = 0xff6600; // Orange color
                        paramVisual.valueText.anchor.set(1, 0.5); // Right-aligned
                    }
                    
                    // Position label text
                    paramVisual.text.visible = true;
                    paramVisual.text.alpha = 0.8;
                    
                } else {
                    // Hide value text in simplified views
                    if (paramVisual.valueText) {
                        paramVisual.valueText.visible = false;
                    }
                    paramVisual.text.visible = detailLevel === 'simplified';
                    paramVisual.text.alpha = 0.5;
                }
            } else if (paramVisual.type === 'bool') {
                const value = this.node.parameters[paramVisual.key];
                
                if (detailLevel === 'full') {
                    // Draw checkbox/toggle
                    if (value) {
                        graphics.beginFill(0x00aa00, 0.9); // Green when ON
                    } else {
                        graphics.beginFill(0x555555, 0.8); // Gray when OFF
                    }
                    graphics.drawRect(-width/2, -height/2, width, height);
                    graphics.endFill();
                    
                    // Update value text
                    if (paramVisual.valueText) {
                        paramVisual.valueText.text = value ? 'ON' : 'OFF';
                        paramVisual.valueText.x = width/2 - 5; // Right side of bar
                        paramVisual.valueText.y = paramVisual.graphics.y;
                        paramVisual.valueText.visible = true;
                        paramVisual.valueText.alpha = 1.0; // Full opacity
                        paramVisual.valueText.style.fill = 0xff6600; // Orange color
                        paramVisual.valueText.anchor.set(1, 0.5); // Right-aligned
                    }
                    
                    paramVisual.text.visible = true;
                    paramVisual.text.alpha = 0.8;
                } else {
                    if (paramVisual.valueText) {
                        paramVisual.valueText.visible = false;
                    }
                    paramVisual.text.visible = detailLevel === 'simplified';
                    paramVisual.text.alpha = 0.5;
                }
            } else if (paramVisual.type === 'string') {
                const value = this.node.parameters[paramVisual.key];
                
                if (detailLevel === 'full') {
                    // Draw text field background
                    graphics.beginFill(0x333333, 0.8);
                    graphics.drawRect(-width/2, -height/2, width, height);
                    graphics.endFill();
                    
                    // Update value text
                    if (paramVisual.valueText) {
                        const displayText = value.length > 12 ? value.substring(0, 12) + '...' : value;
                        paramVisual.valueText.text = displayText || '(empty)';
                        paramVisual.valueText.x = width/2 - 5; // Right side of bar
                        paramVisual.valueText.y = paramVisual.graphics.y;
                        paramVisual.valueText.visible = true;
                        paramVisual.valueText.alpha = 1.0; // Full opacity
                        paramVisual.valueText.style.fill = 0xff6600; // Orange color
                        paramVisual.valueText.anchor.set(1, 0.5); // Right-aligned
                    }
                    
                    paramVisual.text.visible = true;
                    paramVisual.text.alpha = 0.8;
                } else {
                    if (paramVisual.valueText) {
                        paramVisual.valueText.visible = false;
                    }
                    paramVisual.text.visible = detailLevel === 'simplified';
                    paramVisual.text.alpha = 0.5;
                }
            } else if (paramVisual.type === 'dropdown') {
                if (detailLevel === 'full') {
                    // Draw segmented bars for each option
                    const options = paramVisual.param.options;
                    const currentValue = this.node.parameters[paramVisual.key];
                    const currentIndex = options.indexOf(currentValue);
                    const segmentWidth = width / options.length;
                    const gap = 1; // Small gap between segments
                    
                    options.forEach((option, index) => {
                        const segmentX = -width/2 + (index * segmentWidth);
                        const isSelected = index === currentIndex;
                        
                        // Draw segment
                        if (isSelected) {
                            graphics.beginFill(0xaaaaaa, 1); // Bright selected
                        } else {
                            graphics.beginFill(0x555555, 0.6); // Dim unselected
                        }
                        
                        graphics.drawRect(
                            segmentX + gap/2, 
                            -height/2, 
                            segmentWidth - gap, 
                            height
                        );
                        graphics.endFill();
                    });
                    
                    // Position texts
                    paramVisual.text.visible = true;
                    paramVisual.text.alpha = 0.8;
                    
                    paramVisual.valueText.visible = true;
                    paramVisual.valueText.alpha = 1.0; // Full opacity
                    paramVisual.valueText.x = width/2 - 5; // Right side of bar
                    paramVisual.valueText.y = paramVisual.graphics.y;
                    paramVisual.valueText.style.fill = 0xff6600; // Orange color
                    paramVisual.valueText.anchor.set(1, 0.5); // Right-aligned
                } else {
                    // Simplified views
                    paramVisual.text.visible = false;
                    paramVisual.valueText.visible = detailLevel === 'simplified';
                    paramVisual.valueText.alpha = 0.7;
                }
            }
        });
    }

    showParameterPanel() {
        if (!this.parameterPanel) {
            // Try to create it if missing
            this.createParameterPanel();
            if (!this.parameterPanel) {
                return;
            }
        }
        this.parameterPanel.visible = true;
        // Start fade-in animation
        this.parameterPanelTargetAlpha = 1;
    }

    hideParameterPanel() {
        if (!this.parameterPanel) return;
        this.parameterPanelTargetAlpha = 0;
    }

    update() {
        // Animate parameter panel alpha
        if (this.parameterPanel && this.parameterPanel.alpha !== this.parameterPanelTargetAlpha) {
            const diff = this.parameterPanelTargetAlpha - this.parameterPanel.alpha;
            if (Math.abs(diff) < 0.01) {
                this.parameterPanel.alpha = this.parameterPanelTargetAlpha;
                if (this.parameterPanel.alpha === 0) {
                    this.parameterPanel.visible = false;
                }
            } else {
                this.parameterPanel.alpha += diff * 0.18; // Smooth fade animation (consistent with UI)
            }
        }
        
        // Update parameter visuals based on zoom
        if (this.parameterPanel && this.parameterPanel.visible) {
            this.updateParameterVisuals();
        }
    }
}