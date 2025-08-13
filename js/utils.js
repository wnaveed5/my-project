// Utility functions and field mapping configuration

// Dynamic field mapping that survives DOM rearrangement
const FIELD_MAPPING = {
    // Company Information (using unique IDs - no more label confusion!)
    companyName: '#company-name',
    companyAddress: '#company-address', 
    companyCityState: '#company-city-state',
    companyPhone: '#company-phone',
    companyFax: '#company-fax',
    companyWebsite: '#company-website',
    
    // PO Details (using unique IDs)
    poDate: '#po-date',
    poNumber: '#po-number',
    
    // Vendor Section (using unique IDs)
    vendorCompany: '#vendor-company',
    vendorContact: '#vendor-contact',
    vendorAddress: '#vendor-address',
    vendorCityState: '#vendor-city-state',
    vendorPhone: '#vendor-phone',

    
    // Ship To Section (using unique IDs)
    shipToName: '#ship-to-name',
    shipToCompany: '#ship-to-company',
    shipToAddress: '#ship-to-address',
    shipToCityState: '#ship-to-city-state',
    shipToPhone: '#ship-to-phone',

    
    // Shipping Details - Updated for single row layout
    requisitioner: 'table.shipping-details tr:nth-child(2) td:nth-child(1) .editable-field',
    shipVia: 'table.shipping-details tr:nth-child(2) td:nth-child(2) .editable-field',
    fob: 'table.shipping-details tr:nth-child(2) td:nth-child(3) .editable-field',
    shippingTerms: 'table.shipping-details tr:nth-child(2) td:nth-child(4) .editable-field',
    
    // Line Items (up to 5 items) - Updated for colspan structure
    lineItem1Qty: 'table.itemtable tbody tr:nth-child(1) td:nth-child(4) .editable-field',
    lineItem1Item: 'table.itemtable tbody tr:nth-child(1) td:nth-child(2) .editable-field',
    lineItem1Desc: 'table.itemtable tbody tr:nth-child(1) td:nth-child(3) .editable-field',
    lineItem1Rate: 'table.itemtable tbody tr:nth-child(1) td:nth-child(5) .editable-field',
    lineItem1Amount: 'table.itemtable tbody tr:nth-child(1) td:nth-child(6) .editable-field',
    
    lineItem2Qty: 'table.itemtable tbody tr:nth-child(2) td:nth-child(4) .editable-field',
    lineItem2Item: 'table.itemtable tbody tr:nth-child(2) td:nth-child(2) .editable-field',
    lineItem2Desc: 'table.itemtable tbody tr:nth-child(2) td:nth-child(3) .editable-field',
    lineItem2Rate: 'table.itemtable tbody tr:nth-child(2) td:nth-child(5) .editable-field',
    lineItem2Amount: 'table.itemtable tbody tr:nth-child(2) td:nth-child(6) .editable-field',
    
    lineItem3Qty: 'table.itemtable tbody tr:nth-child(3) td:nth-child(4) .editable-field',
    lineItem3Item: 'table.itemtable tbody tr:nth-child(3) td:nth-child(2) .editable-field',
    lineItem3Desc: 'table.itemtable tbody tr:nth-child(3) td:nth-child(3) .editable-field',
    lineItem3Rate: 'table.itemtable tbody tr:nth-child(3) td:nth-child(5) .editable-field',
    lineItem3Amount: 'table.itemtable tbody tr:nth-child(3) td:nth-child(6) .editable-field',
    
    lineItem4Qty: 'table.itemtable tbody tr:nth-child(4) td:nth-child(4) .editable-field',
    lineItem4Item: 'table.itemtable tbody tr:nth-child(4) td:nth-child(2) .editable-field',
    lineItem4Desc: 'table.itemtable tbody tr:nth-child(4) td:nth-child(3) .editable-field',
    lineItem4Rate: 'table.itemtable tbody tr:nth-child(4) td:nth-child(5) .editable-field',
    lineItem4Amount: 'table.itemtable tbody tr:nth-child(4) td:nth-child(6) .editable-field',
    
    lineItem5Qty: 'table.itemtable tbody tr:nth-child(5) td:nth-child(4) .editable-field',
    lineItem5Item: 'table.itemtable tbody tr:nth-child(5) td:nth-child(2) .editable-field',
    lineItem5Desc: 'table.itemtable tbody tr:nth-child(5) td:nth-child(3) .editable-field',
    lineItem5Rate: 'table.itemtable tbody tr:nth-child(5) td:nth-child(5) .editable-field',
    lineItem5Amount: 'table.itemtable tbody tr:nth-child(5) td:nth-child(6) .editable-field',
    
    // Totals Section (using unique IDs)
    subtotal: '#totals-subtotal',
    tax: '#totals-tax', 
    shipping: '#totals-shipping',
    other: '#totals-other',
    total: '#totals-total',
    
    // Comments Section (using unique ID)
    comments: '#comments-field',
    
    // Footer Contact
    contactInfo: 'td[style*="text-align: center; padding: 20px"] .editable-field'
};

