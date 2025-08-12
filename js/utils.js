// Utility functions and field mapping configuration

// Comprehensive field mapping configuration
const FIELD_MAPPING = {
    // Company Info
    companyName: 'td[style*="width: 60%"] table tr:nth-child(1) td table tr:nth-child(1) td .editable-field',
    companyAddress: 'td[style*="width: 60%"] table tr:nth-child(1) td table tr:nth-child(2) td .editable-field',
    companyCityState: 'td[style*="width: 60%"] table tr:nth-child(1) td table tr:nth-child(3) td .editable-field',
    companyPhone: 'td[style*="width: 60%"] table tr:nth-child(1) td table tr:nth-child(4) td .editable-field',
    companyFax: 'td[style*="width: 60%"] table tr:nth-child(1) td table tr:nth-child(5) td .editable-field',
    companyWebsite: 'td[style*="width: 60%"] table tr:nth-child(1) td table tr:nth-child(6) td .editable-field',
    
    // PO Details
    poDate: 'td[style*="width: 40%"] table tr:nth-child(2) td table tr:nth-child(1) td:last-child .editable-field',
    poNumber: 'td[style*="width: 40%"] table tr:nth-child(2) td table tr:nth-child(2) td:last-child .editable-field',
    
    // Vendor Section
    vendorCompany: 'td[style*="width: 50%"]:first-child table tr:nth-child(2) td table tr:nth-child(1) td .editable-field',
    vendorContact: 'td[style*="width: 50%"]:first-child table tr:nth-child(2) td table tr:nth-child(2) td .editable-field',
    vendorAddress: 'td[style*="width: 50%"]:first-child table tr:nth-child(2) td table tr:nth-child(3) td .editable-field',
    vendorCityState: 'td[style*="width: 50%"]:first-child table tr:nth-child(2) td table tr:nth-child(4) td .editable-field',
    vendorPhone: 'td[style*="width: 50%"]:first-child table tr:nth-child(2) td table tr:nth-child(5) td .editable-field',
    vendorFax: 'td[style*="width: 50%"]:first-child table tr:nth-child(2) td table tr:nth-child(6) td .editable-field',
    
    // Ship To Section
    shipToName: 'td[style*="width: 50%"]:last-child table tr:nth-child(2) td table tr:nth-child(1) td .editable-field',
    shipToCompany: 'td[style*="width: 50%"]:last-child table tr:nth-child(2) td table tr:nth-child(2) td .editable-field',
    shipToAddress: 'td[style*="width: 50%"]:last-child table tr:nth-child(2) td table tr:nth-child(3) td .editable-field',
    shipToCityState: 'td[style*="width: 50%"]:last-child table tr:nth-child(2) td table tr:nth-child(4) td .editable-field',
    shipToPhone: 'td[style*="width: 50%"]:last-child table tr:nth-child(2) td table tr:nth-child(5) td .editable-field',
    
    // Shipping Details
    requisitioner: 'td[style*="width: 25%"]:nth-of-type(1) .editable-field',
    shipVia: 'td[style*="width: 25%"]:nth-of-type(2) .editable-field',
    fob: 'td[style*="width: 25%"]:nth-of-type(3) .editable-field',
    shippingTerms: 'td[style*="width: 25%"]:nth-of-type(4) .editable-field',
    
    // Line Items (up to 5 items) - Fixed to match actual HTML structure
    lineItem1Qty: 'table.itemtable tbody tr:nth-child(1) td:nth-child(1) .editable-field',
    lineItem1Item: 'table.itemtable tbody tr:nth-child(1) td:nth-child(2) .itemname .editable-field',
    lineItem1Desc: 'table.itemtable tbody tr:nth-child(1) td:nth-child(2) .editable-field:nth-of-type(2)',
    lineItem1Options: 'table.itemtable tbody tr:nth-child(1) td:nth-child(3) .editable-field',
    lineItem1Rate: 'table.itemtable tbody tr:nth-child(1) td:nth-child(4) .editable-field',
    lineItem1Amount: 'table.itemtable tbody tr:nth-child(1) td:nth-child(5) .editable-field',
    
    lineItem2Qty: 'table.itemtable tbody tr:nth-child(2) td:nth-child(1) .editable-field',
    lineItem2Item: 'table.itemtable tbody tr:nth-child(2) td:nth-child(2) .itemname .editable-field',
    lineItem2Desc: 'table.itemtable tbody tr:nth-child(2) td:nth-child(2) .editable-field:nth-of-type(2)',
    lineItem2Options: 'table.itemtable tbody tr:nth-child(2) td:nth-child(3) .editable-field',
    lineItem2Rate: 'table.itemtable tbody tr:nth-child(2) td:nth-child(4) .editable-field',
    lineItem2Amount: 'table.itemtable tbody tr:nth-child(2) td:nth-child(5) .editable-field',
    
    lineItem3Qty: 'table.itemtable tbody tr:nth-child(3) td:nth-child(1) .editable-field',
    lineItem3Item: 'table.itemtable tbody tr:nth-child(3) td:nth-child(2) .itemname .editable-field',
    lineItem3Desc: 'table.itemtable tbody tr:nth-child(3) td:nth-child(2) .editable-field:nth-of-type(2)',
    lineItem3Options: 'table.itemtable tbody tr:nth-child(3) td:nth-child(3) .editable-field',
    lineItem3Rate: 'table.itemtable tbody tr:nth-child(3) td:nth-child(4) .editable-field',
    lineItem3Amount: 'table.itemtable tbody tr:nth-child(3) td:nth-child(5) .editable-field',
    
    lineItem4Qty: 'table.itemtable tbody tr:nth-child(4) td:nth-child(1) .editable-field',
    lineItem4Item: 'table.itemtable tbody tr:nth-child(4) td:nth-child(2) .itemname .editable-field',
    lineItem4Desc: 'table.itemtable tbody tr:nth-child(4) td:nth-child(2) .editable-field:nth-of-type(2)',
    lineItem4Options: 'table.itemtable tbody tr:nth-child(4) td:nth-child(3) .editable-field',
    lineItem4Rate: 'table.itemtable tbody tr:nth-child(4) td:nth-child(4) .editable-field',
    lineItem4Amount: 'table.itemtable tbody tr:nth-child(4) td:nth-child(5) .editable-field',
    
    lineItem5Qty: 'table.itemtable tbody tr:nth-child(5) td:nth-child(1) .editable-field',
    lineItem5Item: 'table.itemtable tbody tr:nth-child(5) td:nth-child(2) .itemname .editable-field',
    lineItem5Desc: 'table.itemtable tbody tr:nth-child(5) td:nth-child(2) .editable-field:nth-of-type(2)',
    lineItem5Options: 'table.itemtable tbody tr:nth-child(5) td:nth-child(3) .editable-field',
    lineItem5Rate: 'table.itemtable tbody tr:nth-child(5) td:nth-child(4) .editable-field',
    lineItem5Amount: 'table.itemtable tbody tr:nth-child(5) td:nth-child(5) .editable-field',
    
    // Totals Section
    subtotal: 'td[style*="width: 30%"] table tr:nth-child(1) td:last-child .editable-field',
    tax: 'td[style*="width: 30%"] table tr:nth-child(2) td:last-child .editable-field',
    shipping: 'td[style*="width: 30%"] table tr:nth-child(3) td:last-child .editable-field',
    other: 'td[style*="width: 30%"] table tr:nth-child(4) td:last-child .editable-field',
    total: 'td[style*="width: 30%"] table tr:nth-child(5) td:last-child .editable-field',
    
    // Comments Section
    comments: 'td[style*="width: 70%"] .editable-field',
    
    // Footer Contact
    contactInfo: 'td[style*="text-align: center; padding: 20px"] .editable-field'
};

