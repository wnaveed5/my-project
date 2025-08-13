// ChatGPT-powered Data Generator for Purchase Order Forms
class ChatGPTGenerator {
    constructor() {
        this.apiKey = null;
        this.isConfigured = false;
        this.apiUrl = 'https://api.openai.com/v1/chat/completions';
        this.model = 'gpt-3.5-turbo';
        
        // Load API key from config
        this.loadApiKey();
    }

    // Load API key from config
    loadApiKey() {
        // First try to load from config file
        if (window.CONFIG && window.CONFIG.OPENAI_API_KEY && window.CONFIG.OPENAI_API_KEY !== 'your-openai-api-key-here') {
            this.apiKey = window.CONFIG.OPENAI_API_KEY;
            this.isConfigured = true;
            console.log('✅ OpenAI API key loaded from config file');
            return;
        }
        
        // Fallback to localStorage for backward compatibility
        const storedKey = localStorage.getItem('openai_api_key');
        if (storedKey) {
            this.apiKey = storedKey;
            this.isConfigured = true;
            console.log('✅ OpenAI API key loaded from localStorage (fallback)');
            console.warn('⚠️ Consider moving your API key to config.js for better security');
        }
    }

    // Configure API key
    configureApiKey(apiKey) {
        if (!apiKey || !apiKey.startsWith('sk-')) {
            throw new Error('Invalid OpenAI API key. Must start with "sk-"');
        }
        
        this.apiKey = apiKey;
        this.isConfigured = true;
        
        // Store securely in localStorage
        localStorage.setItem('openai_api_key', apiKey);
        console.log('✅ OpenAI API key configured and saved');
    }

    // Remove stored API key
    clearApiKey() {
        this.apiKey = null;
        this.isConfigured = false;
        localStorage.removeItem('openai_api_key');
        console.log('🗑️ OpenAI API key cleared');
    }

    // Create system prompt for purchase order generation
    createSystemPrompt() {
        return `You are a professional business data generator. Generate realistic purchase order data in JSON format.

Generate data for these fields:
- Company information (name, address, phone, fax, website)
- PO details (date, number)
- Vendor information (company, contact, address, phone, fax)
- Ship-to information (name, company, address, phone, fax)
- Shipping details (requisitioner, ship via, FOB, shipping terms)
- Line items (5 products with qty, item name, description, options, unit price, total)
- Financial totals (subtotal, tax, shipping, other, total)
- Comments and contact info

Make it realistic and professional. Use real US cities and proper business formatting.
IMPORTANT: Format ALL monetary amounts with exactly ONE dollar sign ($) - for example: "$123.45", "$1,250.00"
CRITICAL: Use ONLY ONE $ symbol, NOT $$. Examples: "$1,107.88" (correct), "$$1,107.88" (wrong)
Return ONLY valid JSON with no additional text or formatting.`;
    }

    // Create user prompt with specific requirements
    createUserPrompt(industry = 'general business', companyType = 'medium enterprise') {
        return `Generate a complete purchase order for a ${companyType} in the ${industry} industry. 
        
Include:
- Realistic company and vendor names
- Current date for PO date
- 5 line items with appropriate products for this industry
- Calculated totals (subtotal, 8.5% tax, shipping $25-75, total) - use EXACTLY ONE dollar sign ($) for all monetary values
- Professional comments
        
Use proper JSON field names matching this structure:
{
  "companyName": "string",
  "companyAddress": "string", 
  "companyCityState": "string",
  "companyPhone": "string",
  "companyFax": "string",
  "companyWebsite": "string",
  "poDate": "MM/DD/YYYY",
  "poNumber": "string",
  "vendorCompany": "string",
  "vendorContact": "string",
  "vendorAddress": "string",
  "vendorCityState": "string",
  "vendorPhone": "string",
  "vendorFax": "string",
  "shipToName": "string",
  "shipToCompany": "string",
  "shipToAddress": "string",
  "shipToCityState": "string",
  "shipToPhone": "string",
  "shipToFax": "string",
  "requisitioner": "string",
  "shipVia": "string",
  "fob": "string",
  "shippingTerms": "string",
  "lineItem1Qty": "string",
  "lineItem1Item": "string", 
  "lineItem1Desc": "string",
  "lineItem1Rate": "string",
  "lineItem1Amount": "string",
  [... repeat for lineItem2-5 ...],
  "subtotal": "string (with $ sign)",
  "tax": "string (with $ sign)", 
  "shipping": "string (with $ sign)",
  "other": "string (with $ sign)",
  "total": "string (with $ sign)",
  "comments": "string",
  "contactInfo": "string"
}`;
    }

