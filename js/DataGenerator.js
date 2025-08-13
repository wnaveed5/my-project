// Random Data Generator for Purchase Order Forms
class DataGenerator {
    constructor() {
        this.companies = [
            'Acme Corporation', 'Global Industries Inc', 'Tech Solutions LLC', 'Premier Manufacturing',
            'Elite Services Co', 'Innovate Systems', 'Metro Enterprises', 'Alliance Group',
            'Summit Technologies', 'Pacific Holdings', 'Vertex Corp', 'Nexus Industries',
            'Strategic Partners', 'Dynamic Solutions', 'Pinnacle Group', 'Fusion Systems'
        ];

        this.firstNames = [
            'John', 'Sarah', 'Michael', 'Emily', 'David', 'Jessica', 'Robert', 'Ashley',
            'William', 'Amanda', 'James', 'Jennifer', 'Christopher', 'Lisa', 'Daniel', 'Michelle'
        ];

        this.lastNames = [
            'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
            'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas'
        ];

        this.streets = [
            'Main Street', 'Oak Avenue', 'Maple Drive', 'Cedar Lane', 'Pine Road',
            'First Street', 'Second Avenue', 'Park Place', 'Washington Blvd', 'Lincoln Way',
            'Jefferson Drive', 'Madison Court', 'Franklin Street', 'Roosevelt Road', 'Kennedy Avenue'
        ];

        this.cities = [
            { name: 'New York', state: 'NY', zip: '10001' },
            { name: 'Los Angeles', state: 'CA', zip: '90210' },
            { name: 'Chicago', state: 'IL', zip: '60601' },
            { name: 'Houston', state: 'TX', zip: '77001' },
            { name: 'Phoenix', state: 'AZ', zip: '85001' },
            { name: 'Philadelphia', state: 'PA', zip: '19101' },
            { name: 'San Antonio', state: 'TX', zip: '78201' },
            { name: 'San Diego', state: 'CA', zip: '92101' },
            { name: 'Dallas', state: 'TX', zip: '75201' },
            { name: 'San Jose', state: 'CA', zip: '95101' },
            { name: 'Austin', state: 'TX', zip: '73301' },
            { name: 'Jacksonville', state: 'FL', zip: '32099' },
            { name: 'Fort Worth', state: 'TX', zip: '76101' },
            { name: 'Columbus', state: 'OH', zip: '43085' },
            { name: 'Charlotte', state: 'NC', zip: '28201' }
        ];

        this.products = [
            { name: 'Office Chair', category: 'Furniture', priceRange: [150, 800] },
            { name: 'Standing Desk', category: 'Furniture', priceRange: [300, 1200] },
            { name: 'Laptop Computer', category: 'Electronics', priceRange: [800, 3000] },
            { name: 'Wireless Mouse', category: 'Electronics', priceRange: [25, 150] },
            { name: 'LED Monitor', category: 'Electronics', priceRange: [200, 800] },
            { name: 'Office Supplies Kit', category: 'Supplies', priceRange: [50, 200] },
            { name: 'Printer Paper', category: 'Supplies', priceRange: [15, 80] },
            { name: 'Conference Table', category: 'Furniture', priceRange: [500, 2500] },
            { name: 'Wireless Keyboard', category: 'Electronics', priceRange: [75, 300] },
            { name: 'Filing Cabinet', category: 'Furniture', priceRange: [100, 600] },
            { name: 'Webcam', category: 'Electronics', priceRange: [50, 250] },
            { name: 'Desk Lamp', category: 'Furniture', priceRange: [30, 150] },
            { name: 'Whiteboard', category: 'Supplies', priceRange: [75, 400] },
            { name: 'Ergonomic Keyboard', category: 'Electronics', priceRange: [100, 350] },
            { name: 'Storage Cabinet', category: 'Furniture', priceRange: [200, 800] }
        ];

        this.departments = [
            'Procurement', 'Purchasing', 'Operations', 'Administration', 'Finance',
            'IT Department', 'Human Resources', 'Facilities', 'Sales', 'Marketing'
        ];

        this.shippingMethods = [
            'FedEx Ground', 'UPS Ground', 'USPS Priority', 'DHL Express',
            'FedEx Express', 'UPS Next Day', 'Standard Shipping', 'Express Delivery'
        ];

        this.fobTerms = [
            'Origin', 'Destination', 'FOB Shipping Point', 'FOB Destination',
            'Prepaid', 'Collect', 'Freight Collect', 'Freight Prepaid'
        ];

        this.paymentTerms = [
            'Net 30', 'Net 15', 'Net 60', '2/10 Net 30', '1/10 Net 30',
            'Due on Receipt', 'COD', 'Net 45', '3/10 Net 30', 'Prepaid'
        ];

        this.comments = [
            'Please ensure all items are delivered by the requested date.',
            'Contact receiving department before delivery.',
            'All items must meet company quality standards.',
            'Delivery to loading dock on west side of building.',
            'Please provide tracking information once shipped.',
            'Items needed for upcoming project deadline.',
            'Confirm delivery date before processing order.',
            'Quality inspection required upon delivery.',
            'Rush order - expedited shipping preferred.',
            'Standard delivery during business hours only.'
        ];
    }

