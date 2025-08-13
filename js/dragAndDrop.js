// Drag and Drop Functionality for Table Rows and Columns

// Row drag and drop variables
let draggedRow = null;
let draggedRowIndex = null;
let currentDropTarget = null;

// Column drag and drop variables
let draggedColumn = null;
let draggedColumnIndex = null;
let currentColumnDropTarget = null;

// Drag state management
let isDragging = false;
let dragDebounceTimer = null;

// Initialize drag and drop when page loads
function initializeDragAndDrop() {
    // Row drag and drop disabled - rows are no longer swappable
    // initializeRowDragAndDrop();
    initializeColumnDragAndDrop();
}

// Row drag and drop functionality - DISABLED
// Rows are no longer swappable to maintain data integrity
function initializeRowDragAndDrop() {
    console.log('🚫 Row drag and drop is disabled - rows cannot be swapped');
    return; // Early return to disable functionality
    
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
    currentDropTarget = null;
    
    row.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', row.outerHTML);
    
    console.log(`Started dragging row ${rowIndex + 1}`);
}

function handleRowDragEnd(e) {
    const row = e.target.closest('tr');
    
    // Clean up all state and styling
    row.classList.remove('dragging');
    
    // Clear any remaining drop zone styling
    document.querySelectorAll('.drop-zone, .drag-over').forEach(element => {
        element.classList.remove('drop-zone', 'drag-over');
    });
    
    // Clear debounce timer
    if (dragDebounceTimer) {
        clearTimeout(dragDebounceTimer);
        dragDebounceTimer = null;
    }
    
    // Reset variables
    draggedRow = null;
    draggedRowIndex = null;
    currentDropTarget = null;
    
    console.log('Drag ended');
}

function handleRowDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    
    // Allow drag over even if isDragging isn't set yet
    e.dataTransfer.dropEffect = 'move';
    const targetRow = e.currentTarget;
    
    // If no active drag, just allow the event
    if (!draggedRow) return;
    
    // Debounce the drag over event to prevent rapid firing
    if (dragDebounceTimer) {
        clearTimeout(dragDebounceTimer);
    }
    
    dragDebounceTimer = setTimeout(() => {
        // Clear previous drop target styling
        if (currentDropTarget && currentDropTarget !== targetRow) {
            currentDropTarget.classList.remove('drop-zone', 'drag-over');
        }
        
        // Only add styling if this is a valid drop target and different from dragged row
        if (targetRow !== draggedRow) {
            currentDropTarget = targetRow;
            targetRow.classList.add('drop-zone', 'drag-over');
        }
    }, 50); // 50ms debounce
}

function handleRowDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();
    
    const targetRow = e.currentTarget;
    
    // Only remove styling if we're actually leaving this element
    // Check if the related target is outside this row
    if (!targetRow.contains(e.relatedTarget)) {
        targetRow.classList.remove('drop-zone', 'drag-over');
        if (currentDropTarget === targetRow) {
            currentDropTarget = null;
        }
    }
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
    currentColumnDropTarget = null;
    
    headerCell.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', headerCell.outerHTML);
    
    console.log(`🔄 Started dragging column ${columnIndex + 1}`);
}

function handleColumnDragEnd(e) {
    const headerCell = e.target;
    
    // Clean up all state and styling
    headerCell.classList.remove('dragging');
    
    // Clear any remaining drop zone styling
    document.querySelectorAll('.drop-zone, .drag-over').forEach(element => {
        element.classList.remove('drop-zone', 'drag-over');
    });
    
    // Clear debounce timer
    if (dragDebounceTimer) {
        clearTimeout(dragDebounceTimer);
        dragDebounceTimer = null;
    }
    
    // Reset variables
    draggedColumn = null;
    draggedColumnIndex = null;
    currentColumnDropTarget = null;
    
    console.log(`✅ Column drag ended`);
}

function handleColumnDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    
    // Allow drag over even if isDragging isn't set yet
    e.dataTransfer.dropEffect = 'move';
    const targetHeader = e.currentTarget;
    
    // If no active drag, just allow the event
    if (!draggedColumn) return;
    
    // Debounce the drag over event to prevent rapid firing
    if (dragDebounceTimer) {
        clearTimeout(dragDebounceTimer);
    }
    
    dragDebounceTimer = setTimeout(() => {
        // Clear previous drop target styling
        if (currentColumnDropTarget && currentColumnDropTarget !== targetHeader) {
            currentColumnDropTarget.classList.remove('drop-zone', 'drag-over');
        }
        
        // Only add styling if this is a valid drop target and different from dragged column
        if (targetHeader !== draggedColumn) {
            currentColumnDropTarget = targetHeader;
            targetHeader.classList.add('drop-zone', 'drag-over');
        }
    }, 50); // 50ms debounce
}

function handleColumnDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();
    
    const targetHeader = e.currentTarget;
    
    // Only remove styling if we're actually leaving this element
    // Check if the related target is outside this header
    if (!targetHeader.contains(e.relatedTarget)) {
        targetHeader.classList.remove('drop-zone', 'drag-over');
        if (currentColumnDropTarget === targetHeader) {
            currentColumnDropTarget = null;
        }
    }
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
    // Initialize drag and drop functionality
    init: function() {
        console.log('🚀 Initializing drag and drop functionality...');
        this.initHeaderDragAndDrop();
        this.initVendorDragAndDrop();
        this.initCommentsDragAndDrop();
        initializeColumnDragAndDrop();
        initializeRowDragAndDrop();
        console.log('✅ Drag and drop initialized');
    },

    // Initialize header section drag and drop (Sections 1 & 2)
    initHeaderDragAndDrop: function() {
        console.log('🔧 Initializing header section drag and drop...');
        
        const headerCells = document.querySelectorAll('.header-cell');
        if (headerCells.length === 0) {
            console.log('⚠️ Header cells not found, skipping header drag and drop');
            return;
        }

        // Add drag event listeners to each header cell
        headerCells.forEach(cell => {
            cell.addEventListener('dragstart', this.handleHeaderDragStart.bind(this));
            cell.addEventListener('dragend', this.handleHeaderDragEnd.bind(this));
            cell.addEventListener('dragover', this.handleHeaderDragOver.bind(this));
            cell.addEventListener('dragleave', this.handleHeaderDragLeave.bind(this));
            cell.addEventListener('drop', this.handleHeaderDrop.bind(this));
            
            // Make each header cell draggable
            cell.setAttribute('draggable', 'true');
        });
        
        console.log('✅ Header section drag and drop initialized');
        
        // Set initial padding for proper alignment
        const headerRow = document.querySelector('.draggable-header-row');
        if (headerRow) {
            this.updateHeaderCellPadding(headerRow);
        }
    },

    // Initialize vendor section drag and drop (Sections 3 & 4)
    initVendorDragAndDrop: function() {
        console.log('🔧 Initializing vendor section drag and drop...');
        
        const vendorCells = document.querySelectorAll('.vendor-cell');
        console.log(`🔍 Found ${vendorCells.length} vendor cells:`, vendorCells);
        if (vendorCells.length === 0) {
            console.log('⚠️ Vendor cells not found, skipping vendor drag and drop');
            return;
        }

        // Add drag event listeners to each vendor cell
        vendorCells.forEach(cell => {
            cell.addEventListener('dragstart', this.handleVendorDragStart.bind(this));
            cell.addEventListener('dragend', this.handleVendorDragEnd.bind(this));
            cell.addEventListener('dragover', this.handleVendorDragOver.bind(this));
            cell.addEventListener('dragleave', this.handleVendorDragLeave.bind(this));
            cell.addEventListener('drop', this.handleVendorDrop.bind(this));
            
            // Make each vendor cell draggable
            cell.setAttribute('draggable', 'true');
        });
        
        console.log('✅ Vendor section drag and drop initialized');
        
        // Set initial padding for proper alignment
        const vendorRow = document.querySelector('.draggable-vendor-row');
        if (vendorRow) {
            this.updateVendorCellPadding(vendorRow);
        }
    },

    // Initialize comments section drag and drop (Comments & Totals)
    initCommentsDragAndDrop: function() {
        console.log('🔧 Initializing comments section drag and drop...');
        
        const commentsCells = document.querySelectorAll('.comments-cell');
        console.log(`🔍 Found ${commentsCells.length} comments cells:`, commentsCells);
        if (commentsCells.length === 0) {
            console.log('⚠️ Comments cells not found, skipping comments drag and drop');
            return;
        }

        // Add drag event listeners to each comments cell
        commentsCells.forEach(cell => {
            cell.addEventListener('dragstart', this.handleCommentsDragStart.bind(this));
            cell.addEventListener('dragend', this.handleCommentsDragEnd.bind(this));
            cell.addEventListener('dragover', this.handleCommentsDragOver.bind(this));
            cell.addEventListener('dragleave', this.handleCommentsDragLeave.bind(this));
            cell.addEventListener('drop', this.handleCommentsDrop.bind(this));
            
            // Make each comments cell draggable
            cell.setAttribute('draggable', 'true');
        });
        
        console.log('✅ Comments section drag and drop initialized');
        
        // Set initial padding for proper alignment
        const commentsRow = document.querySelector('.draggable-comments-row');
        if (commentsRow) {
            this.updateCommentsCellPadding(commentsRow);
        }
    },

    // Handle header drag start
    handleHeaderDragStart: function(e) {
        console.log('🎯 Header drag started');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', e.target.outerHTML);
        
        // Add dragging class for visual feedback
        e.target.classList.add('dragging');
        
        // Store the dragged section info
        this.draggedHeaderSection = e.target;
        this.currentHeaderDropTarget = null;
    },

    // Handle header drag end
    handleHeaderDragEnd: function(e) {
        console.log('🏁 Header drag ended');
        
        // Clean up all state and styling
        e.target.classList.remove('dragging');
        this.draggedHeaderSection = null;
        this.currentHeaderDropTarget = null;
        
        // Clear any remaining drop zone styling
        document.querySelectorAll('.header-cell').forEach(cell => {
            cell.classList.remove('drop-zone', 'drag-over');
        });
        
        // Clear debounce timer
        if (dragDebounceTimer) {
            clearTimeout(dragDebounceTimer);
            dragDebounceTimer = null;
        }
    },

    // Handle header drag over
    handleHeaderDragOver: function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        // Allow drag over even if isDragging isn't set yet
        e.dataTransfer.dropEffect = 'move';
        
        // Find the header cell being dragged over
        const targetCell = e.target.closest('.header-cell');
        if (!targetCell) return;
        
        // If no active drag, just allow the event
        if (!this.draggedHeaderSection) return;
        
        // Debounce the drag over event to prevent rapid firing
        if (dragDebounceTimer) {
            clearTimeout(dragDebounceTimer);
        }
        
        dragDebounceTimer = setTimeout(() => {
            // Clear previous drop target styling
            if (this.currentHeaderDropTarget && this.currentHeaderDropTarget !== targetCell) {
                this.currentHeaderDropTarget.classList.remove('drop-zone', 'drag-over');
            }
            
            // Only add styling if this is a valid drop target and different from dragged section
            if (targetCell !== this.draggedHeaderSection) {
                this.currentHeaderDropTarget = targetCell;
                targetCell.classList.add('drop-zone', 'drag-over');
            }
        }, 50); // 50ms debounce
    },

    // Handle header drag leave
    handleHeaderDragLeave: function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const targetCell = e.target.closest('.header-cell');
        if (!targetCell) return;
        
        // Only remove styling if we're actually leaving this element
        // Check if the related target is outside this header cell
        if (!targetCell.contains(e.relatedTarget)) {
            targetCell.classList.remove('drop-zone', 'drag-over');
            if (this.currentHeaderDropTarget === targetCell) {
                this.currentHeaderDropTarget = null;
            }
        }
    },

    // Handle header drop
    handleHeaderDrop: function(e) {
        e.preventDefault();
        console.log('📥 Header drop event');
        
        const targetCell = e.target.closest('.header-cell');
        if (!targetCell || !this.draggedHeaderSection) return;
        
        // Clean up drop zone styling
        targetCell.classList.remove('drop-zone', 'drag-over');
        this.currentHeaderDropTarget = null;
        
        // Get the parent row
        const headerRow = targetCell.closest('.draggable-header-row');
        if (!headerRow) return;
        
        // Get all header cells
        const headerCells = Array.from(headerRow.querySelectorAll('.header-cell'));
        const draggedCell = this.draggedHeaderSection;
        const targetIndex = headerCells.indexOf(targetCell);
        const draggedIndex = headerCells.indexOf(draggedCell);
        
        if (targetIndex === -1 || draggedIndex === -1) return;
        
        // Swap the cells
        this.swapHeaderCells(headerRow, draggedIndex, targetIndex);
        
        // Update XML preview to reflect new order
        if (window.XML_GENERATOR && window.XML_GENERATOR.updateXmlPreview) {
            window.XML_GENERATOR.updateXmlPreview();
        }
        
        console.log('🔄 Header sections swapped successfully');
        console.log('🔄 XML has been updated to reflect the new header section order!');
        
        // Show user feedback
        if (window.MAIN_APP && window.MAIN_APP.showSuccess) {
            window.MAIN_APP.showSuccess('Header sections reordered! XML will reflect the new layout.');
        }
    },

    // Vendor drag and drop handlers (Sections 3 & 4)
    handleVendorDragStart: function(e) {
        console.log('🎯 Vendor drag started');
        e.dataTransfer.effectAllowed = 'move';
        this.draggedVendorSection = e.target;
        e.target.classList.add('dragging');
        
        // Get the parent row
        const vendorRow = e.target.closest('.draggable-vendor-row');
        if (vendorRow) {
            vendorRow.classList.add('dragging');
        }
    },

    handleVendorDragEnd: function(e) {
        console.log('🏁 Vendor drag ended');
        e.target.classList.remove('dragging');
        
        // Get the parent row
        const vendorRow = e.target.closest('.draggable-vendor-row');
        if (vendorRow) {
            vendorRow.classList.remove('dragging');
        }
        
        // Clear any remaining drop zone styling more aggressively
        document.querySelectorAll('.vendor-cell').forEach(cell => {
            cell.classList.remove('drop-zone', 'drag-over');
        });
        
        // Also clear any general drop zone styling that might be lingering
        document.querySelectorAll('.drop-zone, .drag-over').forEach(element => {
            element.classList.remove('drop-zone', 'drag-over');
        });
        
        this.draggedVendorSection = null;
        this.currentVendorDropTarget = null;
        
        // Safety cleanup with a small delay to catch any lingering styles
        setTimeout(() => {
            document.querySelectorAll('.vendor-cell.drop-zone, .vendor-cell.drag-over').forEach(cell => {
                cell.classList.remove('drop-zone', 'drag-over');
                console.log('🧹 Safety cleanup: Removed lingering drop zone styling from vendor cell');
            });
        }, 100);
        
        console.log('🧹 All drop zone styling cleared');
    },

    handleVendorDragOver: function(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        
        // Find the vendor cell being dragged over
        const targetCell = e.target.closest('.vendor-cell');
        if (!targetCell) return;
        
        // If no active drag, just allow the event
        if (!this.draggedVendorSection) return;
        
        // Debounce the drag over event to prevent rapid firing
        if (this.vendorDragDebounceTimer) {
            clearTimeout(this.vendorDragDebounceTimer);
        }
        
        this.vendorDragDebounceTimer = setTimeout(() => {
            // Clear previous drop target styling
            if (this.currentVendorDropTarget && this.currentVendorDropTarget !== targetCell) {
                this.currentVendorDropTarget.classList.remove('drop-zone', 'drag-over');
            }
            
            // Only add styling if this is a valid drop target and different from dragged section
            if (targetCell !== this.draggedVendorSection) {
                this.currentVendorDropTarget = targetCell;
                targetCell.classList.add('drop-zone', 'drag-over');
            }
        }, 50); // 50ms debounce
    },

    handleVendorDragLeave: function(e) {
        e.preventDefault();
        
        // Only remove styling if we're really leaving the target
        const targetCell = e.target.closest('.vendor-cell');
        if (targetCell && !targetCell.contains(e.relatedTarget)) {
            console.log('🚪 Vendor drag leaving cell, removing drop zone styling');
            targetCell.classList.remove('drop-zone', 'drag-over');
            
            // Clear current drop target if it's this cell
            if (this.currentVendorDropTarget === targetCell) {
                this.currentVendorDropTarget = null;
            }
        }
    },

    handleVendorDrop: function(e) {
        e.preventDefault();
        console.log('📥 Vendor drop event');
        
        const targetCell = e.target.closest('.vendor-cell');
        console.log('🎯 Target cell:', targetCell);
        console.log('🎯 Dragged section:', this.draggedVendorSection);
        
        if (!targetCell || !this.draggedVendorSection) {
            console.log('❌ Missing target cell or dragged section, aborting');
            return;
        }
        
        // Clean up drop zone styling
        targetCell.classList.remove('drop-zone', 'drag-over');
        this.currentVendorDropTarget = null;
        
        // Additional cleanup - remove all vendor drop zone styling
        document.querySelectorAll('.vendor-cell').forEach(cell => {
            cell.classList.remove('drop-zone', 'drag-over');
        });
        
        // Get the parent row
        const vendorRow = targetCell.closest('.draggable-vendor-row');
        console.log('🏠 Vendor row:', vendorRow);
        if (!vendorRow) {
            console.log('❌ No vendor row found, aborting');
            return;
        }
        
        // Get all vendor cells
        const vendorCells = Array.from(vendorRow.querySelectorAll('.vendor-cell'));
        console.log('📋 All vendor cells:', vendorCells);
        const draggedCell = this.draggedVendorSection;
        const targetIndex = vendorCells.indexOf(targetCell);
        const draggedIndex = vendorCells.indexOf(draggedCell);
        
        console.log('📍 Target index:', targetIndex, 'Dragged index:', draggedIndex);
        
        if (targetIndex === -1 || draggedIndex === -1) {
            console.log('❌ Invalid indices, aborting');
            return;
        }
        
        if (targetIndex === draggedIndex) {
            console.log('ℹ️ Same position, no swap needed');
            return;
        }
        
        // Swap the cells
        console.log('🔄 Starting vendor cell swap...');
        this.swapVendorCells(vendorRow, draggedIndex, targetIndex);
        
        // Update XML preview to reflect new order
        if (window.XML_GENERATOR && window.XML_GENERATOR.updateXmlPreview) {
            window.XML_GENERATOR.updateXmlPreview();
        }
        
        console.log('🔄 Vendor sections swapped successfully');
        console.log('🔄 XML has been updated to reflect the new vendor section order!');
        
        // Show user feedback
        if (window.MAIN_APP && window.MAIN_APP.showSuccess) {
            window.MAIN_APP.showSuccess('Vendor sections reordered! XML will reflect the new layout.');
        }
    },

    // Comments drag and drop handlers (Comments & Totals)
    handleCommentsDragStart: function(e) {
        console.log('🎯 Comments drag started');
        e.dataTransfer.effectAllowed = 'move';
        this.draggedCommentsSection = e.target;
        e.target.classList.add('dragging');
        
        // Get the parent row
        const commentsRow = e.target.closest('.draggable-comments-row');
        if (commentsRow) {
            commentsRow.classList.add('dragging');
        }
    },

    handleCommentsDragEnd: function(e) {
        console.log('🏁 Comments drag ended');
        e.target.classList.remove('dragging');
        
        // Get the parent row
        const commentsRow = e.target.closest('.draggable-comments-row');
        if (commentsRow) {
            commentsRow.classList.remove('dragging');
        }
        
        // Clear any remaining drop zone styling more aggressively
        document.querySelectorAll('.comments-cell').forEach(cell => {
            cell.classList.remove('drop-zone', 'drag-over');
        });
        
        // Also clear any general drop zone styling that might be lingering
        document.querySelectorAll('.drop-zone, .drag-over').forEach(element => {
            element.classList.remove('drop-zone', 'drag-over');
        });
        
        this.draggedCommentsSection = null;
        this.currentCommentsDropTarget = null;
        
        // Safety cleanup with a small delay to catch any lingering styles
        setTimeout(() => {
            document.querySelectorAll('.comments-cell.drop-zone, .comments-cell.drag-over').forEach(cell => {
                cell.classList.remove('drop-zone', 'drag-over');
                console.log('🧹 Safety cleanup: Removed lingering drop zone styling from comments cell');
            });
        }, 100);
        
        console.log('🧹 All comments drop zone styling cleared');
    },

    handleCommentsDragOver: function(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        
        // Find the comments cell being dragged over
        const targetCell = e.target.closest('.comments-cell');
        if (!targetCell) return;
        
        // If no active drag, just allow the event
        if (!this.draggedCommentsSection) return;
        
        // Debounce the drag over event to prevent rapid firing
        if (this.commentsDragDebounceTimer) {
            clearTimeout(this.commentsDragDebounceTimer);
        }
        
        this.commentsDragDebounceTimer = setTimeout(() => {
            // Clear previous drop target styling
            if (this.currentCommentsDropTarget && this.currentCommentsDropTarget !== targetCell) {
                this.currentCommentsDropTarget.classList.remove('drop-zone', 'drag-over');
            }
            
            // Only add styling if this is a valid drop target and different from dragged section
            if (targetCell !== this.draggedCommentsSection) {
                this.currentCommentsDropTarget = targetCell;
                targetCell.classList.add('drop-zone', 'drag-over');
            }
        }, 50); // 50ms debounce
    },

    handleCommentsDragLeave: function(e) {
        e.preventDefault();
        
        // Only remove styling if we're really leaving the target
        const targetCell = e.target.closest('.comments-cell');
        if (targetCell && !targetCell.contains(e.relatedTarget)) {
            console.log('🚪 Comments drag leaving cell, removing drop zone styling');
            targetCell.classList.remove('drop-zone', 'drag-over');
            
            // Clear current drop target if it's this cell
            if (this.currentCommentsDropTarget === targetCell) {
                this.currentCommentsDropTarget = null;
            }
        }
    },

    handleCommentsDrop: function(e) {
        e.preventDefault();
        console.log('📥 Comments drop event');
        
        const targetCell = e.target.closest('.comments-cell');
        console.log('🎯 Target cell:', targetCell);
        console.log('🎯 Dragged section:', this.draggedCommentsSection);
        
        if (!targetCell || !this.draggedCommentsSection) {
            console.log('❌ Missing target cell or dragged section, aborting');
            return;
        }
        
        // Clean up drop zone styling
        targetCell.classList.remove('drop-zone', 'drag-over');
        this.currentCommentsDropTarget = null;
        
        // Additional cleanup - remove all comments drop zone styling
        document.querySelectorAll('.comments-cell').forEach(cell => {
            cell.classList.remove('drop-zone', 'drag-over');
        });
        
        // Get the parent row
        const commentsRow = targetCell.closest('.draggable-comments-row');
        console.log('🏠 Comments row:', commentsRow);
        if (!commentsRow) {
            console.log('❌ No comments row found, aborting');
            return;
        }
        
        // Get all comments cells
        const commentsCells = Array.from(commentsRow.querySelectorAll('.comments-cell'));
        console.log('📋 All comments cells:', commentsCells);
        const draggedCell = this.draggedCommentsSection;
        const targetIndex = commentsCells.indexOf(targetCell);
        const draggedIndex = commentsCells.indexOf(draggedCell);
        
        console.log('📍 Target index:', targetIndex, 'Dragged index:', draggedIndex);
        
        if (targetIndex === -1 || draggedIndex === -1) {
            console.log('❌ Invalid indices, aborting');
            return;
        }
        
        if (targetIndex === draggedIndex) {
            console.log('ℹ️ Same position, no swap needed');
            return;
        }
        
        // Swap the cells
        console.log('🔄 Starting comments cell swap...');
        this.swapCommentsCells(commentsRow, draggedIndex, targetIndex);
        
        // Update XML preview to reflect new order
        if (window.XML_GENERATOR && window.XML_GENERATOR.updateXmlPreview) {
            window.XML_GENERATOR.updateXmlPreview();
        }
        
        console.log('🔄 Comments sections swapped successfully');
        console.log('🔄 XML has been updated to reflect the new comments section order!');
        
        // Show user feedback
        if (window.MAIN_APP && window.MAIN_APP.showSuccess) {
            window.MAIN_APP.showSuccess('Comments sections reordered! XML will reflect the new layout.');
        }
    },

    // Swap header cells
    swapHeaderCells: function(headerRow, fromIndex, toIndex) {
        const cells = Array.from(headerRow.querySelectorAll('.header-cell'));
        
        if (fromIndex === toIndex) return;
        
        // Get the cells to swap
        const fromCell = cells[fromIndex];
        const toCell = cells[toIndex];
        
        // Store the current order for XML generation
        this.currentHeaderOrder = {
            leftSection: fromIndex < toIndex ? fromCell.dataset.section : toCell.dataset.section,
            rightSection: fromIndex < toIndex ? toCell.dataset.section : fromCell.dataset.section
        };
        
        // Swap the cells in the DOM
        if (fromIndex < toIndex) {
            headerRow.insertBefore(fromCell, toCell.nextSibling);
        } else {
            headerRow.insertBefore(fromCell, toCell);
        }
        
        // Update data-section attributes to match the actual content after swap
        const updatedCells = Array.from(headerRow.querySelectorAll('.header-cell'));
        updatedCells.forEach((cell, index) => {
            // Determine the correct data-section based on the cell's CSS class
            if (cell.classList.contains('company-info')) {
                cell.setAttribute('data-section', 'company-info');
                console.log(`🔧 Cell ${index}: Set data-section="company-info" (contains company-info class)`);
            } else if (cell.classList.contains('purchase-order')) {
                cell.setAttribute('data-section', 'purchase-order');
                console.log(`🔧 Cell ${index}: Set data-section="purchase-order" (contains purchase-order class)`);
            }
        });
        
        // Update widths and padding to maintain layout
        this.updateHeaderCellWidths(headerRow);
        this.updateHeaderCellPadding(headerRow);
        
        console.log('🔄 Header cells swapped:', this.currentHeaderOrder);
        console.log('🔄 Data-section attributes updated for field mapping');
    },

    // Update header cell widths after swapping
    updateHeaderCellWidths: function(headerRow) {
        const cells = Array.from(headerRow.querySelectorAll('.header-cell'));
        
        cells.forEach((cell, index) => {
            if (cell.classList.contains('company-info')) {
                cell.style.width = '50%';
            } else if (cell.classList.contains('purchase-order')) {
                cell.style.width = '50%';
            }
        });
    },

    // Update header cell padding after swapping to match Vendor/Ship To alignment
    updateHeaderCellPadding: function(headerRow) {
        const cells = Array.from(headerRow.querySelectorAll('.header-cell'));
        
        cells.forEach((cell, index) => {
            // Reset padding first
            cell.style.paddingLeft = '';
            cell.style.paddingRight = '';
            
            // Apply padding based on position
            if (index === 0) {
                // Left position - align with Vendor section (padding-right only)
                cell.style.paddingRight = '20px';
                console.log(`🔧 Left cell (${cell.dataset.section}): padding-right: 20px`);
            } else if (index === 1) {
                // Right position - align with Ship To section (padding-left only)
                cell.style.paddingLeft = '20px';
                console.log(`🔧 Right cell (${cell.dataset.section}): padding-left: 20px`);
            }
        });
        
        console.log('✅ Header cell padding updated for proper alignment');
    },

    // Swap vendor cells
    swapVendorCells: function(vendorRow, fromIndex, toIndex) {
        console.log('🔄 swapVendorCells called with indices:', fromIndex, toIndex);
        const cells = Array.from(vendorRow.querySelectorAll('.vendor-cell'));
        console.log('📋 Cells found for swapping:', cells);
        
        if (fromIndex === toIndex) {
            console.log('ℹ️ Same indices, no swap needed');
            return;
        }
        
        // Get the cells to swap
        const fromCell = cells[fromIndex];
        const toCell = cells[toIndex];
        console.log('🔄 From cell:', fromCell);
        console.log('🔄 To cell:', toCell);
        
        // Store the current order for XML generation
        this.currentVendorOrder = {
            leftSection: fromIndex < toIndex ? fromCell.dataset.section : toCell.dataset.section,
            rightSection: fromIndex < toIndex ? toCell.dataset.section : fromCell.dataset.section
        };
        
        // Swap the cells in the DOM
        console.log('🔄 About to swap DOM elements...');
        if (fromIndex < toIndex) {
            console.log('➡️ Moving from cell after to cell');
            vendorRow.insertBefore(fromCell, toCell.nextSibling);
        } else {
            console.log('⬅️ Moving from cell before to cell');
            vendorRow.insertBefore(fromCell, toCell);
        }
        console.log('✅ DOM elements swapped');
        
        // Update data-section attributes to match the actual content after swap
        const updatedCells = Array.from(vendorRow.querySelectorAll('.vendor-cell'));
        updatedCells.forEach((cell, index) => {
            // Determine the correct data-section based on the cell's CSS class
            if (cell.classList.contains('vendor-section')) {
                cell.setAttribute('data-section', 'vendor');
                console.log(`🔧 Cell ${index}: Set data-section="vendor" (contains vendor-section class)`);
            } else if (cell.classList.contains('ship-to-section')) {
                cell.setAttribute('data-section', 'ship-to');
                console.log(`🔧 Cell ${index}: Set data-section="ship-to" (contains ship-to-section class)`);
            }
        });
        
        // Update widths and padding to maintain layout
        this.updateVendorCellWidths(vendorRow);
        this.updateVendorCellPadding(vendorRow);
        
        console.log('🔄 Vendor cells swapped:', this.currentVendorOrder);
        console.log('🔄 Data-section attributes updated for field mapping');
    },

    // Update vendor cell widths after swapping
    updateVendorCellWidths: function(vendorRow) {
        const cells = Array.from(vendorRow.querySelectorAll('.vendor-cell'));
        
        cells.forEach((cell, index) => {
            if (cell.classList.contains('vendor-section')) {
                cell.style.width = '50%';
            } else if (cell.classList.contains('ship-to-section')) {
                cell.style.width = '50%';
            }
        });
    },

    // Update vendor cell padding after swapping to maintain alignment
    updateVendorCellPadding: function(vendorRow) {
        const cells = Array.from(vendorRow.querySelectorAll('.vendor-cell'));
        
        cells.forEach((cell, index) => {
            // Reset padding first
            cell.style.paddingLeft = '';
            cell.style.paddingRight = '';
            
            // Apply padding based on position
            if (index === 0) {
                // Left position - padding-right only
                cell.style.paddingRight = '20px';
                console.log(`🔧 Left vendor cell (${cell.dataset.section}): padding-right: 20px`);
            } else if (index === 1) {
                // Right position - padding-left only  
                cell.style.paddingLeft = '20px';
                console.log(`🔧 Right vendor cell (${cell.dataset.section}): padding-left: 20px`);
            }
        });
        
        console.log('✅ Vendor cell padding updated for proper alignment');
    },

    // Swap comments cells
    swapCommentsCells: function(commentsRow, fromIndex, toIndex) {
        console.log('🔄 swapCommentsCells called with indices:', fromIndex, toIndex);
        const cells = Array.from(commentsRow.querySelectorAll('.comments-cell'));
        console.log('📋 Cells found for swapping:', cells);
        
        if (fromIndex === toIndex) {
            console.log('ℹ️ Same indices, no swap needed');
            return;
        }
        
        // Get the cells to swap
        const fromCell = cells[fromIndex];
        const toCell = cells[toIndex];
        console.log('🔄 From cell:', fromCell);
        console.log('🔄 To cell:', toCell);
        
        // Swap the cells in the DOM first
        console.log('🔄 About to swap DOM elements...');
        if (fromIndex < toIndex) {
            console.log('➡️ Moving from cell after to cell');
            commentsRow.insertBefore(fromCell, toCell.nextSibling);
        } else {
            console.log('⬅️ Moving from cell before to cell');
            commentsRow.insertBefore(fromCell, toCell);
        }
        console.log('✅ DOM elements swapped');
        
        // Update data-section attributes to match the actual content after swap
        const updatedCells = Array.from(commentsRow.querySelectorAll('.comments-cell'));
        updatedCells.forEach((cell, index) => {
            // Determine the correct data-section based on the cell's CSS class
            if (cell.classList.contains('comments-section')) {
                cell.setAttribute('data-section', 'comments');
                console.log(`🔧 Cell ${index}: Set data-section="comments" (contains comments-section class)`);
            } else if (cell.classList.contains('totals-section')) {
                cell.setAttribute('data-section', 'totals');
                console.log(`🔧 Cell ${index}: Set data-section="totals" (contains totals-section class)`);
            }
        });
        
        // NOW read the actual order from the DOM after the swap
        const finalCells = Array.from(commentsRow.querySelectorAll('.comments-cell'));
        this.currentCommentsOrder = {
            leftSection: finalCells[0] ? finalCells[0].dataset.section : 'comments',
            rightSection: finalCells[1] ? finalCells[1].dataset.section : 'totals'
        };
        
        console.log('🔄 Final comments order after DOM swap:', this.currentCommentsOrder);
        
        // Update widths and padding to maintain layout
        this.updateCommentsCellWidths(commentsRow);
        this.updateCommentsCellPadding(commentsRow);
        
        console.log('🔄 Comments cells swapped:', this.currentCommentsOrder);
        console.log('🔄 Data-section attributes updated for field mapping');
    },

    // Update comments cell widths after swapping
    updateCommentsCellWidths: function(commentsRow) {
        const cells = Array.from(commentsRow.querySelectorAll('.comments-cell'));
        
        cells.forEach((cell, index) => {
            if (cell.classList.contains('comments-section')) {
                cell.style.width = '70%';
            } else if (cell.classList.contains('totals-section')) {
                cell.style.width = '30%';
            }
        });
    },

    // Update comments cell padding after swapping to maintain alignment
    updateCommentsCellPadding: function(commentsRow) {
        const cells = Array.from(commentsRow.querySelectorAll('.comments-cell'));
        
        cells.forEach((cell, index) => {
            // Reset padding first
            cell.style.paddingLeft = '';
            cell.style.paddingRight = '';
            
            // Apply padding based on position
            if (index === 0) {
                // Left position - padding-right only
                cell.style.paddingRight = '25px';
                console.log(`🔧 Left comments cell (${cell.dataset.section}): padding-right: 25px`);
            } else if (index === 1) {
                // Right position - padding-left only  
                cell.style.paddingLeft = '25px';
                console.log(`🔧 Right comments cell (${cell.dataset.section}): padding-left: 25px`);
            }
        });
        
        console.log('✅ Comments cell padding updated for proper alignment');
    },

    // Get current vendor order for XML generation
    getCurrentVendorOrder: function() {
        if (!this.currentVendorOrder) {
            // Default order if no swapping has occurred
            this.currentVendorOrder = {
                leftSection: 'vendor',
                rightSection: 'ship-to'
            };
        }
        return this.currentVendorOrder;
    },

    // Get current comments order for XML generation
    getCurrentCommentsOrder: function() {
        if (!this.currentCommentsOrder) {
            // Default order if no swapping has occurred
            this.currentCommentsOrder = {
                leftSection: 'comments',
                rightSection: 'totals'
            };
        }
        return this.currentCommentsOrder;
    },

    // Get current header order for XML generation
    getCurrentHeaderOrder: function() {
        if (!this.currentHeaderOrder) {
            // Default order if no swapping has occurred
            this.currentHeaderOrder = {
                leftSection: 'company-info',
                rightSection: 'purchase-order'
            };
        }
        return this.currentHeaderOrder;
    },

    // Legacy functions for backward compatibility
    initializeDragAndDrop: function() {
        console.log('⚠️ Using legacy initializeDragAndDrop - please use init() instead');
        this.init();
    },
    initializeColumnDragAndDrop: initializeColumnDragAndDrop,
    initializeRowDragAndDrop: initializeRowDragAndDrop, // Note: Row drag and drop is disabled
    swapRows: swapRows, // Note: Row swapping is disabled
    swapColumns: swapColumns,
    updateLineItemIDs: updateLineItemIDs,
    updateColumnIDs: updateColumnIDs,
    addColumn: addColumn,
    removeColumn: removeColumn
};
