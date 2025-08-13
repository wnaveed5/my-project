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

    // populateForm, clearAllFields, createGenerateButton methods stay unchanged from your original
    // ...
}

// Create global instance
window.CHATGPT_GENERATOR = new ChatGPTGenerator();

console.log('🤖 ChatGPTGenerator.js loaded successfully');
