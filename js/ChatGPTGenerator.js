// ChatGPT-powered Data Generator for Purchase Order Forms
class ChatGPTGenerator {
    constructor() {
        this.apiKey = null;
        this.isConfigured = false;
        // ✅ Use a current, supported model to avoid 404 errors
        this.model = 'gpt-4o-mini';
        
        // Detect if we're running locally (file:// or localhost with simple server)
        this.isLocal = window.location.protocol === 'file:' || 
                      (window.location.hostname === 'localhost' && !this.hasServerlessSupport());
        
        if (this.isLocal) {
            // For local development without serverless support
            this.apiUrl = 'https://api.openai.com/v1/chat/completions';
            this.loadApiKey();
        } else {
            // For Vercel or other serverless environments
            // This hits our serverless API route that uses Vercel env var
            this.apiUrl = '/api/chatgpt';
            this.isConfigured = true;
            console.log('✅ ChatGPT configured to use serverless function with environment variables');
        }
    }

    // Check if serverless functions are supported
    hasServerlessSupport() {
        return window.location.hostname !== 'localhost' && 
               window.location.hostname !== '127.0.0.1' &&
               !window.location.protocol.includes('file');
    }

    // Load API key for local development
    loadApiKey() {
        if (!this.isLocal) return;
        
        if (window.CONFIG && window.CONFIG.OPENAI_API_KEY && window.CONFIG.OPENAI_API_KEY !== 'your-openai-api-key-here') {
            this.apiKey = window.CONFIG.OPENAI_API_KEY;
            this.isConfigured = true;
            console.log('✅ Local API key found in config.js');
            return;
        }
        
        const storedKey = localStorage.getItem('openai_api_key');
        if (storedKey && storedKey.startsWith('sk-')) {
            this.apiKey = storedKey;
            this.isConfigured = true;
            console.log('✅ Local API key found in localStorage');
            return;
        }
        
        console.warn('⚠️ No API key found for local development.');
    }

    configureApiKey(apiKey) {
        if (!apiKey || !apiKey.startsWith('sk-')) {
            throw new Error('Invalid OpenAI API key. Must start with "sk-"');
        }
        
        this.apiKey = apiKey;
        this.isConfigured = true;
        localStorage.setItem('openai_api_key', apiKey);
        console.log('✅ OpenAI API key configured and saved');
    }

    clearApiKey() {
        this.apiKey = null;
        this.isConfigured = false;
        localStorage.removeItem('openai_api_key');
        console.log('🗑️ OpenAI API key cleared');
    }

    createSystemPrompt() {
        return `You are a professional business data generator. Generate realistic purchase order data in JSON format.

Generate data for these fields:
- Company information (name, address, phone, fax, website)
- PO details (date, number)
- Vendor information (company, contact, address, phone, fax)
- Ship-to information (name, company, address, phone, fax)
- Shipping details (requisitioner, ship via, FOB, shipping terms)
- Line items (5 products with qty, item name, description, unit price, total)
- Financial totals (subtotal, tax, shipping, other, total)
- Comments and contact info

IMPORTANT: Format ALL monetary amounts with exactly ONE dollar sign ($) - for example: "$123.45"
Return ONLY valid JSON with no additional text or formatting.`;
    }

    createUserPrompt(industry = 'general business', companyType = 'medium enterprise') {
        return `Generate a complete purchase order for a ${companyType} in the ${industry} industry.
        
Include:
- Realistic company and vendor names
- Current date for PO date
- 5 line items with appropriate products for this industry
- Calculated totals (subtotal, 8.5% tax, shipping $25-75, total) - use EXACTLY ONE dollar sign ($)
- Professional comments
        
Use proper JSON field names matching this structure:
{ ... }`;
    }