// Helper function to get current column mapping based on visual order
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

// Field validation function - now shows field status without blocking conversion
function validateAllFields() {
    console.group('Field Validation Check');
    const validationResults = {};
    let filledCount = 0;
    let emptyCount = 0;
    
    for (const [fieldName, selector] of Object.entries(FIELD_MAPPING)) {
        const element = document.querySelector(selector);
        const value = element?.textContent.trim() || '';
        const isEmpty = !value;
        
        validationResults[fieldName] = {
            value: value,
            isEmpty: isEmpty,
            element: element,
            selector: selector
        };
        
        if (isEmpty) {
            emptyCount++;
            console.log(`${fieldName}: EMPTY`);
            // Remove any highlighting from empty fields
            if (element) {
                element.style.backgroundColor = '';
                element.style.border = '';
            }
        } else {
            filledCount++;
            console.log(`${fieldName}: "${value}"`);
            // Remove any highlighting from filled fields
            if (element) {
                element.style.backgroundColor = '';
                element.style.border = '';
            }
        }
    }
    
    console.groupEnd();
    
    const message = `Field Status:\n\nFilled: ${filledCount}\nEmpty: ${emptyCount}\n\nYou can convert to XML with partially filled fields.`;
    alert(message);
    
    return true; // Always return true to allow conversion
}

