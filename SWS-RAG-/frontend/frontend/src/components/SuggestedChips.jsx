// SuggestedChips.jsx
export default function SuggestedChips({ questions, onSelect }) {
  return (
    <div style={{
      width: "100%",
      maxWidth: "560px",
    }}>

      {/* Label */}
      <div style={{
        fontSize: "12px",
        fontWeight: "700",
        letterSpacing: "0.8px",
        textTransform: "uppercase",
        color: "rgba(255,255,255,0.2)",
        marginBottom: "12px",
        textAlign: "center"
      }}>
        Suggested Questions
      </div>

      {/* Chips Grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "10px"
      }}>
        {questions.map((question, i) => (
          <button
            key={i}
            onClick={() => onSelect(question)}
            style={{
              padding: "12px 16px",
              background: "#111111",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: "12px",
              fontFamily: "Livvic, sans-serif",
              fontSize: "13px",
              color: "rgba(255,255,255,0.4)",
              cursor: "pointer",
              textAlign: "left",
              lineHeight: "1.4",
              transition: "all 0.2s",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)"
              e.currentTarget.style.background = "#1a1a1a"
              e.currentTarget.style.color = "rgba(255,255,255,0.7)"
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"
              e.currentTarget.style.background = "#111111"
              e.currentTarget.style.color = "rgba(255,255,255,0.4)"
            }}
          >
            {question}
          </button>
        ))}
      </div>
    </div>
  )
}