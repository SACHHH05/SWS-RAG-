// Sidebar.jsx
export default function Sidebar({ status, isIngesting, onIngest, onClear }) {

  const documents = [
    "SWS-AI-benefits-compensation",
    "SWS-AI-code-of-conduct",
    "SWS-AI-company-overview",
    "SWS-AI-hr-policy",
    "SWS-AI-it-security-policy",
    "SWS-AI-leave-policy",
    "SWS-AI-onboarding-guide",
    "SWS-AI-performance-review",
    "SWS-AI-resignation-policy",
    "SWS-AI-wfh-policy",
  ]

  return (
    <div style={{
      background: "#000000",
      display: "flex",
      flexDirection: "column",
      height: "100vh",
      borderRight: "1px solid rgba(255,255,255,0.06)"
    }}>

      {/* ── Logo ── */}
      <div style={{
        padding: "28px 24px 20px",
        borderBottom: "1px solid rgba(255,255,255,0.08)"
      }}>
        <div style={{ marginBottom: "6px" }}>
          <span style={{ fontSize: "24px", fontWeight: "700", color: "white", letterSpacing: "-0.5px" }}>
            SWS<span style={{ color: "#2563eb" }}> AI</span>
          </span>
        </div>
        <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", letterSpacing: "0.3px" }}>
          Company Knowledge Assistant
        </div>
      </div>

      {/* ── Ingest Button ── */}
      <div style={{ padding: "12px 20px 0" }}>
        <button
          onClick={onIngest}
          disabled={isIngesting}
          style={{
            width: "100%",
            padding: "10px 16px",
            background: isIngesting
              ? "rgba(255,255,255,0.05)"
              : "#2563eb",
            border: "none",
            borderRadius: "10px",
            color: "white",
            fontFamily: "Livvic, sans-serif",
            fontSize: "14px",
            fontWeight: "600",
            cursor: isIngesting ? "not-allowed" : "pointer",
            transition: "opacity 0.2s"
          }}
        >
          {isIngesting ? "Ingesting PDFs..." : "Ingest Documents"}
        </button>
      </div>

      {/* ── Documents Label ── */}
      <div style={{
        padding: "20px 20px 8px",
        fontSize: "10px",
        fontWeight: "700",
        letterSpacing: "1.2px",
        textTransform: "uppercase",
        color: "rgba(255,255,255,0.3)"
      }}>
        Company Documents
      </div>

      {/* ── Document List ── */}
      <div style={{
        flex: 1,
        overflowY: "auto",
        padding: "0 12px",
      }}>
        {documents.map((doc, i) => (
          <div key={i} style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "8px 10px",
            borderRadius: "8px",
            marginBottom: "2px",
          }}>
            <div style={{
              width: "6px", height: "6px",
              borderRadius: "50%",
              background: status.ready ? "#2563eb" : "rgba(255,255,255,0.2)",
              flexShrink: 0
            }} />
            <span style={{
              fontSize: "12px",
              color: status.ready ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.2)",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              textTransform: "capitalize"
            }}>
              {doc.replace("SWS-AI-", "").replace(/-/g, " ")}
            </span>
          </div>
        ))}
      </div>

      {/* ── New Chat Button ── */}
      <div style={{ padding: "16px 20px" }}>
        <button
          onClick={onClear}
          style={{
            width: "100%",
            padding: "10px 16px",
            background: "transparent",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: "10px",
            color: "rgba(255,255,255,0.6)",
            fontFamily: "Livvic, sans-serif",
            fontSize: "14px",
            fontWeight: "500",
            cursor: "pointer",
          }}
        >
          New Conversation
        </button>
      </div>

    </div>
  )
}