// Utility function to get field values
function getFieldValues() {
    const fieldValues = {};
    Object.keys(FIELD_MAPPING).forEach(key => {
        const element = document.querySelector(FIELD_MAPPING[key]);
        if (element) {
            // Get only the text content, excluding any HTML elements like ID labels
            const value = element.textContent.replace(/ID:.*$/g, '').trim() || '';
            fieldValues[key] = value;
        } else {
            fieldValues[key] = '';
        }
    });
    return fieldValues;
}

// Utility function to get line items from table
function getLineItems() {
    console.group('Line Items Generation - Direct Table Reading');
    let lineItemsHtml = '';
    
    const table = document.querySelector('table.itemtable');
    if (!table) {
        console.error('Line item table not found!');
        console.groupEnd();
        return '';
    }
    
    // Use tbody rows only (skip thead)
    const tbodyRows = table.querySelectorAll('tbody tr');
    console.log(`Total tbody rows found: ${tbodyRows.length}`);
    
    // Get current column order from headers
    const columnMap = getCurrentColumnMapping();
    
    // Process all tbody rows
    tbodyRows.forEach((row, index) => {
        const cells = row.querySelectorAll('td');
        console.log(`Row ${index + 1}: Found ${cells.length} cells`);
        
        if (cells.length >= 6) { // We have 6 cells (drag handle + 5 data cells)
            // Extract values from the actual DOM structure
            // The drag handle is cells[0], so we skip it and read the data cells
            const itemNumber = cells[columnMap.item]?.querySelector('.editable-field')?.textContent.trim() || ''; // Item#
            const description = cells[columnMap.description]?.querySelector('.editable-field')?.textContent.trim() || ''; // Description
            const qty = cells[columnMap.quantity]?.querySelector('.editable-field')?.textContent.trim() || ''; // Qty
            const unitPrice = cells[columnMap.unitPrice]?.querySelector('.editable-field')?.textContent.trim() || ''; // Unit Price
            const totalPrice = cells[columnMap.total]?.querySelector('.editable-field')?.textContent.trim() || ''; // Total Price
            
            console.log(`Row ${index + 1} Data:`);
            console.log(`  Item#: "${itemNumber}"`);
            console.log(`  Description: "${description}"`);
            console.log(`  Qty: "${qty}"`);
            console.log(`  Unit Price: "${unitPrice}"`);
            console.log(`  Total Price: "${totalPrice}"`);
            
            // Only add row if there's meaningful content
            if (itemNumber || description || qty || unitPrice || totalPrice) {
                lineItemsHtml += `
        <tr>
            <td style="padding: 6px; border-bottom: 1px solid #e5e7eb; text-align: center;">${itemNumber}</td>
            <td style="padding: 6px; border-bottom: 1px solid #e5e7eb;">${description}</td>
            <td style="padding: 6px; border-bottom: 1px solid #e5e7eb; text-align: center;">${qty}</td>
            <td style="padding: 6px; border-bottom: 1px solid #e5e7eb; text-align: right;">$${unitPrice}</td>
            <td style="padding: 6px; border-bottom: 1px solid #e5e7eb; text-align: right;">$${totalPrice}</td>
        </tr>`;
                console.log(`Added line item ${index + 1} to XML`);
            } else {
                console.log(`Skipped empty row ${index + 1}`);
            }
        } else {
            console.warn(`Row ${index + 1}: Insufficient cells (${cells.length})`);
        }
    });
    
    console.log(`Total line items generated: ${lineItemsHtml.split('<tr>').length - 1}`);
    console.log(`Final XML HTML:`, lineItemsHtml);
    console.groupEnd();
    return lineItemsHtml;
}

// Export utilities for use in other modules
window.UTILS = {
    FIELD_MAPPING,
    getCurrentColumnMapping,
    validateAllFields,
    getFieldValues,
    getLineItems
};
