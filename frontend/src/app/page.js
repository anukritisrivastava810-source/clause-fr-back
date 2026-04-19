"use client";
import React, { useState } from "react";
import { useDropzone } from "react-dropzone";
import {
  UploadCloud, CheckCircle, AlertTriangle, ShieldAlert, FileText,
  Loader2, ArrowRight, Zap, Clock, DollarSign, Scale, User,
  ChevronDown, ChevronUp, Sparkles, TrendingUp
} from "lucide-react";
import axios from "axios";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ReferenceLine, Area, AreaChart
} from "recharts";

const API_BASE = "http://localhost:8080/api";

export default function Home() {
  const [appState, setAppState] = useState("upload"); // upload | loading | results
  const [file, setFile] = useState(null);
  const [results, setResults] = useState(null);

  const onDrop = async (acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      await handleUpload(acceptedFiles[0]);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
      "text/plain": [".txt"]
    },
    maxFiles: 1
  });

  const handleUpload = async (doc) => {
    setAppState("loading");
    const formData = new FormData();
    formData.append("file", doc);

    try {
      const uploadRes = await axios.post(`${API_BASE}/analyze`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      const docId = uploadRes.data.document_id;
      const res = await axios.get(`${API_BASE}/documents/${docId}`);
      setResults(res.data);
      setAppState("results");
    } catch (err) {
      console.error(err);
      alert("Error analyzing document. Check console.");
      setAppState("upload");
    }
  };

  if (appState === "loading") {
    return (
      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        padding: "24px", color: "white"
      }}>
        <div style={{
          width: 80, height: 80, borderRadius: "50%",
          background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
          display: "flex", alignItems: "center", justifyContent: "center",
          marginBottom: 24,
          animation: "spin 1.5s linear infinite",
          boxShadow: "0 0 40px rgba(99,102,241,0.6)"
        }}>
          <Loader2 size={40} color="white" />
        </div>
        <h2 style={{ fontSize: 28, fontWeight: 800, margin: 0 }}>Analyzing Document</h2>
        <p style={{ color: "rgba(255,255,255,0.6)", marginTop: 12, textAlign: "center", maxWidth: 400, lineHeight: 1.6 }}>
          Our AI is extracting clauses, detecting risks, and mapping your contract…
        </p>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (appState === "results" && results) {
    return <Dashboard results={results} onReset={() => { setAppState("upload"); setResults(null); }} />;
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)",
      display: "flex", flexDirection: "column", alignItems: "center",
      padding: "48px 24px", fontFamily: "'Inter', sans-serif"
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />

      {/* Hero */}
      <div style={{ maxWidth: 720, width: "100%", textAlign: "center", marginBottom: 48 }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.3)",
          borderRadius: 100, padding: "6px 16px", marginBottom: 24
        }}>
          <Sparkles size={14} color="#a78bfa" />
          <span style={{ color: "#a78bfa", fontSize: 13, fontWeight: 600 }}>Powered by Gemini AI</span>
        </div>

        <h1 style={{
          fontSize: "clamp(36px, 6vw, 64px)", fontWeight: 900, color: "white",
          letterSpacing: -1, lineHeight: 1.1, margin: "0 0 16px"
        }}>
          Legal Document{" "}
          <span style={{
            background: "linear-gradient(135deg, #818cf8, #a78bfa, #f472b6)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"
          }}>Simplifier</span>
        </h1>
        <p style={{ fontSize: 18, color: "rgba(255,255,255,0.55)", lineHeight: 1.7, margin: 0 }}>
          Upload any contract. Our AI extracts clauses, maps risk surfaces,
          and simulates real-world consequences — so you know exactly what you're signing.
        </p>
      </div>

      {/* Feature Pills */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center", marginBottom: 40 }}>
        {[
          { icon: "🔍", label: "Clause Extraction" },
          { icon: "⚠️", label: "Risk Mapping" },
          { icon: "🔮", label: "Consequence Simulator" },
          { icon: "📊", label: "Risk Surface Charts" },
        ].map(({ icon, label }) => (
          <div key={label} style={{
            display: "flex", alignItems: "center", gap: 6,
            background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 100, padding: "8px 16px"
          }}>
            <span style={{ fontSize: 14 }}>{icon}</span>
            <span style={{ color: "rgba(255,255,255,0.7)", fontSize: 13, fontWeight: 500 }}>{label}</span>
          </div>
        ))}
      </div>

      {/* Dropzone */}
      <div
        {...getRootProps()}
        style={{
          maxWidth: 560, width: "100%",
          border: `2px dashed ${isDragActive ? "#818cf8" : "rgba(255,255,255,0.2)"}`,
          borderRadius: 24,
          padding: "56px 32px",
          cursor: "pointer",
          transition: "all 0.3s ease",
          background: isDragActive
            ? "rgba(99,102,241,0.1)"
            : "rgba(255,255,255,0.04)",
          backdropFilter: "blur(12px)",
          textAlign: "center",
          boxShadow: isDragActive ? "0 0 40px rgba(99,102,241,0.3)" : "none"
        }}
      >
        <input {...getInputProps()} />
        <div style={{
          width: 72, height: 72, borderRadius: "50%",
          background: "linear-gradient(135deg, rgba(99,102,241,0.3), rgba(139,92,246,0.3))",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 20px",
          border: "1px solid rgba(99,102,241,0.4)"
        }}>
          <UploadCloud size={32} color="#818cf8" />
        </div>
        <p style={{ fontSize: 20, fontWeight: 700, color: "white", margin: "0 0 8px" }}>
          {isDragActive ? "Drop it here…" : "Drop your contract here"}
        </p>
        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, margin: "0 0 24px" }}>
          Supports PDF, DOCX, TXT · Max 10MB
        </p>
        <button style={{
          padding: "12px 32px",
          background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
          color: "white", border: "none", borderRadius: 100,
          fontWeight: 700, fontSize: 15, cursor: "pointer",
          boxShadow: "0 8px 24px rgba(99,102,241,0.4)",
          transition: "transform 0.2s"
        }}>
          Browse Files
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// DASHBOARD
// ============================================================================
function Dashboard({ results, onReset }) {
  const [simData, setSimData] = useState(null);
  const [simState, setSimState] = useState("idle"); // idle | loading | done | error

  const chartData = results.clauses.map((c, i) => ({
    name: `C${i + 1}`,
    riskScore: c.risk_score,
  }));

  const sortedRisks = [...results.clauses].sort((a, b) => b.risk_score - a.risk_score);
  const highRisks = results.clauses.filter(c => c.risk_level === "high").length;
  const medRisks = results.clauses.filter(c => c.risk_level === "medium").length;

  const runSimulation = async () => {
    setSimState("loading");
    try {
      const res = await axios.post(`${API_BASE}/simulate`, {
        document_id: results.id,
        top_n: 5
      });
      setSimData(res.data.simulations);
      setSimState("done");
    } catch (err) {
      console.error(err);
      setSimState("error");
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(160deg, #0d0b1e 0%, #1a1535 100%)",
      fontFamily: "'Inter', sans-serif", padding: "32px 16px"
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>

        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          marginBottom: 32, flexWrap: "wrap", gap: 16
        }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: "white", margin: "0 0 4px" }}>
              {results.filename}
            </h1>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, margin: 0 }}>
              Analysis Complete · {results.clauses.length} clauses extracted
            </p>
          </div>
          <button onClick={onReset} style={{
            padding: "10px 20px",
            background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 100, color: "rgba(255,255,255,0.7)", fontSize: 13,
            fontWeight: 600, cursor: "pointer"
          }}>
            ← Analyze New File
          </button>
        </div>

        {/* Stats Row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginBottom: 32 }}>
          <StatCard label="Overall Risk Score" value={results.overall_risk_score.toFixed(1)} unit="/10"
            color={results.overall_risk_score > 6 ? "#f87171" : results.overall_risk_score > 4 ? "#fb923c" : "#34d399"}
            icon={<TrendingUp size={18} />} />
          <StatCard label="Critical Clauses" value={highRisks} unit="high"
            color="#f87171" icon={<ShieldAlert size={18} />} />
          <StatCard label="Medium Risk" value={medRisks} unit="medium"
            color="#fb923c" icon={<AlertTriangle size={18} />} />
          <StatCard label="Total Analyzed" value={results.clauses.length} unit="clauses"
            color="#818cf8" icon={<FileText size={18} />} />
        </div>

        {/* Risk Surface Map */}
        <div style={{
          background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 20, padding: 24, marginBottom: 32
        }}>
          <h2 style={{ color: "white", fontSize: 17, fontWeight: 700, margin: "0 0 20px", display: "flex", alignItems: "center", gap: 8 }}>
            <AlertTriangle size={18} color="#fb923c" /> Risk Surface Map
          </h2>
          <div style={{ height: 220, width: "100%", minWidth: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="riskGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f87171" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#f87171" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "rgba(255,255,255,0.35)" }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 10]} hide />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12, background: "#1e1b4b",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "white", fontWeight: 600, fontSize: 13
                  }}
                />
                <ReferenceLine y={7} stroke="#f87171" strokeDasharray="4 4"
                  label={{ position: "right", value: "High Risk", fill: "#f87171", fontSize: 11 }} />
                <Area type="monotone" dataKey="riskScore" stroke="#f87171" strokeWidth={2.5}
                  fillOpacity={1} fill="url(#riskGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Clause Breakdown */}
        <div style={{ marginBottom: 40 }}>
          <h2 style={{ color: "white", fontSize: 17, fontWeight: 700, margin: "0 0 20px", display: "flex", alignItems: "center", gap: 8 }}>
            <FileText size={18} color="#818cf8" /> Detailed Clause Breakdown
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {sortedRisks.map((c, i) => (
              <ClauseCard key={i} clause={c} />
            ))}
          </div>
        </div>

        {/* ================================================================ */}
        {/* SIMULATOR SECTION                                                 */}
        {/* ================================================================ */}
        <SimulatorSection
          simState={simState}
          simData={simData}
          onSimulate={runSimulation}
          highRisks={highRisks}
          medRisks={medRisks}
        />

      </div>
    </div>
  );
}

