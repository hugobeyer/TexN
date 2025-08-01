// Parameter System Module
// Handles creation and management of node parameter UI

export class ParameterSystem {
    constructor(node, nodeConfig) {
        this.node = node;
        this.nodeConfig = nodeConfig;
        this.parameterPanel = null;
        this.parameterVisuals = [];
        this.parameterPanelTargetAlpha = 0;
        this.debugMode = false; // Debug mode for showing collision boxes
        this.debugOverlays = []; // Store debug overlay graphics
        // this.visibilityThreshold = 2000; // DISABLED - was causing parameters beyond 2nd to be hidden
        
        this.setupDebugKeyListener();
    }

    setupDebugKeyListener() {
        // Only set up once globally
        if (!window.parameterDebugListenerSetup) {
            window.parameterDebugListenerSetup = true;
            document.addEventListener('keydown', (e) => {
                if (e.key.toLowerCase() === 'd' && !e.ctrlKey && !e.altKey && !e.shiftKey) {
                    // Toggle debug mode for all parameter systems
                    window.parameterDebugMode = !window.parameterDebugMode;
                    console.log('Parameter debug mode:', window.parameterDebugMode ? 'ON' : 'OFF');
                    
                    // Update all existing parameter systems
                    if (window.allParameterSystems) {
                        window.allParameterSystems.forEach(ps => {
                            ps.setDebugMode(window.parameterDebugMode);
                        });
                    }
                }
            });
            window.allParameterSystems = window.allParameterSystems || [];
        }
        
        // Register this parameter system
        if (!window.allParameterSystems.includes(this)) {
            window.allParameterSystems.push(this);
        }
    }

