// Drag and Drop Functionality for Table Rows and Columns

// Row drag and drop variables
let draggedRow = null;
let draggedRowIndex = null;

// Column drag and drop variables
let draggedColumn = null;
let draggedColumnIndex = null;

// Initialize drag and drop when page loads
function initializeDragAndDrop() {
    initializeRowDragAndDrop();
    initializeColumnDragAndDrop();
}

// Row drag and drop functionality
function initializeRowDragAndDrop() {
    const table = document.querySelector('.itemtable tbody');
    if (!table) return;

    const rows = table.querySelectorAll('tr.draggable-row');
    console.log(`Initializing drag and drop for ${rows.length} rows`);
    
    rows.forEach((row, index) => {
        const dragHandle = row.querySelector('td:first-child');
        if (dragHandle) {
            // Remove any existing event listeners
            dragHandle.removeEventListener('dragstart', handleRowDragStart);
            dragHandle.removeEventListener('dragend', handleRowDragEnd);
            
            // Set draggable and add event listeners
            dragHandle.draggable = true;
            dragHandle.addEventListener('dragstart', handleRowDragStart);
            dragHandle.addEventListener('dragend', handleRowDragEnd);
            
            // Store row info for the event handlers
            dragHandle.dataset.rowIndex = index;
            dragHandle.dataset.rowId = `row-${index}`;
            
            console.log(`Row ${index + 1}: Added drag events to handle`);
        }

        // Remove existing drop zone events
        row.removeEventListener('dragover', handleRowDragOver);
        row.removeEventListener('dragleave', handleRowDragLeave);
        row.removeEventListener('drop', handleRowDrop);
        
        // Add drop zone events
        row.addEventListener('dragover', handleRowDragOver);
        row.addEventListener('dragleave', handleRowDragLeave);
        row.addEventListener('drop', handleRowDrop);
        
        // Store row info
        row.dataset.rowIndex = index;
        row.dataset.rowId = `row-${index}`;
    });
}

// Row event handlers
function handleRowDragStart(e) {
    const row = e.target.closest('tr');
    const rowIndex = parseInt(e.target.dataset.rowIndex);
    
    draggedRow = row;
    draggedRowIndex = rowIndex;
    row.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', row.outerHTML);
    
    console.log(`Started dragging row ${rowIndex + 1}`);
}

function handleRowDragEnd(e) {
    const row = e.target.closest('tr');
    row.classList.remove('dragging');
    draggedRow = null;
    draggedRowIndex = null;
    
    console.log('Drag ended');
}

function handleRowDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    e.currentTarget.classList.add('drop-zone', 'drag-over');
}

function handleRowDragLeave(e) {
    e.currentTarget.classList.remove('drop-over');
}

function handleRowDrop(e) {
    e.preventDefault();
    const targetRow = e.currentTarget;
    targetRow.classList.remove('drop-zone', 'drag-over');
    
    if (draggedRow && draggedRow !== targetRow) {
        const targetIndex = parseInt(targetRow.dataset.rowIndex);
        console.log(`Dropping row ${draggedRowIndex + 1} onto row ${targetIndex + 1}`);
        swapRows(draggedRowIndex, targetIndex);
        
        // XML will be generated when user clicks "Convert to NetSuite XML"
        console.log('Rows reordered - XML will reflect new order when generated');
    }
}

// Swap rows in the table
function swapRows(fromIndex, toIndex) {
    console.log(`Swapping row ${fromIndex + 1} with row ${toIndex + 1}`);
    
    const table = document.querySelector('.itemtable tbody');
    const rows = Array.from(table.querySelectorAll('tr'));
    
    if (fromIndex >= 0 && fromIndex < rows.length && toIndex >= 0 && toIndex < rows.length) {
        const fromRow = rows[fromIndex];
        const toRow = rows[toIndex];
        
        if (fromIndex < toIndex) {
            toRow.parentNode.insertBefore(fromRow, toRow.nextSibling);
        } else {
            toRow.parentNode.insertBefore(fromRow, toRow);
        }
        
        console.log(`Successfully swapped row ${fromIndex + 1} with row ${toIndex + 1}`);
        
        // Update line item IDs to reflect new order
        updateLineItemIDs();
        
        // Update totals
        if (window.CALCULATIONS) {
            window.CALCULATIONS.updateAllTotals();
        }
        
        // Auto-refresh XML to show the new row order
        if (window.XML_GENERATOR) {
            window.XML_GENERATOR.refreshXmlDisplay();
        }
        
        console.log('Rows reordered - XML will reflect new order when generated');
    }
}

