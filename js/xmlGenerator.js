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
        
        // Debug section swapping state
        this.debugSectionSwapping();
        
        // Enhanced debugging for field values
        console.log('🔍 Attempting to get field values...');
        
        // Use dynamic field mapping like ChatGPT generator
        let fieldValues;
        if (window.UTILS && window.UTILS.getFieldValues) {
            console.log('✅ Using UTILS.getFieldValues() with dynamic mapping');
            fieldValues = window.UTILS.getFieldValues();
            console.log('📊 UTILS field values:', fieldValues);
            
            // If UTILS returned empty values, it means the fields are empty (not a mapping issue)
            // This is correct behavior - the debugging showed fields are being found correctly
        } else {
            console.log('⚠️ UTILS not available, using fallback getFieldValues()');
            fieldValues = this.getFieldValues();
            console.log('📊 Fallback field values:', fieldValues);
        }
        
        // Also get field values with dynamic mapping for comparison
        if (window.UTILS && window.UTILS.getDynamicFieldMapping) {
            console.log('🔍 Comparing with dynamic field mapping...');
            const dynamicMapping = window.UTILS.getDynamicFieldMapping();
            console.log('🗺️ Dynamic mapping:', dynamicMapping);
            
            // Test a few key fields with dynamic mapping
            const keyFields = ['companyName', 'poDate', 'poNumber', 'vendorCompany'];
            keyFields.forEach(fieldName => {
                const selector = dynamicMapping[fieldName];
                if (selector) {
                    let element = null;
                    if (selector.startsWith('dynamic:')) {
                        const parts = selector.split(':');
                        if (parts[1] === 'findFieldByLabel') {
                            element = window.UTILS.findFieldByLabel(parts[2], parts[3]);
                        }
                    } else {
                        element = document.querySelector(selector);
                    }
                    console.log(`  ${fieldName}: ${selector} → ${element ? element.textContent : 'NOT FOUND'}`);
                }
            });
        }
        
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
            
            // Skip rows that don't have the expected structure
            if (allCells.length < 3) {
                console.log(`⚠️ Row ${rowIndex + 1} has insufficient cells (${allCells.length}), skipping`);
                return;
            }
            
            const lineItem = {};
            
            // Process each cell based on column mapping
            const columnMapping = this.getCurrentColumnMapping();
            Object.keys(columnMapping).forEach(physicalIndex => {
                const column = columnMapping[physicalIndex];
                if (column.fieldType !== 'dragHandle' && column.fieldType !== 'unknown') {
                    const cell = allCells[parseInt(physicalIndex)];
                    if (cell) {
                        const input = cell.querySelector('.editable-field');
                        if (input) {
                            const value = input.textContent.trim();
                            lineItem[column.fieldType] = value;
                            console.log(`📝 ${column.fieldType} (col ${physicalIndex}): "${value}"`);
                        } else {
                            console.log(`⚠️ No editable field found in ${column.fieldType} column`);
                            lineItem[column.fieldType] = '';
                        }
                    }
                }
            });
            
            // Only add line items that have content in any field
            const hasContent = Object.values(lineItem).some(value => value && value.trim());
            if (hasContent) {
                lineItems.push(lineItem);
                console.log(`✅ Added line item ${rowIndex + 1}:`, lineItem);
            } else {
                console.log(`⚠️ Skipping empty line item ${rowIndex + 1}`);
            }
        });
        
        console.log('📊 Final line items for XML:', lineItems);
        
        // Generate line items XML
        const lineItemsXml = this.generateLineItemsXml(lineItems);
        
        // Get current header order for XML generation (using DOM reading like table columns)
        const headerOrder = this.getCurrentHeaderSectionOrder();
        console.log('🔍 Final header order for XML:', headerOrder);
        
        // Get current vendor order for XML generation
        const vendorOrder = this.getCurrentVendorOrder();
        console.log('🔍 Final vendor order for XML:', vendorOrder);
        
        // Get current comments order for XML generation
        const commentsOrder = this.getCurrentCommentsOrder();
        console.log('🔍 Final comments order for XML:', commentsOrder);
        
        // Generate header XML based on current order
        const headerXml = this.generateHeaderXml(fieldValues, headerOrder);
        
        // Generate vendor XML based on current order
        const vendorXml = this.generateVendorXml(fieldValues, vendorOrder);
        
        // Generate comments XML based on current order
        const commentsXml = this.generateCommentsXml(fieldValues, commentsOrder);
        
        // Get current section order from DOM
        const sectionOrder = this.getCurrentSectionOrder();
        console.log('🔍 Final section order for XML:', sectionOrder);
        
        // Generate dynamic sections XML
        const dynamicSectionsXml = this.generateDynamicSectionsXml(fieldValues, {
            headerXml,
            vendorXml,
            lineItemsXml,
            commentsXml
        }, sectionOrder);
        
        // Generate the complete XML
        // Determine current header block color from DOM (falls back to default)
        const headerBlockColor = this.getHeaderBlockColorHex();

        const xmlContent = `<?xml version="1.0"?><!DOCTYPE pdf PUBLIC "-//big.faceless.org//report" "report-1.1.dtd">
<pdf>
<head>
    <meta name="title" value="Purchase Order"/>
    <meta name="author" value="Purchase Order Generator"/>
    <meta name="subject" value="Purchase Order"/>
    <meta name="creator" value="Purchase Order Generator"/>
    <meta name="producer" value="Purchase Order Generator"/>
    <meta name="creationDate" value="${new Date().toISOString()}"/>
    <meta name="modDate" value="${new Date().toISOString()}"/>
    <link name="NotoSans" type="font" subtype="truetype" src="\${nsfont.NotoSans_Regular}" src-bold="\${nsfont.NotoSans_Bold}" src-italic="\${nsfont.NotoSans_Italic}" src-bolditalic="\${nsfont.NotoSans_BoldItalic}" bytes="2" />
    <style>
        * { font-family: NotoSans, sans-serif; font-size: 9pt; }
        table { width: 100%; border-collapse: collapse; }
        .header-company { font-size: 14pt; font-weight: bold; }
        .header-title { font-size: 20pt; font-weight: bold; background-color: ${headerBlockColor}; color: #ffffff; padding: 6px; border: 1px solid #000; }
        .header-info { font-size: 10pt; }
        .section-header { background-color: ${headerBlockColor}; color: #ffffff; font-weight: bold; padding: 6px; border: 1px solid #000; }
        .section-content { padding: 6px; border: 1px solid #000; vertical-align: top; }
        .item-header { background-color: ${headerBlockColor}; color: #ffffff; font-weight: bold; padding: 8px; border: 1px solid #000; }
        .item-cell { padding: 6px; border: 1px solid #000; }
        .total-label { font-weight: bold; padding: 4px; }
        .total-amount { font-weight: bold; padding: 4px; background-color: #ffff99; }
        .comments-header { background-color: ${headerBlockColor}; color: #ffffff; font-weight: bold; padding: 6px; border: 1px solid #000; }
        .comments-content { padding: 6px; border: 1px solid #000; min-height: 40px; }
        .contact-info { font-size: 8pt; }
    </style>
</head>
<body padding="0.5in" size="Letter">
    ${dynamicSectionsXml}

    <table style="margin-top: 20px;">
        <tr>
            <td class="contact-info" style="width: 70%;">
                ${this.formatContactInfo(fieldValues.contactInfo, fieldValues.companyName, fieldValues.companyPhone)}
            </td>
            <td style="width: 30%; text-align: center;">
                <table style="width: 100%;">
                    <tr>
                        <td style="border-top: 1px solid #000; padding-top: 10px;">
                            Authorized Signature
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</pdf>`;

        console.log('✅ XML generation completed');
        return xmlContent;
    },

    // Read current header block color from DOM and normalize to #RRGGBB
    getHeaderBlockColorHex: function() {
        const defaultHex = '#333333';

        // Prefer a section header's background (vendor/ship-to/shipping headers)
        let sample = document.querySelector('.section-header');

        // Fallback to item table header
        if (!sample) sample = document.querySelector('.itemtable thead th');

        // Fallback to the PURCHASE ORDER title cell
        if (!sample) {
            const tds = document.querySelectorAll('td');
            for (let i = 0; i < tds.length; i++) {
                const text = (tds[i].textContent || '').trim().toLowerCase();
                if (text === 'purchase order') { sample = tds[i]; break; }
            }
        }

        if (!sample) return defaultHex;

        const bg = window.getComputedStyle(sample).backgroundColor;
        const hex = this.rgbStringToHex(bg);
        return hex || defaultHex;
    },

    // Convert rgb/rgba string to #RRGGBB
    rgbStringToHex: function(rgbString) {
        if (!rgbString) return '';
        if (rgbString.startsWith('#')) {
            // Normalize #RGB to #RRGGBB
            const hex = rgbString.replace(/\s+/g, '').toUpperCase();
            if (/^#([0-9A-F]{3})$/i.test(hex)) {
                return '#' + hex.substring(1).split('').map(ch => ch + ch).join('');
            }
            if (/^#([0-9A-F]{6})$/i.test(hex)) return hex;
            return '';
        }
        const m = rgbString.match(/rgba?\((\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*([\d.]+))?\)/i);
        if (!m) return '';
        const r = Math.max(0, Math.min(255, parseInt(m[1], 10)));
        const g = Math.max(0, Math.min(255, parseInt(m[2], 10)));
        const b = Math.max(0, Math.min(255, parseInt(m[3], 10)));
        const a = m[4] !== undefined ? parseFloat(m[4]) : 1;
        if (a === 0) return ''; // transparent -> fallback
        const toHex = (n) => n.toString(16).padStart(2, '0').toUpperCase();
        return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    },

    // Generate header XML based on current order
    generateHeaderXml: function(fieldValues, headerOrder) {
        console.log('🔧 Generating header XML with order:', headerOrder);
        
        const companySection = this.generateCompanyInfoSection(fieldValues, headerOrder.leftSection === 'company-info');
        const purchaseOrderSection = this.generatePurchaseOrderSection(fieldValues, headerOrder.leftSection === 'purchase-order');
        
        const leftSection = headerOrder.leftSection === 'company-info' ? companySection : purchaseOrderSection;
        const rightSection = headerOrder.rightSection === 'company-info' ? companySection : purchaseOrderSection;
        
        return `
    <table>
        <tr>
            ${leftSection}
            ${rightSection}
        </tr>
    </table>`;
    },

    // Generate vendor section XML based on current order
    generateVendorXml: function(fieldValues, vendorOrder) {
        console.log('🔧 Generating vendor XML with order:', vendorOrder);
        
        const vendorSection = this.generateVendorSection(fieldValues);
        const shipToSection = this.generateShipToSection(fieldValues);
        
        const leftSection = vendorOrder.leftSection === 'vendor' ? vendorSection : shipToSection;
        const rightSection = vendorOrder.rightSection === 'vendor' ? vendorSection : shipToSection;
        
        return `
    <table style="margin-top: 20px;">
        <tr>
            ${leftSection}
            ${rightSection}
        </tr>
    </table>`;
    },

    // Generate vendor section
    generateVendorSection: function(fieldValues) {
        return `
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
            </td>`;
    },

    // Generate ship-to section
    generateShipToSection: function(fieldValues) {
        return `
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
                            Phone: ${this.escapeXml(fieldValues.shipToPhone || fieldValues.companyPhone || '')}<br/>
                            Fax: ${this.escapeXml(fieldValues.shipToFax || '')}
                        </td>
                    </tr>
                </table>
            </td>`;
    },

    // Generate comments section XML based on current order
    generateCommentsXml: function(fieldValues, commentsOrder) {
        console.log('🔧 Generating comments XML with order:', commentsOrder);
        
        const commentsSection = this.generateCommentsSection(fieldValues);
        const totalsSection = this.generateTotalsSection(fieldValues);
        
        const leftSection = commentsOrder.leftSection === 'comments' ? commentsSection : totalsSection;
        const rightSection = commentsOrder.rightSection === 'comments' ? commentsSection : totalsSection;
        
        return `
    <table style="margin-top: 15px;">
        <tr>
            ${leftSection}
            ${rightSection}
        </tr>
    </table>`;
    },

    // Generate comments section
    generateCommentsSection: function(fieldValues) {
        return `
            <td style="width: 70%; vertical-align: top;">
                <table style="width: 100%; border: 1px solid #e5e7eb;">
                    <tr>
                        <td class="comments-header">Comments or Special Instructions</td>
                    </tr>
                    <tr>
                        <td class="comments-content" style="padding: 15px; height: 120px; vertical-align: top;">${this.escapeXml(fieldValues.comments || '')}</td>
                    </tr>
                </table>
            </td>`;
    },

    // Generate totals section
    generateTotalsSection: function(fieldValues) {
        return `
            <td style="width: 30%; padding: 0;">
                <table>
                    <tr>
                        <td class="total-label" align="right">SUBTOTAL</td>
                        <td class="total-label" align="right">${this.escapeXml(this.formatCurrency(fieldValues.subtotal || ''))}</td>
                    </tr>
                    <tr>
                        <td class="total-label" align="right">TAX</td>
                        <td class="total-label" align="right">${this.escapeXml(this.formatCurrency(fieldValues.tax || ''))}</td>
                    </tr>
                    <tr>
                        <td class="total-label" align="right">SHIPPING</td>
                        <td class="total-label" align="right">${this.escapeXml(this.formatCurrency(fieldValues.shipping || ''))}</td>
                    </tr>
                    <tr>
                        <td class="total-label" align="right">OTHER</td>
                        <td class="total-label" align="right">${this.escapeXml(this.formatCurrency(fieldValues.other || ''))}</td>
                    </tr>
                    <tr>
                        <td class="total-label" align="right">TOTAL</td>
                        <td class="total-amount" align="right">${this.escapeXml(this.formatCurrency(fieldValues.total || ''))}</td>
                    </tr>
                </table>
            </td>`;
    },

    // Generate company info section
    generateCompanyInfoSection: function(fieldValues, isLeftSide = true) {
        const width = isLeftSide ? '65%' : '65%';
        const alignment = isLeftSide ? '' : ' align="right"';
        const textAlign = isLeftSide ? 'left' : 'right';
        const padding = isLeftSide ? 'padding-right: 20px;' : 'padding-left: 110px;';
        
        return `
            <td style="width: ${width}; ${padding}"${alignment}>
                <table>
                    <tr>
                        <td class="header-company" style="text-align: ${textAlign};">${this.escapeXml(fieldValues.companyName || '')}</td>
                    </tr>
                    <tr>
                        <td style="text-align: ${textAlign};">${this.escapeXml(fieldValues.companyAddress || '')}</td>
                    </tr>
                    <tr>
                        <td style="text-align: ${textAlign};">${this.escapeXml(fieldValues.companyCityState || '')}</td>
                    </tr>
                    <tr>
                        <td style="text-align: ${textAlign};">Phone: ${this.escapeXml(fieldValues.companyPhone || '')}</td>
                    </tr>
                    <tr>
                        <td style="text-align: ${textAlign};">Fax: ${this.escapeXml(fieldValues.companyFax || '')}</td>
                    </tr>
                    <tr>
                        <td style="text-align: ${textAlign};">Website: ${this.escapeXml(fieldValues.companyWebsite || '')}</td>
                    </tr>
                </table>
            </td>`;
    },

    // Generate purchase order section
    generatePurchaseOrderSection: function(fieldValues, isLeftSide = false) {
        const width = isLeftSide ? '35%' : '35%';
        const alignment = isLeftSide ? '' : ' align="right"';
        const textAlign = isLeftSide ? 'left' : 'right';
        const padding = isLeftSide ? 'padding-right: 30px;' : 'padding-left: 20px;';
        
        return `
            <td style="width: ${width}; ${padding}"${alignment}>
                <table>
                    <tr>
                        <td class="header-title" style="text-align: ${textAlign};">PURCHASE ORDER</td>
                    </tr>
                    <tr>
                        <td style="text-align: ${textAlign};">
                            <table style="width: 100%;">
                                <tr>
                                    <td class="header-info" style="width: 30%; text-align: left;"><b>DATE</b></td>
                                    <td class="header-info" style="width: 70%; text-align: left;">${this.escapeXml(fieldValues.poDate || '')}</td>
                                </tr>
                                <tr>
                                    <td class="header-info" style="width: 30%; text-align: left;"><b>PO #</b></td>
                                    <td class="header-info" style="width: 70%; text-align: left;">${this.escapeXml(fieldValues.poNumber || '')}</td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </td>`;
    },

    // Generate line items XML
    generateLineItemsXml: function(lineItems) {
        if (!lineItems || lineItems.length === 0) {
            return '';
        }
        
        // Get current column order for XML generation
        const currentColumnOrder = this.getColumnOrder();
        
        // Generate table headers based on current column order
        let tableHeaders = '';
        currentColumnOrder.forEach((columnType, index) => {
            const headerText = this.getColumnHeaderText(columnType);
            if (headerText) {
                const alignment = this.getColumnAlignment(headerText);
                const colspan = this.getColumnSpan(columnType);
                tableHeaders += `<td class="item-header" align="${alignment}" colspan="${colspan}">${this.escapeXml(headerText.toUpperCase())}</td>`;
            }
        });
        
        // Generate table rows
        let tableRows = '';
        lineItems.forEach((item, index) => {
            tableRows += `\n        <tr>`;
            
            // Generate cells in the same order as headers
            currentColumnOrder.forEach((columnType, colIndex) => {
                const alignment = this.getColumnAlignment(this.getColumnHeaderText(columnType));
                const colspan = this.getColumnSpan(columnType);
                
                // For XML, use raw numeric values without currency symbols
                let cellContent = item[columnType] || '';
                if (columnType === 'rate' || columnType === 'amount') {
                    cellContent = this.formatNumericValue(cellContent);
                }
                
                cellContent = this.escapeXml(cellContent);
                tableRows += `\n            <td class="item-cell" align="${alignment}" colspan="${colspan}">${cellContent}</td>`;
            });
            
            tableRows += `\n        </tr>`;
        });
        
        return `
    <table style="margin-top: 15px;">
        <tr>
            ${tableHeaders}
        </tr>${tableRows}
    </table>`;
    },

    // Helper function to get column header text
    getColumnHeaderText: function(columnType) {
        const headerMap = {
            'quantity': 'Quantity',
            'itemName': 'Item',
            'description': 'Description',
            'options': 'Options',
            'rate': 'Rate',
            'amount': 'Amount'
        };
        return headerMap[columnType] || columnType;
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
                columnOrder.push(column.fieldType);
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

    // Helper function to get column span
    getColumnSpan: function(columnType) {
        switch(columnType) {
            case 'item': return 3;
            case 'description': return 12;
            case 'quantity': return 2;
            case 'rate': return 3;
            case 'amount': return 3;
            default: return 1;
        }
    },

    // Get current section order from DOM (vendor and shipping sections)
    getCurrentSectionOrder: function() {
        const container = document.querySelector('table.container td');
        if (!container) {
            console.log('⚠️ Container not found, using default order');
            return ['header', 'vendor', 'shipping', 'items', 'comments'];
        }
        
        const sections = [];
        const children = Array.from(container.children);
        
        console.log('🔍 Scanning container children for section order...', children.length, 'children found');
        
        children.forEach((child, index) => {
            console.log(`🔍 Child ${index}:`, child.tagName, child.className);
            
            if (child.classList.contains('header-section')) {
                sections.push('header');
                console.log('  ✅ Found header section');
            } else if (child.classList.contains('draggable-vendor-section')) {
                sections.push('vendor');
                console.log('  ✅ Found vendor section');
            } else if (child.classList.contains('draggable-shipping-section')) {
                sections.push('shipping');
                console.log('  ✅ Found shipping section');
            } else if (child.classList.contains('itemtable')) {
                sections.push('items');
                console.log('  ✅ Found items section');
            } else if (child.tagName === 'TABLE' && child.querySelector('.draggable-comments-row')) {
                sections.push('comments');
                console.log('  ✅ Found comments section');
            } else {
                console.log('  ❓ Unknown section type');
            }
        });
        
        console.log('🔍 Final detected section order from DOM:', sections);
        return sections.length > 0 ? sections : ['header', 'vendor', 'shipping', 'items', 'comments'];
    },

    // Generate sections in dynamic order
    generateDynamicSectionsXml: function(fieldValues, preGeneratedSections, sectionOrder) {
        let sectionsXml = '';
        
        sectionOrder.forEach(sectionType => {
            switch(sectionType) {
                case 'header':
                    sectionsXml += preGeneratedSections.headerXml + '\n\n';
                    break;
                case 'vendor':
                    sectionsXml += preGeneratedSections.vendorXml + '\n\n';
                    break;
                case 'shipping':
                    sectionsXml += this.generateShippingXml(fieldValues) + '\n\n';
                    break;
                case 'items':
                    sectionsXml += preGeneratedSections.lineItemsXml + '\n\n';
                    break;
                case 'comments':
                    sectionsXml += preGeneratedSections.commentsXml + '\n\n';
                    break;
                default:
                    console.warn(`🔍 Unknown section type: ${sectionType}`);
            }
        });
        
        return sectionsXml;
    },

    // Generate shipping section XML
    generateShippingXml: function(fieldValues) {
        return `    <table style="margin-top: 15px;">
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
    </table>`;
    },

    // Test function to check section swapping detection
    testSectionDetection: function() {
        console.log('🧪 Testing section detection...');
        const sectionOrder = this.getCurrentSectionOrder();
        console.log('📋 Current section order:', sectionOrder);
        
        // Also test container detection
        const container = document.querySelector('table.container td');
        console.log('🔍 Container found:', !!container);
        if (container) {
            console.log('🔍 Container children count:', container.children.length);
            Array.from(container.children).forEach((child, i) => {
                console.log(`  ${i}: ${child.tagName}.${child.className}`);
            });
        }
        
        return sectionOrder;
    },

    // Helper function to get current header section order (like getCurrentColumnMapping for tables)
    getCurrentHeaderSectionOrder: function() {
        console.log('🔍 Getting current header section order from DOM...');
        const headerCells = document.querySelectorAll('.header-cell');
        
        console.log('🔍 Found header cells:', headerCells.length);
        
        if (headerCells.length >= 2) {
            // Read the current DOM order
            const firstCell = headerCells[0];
            const secondCell = headerCells[1];
            
            // Determine section types
            const firstSection = this.getHeaderSectionType(firstCell);
            const secondSection = this.getHeaderSectionType(secondCell);
            
            console.log('🔍 First cell section type:', firstSection);
            console.log('🔍 Second cell section type:', secondSection);
            
            const headerOrder = {
                leftSection: firstSection,
                rightSection: secondSection
            };
            
            console.log('🔍 Header order detected from current DOM:', headerOrder);
            return headerOrder;
        } else {
            console.log('🔍 Using default header order (insufficient header cells)');
            return { leftSection: 'company-info', rightSection: 'purchase-order' };
        }
    },

    // Get current vendor section order from DOM
    getCurrentVendorOrder: function() {
        console.log('🔍 Getting current vendor section order from DOM...');
        const vendorCells = document.querySelectorAll('.vendor-cell');
        
        console.log('🔍 Found vendor cells:', vendorCells.length);
        
        if (vendorCells.length >= 2) {
            // Read the current DOM order
            const firstCell = vendorCells[0];
            const secondCell = vendorCells[1];
            
            // Determine section types
            const firstSection = this.getVendorSectionType(firstCell);
            const secondSection = this.getVendorSectionType(secondCell);
            
            console.log('🔍 First vendor cell section type:', firstSection);
            console.log('🔍 Second vendor cell section type:', secondSection);
            
            const vendorOrder = {
                leftSection: firstSection,
                rightSection: secondSection
            };
            
            console.log('🔍 Vendor order detected from current DOM:', vendorOrder);
            return vendorOrder;
        } else {
            console.log('🔍 Using default vendor order (insufficient vendor cells)');
            return { leftSection: 'vendor', rightSection: 'ship-to' };
        }
    },

    // Get current comments section order from DOM
    getCurrentCommentsOrder: function() {
        console.log('🔍 Getting current comments section order from DOM...');
        
        // Use drag and drop module if available
        if (window.DRAG_AND_DROP && window.DRAG_AND_DROP.getCurrentCommentsOrder) {
            const dragDropOrder = window.DRAG_AND_DROP.getCurrentCommentsOrder();
            console.log('🔍 Drag and drop module provided comments order:', dragDropOrder);
            return dragDropOrder;
        }
        
        const commentsCells = document.querySelectorAll('.comments-cell');
        
        console.log('🔍 Found comments cells:', commentsCells.length);
        
        if (commentsCells.length >= 2) {
            // Read the current DOM order
            const firstCell = commentsCells[0];
            const secondCell = commentsCells[1];
            
            // Determine section types
            const firstSection = this.getCommentsSectionType(firstCell);
            const secondSection = this.getCommentsSectionType(secondCell);
            
            console.log('🔍 First comments cell section type:', firstSection);
            console.log('🔍 Second comments cell section type:', secondSection);
            
            const commentsOrder = {
                leftSection: firstSection,
                rightSection: secondSection
            };
            
            console.log('🔍 Comments order detected from current DOM:', commentsOrder);
            return commentsOrder;
        } else {
            console.log('🔍 Using default comments order (insufficient comments cells)');
            return { leftSection: 'comments', rightSection: 'totals' };
        }
    },

    // Helper method to determine comments section type
    getCommentsSectionType: function(cell) {
        if (!cell) return 'comments';
        
        // Check data-section attribute first
        if (cell.dataset && cell.dataset.section) {
            return cell.dataset.section;
        }
        
        // Check CSS classes
        if (cell.classList.contains('comments-section')) {
            return 'comments';
        } else if (cell.classList.contains('totals-section')) {
            return 'totals';
        } else {
            // Fallback
            return 'comments';
        }
    },

    // Helper method to determine vendor section type
    getVendorSectionType: function(cell) {
        if (!cell) return 'vendor';
        
        // Check data-section attribute first
        if (cell.dataset && cell.dataset.section) {
            return cell.dataset.section;
        }
        
        // Check CSS classes
        if (cell.classList.contains('vendor-section')) {
            return 'vendor';
        } else if (cell.classList.contains('ship-to-section')) {
            return 'ship-to';
        } else {
            // Fallback
            return 'vendor';
        }
    },

    // Helper function to determine section type from header cell
    getHeaderSectionType: function(headerCell) {
        if (!headerCell) return 'company-info';
        
        // Check data-section attribute first
        if (headerCell.dataset && headerCell.dataset.section) {
            return headerCell.dataset.section;
        }
        
        // Check CSS classes
        if (headerCell.classList.contains('company-info')) {
            return 'company-info';
        } else if (headerCell.classList.contains('purchase-order')) {
            return 'purchase-order';
        }
        
        // Fallback: assume company-info
        return 'company-info';
    },

    // Helper function to format currency values (ensures dollar sign is present)
    formatCurrency: function(value) {
        return window.CURRENCY_FORMATTER ? window.CURRENCY_FORMATTER.format(value) : this.formatCurrencyInternal(value);
    },

    // Helper function to format numeric values for XML (removes currency symbols)
    formatNumericValue: function(value) {
        if (!value || value.toString().trim() === '') return '';
        
        // Remove currency symbols and formatting, keep only numbers and decimals
        const cleanValue = value.toString().replace(/[$,\s]/g, '');
        
        // Validate it's a number
        if (isNaN(cleanValue) || cleanValue === '') {
            return '';
        }
        
        // Return formatted number (no currency symbol for XML)
        const number = parseFloat(cleanValue);
        return number.toFixed(2);
    },

    // Internal currency formatting (fallback)
    formatCurrencyInternal: function(value) {
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

    // Debug section swapping state and field mapping
    debugSectionSwapping: function() {
        console.group('🔄 Section Swapping Debug');
        
        // Check current section order
        const headerRow = document.querySelector('.draggable-header-row');
        if (headerRow) {
            const cells = Array.from(headerRow.querySelectorAll('.header-cell'));
            console.log('📍 Current header section order:');
            cells.forEach((cell, index) => {
                const section = cell.getAttribute('data-section');
                const classes = cell.className;
                console.log(`  ${index}: data-section="${section}" class="${classes}"`);
            });
        }
        
        // Check drag and drop state
        if (window.DRAG_DROP && window.DRAG_DROP.currentHeaderOrder) {
            console.log('🔄 Drag & Drop current order:', window.DRAG_DROP.currentHeaderOrder);
        }
        
        // Check field mapping being used
        if (window.UTILS && window.UTILS.getDynamicFieldMapping) {
            const mapping = window.UTILS.getDynamicFieldMapping();
            console.log('🗺️ Current field mapping for key fields:');
            console.log('  companyName:', mapping.companyName);
            console.log('  poDate:', mapping.poDate);
            console.log('  poNumber:', mapping.poNumber);
            console.log('  vendorCompany:', mapping.vendorCompany);
            console.log('  shipToName:', mapping.shipToName);
        }
        
        // Test field finding directly
        console.log('🔍 Testing field finding:');
        if (window.UTILS && window.UTILS.findFieldByLabel) {
            const testFields = [
                { label: 'Company Name', section: 'company-info' },
                { label: 'DATE', section: 'purchase-order' },
                { label: 'PO #', section: 'purchase-order' },
                { label: 'Company Name', section: 'vendor' },
                { label: 'Name', section: 'ship-to' }
            ];
            
            testFields.forEach(({ label, section }) => {
                const element = window.UTILS.findFieldByLabel(label, section);
                console.log(`  ${label} in ${section}:`, element ? 'FOUND' : 'NOT FOUND', element?.textContent || '');
            });
        }
        
        console.groupEnd();
    },

    // Format contact information with proper line breaks and spacing
    formatContactInfo: function(contactInfo, companyName, companyPhone) {
        if (!contactInfo) {
            // Fallback contact info if none provided
            const fallback = `For questions about this purchase order, please contact ${companyName || 'us'}`;
            return this.escapeXml(companyPhone ? `${fallback} at ${companyPhone}` : fallback);
        }

        // Clean up the contact info text
        let formatted = contactInfo.toString().trim();
        
        // Fix spacing issues between words
        // Replace multiple spaces with single spaces
        formatted = formatted.replace(/\s+/g, ' ');
        
        // Handle the specific case: "For inquiries, contact [Name] at [Phone] or [Email]"
        const contactPattern = /(For inquiries, contact)\s+([^at]+?)\s+at\s+([^or]+?)\s+or\s+(.+)/i;
        if (contactPattern.test(formatted)) {
            formatted = formatted.replace(contactPattern, (match, prefix, name, phone, email) => {
                return `${prefix} ${name.trim()}<br/>at ${phone.trim()}<br/>or ${email.trim()}`;
            });
        } else {
            // Handle cases where email and phone are run together
            // Look for patterns like "email@domain.com or 555-123-4567" or "email@domain.com555-123-4567"
            const emailPhonePattern = /(\S+@\S+\.\S+)\s*(or\s*)?(\d{3}[-.]?\d{3}[-.]?\d{4})/gi;
            
            if (emailPhonePattern.test(formatted)) {
                formatted = formatted.replace(emailPhonePattern, (match, email, orText, phone) => {
                    return `${email}<br/>or ${phone}`;
                });
            } else {
                // Look for standalone phone numbers that should be on a new line
                // Pattern for phone numbers at the end of text
                const phoneAtEndPattern = /(.+)\s+(\d{3}[-.]?\d{3}[-.]?\d{4})$/;
                if (phoneAtEndPattern.test(formatted)) {
                    formatted = formatted.replace(phoneAtEndPattern, '$1<br/>$2');
                }
            }
        }
        
        return this.escapeXml(formatted).replace(/&lt;br\/&gt;/g, '<br/>');
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
