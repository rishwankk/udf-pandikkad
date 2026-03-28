"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { boothData } from "@/lib/boothData";

interface StationData {
  station: string; ward: string; total: number; updated: number;
  completed: number; partial: number; pending: number;
  lastUpdated: string | null;
  booths: BoothItem[];
}
interface BoothItem {
  _id: string; booth: number; boothName: string;
  observer: string; contact: string; ward: string;
  flex: { status: string; extraRequest: boolean };
  poster: { status: string; extraRequest: boolean };
  round1: { status: string }; round2: { status: string }; round3: { status: string };
  kudumbaYogamDate: string; expectedLead: number; lastUpdated: string; entryTime: string;
}

function MiniStatusBadge({ status }: { status: string }) {
  if (!status) return <span className="mini-badge mb-none">—</span>;
  const cls: Record<string, string> = {
    completed: "mini-badge mb-completed", partially: "mini-badge mb-partially",
    started: "mini-badge mb-started", pending: "mini-badge mb-pending",
  };
  const lbl: Record<string, string> = {
    completed: "Done", partially: "Part", started: "Strt", pending: "Pend",
  };
  return <span className={cls[status] || "mini-badge mb-none"}>{lbl[status] || status}</span>;
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
}

function fmtDateTime(iso: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit", hour12: true });
}

const COLORS = [
  "#3b82f6","#22c55e","#f59e0b","#a855f7","#ec4899",
  "#06b6d4","#84cc16","#f97316","#14b8a6","#8b5cf6","#f43f5e","#64748b",
];

