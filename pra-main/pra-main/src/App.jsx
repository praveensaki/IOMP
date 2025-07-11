// Full App.js code
import React, { useState, useEffect } from 'react';
import Login from "./Login";
import axios from "axios";
import { jsPDF } from "jspdf";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
import './App.css';

const doctorDatabase = {
  "fever": { specialty: "General Physician", doctors: ["Dr. Anil Sharma", "Dr. Rekha Singh"] },
  "cold": { specialty: "General Physician", doctors: ["Dr. Sameer Iqbal", "Dr. Anjali Rao"] },
  "cough": { specialty: "Pulmonologist", doctors: ["Dr. Ramesh Nair", "Dr. Sneha Joshi"] },
  "diabetes": { specialty: "Endocrinologist", doctors: ["Dr. Vinay Desai", "Dr. Megha Kapoor"] },
  "hypertension": { specialty: "Cardiologist", doctors: ["Dr. Alok Mehta", "Dr. Rajeev Jain"] },
  "chest pain": { specialty: "Cardiologist", doctors: ["Dr. Rajesh Reddy", "Dr. Preeti Sinha"] },
  "skin rash": { specialty: "Dermatologist", doctors: ["Dr. Maya Rao", "Dr. Vikram Patil"] },
  "allergy": { specialty: "Allergist", doctors: ["Dr. Shalini Menon", "Dr. Harshad Kumar"] },
  "eye pain": { specialty: "Ophthalmologist", doctors: ["Dr. Neha Verma", "Dr. Kiran Gupta"] },
  "toothache": { specialty: "Dentist", doctors: ["Dr. Anurag Shetty", "Dr. Isha Arora"] },
  "asthma": { specialty: "Pulmonologist", doctors: ["Dr. Kavita Ghosh", "Dr. Ravi Shastri"] },
  "migraine": { specialty: "Neurologist", doctors: ["Dr. Swati Rao", "Dr. Deepak Bansal"] },
  "back pain": { specialty: "Orthopedic", doctors: ["Dr. Arvind Krishnan", "Dr. Leena Das"] },
  "joint pain": { specialty: "Rheumatologist", doctors: ["Dr. Varun Mittal", "Dr. Shreya Kapoor"] },
  "infection": { specialty: "Infectious Disease", doctors: ["Dr. Rahul Joshi", "Dr. Nalini Prasad"] },
  "vomiting": { specialty: "Gastroenterologist", doctors: ["Dr. Rakesh Rao", "Dr. Tanya Shah"] },
  "diarrhea": { specialty: "Gastroenterologist", doctors: ["Dr. Mohan Naidu", "Dr. Rekha Bhat"] },
  "ear pain": { specialty: "ENT Specialist", doctors: ["Dr. Meena Iyer", "Dr. Aditya Mohan"] },
  "burn": { specialty: "Plastic Surgeon", doctors: ["Dr. K. Suresh", "Dr. Mala Menon"] },
  "fracture": { specialty: "Orthopedic", doctors: ["Dr. Arjun Dev", "Dr. Priya Ramesh"] }
};

const hospitalData = {
  "General": [
    { name: "BeWell City Hospital", beds: 4 },
    { name: "Metro Care", beds: 7 },
    { name: "Lifeline Multispeciality", beds: 6 }
  ],
  "Cardiology": [
    { name: "HeartLine Center", beds: 5 },
    { name: "Apollo Cardiac", beds: 2 }
  ],
  "Dermatology": [
    { name: "SkinCure Hospital", beds: 2 },
    { name: "DermaPlus Clinic", beds: 1 }
  ],
  "Gastroenterology": [
    { name: "GastroCare Institute", beds: 4 },
    { name: "GI Hospital", beds: 3 }
  ],
  "Orthopedic": [
    { name: "OrthoLife Hospital", beds: 5 },
    { name: "BoneCare Center", beds: 2 }
  ],
  "Pulmonology": [
    { name: "BreatheWell Clinic", beds: 3 },
    { name: "LungCare Hospital", beds: 2 }
  ],
  "Neurology": [
    { name: "NeuroAid Center", beds: 3 },
    { name: "BrainTrust Hospital", beds: 2 }
  ],
  "ENT": [
    { name: "SoundCare Clinic", beds: 2 },
    { name: "EarNoseThroat Hospital", beds: 1 }
  ],
  "Dentistry": [
    { name: "BrightSmile Dental", beds: 2 },
    { name: "ToothCare Hospital", beds: 1 }
  ],
  "Plastic Surgery": [
    { name: "Restore Aesthetics", beds: 1 },
    { name: "BurnCare Hospital", beds: 1 }
  ],
  "Infectious Disease": [
    { name: "InfectoMed", beds: 2 },
    { name: "Pathogen Hospital", beds: 2 }
  ]
};


