"use client";
import React, { useState } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud, CheckCircle, AlertTriangle, ShieldAlert, FileText, Loader2, ArrowRight } from "lucide-react";
import axios from "axios";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ReferenceLine, Area, AreaChart
} from "recharts";

export default function Home() {
  const [appState, setAppState] = useState("upload"); // upload, loading, results
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
      // 1. Upload and trigger analysis
      const uploadRes = await axios.post("http://localhost:8000/api/analyze", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      const docId = uploadRes.data.document_id;

      // 2. Poll for results (assuming sync for simplicity based on our backend, but we'll fetch ID)
      const res = await axios.get(`http://localhost:8000/api/documents/${docId}`);
      setResults(res.data);
      setAppState("results");
    } catch (err) {
      console.error(err);
      alert("Error analyzing document. Check console.");
      setAppState("upload");
    }
  };

  // Rendering
  if (appState === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
        <Loader2 className="h-16 w-16 animate-spin text-blue-600 mb-6" />
        <h2 className="text-2xl font-bold text-gray-800">Analyzing Document</h2>
        <p className="text-gray-500 mt-2 text-center max-w-md">
          Our AI is reading your legal document, extracting clauses, and detecting risks...
        </p>
      </div>
    );
  }

  if (appState === "results" && results) {
    return <Dashboard results={results} onReset={() => setAppState("upload")} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col items-center p-6 lg:p-12">
      <div className="max-w-4xl w-full text-center mb-12 mt-10">
        <h1 className="text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
          Legal Document <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Simplifier</span>
        </h1>
        <p className="text-xl text-slate-600">
          Instantly translate dense legal jargon into plain English and map hidden risks in your contracts.
        </p>
      </div>

      <div 
        {...getRootProps()} 
        className={`w-full max-w-2xl border-4 border-dashed rounded-3xl p-16 transition-all duration-300 cursor-pointer bg-white/50 backdrop-blur-sm
        ${isDragActive ? "border-blue-500 bg-blue-50/50" : "border-slate-300 hover:border-blue-400 hover:shadow-lg hover:shadow-blue-100"}`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="p-6 bg-blue-100 text-blue-600 rounded-full">
            <UploadCloud size={48} />
          </div>
          <div>
            <p className="text-2xl font-semibold text-slate-700">Drop your document here</p>
            <p className="text-slate-500 mt-2">Supports PDF, DOCX, and TXT (up to 10MB)</p>
          </div>
          <button className="mt-6 px-8 py-3 bg-slate-900 text-white font-medium rounded-full hover:bg-slate-800 transition shadow-md">
            Browse Files
          </button>
        </div>
      </div>
    </div>
  );
}

