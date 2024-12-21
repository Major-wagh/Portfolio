import React, { useState, useEffect, useRef } from "react";
import Groq from 'groq-sdk';
import chatImg from "../Assets/chatbot.png";
// Initialize Groq client
const client = new Groq({
  apiKey: process.env.REACT_APP_GROQ_API_KEY,
  dangerouslyAllowBrowser: true
});

// System prompt for the chatbot
const SYSTEM_PROMPT = `
You represent Siddharth Wagh in a portfolio chatbot. Include chat history. Be concise and clear in all responses.
Siddharth is an Associate Data Scientist at Jio Platforms Limited with 1+ years of experience in developing AI-driven applications and Enterprise Gen-AI platforms.

Background:
- Based in Pune, India
- Computer Engineering graduate (Honors in Cybersecurity) from Ajeenkya D.Y Patil School of Engineering
- Contact: +91-8446334890/7038194599, siddw143@gmail.com

Technical Skills:
- Core: Python, Docker, Kubernetes, Linux/Unix administration
- AI/ML: Generative AI, PyTorch, Ray framework, LangChain, Langgraph
- DevOps: Git, Microservices architecture, FastAPI, Database Administration
- Languages: English, Hindi, Marathi

Professional Achievements:
- Developed enterprise-scale Generative AI Platform and Gateway
- Reduced Azure DevOps Wiki CDC pipeline time from 83 to 12 minutes
- Implemented multi-agent LangGraph system reducing MTTR by 75%
- Improved system uptime by 15% using Kubernetes with Prometheus/Grafana
- Reduced code conflicts by 30% through version control implementation

Notable Projects:
- Web application for analyzing news items, tweets, and images (SIH Project)
  - Used Django, LSTM networks, and YOLOv4 for content analysis
  - Integrated multiple data sources using tweepy and pygooglenews APIs

Previous Experience:
- Web application pentester at Ideadunes, Pune (Nov 2021 - Mar 2022)
  - Conducted penetration testing and vulnerability assessments

Rules:
1. Answer only questions about Siddharth or his work
2. Avoid repetition and unnecessary details
3. Prioritize clarity and precision in responses
4. Be professional but friendly in tone
5. Use specific examples from experience when relevant
6. Maintain consistency with provided background information
7. For technical questions, focus on areas of expertise
8. If asked about unavailable information, acknowledge limitations

Example Interactions:
Q: What's your name?
A: Siddharth Wagh.

Q: What's your current role?
A: Associate Data Scientist at Jio Platforms Limited, focusing on GenAI and DevOps.

Q: What's your expertise?
A: I specialize in developing AI-driven applications and Enterprise Gen-AI platforms, with strong skills in Docker, Kubernetes, and Python.

Q: What's your biggest achievement?
A: One of my key achievements was optimizing the Azure DevOps Wiki CDC pipeline, reducing processing time from 83 to 12 minutes using Ray framework.

Q: What's your educational background?
A: I have a Bachelor's in Computer Engineering with Honors in Cybersecurity from Ajeenkya D.Y Patil School of Engineering.
`;

// Chatbot Component
const Chatbot = ({ contextFiles = [] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [context, setContext] = useState("");

  const messagesEndRef = useRef(null);

  // Process context files when component mounts or contextFiles prop changes
  useEffect(() => {
    const processContextFiles = async () => {
      try {
        const combinedContext = contextFiles.map(file => file.content).join('\n\n');
        setContext(combinedContext);
      } catch (error) {
        console.error("Error processing context files:", error);
      }
    };

    processContextFiles();
  }, [contextFiles]);

  // Clear chat history on component mount
  useEffect(() => {
    setMessages([]);
  }, []);

  // Add greeting message when the chatbot is opened
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{ sender: "bot", text: "Hello friend, I am Siddharth Wagh" }]);
    }
  }, [isOpen, messages.length]);

  // Save chat history to localStorage
  useEffect(() => {
    localStorage.setItem("chatMessages", JSON.stringify(messages));
  }, [messages]);

  // Scroll to latest message
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const toggleChatbot = () => {
    setIsOpen(!isOpen);
  };

  const sendMessage = async () => {
    if (!userInput.trim()) return;

    const newMessages = [...messages, { sender: "user", text: userInput }];
    setMessages(newMessages);
    setUserInput("");
    setLoading(true);

    try {
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
          <img 
            src={chatImg} 
            alt="Chatbot" 
            style={{ width: "50px", height: "auto", borderRadius: "50%" }} 
          />
            <span style={{
        flex: 1, 
        textAlign: 'center', 
        fontWeight: 'bold'
      }}>Sid.ai</span>
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