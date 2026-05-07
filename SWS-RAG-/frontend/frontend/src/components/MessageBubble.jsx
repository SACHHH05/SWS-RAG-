// MessageBubble.jsx
export default function MessageBubble({ message }) {

  const isUser = message.role === "user"

  return (
    <div style={{
      display: "flex",
      flexDirection: isUser ? "row-reverse" : "row",
      gap: "12px",
      marginBottom: "24px",
      animation: "slideUp 0.3s ease"
    }}>

      {/* ── Avatar ── */}
      <div style={{
        width: "36px", height: "36px",
        borderRadius: "10px",
        background: "#1a1a1a",
        border: "1px solid rgba(255,255,255,0.06)",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
        marginTop: "2px"
      }}>
        <span style={{
          fontSize: isUser ? "10px" : "9px",
          fontWeight: "700",
          color: isUser ? "rgba(255,255,255,0.5)" : "#6b7280",
          letterSpacing: "-0.3px"
        }}>
          {isUser ? "User" : "SWSAI"}
        </span>
      </div>

      {/* ── Bubble ── */}
      <div style={{
        maxWidth: "80%",
        padding: "14px 18px",
        borderRadius: "16px",
        borderTopLeftRadius: isUser ? "16px" : "4px",
        borderTopRightRadius: isUser ? "4px" : "16px",
        background: isUser ? "#1a1a1a" : "#111111",
        border: isUser
          ? "1px solid rgba(255,255,255,0.08)"
          : "1px solid rgba(255,255,255,0.05)",
        color: isUser ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.75)",
        fontSize: "15px",
        lineHeight: "1.65"
      }}>

        {/* Message Text */}
        <div style={{ whiteSpace: "pre-wrap" }}>
          {message.content}
        </div>

        {/* ── Sources ── */}
        {!isUser && message.sources && message.sources.length > 0 && (
          <div style={{
            marginTop: "12px",
            paddingTop: "12px",
            borderTop: "1px solid rgba(255,255,255,0.05)"
          }}>

            {/* Sources label */}
            <div style={{
              fontSize: "11px",
              fontWeight: "700",
              letterSpacing: "0.5px",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.2)",
              marginBottom: "6px"
            }}>
              Sources
            </div>

            {/* Source chips */}
            <div style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "6px"
            }}>
              {message.sources.map((source, i) => (
                <span key={i} style={{
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "3px 10px",
                  background: "#1a1a1a",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "20px",
                  fontSize: "12px",
                  color: "#6b7280",
                  fontWeight: "500"
                }}>
                  {source.replace("SWS-AI-", "").replace(/-/g, " ")}
                </span>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Slide up animation */}
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

    </div>
  )
}