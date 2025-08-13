class HeaderColorPicker {
    constructor() {
        this.init();
    }

    init() {
        this.createColorPickerUI();
        this.bindEvents();
        console.log('🎨 Header color picker initialized');
    }

    createColorPickerUI() {
        const colorPickerContainer = document.createElement('div');
        colorPickerContainer.id = 'header-color-picker';
        colorPickerContainer.className = 'header-color-picker';
        colorPickerContainer.innerHTML = `
            <div class="color-picker-header">
                <h3>🎨 Header Color Picker</h3>
                <button class="close-btn" id="close-color-picker">×</button>
            </div>
            <div class="color-picker-content">
                <div class="color-section">
                    <label>Header Block Background:</label>
                    <div class="color-inputs">
                        <input type="color" id="header-color" value="#333333">
                        <input type="text" id="header-hex" placeholder="#333333" maxlength="7">
                    </div>
                </div>
                <div class="color-actions">
                    <button id="apply-header-color" class="apply-btn">Apply Color</button>
                    <button id="reset-colors" class="reset-btn">Reset to Default</button>
                </div>
            </div>
        `;

        document.body.appendChild(colorPickerContainer);

        const toggleButton = document.createElement('button');
        toggleButton.id = 'toggle-color-picker';
        toggleButton.className = 'toggle-color-picker-btn';
        toggleButton.innerHTML = '🎨 Header Colors';
        toggleButton.title = 'Open Header Color Picker';
        document.body.appendChild(toggleButton);
    }

    bindEvents() {
        document.getElementById('toggle-color-picker').addEventListener('click', () => {
            this.toggleColorPicker();
        });

        document.getElementById('close-color-picker').addEventListener('click', () => {
            this.hideColorPicker();
        });

        document.getElementById('apply-header-color').addEventListener('click', () => {
            this.applyHeaderColor();
        });

        document.getElementById('reset-colors').addEventListener('click', () => {
            this.resetColors();
        });

        this.bindColorInputs();
        this.bindHexInputs();
    }

    bindColorInputs() {
        const colorInput = document.getElementById('header-color');
        colorInput.addEventListener('change', (e) => {
            const hexInput = document.getElementById('header-hex');
            if (hexInput) {
                hexInput.value = e.target.value;
            }
        });
    }

    bindHexInputs() {
        const hexInput = document.getElementById('header-hex');
        hexInput.addEventListener('input', (e) => {
            const colorInput = document.getElementById('header-color');
            if (colorInput && this.isValidHex(e.target.value)) {
                colorInput.value = e.target.value;
            }
        });

        hexInput.addEventListener('blur', (e) => {
            if (!this.isValidHex(e.target.value)) {
                e.target.value = '';
            }
        });
    }

    isValidHex(hex) {
        return /^#[0-9A-F]{6}$/i.test(hex);
    }

    applyHeaderColor() {
        const color = document.getElementById('header-color').value;
        const blocks = this.getAllHeaderBlocks();
        blocks.forEach(block => {
            block.style.backgroundColor = color;
            if (block.tagName === 'TD' || block.tagName === 'TH') {
                block.style.color = '#ffffff';
            }
        });
        console.log(`✅ Applied background ${color} to ${blocks.length} header blocks`);
        if (window.XML_GENERATOR && typeof window.XML_GENERATOR.updateXmlPreview === 'function') {
            window.XML_GENERATOR.updateXmlPreview();
        }
    }

    getAllHeaderBlocks() {
        const elements = [];

        // Section headers: Vendor, Ship To, Requisitioner/Ship Via/FOB/Shipping Terms, Comments title
        document.querySelectorAll('.section-header').forEach(el => elements.push(el));

        // Item table header row
        document.querySelectorAll('.itemtable thead th').forEach(el => elements.push(el));

        // Purchase Order title cell
        const tdCandidates = document.querySelectorAll('td');
        tdCandidates.forEach(td => {
            if (td.textContent && td.textContent.trim().toLowerCase() === 'purchase order') {
                elements.push(td);
            }
        });

        return elements;
    }

    resetColors() {
        // Reset picker inputs
        document.getElementById('header-color').value = '#333333';
        document.getElementById('header-hex').value = '#333333';

        // Clear inline styles to fall back to CSS defaults
        const blocks = this.getAllHeaderBlocks();
        blocks.forEach(block => {
            block.style.backgroundColor = '';
            block.style.color = '';
        });

        console.log('✅ Header block colors reset to defaults');
        if (window.XML_GENERATOR && typeof window.XML_GENERATOR.updateXmlPreview === 'function') {
            window.XML_GENERATOR.updateXmlPreview();
        }
    }

    toggleColorPicker() {
        const colorPicker = document.getElementById('header-color-picker');
        if (colorPicker.style.display === 'none' || !colorPicker.style.display) {
            this.showColorPicker();
        } else {
            this.hideColorPicker();
        }
    }

    showColorPicker() {
        const colorPicker = document.getElementById('header-color-picker');
        colorPicker.style.display = 'block';
        document.getElementById('toggle-color-picker').textContent = '🎨 Hide Colors';
    }

    hideColorPicker() {
        const colorPicker = document.getElementById('header-color-picker');
        colorPicker.style.display = 'none';
        document.getElementById('toggle-color-picker').textContent = '🎨 Header Colors';
    }
}

window.HeaderColorPicker = HeaderColorPicker;
