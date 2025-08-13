// Vanilla JavaScript Color Picker Fallback
class VanillaColorPicker {
    constructor() {
        this.selectedColor = '#f8fafc'; // Default gray color
        this.isOpen = false;
        
        // Predefined color palette with grays and common colors
        this.colorPalette = [
            '#f8fafc', // Current default gray
            '#f1f5f9', // Light gray
            '#e2e8f0', // Medium gray
            '#cbd5e1', // Darker gray
            '#94a3b8', // Blue-gray
            '#64748b', // Slate
            '#ffffff', // White
            '#000000', // Black
            '#3b82f6', // Blue
            '#10b981', // Green
            '#f59e0b', // Yellow
            '#ef4444', // Red
            '#8b5cf6', // Purple
            '#f97316', // Orange
            '#06b6d4', // Cyan
            '#84cc16', // Lime
        ];
        
        this.createElement();
        this.applyColor(this.selectedColor);
    }
    
    createElement() {
        // Create main container
        this.container = document.createElement('div');
        this.container.className = 'color-picker-container';
        this.container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 1000;
            background-color: rgba(255, 255, 255, 0.95);
            border-radius: 8px;
            padding: 12px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            border: 1px solid #e5e7eb;
            font-family: inherit;
        `;
        
        // Create label
        const label = document.createElement('div');
        label.textContent = 'Background Color';
        label.style.cssText = `
            font-size: 12px;
            font-weight: bold;
            color: #374151;
            margin-bottom: 8px;
            text-align: center;
        `;
        this.container.appendChild(label);
        
        // Create current color display
        this.currentColorDiv = document.createElement('div');
        this.currentColorDiv.style.cssText = `
            width: 40px;
            height: 40px;
            background-color: ${this.selectedColor};
            border: 2px solid #d1d5db;
            border-radius: 6px;
            cursor: pointer;
            margin: 0 auto 8px auto;
            transition: all 0.2s ease;
        `;
        this.currentColorDiv.title = `Current color: ${this.selectedColor}`;
        this.currentColorDiv.addEventListener('click', () => this.togglePalette());
        this.container.appendChild(this.currentColorDiv);
        
        // Create palette container
        this.paletteDiv = document.createElement('div');
        this.paletteDiv.style.cssText = `
            display: none;
            grid-template-columns: repeat(4, 1fr);
            gap: 4px;
            margin-top: 8px;
        `;
        
        // Create color squares
        this.colorPalette.forEach(color => {
            const colorSquare = document.createElement('div');
            colorSquare.style.cssText = `
                width: 24px;
                height: 24px;
                background-color: ${color};
                border: ${this.selectedColor === color ? '2px solid #3b82f6' : '1px solid #d1d5db'};
                border-radius: 4px;
                cursor: pointer;
                transition: all 0.1s ease;
            `;
            colorSquare.title = color;
            
            colorSquare.addEventListener('click', () => this.handleColorSelect(color));
            colorSquare.addEventListener('mouseenter', (e) => {
                e.target.style.transform = 'scale(1.1)';
            });
            colorSquare.addEventListener('mouseleave', (e) => {
                e.target.style.transform = 'scale(1)';
            });
            
            this.paletteDiv.appendChild(colorSquare);
        });
        
        this.container.appendChild(this.paletteDiv);
        
        // Add to page
        document.body.appendChild(this.container);
        console.log('✅ Vanilla color picker created and added to page');
    }
    
    togglePalette() {
        this.isOpen = !this.isOpen;
        this.paletteDiv.style.display = this.isOpen ? 'grid' : 'none';
        this.currentColorDiv.style.boxShadow = this.isOpen ? '0 0 0 2px #3b82f6' : 'none';
    }
    
    handleColorSelect(color) {
        this.selectedColor = color;
        this.isOpen = false;
        this.paletteDiv.style.display = 'none';
        this.currentColorDiv.style.boxShadow = 'none';
        this.currentColorDiv.style.backgroundColor = color;
        this.currentColorDiv.title = `Current color: ${color}`;
        
        // Update all color squares borders
        const colorSquares = this.paletteDiv.children;
        for (let i = 0; i < colorSquares.length; i++) {
            const square = colorSquares[i];
            const squareColor = this.colorPalette[i];
            square.style.border = this.selectedColor === squareColor ? '2px solid #3b82f6' : '1px solid #d1d5db';
        }
        
        this.applyColor(color);
    }
    
    applyColor(color) {
        document.documentElement.style.setProperty('--background-color', color);
        document.body.style.backgroundColor = color;
        
        // Dispatch custom event to notify other parts of the app
        window.dispatchEvent(new CustomEvent('colorChanged', { 
            detail: { color } 
        }));
    }
}

// Mount the vanilla color picker
window.mountVanillaColorPicker = () => {
    console.log('🎨 Mounting vanilla color picker...');
    if (!document.querySelector('.color-picker-container')) {
        new VanillaColorPicker();
        console.log('✅ Vanilla color picker mounted');
    } else {
        console.log('⚠️ Color picker already exists');
    }
};

console.log('🎨 VanillaColorPicker.js loaded successfully');
