// Configuration
const PROVIDERS = {
    openrouter: {
        baseURL: 'https://openrouter.ai/api/v1',
        models: ['gpt-3.5-turbo', 'claude-3-opus', 'gpt-4']
    },
    experimental: {
        baseURL: 'https://experimental.ai/api/v1',
        models: ['experimental-model-1', 'experimental-model-2']
    }
};

let currentProvider = 'openrouter';
let apiKey = '';
let userName = '';
let chatHistory = [];

// DOM elements
const privacyNotice = document.getElementById('privacy-notice');
const inputSection = document.getElementById('input-section');
const chatInterface = document.getElementById('chat-interface');
const userNameInput = document.getElementById('user-name');
const apiKeyInput = document.getElementById('api-key');
const startChatButton = document.getElementById('start-chat');
const chatHistoryDiv = document.getElementById('chat-history');
const messageInput = document.getElementById('message-input');
const sendButton = document.getElementById('send-button');

// Event listeners
startChatButton.addEventListener('click', startChat);
sendButton.addEventListener('click', sendMessage);
messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

function startChat() {
    userName = userNameInput.value.trim();
    apiKey = apiKeyInput.value.trim();

    if (!userName || !apiKey) {
        alert('Please enter both your name and API key');
        return;
    }

    // Hide input section and show chat interface
    inputSection.style.display = 'none';
    chatInterface.style.display = 'block';

    // Add welcome message
    addMessage('system', `Welcome, ${userName}! You are now chatting with ${currentProvider}. Your API key is being used for this session only.`);
}

function sendMessage() {
    const message = messageInput.value.trim();
    if (!message) return;

    // Add user message to chat history
    addMessage('user', message);
    chatHistory.push({ role: 'user', content: message });

    // Clear input
    messageInput.value = '';

    // Get AI response
    getAIResponse(message);
}

async function getAIResponse(userMessage) {
    try {
        // Prepare messages for API call
        const messages = chatHistory.map(msg => ({
            role: msg.role,
            content: msg.content
        }));

        // Make API call
        const response = await fetch(`${PROVIDERS[currentProvider].baseURL}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: PROVIDERS[currentProvider].models[0],
                messages: messages,
                max_tokens: 1000
            })
        });

        if (!response.ok) {
            throw new Error(`API request failed: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        const aiMessage = data.choices[0].message.content;

        // Add AI response to chat history
        addMessage('ai', aiMessage);
        chatHistory.push({ role: 'assistant', content: aiMessage });

    } catch (error) {
        console.error('Error:', error);
        addMessage('system', `Error: ${error.message}. Please check your API key and try again.`);
    }
}

function addMessage(role, content) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}-message`;

    const timestamp = new Date().toLocaleTimeString();
    messageDiv.innerHTML = `
        <strong>${role === 'user' ? userName : role === 'ai' ? 'AI' : 'System'} (${timestamp}):</strong>
        <p>${content}</p>
    `;

    chatHistoryDiv.appendChild(messageDiv);
    chatHistoryDiv.scrollTop = chatHistoryDiv.scrollHeight;
}