export class ChatSystem {
    constructor(playerCharacter) {
        // Get references to UI elements created in index.html
        this.container = document.getElementById('chat-container');
        this.messageList = document.getElementById('chat-messages');
        this.inputField = document.getElementById('chat-input');
        this.submitButton = document.getElementById('chat-submit');

        this.playerCharacter = playerCharacter;

        if (!this.container || !this.messageList || !this.inputField || !this.submitButton) {
            console.error("Chat UI elements (container, messages, input, or submit) not found in the DOM!");
            // Optionally, create them here as a fallback, but ideally they exist in HTML
            this.setupUIFallback(); 
        } else {
            this.setupEventListeners();
        }

        // No character reference needed here anymore
        // No message lifetime/fading needed for now
        // No style setup needed (handled by style.css)
    }

    // Fallback in case HTML elements are missing
    setupUIFallback() {
        console.warn("Creating fallback chat UI elements.");
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.id = 'chat-container';
            document.body.appendChild(this.container);
        }
        if (!this.messageList) {
            this.messageList = document.createElement('ul');
            this.messageList.id = 'chat-messages';
            this.container.appendChild(this.messageList);
            // Apply basic styles if needed, though style.css should handle it
            this.container.style.position = 'fixed'; 
            this.container.style.bottom = '20px';
            this.container.style.left = '20px';
            this.container.style.width = '350px';
            this.container.style.maxHeight = '200px';
             this.container.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
            this.container.style.border = '1px solid #00ff00';
            this.messageList.style.listStyle = 'none';
            this.messageList.style.padding = '5px 10px';
            this.messageList.style.margin = '0';
            this.messageList.style.overflowY = 'auto';
             this.messageList.style.height = 'calc(100% - 30px)'; // Adjust height for input
        }
    }

    // Setup event listeners for input
    setupEventListeners() {
        this.submitButton.addEventListener('click', () => this.submitMessage());
        this.inputField.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault(); // Prevent default form submission or line breaks
                this.submitMessage();
            }
        });
    }

    // Logic to handle message submission
    submitMessage() {
        const messageText = this.inputField.value.trim();
        if (messageText && this.playerCharacter) {
            // Call say() on player character for bubble
            this.playerCharacter.say(messageText);
            // ALSO add to chat log
            this.addPlayerMessage(messageText);
            this.inputField.value = ''; // Clear the input field
            // Optional: Refocus input field after sending
            // this.inputField.focus(); 
        }
    }

    // Generic message adder
    addMessage(text, senderType, senderName = null) {
        if (!this.messageList) {
            console.error("Message list element not found.");
            return;
        }

        const messageElement = document.createElement('li');
        let displayText = text;
        let cssClass = 'message-' + senderType;

        // Add sender name prefix for NPCs
        if (senderType === 'npc' && senderName) {
            displayText = `<span class="sender-name">${senderName}:</span> ${text}`;
        } 
        // Add generic prefix for player (can customize later)
        else if (senderType === 'player') {
            displayText = `<span class="sender-name">Player:</span> ${text}`; // Simple prefix
        }

        messageElement.classList.add(cssClass);
        messageElement.innerHTML = displayText; // Use innerHTML to render the span

        this.messageList.appendChild(messageElement);

        // Auto-scroll to the bottom
        this.messageList.scrollTop = this.messageList.scrollHeight;
    }

    // Specific message types
    addSystemMessage(text) {
        this.addMessage(text, 'system');
    }

    addPlayerMessage(text) {
        this.addMessage(text, 'player');
    }

    addNPCMessage(name, text) {
        this.addMessage(text, 'npc', name);
    }

    // Removed update method and fading logic
    // Removed setupStyles
    // Removed setupEventListeners (now part of constructor check)
    // Removed submitMessage (re-added above)
} 