export default function AdminDashboard() {
  const router = useRouter();
  const [stations,     setStations]     = useState<StationData[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [selectedStation, setSelectedStation] = useState<StationData | null>(null);
  const [tab,          setTab]          = useState<"overview" | "station" | "booths" | "leaderboard">("booths");
  const [boothSearch,  setBoothSearch]  = useState("");
  const [boothWardFilter, setBoothWardFilter] = useState("All");

  useEffect(() => {
    if (typeof window !== "undefined" && !localStorage.getItem("admin_auth")) {
      router.replace("/admin/login");
    }
  }, [router]);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/admin");
      if (res.ok) setStations(await res.json());
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, 30000);
    return () => clearInterval(id);
  }, [refresh]);

  const openStation = (s: StationData) => {
    setSelectedStation(s); setTab("station");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const logout = () => { localStorage.removeItem("admin_auth"); router.push("/admin/login"); };

  const totalBooths    = stations.reduce((a, s) => a + s.total, 0);
  const totalUpdated   = stations.reduce((a, s) => a + s.updated, 0);
  const totalCompleted = stations.reduce((a, s) => a + s.completed, 0);
  const totalPartial   = stations.reduce((a, s) => a + s.partial, 0);
  const totalPending   = stations.reduce((a, s) => a + s.pending, 0);
  const totalLead      = stations.reduce((a, s) => a + s.booths.reduce((acc, b) => acc + (b.expectedLead || 0), 0), 0);
  const overallPct     = totalBooths ? Math.round((totalCompleted / totalBooths) * 100) : 0;

  const anyWorkStarted = totalUpdated > 0;
  const mostActive     = stations.find(s => s.lastUpdated);
  // Best = most completed %; only show if any work done
  const bestStation = anyWorkStarted
    ? [...stations].filter(s => s.completed > 0).sort((a, b) => (b.completed / b.total) - (a.completed / a.total))[0]
    : null;

  const progColor = (pct: number) =>
    pct >= 75 ? "#22c55e" : pct >= 40 ? "#f59e0b" : "#3b82f6";

  return (
    <div className="dash-bg">
      {/* Nav */}
      <nav className="dash-nav">
        <div className="dash-nav-info">
          <div className="dash-nav-title">
            <span className="live-dot" style={{ marginRight: 5 }} />
            ADMIN DASHBOARD
          </div>
          <div className="dash-nav-sub">Pandikkad UDF · Live ({totalBooths} booths)</div>
        </div>
        <button className="nav-btn nav-btn-blue" onClick={refresh}>🔄</button>
        <button className="nav-btn nav-btn-red" onClick={logout}>Logout</button>
      </nav>

      <div className="dash-tabs">
        <button
          className={`dash-tab ${tab === "booths" ? "dash-tab-on" : "dash-tab-off"}`}
          onClick={() => { setTab("booths"); setSelectedStation(null); }}
        >
          📋 Booths
        </button>
        <button
          className={`dash-tab ${tab === "leaderboard" ? "dash-tab-on" : "dash-tab-off"}`}
          onClick={() => { setTab("leaderboard"); setSelectedStation(null); }}
        >
          🏆 Leaderboard
        </button>
        <button
          className={`dash-tab ${tab === "overview" ? "dash-tab-on" : "dash-tab-off"}`}
          onClick={() => { setTab("overview"); setSelectedStation(null); }}
        >
          📊 Stats
        </button>
        {selectedStation && (
          <button
            className={`dash-tab ${tab === "station" ? "dash-tab-ward-on" : "dash-tab-off"}`}
            onClick={() => setTab("station")}
          >
            📍 Station
          </button>
        )}
      </div>

      {/* ════ OVERVIEW TAB ════ */}
      {tab === "overview" && (
        <div style={{ paddingBottom: 32 }}>
          {/* 4 stat pills */}
          <div className="stats-row">
            <div className="stat-pill">
              <div className="stat-num stat-blue">{totalBooths}</div>
              <div className="stat-label">Total</div>
            </div>
            <div className="stat-pill">
              <div className="stat-num stat-green">{totalCompleted}</div>
              <div className="stat-label">Completed</div>
            </div>
            <div className="stat-pill">
              <div className="stat-num stat-amber">{totalPartial}</div>
              <div className="stat-label">In Progress</div>
            </div>
            <div className="stat-pill">
              <div className="stat-num" style={{ color: "#a855f7" }}>{totalLead}</div>
              <div className="stat-label">Total Lead</div>
            </div>
            <div className="stat-pill">
              <div className="stat-num" style={{ color: totalPending === totalBooths ? "#ef4444" : "var(--c-text3)" }}>
                {totalPending}
              </div>
              <div className="stat-label">Pending</div>
            </div>
          </div>

          {/* Overall progress */}
          <div className="overall-card slide-up" style={{ margin: "10px 14px 0" }}>
            <div className="overall-top">
              <span className="overall-label">Overall Completion</span>
              <span className="overall-pct" style={{ color: overallPct === 0 ? "var(--c-text3)" : progColor(overallPct) }}>
                {overallPct}%
              </span>
            </div>
            <div className="prog-bar">
              <div className="prog-fill" style={{
                width: `${overallPct || 1}%`,
                background: overallPct === 0
                  ? "rgba(71,85,105,0.4)"
                  : `linear-gradient(90deg, ${progColor(overallPct)}88, ${progColor(overallPct)})`
              }} />
            </div>
            <div style={{ marginTop: 8, fontSize: 11, color: "var(--c-text3)", display: "flex", justifyContent: "space-between" }}>
              <span>{totalUpdated} updated · {totalCompleted} completed</span>
              <span style={{ color: totalPending === totalBooths ? "#ef4444" : "inherit" }}>
                {totalPending === totalBooths ? "⭕ No work started yet" : `${totalPending} pending`}
              </span>
            </div>
          </div>

          {/* No work started → info banner */}
          {!anyWorkStarted && !loading && (
            <div className="slide-up" style={{ animationDelay: "60ms", margin: "10px 14px 0" }}>
              <div style={{
                background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.2)",
                borderRadius: 14, padding: "14px 16px", textAlign: "center",
              }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>🚀</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "white", marginBottom: 4 }}>
                  Ready to Track!
                </div>
                <div style={{ fontSize: 12, color: "var(--c-text3)", lineHeight: 1.5 }}>
                  No observers have submitted updates yet.<br />
                  Ward status will appear here once they start.
                </div>
              </div>
            </div>
          )}

          {/* Best station — only when work has started */}
          {bestStation && (
            <div className="best-card slide-up" style={{ animationDelay: "60ms" }}>
              <div className="best-trophy">🏆</div>
              <div className="best-info">
                <div className="best-tag">BEST PERFORMING STATION</div>
                <div className="best-name">{bestStation.station}</div>
                <div className="best-sub">{bestStation.completed}/{bestStation.total} booths completed</div>
              </div>
            </div>
          )}

          {/* Most recently active — when work started */}
          {mostActive && mostActive.station !== bestStation?.station && (
            <div className="slide-up" style={{ animationDelay: "100ms", margin: "10px 14px 0" }}>
              <div style={{
                background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.2)",
                borderRadius: 14, padding: "12px 14px",
                display: "flex", alignItems: "center", gap: 10,
              }}>
                <span style={{ fontSize: 22 }}>⚡</span>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "var(--c-green)", letterSpacing: 0.5 }}>MOST RECENTLY ACTIVE</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "white" }}>{mostActive.station}</div>
                  <div style={{ fontSize: 11, color: "var(--c-text3)" }}>
                    Updated {mostActive.lastUpdated ? timeAgo(mostActive.lastUpdated) : "—"}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Station Performance Chart */}
          <div className="section-head">Polling Stations ({stations.length})</div>
          <div className="chart-card slide-up" style={{ animationDelay: "140ms" }}>
            {loading
              ? [0,1,2,3].map(i => <div key={i} className="skeleton chart-row" style={{ height: 36 }} />)
              : stations.map((s, i) => {
                  const pct = s.total ? Math.round(((s.completed + s.partial * 0.5) / s.total) * 100) : 0;
                  const color = COLORS[i % COLORS.length];
                  return (
                    <div key={s.station} className="chart-row" onClick={() => openStation(s)} style={{ cursor: "pointer" }}>
                      <div className="chart-row-top">
                        <span className="chart-ward-name" style={{ fontSize: 12 }}>{s.station}</span>
                        <span className="chart-ward-val" style={{ color }}>
                          {s.updated}/{s.total} updated
                        </span>
                      </div>
                      <div className="prog-bar">
                        <div className="prog-fill" style={{
                          width: pct > 0 ? `${pct}%` : "1%",
                          background: pct > 0 ? color : "rgba(71,85,105,0.3)"
                        }} />
                      </div>
                    </div>
                  );
                })
            }
          </div>

          {/* Station Cards */}
          <div className="section-head" style={{ marginTop: 6 }}>All Stations</div>
          {loading ? (
            <div style={{ padding: "0 14px", display: "flex", flexDirection: "column", gap: 9 }}>
              {[0,1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 90 }} />)}
            </div>
          ) : (
            <div className="wards-list">
              {stations.map((s, i) => {
                const pct = s.total ? Math.round((s.completed / s.total) * 100) : 0;
                const color = progColor(pct);
                const isActive = selectedStation?.station === s.station;
                const rankClass = i === 0 ? "rank-1" : i === 1 ? "rank-2" : i === 2 ? "rank-3" : "";
                return (
                  <div
                    key={s.station}
                    className={`ward-card slide-up ${isActive ? "ward-active" : ""}`}
                    style={{ animationDelay: `${i * 35}ms` }}
                    onClick={() => openStation(s)}
                  >
                    <div className={`ward-rank ${rankClass}`}>
                      {i === 0 && s.lastUpdated ? "🔥" : i + 1}
                    </div>
                    <div className="ward-body">
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div className="ward-name" style={{ fontSize: 13 }}>{s.station}</div>
                        <span style={{
                          fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 100, marginLeft: 4,
                          background: "rgba(59,130,246,0.12)", color: "var(--c-blue)", border: "1px solid rgba(59,130,246,0.3)",
                        }}>{s.total} booths</span>
                      </div>
                      <div className="ward-updated">{s.lastUpdated ? `🕐 ${timeAgo(s.lastUpdated)}` : "⭕ No updates"}</div>
                      <div className="ward-prog-row">
                        <div className="ward-prog-bar">
                          <div className="ward-prog-fill" style={{ width: `${pct || 1}%`, background: progColor(pct) }} />
                        </div>
                        <span className="ward-prog-pct">{pct}%</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ════ BOOTHS TAB ════ */}
      {tab === "booths" && (() => {
        // Flatten: merge static boothData with DB records from all stations
        const dbMap: Record<number, BoothItem> = {};
        for (const s of stations) for (const b of s.booths) dbMap[b.booth] = b;
        const uniqueWards = ["All", ...Array.from(new Set(boothData.map(b => b.ward || "Unknown")))];
        const filtered = boothData.filter(sb => {
          const matchWard = boothWardFilter === "All" || sb.ward === boothWardFilter;
          const q = boothSearch.toLowerCase();
          const matchSearch = !q ||
            sb.observer.toLowerCase().includes(q) ||
            String(sb.booth).includes(q) ||
            sb.boothName.toLowerCase().includes(q);
          return matchWard && matchSearch;
        });
        return (
          <div style={{ paddingBottom: 32 }}>
            {/* Search + filter bar */}
            <div style={{ padding: "10px 14px 0", display: "flex", flexDirection: "column", gap: 8 }}>
              <input
                type="text"
                placeholder="🔍  Search booth, observer, name…"
                value={boothSearch}
                onChange={e => setBoothSearch(e.target.value)}
                style={{
                  width: "100%", boxSizing: "border-box",
                  background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: 12, padding: "10px 14px", color: "white",
                  fontSize: 13, outline: "none",
                }}
              />
              <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 2 }}>
                {uniqueWards.map(w => (
                  <button
                    key={w}
                    onClick={() => setBoothWardFilter(w)}
                    style={{
                      flexShrink: 0, fontSize: 11, fontWeight: 700,
                      padding: "5px 12px", borderRadius: 100, cursor: "pointer", border: "1px solid",
                      background: boothWardFilter === w ? "rgba(59,130,246,0.25)" : "rgba(255,255,255,0.05)",
                      borderColor: boothWardFilter === w ? "rgba(59,130,246,0.6)" : "rgba(255,255,255,0.1)",
                      color: boothWardFilter === w ? "var(--c-blue)" : "var(--c-text3)",
                    }}
                  >{w}</button>
                ))}
              </div>
              <div style={{ fontSize: 11, color: "var(--c-text3)", paddingLeft: 2 }}>
                Showing {filtered.length} of {boothData.length} booths
              </div>
            </div>

            {/* Booth cards */}
            <div className="booth-cards" style={{ marginTop: 4 }}>
              {loading
                ? [0,1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 110, margin: "0 14px 9px" }} />)
                : filtered.map((sb, i) => {
                    const b = dbMap[sb.booth];
                    const tasks = b ? [b.flex?.status, b.poster?.status, b.round1?.status, b.round2?.status, b.round3?.status] : [];
                    const doneCnt = tasks.filter(t => t === "completed").length;
                    const hasProg = tasks.some(t => t && t !== "");
                    return (
                      <div key={sb.booth} className="booth-card slide-up" style={{ animationDelay: `${i * 25}ms`, opacity: b ? 1 : 0.7 }}>
                        <div className="booth-card-top">
                          <div className="booth-card-left">
                            <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                              <span className="booth-num-tag">Booth #{sb.booth}</span>
                              <span style={{ fontSize: 10, color: "var(--c-text3)", background: "rgba(255,255,255,0.06)", padding: "2px 8px", borderRadius: 100, border: "1px solid rgba(255,255,255,0.1)" }}>
                                {sb.ward}
                              </span>
                            </div>
                            <div className="booth-observer">{sb.observer}</div>
                            <div className="booth-name-sm" style={{ color: "var(--c-blue)", fontWeight: 600 }}>🏛️ {sb.boothName}</div>
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                            <div style={{ display: "flex", gap: 6 }}>
                              <a href={`tel:${sb.contact}`} className="booth-call-btn" onClick={e => e.stopPropagation()}>📞</a>
                              {b && (
                                <div style={{ 
                                  background: "rgba(168,85,247,0.15)", border: "1px solid rgba(168,85,247,0.3)",
                                  borderRadius: 8, padding: "5px 10px", textAlign: "center"
                                }}>
                                  <div style={{ fontSize: 9, fontWeight: 700, color: "#d8b4fe" }}>LEAD</div>
                                  <div style={{ fontSize: 13, fontWeight: 800, color: "white" }}>{b.expectedLead || 0}</div>
                                </div>
                              )}
                            </div>
                            {b ? (
                              <span style={{
                                fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 100,
                                background: doneCnt === 5 ? "rgba(34,197,94,0.15)" : hasProg ? "rgba(245,158,11,0.15)" : "rgba(59,130,246,0.12)",
                                color: doneCnt === 5 ? "var(--c-green)" : hasProg ? "var(--c-amber)" : "var(--c-blue)",
                                border: `1px solid ${doneCnt === 5 ? "rgba(34,197,94,0.3)" : hasProg ? "rgba(245,158,11,0.3)" : "rgba(59,130,246,0.3)"}`,
                              }}>{doneCnt}/5</span>
                            ) : (
                              <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 100, background: "rgba(71,85,105,0.2)", color: "var(--c-text3)", border: "1px solid rgba(71,85,105,0.3)" }}>Not started</span>
                            )}
                          </div>
                        </div>
                        <div className="mini-status-grid">
                          {[
                            { key: "Flex",   val: b?.flex?.status },
                            { key: "Poster", val: b?.poster?.status },
                            { key: "Rnd 1",  val: b?.round1?.status },
                            { key: "Rnd 2",  val: b?.round2?.status },
                            { key: "Rnd 3",  val: b?.round3?.status },
                          ].map(t => (
                            <div key={t.key} className="mini-status-item">
                              <div className="mini-status-key">{t.key}</div>
                              <MiniStatusBadge status={t.val || ""} />
                            </div>
                          ))}
                        </div>
                        {(b?.flex?.extraRequest || b?.poster?.extraRequest) && (
                          <div className="extra-alert">⚡ Extra: {[b?.flex?.extraRequest && "Flex", b?.poster?.extraRequest && "Poster"].filter(Boolean).join(", ")}</div>
                        )}
                        {b?.kudumbaYogamDate && <div className="yogam-alert">📅 Kudumba Yogam: {b.kudumbaYogamDate}</div>}
                        <div className="booth-updated" style={{ display: "flex", justifyContent: "space-between" }}>
                          <span>📱 {sb.contact}</span>
                          <span>{b ? `🕐 ${fmtDateTime(b.lastUpdated)}` : "⏳ Awaiting update"}</span>
                        </div>
                      </div>
                    );
                  })
              }
            </div>
          </div>
        );
      })()}

      {/* ════ LEADERBOARD TAB ════ */}
      {tab === "leaderboard" && (() => {
        const sortedStations = [...stations].sort((a, b) => {
          const aPct = a.total ? a.completed / a.total : 0;
          const bPct = b.total ? b.completed / b.total : 0;
          if (bPct !== aPct) return bPct - aPct;
          const aLead = a.booths.reduce((acc, curr) => acc + (curr.expectedLead || 0), 0);
          const bLead = b.booths.reduce((acc, curr) => acc + (curr.expectedLead || 0), 0);
          return bLead - aLead;
        });

        return (
          <div style={{ paddingBottom: 40 }}>
            <div className="section-head" style={{ textAlign: "center", fontSize: 16, marginTop: 20 }}>🏆 STATION LEADERBOARD</div>
            
            <div style={{ padding: "0 14px", marginTop: 10 }}>
              {sortedStations.length === 0 ? (
                <div style={{ textAlign: "center", color: "var(--c-text3)", padding: 40 }}>Loading leaderboard...</div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {sortedStations.map((s, i) => {
                    const pct = s.total ? Math.round((s.completed / s.total) * 100) : 0;
                    const lead = s.booths.reduce((acc, b) => acc + (b.expectedLead || 0), 0);
                    const isTop3 = i < 3;
                    const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : null;
                    const color = i === 0 ? "#fbbf24" : i === 1 ? "#94a3b8" : i === 2 ? "#cd7f32" : "white";

                    return (
                      <div 
                        key={s.station} 
                        className="slide-up"
                        style={{
                          animationDelay: `${i * 50}ms`,
                          background: isTop3 ? `rgba(${i === 0 ? "251,191,36" : i === 1 ? "148,163,184" : "205,127,50"}, 0.1)` : "rgba(255,255,255,0.03)",
                          border: `1px solid ${isTop3 ? color + "44" : "rgba(255,255,255,0.08)"}`,
                          borderRadius: 16, padding: "14px 16px",
                          display: "flex", alignItems: "center", gap: 15,
                          cursor: "pointer",
                        }}
                        onClick={() => openStation(s)}
                      >
                        <div style={{ 
                          width: 32, height: 32, borderRadius: 10,
                          background: isTop3 ? color : "rgba(255,255,255,0.05)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 14, fontWeight: 900, color: isTop3 ? "black" : "var(--c-text3)",
                          flexShrink: 0,
                        }}>
                          {medal || i + 1}
                        </div>

                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <div style={{ fontSize: 13, fontWeight: 700, color: isTop3 ? "white" : "var(--c-text2)", display: "flex", alignItems: "center", gap: 6 }}>
                              {s.station}
                              {pct === 100 && <span style={{ color: "var(--c-green)", fontSize: 12 }}>✓</span>}
                            </div>
                            <div style={{ fontSize: 11, fontWeight: 700, color: progColor(pct) }}>{pct}%</div>
                          </div>
                          <div className="prog-bar" style={{ height: 4, marginTop: 6, background: "rgba(255,255,255,0.05)" }}>
                            <div className="prog-fill" style={{ width: `${pct}%`, background: progColor(pct) }} />
                          </div>
                        </div>

                        <div style={{ textAlign: "right", flexShrink: 0 }}>
                          <div style={{ fontSize: 8, fontWeight: 700, color: "var(--c-text3)", letterSpacing: 0.5 }}>LEAD</div>
                          <div style={{ fontSize: 15, fontWeight: 800, color: "#a855f7" }}>{lead}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* ════ STATION DETAIL TAB ════ */}
      {tab === "station" && selectedStation && (() => {
        const pct = selectedStation.total ? Math.round((selectedStation.completed / selectedStation.total) * 100) : 0;
        // Get ALL booths in this station from static data
        const allStationBooths = boothData.filter(b => b.boothName === selectedStation.station);
        // Map DB records by booth number
        const dbMap = Object.fromEntries(selectedStation.booths.map(b => [b.booth, b]));

        return (
          <div style={{ paddingBottom: 32 }}>
            <div className="ward-detail-header slide-up">
              <button className="ward-back-btn" onClick={() => { setTab("overview"); setSelectedStation(null); }}>
                ← All Stations
              </button>
              <div className="ward-detail-name">{selectedStation.station}</div>
              <div className="ward-detail-stats">
                <span className="ward-detail-stat wc-green">{selectedStation.completed} done</span>
                <span className="ward-detail-stat wc-amber">{selectedStation.partial} partial</span>
                <span className="ward-detail-stat wc-slate">{selectedStation.pending} pending</span>
                <span className="ward-detail-stat" style={{ color: "var(--c-blue)" }}>{selectedStation.total} total</span>
              </div>
              <div className="prog-bar" style={{ marginTop: 10 }}>
                <div className="prog-fill" style={{
                  width: pct > 0 ? `${pct}%` : "1%",
                  background: pct > 0 ? `linear-gradient(90deg, ${progColor(pct)}88, ${progColor(pct)})` : "rgba(71,85,105,0.3)"
                }} />
              </div>
            </div>

            {/* Show ALL booths in station — with or without DB records */}
            <div className="booth-cards">
              {allStationBooths.map((staticBooth, i) => {
                const b = dbMap[staticBooth.booth];
                const hasUpdate = !!b;
                const tasks = hasUpdate
                  ? [b.flex?.status, b.poster?.status, b.round1?.status, b.round2?.status, b.round3?.status]
                  : [];
                const doneCnt  = tasks.filter(t => t === "completed").length;
                const hasProg  = tasks.some(t => t && t !== "");

                return (
                  <div key={staticBooth.booth} className="booth-card slide-up" style={{ animationDelay: `${i * 35}ms`, opacity: hasUpdate ? 1 : 0.7 }}>
                    <div className="booth-card-top">
                      <div className="booth-card-left">
                        <span className="booth-num-tag">Booth #{staticBooth.booth}</span>
                        <div className="booth-observer">{staticBooth.observer}</div>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                        <div style={{ display: "flex", gap: 6 }}>
                          <a href={`tel:${staticBooth.contact}`} className="booth-call-btn" onClick={e => e.stopPropagation()}>📞</a>
                          {b && (
                            <div style={{ 
                              background: "rgba(168,85,247,0.15)", border: "1px solid rgba(168,85,247,0.3)",
                              borderRadius: 8, padding: "5px 10px", textAlign: "center"
                            }}>
                              <div style={{ fontSize: 9, fontWeight: 700, color: "#d8b4fe" }}>LEAD</div>
                              <div style={{ fontSize: 13, fontWeight: 800, color: "white" }}>{b.expectedLead || 0}</div>
                            </div>
                          )}
                        </div>
                        {hasUpdate ? (
                          <span style={{
                            fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 100,
                            background: doneCnt === 5 ? "rgba(34,197,94,0.15)" : hasProg ? "rgba(245,158,11,0.15)" : "rgba(59,130,246,0.12)",
                            color: doneCnt === 5 ? "var(--c-green)" : hasProg ? "var(--c-amber)" : "var(--c-blue)",
                            border: `1px solid ${doneCnt === 5 ? "rgba(34,197,94,0.3)" : hasProg ? "rgba(245,158,11,0.3)" : "rgba(59,130,246,0.3)"}`,
                          }}>
                            {doneCnt}/5
                          </span>
                        ) : (
                          <span style={{
                            fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 100,
                            background: "rgba(71,85,105,0.2)", color: "var(--c-text3)",
                            border: "1px solid rgba(71,85,105,0.3)",
                          }}>
                            Not started
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Status grid — placeholder dashes if no update yet */}
                    <div className="mini-status-grid">
                      {[
                        { key: "Flex",   val: b?.flex?.status },
                        { key: "Poster", val: b?.poster?.status },
                        { key: "Rnd 1",  val: b?.round1?.status },
                        { key: "Rnd 2",  val: b?.round2?.status },
                        { key: "Rnd 3",  val: b?.round3?.status },
                      ].map(t => (
                        <div key={t.key} className="mini-status-item">
                          <div className="mini-status-key">{t.key}</div>
                          <MiniStatusBadge status={t.val || ""} />
                        </div>
                      ))}
                    </div>

                    {b?.flex?.extraRequest || b?.poster?.extraRequest ? (
                      <div className="extra-alert">
                        ⚡ Extra Request:{" "}
                        {[b?.flex?.extraRequest && "Flex", b?.poster?.extraRequest && "Poster"].filter(Boolean).join(", ")}
                      </div>
                    ) : null}

                    {b?.kudumbaYogamDate && (
                      <div className="yogam-alert">📅 Kudumba Yogam: {b.kudumbaYogamDate}</div>
                    )}

                    <div className="booth-updated" style={{ display: "flex", justifyContent: "space-between" }}>
                      <span>📱 {staticBooth.contact}</span>
                      <span>{hasUpdate ? `🕐 ${fmtDateTime(b.lastUpdated)}` : "⏳ Awaiting update"}</span>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="bottom-spacer" />
          </div>
        );
      })()}
    </div>
  );
}
