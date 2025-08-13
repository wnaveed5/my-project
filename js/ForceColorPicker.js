// Force Color Picker to appear - immediate execution
console.log('🎨 ForceColorPicker.js: Starting immediate execution...');

// Simple color picker that appears immediately
function createImmediateColorPicker() {
    console.log('🎨 Creating immediate color picker...');
    
    // Check if already exists
    if (document.querySelector('.immediate-color-picker')) {
        console.log('⚠️ Color picker already exists');
        return;
    }
    
    // Create container
    const container = document.createElement('div');
    container.className = 'immediate-color-picker';
    container.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        background: rgba(255, 255, 255, 0.95);
        border: 2px solid #333;
        border-radius: 8px;
        padding: 15px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        font-family: Arial, sans-serif;
    `;
    
    // Add label
    const label = document.createElement('div');
    label.textContent = 'Background Color';
    label.style.cssText = `
        font-size: 12px;
        font-weight: bold;
        margin-bottom: 10px;
        text-align: center;
        color: #333;
    `;
    container.appendChild(label);
    
    // Color options
    const colors = [
        '#f8fafc', // Default gray
        '#ffffff', // White
        '#f1f5f9', // Light gray
        '#e2e8f0', // Medium gray
        '#cbd5e1', // Darker gray
        '#3b82f6', // Blue
        '#10b981', // Green
        '#f59e0b', // Yellow
        '#ef4444', // Red
    ];
    
    // Create color grid
    const grid = document.createElement('div');
    grid.style.cssText = `
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 8px;
    `;
    
    colors.forEach(color => {
        const colorBox = document.createElement('div');
        colorBox.style.cssText = `
            width: 30px;
            height: 30px;
            background-color: ${color};
            border: 2px solid #ddd;
            border-radius: 4px;
            cursor: pointer;
            transition: all 0.2s ease;
        `;
        
        colorBox.addEventListener('click', () => {
            console.log(`🎨 Color selected: ${color}`);
            document.body.style.backgroundColor = color;
            
            // Update all color boxes to show selection
            grid.querySelectorAll('div').forEach(box => {
                box.style.border = '2px solid #ddd';
            });
            colorBox.style.border = '2px solid #3b82f6';
        });
        
        colorBox.addEventListener('mouseenter', () => {
            colorBox.style.transform = 'scale(1.1)';
        });
        
        colorBox.addEventListener('mouseleave', () => {
            colorBox.style.transform = 'scale(1)';
        });
        
        grid.appendChild(colorBox);
    });
    
    container.appendChild(grid);
    
    // Add to page
    document.body.appendChild(container);
    console.log('✅ Immediate color picker created and added to page');
}

// Execute immediately when script loads
console.log('🎨 ForceColorPicker.js: About to create color picker...');
createImmediateColorPicker();

// Also try after DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('🎨 DOM ready, creating color picker...');
        setTimeout(createImmediateColorPicker, 100);
    });
} else {
    console.log('🎨 DOM already ready, creating color picker now...');
    setTimeout(createImmediateColorPicker, 100);
}

console.log('🎨 ForceColorPicker.js: Script execution complete');
