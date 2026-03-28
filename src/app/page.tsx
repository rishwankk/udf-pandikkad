"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getBoothByNumber } from "@/lib/boothData";

export default function HomePage() {
  const [boothInput, setBoothInput] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const num = parseInt(boothInput.trim());
    if (isNaN(num) || num < 51 || num > 97) {
      setError("Valid booth numbers: 51 – 97");
      return;
    }
    const booth = getBoothByNumber(num);
    if (!booth) {
      setError("Booth not found");
      return;
    }
    setLoading(true);
    router.push(`/booth/${num}`);
  };

  const quickBooths = [51,56,61,67,71,74,79,81,83,86,92,94,96];

  return (
    <div className="home-bg min-h-screen flex flex-col">
      {/* Top bar */}
      <header className="home-header">
        <div className="header-brand">
          <div className="brand-pill">UDF</div>
          <div>
            <div className="brand-title">PANDIKKAD PANCHAYATH</div>
            <div className="brand-sub">Booth Observer System</div>
          </div>
        </div>
        <button className="admin-chip" onClick={() => router.push("/admin/login")}>
          <span>🔐</span> Admin
        </button>
      </header>

      {/* Hero section */}
      <main className="flex-1 flex flex-col items-center px-5 pt-8 pb-6">
        <div className="election-badge">🗳️ ELECTION 2026</div>

        <div className="hero-icon-wrap">
          <span className="hero-emoji">🗳️</span>
          <span className="hero-badge-ok">✓</span>
        </div>

        <h1 className="home-title">UDF Booth Observer</h1>
        <p className="home-subtitle">Pandikkad Panchayath · Real-time Status Tracker</p>

        {/* Entry Card */}
        <div className="entry-card">
          <div className="entry-card-header">
            <span className="entry-icon">🔢</span>
            <div>
              <div className="entry-card-title">Enter Booth Number</div>
              <div className="entry-card-sub">Valid range: 51 – 97</div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="entry-form">
            <input
              id="booth-input"
              type="number"
              min={51}
              max={97}
              className="booth-input"
              placeholder="Enter booth no."
              value={boothInput}
              onChange={(e) => { setBoothInput(e.target.value); setError(""); }}
              autoFocus
            />
            {error && <div className="entry-error">⚠ {error}</div>}
            <button
              id="continue-btn"
              type="submit"
              className="continue-btn"
              disabled={loading}
            >
              {loading
                ? <span className="btn-spinner" />
                : <><span>Continue</span><span className="btn-arrow">→</span></>
              }
            </button>
          </form>
        </div>

        {/* Quick select */}
        <div className="quick-title">Quick select</div>
        <div className="quick-grid">
          {quickBooths.map(b => (
            <button
              key={b}
              className={`quick-pill ${boothInput === String(b) ? "quick-active" : ""}`}
              onClick={() => { setBoothInput(String(b)); setError(""); }}
            >
              {b}
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}