    async callChatGPT(industry = 'general business', companyType = 'medium enterprise') {
        const systemPrompt = this.createSystemPrompt();
        const userPrompt = this.createUserPrompt(industry, companyType);

        console.log('🤖 Calling ChatGPT API...');

        const maxRetries = 3;
        let lastError = null;

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                console.log(`🔄 Attempt ${attempt}/${maxRetries}...`);
                
                let response;
                
                if (this.isLocal) {
                    if (!this.isConfigured) {
                        throw new Error('OpenAI API key not configured.');
                    }
                    
                    response = await fetch(this.apiUrl, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${this.apiKey}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            model: this.model,
                            messages: [
                                { role: 'system', content: systemPrompt },
                                { role: 'user', content: userPrompt }
                            ],
                            max_tokens: 2000,
                            temperature: 0.7
                        }),
                        signal: AbortSignal.timeout(30000)
                    });
                } else {
                    // In production (Vercel), our /api/chatgpt route handles the key from env vars
                    response = await fetch(this.apiUrl, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            model: this.model,
                            messages: [
                                { role: 'system', content: systemPrompt },
                                { role: 'user', content: userPrompt }
                            ],
                            max_tokens: 2000,
                            temperature: 0.7
                        }),
                        signal: AbortSignal.timeout(30000)
                    });
                }

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(`OpenAI API Error (${response.status}): ${errorData.error?.message || response.statusText}`);
                }

                const data = await response.json();
                const content = data.choices[0]?.message?.content;

                if (!content) throw new Error('No content received from ChatGPT');
                console.log('✅ ChatGPT response received');
                return this.parseResponse(content);

            } catch (error) {
                lastError = error;
                console.error(`❌ Attempt ${attempt} failed:`, error);
                
                if (attempt < maxRetries && (error.name === 'AbortError' || error.message.includes('Failed to fetch'))) {
                    const waitTime = attempt * 2000;
                    console.log(`⏳ Waiting ${waitTime}ms before retry...`);
                    await new Promise(resolve => setTimeout(resolve, waitTime));
                    continue;
                }
                break;
            }
        }

        console.error('❌ All attempts failed');
        throw new Error(`ChatGPT API failed after ${maxRetries} attempts. Last error: ${lastError?.message || 'Unknown error'}`);
    }

    parseResponse(content) {
        try {
            let jsonStr = content.trim();
            if (jsonStr.startsWith('```json')) {
                jsonStr = jsonStr.replace(/```json\n?/, '').replace(/\n?```$/, '');
            }
            if (jsonStr.startsWith('```')) {
                jsonStr = jsonStr.replace(/```\n?/, '').replace(/\n?```$/, '');
            }
            const data = JSON.parse(jsonStr);
            console.log('✅ Parsed JSON successfully');
            return data;
        } catch (error) {
            console.error('❌ JSON parse failed:', error);
            console.log('Raw response:', content);
            throw new Error('Failed to parse ChatGPT response as JSON');
        }
    }

    async generateData(industry, companyType) {
        console.log(`🤖 Generating purchase order data...`);
        return await this.callChatGPT(industry, companyType);
    }

    // Populate form with ChatGPT generated data
    async populateForm(industry = 'general business', companyType = 'medium enterprise') {
        try {
            const data = await this.generateData(industry, companyType);
            
            console.log('📝 Populating form with ChatGPT data...');
            console.log('🔍 DEBUG - Raw ChatGPT data received:', data);
            
            // Temporarily disable auto-calculations to prevent interference
            const editableFields = document.querySelectorAll('.editable-field');
            const originalEventListeners = new Map();
            
            editableFields.forEach(field => {
                // Store and remove event listeners temporarily
                const clonedField = field.cloneNode(true);
                originalEventListeners.set(field, {
                    oninput: field.oninput,
                    onblur: field.onblur
                });
                
                // Clear event listeners
                field.oninput = null;
                field.onblur = null;
            });
            
            console.log('⏸️ Temporarily disabled auto-calculations to preserve formatting...');
            
            // Use dynamic field mapping that respects current column order
            if (window.UTILS && window.UTILS.getDynamicFieldMapping) {
                console.log('🔄 Getting dynamic field mapping to respect current column order...');
                const fieldMapping = window.UTILS.getDynamicFieldMapping();
                
                Object.entries(data).forEach(([fieldName, value]) => {
                    console.log(`🔍 DEBUG - Processing field: ${fieldName} = "${value}"`);
                    
                    if (fieldMapping[fieldName]) {
                        let element = null;
                        const selector = fieldMapping[fieldName];
                        
                        // Handle dynamic selectors (same logic as in utils.js)
                        if (selector.startsWith('dynamic:')) {
                            const parts = selector.split(':');
                            const command = parts[1];
                            
                            if (command === 'findFieldByLabel') {
                                const labelText = parts[2];
                                const sectionName = parts[3];
                                element = window.UTILS.findFieldByLabel(labelText, sectionName);
                            }
                        } else {
                            // Handle regular CSS selectors
                            element = document.querySelector(selector);
                        }
                        
                        console.log(`🔍 DEBUG - Selector for ${fieldName}: ${selector}`);
                        console.log(`🔍 DEBUG - Element found:`, element);
                        
                        if (element) {
                            // Fix double dollar signs to single dollar signs
                            let cleanValue = value;
                            if (typeof value === 'string' && value.includes('$$')) {
                                cleanValue = value.replace(/\$\$/g, '$');
                                console.log(`🔧 Fixed double $ in ${fieldName}: "${value}" → "${cleanValue}"`);
                            }
                            
                            // Check if this is a financial field
                            const isFinancialField = ['subtotal', 'tax', 'shipping', 'other', 'total', 'lineItem1Rate', 'lineItem1Amount', 'lineItem2Rate', 'lineItem2Amount', 'lineItem3Rate', 'lineItem3Amount', 'lineItem4Rate', 'lineItem4Amount', 'lineItem5Rate', 'lineItem5Amount'].includes(fieldName);
                            if (isFinancialField) {
                                console.log(`💰 DEBUG - Financial field ${fieldName}: "${cleanValue}"`);
                            }
                            
                            element.textContent = cleanValue;
                            console.log(`✓ Set ${fieldName}: "${cleanValue}"`);
                            
                            // Verify what actually got set
                            setTimeout(() => {
                                const actualValue = element.textContent;
                                console.log(`🔍 DEBUG - Actual value in DOM for ${fieldName}: "${actualValue}"`);
                                if (actualValue !== cleanValue) {
                                    console.warn(`⚠️ Value mismatch! Expected: "${cleanValue}", Got: "${actualValue}"`);
                                }
                            }, 100);
                        } else {
                            console.warn(`⚠️ Element not found for ${fieldName}`);
                        }
                    } else {
                        console.warn(`⚠️ No mapping found for field: ${fieldName}`);
                    }
                });
                
                // Re-enable event listeners after population
                setTimeout(() => {
                    console.log('🔄 Re-enabling auto-calculations...');
                    editableFields.forEach(field => {
                        const listeners = originalEventListeners.get(field);
                        if (listeners) {
                            field.oninput = listeners.oninput;
                            field.onblur = listeners.onblur;
                        }
                    });
                    console.log('✅ Auto-calculations re-enabled');
                }, 500);
                
                console.log('✅ Form populated with ChatGPT data successfully');
                return data;
            } else {
                throw new Error('UTILS.getDynamicFieldMapping not available');
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
        
        // Also use dynamic field mapping as backup to ensure all mapped fields are cleared
        if (window.UTILS && window.UTILS.getDynamicFieldMapping) {
            const fieldMapping = window.UTILS.getDynamicFieldMapping();
            
            Object.entries(fieldMapping).forEach(([fieldName, selector]) => {
                let element = null;
                
                // Handle dynamic selectors (same logic as in population)
                if (selector.startsWith('dynamic:')) {
                    const parts = selector.split(':');
                    const command = parts[1];
                    
                    if (command === 'findFieldByLabel') {
                        const labelText = parts[2];
                        const sectionName = parts[3];
                        element = window.UTILS.findFieldByLabel(labelText, sectionName);
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
                if (this.isLocal) {
                    const apiKey = prompt('Please enter your OpenAI API key for local development:');
                    if (apiKey) {
                        try {
                            this.configureApiKey(apiKey);
                        } catch (error) {
                            alert('❌ ' + error.message);
                            return;
                        }
                    } else {
                        return;
                    }
                } else {
                    alert('❌ API key not configured in environment variables');
                    return;
                }
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

console.log('🤖 ChatGPTGenerator.js loaded successfully');
