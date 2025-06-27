let prompt = document.querySelector("#prompt");
let chatContainer = document.querySelector(".chat-container");
let sendBtn = document.querySelector("#send-btn");
const apiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=AIzaSyAc5xmUuJukKsLdTrsdfj6i5Lypy2FZRmI"


async function generateChatResponse(aiChatArea, userMessage) {
  // Add loading state
  aiChatArea.innerHTML = '<span class="typing-indicator"></span>';
  aiChatArea.classList.add('loading');
  
  let requestOption = {
     method: "POST",
     headers: { "Content-Type": "application/json", },
     body: JSON.stringify({
       contents: [
         { role: "user", parts: [{ text: userMessage}]}
       ]
     })
  }
  
  try{
    let response = await fetch(apiUrl, requestOption);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    let data = await response.json();
    
    // Remove loading state
    aiChatArea.classList.remove('loading');
    
    // Get response text and limit length
    let fullText = data.candidates[0].content.parts[0].text;
    let processedText = processLongResponse(fullText);
    
    aiChatArea.innerHTML = '';
    typeWriter(aiChatArea, processedText, 0);
    
  } catch(error) {
    aiChatArea.classList.remove('loading');
    aiChatArea.classList.add('error-message');
    aiChatArea.innerHTML = "❌ Connection error! Please check your internet and try again.";
    console.error('API Error:', error);
  } 
}

function processLongResponse(text) {
  const maxLength = 500; // Character limit
  
  if (text.length <= maxLength) {
    return text;
  }
  
  // Smart truncation - try to end at sentence
  let truncated = text.substring(0, maxLength);
  let lastSentence = Math.max(
    truncated.lastIndexOf('.'),
    truncated.lastIndexOf('!'),
    truncated.lastIndexOf('?')
  );
  
  if (lastSentence > maxLength * 0.7) {
    truncated = text.substring(0, lastSentence + 1);
  }
  
  return truncated + "\n\n📝 *Response was shortened for better experience*\n\n💡 **Tip:** Ask shorter, specific questions for concise answers!";
}

function typeWriter(element, text, index) {
  if (index < text.length) {
    element.innerHTML += text.charAt(index);
    setTimeout(() => typeWriter(element, text, index + 1), 20); // Faster typing
    // Auto scroll during typing
    chatContainer.scrollTop = chatContainer.scrollHeight;
  }
}

function createChatBox(html, classes) {
  let div = document.createElement("div");
  div.classList.add(classes);
  div.innerHTML = html;
  return div;
}

function handleChatResponse(message) {
  if (!message.trim()) {
    prompt.focus();
    return;
  }
  
  // Disable send button during processing
  sendBtn.disabled = true;
  sendBtn.innerHTML = 'Sending...';
  
  // User message
  let userHtml = `<div id="user-chat-area">
        ${message}
        </div>
      <img src="userImg.png" alt="user image" class="user-img"/>`;

  let userChatBox = createChatBox(userHtml, "user-chat-box");
  chatContainer.appendChild(userChatBox);

  // Clear input immediately
  prompt.value = "";
  
  // Scroll to show user message
  chatContainer.scrollTop = chatContainer.scrollHeight;

  // AI response after small delay
  setTimeout(() => {
    let aiHtml = `<img src="aiImg.png
" alt="ai image" class="ai-img" />
      <div id="ai-chat-area">
      </div>`;
    
    let aiChatBox = createChatBox(aiHtml, "ai-chat-box");
    chatContainer.appendChild(aiChatBox);
    
    // Get the AI chat area div to update content
    let aiChatArea = aiChatBox.querySelector("#ai-chat-area");
    
    generateChatResponse(aiChatArea, message).finally(() => {
      // Re-enable send button
      sendBtn.disabled = false;
      sendBtn.innerHTML = 'Send';
      prompt.focus();
    });
    
    // Scroll to show AI response
    chatContainer.scrollTop = chatContainer.scrollHeight;
  }, 300);
}

// Enter key event
prompt.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    handleChatResponse(prompt.value);
  }
});

// Button click event - FIXED SPELLING!
sendBtn.addEventListener("click", () => {
  handleChatResponse(prompt.value);
});

// Add initial welcome message when page loads
window.addEventListener('DOMContentLoaded', () => {
  let welcomeHtml = `<img src="aiImg.png" alt="ai image" class="ai-img" />
    <div id="ai-chat-area">
      Hello dear! How can I help you today? 🤖
    </div>`;
  
  let welcomeChatBox = createChatBox(welcomeHtml, "ai-chat-box");
  chatContainer.appendChild(welcomeChatBox);
});