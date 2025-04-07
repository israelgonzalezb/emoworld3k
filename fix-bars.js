// Script to fix the transparent bars by targeting chat-messages elements
document.addEventListener('DOMContentLoaded', function() {
    function fixChatMessages() {
        // First, find all chat-messages elements
        const chatMessagesElements = document.querySelectorAll('#chat-messages');
        
        // Save all welcome messages from any containers
        const welcomeMessages = [];
        chatMessagesElements.forEach(el => {
            Array.from(el.children).forEach(child => {
                // Specifically check for and save welcome messages
                if (child.textContent.includes("Welcome to the Cyberpunk Pier")) {
                    welcomeMessages.push({
                        className: child.className || 'message system-message',
                        text: child.textContent
                    });
                }
            });
        });
        
        if (chatMessagesElements.length > 1) {
            console.log('Found multiple chat-messages elements, keeping only the one at the bottom');
            
            // Save messages from all containers
            const allMessages = [];
            chatMessagesElements.forEach(el => {
                Array.from(el.children).forEach(child => {
                    allMessages.push({
                        className: child.className,
                        text: child.textContent
                    });
                });
            });
            
            // Keep only the one with bottom positioning
            let keepElement = null;
            
            chatMessagesElements.forEach(el => {
                const style = window.getComputedStyle(el);
                const rect = el.getBoundingClientRect();
                
                // Check if it's positioned at the top or doesn't have explicit bottom positioning
                if (style.top === '0px' || 
                    (!el.style.bottom && el.style.bottom !== '80px') || 
                    rect.top < 100) {
                    
                    console.log('Removing chat-messages element positioned at the top');
                    el.remove();
                } else {
                    // This is a properly positioned chat element at the bottom
                    keepElement = el;
                }
            });
            
            // If we have a properly positioned element, restore all messages to it
            if (keepElement) {
                // Clear existing messages first to avoid duplicates
                keepElement.innerHTML = '';
                
                // Add all messages to the container we're keeping
                allMessages.forEach(msg => {
                    const messageElement = document.createElement('div');
                    messageElement.className = msg.className;
                    messageElement.textContent = msg.text;
                    keepElement.appendChild(messageElement);
                });
            }
        }
        
        // Make sure the remaining chat-messages element is positioned correctly
        const remainingChatMessages = document.getElementById('chat-messages');
        if (remainingChatMessages) {
            // Save the existing messages
            const existingMessages = [];
            Array.from(remainingChatMessages.children).forEach(child => {
                existingMessages.push({
                    className: child.className,
                    text: child.textContent
                });
            });
            
            // Set correct styling
            remainingChatMessages.setAttribute('style', 
                'position: fixed !important; ' +
                'bottom: 80px !important; ' +
                'top: auto !important; ' +
                'left: 50% !important; ' +
                'transform: translateX(-50%) !important; ' +
                'width: 80% !important; ' +
                'max-width: 800px !important; ' +
                'max-height: 200px !important; ' +
                'z-index: 1000 !important; ' +
                'background-color: rgba(0, 0, 0, 0.7) !important; ' +
                'border: 1px solid #00ff9d !important; ' +
                'border-radius: 25px !important; ' +
                'padding: 10px !important; ' +
                'overflow-y: auto !important;'
            );
            
            // Restore messages that might have been cleared by setting the style attribute
            if (remainingChatMessages.children.length === 0) {
                existingMessages.forEach(msg => {
                    const messageElement = document.createElement('div');
                    messageElement.className = msg.className;
                    messageElement.textContent = msg.text;
                    remainingChatMessages.appendChild(messageElement);
                });
            }
            
            // Make sure we have at least one welcome message
            let hasWelcomeMessage = false;
            Array.from(remainingChatMessages.children).forEach(child => {
                if (child.textContent.includes("Welcome to the Cyberpunk Pier")) {
                    hasWelcomeMessage = true;
                }
            });
            
            // If no welcome message but we found one earlier, add it back
            if (!hasWelcomeMessage && welcomeMessages.length > 0) {
                console.log('Restoring welcome message from saved messages');
                const msg = welcomeMessages[0];
                const messageElement = document.createElement('div');
                messageElement.className = msg.className;
                messageElement.textContent = msg.text;
                remainingChatMessages.appendChild(messageElement);
            }
        }
    }
    
    // Run the fix immediately
    fixChatMessages();
    
    // And then every 500ms for the first few seconds to catch any that are created dynamically
    setTimeout(fixChatMessages, 500);
    setTimeout(fixChatMessages, 1000);
    setTimeout(fixChatMessages, 2000);
    
    // Create a direct welcome message function that can be called later
    window.addWelcomeMessage = function() {
        const chatMessages = document.getElementById('chat-messages');
        if (chatMessages) {
            // Check if we already have a welcome message
            let hasWelcomeMessage = false;
            Array.from(chatMessages.children).forEach(child => {
                if (child.textContent.includes("Welcome to the Cyberpunk Pier")) {
                    hasWelcomeMessage = true;
                }
            });
            
            // If no welcome message, add it
            if (!hasWelcomeMessage) {
                const messageElement = document.createElement('div');
                messageElement.className = 'message system-message';
                messageElement.textContent = "Welcome to the Cyberpunk Pier! Press E to throw vinyl discs.";
                chatMessages.appendChild(messageElement);
            }
        }
    };
    
    // Add welcome message after all other processes
    setTimeout(window.addWelcomeMessage, 3000);
    
    // Set up a MutationObserver to detect when new elements are added
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                // Run the fix when new elements are added
                fixChatMessages();
            }
        });
    });
    
    // Start observing the body for added/removed nodes
    observer.observe(document.body, { childList: true, subtree: true });
}); 