    // Utility methods
    randomChoice(array) {
        return array[Math.floor(Math.random() * array.length)];
    }

    randomNumber(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    randomFloat(min, max, decimals = 2) {
        return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
    }

    formatPhoneNumber() {
        const area = this.randomNumber(200, 999);
        const exchange = this.randomNumber(200, 999);
        const number = this.randomNumber(1000, 9999);
        return `(${area}) ${exchange}-${number}`;
    }

    formatFaxNumber() {
        const area = this.randomNumber(200, 999);
        const exchange = this.randomNumber(200, 999);
        const number = this.randomNumber(1000, 9999);
        return `(${area}) ${exchange}-${number}`;
    }

    generateEmail(firstName, lastName, company) {
        const domain = company.toLowerCase().replace(/[^a-z0-9]/g, '');
        return `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${domain}.com`;
    }

    generateWebsite(company) {
        const domain = company.toLowerCase().replace(/[^a-z0-9]/g, '');
        return `www.${domain}.com`;
    }

    formatDate() {
        const today = new Date();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        const year = today.getFullYear();
        return `${month}/${day}/${year}`;
    }

    generatePONumber() {
        const prefix = this.randomChoice(['PO', 'PUR', 'ORD']);
        const number = this.randomNumber(100000, 999999);
        return `${prefix}-${number}`;
    }

    // Main data generation methods
    generateCompanyData() {
        const company = this.randomChoice(this.companies);
        const location = this.randomChoice(this.cities);
        const streetNumber = this.randomNumber(100, 9999);
        const street = this.randomChoice(this.streets);
        
        return {
            companyName: company,
            companyAddress: `${streetNumber} ${street}`,
            companyCityState: `${location.name}, ${location.state} ${location.zip}`,
            companyPhone: this.formatPhoneNumber(),
            companyFax: this.formatFaxNumber(),
            companyWebsite: this.generateWebsite(company),
            poDate: this.formatDate(),
            poNumber: this.generatePONumber()
        };
    }

    generateVendorData() {
        const company = this.randomChoice(this.companies);
        const firstName = this.randomChoice(this.firstNames);
        const lastName = this.randomChoice(this.lastNames);
        const location = this.randomChoice(this.cities);
        const streetNumber = this.randomNumber(100, 9999);
        const street = this.randomChoice(this.streets);
        
        return {
            vendorCompany: company,
            vendorContact: `${firstName} ${lastName}`,
            vendorAddress: `${streetNumber} ${street}`,
            vendorCityState: `${location.name}, ${location.state} ${location.zip}`,
            vendorPhone: this.formatPhoneNumber(),
            vendorFax: this.formatFaxNumber()
        };
    }

    generateShipToData() {
        const firstName = this.randomChoice(this.firstNames);
        const lastName = this.randomChoice(this.lastNames);
        const company = this.randomChoice(this.companies);
        const location = this.randomChoice(this.cities);
        const streetNumber = this.randomNumber(100, 9999);
        const street = this.randomChoice(this.streets);
        
        return {
            shipToName: `${firstName} ${lastName}`,
            shipToCompany: company,
            shipToAddress: `${streetNumber} ${street}`,
            shipToCityState: `${location.name}, ${location.state} ${location.zip}`,
            shipToPhone: this.formatPhoneNumber(),
            shipToFax: this.formatFaxNumber()
        };
    }

    generateShippingData() {
        const firstName = this.randomChoice(this.firstNames);
        const lastName = this.randomChoice(this.lastNames);
        
        return {
            requisitioner: `${firstName} ${lastName}`,
            shipVia: this.randomChoice(this.shippingMethods),
            fob: this.randomChoice(this.fobTerms),
            shippingTerms: this.randomChoice(this.paymentTerms)
        };
    }

    generateLineItems(count = 5) {
        const items = [];
        let subtotal = 0;
        
        for (let i = 1; i <= count; i++) {
            const product = this.randomChoice(this.products);
            const qty = this.randomNumber(1, 10);
            const unitPrice = this.randomFloat(product.priceRange[0], product.priceRange[1]);
            const total = qty * unitPrice;
            
            const item = {
                [`lineItem${i}Qty`]: qty.toString(),
                [`lineItem${i}Item`]: product.name,
                [`lineItem${i}Desc`]: `${product.category} - ${product.name}`,
                [`lineItem${i}Options`]: this.randomChoice(['Standard', 'Premium', 'Deluxe', 'Basic']),
                [`lineItem${i}Rate`]: unitPrice.toFixed(2),
                [`lineItem${i}Amount`]: total.toFixed(2)
            };
            
            items.push(item);
            subtotal += total;
        }
        
        return { items, subtotal };
    }

    generateTotals(subtotal) {
        const taxRate = this.randomFloat(0.05, 0.12); // 5-12% tax
        const tax = subtotal * taxRate;
        const shipping = this.randomFloat(15, 75);
        const other = this.randomFloat(0, 25);
        const total = subtotal + tax + shipping + other;
        
        return {
            subtotal: subtotal.toFixed(2),
            tax: tax.toFixed(2),
            shipping: shipping.toFixed(2),
            other: other.toFixed(2),
            total: total.toFixed(2)
        };
    }

    generateComments() {
        return {
            comments: this.randomChoice(this.comments),
            contactInfo: `For questions regarding this order, contact ${this.randomChoice(this.firstNames)} ${this.randomChoice(this.lastNames)} at ${this.formatPhoneNumber()}`
        };
    }

    // Main method to generate all data
    generateAllData() {
        console.log('🎲 Generating random purchase order data...');
        
        const companyData = this.generateCompanyData();
        const vendorData = this.generateVendorData();
        const shipToData = this.generateShipToData();
        const shippingData = this.generateShippingData();
        const lineItemsData = this.generateLineItems(5);
        const totalsData = this.generateTotals(lineItemsData.subtotal);
        const commentsData = this.generateComments();
        
        const allData = {
            ...companyData,
            ...vendorData,
            ...shipToData,
            ...shippingData,
            ...totalsData,
            ...commentsData
        };
        
        // Add line items to the main data object
        lineItemsData.items.forEach(item => {
            Object.assign(allData, item);
        });
        
        console.log('✅ Random data generated successfully');
        return allData;
    }

    // Method to populate the form with generated data
    populateForm(data = null) {
        if (!data) {
            data = this.generateAllData();
        }
        
        console.log('📝 Populating form with generated data...');
        
        // Use the existing field mapping from utils.js
        if (window.UTILS && window.UTILS.FIELD_MAPPING) {
            const fieldMapping = window.UTILS.FIELD_MAPPING;
            
            Object.entries(data).forEach(([fieldName, value]) => {
                if (fieldMapping[fieldName]) {
                    const element = document.querySelector(fieldMapping[fieldName]);
                    if (element) {
                        element.textContent = value;
                        console.log(`✓ Set ${fieldName}: ${value}`);
                    } else {
                        console.warn(`⚠️ Element not found for ${fieldName}`);
                    }
                } else {
                    console.warn(`⚠️ No mapping found for field: ${fieldName}`);
                }
            });
            
            console.log('✅ Form populated successfully');
        } else {
            console.error('❌ UTILS.FIELD_MAPPING not available');
        }
    }
}

// Create global instance
window.DATA_GENERATOR = new DataGenerator();

// Auto-generate data when the page loads (disabled - use ChatGPT instead)
// window.addEventListener('load', () => {
//     // Wait a bit for the form to be fully loaded
//     setTimeout(() => {
//         if (window.DATA_GENERATOR) {
//             console.log('🎲 Auto-generating random data on page load...');
//             window.DATA_GENERATOR.populateForm();
//         }
//     }, 1500);
// });

console.log('🎲 DataGenerator.js loaded successfully');