function Dashboard({ results, onReset }) {
  // Chart Data preparation
  const chartData = results.clauses.map((c, i) => ({
    name: `Clause ${i + 1}`,
    riskScore: c.risk_score,
  }));

  const sortedRisks = [...results.clauses].sort((a, b) => b.risk_score - a.risk_score);
  const highRisks = results.clauses.filter(c => c.risk_level === 'high').length;

  return (
    <div className="min-h-screen bg-slate-50 p-6 lg:p-12">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{results.filename}</h1>
            <p className="text-slate-500 mt-1">Analysis Complete • {results.clauses.length} clauses analyzed</p>
          </div>
          <button onClick={onReset} className="text-sm font-medium text-slate-600 bg-white px-5 py-2 border rounded-full hover:bg-slate-50 shadow-sm transition">
            Analyze New File
          </button>
        </div>

        {/* Global Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm ring-1 ring-slate-905/5">
            <div className="flex items-center gap-3 text-slate-500 font-medium mb-3">
              <CheckCircle className="text-indigo-500" />
              Document TL;DR
            </div>
            <p className="text-slate-800 font-medium">{results.summary}</p>
          </div>
          
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm ring-1 ring-slate-905/5 flex flex-col justify-center items-center text-center">
            <p className="text-slate-500 font-medium mb-1">Overall Risk Score</p>
            <div className={`text-6xl font-black ${results.overall_risk_score > 6 ? 'text-red-500' : results.overall_risk_score > 4 ? 'text-amber-500' : 'text-green-500'}`}>
              {results.overall_risk_score.toFixed(1)}<span className="text-2xl text-slate-400">/10</span>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm ring-1 ring-slate-905/5 flex flex-col justify-center items-center text-center">
            <p className="text-slate-500 font-medium mb-1">Critical Risks</p>
            <div className="text-6xl font-black text-red-500 flex items-center gap-2">
              <ShieldAlert /> {highRisks}
            </div>
            <p className="text-sm text-slate-400 mt-2">Clauses require immediate attention</p>
          </div>
        </div>

        {/* Risk Surface Map */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-800 mb-6 flex items-center gap-2">
            <AlertTriangle className="text-amber-500" /> Risk Surface Map
          </h2>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{fontSize: 12, fill: "#64748b"}} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 10]} hide />
                <Tooltip 
                  contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)", fontWeight: 500 }}
                />
                <ReferenceLine y={7} stroke="#f87171" strokeDasharray="3 3" label={{ position: 'top', value: 'High Risk Threshold', fill: '#f87171', fontSize: 12 }} />
                <Area type="monotone" dataKey="riskScore" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorRisk)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Clause Breakdown */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
            <FileText className="text-blue-500" /> Detailed Clause Breakdown
          </h2>
          {sortedRisks.map((c, i) => (
            <div key={i} className={`p-6 rounded-2xl border flex flex-col md:flex-row gap-6 shadow-sm transition
              ${c.risk_level === 'high' ? 'bg-red-50/30 border-red-200 hover:border-red-300' 
              : c.risk_level === 'medium' ? 'bg-amber-50/30 border-amber-200 hover:border-amber-300' 
              : 'bg-white border-slate-200 hover:border-slate-300'}`}>
              
              {/* Score Indicator */}
              <div className="flex-shrink-0 w-24">
                <div className={`text-2xl font-bold flex flex-col
                  ${c.risk_level === 'high' ? 'text-red-600' : c.risk_level === 'medium' ? 'text-amber-600' : 'text-green-600'}`}>
                  {c.risk_score.toFixed(1)}
                  <span className="text-xs font-medium uppercase tracking-wider mt-1 opacity-70">
                    {c.risk_level} risk
                  </span>
                </div>
                {c.category && (
                  <span className="inline-block mt-3 px-2 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold uppercase rounded tracking-wider">
                    {c.category}
                  </span>
                )}
              </div>

              {/* Text Translation */}
              <div className="flex-1 space-y-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 font-mono text-sm text-slate-600">
                  {c.original_text}
                </div>
                
                <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm relative">
                  <div className="absolute -left-3 top-1/2 -mt-3 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center border-4 border-white shadow-sm">
                    <ArrowRight size={12} strokeWidth={3} />
                  </div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1 ml-4">Plain English</h4>
                  <p className="text-slate-800 font-medium ml-4">{c.simplified_text}</p>
                </div>
              </div>

              {/* Suggestions / Risks */}
              <div className="flex-1 space-y-4">
                {c.explanation && (
                  <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm text-sm">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Risk Insight</h4>
                    <p className="text-slate-700">{c.explanation}</p>
                  </div>
                )}
                {c.suggestions && (
                  <div className={`p-4 rounded-xl border text-sm shadow-sm
                    ${c.risk_level === 'high' ? 'bg-red-50 border-red-100' : 'bg-emerald-50 border-emerald-100'}`}>
                    <h4 className={`text-xs font-bold uppercase tracking-wider mb-1
                      ${c.risk_level === 'high' ? 'text-red-400' : 'text-emerald-500'}`}>Safer Alternative</h4>
                    <p className={c.risk_level === 'high' ? 'text-red-900' : 'text-emerald-900'}>
                      {c.suggestions}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
