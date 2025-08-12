# Gimbooks Purchase Order

A purchase order application built with HTML and Tailwind CSS.

## Setup

### Prerequisites
- Node.js (version 14 or higher)
- npm

### Installation

1. Install dependencies:
```bash
npm install
```

2. Build the CSS for development (with watch mode):
```bash
npm run dev
```

3. Build the CSS for production (minified):
```bash
npm run build:prod
```

## Development

- **Development mode**: Run `npm run dev` to start the Tailwind CSS build process in watch mode. This will automatically rebuild the CSS when you make changes to the source files.
- **Production build**: Run `npm run build:prod` to create a minified production build.

## File Structure

```
├── gimbooks-purchase-order.html  # Main HTML file
├── src/
│   └── input.css                 # Source CSS with Tailwind directives
├── dist/
│   └── output.css                # Generated CSS (built from input.css)
├── tailwind.config.js            # Tailwind CSS configuration
└── package.json                  # Node.js dependencies and scripts
```

## Customization

- **Colors**: Modify the custom colors in `tailwind.config.js`
- **Styles**: Add custom CSS in `src/input.css`
- **Tailwind classes**: Use any Tailwind CSS utility classes in your HTML

## Notes

- The application now uses a local build of Tailwind CSS instead of the CDN
- Custom styles for `.editable-field` and `.section-header` are included in the build
- The CSS is automatically optimized and minified for production use
