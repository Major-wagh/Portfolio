import React, { useState, useEffect, useRef } from "react";
import Groq from 'groq-sdk';
import { Pinecone } from "@pinecone-database/pinecone";

// Initialize Groq client
const client = new Groq({
  apiKey: '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',
  dangerouslyAllowBrowser: true
});

// Initialize Pinecone client
const pinecone = new Pinecone({
  apiKey: 'pcsk_mqneZ_MX88cHVPBPLNN6SxpGtRZFF2ntgTJi48FNLuzyd5e2MFexFdnpYmWe9mS31YEWG',
});

// System prompt for the chatbot
const SYSTEM_PROMPT = `You represent Siddharth Wagh in a portfolio chatbot. Include chat history. Be concise and clear in all responses.
Siddharth is an Associate Data Scientist at Jio Platforms Limited, specializing in Generative AI and DevOps.

Rules:

Answer only questions about Siddharth or his work.
Avoid repetition and unnecessary details.
Prioritize clarity and precision in responses.
Example Interactions:
Q: What's your name?
A: Siddharth Wagh.

Q: What's your role?
A: Associate Data Scientist focusing on GenAI and DevOps.

Q: How long have you been with Jio?
A: Since October 2023.

Q: Where are you based?
A: Pune, India.

Q: What are your skills?
A: Docker, Kubernetes, Python, LangChain, and Linux administration.

Q: What projects have you worked on?
A: Developing an enterprise Generative AI platform and optimizing DevOps pipelines.

Q: Do you code in your free time?
A: Yes, I enjoy working on personal projects.

Rationale:

Lets Think Step by Step:

Siddharth is an Associate Data Scientist specializing in Generative AI and DevOps at Jio.
He works on developing enterprise-scale AI platforms and optimizing CI/CD pipelines.
Siddharth has 1+ years of experience, with a strong technical stack (Docker, Kubernetes, Python).
He is passionate about solving technical challenges, continuous learning, and personal coding projects.
`;

// Function to generate embeddings using HuggingFace multilingual-e5-large
const getQueryEmbedding = async (text) => {
  try {
    const response = await fetch(
      "https://api-inference.huggingface.co/models/intfloat/multilingual-e5-large",
      {
        method: "POST",
        headers: {
          "Authorization": "Bearer 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",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: text,
          options: {
            wait_for_model: true,
            use_cache: true
          }
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result[0];
  } catch (error) {
    console.error("Error generating embedding:", error);
    throw error;
  }
};

// Chatbot Component
const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef(null);

  // Clear chat history on component mount (page reload)
  useEffect(() => {
    setMessages([]); // Clears messages when the component is mounted
  }, []);

  // Add greeting message when the chatbot is opened
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{ sender: "bot", text: "Hello friend, I am Siddharth Wagh" }]);
    }
  }, [isOpen, messages.length]);

  // Save chat history to localStorage whenever messages update
  useEffect(() => {
    localStorage.setItem("chatMessages", JSON.stringify(messages));
  }, [messages]);

  // Scroll to the latest message
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const toggleChatbot = () => {
    setIsOpen(!isOpen);
  };

  // Function to query Pinecone and get relevant context
  const getRelevantContext = async (query) => {
    try {
      const index = pinecone.index('portfolio');
      const queryEmbedding = await getQueryEmbedding(query);

      const queryResponse = await index.query({
        vector: queryEmbedding,
        topK: 5,
        includeMetadata: true
      });

      const context = queryResponse.matches
        .map(match => match.metadata.text)
        .join('\n');

      return context;
    } catch (error) {
      console.error("Error querying Pinecone:", error);
      return "";
    }
  };

  const sendMessage = async () => {
    if (!userInput.trim()) return;

    const newMessages = [...messages, { sender: "user", text: userInput }];
    setMessages(newMessages);
    setUserInput("");
    setLoading(true);

    try {
      const context = await getRelevantContext(userInput);

      const prompt = context 
        ? `Context: ${context}\n\nUser Question: ${userInput}`
        : userInput;

      const chatCompletion = await client.chat.completions.create({
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...newMessages.map(msg => ({
            role: msg.sender === "user" ? "user" : "assistant",
            content: msg.text,
          })),
          { role: 'user', content: prompt }
        ],
        model: 'gemma2-9b-it',
        temperature: 0.5,
        max_tokens: 1000
      });

      const botReply = chatCompletion.choices[0].message.content;

      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: "bot", text: botReply },
      ]);
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
      <button onClick={toggleChatbot} className="chatbot-button">
        💬
      </button>
      {isOpen && (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <img src="/src/Assets/chatbot.png"></img>
            <span>Sid.ai</span>
            <button onClick={toggleChatbot} className="close-button">
              ✖
            </button>
          </div>
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
            <div ref={messagesEndRef} />
          </div>
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