    // Call ChatGPT API
    async callChatGPT(industry = 'general business', companyType = 'medium enterprise') {
        if (!this.isConfigured) {
            throw new Error('OpenAI API key not configured. Please set your API key first.');
        }

        const systemPrompt = this.createSystemPrompt();
        const userPrompt = this.createUserPrompt(industry, companyType);

        console.log('🤖 Calling ChatGPT API...');

        try {
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    model: this.model,
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: userPrompt }
                    ],
                    max_tokens: 2000,
                    temperature: 0.7
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`OpenAI API Error: ${errorData.error?.message || response.statusText}`);
            }

            const data = await response.json();
            const content = data.choices[0]?.message?.content;

            if (!content) {
                throw new Error('No content received from ChatGPT');
            }

            console.log('✅ ChatGPT response received');
            return this.parseResponse(content);

        } catch (error) {
            console.error('❌ ChatGPT API call failed:', error);
            throw error;
        }
    }

    // Parse ChatGPT response
    parseResponse(content) {
        try {
            // Clean the response to extract JSON
            let jsonStr = content.trim();
            
            // Remove code block formatting if present
            if (jsonStr.startsWith('```json')) {
                jsonStr = jsonStr.replace(/```json\n?/, '').replace(/\n?```$/, '');
            }
            if (jsonStr.startsWith('```')) {
                jsonStr = jsonStr.replace(/```\n?/, '').replace(/\n?```$/, '');
            }

            const data = JSON.parse(jsonStr);
            console.log('✅ ChatGPT response parsed successfully');
            return data;

        } catch (error) {
            console.error('❌ Failed to parse ChatGPT response:', error);
            console.log('Raw response:', content);
            throw new Error('Failed to parse ChatGPT response as JSON');
        }
    }

    // Generate data using ChatGPT
    async generateData(industry = 'general business', companyType = 'medium enterprise') {
        try {
            console.log(`🤖 Generating purchase order data with ChatGPT (${industry}, ${companyType})...`);
            const data = await this.callChatGPT(industry, companyType);
            return data;
        } catch (error) {
            console.error('❌ ChatGPT data generation failed:', error);
            throw error;
        }
    }

    // Populate form with ChatGPT generated data
    async populateForm(industry = 'general business', companyType = 'medium enterprise') {
        try {
            const data = await this.generateData(industry, companyType);
            
            console.log('📝 Populating form with ChatGPT data...');
            
            // Use the existing field mapping from utils.js
            if (window.UTILS && window.UTILS.FIELD_MAPPING) {
                const fieldMapping = window.UTILS.FIELD_MAPPING;
                
                Object.entries(data).forEach(([fieldName, value]) => {
                    if (fieldMapping[fieldName]) {
                        let element;
                        const selector = fieldMapping[fieldName];
                        
                        // Handle dynamic selectors
                        if (selector.startsWith('dynamic:')) {
                            if (window.UTILS && window.UTILS.findFieldByLabel) {
                                const parts = selector.split(':');
                                if (parts.length >= 4) {
                                    const labelText = parts[2];
                                    const sectionName = parts[3];
                                    element = window.UTILS.findFieldByLabel(labelText, sectionName);
                                }
                            }
                        } else {
                            // Handle regular CSS selectors
                            element = document.querySelector(selector);
                        }
                        
                        if (element) {
                            // Fix double dollar signs to single dollar signs
                            let cleanValue = value;
                            if (typeof value === 'string' && value.includes('$$')) {
                                cleanValue = value.replace(/\$\$/g, '$');
                                console.log(`🔧 Fixed double $ in ${fieldName}: "${value}" → "${cleanValue}"`);
                            }
                            element.textContent = cleanValue;
                            console.log(`✓ Set ${fieldName}: ${cleanValue}`);
                        } else {
                            console.warn(`⚠️ Element not found for ${fieldName} with selector: ${selector}`);
                        }
                    } else {
                        console.warn(`⚠️ No mapping found for field: ${fieldName}`);
                    }
                });
                
                console.log('✅ Form populated with ChatGPT data successfully');
                return data;
            } else {
                throw new Error('UTILS.FIELD_MAPPING not available');
            }
        } catch (error) {
            console.error('❌ Failed to populate form with ChatGPT data:', error);
            throw error;
        }
    }

    // Clear all form fields
    clearAllFields() {
        console.log('🧹 Clearing all form fields...');
        
        // Clear all editable fields by finding them directly
        const editableFields = document.querySelectorAll('.editable-field');
        let clearedCount = 0;
        
        editableFields.forEach(field => {
            if (field) {
                field.textContent = '';
                field.innerHTML = '';
                clearedCount++;
            }
        });
        
        console.log(`✅ Cleared ${clearedCount} editable fields`);
        
        // Also use field mapping as backup to ensure all mapped fields are cleared
        if (window.UTILS && window.UTILS.FIELD_MAPPING) {
            const fieldMapping = window.UTILS.FIELD_MAPPING;
            
            Object.entries(fieldMapping).forEach(([fieldName, selector]) => {
                let element;
                
                // Handle dynamic selectors
                if (selector.startsWith('dynamic:')) {
                    if (window.UTILS && window.UTILS.findFieldByLabel) {
                        const parts = selector.split(':');
                        if (parts.length >= 4) {
                            const labelText = parts[2];
                            const sectionName = parts[3];
                            element = window.UTILS.findFieldByLabel(labelText, sectionName);
                        }
                    }
                } else {
                    // Handle regular CSS selectors
                    element = document.querySelector(selector);
                }
                
                if (element) {
                    element.textContent = '';
                    element.innerHTML = '';
                }
            });
        }
        
        console.log('✅ All form fields cleared completely');
    }

    // Create simple generate button
    createGenerateButton() {
        // Check if button already exists
        if (document.getElementById('chatgpt-generate-btn')) {
            return;
        }

        const generateBtn = document.createElement('button');
        generateBtn.id = 'chatgpt-generate-btn';
        generateBtn.textContent = '🤖 Generate Data with ChatGPT';
        generateBtn.style.cssText = `
            position: fixed;
            top: 200px;
            right: 20px;
            z-index: 1000;
            padding: 12px 20px;
            background: #10b981;
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
            box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
            transition: all 0.2s ease;
        `;

        // Add hover effect
        generateBtn.addEventListener('mouseenter', () => {
            generateBtn.style.background = '#059669';
            generateBtn.style.transform = 'translateY(-1px)';
        });
        
        generateBtn.addEventListener('mouseleave', () => {
            generateBtn.style.background = '#10b981';
            generateBtn.style.transform = 'translateY(0)';
        });

        generateBtn.addEventListener('click', async () => {
            if (!this.isConfigured) {
                alert('❌ ChatGPT API key not found in config.js file');
                return;
            }

            try {
                generateBtn.textContent = '⏳ Generating...';
                generateBtn.disabled = true;
                generateBtn.style.background = '#6b7280';
                
                await this.populateForm();
                
                generateBtn.textContent = '✅ Generated!';
                generateBtn.style.background = '#059669';
                
                setTimeout(() => {
                    generateBtn.textContent = '🤖 Generate Data with ChatGPT';
                    generateBtn.style.background = '#10b981';
                }, 2000);
                
            } catch (error) {
                console.error('ChatGPT generation failed:', error);
                alert('❌ ChatGPT generation failed: ' + error.message);
                generateBtn.textContent = '🤖 Generate Data with ChatGPT';
                generateBtn.style.background = '#10b981';
            } finally {
                generateBtn.disabled = false;
            }
        });

        document.body.appendChild(generateBtn);

        // Create clear button below the generate button
        const clearBtn = document.createElement('button');
        clearBtn.id = 'chatgpt-clear-btn';
        clearBtn.textContent = '🧹 Clear All Fields';
        clearBtn.style.cssText = `
            position: fixed;
            top: 260px;
            right: 20px;
            z-index: 1000;
            padding: 12px 20px;
            background: #ef4444;
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
            box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
            transition: all 0.2s ease;
        `;

        // Add hover effect for clear button
        clearBtn.addEventListener('mouseenter', () => {
            clearBtn.style.background = '#dc2626';
            clearBtn.style.transform = 'translateY(-1px)';
        });
        
        clearBtn.addEventListener('mouseleave', () => {
            clearBtn.style.background = '#ef4444';
            clearBtn.style.transform = 'translateY(0)';
        });

        clearBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to clear all fields?')) {
                this.clearAllFields();
                clearBtn.textContent = '✅ Cleared!';
                clearBtn.style.background = '#059669';
                
                setTimeout(() => {
                    clearBtn.textContent = '🧹 Clear All Fields';
                    clearBtn.style.background = '#ef4444';
                }, 1500);
            }
        });

        document.body.appendChild(clearBtn);
    }
}

// Create global instance
window.CHATGPT_GENERATOR = new ChatGPTGenerator();

// Template is now properly blank - no auto-clear needed

console.log('🤖 ChatGPTGenerator.js loaded successfully');
