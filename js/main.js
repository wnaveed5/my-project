// Main application initialization and template loading

// Application state
let appState = {
    isInitialized: false,
    templates: {},
    currentForm: null
};

// Initialize the application
async function initializeApp() {
    console.log('🚀 Initializing Purchase Order Generator...');
    
    try {
        // Load templates
        await loadTemplates();
        
        // Load the main form
        await loadPurchaseOrderForm();
        
        // Initialize all functionality
        initializeAllFeatures();
        
        appState.isInitialized = true;
        console.log('✅ Application initialized successfully');
        
    } catch (error) {
        console.error('❌ Failed to initialize application:', error);
        showError('Failed to initialize application. Please refresh the page.');
    }
}

// Load HTML templates
async function loadTemplates() {
    console.log('📋 Loading templates...');
    
    try {
        // Load purchase order form template
        const formResponse = await fetch('templates/purchase-order-form.html');
        if (!formResponse.ok) throw new Error('Failed to load form template');
        appState.templates.purchaseOrderForm = await formResponse.text();
        
        // Load XML modal template
        const modalResponse = await fetch('templates/xml-modal.html');
        if (!modalResponse.ok) throw new Error('Failed to load modal template');
        appState.templates.xmlModal = await modalResponse.text();
        
        console.log('✅ Templates loaded successfully');
        
    } catch (error) {
        console.error('❌ Failed to load templates:', error);
        throw error;
    }
}

// Load the purchase order form into the app container
async function loadPurchaseOrderForm() {
    console.log('📝 Loading purchase order form...');
    
    const appContainer = document.getElementById('app');
    if (!appContainer) {
        throw new Error('App container not found');
    }
    
    // Insert the form template
    appContainer.innerHTML = appState.templates.purchaseOrderForm;
    
    // Insert the XML modal template
    appContainer.insertAdjacentHTML('beforeend', appState.templates.xmlModal);
    
    // Verify modal elements are in DOM
    const modal = document.getElementById('xmlModal');
    const xmlOutput = document.getElementById('xmlOutput');
    console.log('🔍 Modal template loaded - Modal element:', modal);
    console.log('🔍 Modal template loaded - XML output element:', xmlOutput);
    
    console.log('✅ Purchase order form loaded');
}

// Initialize all application features
function initializeAllFeatures() {
    console.log('⚙️ Initializing application features...');
    
    // Initialize editable fields
    initializeEditableFields();
    
    // Initialize drag and drop functionality
    if (window.DRAG_AND_DROP) {
        window.DRAG_AND_DROP.initializeDragAndDrop();
        window.DRAG_AND_DROP.updateLineItemIDs();
        window.DRAG_AND_DROP.updateColumnIDs();
    }
    
    // Initialize calculations
    if (window.CALCULATIONS) {
        window.CALCULATIONS.initializeCalculations();
    }
    
    // Initialize event listeners
    initializeEventListeners();
    
    console.log('✅ All features initialized');
}

// Initialize editable fields with event handlers
function initializeEditableFields() {
    console.log('✏️ Initializing editable fields...');
    
    const editableFields = document.querySelectorAll('.editable-field');
    
    editableFields.forEach(field => {
        // Store original placeholder
        const placeholder = field.getAttribute('data-placeholder');
        
        // Handle focus
        field.addEventListener('focus', function() {
            if (this.textContent.trim() === '') {
                this.textContent = '';
            }
            // Remove error highlighting on focus
            this.style.backgroundColor = '';
            this.style.border = '';
        });
        
        // Handle blur
        field.addEventListener('blur', function() {
            if (this.textContent.trim() === '') {
                this.textContent = '';
            }
        });
        
        // Handle input
        field.addEventListener('input', function() {
            // Remove placeholder styling when user types
            if (this.textContent.trim() !== '') {
                this.classList.remove('placeholder');
            }
            // Remove error highlighting when typing
            this.style.backgroundColor = '';
            this.style.border = '';
        });
    });
    
    console.log(`✅ Initialized ${editableFields.length} editable fields`);
}

// Initialize event listeners for buttons and interactions
function initializeEventListeners() {
    console.log('🎯 Initializing event listeners...');
    
    // Add click handler for convert button
    const convertBtn = document.getElementById('convertToXmlBtn');
    if (convertBtn) {
        convertBtn.addEventListener('click', function() {
            if (window.XML_GENERATOR) {
                window.XML_GENERATOR.convertToXml();
            } else {
                console.error('XML Generator not available');
                showError('XML Generator not available. Please refresh the page.');
            }
        });
    }
    
    // Close modal when clicking outside
    window.onclick = function(event) {
        const modal = document.getElementById('xmlModal');
        if (event.target === modal) {
            if (window.XML_GENERATOR) {
                window.XML_GENERATOR.closeXmlModal();
            }
        }
    };
    
    console.log('✅ Event listeners initialized');
}

// Show error message to user
function showError(message) {
    console.error('❌ Error:', message);
    
    // Create error notification
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #dc3545;
        color: white;
        padding: 15px 20px;
        border-radius: 5px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        z-index: 10000;
        max-width: 300px;
    `;
    errorDiv.textContent = message;
    
    // Add close button
    const closeBtn = document.createElement('button');
    closeBtn.textContent = '×';
    closeBtn.style.cssText = `
        background: none;
        border: none;
        color: white;
        font-size: 20px;
        cursor: pointer;
        margin-left: 10px;
    `;
    closeBtn.onclick = () => errorDiv.remove();
    errorDiv.appendChild(closeBtn);
    
    document.body.appendChild(errorDiv);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (errorDiv.parentNode) {
            errorDiv.remove();
        }
    }, 5000);
}

// Show success message to user
function showSuccess(message) {
    console.log('✅ Success:', message);
    
    // Create success notification
    const successDiv = document.createElement('div');
    successDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #28a745;
        color: white;
        padding: 15px 20px;
        border-radius: 5px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        z-index: 10000;
        max-width: 300px;
    `;
    successDiv.textContent = message;
    
    // Add close button
    const closeBtn = document.createElement('button');
    closeBtn.textContent = '×';
    closeBtn.style.cssText = `
        background: none;
        border: none;
        color: white;
        font-size: 20px;
        cursor: pointer;
        margin-left: 10px;
    `;
    closeBtn.onclick = () => successDiv.remove();
    successDiv.appendChild(closeBtn);
    
    document.body.appendChild(successDiv);
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
        if (successDiv.parentNode) {
            successDiv.remove();
        }
    }, 3000);
}

// Utility function to check if all required modules are loaded
function checkModuleAvailability() {
    const requiredModules = ['UTILS', 'DRAG_AND_DROP', 'CALCULATIONS', 'XML_GENERATOR'];
    const missingModules = [];
    
    requiredModules.forEach(moduleName => {
        if (!window[moduleName]) {
            missingModules.push(moduleName);
        }
    });
    
    if (missingModules.length > 0) {
        console.warn('⚠️ Missing modules:', missingModules);
        return false;
    }
    
    return true;
}

// Wait for DOM to be ready and initialize
document.addEventListener('DOMContentLoaded', function() {
    console.log('🌐 DOM loaded, checking module availability...');
    
    // Check if all required modules are available
    if (checkModuleAvailability()) {
        console.log('✅ All modules available, initializing application...');
        initializeApp();
    } else {
        console.error('❌ Required modules not available');
        showError('Required modules not loaded. Please check the console for errors.');
    }
});

// Export main functionality
window.MAIN_APP = {
    initializeApp,
    loadTemplates,
    loadPurchaseOrderForm,
    initializeAllFeatures,
    showError,
    showSuccess,
    checkModuleAvailability
};