// Column drag and drop functionality
function initializeColumnDragAndDrop() {
    const table = document.querySelector('.itemtable thead');
    if (!table) return;

    // Remove any existing ID labels for clean interface
    removeAllIDLabels();

    const headerCells = table.querySelectorAll('th');
    console.log(`🔄 Initializing column drag and drop for ${headerCells.length} columns`);
    
    headerCells.forEach((headerCell, index) => {
        // Remove any existing event listeners
        headerCell.removeEventListener('dragstart', handleColumnDragStart);
        headerCell.removeEventListener('dragend', handleColumnDragEnd);
        
        // Set draggable and add event listeners
        headerCell.draggable = true;
        headerCell.addEventListener('dragstart', handleColumnDragStart);
        headerCell.addEventListener('dragend', handleColumnDragEnd);
        
        // Store column info for the event handlers
        headerCell.dataset.columnIndex = index;
        headerCell.dataset.columnId = `column-${index}`;
    });

    // Add drop zone events to header cells
    headerCells.forEach((headerCell, index) => {
        headerCell.removeEventListener('dragover', handleColumnDragOver);
        headerCell.removeEventListener('dragleave', handleColumnDragLeave);
        headerCell.removeEventListener('drop', handleColumnDrop);
        
        headerCell.addEventListener('dragover', handleColumnDragOver);
        headerCell.addEventListener('dragleave', handleColumnDragLeave);
        headerCell.addEventListener('drop', handleColumnDrop);
        
        headerCell.dataset.columnIndex = index;
    });
    
    console.log(`✅ Column drag and drop initialized successfully`);
}

// Column event handlers
function handleColumnDragStart(e) {
    const headerCell = e.target;
    const columnIndex = parseInt(headerCell.dataset.columnIndex);
    
    draggedColumn = headerCell;
    draggedColumnIndex = columnIndex;
    headerCell.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', headerCell.outerHTML);
    
    console.log(`🔄 Started dragging column ${columnIndex + 1}`);
}

function handleColumnDragEnd(e) {
    const headerCell = e.target;
    headerCell.classList.remove('dragging');
    draggedColumn = null;
    draggedColumnIndex = null;
    
    console.log(`✅ Column drag ended`);
}

function handleColumnDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    e.currentTarget.classList.add('drop-zone', 'drag-over');
}

function handleColumnDragLeave(e) {
    e.currentTarget.classList.remove('drop-over');
}

function handleColumnDrop(e) {
    e.preventDefault();
    const targetHeader = e.currentTarget;
    targetHeader.classList.remove('drop-zone', 'drag-over');
    
    if (draggedColumn && draggedColumn !== targetHeader) {
        const targetIndex = parseInt(targetHeader.dataset.columnIndex);
        console.log(`🔄 Dropping column ${draggedColumnIndex + 1} onto column ${targetIndex + 1}`);
        swapColumns(draggedColumnIndex, targetIndex);
    }
}

// Swap columns in the table
function swapColumns(fromIndex, toIndex) {
    if (fromIndex === toIndex) return;
    
    const table = document.querySelector('.itemtable');
    const headerRow = table.querySelector('thead tr');
    const headerCells = Array.from(headerRow.querySelectorAll('th'));
    
    if (fromIndex < 0 || toIndex < 0 || fromIndex >= headerCells.length || toIndex >= headerCells.length) return;
    
    console.log(`🔄 Swapping column ${fromIndex + 1} with column ${toIndex + 1}`);
    
    // Get the elements to swap
    const fromHeader = headerCells[fromIndex];
    const toHeader = headerCells[toIndex];
    
    // Swap headers using insertBefore
    if (fromIndex < toIndex) {
        headerRow.insertBefore(fromHeader, toHeader.nextSibling);
        headerRow.insertBefore(toHeader, fromHeader);
    } else {
        headerRow.insertBefore(toHeader, fromHeader.nextSibling);
        headerRow.insertBefore(fromHeader, toHeader);
    }
    
    // Swap data cells in all rows
    const rows = table.querySelectorAll('tbody tr');
    rows.forEach(row => {
        const cells = Array.from(row.querySelectorAll('td'));
        if (cells.length === headerCells.length) {
            const fromCell = cells[fromIndex];
            const toCell = cells[toIndex];
            
            if (fromIndex < toIndex) {
                row.insertBefore(fromCell, toCell.nextSibling);
                row.insertBefore(toCell, fromCell);
            } else {
                row.insertBefore(toCell, fromCell.nextSibling);
                row.insertBefore(fromCell, toCell);
            }
        }
    });
    
    // Update IDs and reinitialize drag and drop
    updateColumnIDs();
    updateLineItemIDs();
    initializeColumnDragAndDrop();
    
    // Update XML preview in real-time
    if (window.XML_GENERATOR) {
        console.log('🔄 Triggering XML update for new column order...');
        window.XML_GENERATOR.updateXmlPreview();
    }
    
    console.log(`✅ Columns swapped successfully`);
    console.log('🔄 XML has been updated to reflect the new column order!');
    
    // Show user feedback
    if (window.MAIN_APP && window.MAIN_APP.showSuccess) {
        window.MAIN_APP.showSuccess('Columns reordered! XML will reflect the new order.');
    }
}

