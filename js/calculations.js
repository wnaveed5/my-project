// Calculations and mathematical operations for the purchase order

// Calculate subtotal from line items
function calculateSubtotal() {
    const totalCells = document.querySelectorAll('table.itemtable tbody tr td:last-child .editable-field');
    
    let subtotal = 0;
    let rowCount = 0;
    
    totalCells.forEach((cell, index) => {
        const rawText = cell.textContent.trim();
        const value = parseFloat(rawText.replace(/[$,]/g, '')) || 0;
        subtotal += value;
        rowCount++;
    });
    
    const finalSubtotal = subtotal.toFixed(2);
    return finalSubtotal;
}

// Calculate total including tax, shipping, and other
function calculateTotal() {
    const subtotal = parseFloat(calculateSubtotal()) || 0;
    
    // Find tax, shipping, and other fields by looking for text content
    const allCells = document.querySelectorAll('td');
    let tax = 0, shipping = 0, other = 0;
    
    allCells.forEach((cell, index) => {
        const cellText = cell.textContent.trim();
        
        if (cellText.includes('TAX:')) {
            const taxField = cell.nextElementSibling?.querySelector('.editable-field');
            if (taxField) {
                const rawTax = taxField.textContent.trim();
                tax = parseFloat(rawTax.replace(/[$,]/g, '')) || 0;
            }
        } else if (cellText.includes('SHIPPING:')) {
            const shippingField = cell.nextElementSibling?.querySelector('.editable-field');
            if (shippingField) {
                const rawShipping = shippingField.textContent.trim();
                shipping = parseFloat(rawShipping.replace(/[$,]/g, '')) || 0;
            }
        } else if (cellText.includes('OTHER:')) {
            const otherField = cell.nextElementSibling?.querySelector('.editable-field');
            if (otherField) {
                const rawOther = otherField.textContent.trim();
                other = parseFloat(rawOther.replace(/[$,]/g, '')) || 0;
            }
        }
    });
    
    const total = subtotal + tax + shipping + other;
    return total.toFixed(2);
}

// Auto-calculate line item amounts when quantity or rate changes
function calculateLineItemAmount(row) {
    console.group('CALCULATING LINE ITEM AMOUNT');
    
    // Get current column mapping
    const columnMap = window.UTILS ? window.UTILS.getCurrentColumnMapping() : getCurrentColumnMapping();
    
    const quantityField = row.querySelector(`td:nth-child(${columnMap.quantity + 1}) .editable-field`); // Qty column
    const rateField = row.querySelector(`td:nth-child(${columnMap.unitPrice + 1}) .editable-field`); // Unit Price column
    const amountField = row.querySelector(`td:nth-child(${columnMap.total + 1}) .editable-field`); // Total Price column
    
    console.log(`Fields found:`);
    console.log(`  Quantity field: ${quantityField ? 'Found' : 'Missing'}`);
    console.log(`  Rate field: ${rateField ? 'Found' : 'Missing'}`);
    console.log(`  Amount field: ${amountField ? 'Found' : 'Missing'}`);
    
    if (quantityField && rateField && amountField) {
        const rawQty = quantityField.textContent.trim();
        const rawRate = rateField.textContent.trim();
        
        const quantity = parseFloat(rawQty.replace(/[$,]/g, '')) || 0;
        const rate = parseFloat(rawRate.replace(/[$,]/g, '')) || 0;
        const amount = quantity * rate;
        
        console.log(`Calculation: "${rawQty}" × "${rawRate}" = ${quantity} × ${rate} = ${amount}`);
        
        amountField.textContent = amount.toFixed(2);
        console.log(`Updated amount field to: ${amount.toFixed(2)}`);
        console.groupEnd();
        return amount;
    } else {
        console.warn(`Missing required fields for calculation`);
        console.groupEnd();
        return 0;
    }
}

// Update all totals when line items change
function updateAllTotals() {
    // Update subtotal
    const allCells = document.querySelectorAll('td');
    let subtotalField = null, totalField = null;
    
    allCells.forEach((cell, index) => {
        const cellText = cell.textContent.trim();
        if (cellText.includes('SUBTOTAL:')) {
            subtotalField = cell.nextElementSibling?.querySelector('.editable-field');
        } else if (cellText.includes('TOTAL:')) {
            // Look for the total field in the same cell or nearby
            totalField = cell.querySelector('.total-field') || 
                        cell.querySelector('.editable-field') ||
                        cell.nextElementSibling?.querySelector('.editable-field');
        }
    });
    
    if (subtotalField) {
        const oldSubtotal = subtotalField.textContent.trim();
        const newSubtotal = calculateSubtotal();
        subtotalField.textContent = newSubtotal;
    }
    
    if (totalField) {
        const oldTotal = totalField.textContent.trim();
        const newTotal = calculateTotal();
        totalField.textContent = newTotal;
    }
}