// ============================================================================
// STAT CARD
// ============================================================================
function StatCard({ label, value, unit, color, icon }) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 16, padding: "20px 24px"
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, color: "rgba(255,255,255,0.4)", fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>
        <span style={{ color }}>{icon}</span> {label}
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
        <span style={{ fontSize: 40, fontWeight: 900, color, lineHeight: 1 }}>{value}</span>
        <span style={{ fontSize: 14, color: "rgba(255,255,255,0.3)", fontWeight: 600 }}>{unit}</span>
      </div>
    </div>
  );
}

// ============================================================================
// CLAUSE CARD (existing breakdown)
// ============================================================================
function ClauseCard({ clause: c }) {
  const [expanded, setExpanded] = useState(false);
  const borderColor = c.risk_level === "high" ? "rgba(248,113,113,0.3)" : c.risk_level === "medium" ? "rgba(251,146,60,0.3)" : "rgba(255,255,255,0.08)";
  const bgColor = c.risk_level === "high" ? "rgba(248,113,113,0.05)" : c.risk_level === "medium" ? "rgba(251,146,60,0.04)" : "rgba(255,255,255,0.03)";
  const accentColor = c.risk_level === "high" ? "#f87171" : c.risk_level === "medium" ? "#fb923c" : "#34d399";

  return (
    <div style={{
      background: bgColor, border: `1px solid ${borderColor}`,
      borderRadius: 16, padding: 20, transition: "all 0.2s"
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 12 }}>
            <span style={{
              fontSize: 22, fontWeight: 900, color: accentColor, lineHeight: 1
            }}>{c.risk_score.toFixed(1)}</span>
            <div>
              <span style={{
                fontSize: 11, fontWeight: 700, textTransform: "uppercase",
                color: accentColor, background: `${accentColor}20`,
                padding: "3px 9px", borderRadius: 100, letterSpacing: 0.5
              }}>{c.risk_level} risk</span>
              {c.category && (
                <span style={{
                  marginLeft: 8, fontSize: 11, fontWeight: 700, textTransform: "uppercase",
                  color: "rgba(255,255,255,0.4)", background: "rgba(255,255,255,0.06)",
                  padding: "3px 9px", borderRadius: 100, letterSpacing: 0.5
                }}>{c.category}</span>
              )}
            </div>
          </div>

          <p style={{
            fontFamily: "monospace", fontSize: 13, color: "rgba(255,255,255,0.5)",
            background: "rgba(0,0,0,0.3)", padding: "10px 14px", borderRadius: 10,
            margin: "0 0 10px", lineHeight: 1.6,
            overflow: "hidden", maxHeight: expanded ? "none" : 60,
            textOverflow: "ellipsis"
          }}>
            {c.original_text}
          </p>

          {expanded && (
            <>
              {c.simplified_text && (
                <div style={{
                  background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)",
                  borderRadius: 10, padding: "10px 14px", marginBottom: 10
                }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: "#818cf8", textTransform: "uppercase", letterSpacing: 1, margin: "0 0 4px" }}>Plain English</p>
                  <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 14, margin: 0, lineHeight: 1.6 }}>{c.simplified_text}</p>
                </div>
              )}
              {c.explanation && (
                <div style={{
                  background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 10, padding: "10px 14px", marginBottom: 10
                }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: 1, margin: "0 0 4px" }}>Risk Insight</p>
                  <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 13, margin: 0, lineHeight: 1.6 }}>{c.explanation}</p>
                </div>
              )}
              {c.suggestions && (
                <div style={{
                  background: c.risk_level === "high" ? "rgba(248,113,113,0.1)" : "rgba(52,211,153,0.08)",
                  border: `1px solid ${c.risk_level === "high" ? "rgba(248,113,113,0.2)" : "rgba(52,211,153,0.2)"}`,
                  borderRadius: 10, padding: "10px 14px"
                }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: c.risk_level === "high" ? "#f87171" : "#34d399", textTransform: "uppercase", letterSpacing: 1, margin: "0 0 4px" }}>Safer Alternative</p>
                  <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 13, margin: 0, lineHeight: 1.6 }}>{c.suggestions}</p>
                </div>
              )}
            </>
          )}
        </div>

        <button onClick={() => setExpanded(!expanded)} style={{
          flexShrink: 0, background: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 8, padding: "6px 10px", cursor: "pointer", color: "rgba(255,255,255,0.5)"
        }}>
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// SIMULATOR SECTION
// ============================================================================
function SimulatorSection({ simState, simData, onSimulate, highRisks, medRisks }) {
  const eligible = highRisks + medRisks;

  return (
    <div style={{
      border: "1px solid rgba(167,139,250,0.25)",
      borderRadius: 24,
      overflow: "hidden",
      background: "linear-gradient(160deg, rgba(99,102,241,0.08) 0%, rgba(139,92,246,0.04) 100%)",
      marginBottom: 40
    }}>
      {/* Header */}
      <div style={{
        padding: "24px 28px",
        borderBottom: "1px solid rgba(167,139,250,0.15)",
        display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16
      }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 4px 16px rgba(99,102,241,0.4)"
            }}>
              <Zap size={18} color="white" />
            </div>
            <h2 style={{ color: "white", fontSize: 20, fontWeight: 800, margin: 0 }}>
              What Happens If…
            </h2>
          </div>
          <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 13, margin: 0 }}>
            Simulate real-world consequences for your {eligible} medium/high risk clause{eligible !== 1 ? "s" : ""}
          </p>
        </div>

        {simState === "idle" && (
          <button
            id="simulate-btn"
            onClick={onSimulate}
            disabled={eligible === 0}
            style={{
              padding: "13px 28px",
              background: eligible === 0
                ? "rgba(255,255,255,0.08)"
                : "linear-gradient(135deg, #6366f1, #8b5cf6)",
              border: "none", borderRadius: 100, color: "white",
              fontWeight: 700, fontSize: 14, cursor: eligible === 0 ? "not-allowed" : "pointer",
              boxShadow: eligible === 0 ? "none" : "0 8px 24px rgba(99,102,241,0.4)",
              transition: "all 0.2s", whiteSpace: "nowrap"
            }}
          >
            🔮 Simulate Consequences
          </button>
        )}
      </div>

      {/* Body */}
      <div style={{ padding: "24px 28px" }}>
        {simState === "idle" && eligible === 0 && (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <CheckCircle size={40} color="#34d399" style={{ marginBottom: 12 }} />
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 15 }}>
              No medium or high risk clauses found — this document looks safe!
            </p>
          </div>
        )}

        {simState === "idle" && eligible > 0 && (
          <div style={{
            textAlign: "center", padding: "32px 0",
            color: "rgba(255,255,255,0.35)", fontSize: 14, lineHeight: 1.8
          }}>
            <Sparkles size={32} color="rgba(167,139,250,0.4)" style={{ marginBottom: 12, display: "block", margin: "0 auto 12px" }} />
            Click <strong style={{ color: "#a78bfa" }}>Simulate Consequences</strong> to generate timeline-based,
            scenario-driven impact analysis for your {eligible} risky clause{eligible !== 1 ? "s" : ""}.
          </div>
        )}

        {simState === "loading" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {[1, 2, 3].map(i => (
              <ShimmerCard key={i} />
            ))}
          </div>
        )}

        {simState === "error" && (
          <div style={{
            background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.3)",
            borderRadius: 16, padding: 24, textAlign: "center"
          }}>
            <p style={{ color: "#f87171", fontWeight: 600, margin: 0 }}>
              Simulation failed. Ensure the backend is running and try again.
            </p>
          </div>
        )}

        {simState === "done" && simData && (
          <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
            {simData.length === 0 ? (
              <div style={{ textAlign: "center", padding: "32px 0", color: "rgba(255,255,255,0.4)" }}>
                No simulations returned for this document.
              </div>
            ) : (
              simData.map((sim, i) => (
                <ScenarioCard key={i} sim={sim} index={i} />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// SHIMMER LOADING CARD
// ============================================================================
function ShimmerCard() {
  return (
    <div style={{
      background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 16, padding: 20, animation: "pulse 1.5s ease-in-out infinite"
    }}>
      <div style={{ height: 14, background: "rgba(255,255,255,0.08)", borderRadius: 100, width: "40%", marginBottom: 12 }} />
      <div style={{ height: 10, background: "rgba(255,255,255,0.06)", borderRadius: 100, width: "90%", marginBottom: 8 }} />
      <div style={{ height: 10, background: "rgba(255,255,255,0.06)", borderRadius: 100, width: "75%", marginBottom: 20 }} />
      <div style={{ display: "flex", gap: 12 }}>
        {[1, 2, 3].map(i => (
          <div key={i} style={{ flex: 1, height: 60, background: "rgba(255,255,255,0.05)", borderRadius: 12 }} />
        ))}
      </div>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }`}</style>
    </div>
  );
}

// ============================================================================
// SCENARIO CARD — the star of the show
// ============================================================================
function ScenarioCard({ sim, index }) {
  const isHigh = sim.risk_level === "high";
  const isMed = sim.risk_level === "medium";
  const riskColor = isHigh ? "#f87171" : isMed ? "#fb923c" : "#34d399";
  const severityPct = Math.min((sim.severity_score / 10) * 100, 100);

  return (
    <div style={{
      background: isHigh
        ? "linear-gradient(160deg, rgba(248,113,113,0.06) 0%, rgba(0,0,0,0) 60%)"
        : "rgba(255,255,255,0.02)",
      border: `1px solid ${isHigh ? "rgba(248,113,113,0.25)" : "rgba(255,255,255,0.08)"}`,
      borderRadius: 20, padding: "24px 24px 28px",
      position: "relative", overflow: "hidden"
    }}>
      {/* Top accent line for high risk */}
      {isHigh && (
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 3,
          background: "linear-gradient(90deg, #f87171, #f472b6)"
        }} />
      )}

      {/* Card Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 20 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <span style={{
              fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1,
              color: riskColor, background: `${riskColor}18`,
              padding: "4px 10px", borderRadius: 100
            }}>{sim.risk_level} risk</span>
            <span style={{
              fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1,
              color: "rgba(255,255,255,0.35)", background: "rgba(255,255,255,0.06)",
              padding: "4px 10px", borderRadius: 100
            }}>{sim.category}</span>
          </div>
          <p style={{
            fontFamily: "monospace", fontSize: 12, color: "rgba(255,255,255,0.35)",
            background: "rgba(0,0,0,0.25)", padding: "8px 12px", borderRadius: 8,
            margin: 0, lineHeight: 1.5,
            display: "-webkit-box", WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical", overflow: "hidden"
          }}>
            {sim.clause}
          </p>
        </div>

        {/* Severity Badge */}
        <div style={{
          flexShrink: 0, textAlign: "center",
          background: `linear-gradient(160deg, ${riskColor}22, ${riskColor}08)`,
          border: `1px solid ${riskColor}40`,
          borderRadius: 14, padding: "12px 16px", minWidth: 72
        }}>
          <div style={{ fontSize: 28, fontWeight: 900, color: riskColor, lineHeight: 1 }}>
            {sim.severity_score.toFixed(1)}
          </div>
          <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: 0.5, marginTop: 4 }}>
            Severity
          </div>
          {/* Mini severity bar */}
          <div style={{ marginTop: 8, background: "rgba(255,255,255,0.06)", borderRadius: 100, height: 4, overflow: "hidden" }}>
            <div style={{
              width: `${severityPct}%`, height: "100%",
              background: `linear-gradient(90deg, ${riskColor}, ${riskColor}aa)`,
              borderRadius: 100, transition: "width 1s ease"
            }} />
          </div>
        </div>
      </div>

      {/* Scenario Narrative */}
      <div style={{
        background: "rgba(167,139,250,0.08)", border: "1px solid rgba(167,139,250,0.18)",
        borderRadius: 14, padding: "14px 18px", marginBottom: 20
      }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: "#a78bfa", textTransform: "uppercase", letterSpacing: 1, margin: "0 0 6px" }}>
          🔮 What Could Happen
        </p>
        <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 14, margin: 0, lineHeight: 1.75 }}>
          {sim.scenario}
        </p>
      </div>

      {/* Vertical Timeline */}
      <div style={{ marginBottom: 20 }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: 1, margin: "0 0 14px", display: "flex", alignItems: "center", gap: 6 }}>
          <Clock size={12} /> Consequence Timeline
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {sim.timeline.map((step, si) => {
            const isLast = si === sim.timeline.length - 1;
            const isDanger = isLast && isHigh;
            return (
              <div key={si} style={{ display: "flex", gap: 0, alignItems: "stretch" }}>
                {/* Connector column */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 28, flexShrink: 0 }}>
                  <div style={{
                    width: 20, height: 20, borderRadius: "50%", flexShrink: 0,
                    background: isDanger
                      ? "linear-gradient(135deg, #f87171, #ef4444)"
                      : isHigh ? "rgba(248,113,113,0.3)" : "rgba(99,102,241,0.4)",
                    border: `2px solid ${isDanger ? "#f87171" : isHigh ? "rgba(248,113,113,0.5)" : "rgba(99,102,241,0.5)"}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    zIndex: 1, marginTop: 4,
                    boxShadow: isDanger ? "0 0 12px rgba(248,113,113,0.5)" : "none"
                  }}>
                    <span style={{ fontSize: 9, fontWeight: 800, color: "white" }}>{si + 1}</span>
                  </div>
                  {!isLast && (
                    <div style={{
                      width: 2, flex: 1, minHeight: 16,
                      background: isHigh ? "rgba(248,113,113,0.2)" : "rgba(99,102,241,0.2)",
                      margin: "2px 0"
                    }} />
                  )}
                </div>

                {/* Step content */}
                <div style={{
                  flex: 1, paddingLeft: 12, paddingBottom: isLast ? 0 : 12, paddingTop: 2
                }}>
                  <div style={{
                    background: isDanger
                      ? "rgba(248,113,113,0.12)"
                      : "rgba(255,255,255,0.04)",
                    border: `1px solid ${isDanger ? "rgba(248,113,113,0.3)" : "rgba(255,255,255,0.07)"}`,
                    borderRadius: 10, padding: "8px 14px"
                  }}>
                    <p style={{
                      color: isDanger ? "#fca5a5" : "rgba(255,255,255,0.65)",
                      fontSize: 13, margin: 0, lineHeight: 1.5,
                      fontWeight: isDanger ? 600 : 400
                    }}>
                      {isDanger && "⚠️ "}{step}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Impact Triptych */}
      <div>
        <p style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: 1, margin: "0 0 12px" }}>
          Estimated Impact
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 10 }}>
          <ImpactCard
            icon={<DollarSign size={14} />}
            label="Financial"
            value={sim.impact.financial}
            color="#fb923c"
            bg="rgba(251,146,60,0.08)"
            border="rgba(251,146,60,0.2)"
          />
          <ImpactCard
            icon={<Scale size={14} />}
            label="Legal"
            value={sim.impact.legal}
            color="#f87171"
            bg="rgba(248,113,113,0.08)"
            border="rgba(248,113,113,0.2)"
          />
          <ImpactCard
            icon={<User size={14} />}
            label="User Effect"
            value={sim.impact.user_effect}
            color="#818cf8"
            bg="rgba(129,140,248,0.08)"
            border="rgba(129,140,248,0.2)"
          />
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// IMPACT CARD
// ============================================================================
function ImpactCard({ icon, label, value, color, bg, border }) {
  return (
    <div style={{
      background: bg, border: `1px solid ${border}`,
      borderRadius: 12, padding: "12px 16px"
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6, color }}>
        {icon}
        <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.8 }}>{label}</span>
      </div>
      <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 13, margin: 0, lineHeight: 1.5 }}>
        {value}
      </p>
    </div>
  );
}
