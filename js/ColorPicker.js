// Simple React Color Picker Component
class ColorPicker extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedColor: '#f8fafc', // Default gray color
            isOpen: false
        };
        
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
    }
    
    componentDidMount() {
        // Apply the initial color
        this.applyColor(this.state.selectedColor);
    }
    
    applyColor = (color) => {
        document.documentElement.style.setProperty('--background-color', color);
        document.body.style.backgroundColor = color;
        
        // Dispatch custom event to notify other parts of the app
        window.dispatchEvent(new CustomEvent('colorChanged', { 
            detail: { color } 
        }));
    }
    
    handleColorSelect = (color) => {
        this.setState({ 
            selectedColor: color, 
            isOpen: false 
        });
        this.applyColor(color);
    }
    
    togglePalette = () => {
        this.setState({ isOpen: !this.state.isOpen });
    }
    
    render() {
        const { selectedColor, isOpen } = this.state;
        
        return React.createElement('div', {
            className: 'color-picker-container',
            style: {
                position: 'fixed',
                top: '20px',
                right: '20px',
                zIndex: 1000,
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                borderRadius: '8px',
                padding: '12px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                border: '1px solid #e5e7eb',
                fontFamily: 'inherit'
            }
        }, [
            React.createElement('div', {
                key: 'label',
                style: {
                    fontSize: '12px',
                    fontWeight: 'bold',
                    color: '#374151',
                    marginBottom: '8px',
                    textAlign: 'center'
                }
            }, 'Background Color'),
            
            React.createElement('div', {
                key: 'current-color',
                onClick: this.togglePalette,
                style: {
                    width: '40px',
                    height: '40px',
                    backgroundColor: selectedColor,
                    border: '2px solid #d1d5db',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    margin: '0 auto 8px auto',
                    transition: 'all 0.2s ease',
                    boxShadow: isOpen ? '0 0 0 2px #3b82f6' : 'none'
                },
                title: `Current color: ${selectedColor}`
            }),
            
            isOpen && React.createElement('div', {
                key: 'palette',
                style: {
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: '4px',
                    marginTop: '8px'
                }
            }, this.colorPalette.map(color => 
                React.createElement('div', {
                    key: color,
                    onClick: () => this.handleColorSelect(color),
                    style: {
                        width: '24px',
                        height: '24px',
                        backgroundColor: color,
                        border: selectedColor === color ? '2px solid #3b82f6' : '1px solid #d1d5db',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        transition: 'all 0.1s ease'
                    },
                    title: color,
                    onMouseEnter: (e) => {
                        e.target.style.transform = 'scale(1.1)';
                    },
                    onMouseLeave: (e) => {
                        e.target.style.transform = 'scale(1)';
                    }
                })
            ))
        ]);
    }
}

// Mount the React component
window.mountColorPicker = () => {
    console.log('🎨 Mounting color picker component...');
    const colorPickerRoot = document.getElementById('color-picker-root');
    if (colorPickerRoot) {
        console.log('✅ Color picker root found, rendering component...');
        ReactDOM.render(React.createElement(ColorPicker), colorPickerRoot);
        console.log('✅ Color picker component rendered');
    } else {
        console.error('❌ Color picker root element not found');
    }
};

// Export for use in other files
window.ColorPicker = ColorPicker;

console.log('🎨 ColorPicker.js loaded successfully');