    createParameterPanel() {
        if (!this.node.config.parameters) {
            console.log('No parameters in node config, skipping panel creation');
            return;
        }
        if (this.parameterPanel) {
            console.log('Parameter panel already exists, skipping creation');
            return;
        }
        console.log('Creating parameter panel for node:', this.node.type);
        
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
        
        // Note: Parameter panel Z-order is handled in node constructor to ensure it's above all sprites
        

        
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
        const paramWidth = Math.max(120, this.node.width * this.nodeConfig.scale); // Minimum 120px width
        const spacing = 35; // More space between parameters
        
        // Group color parameters for horizontal layout
        const parameters = Object.entries(this.node.config.parameters);
        const colorParams = parameters.filter(([key, param]) => param.type === 'color');
        const nonColorParams = parameters.filter(([key, param]) => param.type !== 'color');
        
        console.log('Parameter breakdown:', {
            total: parameters.length,
            colorParams: colorParams.map(([key, param]) => `${key}(${param.type})`),
            nonColorParams: nonColorParams.map(([key, param]) => `${key}(${param.type})`)
        });
        
        // Process non-color parameters first
        nonColorParams.forEach(([paramKey, param], index) => {
            console.log(`Setting up parameter: ${paramKey}, type: ${param.type}, value: ${this.node.parameters[paramKey]}, default: ${param.default}`);
            const paramVisual = {
                key: paramKey,
                param: param,
                graphics: new PIXI.Graphics(),
                text: new PIXI.Text(param.label, {
                    fontFamily: 'JetBrains Mono',
                    fontSize: 8,  // Super small font
                    fill: 0xffffff,  // White text
                    align: 'right',
                    resolution: 2
                }),
                value: this.node.parameters[paramKey],
                type: param.type
            };
            
            // Scale down text
            paramVisual.text.scale.set(0.8);
            
            // Create value text for all types that need it
            if (['dropdown', 'int', 'float', 'string', 'bool', 'color'].includes(param.type)) {
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
            
            // Position label at top-right of slider area
            const labelWidth = Math.max(120, this.node.width * this.nodeConfig.scale);
            paramVisual.text.y = yOffset - 12; // Above the bar (closer)
            paramVisual.text.x = labelWidth/2 - 2; // Top-right position
            paramVisual.text.anchor.set(1, 1); // Right-aligned, bottom-aligned
            
            // Make interactive
            paramVisual.graphics.interactive = true;
            paramVisual.graphics.eventMode = 'static'; // Ensure events work
            paramVisual.graphics.cursor = 'pointer';
            
            // Set hit area based on parameter type (extend upward to include label)
            if (param.type === 'color') {
                // Hit area for taller color boxes (extend up to include label)
                paramVisual.graphics.hitArea = new PIXI.Rectangle(-10, -15, 20, 27); // Extended upward
            } else if (param.type === 'bool') {
                // Smaller hit area for checkbox (just the checkbox area)
                paramVisual.graphics.hitArea = new PIXI.Rectangle(-paramWidth/2, -15, 50, 21); // Checkbox + label area
            } else {
                // Full width for other parameter types (extend up to include label)
                const hitWidth = Math.max(120, this.node.width * this.nodeConfig.scale);
                paramVisual.graphics.hitArea = new PIXI.Rectangle(-hitWidth/2, -15, hitWidth, 21); // Extended upward
            }
    
            

            

            
            // Handle interactions based on type (for non-color parameters)
            if (param.type !== 'color') {
                console.log(`Setting up ${param.type} interaction for parameter: ${paramKey}`);
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
                    default:
                        console.warn('Unknown parameter type:', param.type, 'for parameter:', paramVisual.key);
                        break;
                }
            } else {
                console.log(`Skipping interaction setup for color parameter: ${paramKey} (handled separately)`);
            }
            
            // Add to container
            this.parameterPanel.addChild(paramVisual.graphics);
            this.parameterPanel.addChild(paramVisual.text);
            if (paramVisual.valueText) {
                this.parameterPanel.addChild(paramVisual.valueText);
            }
            
            this.parameterVisuals.push(paramVisual);
            console.log('✅ Created parameter visual:', paramVisual.key, 'type:', paramVisual.type, 'interactive:', paramVisual.graphics.interactive);
            yOffset += spacing;
        });
        
        // Process color parameters in a single horizontal row
        if (colorParams.length > 0) {
            const colorRowY = yOffset;
            const colorSpacing = 80; // Horizontal spacing between color swatches
            const startX = -(colorParams.length - 1) * colorSpacing / 2; // Center the row
            
            colorParams.forEach(([paramKey, param], index) => {
                console.log(`Setting up color parameter: ${paramKey}, type: ${param.type}, value: ${this.node.parameters[paramKey]}, default: ${param.default}`);
                const paramVisual = {
                    key: paramKey,
                    param: param,
                    graphics: new PIXI.Graphics(),
                    text: new PIXI.Text(param.label, {
                        fontFamily: 'JetBrains Mono',
                        fontSize: 8,  // Super small font
                        fill: 0xffffff,  // White text
                        align: 'right',
                        resolution: 2
                    }),
                    value: this.node.parameters[paramKey],
                    type: param.type
                };
                
                // Scale down text even more for super small labels
                paramVisual.text.scale.set(0.6);
                
                // Create value text for color
                paramVisual.valueText = new PIXI.Text('', {
                    fontFamily: 'JetBrains Mono',
                    fontSize: 10,
                    fill: 0xff6600,  // Orange text
                    align: 'right',
                    resolution: 2
                });
                paramVisual.valueText.scale.set(0.8);
                
                // Position elements horizontally
                const xPos = startX + (index * colorSpacing);
                paramVisual.graphics.x = xPos;
                paramVisual.graphics.y = colorRowY;
                
                // Position label at top-right of color swatch
                paramVisual.text.y = colorRowY - 12;
                paramVisual.text.x = xPos + 15; // Right of color swatch
                paramVisual.text.anchor.set(1, 1);
                
                // Position value text
                if (paramVisual.valueText) {
                    paramVisual.valueText.y = colorRowY;
                    paramVisual.valueText.x = xPos + 25; // Right of swatch
                    paramVisual.valueText.anchor.set(0, 0.5);
                }
                
                // Make interactive
                paramVisual.graphics.interactive = true;
                paramVisual.graphics.eventMode = 'static';
                paramVisual.graphics.cursor = 'pointer';
                
                // Set hit area for color swatch
                paramVisual.graphics.hitArea = new PIXI.Rectangle(-10, -15, 20, 27);
                
                // Handle color interaction
                console.log(`Setting up color interaction for parameter: ${paramKey}`);
                this.setupColorInteraction(paramVisual);
                
                // Add to container
                this.parameterPanel.addChild(paramVisual.graphics);
                this.parameterPanel.addChild(paramVisual.text);
                if (paramVisual.valueText) {
                    this.parameterPanel.addChild(paramVisual.valueText);
                }
                
                this.parameterVisuals.push(paramVisual);
                console.log('✅ Created color parameter visual:', paramVisual.key, 'interactive:', paramVisual.graphics.interactive);
            });
            
            // Only advance yOffset once for the entire color row
            yOffset += spacing;
        }
        
        // Initial draw
        this.updateParameterVisuals();
        

    }

