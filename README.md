# Gimbooks Purchase Order Generator

A modular, maintainable purchase order generator with NetSuite XML export capabilities.

## 🏗️ Project Structure

The application has been broken down into logical, maintainable components:

```
my-project/
├── index.html                          # Main entry point
├── styles/
│   └── main.css                       # All CSS styles
├── templates/
│   ├── purchase-order-form.html       # Purchase order form template
│   └── xml-modal.html                 # XML output modal template
├── js/
│   ├── utils.js                       # Utility functions and field mapping
│   ├── dragAndDrop.js                 # Drag & drop functionality
│   ├── calculations.js                 # Mathematical operations
│   ├── xmlGenerator.js                # NetSuite XML generation
│   └── main.js                        # Application initialization
└── README.md                          # This file
```

## 🚀 Features

- **Modular Architecture**: Clean separation of concerns with dedicated modules
- **Drag & Drop**: Reorder table rows and columns dynamically
- **Auto-calculations**: Automatic line item totals and overall calculations
- **NetSuite Integration**: Generate NetSuite-compatible XML output
- **Responsive Design**: Works on desktop and mobile devices
- **Field Validation**: Visual feedback for form completion status

## 📋 Components Breakdown

### 1. **index.html** - Main Entry Point
- Clean HTML structure
- Loads all required JavaScript modules
- Minimal markup for better maintainability

### 2. **styles/main.css** - Styling
- All CSS styles consolidated in one file
- Responsive design with media queries
- Consistent design system for buttons, forms, and modals

### 3. **templates/** - HTML Templates
- **purchase-order-form.html**: Complete purchase order form
- **xml-modal.html**: XML output display modal
- Templates loaded dynamically for better performance

### 4. **js/utils.js** - Utilities
- Field mapping configuration
- Column mapping functions
- Field validation logic
- Helper functions for data extraction

### 5. **js/dragAndDrop.js** - Interactive Features
- Row drag and drop functionality
- Column reordering capabilities
- Dynamic ID updates
- Column management (add/remove)

### 6. **js/calculations.js** - Mathematical Operations
- Line item amount calculations
- Subtotal and total computations
- Tax, shipping, and other fee handling
- Real-time calculation updates

### 7. **js/xmlGenerator.js** - NetSuite Integration
- XML generation from form data
- NetSuite-compatible output format
- Copy to clipboard functionality
- XML file download capability

### 8. **js/main.js** - Application Core
- Application initialization
- Template loading
- Module coordination
- Error handling and user feedback

## 🔧 Usage

### Basic Setup
1. Open `index.html` in a web browser
2. The application will automatically load all components
3. Fill out the purchase order form
4. Use drag & drop to reorder items or columns
5. Click "Convert to NetSuite XML" to generate output

### Drag & Drop
- **Rows**: Drag the `::` handle to reorder line items
- **Columns**: Drag column headers to reorder table structure
- Changes are automatically reflected in XML output

### Calculations
- Enter quantity and unit price for automatic total calculation
- Tax, shipping, and other fees are added to subtotal
- All calculations update in real-time

### XML Generation
- Generates NetSuite-compatible XML
- Copy to clipboard or download as file
- Includes integration guide for NetSuite setup

## 🛠️ Development

### Adding New Features
1. **New Module**: Create a new `.js` file in the `js/` directory
2. **Export Functions**: Use `window.MODULE_NAME = { ... }` pattern
3. **Update main.js**: Add module to `checkModuleAvailability()`
4. **Load Order**: Ensure dependencies are loaded first

### Modifying Styles
- All styles are in `styles/main.css`
- Use consistent CSS custom properties for theming
- Follow the existing naming conventions

### Template Changes
- Modify files in `templates/` directory
- Templates are loaded asynchronously
- Changes require page refresh to see

## 🔍 Module Dependencies

```
main.js
├── utils.js (required)
├── dragAndDrop.js (required)
├── calculations.js (required)
└── xmlGenerator.js (required)
```

## 🐛 Troubleshooting

### Common Issues
1. **Modules not loading**: Check browser console for JavaScript errors
2. **Templates not found**: Ensure all template files exist in `templates/` directory
3. **Drag & drop not working**: Check if `draggable` attribute is set correctly
4. **Calculations not updating**: Verify field selectors in `utils.js`

### Debug Mode
- Open browser console for detailed logging
- Each module logs initialization steps
- Field mapping and calculations are logged in detail

## 📱 Browser Compatibility

- **Modern Browsers**: Chrome, Firefox, Safari, Edge (latest versions)
- **Mobile**: Responsive design for tablets and phones
- **JavaScript**: ES6+ features with fallbacks for older browsers

## 🔒 Security Considerations

- No external dependencies loaded
- All data processed client-side
- XML generation uses safe string concatenation
- No sensitive data transmitted

## 📈 Performance

- Templates loaded asynchronously
- Event listeners attached efficiently
- Minimal DOM manipulation
- Efficient field mapping with CSS selectors

## 🤝 Contributing

1. Follow the existing module structure
2. Maintain separation of concerns
3. Add appropriate error handling
4. Update this README for new features
5. Test across different browsers

## 📄 License

This project is part of the Gimbooks system. Please refer to your organization's licensing terms.

---

**Note**: This modular structure makes the codebase much more maintainable and easier to extend. Each component has a single responsibility and can be modified independently without affecting other parts of the system.