// Function to update line item IDs based on current visual order
function updateLineItemIDs() {
    // ID generation disabled for clean interface
    return;
}

// Function to remove any existing ID labels for clean interface
function removeAllIDLabels() {
    // Remove ID labels from editable fields
    const idLabels = document.querySelectorAll('.id-label, small[style*="color: #666"]');
    idLabels.forEach(label => {
        if (label.textContent.includes('ID:')) {
            label.remove();
        }
    });
    
    // Remove ID labels from headers
    const headerSmalls = document.querySelectorAll('th small');
    headerSmalls.forEach(small => {
        if (small.textContent.includes('ID:')) {
            small.remove();
        }
    });
}

// Function to update column IDs based on current visual order (DISABLED - IDs removed for clean UI)
function updateColumnIDs() {
    // ID generation disabled for clean interface
    return;
}

// Column Management Functions
function addColumn() {
    console.log('🔄 Adding new column...');
    
    const table = document.querySelector('.itemtable');
    const headerRow = table.querySelector('thead tr');
    const tbody = table.querySelector('tbody');
    
    // Add header cell
    const newHeader = document.createElement('th');
    newHeader.style.cssText = 'width: 15%; background: #333333; color: white; padding: 12px; font-weight: bold; text-align: center;';
    newHeader.innerHTML = 'New Column<br><small style="color: #ccc; font-size: 10px;">ID: newColumn</small>';
    newHeader.draggable = true;
    newHeader.classList.add('draggable-column');
    headerRow.appendChild(newHeader);
    
    // Add data cells to all rows
    const rows = tbody.querySelectorAll('tr');
    rows.forEach((row, index) => {
        const newCell = document.createElement('td');
        newCell.style.cssText = 'padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: center;';
        newCell.innerHTML = `<span class="editable-field" contenteditable="true" data-placeholder="">New Data ${index + 1}</span>`;
        row.appendChild(newCell);
    });
    
    // Reinitialize column drag and drop
    initializeColumnDragAndDrop();
    updateColumnIDs();
    
    console.log('✅ New column added successfully');
}

function removeColumn() {
    console.log('🔄 Removing last column...');
    
    const table = document.querySelector('.itemtable');
    const headerRow = table.querySelector('thead tr');
    const tbody = table.querySelector('tbody');
    
    // Don't remove the drag handle column (first column)
    const headerCells = headerRow.querySelectorAll('th');
    if (headerCells.length <= 2) {
        alert('Cannot remove more columns. Need at least 2 columns.');
        return;
    }
    
    // Remove last header cell
    const lastHeader = headerCells[headerCells.length - 1];
    if (lastHeader && !lastHeader.textContent.includes('::')) {
        lastHeader.remove();
        
        // Remove last data cell from all rows
        const rows = tbody.querySelectorAll('tr');
        rows.forEach((row, index) => {
            const cells = row.querySelectorAll('td');
            if (cells.length > 0) {
                cells[cells.length - 1].remove();
            }
        });
        
        // Reinitialize column drag and drop
        initializeColumnDragAndDrop();
        updateColumnIDs();
        
        console.log('✅ Last column removed successfully');
    } else {
        alert('Cannot remove the drag handle column.');
    }
}

// Export drag and drop functionality
window.DRAG_AND_DROP = {
    initializeDragAndDrop,
    initializeRowDragAndDrop,
    initializeColumnDragAndDrop,
    swapRows,
    swapColumns,
    updateLineItemIDs,
    updateColumnIDs,
    addColumn,
    removeColumn
};
