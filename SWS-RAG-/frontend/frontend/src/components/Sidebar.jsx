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
      background: "var(--blue-900)",
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
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
          <div style={{
            width: "38px", height: "38px",
            background: "linear-gradient(135deg, #2563eb, #0ea5e9)",
            borderRadius: "10px",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "18px"
          }}>
            🤖
          </div>
          <span style={{ fontSize: "20px", fontWeight: "700", color: "white" }}>
            SWS <span style={{ color: "var(--blue-300)" }}>AI</span>
          </span>
        </div>
        <div style={{ fontSize: "12px", color: "var(--gray-400)", letterSpacing: "0.3px" }}>
          Company Knowledge Assistant
        </div>
      </div>

      {/* ── Status Badge ── */}
      <div style={{
        margin: "16px 20px 0",
        padding: "12px 14px",
        background: "rgba(14,165,233,0.1)",
        border: "1px solid rgba(14,165,233,0.2)",
        borderRadius: "10px",
        display: "flex",
        alignItems: "center",
        gap: "10px"
      }}>
        <div style={{
          width: "8px", height: "8px",
          borderRadius: "50%",
          background: status.ready ? "#22c55e" : "#f59e0b",
          boxShadow: status.ready ? "0 0 6px #22c55e" : "0 0 6px #f59e0b",
          flexShrink: 0
        }} />
        <div>
          <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.6)" }}>
            {status.ready ? "Knowledge base ready" : "No documents indexed"}
          </div>
          <div style={{ fontSize: "12px", color: "var(--blue-300)", fontWeight: "600" }}>
            {status.ready
              ? `${status.chunks_indexed} chunks indexed`
              : "Click ingest to get started"}
          </div>
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
              : "linear-gradient(135deg, var(--blue-600), var(--blue-500))",
            border: "none",
            borderRadius: "10px",
            color: "white",
            fontFamily: "Livvic, sans-serif",
            fontSize: "14px",
            fontWeight: "600",
            cursor: isIngesting ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            transition: "opacity 0.2s"
          }}
        >
          {isIngesting ? (
            <>⏳ Ingesting PDFs...</>
          ) : (
            <>📥 Ingest Documents</>
          )}
        </button>
      </div>

      {/* ── Documents Label ── */}
      <div style={{
        padding: "20px 20px 8px",
        fontSize: "10px",
        fontWeight: "700",
        letterSpacing: "1.2px",
        textTransform: "uppercase",
        color: "var(--gray-400)"
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
              width: "7px", height: "7px",
              borderRadius: "50%",
              background: status.ready ? "var(--blue-400)" : "var(--gray-400)",
              flexShrink: 0
            }} />
            <span style={{
              fontSize: "12px",
              color: status.ready ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.3)",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis"
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
            background: "rgba(255,255,255,0.07)",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: "10px",
            color: "white",
            fontFamily: "Livvic, sans-serif",
            fontSize: "14px",
            fontWeight: "500",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px"
          }}
        >
          ✨ New Conversation
        </button>
      </div>

    </div>
  )
}