// Fallback function for column mapping if UTILS is not available
function getCurrentColumnMapping() {
    const headerRow = document.querySelector('table.itemtable thead tr');
    const headers = Array.from(headerRow.querySelectorAll('th'));
    const columnMap = {};
    
    console.log('🔍 Getting current column mapping...');
    headers.forEach((header, index) => {
        const headerText = header.textContent.replace(/ID:.*$/g, '').trim();
        console.log(`  Column ${index}: "${headerText}"`);
        
        if (headerText.includes('Item#')) {
            columnMap.item = index;
            console.log(`    → Mapped to 'item' at index ${index}`);
        } else if (headerText.includes('Description')) {
            columnMap.description = index;
            console.log(`    → Mapped to 'description' at index ${index}`);
        } else if (headerText.includes('Qty')) {
            columnMap.quantity = index;
            console.log(`    → Mapped to 'quantity' at index ${index}`);
        } else if (headerText.includes('Unit Price')) {
            columnMap.unitPrice = index;
            console.log(`    → Mapped to 'unitPrice' at index ${index}`);
        } else if (headerText.includes('Total Price')) {
            columnMap.total = index;
            console.log(`    → Mapped to 'total' at index ${index}`);
        }
    });
    
    console.log('📋 Final column mapping:', columnMap);
    return columnMap;
}

// Initialize calculations and event listeners
function initializeCalculations() {
    // Add auto-calculation to all editable fields
    const editableFields = document.querySelectorAll('.editable-field');
    
    editableFields.forEach(field => {
        // Store the original input and blur handlers
        const originalInputHandler = field.oninput;
        const originalBlurHandler = field.onblur;

        // Enhanced input handler that combines original functionality with new features
        field.addEventListener('input', function(e) {
            // Call original input handler if it exists
            if (originalInputHandler) {
                originalInputHandler.call(this, e);
            }
            
            // Auto-calculate line item amounts if this is a quantity or rate field
            const row = this.closest('tr');
            if (row && row.parentNode.tagName === 'TBODY') {
                // Check if this is a quantity or rate field (new column positions)
                // Get current column mapping
                const columnMap = window.UTILS ? window.UTILS.getCurrentColumnMapping() : getCurrentColumnMapping();
                
                const isQuantityField = this.closest('td') === row.querySelector(`td:nth-child(${columnMap.quantity + 1})`); // Qty column
                const isRateField = this.closest('td') === row.querySelector(`td:nth-child(${columnMap.unitPrice + 1})`); // Unit Price column
                const isTotalPriceField = this.closest('td') === row.querySelector(`td:nth-child(${columnMap.total + 1})`); // Total Price column
                
                if (isQuantityField || isRateField) {
                    // Calculate amount for this line item
                    calculateLineItemAmount(row);
                    // Update all totals
                    updateAllTotals();
                }
                
                // If Total Price field is manually edited, update subtotal
                if (isTotalPriceField) {
                    updateAllTotals();
                }
            }
        });

        // Enhanced blur handler that combines original functionality with new features
        field.addEventListener('blur', function(e) {
            // Call original blur handler if it exists
            if (originalBlurHandler) {
                originalBlurHandler.call(this, e);
            }
            
            // Update totals when user finishes editing
            const row = this.closest('tr');
            if (row && row.parentNode.tagName === 'TBODY') {
                updateAllTotals();
            }
            
            // Also update totals if this is a tax, shipping, or other field
            const cellText = this.closest('td')?.textContent || '';
            if (cellText.includes('TAX:') || cellText.includes('SHIPPING:') || cellText.includes('OTHER:')) {
                updateAllTotals();
            }
            
            // Also update totals if this is a Total Price field
            const columnMap = window.UTILS ? window.UTILS.getCurrentColumnMapping() : getCurrentColumnMapping();
            const isTotalPriceField = this.closest('td') === row?.querySelector(`td:nth-child(${columnMap.total + 1})`);
            if (isTotalPriceField) {
                updateAllTotals();
            }
        });
    });

    // Initialize totals on page load
    updateAllTotals();
}

// Export calculations functionality
window.CALCULATIONS = {
    calculateSubtotal,
    calculateTotal,
    calculateLineItemAmount,
    updateAllTotals,
    initializeCalculations
};
