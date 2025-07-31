# TexN - Node Editor

A modern, web-based node editor with advanced marking menus, color customization, and wire physics simulation.

## 🎨 Features

### **Marking Menu System**
- **Right-click marking menu** based on research paper principles
- **Drag-to-select** interaction for intuitive node creation
- **Visual feedback** with highlighted selections
- **Spatial memory** - consistent menu item positioning
- **Gesture-based selection** - drag direction determines choice

### **Node Categories**
- **Generators (GN)** - Noise, patterns, procedural content
- **Constants (CN)** - Color, values, static data
- **Math (MN)** - Add, subtract, mathematical operations
- **Utility (UN)** - Blend, mix, utility functions
- **Deform (DN)** - Warp, transform, geometric operations

### **Color System**
- **Category-based tinting** for visual distinction
- **HSV color palettes** with professional UI/UX themes
- **Auto-save** for all color preferences
- **Saturation control** for global color adjustment
- **Text contrast** - automatic white/black text based on background

### **Wire Physics**
- **Dynamic wire simulation** with stiffness, damping, gravity
- **Collision avoidance** between wires
- **Configurable parameters** for fine-tuning
- **Real-time physics** with smooth animations

### **Hotkeys**
- **G** - Generators category
- **C** - Toggle Color Panel
- **M** - Math category
- **U** - Utility category
- **D** - Deform category
- **R** - Radial Menu
- **P** - Toggle Physics Panel
- **RMB** - Right-click Marking Menu

## 🚀 Getting Started

1. **Open `texn.html`** in your web browser
2. **Right-click** on the canvas to open the marking menu
3. **Drag** in the direction of the desired node type
4. **Release** to create the node
5. **Drag nodes** to move them around the canvas
6. **Use hotkeys** for quick access to features

## 🎯 Usage

### **Creating Nodes**
- **Right-click** anywhere on canvas
- **Drag** toward the desired node type (Noise, Color, Add, Blend, Warp)
- **Release** to create the node at that position

### **Moving Nodes**
- **Left-click and drag** any node to move it
- **Nodes are color-coded** by category for easy identification

### **Customizing Colors**
- **Press 'C'** to toggle the color panel
- **Use color pickers** to customize category colors
- **Adjust saturation** with the slider
- **Select palettes** from the dropdown menu
- **Settings auto-save** to localStorage

### **Physics Controls**
- **Press 'P'** to toggle the physics panel
- **Adjust wire parameters** like stiffness, damping, gravity
- **Real-time updates** affect wire behavior

## 🛠️ Technical Details

### **Architecture**
- **Pure HTML/CSS/JavaScript** - no external dependencies
- **PIXI.js** for rendering (referenced in project structure)
- **WebGPU** for advanced graphics processing
- **LocalStorage** for persistent settings

### **Research-Based Design**
- **Marking menus** follow Autodesk research principles
- **Spatial consistency** for muscle memory
- **Gesture efficiency** for rapid interaction
- **Immediate visual feedback** for user confidence

### **Color Management**
- **HSV internal representation** for intuitive color control
- **Professional UI palettes** (Material Design, Tailwind, GitHub Dark, etc.)
- **Automatic text contrast** based on background luminance
- **High Dynamic Range** color support

## 📁 Project Structure

```
WebUI/
├── texn.html              # Main TexN editor
├── assets/                # Node and port images
├── nodes/                 # Node type definitions
├── webgpu/               # WebGPU rendering system
├── parameterSystem.js    # Parameter management
└── README.md            # This file
```

## 🎨 Color Palettes

- **Material Design** - Google's Material Design colors
- **Tailwind Modern** - Modern web design palette
- **GitHub Dark** - GitHub's dark theme
- **Notion Workspace** - Notion's clean aesthetic
- **Figma Design** - Figma's design system
- **Apple HIG** - Apple's Human Interface Guidelines
- **IBM Carbon** - IBM's design system
- **Ant Design** - Ant Design's color system
- **Slack Brand** - Slack's brand colors
- **Stripe Clean** - Stripe's minimalist palette
- **Vercel Mono** - Vercel's monochrome theme
- **Atlassian Suite** - Atlassian's design system

## 🔧 Development

### **Adding New Node Types**
1. Add node definition to `nodes/` directory
2. Update category colors in the color panel
3. Add to marking menu items
4. Update hotkey system if needed

### **Customizing Physics**
- Modify wire physics parameters in the physics panel
- Adjust collision detection settings
- Fine-tune stiffness and damping values

### **Extending Color System**
- Add new palettes to the palette selector
- Implement custom color processing functions
- Extend HSV conversion utilities

## 📝 License

This project is open source and available under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

**TexN** - Where texture meets node-based creativity! 🎨✨ 