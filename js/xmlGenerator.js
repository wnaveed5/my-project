// XML Generator Module for NetSuite Integration
window.XML_GENERATOR = {
    // Convert form data to XML and display in modal
    convertToXml: function() {
        console.log('🔄 Converting form to XML...');
        
        try {
            const xmlContent = this.generateXml();
            this.displayXmlModal(xmlContent);
            console.log('✅ XML conversion completed');
        } catch (error) {
            console.error('❌ XML conversion failed:', error);
            if (window.MAIN_APP && window.MAIN_APP.showError) {
                window.MAIN_APP.showError('Failed to generate XML. Please check the console for details.');
            }
        }
    },

    // Close the XML modal
    closeXmlModal: function() {
        const modal = document.getElementById('xmlModal');
        if (modal) {
            modal.style.display = 'none';
            console.log('🔒 XML modal closed');
        }
    },

    // Refresh XML display (called when rows are reordered)
    refreshXmlDisplay: function() {
        console.log('🔄 Refreshing XML display...');
        try {
            const xmlContent = this.generateXml();
            const xmlOutput = document.getElementById('xmlOutput');
            if (xmlOutput) {
                xmlOutput.innerHTML = `<pre style="background: #f8f9fa; padding: 15px; border-radius: 4px; overflow-x: auto; font-size: 12px; line-height: 1.4;">${this.escapeHtml(xmlContent)}</pre>`;
            }
        } catch (error) {
            console.error('❌ Failed to refresh XML display:', error);
        }
    },

    // Update XML preview in real-time
    updateXmlPreview: function() {
        console.log('🔄 Updating XML preview...');
        this.refreshXmlDisplay();
    },

    // Display XML content in modal
    displayXmlModal: function(xmlContent) {
        console.log('🔄 displayXmlModal called');
        const modal = document.getElementById('xmlModal');
        const xmlOutput = document.getElementById('xmlOutput');
        
        console.log('🔍 Modal element:', modal);
        console.log('🔍 XML output element:', xmlOutput);
        
        if (modal && xmlOutput) {
            xmlOutput.innerHTML = `<pre style="background: #f8f9fa; padding: 15px; border-radius: 4px; overflow-x: auto; font-size: 12px; line-height: 1.4;">${this.escapeHtml(xmlContent)}</pre>`;
            modal.style.display = 'block';
            console.log('📋 XML modal displayed successfully');
            console.log('📄 XML content length:', xmlContent.length);
            console.log('📄 First 200 chars of XML:', xmlContent.substring(0, 200));
        } else {
            console.error('❌ XML modal elements not found');
            if (!modal) console.error('❌ Modal element not found');
            if (!xmlOutput) console.error('❌ XML output element not found');
        }
    },

    // Generate XML from current form data
    generateXml: function() {
        console.log('🚀 Starting XML generation...');
        
        // Enhanced debugging for field values
        console.log('🔍 Attempting to get field values...');
        const fieldValues = window.UTILS ? window.UTILS.getFieldValues() : this.getFieldValues();
        console.log('📊 Field values extracted:', fieldValues);
        
        // Debug each field individually
        this.debugFieldValues(fieldValues);
        
        // Extra debugging for contactInfo specifically
        console.log('🔍 Contact Info Debug:');
        console.log('Contact Info from fieldValues:', fieldValues.contactInfo);
        const contactElement = document.querySelector('td[style*="text-align: center; padding: 20px"] .editable-field');
        console.log('Contact Info element found:', contactElement);
        console.log('Contact Info element text:', contactElement ? contactElement.textContent : 'ELEMENT NOT FOUND');
        
        const lineItems = [];
        const rows = document.querySelectorAll('table.itemtable tbody tr.draggable-row');
        const columnMapping = this.getCurrentColumnMapping();
        const currentColumnOrder = this.getColumnOrder();
        
        console.log('🔍 Found rows for line items:', rows.length);
        console.log('🔍 Current column mapping for XML generation:', columnMapping);
        console.log('🔍 Column order for processing:', currentColumnOrder);
        
        rows.forEach((row, rowIndex) => {
            console.log(`🔍 Processing row ${rowIndex + 1}:`, row);
            const allCells = Array.from(row.querySelectorAll('td'));
            console.log(`🔍 Found ${allCells.length} total cells in row ${rowIndex + 1}`);
            
            const rowData = {
                quantity: '',
                item: '',
                description: '',
                options: '',
                rate: '',
                amount: ''
            };
            
            // Process cells according to current column order
            currentColumnOrder.forEach((column, orderIndex) => {
                const cellIndex = column.index;
                const cell = allCells[cellIndex];
                
                if (!cell) {
                    console.warn(`⚠️ No cell found at index ${cellIndex} for column ${column.fieldType}`);
                    return;
                }
                
                const content = this.extractCellContent(cell) || '';
                const allCellText = this.getAllCellText(cell);
                
                console.log(`🔍 Row ${rowIndex + 1}, Column ${column.fieldType} (index ${cellIndex}):`, {
                    fieldType: column.fieldType,
                    headerText: column.headerText,
                    cellElement: cell,
                    extractedContent: content,
                    allCellText: allCellText,
                    cellHTML: cell.innerHTML
                });
                
                // Assign content based on field type
                switch (column.fieldType) {
                    case 'quantity':
                        rowData.quantity = content;
                        console.log(`📝 Set quantity: "${content}"`);
                        break;
                    case 'item':
                        rowData.item = content;
                        // Also look for description in adjacent text
                        if (allCellText && allCellText !== content) {
                            let descPart = allCellText.replace(content, '').trim();
                            // Clean up the description - remove ID patterns
                            descPart = descPart.replace(/ID:\s*\w+/g, '').trim();
                            if (descPart && descPart !== '' && !rowData.description) {
                                rowData.description = descPart;
                                console.log(`📝 Set description from item cell: "${descPart}"`);
                            }
                        }
                        console.log(`📝 Set item: "${content}"`);
                        break;
                    case 'description':
                        if (!rowData.description) { // Don't overwrite if already set from item cell
                            rowData.description = content || allCellText;
                            console.log(`📝 Set description: "${content || allCellText}"`);
                        }
                        break;
                    case 'options':
                        rowData.options = content;
                        console.log(`📝 Set options: "${content}"`);
                        break;
                    case 'rate':
                        rowData.rate = content;
                        console.log(`📝 Set rate: "${content}"`);
                        break;
                    case 'amount':
                        rowData.amount = content;
                        console.log(`📝 Set amount: "${content}"`);
                        break;
                    default:
                        console.log(`📝 Unknown field type: ${column.fieldType}, content: "${content}"`);
                        break;
                }
            });
            
            console.log(`📝 Final row ${rowIndex + 1} data:`, rowData);
            
            // Improved row content detection - ignore description with only ID patterns
            const hasRealContent = Object.values(rowData).some(content => {
                const cleanContent = content.trim().replace(/ID:\s*\w+/g, '').trim();
                return cleanContent !== '';
            });
            
            console.log(`📝 Row has content: ${hasRealContent}`);
            
            if (hasRealContent) {
                lineItems.push(rowData);
                console.log(`✅ Added row ${rowIndex + 1} to lineItems`);
            } else {
                console.log(`⚠️ Skipped empty row ${rowIndex + 1}`);
            }
        });

        console.log('📋 Final line items array:', lineItems);
        
        // Generate XML headers based on current column order
        const xmlColumnOrder = this.getColumnOrder();
        let tableHeaders = '';
        
        console.log('🔍 Processing table headers for XML based on column order...');
        xmlColumnOrder.forEach((column, index) => {
            const headerText = column.headerText;
            const fieldType = column.fieldType;
            
            console.log(`🔍 XML Header ${index}: "${headerText}" (${fieldType})`);
            
            if (headerText && headerText !== '') {
                const alignment = this.getColumnAlignment(headerText);
                tableHeaders += `<td class="item-header" align="${alignment}">${this.escapeXml(headerText.toUpperCase())}</td>`;
                console.log(`✅ Added XML header: "${headerText}" with alignment ${alignment}`);
            }
        });
        
        console.log('🔍 Final table headers XML:', tableHeaders);
        
        let tableRows = '';
        lineItems.forEach((item, index) => {
            tableRows += `\n        <tr>`;
            
            // Generate cells in the same order as headers
            xmlColumnOrder.forEach((column, colIndex) => {
                const fieldType = column.fieldType;
                const alignment = this.getColumnAlignment(column.headerText);
                let cellContent = '';
                
                switch (fieldType) {
                    case 'quantity':
                        cellContent = this.escapeXml(item.quantity);
                        break;
                    case 'item':
                        cellContent = this.escapeXml(item.item);
                        break;
                    case 'description':
                        cellContent = this.escapeXml(item.description || '');
                        break;
                    case 'options':
                        cellContent = this.escapeXml(item.options);
                        break;
                    case 'rate':
                        cellContent = this.escapeXml(item.rate);
                        break;
                    case 'amount':
                        cellContent = this.escapeXml(item.amount);
                        break;
                    default:
                        cellContent = '';
                        break;
                }
                
                tableRows += `\n            <td class="item-cell" align="${alignment}">${cellContent}</td>`;
            });
            
            tableRows += `\n        </tr>`;
        });
        
        let lineItemsXml = '';
        if (lineItems.length > 0) {
            lineItemsXml = `
    <table style="margin-top: 15px;">
        <tr>
            ${tableHeaders}
        </tr>${tableRows}
    </table>`;
        }

        console.log('📄 Generated lineItemsXml:', lineItemsXml);

        // Debug the field values being inserted into XML template
        console.log('🐛 XML TEMPLATE DEBUG:');
        console.log('======================');
        console.log('📝 companyName:', `"${fieldValues.companyName}"`);
        console.log('📝 companyAddress:', `"${fieldValues.companyAddress}"`);
        console.log('📝 companyCityState:', `"${fieldValues.companyCityState}"`);
        console.log('📝 poNumber:', `"${fieldValues.poNumber}"`);
        console.log('📝 poDate:', `"${fieldValues.poDate}"`);
        console.log('📝 vendorCompany:', `"${fieldValues.vendorCompany}"`);
        console.log('📝 vendorAddress:', `"${fieldValues.vendorAddress}"`);
        console.log('📝 vendorCityState:', `"${fieldValues.vendorCityState}"`);
        console.log('📝 vendorPhone:', `"${fieldValues.vendorPhone}"`);
        console.log('📝 total:', `"${fieldValues.total}"`);
        console.log('======================');

        const xmlContent = `<?xml version="1.0"?><!DOCTYPE pdf PUBLIC "-//big.faceless.org//report" "report-1.1.dtd">
<pdf>
<head>
    <link name="NotoSans" type="font" subtype="truetype" src="\${nsfont.NotoSans_Regular}" src-bold="\${nsfont.NotoSans_Bold}" src-italic="\${nsfont.NotoSans_Italic}" src-bolditalic="\${nsfont.NotoSans_BoldItalic}" bytes="2" />
    <style>
        * { font-family: NotoSans, sans-serif; font-size: 9pt; }
        table { width: 100%; border-collapse: collapse; }
        .header-company { font-size: 14pt; font-weight: bold; }
        .header-title { font-size: 20pt; font-weight: bold; }
        .header-info { font-size: 10pt; }
        .section-header { background-color: #f0f0f0; font-weight: bold; padding: 6px; border: 1px solid #000; }
        .section-content { padding: 6px; border: 1px solid #000; vertical-align: top; }
        .item-header { background-color: #f0f0f0; font-weight: bold; padding: 8px; border: 1px solid #000; }
        .item-cell { padding: 6px; border: 1px solid #000; }
        .total-label { font-weight: bold; padding: 4px; }
        .total-amount { font-weight: bold; padding: 4px; background-color: #ffff99; }
        .comments-header { background-color: #f0f0f0; font-weight: bold; padding: 6px; border: 1px solid #000; }
        .comments-content { padding: 6px; border: 1px solid #000; min-height: 40px; }
        .contact-info { font-size: 8pt; }
    </style>
</head>
<body padding="0.5in" size="Letter">
    <table>
        <tr>
            <td style="width: 70%;">
                <table>
                    <tr>
                        <td class="header-company">${this.escapeXml(fieldValues.companyName)}</td>
                    </tr>
                    <tr>
                        <td>${this.escapeXml(fieldValues.companyAddress)}</td>
                    </tr>
                    <tr>
                        <td>${this.escapeXml(fieldValues.companyCityState)}</td>
                    </tr>
                    <tr>
                        <td>Phone: ${this.escapeXml(fieldValues.companyPhone || '')}</td>
                    </tr>
                    <tr>
                        <td>Fax: ${this.escapeXml(fieldValues.companyFax || '')}</td>
                    </tr>
                    <tr>
                        <td>Website: ${this.escapeXml(fieldValues.companyWebsite || '')}</td>
                    </tr>
                </table>
            </td>
            <td style="width: 30%;" align="right">
                <table>
                    <tr>
                        <td class="header-title">PURCHASE ORDER</td>
                    </tr>
                    <tr>
                        <td>
                            <table>
                                <tr>
                                    <td class="header-info"><b>DATE</b></td>
                                    <td class="header-info">${this.escapeXml(fieldValues.poDate)}</td>
                                </tr>
                                <tr>
                                    <td class="header-info"><b>PO #</b></td>
                                    <td class="header-info">${this.escapeXml(fieldValues.poNumber)}</td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>

    <table style="margin-top: 20px;">
        <tr>
            <td style="width: 50%;">
                <table>
                    <tr>
                        <td class="section-header">VENDOR</td>
                    </tr>
                    <tr>
                        <td class="section-content">
                            ${this.escapeXml(fieldValues.vendorCompany)}<br/>
                            ${this.escapeXml(fieldValues.vendorContact || '')}<br/>
                            ${this.escapeXml(fieldValues.vendorAddress)}<br/>
                            ${this.escapeXml(fieldValues.vendorCityState)}<br/>
                            Phone: ${this.escapeXml(fieldValues.vendorPhone)}<br/>
                            Fax: ${this.escapeXml(fieldValues.vendorFax || '')}
                        </td>
                    </tr>
                </table>
            </td>
            <td style="width: 50%;">
                <table>
                    <tr>
                        <td class="section-header">SHIP TO</td>
                    </tr>
                    <tr>
                        <td class="section-content">
                            ${this.escapeXml(fieldValues.shipToName || '')}<br/>
                            ${this.escapeXml(fieldValues.shipToCompany || fieldValues.companyName)}<br/>
                            ${this.escapeXml(fieldValues.shipToAddress || fieldValues.companyAddress)}<br/>
                            ${this.escapeXml(fieldValues.shipToCityState || fieldValues.companyCityState)}<br/>
                            ${this.escapeXml(fieldValues.shipToPhone || fieldValues.companyPhone || '')}
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>

    <table style="margin-top: 15px;">
        <tr>
            <td class="section-header" style="width: 25%;">REQUISITIONER</td>
            <td class="section-header" style="width: 25%;">SHIP VIA</td>
            <td class="section-header" style="width: 25%;">F.O.B.</td>
            <td class="section-header" style="width: 25%;">SHIPPING TERMS</td>
        </tr>
        <tr>
            <td class="section-content">${this.escapeXml(fieldValues.requisitioner || '')}</td>
            <td class="section-content">${this.escapeXml(fieldValues.shipVia || '')}</td>
            <td class="section-content">${this.escapeXml(fieldValues.fob || '')}</td>
            <td class="section-content">${this.escapeXml(fieldValues.shippingTerms || '')}</td>
        </tr>
    </table>

    ${lineItemsXml}

    <table style="margin-top: 15px;">
        <tr>
            <td class="comments-header" style="width: 70%;">Comments or Special Instructions</td>
            <td style="width: 30%; padding: 0;">
                <table>
                    <tr>
                        <td class="total-label" align="right">SUBTOTAL</td>
                        <td class="total-label" align="right">$${this.escapeXml(fieldValues.subtotal || '')}</td>
                    </tr>
                    <tr>
                        <td class="total-label" align="right">TAX</td>
                        <td class="total-label" align="right">$${this.escapeXml(fieldValues.tax || '')}</td>
                    </tr>
                    <tr>
                        <td class="total-label" align="right">SHIPPING</td>
                        <td class="total-label" align="right">$${this.escapeXml(fieldValues.shipping || '')}</td>
                    </tr>
                    <tr>
                        <td class="total-label" align="right">OTHER</td>
                        <td class="total-label" align="right">$${this.escapeXml(fieldValues.other || '')}</td>
                    </tr>
                    <tr>
                        <td class="total-amount" align="right">TOTAL</td>
                        <td class="total-amount" align="right">$${this.escapeXml(fieldValues.total)}</td>
                    </tr>
                </table>
            </td>
        </tr>
        <tr>
            <td class="comments-content">${this.escapeXml(fieldValues.comments || '')}</td>
            <td></td>
        </tr>
    </table>

    <table style="margin-top: 20px;">
        <tr>
            <td class="contact-info" align="center">
                If you have any questions about this purchase order, please contact<br/>
                ${this.escapeXml(fieldValues.contactInfo || '[Name, Phone #, E-mail]')}
            </td>
        </tr>
    </table>
</body>
</pdf>`;

        console.log('📄 Final XML content (first 500 chars):', xmlContent.substring(0, 500));
        return xmlContent;
    },

    // Helper function to get field values
    getFieldValues: function() {
        console.log('🔍 Getting field values...');
        const fields = {};
        const editableFields = document.querySelectorAll('.editable-field');
        
        console.log('🔍 Found editable fields:', editableFields.length);
        
        editableFields.forEach((field, index) => {
            const id = this.getFieldId(field);
            const content = field.textContent.trim();
            const placeholder = field.getAttribute('data-placeholder');
            const finalValue = content || placeholder || '';
            
            console.log(`🔍 Field ${index}:`, {
                id: id,
                element: field,
                content: content,
                placeholder: placeholder,
                finalValue: finalValue
            });
            
            if (id) {
                fields[id] = finalValue;
            } else {
                console.warn('⚠️ No ID found for field:', field);
            }
        });
        
        return fields;
    },

    // Debug field values to identify missing fields
    debugFieldValues: function(fieldValues) {
        console.log('🐛 FIELD VALUES DEBUG:');
        console.log('========================');
        
        const expectedFields = [
            'companyName', 'companyAddress', 'companyCityState',
            'vendorCompany', 'vendorAddress', 'vendorCityState', 'vendorPhone',
            'poNumber', 'poDate', 'total'
        ];
        
        expectedFields.forEach(field => {
            const value = fieldValues[field];
            const status = value ? '✅' : '❌';
            console.log(`${status} ${field}: "${value || 'MISSING'}"`);
        });
        
        console.log('========================');
        console.log('🔍 All field values object:', JSON.stringify(fieldValues, null, 2));
        
        // Check if fields exist in DOM
        console.log('🔍 DOM Field Check:');
        expectedFields.forEach(field => {
            const elements = document.querySelectorAll(`[data-field-id="${field}"], .editable-field`);
            console.log(`🔍 ${field}: Found ${elements.length} potential elements`);
            elements.forEach((el, i) => {
                const id = this.getFieldId(el);
                console.log(`  - Element ${i}: ID="${id}", text="${el.textContent.trim()}", placeholder="${el.getAttribute('data-placeholder')}"`);
            });
        });
    },

    // Helper function to get field ID from the small tag
    getFieldId: function(field) {
        const smallTag = field.nextElementSibling;
        if (smallTag && smallTag.tagName === 'SMALL') {
            const text = smallTag.textContent;
            const match = text.match(/ID: (.+)/);
            return match ? match[1] : null;
        }
        return null;
    },

    // Helper function to extract cell content
    extractCellContent: function(cell) {
        const editableField = cell.querySelector('.editable-field');
        if (editableField) {
            return editableField.textContent.trim() || editableField.getAttribute('data-placeholder') || '';
        }
        return cell.textContent.trim();
    },

    // Helper function to get all text content from a cell
    getAllCellText: function(cell) {
        // Get all text nodes, including those not in .editable-field
        const allText = [];
        
        // Get editable field text
        const editableField = cell.querySelector('.editable-field');
        if (editableField) {
            const fieldText = editableField.textContent.trim() || editableField.getAttribute('data-placeholder') || '';
            if (fieldText) allText.push(fieldText);
        }
        
        // Get other text nodes
        const walker = document.createTreeWalker(
            cell,
            NodeFilter.SHOW_TEXT,
            {
                acceptNode: function(node) {
                    // Skip if this text is already captured by editable field
                    if (editableField && editableField.contains(node)) {
                        return NodeFilter.FILTER_REJECT;
                    }
                    // Skip if empty or just whitespace
                    if (!node.textContent.trim()) {
                        return NodeFilter.FILTER_REJECT;
                    }
                    return NodeFilter.FILTER_ACCEPT;
                }
            }
        );
        
        let node;
        while (node = walker.nextNode()) {
            const text = node.textContent.trim();
            if (text && !allText.includes(text)) {
                allText.push(text);
            }
        }
        
        const finalText = allText.join(' ').trim();
        // Clean up common patterns that shouldn't be in content
        return finalText.replace(/ID:\s*\w+/g, '').replace(/\s+/g, ' ').trim();
    },

    // Helper function to get current column mapping
    getCurrentColumnMapping: function() {
        console.log('🔍 Getting current column mapping...');
        const headers = document.querySelectorAll('table.itemtable thead th');
        const mapping = {};
        
        console.log('🔍 Found headers:', headers.length);
        console.log('🔍 Headers elements:', headers);
        
        headers.forEach((header, index) => {
            const fullText = header.textContent;
            let headerText = header.textContent.replace(/ID:.*$/g, '').trim();
            
            console.log(`🔍 Header ${index}:`, {
                element: header,
                fullText: fullText,
                headerTextAfterCleaning: headerText,
                innerHTML: header.innerHTML
            });
            
            // Check for :: pattern
            if (headerText && headerText.includes('::')) {
                headerText = headerText.replace(/^::\s*/, '').replace(/\s*::$/, '').trim();
            }
            
            // Map to field type based on header content
            let fieldType = 'unknown';
            if (headerText) {
                if (headerText.includes('Item') || headerText.includes('ITEM') || headerText.includes('Item#')) {
                    fieldType = 'item';
                } else if (headerText.includes('Description') || headerText.includes('Desc') || headerText.includes('DESCRIPTION')) {
                    fieldType = 'description';
                } else if (headerText.includes('Quantity') || headerText.includes('Qty') || headerText.includes('QTY')) {
                    fieldType = 'quantity';
                } else if (headerText.includes('Unit Price') || headerText.includes('Unit') || headerText.includes('Rate') || headerText.includes('Price') || headerText.includes('UNIT PRICE')) {
                    fieldType = 'rate';
                } else if (headerText.includes('Amount') || headerText.includes('Total') || headerText.includes('TOTAL')) {
                    fieldType = 'amount';
                } else if (headerText.includes('Options') || headerText.includes('Option')) {
                    fieldType = 'options';
                } else if (headerText === '::' || headerText === '') {
                    fieldType = 'dragHandle';
                } else {
                    // Enhanced fallback detection based on visual position and content
                    fieldType = this.detectFieldTypeByPosition(headerText, index);
                }
            }
            
            mapping[index] = {
                headerText: headerText,
                fieldType: fieldType,
                originalIndex: index
            };
            
            console.log(`✅ Mapped header ${index}: "${headerText}" -> ${fieldType}`);
        });
        
        console.log('🔍 Final column mapping:', mapping);
        return mapping;
    },

    // Helper function to detect field type by position and content patterns
    detectFieldTypeByPosition: function(headerText, index) {
        console.log(`🔍 Detecting field type by position for header "${headerText}" at index ${index}`);
        
        // New column order is: dragHandle, item, description, quantity, rate, amount
        switch (index) {
            case 0:
                return 'dragHandle';
            case 1:
                return 'item';      // Item#
            case 2:
                return 'description'; // Description  
            case 3:
                return 'quantity';   // Qty
            case 4:
                return 'rate';       // Unit Price
            case 5:
                return 'amount';     // Total
            default:
                // For additional columns, try to infer from header text
                const lowerText = headerText.toLowerCase();
                if (lowerText.includes('qty') || lowerText.includes('quantity')) return 'quantity';
                if (lowerText.includes('desc') || lowerText.includes('description')) return 'description';
                if (lowerText.includes('price') || lowerText.includes('rate') || lowerText.includes('unit')) return 'rate';
                if (lowerText.includes('total') || lowerText.includes('amount')) return 'amount';
                if (lowerText.includes('item') || lowerText.includes('product')) return 'item';
                return 'unknown';
        }
    },

    // Helper function to get column order for XML generation
    getColumnOrder: function() {
        const mapping = this.getCurrentColumnMapping();
        const columnOrder = [];
        
        Object.keys(mapping).forEach(index => {
            const column = mapping[index];
            if (column.fieldType !== 'dragHandle' && column.fieldType !== 'unknown') {
                columnOrder.push({
                    index: parseInt(index),
                    fieldType: column.fieldType,
                    headerText: column.headerText
                });
            }
        });
        
        console.log('🔍 Column order for XML:', columnOrder);
        return columnOrder;
    },

    // Helper function to get column alignment
    getColumnAlignment: function(headerText) {
        const lowerText = headerText.toLowerCase();
        if (lowerText.includes('rate') || lowerText.includes('amount') || lowerText.includes('price') || lowerText.includes('total')) return 'right';
        if (lowerText.includes('quantity') || lowerText.includes('qty') || lowerText.includes('options')) return 'center';
        return 'left';
    },

    // Helper function to identify cell type based on content and position
    identifyCellType: function(content, index) {
        if (!content || content.trim() === '') return 'empty';
        
        const trimmed = content.trim();
        
        // Check for quantity (usually small integers)
        if (/^\d{1,3}$/.test(trimmed) && index === 0) return 'quantity';
        
        // Check for item codes/numbers
        if (/^(ITEM-|SKU-|\[|\d{4,})/.test(trimmed) && index === 1) return 'item';
        
        // Check for monetary values (with decimals)
        if (/^\$?\d+\.\d{2}$/.test(trimmed) && index >= 3) return 'monetary';
        
        // Check for rate/amount based on position
        if (/^\d+\.\d{2}$/.test(trimmed)) {
            if (index === 3) return 'rate';
            if (index === 4) return 'amount';
        }
        
        // Default to description for middle columns
        if (index === 2) return 'description';
        
        return 'unknown';
    },

    // Helper function to escape XML characters
    escapeXml: function(text) {
        if (!text) return '';
        return text.replace(/&/g, '&amp;')
                  .replace(/</g, '&lt;')
                  .replace(/>/g, '&gt;')
                  .replace(/"/g, '&quot;')
                  .replace(/'/g, '&apos;');
    },

    // Helper function to escape HTML for display
    escapeHtml: function(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    // Debug function to manually trigger field debugging
    debugCurrentState: function() {
        console.log('🐛 MANUAL DEBUG TRIGGERED');
        console.log('==========================');
        
        // Check UTILS module
        console.log('🔍 UTILS module available:', !!window.UTILS);
        if (window.UTILS && window.UTILS.getFieldValues) {
            console.log('🔍 UTILS.getFieldValues available');
            const utilsFields = window.UTILS.getFieldValues();
            console.log('🔍 UTILS field values:', utilsFields);
        }
        
        // Check direct field extraction
        const directFields = this.getFieldValues();
        console.log('🔍 Direct field values:', directFields);
        
        // Check DOM elements
        console.log('🔍 DOM Analysis:');
        const editableFields = document.querySelectorAll('.editable-field');
        console.log(`🔍 Found ${editableFields.length} .editable-field elements`);
        
        editableFields.forEach((field, i) => {
            console.log(`  Field ${i}:`, {
                element: field,
                text: field.textContent,
                placeholder: field.getAttribute('data-placeholder'),
                nextSibling: field.nextElementSibling,
                siblingText: field.nextElementSibling ? field.nextElementSibling.textContent : null
            });
        });
        
        // Check table structure
        const itemTable = document.querySelector('table.itemtable');
        console.log('🔍 Item table found:', !!itemTable);
        if (itemTable) {
            const rows = itemTable.querySelectorAll('tbody tr.draggable-row');
            console.log(`🔍 Found ${rows.length} draggable rows`);
            
            const headers = itemTable.querySelectorAll('thead th');
            console.log(`🔍 Found ${headers.length} headers`);
            headers.forEach((h, i) => {
                console.log(`  Header ${i}: "${h.textContent}"`);
            });
        }
        
        console.log('==========================');
        return {
            utilsAvailable: !!window.UTILS,
            editableFieldsCount: editableFields.length,
            directFields: directFields,
            itemTableFound: !!itemTable
        };
    }
};

// Add global functions for the modal buttons
window.closeXmlModal = function() {
    console.log('🔒 closeXmlModal called');
    if (window.XML_GENERATOR) {
        window.XML_GENERATOR.closeXmlModal();
    } else {
        console.error('❌ XML_GENERATOR not available');
    }
};

window.copyXmlToClipboard = function() {
    console.log('📋 copyXmlToClipboard called');
    const xmlOutput = document.getElementById('xmlOutput');
    if (xmlOutput) {
        const xmlText = xmlOutput.textContent || xmlOutput.innerText;
        console.log('📄 XML text to copy:', xmlText.substring(0, 100) + '...');
        
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(xmlText).then(() => {
                console.log('✅ XML copied to clipboard successfully');
                if (window.MAIN_APP && window.MAIN_APP.showSuccess) {
                    window.MAIN_APP.showSuccess('XML copied to clipboard!');
                }
            }).catch(err => {
                console.error('❌ Failed to copy XML to clipboard:', err);
                this.fallbackCopyTextToClipboard(xmlText);
            });
        } else {
            this.fallbackCopyTextToClipboard(xmlText);
        }
    } else {
        console.error('❌ xmlOutput element not found');
    }
};

window.downloadXml = function() {
    console.log('💾 downloadXml called');
    const xmlOutput = document.getElementById('xmlOutput');
    if (xmlOutput) {
        const xmlText = xmlOutput.textContent || xmlOutput.innerText;
        console.log('📄 XML text to download:', xmlText.substring(0, 100) + '...');
        
        const blob = new Blob([xmlText], { type: 'application/xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'purchase-order.xml';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        console.log('✅ XML file downloaded successfully');
        if (window.MAIN_APP && window.MAIN_APP.showSuccess) {
            window.MAIN_APP.showSuccess('XML file downloaded!');
        }
    } else {
        console.error('❌ xmlOutput element not found');
    }
};

window.fallbackCopyTextToClipboard = function(text) {
    console.log('🔄 Using fallback copy method');
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        const successful = document.execCommand('copy');
        if (successful) {
            console.log('✅ XML copied using fallback method');
            if (window.MAIN_APP && window.MAIN_APP.showSuccess) {
                window.MAIN_APP.showSuccess('XML copied to clipboard!');
            }
        } else {
            console.error('❌ Fallback copy failed');
            if (window.MAIN_APP && window.MAIN_APP.showError) {
                window.MAIN_APP.showError('Failed to copy XML. Please select and copy manually.');
            }
        }
    } catch (err) {
        console.error('❌ Fallback copy error:', err);
        if (window.MAIN_APP && window.MAIN_APP.showError) {
            window.MAIN_APP.showError('Failed to copy XML. Please select and copy manually.');
        }
    }
    
    document.body.removeChild(textArea);
};

// Global debug function accessible from console
window.debugXmlGenerator = function() {
    console.log('🔧 Debug function called from console');
    if (window.XML_GENERATOR && window.XML_GENERATOR.debugCurrentState) {
        return window.XML_GENERATOR.debugCurrentState();
    } else {
        console.error('❌ XML_GENERATOR or debugCurrentState not available');
        return null;
    }
};

console.log('✅ XML Generator module loaded successfully');
