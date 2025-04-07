export class ChatSystem {
    constructor(character) {
        this.character = character;
        this.messages = [];
        this.messageLifetime = 5000; // Messages fade after 5 seconds
        this.setupStyles();
        this.setupUI();
        this.setupEventListeners();
    }

    setupStyles() {
        // Create style element if it doesn't exist
        let style = document.getElementById('chat-styles');
        if (!style) {
            style = document.createElement('style');
            style.id = 'chat-styles';
            document.head.appendChild(style);
        }

        // Add chat styles
        style.textContent = `
            #chat-container {
                position: fixed;
                bottom: 20px;
                left: 50%;
                transform: translateX(-50%);
                width: 80%;
                max-width: 800px;
                z-index: 1000;
            }

            #chat-messages {
                position: fixed;
                bottom: 80px; /* Keep at bottom, not top */
                left: 50%;
                transform: translateX(-50%);
                width: 80%;
                max-width: 800px;
                max-height: 200px;
                overflow-y: auto;
                background: rgba(0, 0, 0, 0.7);
                border: 1px solid #00ff9d;
                border-radius: 25px;
                padding: 10px;
                margin-bottom: 10px;
                font-family: 'Arial', sans-serif;
                z-index: 1000;
                top: auto !important; /* Force NOT at top */
            }

            /* Ensure no duplicate chat messages at top */
            body > #chat-messages:not([style*="bottom:"]) {
                display: none !important;
            }

            #chat-form {
                display: flex;
                gap: 10px;
                background-color: rgba(0, 0, 0, 0.7);
                padding: 10px;
                border-radius: 25px;
            }

            #chat-input {
                flex: 1;
                background-color: rgba(255, 255, 255, 0.1);
                border: none;
                padding: 8px 16px;
                color: #fff;
                border-radius: 20px;
                font-size: 16px;
                outline: none;
                font-family: 'Arial', sans-serif;
            }

            #chat-input::placeholder {
                color: rgba(255, 255, 255, 0.5);
            }

            #chat-send {
                background-color: #00ff9d;
                border: none;
                padding: 8px 20px;
                color: #000;
                border-radius: 20px;
                cursor: pointer;
                font-weight: bold;
                transition: background-color 0.2s ease;
                font-family: 'Arial', sans-serif;
            }

            #chat-send:hover {
                background-color: #00cc7d;
            }

            .message {
                background-color: rgba(0, 0, 0, 0.7);
                color: #fff;
                padding: 8px 12px;
                margin: 4px 0;
                border-radius: 16px;
                font-family: 'Arial', sans-serif;
                font-size: 14px;
                opacity: 1;
                transition: opacity 0.3s ease;
            }

            .message.fade-out {
                opacity: 0;
            }

            .system-message {
                background: rgba(0, 255, 157, 0.1);
                border-left: 3px solid #00ff9d;
            }
            
            /* Remove transparent bars */
            .transparent-bar,
            #top-bar,
            .status-bar {
                display: none !important;
            }
        `;
    }

    setupUI() {
        // Remove existing chat container if it exists
        const existingContainer = document.getElementById('chat-container');
        if (existingContainer) {
            existingContainer.remove();
        }
        
        // Create new chat container
        const chatContainer = document.createElement('div');
        chatContainer.id = 'chat-container';
        document.body.appendChild(chatContainer);

        // Get the existing messages container from index.html instead of creating a new one
        let messagesContainer = document.getElementById('chat-messages');
        const existingMessages = [];
        
        // If we have an existing messages container, save its contents
        if (messagesContainer) {
            // Store existing messages before removing
            Array.from(messagesContainer.children).forEach(child => {
                existingMessages.push({
                    className: child.className,
                    text: child.textContent
                });
            });
            
            // Only remove if it's at the top of the screen
            if (!messagesContainer.style.bottom || messagesContainer.style.bottom === '' || 
                window.getComputedStyle(messagesContainer).top === '0px') {
                messagesContainer.remove();
                messagesContainer = null;
            }
        }
        
        // Create a new messages container if needed
        if (!messagesContainer) {
            messagesContainer = document.createElement('div');
            messagesContainer.id = 'chat-messages';
            document.body.appendChild(messagesContainer);
        }
        
        // Ensure it has the correct positioning
        messagesContainer.style.position = 'fixed';
        messagesContainer.style.bottom = '80px';
        messagesContainer.style.top = 'auto';
        messagesContainer.style.left = '50%';
        messagesContainer.style.transform = 'translateX(-50%)';
        messagesContainer.style.width = '80%';
        messagesContainer.style.maxWidth = '800px';
        messagesContainer.style.maxHeight = '200px';
        messagesContainer.style.zIndex = '1000';
        messagesContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        messagesContainer.style.border = '1px solid #00ff9d';
        messagesContainer.style.borderRadius = '25px';
        messagesContainer.style.padding = '10px';
        messagesContainer.style.overflowY = 'auto';
        
        // Restore any existing messages
        existingMessages.forEach(msg => {
            const messageElement = document.createElement('div');
            messageElement.className = msg.className;
            messageElement.textContent = msg.text;
            messagesContainer.appendChild(messageElement);
        });

        // Create form
        const form = document.createElement('form');
        form.id = 'chat-form';
        chatContainer.appendChild(form);

        // Create input
        const input = document.createElement('input');
        input.type = 'text';
        input.id = 'chat-input';
        input.placeholder = 'Type a message...';
        form.appendChild(input);

        // Create send button
        const sendButton = document.createElement('button');
        sendButton.type = 'submit';
        sendButton.id = 'chat-send';
        sendButton.textContent = 'Send';
        form.appendChild(sendButton);
        
        // Remove any transparent bars that might exist
        document.querySelectorAll('.transparent-bar, #top-bar, .status-bar').forEach(el => {
            // Don't remove chat-messages
            if (el.id !== 'chat-messages') {
                el.remove();
            }
        });
    }

    setupEventListeners() {
        const form = document.getElementById('chat-form');
        const input = document.getElementById('chat-input');

        // Handle form submission
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.submitMessage();
        });

        // Handle Enter key in input
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                e.stopPropagation();
                this.submitMessage();
            }
        });

        // Auto-scroll messages container when new messages arrive
        const messagesContainer = document.getElementById('chat-messages');
        const observer = new MutationObserver(() => {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        });

        observer.observe(messagesContainer, {
            childList: true,
            subtree: true
        });
    }

    submitMessage() {
        const input = document.getElementById('chat-input');
        const message = input.value.trim();
        
        if (message) {
            this.addMessage(message);
            // Make the character say the message
            this.character.say(message);
            input.value = '';
        }
    }

    addMessage(text) {
        const messagesContainer = document.getElementById('chat-messages');
        
        // If there's no container, create it
        if (!messagesContainer) {
            this.setupUI(); // Recreate the UI
        }
        
        // Get the container again (in case it was just created)
        const container = document.getElementById('chat-messages');
        
        if (container) {
            const messageElement = document.createElement('div');
            messageElement.className = 'message';
            messageElement.textContent = text;
            
            container.appendChild(messageElement);
            
            // Auto-scroll to the bottom
            container.scrollTop = container.scrollHeight;

            // Remove message after lifetime
            setTimeout(() => {
                messageElement.classList.add('fade-out');
                setTimeout(() => {
                    if (messageElement.parentNode === container) {
                        container.removeChild(messageElement);
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
    }

    addSystemMessage(text) {
        const messagesContainer = document.getElementById('chat-messages');
        
        // If there's no container, create it
        if (!messagesContainer) {
            this.setupUI(); // Recreate the UI
        }
        
        // Get the container again (in case it was just created)
        const container = document.getElementById('chat-messages');
        
        if (container) {
            const messageElement = document.createElement('div');
            messageElement.className = 'message system-message';
            messageElement.textContent = text;
            
            container.appendChild(messageElement);

            // Also store in our messages array
            this.messages.push({
                text,
                isSystem: true,
                timestamp: Date.now()
            });

            // Remove system message after lifetime
            setTimeout(() => {
                messageElement.classList.add('fade-out');
                setTimeout(() => {
                    if (messageElement.parentNode === container) {
                        container.removeChild(messageElement);
                    }
                }, 300);
            }, this.messageLifetime);
        }
    }

    update(deltaTime) {
        // Update any time-based animations or effects here
        // For now, we don't need to do anything in the update method
        // as message fading is handled by CSS transitions
    }
} 