    setupFloatSliderInteraction(paramVisual) {
        console.log('Setting up float slider interaction for:', paramVisual.key, paramVisual.param);
        console.log('Node position when setting up:', this.node.x, this.node.y);
        let isDragging = false;
        let startX = 0;
        let startValue = 0;
        
        // Use document events for reliable dragging
        const handleMouseMove = (e) => {
            if (!isDragging) return;
            
            const deltaX = e.clientX - startX;
            const range = paramVisual.param.max - paramVisual.param.min;
            
            // Debug coordinate calculations at distance
            if (Math.abs(this.node.x) > 500 || Math.abs(this.node.y) > 500) {
                console.log(`Float slider at distance: nodePos=${this.node.x},${this.node.y} deltaX=${deltaX} range=${range}`);
            }
            const deltaValue = (deltaX / (this.node.width * this.nodeConfig.scale)) * range;
            
            let newValue = startValue + deltaValue;
            newValue = Math.max(paramVisual.param.min, Math.min(paramVisual.param.max, newValue));
            
            this.node.parameters[paramVisual.key] = newValue;
            paramVisual.value = newValue;
            
            this.updateParameterVisuals();
            this.node.updateNodeTexture();
            
            // Save graph when parameters change
            if (window.saveNodeGraph) {
                window.saveNodeGraph();
            }
        };
        
        const handleMouseUp = () => {
            if (!isDragging) return;
            isDragging = false;
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            
            // Allow node deselection again with delay to prevent immediate deselection
            setTimeout(() => {
                window.parameterInteractionInProgress = false;
            }, 300); // Increased from 100ms to 300ms
        };
        
        paramVisual.graphics.on('pointerdown', (e) => {
            isDragging = true;
            startX = e.data.global.x;
            startValue = this.node.parameters[paramVisual.key];
            e.stopPropagation();
            console.log('🎯 PARAMETER EVENT RECEIVED for', paramVisual.key || 'unknown param');
            
            // Prevent node deselection during parameter interaction
            window.parameterInteractionInProgress = true;
            window.lastParameterInteractionTime = Date.now();
            
            // Add document listeners for reliable dragging
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        });
    }

    setupIntSliderInteraction(paramVisual) {
        console.log('Setting up int slider interaction for:', paramVisual.key, paramVisual.param);
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
            
            // Save graph when parameters change
            if (window.saveNodeGraph) {
                window.saveNodeGraph();
            }
        };
        
        const handleMouseUp = () => {
            if (!isDragging) return;
            isDragging = false;
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            
            // Allow node deselection again with delay to prevent immediate deselection
            setTimeout(() => {
                window.parameterInteractionInProgress = false;
            }, 300); // Increased from 100ms to 300ms
        };
        
