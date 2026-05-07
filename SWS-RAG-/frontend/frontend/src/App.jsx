// App.jsx
import { useState, useEffect } from "react"
import axios from "axios"
import Sidebar from "./components/Sidebar"
import ChatWindow from "./components/ChatWindow"
import InputBar from "./components/InputBar"

const API = "http://localhost:8000"

export default function App() {

  // ── State ──────────────────────────────────────────────
  const [messages, setMessages] = useState([])
  const [conversationHistory, setConversationHistory] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState({ ready: false, chunks_indexed: 0 })
  const [isIngesting, setIsIngesting] = useState(false)
  const [suggestedQuestions, setSuggestedQuestions] = useState([])

  // ── On Load — check status ─────────────────────────────
  useEffect(() => {
    checkStatus()
  }, [])

  // ── Check backend status ───────────────────────────────
  const checkStatus = async () => {
    try {
      const res = await axios.get(`${API}/api/status`)
      setStatus(res.data)

      // If docs are ready fetch suggested questions
      if (res.data.ready) {
        fetchSuggestedQuestions()
      }
    } catch (err) {
      console.error("Backend not reachable", err)
    }
  }

  // ── Fetch suggested questions ──────────────────────────
  const fetchSuggestedQuestions = async () => {
    try {
      const res = await axios.get(`${API}/api/questions`)
      setSuggestedQuestions(res.data.questions)
    } catch (err) {
      console.error("Could not fetch questions", err)
    }
  }

  // ── Ingest PDFs ────────────────────────────────────────
  const handleIngest = async () => {
    setIsIngesting(true)
    try {
      await axios.post(`${API}/api/ingest`)
      await checkStatus()
    } catch (err) {
      console.error("Ingestion failed", err)
    }
    setIsIngesting(false)
  }

  // ── Send Message ───────────────────────────────────────
  const handleSend = async (question) => {
    if (!question.trim() || isLoading) return

    // Add user message to UI
    const userMessage = { role: "user", content: question }
    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)

    try {
      const res = await axios.post(`${API}/api/chat`, {
        question,
        conversation_history: conversationHistory
      })

      const aiMessage = {
        role: "assistant",
        content: res.data.answer,
        sources: res.data.sources,
        chunks_used: res.data.chunks_used
      }

      // Add AI message to UI
      setMessages(prev => [...prev, aiMessage])

      // Update conversation history for multi-turn
      setConversationHistory(prev => [
        ...prev,
        { role: "user", content: question },
        { role: "assistant", content: res.data.answer }
      ])

    } catch (err) {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "Something went wrong. Make sure the backend is running.",
        sources: [],
        chunks_used: 0
      }])
    }

    setIsLoading(false)
  }

  // ── Clear Chat ─────────────────────────────────────────
  const handleClear = () => {
    setMessages([])
    setConversationHistory([])
  }

  // ── Render ─────────────────────────────────────────────
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "280px 1fr",
      height: "100vh",
      overflow: "hidden"
    }}>
      <Sidebar
        status={status}
        isIngesting={isIngesting}
        onIngest={handleIngest}
        onClear={handleClear}
      />
      <div style={{
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        background: "var(--white)"
      }}>
        <ChatWindow
          messages={messages}
          isLoading={isLoading}
          suggestedQuestions={suggestedQuestions}
          onSuggestionClick={handleSend}
        />
        <InputBar
          onSend={handleSend}
          isLoading={isLoading}
          disabled={!status.ready}
        />
      </div>
    </div>
  )
}