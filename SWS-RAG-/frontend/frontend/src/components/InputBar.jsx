// InputBar.jsx
import { useState } from "react"

export default function InputBar({ onSend, isLoading, disabled }) {

  const [question, setQuestion] = useState("")

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleSend = () => {
    if (!question.trim() || isLoading || disabled) return
    onSend(question)
    setQuestion("")
  }

  return (
    <div style={{
      borderTop: "1px solid rgba(255,255,255,0.06)",
      padding: "20px 28px",
      background: "#000000",
      flexShrink: 0
    }}>
      <div style={{
        maxWidth: "760px",
        margin: "0 auto"
      }}>

        {/* Disabled warning */}
        {disabled && (
          <div style={{
            textAlign: "center",
            fontSize: "13px",
            color: "rgba(255,255,255,0.3)",
            marginBottom: "12px",
            padding: "8px 16px",
            background: "#111111",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: "8px"
          }}>
            Please ingest documents first before asking questions
          </div>
        )}

        {/* Input Box */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            gap: "10px",
            background: "#1a1a1a",
            border: "1.5px solid rgba(255,255,255,0.08)",
            borderRadius: "14px",
            padding: "12px 14px",
            transition: "border-color 0.2s",
          }}
          onFocus={e => e.currentTarget.style.borderColor = "rgba(37,99,235,0.5)"}
          onBlur={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"}
        >
          {/* Textarea */}
          <textarea
            value={question}
            onChange={e => setQuestion(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled || isLoading}
            placeholder={
              disabled
                ? "Ingest documents first..."
                : "Ask about company policies, benefits, procedures…"
            }
            rows={1}
            maxLength={1000}
            style={{
              flex: 1,
              border: "none",
              background: "transparent",
              fontFamily: "Livvic, sans-serif",
              fontSize: "15px",
              color: "rgba(255,255,255,0.85)",
              resize: "none",
              outline: "none",
              maxHeight: "120px",
              lineHeight: "1.5",
              overflowY: "auto",
            }}
            onInput={e => {
              e.target.style.height = "auto"
              e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px"
            }}
          />

          {/* Send Button */}
          <button
            onClick={handleSend}
            disabled={!question.trim() || isLoading || disabled}
            style={{
              width: "40px", height: "40px",
              borderRadius: "10px",
              background: !question.trim() || isLoading || disabled
                ? "#2a2a2a"
                : "#2563eb",
              border: "none",
              cursor: !question.trim() || isLoading || disabled
                ? "not-allowed"
                : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "18px",
              flexShrink: 0,
              transition: "background 0.2s, transform 0.1s",
              color: !question.trim() || isLoading || disabled
                ? "rgba(255,255,255,0.2)"
                : "white"
            }}
            onMouseEnter={e => {
              if (!e.currentTarget.disabled)
                e.currentTarget.style.background = "#1d4ed8"
            }}
            onMouseLeave={e => {
              if (!e.currentTarget.disabled)
                e.currentTarget.style.background = "#2563eb"
            }}
          >
            {isLoading ? "⏳" : "➤"}
          </button>
        </div>

        {/* Hint */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: "8px",
          padding: "0 4px"
        }}>
          <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.2)" }}>
            Press Enter to send · Shift+Enter for new line
          </span>
          <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.2)" }}>
            {question.length} / 1000
          </span>
        </div>

      </div>
    </div>
  )
}