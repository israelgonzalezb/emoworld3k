export class ChatSystem {
    constructor() {
        this.messages = [];
        this.messageLifetime = 5000; // Messages fade after 5 seconds
        this.setupEventListeners();
    }

    setupEventListeners() {
        const form = document.getElementById('chat-form');
        const input = document.getElementById('chat-input');
        const messagesContainer = document.getElementById('chat-messages');

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const message = input.value.trim();
            if (message) {
                this.addMessage(message);
                input.value = '';
            }
        });

        // Auto-scroll messages container when new messages arrive
        const observer = new MutationObserver(() => {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        });

        observer.observe(messagesContainer, {
            childList: true,
            subtree: true
        });
    }

    addMessage(text) {
        const messagesContainer = document.getElementById('chat-messages');
        const messageElement = document.createElement('div');
        messageElement.className = 'message';
        messageElement.textContent = text;
        
        messagesContainer.appendChild(messageElement);

        // Remove message after lifetime
        setTimeout(() => {
            messageElement.classList.add('fade-out');
            setTimeout(() => {
                if (messageElement.parentNode === messagesContainer) {
                    messagesContainer.removeChild(messageElement);
                }
            }, 300); // Wait for fade animation
        }, this.messageLifetime);

        // Store message
        this.messages.push({
            text,
            timestamp: Date.now()
        });

        // Keep only last 50 messages
        if (this.messages.length > 50) {
            this.messages.shift();
        }
    }

    // Method to programmatically add system messages
    addSystemMessage(text) {
        const messageElement = document.createElement('div');
        messageElement.className = 'message system-message';
        messageElement.style.backgroundColor = 'rgba(0, 255, 157, 0.3)'; // Cyberpunk green
        messageElement.textContent = text;
        
        document.getElementById('chat-messages').appendChild(messageElement);

        // Remove system message after lifetime
        setTimeout(() => {
            messageElement.classList.add('fade-out');
            setTimeout(() => {
                if (messageElement.parentNode) {
                    messageElement.parentNode.removeChild(messageElement);
                }
            }, 300);
        }, this.messageLifetime);
    }
} 