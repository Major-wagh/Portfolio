"use client";

import React, { useState, useEffect, useRef } from "react";

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef(null);

  // Scroll to the latest message
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Toggles the chatbot window
  const toggleChatbot = () => {
    setIsOpen(!isOpen);
  };

  // Handles sending messages
  const sendMessage = async () => {
    if (!userInput.trim()) return;

    // Add the user's message to the chat
    const newMessages = [...messages, { sender: "user", text: userInput }];
    setMessages(newMessages);
    setUserInput("");
    setLoading(true);

    try {
      // Call the Groq API with updated structure
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer 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`,
        },
        body: JSON.stringify({
          model: "llama3-8b-8192",
          messages: [
            {
              role: "user",
              content: userInput
            }
          ],
          max_tokens: 300
        }),
      });

      // Log the response status for debugging
      console.log("Response Status:", response.status);

      // If response is not OK, throw an error with status code
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Log the response data for debugging
      console.log("API Response Data:", data);

      // Extract the bot's reply from the correct response structure
      if (data.choices && data.choices[0].message) {
        const botReply = data.choices[0].message.content;

        // Add the bot's reply to the chat
        setMessages((prevMessages) => [
          ...prevMessages,
          { sender: "bot", text: botReply },
        ]);
      } else {
        throw new Error("Invalid response from Groq");
      }
    } catch (error) {
      console.error("Error fetching response:", error);
      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: "bot", text: `Error: ${error.message}` },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chatbot-container">
      {/* Chatbot Button */}
      <button onClick={toggleChatbot} className="chatbot-button">
        💬
      </button>

      {/* Chatbot Window */}
      {isOpen && (
        <div className="chatbot-window">
          {/* Header */}
          <div className="chatbot-header">
            <span>AI Chatbot</span>
            <button onClick={toggleChatbot} className="close-button">
              ✖
            </button>
          </div>

          {/* Chat Area */}
          <div className="chatbot-messages">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`chat-message ${
                  msg.sender === "user" ? "user-message" : "bot-message"
                }`}
              >
                {msg.text}
              </div>
            ))}
            {loading && <div className="loading-message">Thinking...</div>}
            {/* Invisible div to keep focus on the latest message */}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="chatbot-input">
            <input
              type="text"
              placeholder="Type your message..."
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") sendMessage();
              }}
            />
            <button onClick={sendMessage} disabled={loading}>
              {loading ? "..." : "Send"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatbot;