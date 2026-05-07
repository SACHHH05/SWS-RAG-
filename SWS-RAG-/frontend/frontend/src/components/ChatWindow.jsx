// ChatWindow.jsx
import MessageBubble from "./MessageBubble"
import SuggestedChips from "./SuggestedChips"
import { useEffect, useRef } from "react"

export default function ChatWindow({
  messages,
  isLoading,
  suggestedQuestions,
  onSuggestionClick
}) {

  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isLoading])

  return (
    <div style={{
      flex: 1,
      overflowY: "auto",
      padding: "32px 0",
      background: "#000000"
    }}>
      <div style={{
        maxWidth: "760px",
        margin: "0 auto",
        padding: "0 28px"
      }}>

        {/* ── Empty State ── */}
        {messages.length === 0 && (
          <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "60vh",
            textAlign: "center"
          }}>

            {/* Title */}
            <div style={{
              fontSize: "22px",
              fontWeight: "700",
              color: "#ffffff",
              marginBottom: "8px"
            }}>
              Ask anything about our policies
            </div>

            {/* Subtitle */}
            <div style={{
              fontSize: "15px",
              color: "rgba(255,255,255,0.4)",
              maxWidth: "400px",
              lineHeight: "1.6",
              marginBottom: "32px"
            }}>
              I have access to all SWS AI company documents.
              Ask me about leave, benefits, onboarding, or any HR topic.
            </div>

            {/* Suggested Questions */}
            {suggestedQuestions.length > 0 && (
              <SuggestedChips
                questions={suggestedQuestions}
                onSelect={onSuggestionClick}
              />
            )}
          </div>
        )}

        {/* ── Messages ── */}
        {messages.map((msg, i) => (
          <MessageBubble key={i} message={msg} />
        ))}

        {/* ── Typing Indicator ── */}
        {isLoading && (
          <div style={{
            display: "flex",
            gap: "12px",
            marginBottom: "24px",
            alignItems: "flex-start"
          }}>
            {/* SWSAI text avatar */}
            <div style={{
              width: "36px", height: "36px",
              borderRadius: "10px",
              background: "#111111",
              border: "1px solid rgba(255,255,255,0.1)",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0
            }}>
              <span style={{
                fontSize: "9px",
                fontWeight: "700",
                color: "#2563eb",
                letterSpacing: "-0.3px"
              }}>
                SWSAI
              </span>
            </div>

            {/* Typing dots */}
            <div style={{
              background: "#111111",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "16px",
              borderTopLeftRadius: "4px",
              padding: "14px 18px",
              display: "flex",
              alignItems: "center",
              gap: "5px"
            }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{
                  width: "7px", height: "7px",
                  borderRadius: "50%",
                  background: "rgba(14, 56, 206, 0.3)",
                  animation: "bounce 1.2s infinite",
                  animationDelay: `${i * 0.15}s`
                }} />
              ))}
            </div>
          </div>
        )}

        {/* Scroll anchor */}
        <div ref={bottomRef} />
      </div>

      {/* Bounce animation */}
      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.5; }
          40% { transform: translateY(-6px); opacity: 1; }
        }
      `}</style>
    </div>
  )
}