function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "👩‍⚕️ Hello! I am your Health Assistance Bot. How can I help you today with your health-related concern?",
    },
  ]);
  const [input, setInput] = useState("");
  const [lastUserMessage, setLastUserMessage] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [listening, setListening] = useState(false);
  const [speakingIndex, setSpeakingIndex] = useState(null);
  const [feedbackGiven, setFeedbackGiven] = useState({});
  const { transcript, resetTranscript, listening: micListening } = useSpeechRecognition();

  useEffect(() => {
    if (!micListening && transcript) {
      setInput(transcript);
    }
  }, [micListening, transcript]);

  if (!isLoggedIn) {
    return <Login onLogin={() => setIsLoggedIn(true)} />;
  }

  const toggleDarkMode = () => setDarkMode(!darkMode);

  const speak = (text, index) => {
    if (speakingIndex === index) {
      window.speechSynthesis.cancel();
      setSpeakingIndex(null);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onend = () => setSpeakingIndex(null);
    window.speechSynthesis.speak(utterance);
    setSpeakingIndex(index);
  };

  const isHealthRelated = (text) => {
    const keywords = [
      "health", "doctor", "medical", "medicine", "treatment", "diagnosis", "hospital", "clinic",
      "fever", "cold", "cough", "headache", "pain", "infection", "symptom", "disease", "flu", "covid",
      "cancer", "asthma", "vomit", "nausea", "diarrhea", "malaria", "dengue", "bp", "blood pressure",
      "diabetes", "tablet", "medication", "antibiotic", "surgery", "injury", "fracture", "strain",
      "stomach", "skin", "rash", "itch", "chest", "body", "wound", "burn", "bone", "muscle", "joint",
      "eye", "ear", "nose", "throat", "leg", "arm", "hand", "back", "neck", "hip", "knee", "shoulder",
      "foot", "feet", "tooth", "teeth", "gum", "spine", "rib", "pelvis", "ankle", "elbow",
      "swelling", "fatigue", "weakness", "urine", "heartbeat", "period", "pregnancy", "mental",
      "stress", "anxiety", "depression", "allergy", "dizzy", "blurred vision", "cramp"
    ];
    const lower = text.toLowerCase();
    return keywords.some((keyword) => lower.includes(keyword));
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setLastUserMessage(input);
    setInput("");

    if (!isHealthRelated(input)) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "⚠️ I am only able to help with health-related queries. Please ask a medical or body-related question.",
        },
      ]);
      return;
    }

    const chatHistory = [
      {
        role: "system",
        content:
          "You are a helpful medical assistant. Provide ethical, accurate responses. Do not prescribe medicine. Use bullet points when explaining.",
      },
      ...messages,
      userMessage,
    ];

    try {
      const res = await axios.post(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          model: "llama3-70b-8192",
          messages: chatHistory,
          temperature: 0.7,
        },
        {
          headers: {
            Authorization: `Bearer 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`,
            "Content-Type": "application/json",
          },
        }
      );

      const reply =
        res.data.choices[0].message.content +
        "\n\n⚠️ This is general information. Consult a licensed doctor for medical advice.";
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch (err) {
      console.error("Error:", err);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "❌ Failed to get response. Please try again." },
      ]);
    }
  };

  const handleMicClick = () => {
    resetTranscript();
    setListening(true);
    SpeechRecognition.startListening({ continuous: false, language: "en-US" });
  };

  const handleStopMic = () => {
    SpeechRecognition.stopListening();
    setListening(false);
  };

  const handleRegenerate = () => {
    if (lastUserMessage) {
      setInput(lastUserMessage);
    }
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    let y = 10;
    messages.forEach((msg) => {
      const prefix = msg.role === "user" ? "You: " : "Bot: ";
      doc.text(`${prefix}${msg.content}`, 10, y);
      y += 10;
    });
    doc.save("chat.pdf");
  };

  const handleClear = () => {
    setMessages([
      {
        role: "assistant",
        content:
          "👩‍⚕️ Hello! I am your Health Assistance Bot. How can I help you today with your health-related concern?",
      },
    ]);
    setInput("");
    setFeedbackGiven({});
    setLastUserMessage("");
  };

  const handleFeedback = (index) => {
    setFeedbackGiven((prev) => ({ ...prev, [index]: true }));
  };

  return (
    <div className={`chat-container ${darkMode ? "dark" : ""}`}>
      <div className="header">
        <h1 className="chat-title ">👩‍⚕️ MediCare Assistant</h1>
        <button className="dark-mode-toggle" onClick={toggleDarkMode}>
          {darkMode ? "☀️ Light" : "🌙 Dark"}
        </button>
      </div>

      <p className="chat-subtitle">Ask health questions and get ethical, accurate guidance.</p>

      <div className="chat-box">
        {messages.map((msg, index) => (
          <div key={index} className={`chat-message ${msg.role}`}>
            <img
              className={`avatar ${msg.role === "user" ? "user-avatar" : "bot-avatar"}`}
              src={msg.role === "user" ? "user-avatar.png" : "bot-avatar.png"}
              alt="avatar"
            />
            <div className="message-content">
              {msg.content}
              {msg.role === "assistant" && index !== 0 && (
                <div className="feedback">
                  {!feedbackGiven[index] ? (
                    <>
                      <button onClick={() => handleFeedback(index)}>👍</button>
                      <button onClick={() => handleFeedback(index)}>👎</button>
                    </>
                  ) : (
                    <div className="thank-you">Thanks for the feedback!</div>
                  )}
                </div>
              )}
              {msg.role === "assistant" && (
                <button
                  className={`speak-btn ${speakingIndex === index ? "speaking" : ""}`}
                  onClick={() => speak(msg.content, index)}
                >
                  🔊
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="input-wrapper">
        <div className="edit-left">
          <button onClick={handleRegenerate}>✏️ Edit</button>
        </div>

        <div className="chat-input-area">
          <input
            type="text"
            placeholder="Ask your medical question..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button onClick={handleSend}>➤</button>
          <button
            onClick={listening ? handleStopMic : handleMicClick}
            className={`mic-button ${micListening ? "listening" : ""}`}
          >
            🎤
          </button>
        </div>
      </div>

      <div className="chat-actions">
        <button onClick={handleClear}>🧹 Clear</button>
        <button onClick={handleExportPDF}>📄 Export PDF</button>
      </div>

      <p className="chat-disclaimer">
        Disclaimer: This chatbot provides general information only. Always consult a healthcare professional for medical advice.
      </p>
    </div>
  );
}

export default App;
