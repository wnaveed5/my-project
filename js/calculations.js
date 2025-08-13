// Calculations and mathematical operations for the purchase order

// Calculate subtotal from line items
function calculateSubtotal() {
    const totalCells = document.querySelectorAll('table.itemtable tbody tr td:last-child .editable-field');
    
    let subtotal = 0;
    let rowCount = 0;
    
    totalCells.forEach((cell, index) => {
        const rawText = cell.textContent.trim();
        const value = window.CURRENCY_FORMATTER ? window.CURRENCY_FORMATTER.parse(rawText) : parseFloat(rawText.replace(/[$,]/g, '')) || 0;
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
                tax = window.CURRENCY_FORMATTER ? window.CURRENCY_FORMATTER.parse(rawTax) : parseFloat(rawTax.replace(/[$,]/g, '')) || 0;
            }
        } else if (cellText.includes('SHIPPING:')) {
            const shippingField = cell.nextElementSibling?.querySelector('.editable-field');
            if (shippingField) {
                const rawShipping = shippingField.textContent.trim();
                shipping = window.CURRENCY_FORMATTER ? window.CURRENCY_FORMATTER.parse(rawShipping) : parseFloat(rawShipping.replace(/[$,]/g, '')) || 0;
            }
        } else if (cellText.includes('OTHER:')) {
            const otherField = cell.nextElementSibling?.querySelector('.editable-field');
            if (otherField) {
                const rawOther = otherField.textContent.trim();
                other = window.CURRENCY_FORMATTER ? window.CURRENCY_FORMATTER.parse(rawOther) : parseFloat(rawOther.replace(/[$,]/g, '')) || 0;
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
    
    if (!columnMap || columnMap.quantity === undefined || columnMap.unitPrice === undefined || columnMap.total === undefined) {
        console.warn('Column mapping not available or incomplete, skipping calculation');
        console.groupEnd();
        return 0;
    }
    
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
        
        const quantity = window.CURRENCY_FORMATTER ? window.CURRENCY_FORMATTER.parse(rawQty) : parseFloat(rawQty.replace(/[$,]/g, '')) || 0;
        const rate = window.CURRENCY_FORMATTER ? window.CURRENCY_FORMATTER.parse(rawRate) : parseFloat(rawRate.replace(/[$,]/g, '')) || 0;
        const amount = quantity * rate;
        
        console.log(`Calculation: "${rawQty}" × "${rawRate}" = ${quantity} × ${rate} = ${amount}`);
        
        // Only set amount if it's greater than 0, otherwise keep empty
        if (amount > 0) {
            const formattedAmount = window.CURRENCY_FORMATTER ? window.CURRENCY_FORMATTER.format(amount) : '$' + amount.toFixed(2);
            amountField.textContent = formattedAmount;
        } else {
            amountField.textContent = '';
        }
        console.log(`Updated amount field to: ${amountField.textContent}`);
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
        const newSubtotal = calculateSubtotal();
        // Only update if there are actual line items with values > 0
        const lineItemCells = document.querySelectorAll('table.itemtable tbody tr td:last-child .editable-field');
        let hasValidLineItems = false;
        
        lineItemCells.forEach(cell => {
            const value = window.CURRENCY_FORMATTER ? window.CURRENCY_FORMATTER.parse(cell.textContent) : parseFloat(cell.textContent.replace(/[$,]/g, '')) || 0;
            if (value > 0) hasValidLineItems = true;
        });
        
        if (hasValidLineItems && parseFloat(newSubtotal) > 0) {
            subtotalField.textContent = window.CURRENCY_FORMATTER ? window.CURRENCY_FORMATTER.format(newSubtotal) : '$' + newSubtotal;
        } else if (!hasValidLineItems) {
            subtotalField.textContent = ''; // Keep empty if no valid line items
        }
    }
    
    if (totalField) {
        const newTotal = calculateTotal();
        // Only update if there are actual values > 0
        if (parseFloat(newTotal) > 0) {
            totalField.textContent = window.CURRENCY_FORMATTER ? window.CURRENCY_FORMATTER.format(newTotal) : '$' + newTotal;
        } else {
            totalField.textContent = ''; // Keep empty if no valid total
        }
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
        
        // Enhanced detection logic with individual checks (not else-if chain)
        console.log(`    🔍 Checking column ${index}: "${headerText}"`);
        
        if (headerText.includes('Item#') || headerText.includes('Item')) {
            columnMap.item = index;
            console.log(`    ✅ Mapped to 'item' at index ${index}`);
        } 
        
        if (headerText.includes('Description') || headerText.includes('Desc')) {
            columnMap.description = index;
            console.log(`    ✅ Mapped to 'description' at index ${index}`);
        } 
        
        if (headerText.includes('Qty') || headerText.includes('Quantity')) {
            columnMap.quantity = index;
            console.log(`    ✅ Mapped to 'quantity' at index ${index}`);
        } 
        
        if (headerText.includes('Rate') || headerText.includes('Unit Price') || headerText.includes('RATE') || headerText.includes('Price')) {
            // Enhanced Rate detection - check for Rate, Unit Price, RATE, or Price
            columnMap.rate = index;
            columnMap.unitPrice = index; // legacy alias
            console.log(`    ✅ Mapped to 'rate' at index ${index}`);
        } 
        
        if (headerText.includes('Amount') || headerText.includes('Total') || headerText.includes('AMOUNT') || headerText.includes('TOTAL')) {
            // Enhanced Amount detection - check for Amount, Total, AMOUNT, or TOTAL
            columnMap.amount = index;
            columnMap.total = index; // legacy alias
            console.log(`    ✅ Mapped to 'amount' at index ${index}`);
        }
        
        // Check if this column wasn't mapped to anything
        const mapped = (columnMap.item === index) || (columnMap.description === index) || 
                      (columnMap.quantity === index) || (columnMap.rate === index) || (columnMap.amount === index);
        if (!mapped && headerText.trim() !== '') {
            console.log(`    ❌ No mapping for column ${index} with text "${headerText}"`);
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
                
                if (!columnMap || columnMap.quantity === undefined || columnMap.unitPrice === undefined || columnMap.total === undefined) {
                    console.warn('Column mapping not available or incomplete');
                    return;
                }
                
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
            if (row) {
                const columnMap = window.UTILS ? window.UTILS.getCurrentColumnMapping() : getCurrentColumnMapping();
                if (columnMap && columnMap.total !== undefined && !isNaN(columnMap.total)) {
                    const isTotalPriceField = this.closest('td') === row.querySelector(`td:nth-child(${columnMap.total + 1})`);
                    if (isTotalPriceField) {
                        updateAllTotals();
                    }
                }
            }
        });
    });

    // Don't auto-calculate on page load - let fields stay empty
}

// Export calculations functionality
window.CALCULATIONS = {
    calculateSubtotal,
    calculateTotal,
    calculateLineItemAmount,
    updateAllTotals,
    initializeCalculations
};
