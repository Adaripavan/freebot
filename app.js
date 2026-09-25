// Configuration
const PROVIDERS = {
    openrouter: {
        baseURL: 'https://openrouter.ai/api/v1',
        models: ['openai/gpt-4o-mini', 'anthropic/claude-3.5-sonnet', 'google/gemini-2.0-flash-001']
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
let isSending = false;

// DOM elements
const setupScreen = document.getElementById('setup-screen');
const chatScreen = document.getElementById('chat-screen');
const userNameInput = document.getElementById('user-name');
const apiKeyInput = document.getElementById('api-key');
const startChatButton = document.getElementById('start-chat');
const setupError = document.getElementById('setup-error');
const chatHistoryDiv = document.getElementById('chat-history');
const messageInput = document.getElementById('message-input');
const sendButton = document.getElementById('send-button');
const clearButton = document.getElementById('clear-btn');
const backButton = document.getElementById('back-btn');
const statusText = document.getElementById('status-text');

// Event listeners
startChatButton.addEventListener('click', startChat);
sendButton.addEventListener('click', sendMessage);
messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});
clearButton.addEventListener('click', clearChat);
backButton.addEventListener('click', goBack);

function startChat() {
    userName = userNameInput.value.trim();
    apiKey = apiKeyInput.value.trim();

    if (!userName) {
        showError('Please enter your name.');
        return;
    }

    if (!apiKey) {
        showError('Please enter your API key.');
        return;
    }

    setupError.textContent = '';

    // Switch to chat screen
    setupScreen.classList.remove('active');
    chatScreen.classList.add('active');

    // Update status
    statusText.textContent = `Connected via ${currentProvider}`;

    // Add welcome message
    addMessage('system', `Welcome, ${userName}! You are now chatting with ${currentProvider}. Your API key is being used for this session only.`);
}

function sendMessage() {
    const message = messageInput.value.trim();
    if (!message || isSending) return;

    // Add user message
    addMessage('user', message);
    chatHistory.push({ role: 'user', content: message });

    messageInput.value = '';
    isSending = true;
    sendButton.disabled = true;

    // Show typing indicator
    const typingId = addTypingIndicator();

    // Get AI response
    getAIResponse(message).finally(() => {
        removeTypingIndicator(typingId);
        isSending = false;
        sendButton.disabled = false;
        messageInput.focus();
    });
}

async function getAIResponse(userMessage) {
    try {
        const messages = chatHistory.map(msg => ({
            role: msg.role,
            content: msg.content
        }));

        const provider = PROVIDERS[currentProvider];

        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        };

        // OpenRouter requires these headers for browser requests
        if (currentProvider === 'openrouter') {
            headers['HTTP-Referer'] = window.location.origin || 'https://render.com';
            headers['X-Title'] = 'AI Chatbot';
        }

        const response = await fetch(`${provider.baseURL}/chat/completions`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({
                model: provider.models[0],
                messages: messages,
                max_tokens: 1000,
                stream: false
            })
        });

        if (!response.ok) {
            const errorText = await response.text().catch(() => '');
            throw new Error(`API request failed: ${response.status}. ${errorText.slice(0, 100)}`);
        }

        const data = await response.json();
        const aiMessage = data?.choices?.[0]?.message?.content;

        if (!aiMessage) {
            throw new Error('No response from the API.');
        }

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

    const avatar = role === 'user' ? userName[0].toUpperCase() : '✦';

    const bubble = document.createElement('div');
    bubble.className = 'message-bubble';
    bubble.textContent = content;

    const meta = document.createElement('span');
    meta.className = 'message-meta';
    meta.textContent = role === 'user' ? userName : 'AI';

    messageDiv.appendChild(meta);
    messageDiv.appendChild(bubble);

    chatHistoryDiv.appendChild(messageDiv);
    chatHistoryDiv.scrollTop = chatHistoryDiv.scrollHeight;

    return messageDiv;
}

function addTypingIndicator() {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message ai-message';

    const meta = document.createElement('span');
    meta.className = 'message-meta';
    meta.textContent = 'AI';

    const bubble = document.createElement('div');
    bubble.className = 'message-bubble';
    bubble.innerHTML = '<span class="typing"></span>';

    messageDiv.appendChild(meta);
    messageDiv.appendChild(bubble);

    chatHistoryDiv.appendChild(messageDiv);
    chatHistoryDiv.scrollTop = chatHistoryDiv.scrollHeight;

    return messageDiv;
}

function removeTypingIndicator(el) {
    if (el && el.parentNode) {
        el.remove();
    }
}

function clearChat() {
    chatHistory = [];
    chatHistoryDiv.innerHTML = '';
    addMessage('system', 'Chat cleared. You can start a new conversation.');
}

function goBack() {
    chatHistory = [];
    chatHistoryDiv.innerHTML = '';
    apiKey = '';
    userName = '';
    messageInput.value = '';
    isSending = false;
    sendButton.disabled = false;
    chatScreen.classList.remove('active');
    setupScreen.classList.add('active');
}

function showError(msg) {
    setupError.textContent = msg;
}