// ChatGPT-powered Data Generator for Purchase Order Forms
class ChatGPTGenerator {
    constructor() {
        this.apiKey = null;
        this.isConfigured = false;
        this.model = 'gpt-4o-mini'; // ✅ Current supported model

        this.isLocal = window.location.protocol === 'file:' ||
            (window.location.hostname === 'localhost' && !this.hasServerlessSupport());

        if (this.isLocal) {
            this.apiUrl = 'https://api.openai.com/v1/chat/completions';
            this.loadApiKey();
        } else {
            this.apiUrl = '/api/chatgpt';
            this.isConfigured = true;
            console.log('✅ ChatGPT configured to use serverless function with environment variables');
        }
    }

    hasServerlessSupport() {
        return window.location.hostname !== 'localhost' &&
            window.location.hostname !== '127.0.0.1' &&
            !window.location.protocol.includes('file');
    }

    loadApiKey() {
        if (!this.isLocal) return;

        if (window.CONFIG && window.CONFIG.OPENAI_API_KEY &&
            window.CONFIG.OPENAI_API_KEY !== 'your-openai-api-key-here') {
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

Generate:
- Company information, PO details, vendor, ship-to, shipping details
- 5 products with qty, description, rate, amount
- Financial totals
- Comments and contact info

IMPORTANT: All monetary amounts must have exactly ONE "$".
Return ONLY valid JSON.`;
    }

    createUserPrompt(industry = 'general business', companyType = 'medium enterprise') {
        return `Generate a complete purchase order for a ${companyType} in the ${industry} industry. Use proper JSON field names matching the expected schema.`;
    }

    async callChatGPT(industry = 'general business', companyType = 'medium enterprise') {
        const systemPrompt = this.createSystemPrompt();
        const userPrompt = this.createUserPrompt(industry, companyType);

        const maxRetries = 3;
        let lastError = null;

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                let response;
                if (this.isLocal) {
                    if (!this.isConfigured) throw new Error('OpenAI API key not configured.');
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
                return this.parseResponse(content);

            } catch (error) {
                lastError = error;
                if (attempt < maxRetries &&
                    (error.name === 'AbortError' || error.message.includes('Failed to fetch'))) {
                    await new Promise(res => setTimeout(res, attempt * 2000));
                    continue;
                }
                break;
            }
        }
        throw new Error(`ChatGPT API failed after ${maxRetries} attempts. Last error: ${lastError?.message || 'Unknown error'}`);
    }

    parseResponse(content) {
        try {
            let jsonStr = content.trim();
            if (jsonStr.startsWith('```json')) jsonStr = jsonStr.replace(/```json\n?/, '').replace(/\n?```$/, '');
            if (jsonStr.startsWith('```')) jsonStr = jsonStr.replace(/```\n?/, '').replace(/\n?```$/, '');
            return JSON.parse(jsonStr);
        } catch (error) {
            console.error('❌ JSON parse failed:', error);
            throw new Error('Failed to parse ChatGPT response as JSON');
        }
    }

    async generateData(industry, companyType) {
        return await this.callChatGPT(industry, companyType);
    }

    async populateForm(industry, companyType) {
        const data = await this.generateData(industry, companyType);
        if (window.UTILS && window.UTILS.getDynamicFieldMapping) {
            const fieldMapping = window.UTILS.getDynamicFieldMapping();
            Object.entries(data).forEach(([fieldName, value]) => {
                if (fieldMapping[fieldName]) {
                    let element = null;
                    const selector = fieldMapping[fieldName];
                    if (selector.startsWith('dynamic:')) {
                        const parts = selector.split(':');
                        if (parts[1] === 'findFieldByLabel') {
                            element = window.UTILS.findFieldByLabel(parts[2], parts[3]);
                        }
                    } else {
                        element = document.querySelector(selector);
                    }
                    if (element) {
                        element.textContent = typeof value === 'string' ? value.replace(/\$\$/g, '$') : value;
                    }
                }
            });
        }
    }

    // ✅ Restored method for UI button
    createGenerateButton() {
        if (document.getElementById('chatgpt-generate-btn')) return;

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
                alert('❌ ChatGPT API key not found.');
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
                alert('❌ ChatGPT generation failed: ' + error.message);
                generateBtn.textContent = '🤖 Generate Data with ChatGPT';
                generateBtn.style.background = '#10b981';
            } finally {
                generateBtn.disabled = false;
            }
        });

        document.body.appendChild(generateBtn);
    }
}

// Create global instance
window.CHATGPT_GENERATOR = new ChatGPTGenerator();
console.log('🤖 ChatGPTGenerator.js loaded successfully');