        paramVisual.graphics.on('pointerdown', (e) => {
            isDragging = true;
            startX = e.data.global.x;
            startValue = this.node.parameters[paramVisual.key];
            e.stopPropagation();
            console.log('🎯 PARAMETER EVENT RECEIVED for', paramVisual.key || 'unknown param');
            
            // Prevent node deselection during parameter interaction
            window.parameterInteractionInProgress = true;
            window.lastParameterInteractionTime = Date.now();
            
            // Add document listeners for reliable dragging
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        });
    }

    setupBoolInteraction(paramVisual) {
        paramVisual.graphics.on('pointerdown', (e) => {
            e.stopPropagation();
            console.log('🎯 PARAMETER EVENT RECEIVED for', paramVisual.key || 'unknown param');
            
            // Prevent node deselection during parameter interaction
            window.parameterInteractionInProgress = true;
            window.lastParameterInteractionTime = Date.now();
            
            // Toggle boolean value
            this.node.parameters[paramVisual.key] = !this.node.parameters[paramVisual.key];
            
            this.updateParameterVisuals();
            this.node.updateNodeTexture();
            
            // Save graph when parameters change
            if (window.saveNodeGraph) {
                window.saveNodeGraph();
            }
            
            // Allow node deselection again after a brief delay
            setTimeout(() => {
                window.parameterInteractionInProgress = false;
            }, 100);
        });
    }

    setupStringInteraction(paramVisual) {
        paramVisual.graphics.on('pointerdown', (e) => {
            e.stopPropagation();
            console.log('🎯 PARAMETER EVENT RECEIVED for', paramVisual.key || 'unknown param');
            
            // Prevent node deselection during parameter interaction
            window.parameterInteractionInProgress = true;
            window.lastParameterInteractionTime = Date.now();
            
            // Create text input for string editing
            const currentValue = this.node.parameters[paramVisual.key];
            const newValue = prompt(`Enter ${paramVisual.param.label}:`, currentValue);
            
            if (newValue !== null) {
                this.node.parameters[paramVisual.key] = newValue;
                this.updateParameterVisuals();
                this.node.updateNodeTexture();
            }
            
            // Allow node deselection again with delay to prevent immediate deselection
            setTimeout(() => {
                window.parameterInteractionInProgress = false;
            }, 300); // Increased from 100ms to 300ms
        });
    }

    setupDropdownInteraction(paramVisual) {
        paramVisual.graphics.on('pointerdown', (e) => {
            e.stopPropagation();
            console.log('🎯 PARAMETER EVENT RECEIVED for', paramVisual.key || 'unknown param');
            
            // Prevent node deselection during parameter interaction
            window.parameterInteractionInProgress = true;
            window.lastParameterInteractionTime = Date.now();
            
            // Calculate which segment was clicked using more reliable coordinate conversion
            const globalPoint = e.data.global;
            const localPoint = paramVisual.graphics.toLocal(globalPoint);
            const width = Math.max(120, this.node.width * this.nodeConfig.scale); // Use consistent width
            const segmentWidth = width / paramVisual.param.options.length;
            const clickX = localPoint.x + width/2; // Convert to 0-based from left edge
            const segmentIndex = Math.floor(clickX / segmentWidth);
            
            console.log(`Dropdown click: global=${globalPoint.x},${globalPoint.y} local=${localPoint.x},${localPoint.y} clickX=${clickX} segment=${segmentIndex}`);
            
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

    setupColorInteraction(paramVisual) {
        paramVisual.graphics.on('pointerdown', (e) => {
            e.stopPropagation();
            console.log('🎯 PARAMETER EVENT RECEIVED for', paramVisual.key || 'unknown param');
            
            // Prevent node deselection during parameter interaction
            window.parameterInteractionInProgress = true;
            window.lastParameterInteractionTime = Date.now();
            
            // Get mouse position
            const mouseX = e.data.global.x;
            const mouseY = e.data.global.y;
            
            // Create a temporary color input element
            const colorInput = document.createElement('input');
            colorInput.type = 'color';
            colorInput.value = this.node.parameters[paramVisual.key];
            colorInput.style.position = 'absolute';
            colorInput.style.left = (mouseX + 10) + 'px'; // Position near mouse cursor
            colorInput.style.top = (mouseY - 10) + 'px';
            colorInput.style.zIndex = '10000';
            colorInput.style.pointerEvents = 'auto';
            colorInput.style.width = '50px';
            colorInput.style.height = '30px';
            colorInput.style.border = 'none';
            colorInput.style.borderRadius = '4px';
            colorInput.style.cursor = 'pointer';
            
            document.body.appendChild(colorInput);
            
            colorInput.addEventListener('change', () => {
                this.node.parameters[paramVisual.key] = colorInput.value;
                this.updateParameterVisuals();
                this.node.updateNodeTexture();
                document.body.removeChild(colorInput);
                
                // Allow node deselection again
                            setTimeout(() => {
                window.parameterInteractionInProgress = false;
            }, 300); // Increased from 100ms to 300ms
        });
            
            colorInput.addEventListener('blur', () => {
                if (document.body.contains(colorInput)) {
                    document.body.removeChild(colorInput);
                }
                            setTimeout(() => {
                window.parameterInteractionInProgress = false;
            }, 300); // Increased from 100ms to 300ms
        });
            
            // Focus and open the color picker immediately
            setTimeout(() => {
                colorInput.focus();
                colorInput.click();
            }, 10);
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
            
            // DISABLED: Check if parameter is below visibility threshold
            // This was causing parameters beyond the 2nd one to be hidden/non-interactive
            // const worldY = this.parameterPanel.worldTransform.ty + paramVisual.graphics.y;
            // const isVisible = worldY < this.visibilityThreshold;
            
            // Always ensure parameters are visible and interactive
            paramVisual.graphics.visible = true;
            paramVisual.text.visible = true;
            if (paramVisual.valueText) {
                paramVisual.valueText.visible = true;
            }
            
            const width = Math.max(120, this.node.width * this.nodeConfig.scale); // Use same width as creation
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
                    // Draw proper checkbox (square)
                    const checkboxSize = 12;
                    const checkboxX = -width/2;
                    const checkboxY = -checkboxSize/2;
                    
                    // Draw checkbox background
                    graphics.beginFill(0x333333, 0.8);
                    graphics.drawRect(checkboxX, checkboxY, checkboxSize, checkboxSize);
                    graphics.endFill();
                    
                    // Draw checkbox border
                    graphics.lineStyle(1, 0x666666, 0.8);
                    graphics.drawRect(checkboxX, checkboxY, checkboxSize, checkboxSize);
                    graphics.lineStyle(0);
                    
                    // Draw checkmark if checked
                    if (value) {
                        graphics.lineStyle(2, 0x00aa00, 1); // Green checkmark
                        graphics.moveTo(checkboxX + 2, checkboxY + 6);
                        graphics.lineTo(checkboxX + 5, checkboxY + 9);
                        graphics.lineTo(checkboxX + 10, checkboxY + 3);
                        graphics.lineStyle(0);
                    }
                    
                    // Update value text
                    if (paramVisual.valueText) {
                        paramVisual.valueText.text = value ? 'ON' : 'OFF';
                        paramVisual.valueText.x = checkboxX + checkboxSize + 10; // Right of checkbox
                        paramVisual.valueText.y = 0; // Centered vertically
                        paramVisual.valueText.visible = true;
                        paramVisual.valueText.alpha = 1.0; // Full opacity
                        paramVisual.valueText.style.fill = 0xff6600; // Orange color
                        paramVisual.valueText.anchor.set(0, 0.5); // Left-aligned
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
                        const displayText = value.length > 14 ? value.substring(0, 12) + '...' : value;
                        paramVisual.valueText.text = displayText || '(empty)';
                        paramVisual.valueText.x = width/2 - 5; // Right side of bar
                        paramVisual.valueText.y = paramVisual.graphics.y+4;
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
            } else if (paramVisual.type === 'color') {
                const colorValue = this.node.parameters[paramVisual.key];
                
                if (detailLevel === 'full') {
                    // Parse hex color to integer
                    const colorHex = colorValue.replace('#', '');
                    const colorInt = parseInt(colorHex, 16);
                    
                    // Draw taller color box in single row layout
                    const swatchWidth = 20; // Slightly wider
                    const swatchHeight = 18; // Taller color box
                    graphics.beginFill(colorInt, 1.0);
                    graphics.drawRect(-swatchWidth/2, -swatchHeight/2, swatchWidth, swatchHeight);
                    graphics.endFill();
                    
                    // Draw border around color swatch
                    graphics.lineStyle(1, 0xffffff, 0.8);
                    graphics.drawRect(-swatchWidth/2, -swatchHeight/2, swatchWidth, swatchHeight);
                    graphics.lineStyle(0);
                    
                    // Don't override positions for color parameters - they use horizontal layout
                    // Just update the text content and visibility
                    paramVisual.text.visible = true;
                    paramVisual.text.alpha = 0.8;
                    
                    if (paramVisual.valueText) {
                        paramVisual.valueText.text = colorValue.toUpperCase();
                        paramVisual.valueText.visible = true;
                        paramVisual.valueText.alpha = 1.0; // Full opacity
                        paramVisual.valueText.style.fill = 0xffffff; // White text for contrast
                        // Don't override X/Y positions - use the ones set during creation
                    }
                } else {
                    if (paramVisual.valueText) {
                        paramVisual.valueText.visible = false;
                    }
                    paramVisual.text.visible = detailLevel === 'simplified';
                    paramVisual.text.alpha = 0.5;
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
        this.parameterPanel.alpha = 1.0; // Force immediate visibility
        // Start fade-in animation
        this.parameterPanelTargetAlpha = 1;
        
        // Update debug overlays if debug mode is enabled
        this.updateDebugOverlays();
    }

    hideParameterPanel() {
        if (!this.parameterPanel) return;
        console.log('Hiding parameter panel for node:', this.node.type);
        
        // Start fade-out animation
        this.parameterPanelTargetAlpha = 0;
        
        // Hide debug overlays when panel is hidden
        this.updateDebugOverlays();
    }

    update() {
        // Animate parameter panel alpha
        if (this.parameterPanel && this.parameterPanel.alpha !== this.parameterPanelTargetAlpha) {
            const diff = this.parameterPanelTargetAlpha - this.parameterPanel.alpha;
            console.log('Animating alpha from', this.parameterPanel.alpha, 'to', this.parameterPanelTargetAlpha);
            if (Math.abs(diff) < 0.01) {
                this.parameterPanel.alpha = this.parameterPanelTargetAlpha;
                if (this.parameterPanel.alpha === 0) {
                    this.parameterPanel.visible = false;
                    console.log('Parameter panel fully hidden');
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

    setDebugMode(enabled) {
        this.debugMode = enabled;
        this.updateDebugOverlays();
    }

    updateDebugOverlays() {
        // Clear existing debug overlays
        this.debugOverlays.forEach(overlay => {
            if (overlay.parent) {
                overlay.parent.removeChild(overlay);
            }
        });
        this.debugOverlays = [];

        if (!this.debugMode || !this.parameterPanel || !this.parameterPanel.visible) {
            return;
        }

        // Create debug overlays for each parameter visual
        this.parameterVisuals.forEach(paramVisual => {
            if (paramVisual.graphics && paramVisual.graphics.hitArea) {
                const hitArea = paramVisual.graphics.hitArea;
                const debugOverlay = new PIXI.Graphics();
                
                // Draw transparent green collision box
                debugOverlay.beginFill(0x00ff00, 0.2); // 20% opacity green
                debugOverlay.lineStyle(1, 0x00ff00, 0.8); // Green border
                debugOverlay.drawRect(hitArea.x, hitArea.y, hitArea.width, hitArea.height);
                debugOverlay.endFill();
                
                // Make debug overlay non-interactive so it doesn't block mouse events
                debugOverlay.interactive = false;
                debugOverlay.eventMode = 'none';
                
                // Position relative to the parameter visual
                debugOverlay.x = paramVisual.graphics.x;
                debugOverlay.y = paramVisual.graphics.y;
                
                // Add to parameter panel
                this.parameterPanel.addChild(debugOverlay);
                this.debugOverlays.push(debugOverlay);
                
                console.log(`Debug overlay for ${paramVisual.key}: x=${hitArea.x}, y=${hitArea.y}, w=${hitArea.width}, h=${hitArea.height}`);
            }
        });
    }
}