// Helper function to get current column mapping based on visual order
function getCurrentColumnMapping() {
    const headerRow = document.querySelector('table.itemtable thead tr');
    const headers = Array.from(headerRow.querySelectorAll('th'));
    const columnMap = {};
    
    headers.forEach((header, index) => {
        const headerText = header.textContent.replace(/ID:.*$/g, '').trim();
        
        if (headerText.includes('Item#') || headerText.includes('Item')) {
            columnMap.item = index;

        } 
        
        if (headerText.includes('Description') || headerText.includes('Desc')) {
            columnMap.description = index;

        } 
        
        if (headerText.includes('Qty') || headerText.includes('Quantity')) {
            columnMap.quantity = index;

        } 
        
        if (headerText.includes('Rate') || headerText.includes('Unit Price') || headerText.includes('RATE') || headerText.includes('Price')) {
            // Enhanced Rate detection - check for Rate, Unit Price, RATE, or Price
            columnMap.rate = index;
            columnMap.unitPrice = index; // legacy alias

        } 
        
        if (headerText.includes('Amount') || headerText.includes('Total') || headerText.includes('AMOUNT') || headerText.includes('TOTAL')) {
            // Enhanced Amount detection - check for Amount, Total, AMOUNT, or TOTAL
            columnMap.amount = index;
            columnMap.total = index; // legacy alias

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

// Helper to get an editable field inside a line item cell for a given row and column type
function getLineItemEditableField(rowIndexOneBased, columnType) {
    const table = document.querySelector('table.itemtable');
    if (!table) return null;
    const tbodyRows = table.querySelectorAll('tbody tr');
    if (!tbodyRows || tbodyRows.length === 0) return null;
    const row = tbodyRows[rowIndexOneBased - 1];
    if (!row) return null;
    
    const map = getCurrentColumnMapping();
    // Normalize requested columnType to our map keys
    let key = columnType;
    if (columnType === 'rate' && map.rate === undefined) key = 'unitPrice';
    if (columnType === 'amount' && map.amount === undefined) key = 'total';
    
    const columnIndex = map[key];
    if (columnIndex === undefined) return null;
    
    const cells = row.querySelectorAll('td');
    const cell = cells[columnIndex];
    if (!cell) return null;
    return cell.querySelector('.editable-field');
}

// Create dynamic field mapping for line items based on current column order
function createDynamicLineItemMapping() {
    console.log('🔄 Creating dynamic line item mapping based on current column order...');
    
    const dynamicMapping = {};
    const columnMap = getCurrentColumnMapping();
    
    console.log('📊 Current column mapping:', columnMap);
    
    // Map line items for up to 5 rows
    for (let row = 1; row <= 5; row++) {
        // Map each field type to its current column position
        Object.entries(columnMap).forEach(([fieldType, columnIndex]) => {
            if (fieldType !== 'unknown') {
                // Map field types to the expected ChatGPT field names
                let fieldSuffix = '';
                switch (fieldType) {
                    case 'item':
                        fieldSuffix = 'Item';
                        break;
                    case 'description':
                        fieldSuffix = 'Desc';
                        break;
                    case 'quantity':
                        fieldSuffix = 'Qty';
                        break;
                    case 'rate':
                    case 'unitPrice':
                        fieldSuffix = 'Rate';
                        break;
                    case 'amount':
                    case 'total':
                        fieldSuffix = 'Amount';
                        break;
                    default:
                        fieldSuffix = fieldType.charAt(0).toUpperCase() + fieldType.slice(1);
                }
                
                const fieldKey = `lineItem${row}${fieldSuffix}`;
                const selector = `table.itemtable tbody tr:nth-child(${row}) td:nth-child(${parseInt(columnIndex) + 1}) .editable-field`;
                dynamicMapping[fieldKey] = selector;
                console.log(`🔗 Mapped ${fieldKey} -> column ${parseInt(columnIndex) + 1} (${fieldType})`);
            }
        });
    }
    
    console.log('✅ Dynamic line item mapping created:', dynamicMapping);
    return dynamicMapping;
}

// Get complete field mapping with dynamic line items
function getDynamicFieldMapping() {
    // Start with the base static mapping
    const baseMapping = { ...FIELD_MAPPING };
    
    // Remove old static line item mappings
    Object.keys(baseMapping).forEach(key => {
        if (key.startsWith('lineItem')) {
            delete baseMapping[key];
        }
    });
    
    // Add dynamic line item mappings
    const dynamicLineItemMapping = createDynamicLineItemMapping();
    
    return { ...baseMapping, ...dynamicLineItemMapping };
}

// Field validation function - now shows field status without blocking conversion
function validateAllFields() {
    console.group('Field Validation Check');
    const validationResults = {};
    let filledCount = 0;
    let emptyCount = 0;
    
    for (const [fieldName, selector] of Object.entries(FIELD_MAPPING)) {
        let element = null;
        let value = '';
        
        // Support dynamic selectors (e.g., dynamic:findFieldByLabel:Label:section)
        if (typeof selector === 'string' && selector.startsWith('dynamic:')) {
            const parts = selector.split(':');
            const command = parts[1];
            if (command === 'findFieldByLabel') {
                const labelText = parts[2];
                const sectionName = parts[3];
                element = findFieldByLabel(labelText, sectionName);
            }
        } else {
            // Fallback to regular CSS selector
            element = document.querySelector(selector);
        }
        
        value = element?.textContent.trim() || '';
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
            if (element) {
                element.style.backgroundColor = '';
                element.style.border = '';
            }
        } else {
            filledCount++;
            console.log(`${fieldName}: "${value}"`);
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

// Helper function to find field by label text within a section
function findFieldByLabel(labelText, sectionName) {
    try {
        const normalizedLabel = (labelText || '').toString().trim().toUpperCase();
        if (!normalizedLabel) return null;
        
        // Find the section first - check both header-cell and regular elements
        let section = document.querySelector(`.header-cell[data-section="${sectionName}"]`);
        if (!section) {
            section = document.querySelector(`[data-section="${sectionName}"]`);
        }
        if (!section) {
            console.warn(`❌ Section not found: ${sectionName}`);
            return null;
        }
        
        // Prefer matching by row: label in first cell, value in same or next cell
        const rows = section.querySelectorAll('tr');
        
        for (const row of rows) {
            const tds = row.querySelectorAll('td');
            if (tds.length === 0) continue;
            const labelCellText = (tds[0].textContent || '').trim().toUpperCase();
            
            if (labelCellText.startsWith(normalizedLabel)) {
                // Dynamic field detection: check all possible containers for exact label match
                
                        // Try universal field scan for this section
                const sectionField = universalFieldScanInSection(section, normalizedLabel);
                if (sectionField) return sectionField;
                
                // Field not found
                console.warn(`❌ No field found for "${labelText}" in section "${sectionName}"`);
                return null;
            }
            
            // For totals section, also check for calculated fields
            if (labelCellText.startsWith(normalizedLabel) && sectionName === 'totals') {
                const calculatedField = tds[0].querySelector('.calculated-field');
                if (calculatedField) return calculatedField;
            }
                
            // Next-cell editable value
            if (tds[1]) {
                const next = tds[1].querySelector('.editable-field');
                if (next) return next;
                
                // For totals section, also check for calculated fields in next cell
                if (sectionName === 'totals') {
                    const calculatedField = tds[1].querySelector('.calculated-field');
                    if (calculatedField) return calculatedField;
                }
            }
        }
        
        // Fallback: scan all cells for contains() then same/next cell
        const cells = section.querySelectorAll('td');
        for (const cell of cells) {
            const cellText = (cell.textContent || '').toUpperCase();
            if (cellText.includes(normalizedLabel)) {
                // Same cell
                const inline = cell.querySelector('.editable-field');
                if (inline) return inline;
                
                // For totals section, also check for calculated fields
                if (sectionName === 'totals') {
                    const calculatedField = cell.querySelector('.calculated-field');
                    if (calculatedField) return calculatedField;
                    
                    // Special case for TOTAL which has a different structure
                    if (normalizedLabel === 'TOTAL') {
                        const totalField = cell.querySelector('.total-field');
                        if (totalField) return totalField;
                    }
                }
                
                // Try next sibling
                const nextCell = cell.nextElementSibling;
                if (nextCell) {
                    const nextInline = nextCell.querySelector('.editable-field');
                    if (nextInline) return nextInline;
                    
                    // For totals section, also check for calculated fields in next sibling
                    if (sectionName === 'totals') {
                        const calculatedField = nextCell.querySelector('.calculated-field');
                        if (calculatedField) return calculatedField;
                    }
                }
            }
        }
        
        // Special case for comments section: the label is in one row, the field is in another
        if (sectionName === 'comments' && normalizedLabel.includes('COMMENTS')) {
            const allFields = section.querySelectorAll('.editable-field');
            if (allFields.length > 0) {
                return allFields[0]; // Return the first (and likely only) editable field in the comments section
            }
        }
        
        // If section-based search failed, try universal scan
        return universalFieldScanInSection(document, normalizedLabel);
        
    } catch (error) {
        console.warn(`Error finding field by label "${labelText}" in section "${sectionName}":`, error);
        return null;
    }
}

// Universal field scan within a container (section or entire document)
function universalFieldScanInSection(container, normalizedLabel) {
    const allEditableFields = container.querySelectorAll('.editable-field, .calculated-field');

    for (const field of allEditableFields) {
        const isMatch = isFieldForLabel(field, normalizedLabel);
        if (isMatch) {
            // Debug: Show which field was matched
            console.log(`🎯 MATCHED "${normalizedLabel}" to field:`, {
                element: field,
                placeholder: field.dataset.placeholder || field.getAttribute('data-placeholder'),
                parentText: field.parentElement?.textContent?.trim().substring(0, 50) + '...',
                currentValue: field.textContent,
                fieldId: field.id || 'no-id',
                outerHTML: field.outerHTML.substring(0, 100) + '...'
            });
            return field;
        }
    }
    
    return null;
}

// Check if an editable field belongs to a specific label by examining nearby text
function isFieldForLabel(field, normalizedLabel) {
    // MOST STRICT: Check immediate table row first (highest precision)
    const tableRow = field.closest('tr');
    if (tableRow) {
        const cells = tableRow.querySelectorAll('td');
        
        // Two-column layout: label in first cell, field in second cell (like DATE, PO#, SUBTOTAL)
        if (cells.length === 2) {
            const labelCell = cells[0];
            const fieldCell = cells[1];
            const labelText = labelCell.textContent?.trim().toUpperCase() || '';
            const fieldInSecondCell = fieldCell.querySelector('.editable-field, .calculated-field');
            
            // FLEXIBLE match: this field is in second cell AND first cell has label
            if (fieldInSecondCell === field) {
                const cleanLabelText = labelText.replace(/\s+/g, ' ').trim();
                const cleanNormalizedLabel = normalizedLabel.replace(/\s+/g, ' ').trim();
                
                if (cleanLabelText === cleanNormalizedLabel + ':' || 
                    cleanLabelText.includes(cleanNormalizedLabel + ':')) {
                    return true;
                }
            }
        }
        
        // Single-column layout: label and field in same cell (like company info, vendor, ship-to)
        if (cells.length === 1) {
            const cellText = cells[0].textContent?.trim().toUpperCase() || '';
            const fieldsInCell = cells[0].querySelectorAll('.editable-field, .calculated-field');
            
            // FLEXIBLE match: handle various label formats
            if (fieldsInCell.length === 1 && fieldsInCell[0] === field) {
                // Try exact match first
                if (cellText.startsWith(normalizedLabel + ':')) {
                    return true;
                }
                
                // Handle common label variations
                const cleanCellText = cellText.replace(/\s+/g, ' ').trim();
                const cleanLabel = normalizedLabel.replace(/\s+/g, ' ').trim();
                
                if (cleanCellText.startsWith(cleanLabel + ':') || 
                    cleanCellText.includes(cleanLabel + ':')) {
                    return true;
                }
            }
        }
    }

    // FALLBACK: Check immediate parent element for single-field containers
    let parent = field.parentElement;
    if (parent) {
        const parentText = getDirectTextContent(parent).toUpperCase().trim();
        const fieldsInParent = parent.querySelectorAll('.editable-field, .calculated-field');
        
        // EXACT match: only one field in parent AND parent text is exactly our label
        if (fieldsInParent.length === 1 && fieldsInParent[0] === field && 
            parentText === normalizedLabel + ':') {
            return true;
        }
    }

    // SPECIAL CASES: Handle known edge cases with exact matching
    if (tableRow) {
        const rowText = tableRow.textContent?.trim().toUpperCase() || '';
        const fieldsInRow = tableRow.querySelectorAll('.editable-field, .calculated-field');
        
        // Only match if this is the ONLY field in the row
        if (fieldsInRow.length === 1 && fieldsInRow[0] === field) {
            
            // Handle "City, ST ZIP" exact pattern
            if (normalizedLabel === 'CITY, ST ZIP' && rowText.startsWith('CITY, ST ZIP:')) {
                return true;
            }
            
            // Handle "Comments" pattern  
            if (normalizedLabel === 'COMMENTS' && 
                (rowText.includes('COMMENTS:') || rowText.includes('SPECIAL INSTRUCTIONS:'))) {
                return true;
            }
            
            // Handle "PO #" exact pattern
            if (normalizedLabel === 'PO #' && rowText.includes('PO #:')) {
                return true;
            }
            
            // Handle "DATE" exact pattern (avoid CITY/STATE confusion)
            if (normalizedLabel === 'DATE' && rowText.includes('DATE:') && !rowText.includes('CITY')) {
                return true;
            }
        }
    }

    return false;
}

// Get only the direct text content of an element (excluding nested element text)
function getDirectTextContent(element) {
    let text = '';
    for (const node of element.childNodes) {
        if (node.nodeType === Node.TEXT_NODE) {
            text += node.textContent;
        }
    }
    return text.trim();
}

// Enhanced field value getter that handles dynamic selectors
function getFieldValues() {
    const fieldValues = {};
    
    Object.keys(FIELD_MAPPING).forEach(key => {
        const selector = FIELD_MAPPING[key];
        let element = null;
        
        // Handle dynamic selectors
        if (selector.startsWith('dynamic:')) {
            const parts = selector.split(':');
            const command = parts[1];
            
            if (command === 'findFieldByLabel') {
                const labelText = parts[2];
                const sectionName = parts[3];
                element = findFieldByLabel(labelText, sectionName);
            }
        } else {
            // Handle regular CSS selectors
            element = document.querySelector(selector);
        }
        
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
            <td style="padding: 6px; border-bottom: 1px solid #e5e7eb; text-align: right;">${unitPrice}</td>
            <td style="padding: 6px; border-bottom: 1px solid #e5e7eb; text-align: right;">${totalPrice}</td>
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

// Robust currency formatter for both HTML and XML
function formatCurrency(value) {
    if (!value || value.toString().trim() === '') return '';
    
    // Handle various input formats
    const stringValue = value.toString().trim();
    
    // If already formatted with dollar sign, check if it needs reformatting
    if (stringValue.includes('$')) {
        const numericPart = stringValue.replace(/[$,\s]/g, '');
        if (!isNaN(numericPart) && numericPart !== '') {
            const number = parseFloat(numericPart);
            return '$' + number.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        }
        return stringValue; // Return as-is if can't parse
    }
    
    // Remove any existing currency symbols and whitespace for parsing
    const cleanValue = stringValue.replace(/[$,\s]/g, '');
    
    // Check if it's a valid number
    if (isNaN(cleanValue) || cleanValue === '') {
        return stringValue; // Return original if not a number
    }
    
    // Format as currency
    const number = parseFloat(cleanValue);
    if (number === 0) return '$0.00';
    
    return '$' + number.toLocaleString('en-US', { 
        minimumFractionDigits: 2, 
        maximumFractionDigits: 2 
    });
}

// Parse currency value to number (removes $ and commas)
function parseCurrency(value) {
    if (!value || value.toString().trim() === '') return 0;
    const cleanValue = value.toString().replace(/[$,\s]/g, '');
    return parseFloat(cleanValue) || 0;
}

// Debug function to test column mapping
function debugColumnMapping() {
    const mapping = getCurrentColumnMapping();
    const dynamic = createDynamicLineItemMapping();
    console.log('Column mapping:', mapping);
    console.log('Dynamic line item mapping:', dynamic);
    
    return { mapping, dynamic };
}

// Export utilities for use in other modules
window.UTILS = {
    FIELD_MAPPING,
    getCurrentColumnMapping,
    validateAllFields,
    getFieldValues,
    getLineItems,
    formatCurrency,
    parseCurrency,
    findFieldByLabel,
    getLineItemEditableField,
    createDynamicLineItemMapping,
    getDynamicFieldMapping,
    debugColumnMapping
};

// Global currency formatter for use across all modules
window.CURRENCY_FORMATTER = {
    format: formatCurrency,
    parse: parseCurrency
};
