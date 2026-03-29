"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { getBoothByNumber } from "@/lib/boothData";

type SV = "pending" | "partially" | "completed" | "started" | "";

interface BData {
  booth: number; boothName: string; observer: string; contact: string; ward: string;
  flex: { status: SV; extraRequest: boolean };
  poster: { status: SV; extraRequest: boolean };
  round1: { status: SV }; round2: { status: SV }; round3: { status: SV };
  kudumbaYogamDate: string;
  expectedLead: number;
  adminComment: string;
  entryTime: string; lastUpdated: string;
}

/* ── status button component ── */
function SBtn({ val, label, current, onChange }: { val: SV; label: string; current: SV; onChange: (v: SV) => void }) {
  const active = current === val;
  const cls = active ? `s-btn s-btn-${val}-on` : "s-btn s-btn-off";
  return (
    <button className={cls} onClick={() => onChange(active ? "" : val)}>
      {active && <span style={{ marginRight: 4 }}>✓</span>}{label}
    </button>
  );
}

/* ── status indicator for card header ── */
function StatusChip({ status }: { status: SV }) {
  if (!status) return null;
  const cfg: Record<string, { bg: string; color: string; label: string }> = {
    completed: { bg: "rgba(34,197,94,0.15)", color: "#86efac", label: "Completed" },
    partially:  { bg: "rgba(245,158,11,0.15)", color: "#fcd34d", label: "Partial" },
    started:    { bg: "rgba(59,130,246,0.15)", color: "#93c5fd", label: "Started" },
    pending:    { bg: "rgba(239,68,68,0.15)", color: "#fca5a5", label: "Pending" },
  };
  const c = cfg[status];
  if (!c) return null;
  return (
    <span className="task-card-status-indicator" style={{ background: c.bg, color: c.color, border: `1px solid ${c.color}33` }}>
      {c.label}
    </span>
  );
}

function TaskCard({ title, icon, status, done, children, delay = 0 }: {
  title: string; icon: string; status?: SV; done?: boolean; children: React.ReactNode; delay?: number;
}) {
  return (
    <div className={`task-card slide-up ${done || status ? "has-value" : ""}`} style={{ animationDelay: `${delay}ms` }}>
      <div className="task-card-header">
        <span className="task-card-icon">{icon}</span>
        <span className="task-card-title">{title}</span>
        {status !== undefined && <StatusChip status={status} />}
      </div>
      <div className="task-card-body">{children}</div>
    </div>
  );
}

export default function BoothPage() {
  const params  = useParams();
  const router  = useRouter();
  const boothNum = parseInt(params.id as string);
  const boothInfo = getBoothByNumber(boothNum);

  const [data,    setData]    = useState<BData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [saved,   setSaved]   = useState(false);
  const [error,   setPageError] = useState("");
  const [entryTime, setEntryTime] = useState<Date | null>(null);

  useEffect(() => {
    setEntryTime(new Date());
  }, []);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`/api/booth?booth=${boothNum}`);
      if (res.ok) {
        setData(await res.json());
      } else {
        const errJson = await res.json();
        setPageError(errJson.details || "Database connection error (Check MongoDB Atlas IP Whitelist)");
      }
    } catch { 
      setPageError("Unable to reach server. Please check your internet.");
    }
    finally { setLoading(false); }
  }, [boothNum]);

  useEffect(() => {
    if (!boothInfo) { router.push("/"); return; }
    fetchData();
  }, [boothInfo, fetchData, router]);

  const update = (path: string, val: SV | boolean | string | number) => {
    setData(prev => {
      if (!prev) return prev;
      const d = JSON.parse(JSON.stringify(prev));
      const parts = path.split(".");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let o: any = d;
      for (let i = 0; i < parts.length - 1; i++) o = o[parts[i]];
      o[parts[parts.length - 1]] = val;
      setSaved(false);
      return d;
    });
  };

  const handleSave = async () => {
    if (!data) return;
    setSaving(true);
    setPageError("");
    try {
      const res = await fetch("/api/booth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, booth: boothNum }),
      });
      if (res.ok) { 
        setSaved(true); 
        setTimeout(() => setSaved(false), 4000); 
      } else {
        const errJson = await res.json();
        setPageError(errJson.details || "Failed to save update");
      }
    } catch { 
      setPageError("Failed to connect to server");
    }
    finally { setSaving(false); }
  };

  if (!boothInfo) return null;

  const fmt = (d: Date | string | null) => d ? new Date(d).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true }) : "--:--";
  const fmtDate = (d: Date | string | null) => d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "---";

  const def: BData = {
    booth: boothNum, boothName: boothInfo.boothName, observer: boothInfo.observer,
    contact: boothInfo.contact, ward: boothInfo.ward || "",
    flex: { status: "", extraRequest: false }, poster: { status: "", extraRequest: false },
    round1: { status: "" }, round2: { status: "" }, round3: { status: "" },
    kudumbaYogamDate: "", expectedLead: 0, 
    adminComment: "",
    entryTime: entryTime?.toISOString() || "", lastUpdated: "",
  };

  const d = data || def;
  const tasks = [d.flex?.status, d.poster?.status, d.round1?.status, d.round2?.status, d.round3?.status];
  const done  = tasks.filter(t => t === "completed").length;
  const pct   = Math.round((done / tasks.length) * 100);
  const progColor = pct >= 80 ? "#22c55e" : pct >= 40 ? "#f59e0b" : "#3b82f6";

  const fpOpts: {val: SV; label: string}[] = [{ val: "pending", label: "Pending" }, { val: "partially", label: "Partially" }, { val: "completed", label: "Completed" }];
  const rnOpts: {val: SV; label: string}[] = [{ val: "started", label: "Started" }, { val: "partially", label: "Partially" }, { val: "completed", label: "Completed" }];

  return (
    <div className="booth-bg">
      {/* Nav */}
      <nav className="booth-nav">
        <button className="back-btn" onClick={() => router.push("/")} aria-label="back">←</button>
        <div className="nav-info">
          <div className="nav-booth">BOOTH {boothNum} — {boothInfo.boothName}</div>
          <div className="nav-time">{fmt(entryTime)} · {fmtDate(entryTime)}</div>
        </div>
        {saved && <span className="nav-saved">✓ Saved</span>}
      </nav>

      {/* Error Display */}
      {error && (
        <div style={{ margin: "14px 14px 0" }} className="entry-error">
          ⚠ ERROR: {error}
          <div style={{ fontSize: 10, marginTop: 4, opacity: 0.8 }}>
            (Check MongoDB Atlas Network Access and Vercel Environment Variables)
          </div>
        </div>
      )}

      {/* Observer card */}
      <div className="observer-card slide-up">
        <div className="observer-top">
          <div className="observer-avatar">👤</div>
          <div className="observer-info">
            <div className="observer-label">BOOTH OBSERVER</div>
            <div className="observer-name">{boothInfo.observer}</div>
            <div className="observer-booth-name">{boothInfo.boothName}</div>
            <div className="observer-tags">
              <span className="tag tag-blue">Booth #{boothNum}</span>
              {boothInfo.ward && <span className="tag tag-purple">{boothInfo.ward}</span>}
            </div>
          </div>
          <a href={`tel:${boothInfo.contact}`} className="call-btn" aria-label="call observer">📞</a>
        </div>
        {/* progress */}
        {!loading && (
          <div className="progress-wrap">
            <div className="progress-labels">
              <span className="progress-label-l">Task Progress</span>
              <span className="progress-label-r">{done}/{tasks.length} completed</span>
            </div>
            <div className="prog-bar">
              <div className="prog-fill" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${progColor}99, ${progColor})` }} />
            </div>
          </div>
        )}
      </div>

      {/* Tasks */}
      <div className="tasks-wrap">
        {loading ? (
          <>
            <div className="skeleton" style={{ height: 120 }} />
            <div className="skeleton" style={{ height: 120 }} />
            <div className="skeleton" style={{ height: 110 }} />
          </>
        ) : (
          <>
            {/* FLEX */}
            <TaskCard title="Flex" icon="🧩" status={d.flex?.status as SV} delay={60}>
              <div className="status-row">
                {fpOpts.map(o => <SBtn key={o.val} val={o.val} label={o.label} current={d.flex?.status as SV} onChange={v => update("flex.status", v)} />)}
              </div>
              <div className="extra-row">
                <button
                  className={`extra-toggle ${d.flex?.extraRequest ? "on" : ""}`}
                  onClick={() => update("flex.extraRequest", !d.flex?.extraRequest)}
                  aria-label="extra request"
                />
                <span className="extra-label">Extra Request</span>
                {d.flex?.extraRequest && <span style={{ fontSize: 11, color: "#fcd34d", marginLeft: 4 }}>⚡ Marked</span>}
              </div>
            </TaskCard>

            {/* POSTER */}
            <TaskCard title="1st Poster" icon="📋" status={d.poster?.status as SV} delay={110}>
              <div className="status-row">
                {fpOpts.map(o => <SBtn key={o.val} val={o.val} label={o.label} current={d.poster?.status as SV} onChange={v => update("poster.status", v)} />)}
              </div>
              <div className="extra-row">
                <button
                  className={`extra-toggle ${d.poster?.extraRequest ? "on" : ""}`}
                  onClick={() => update("poster.extraRequest", !d.poster?.extraRequest)}
                  aria-label="extra request"
                />
                <span className="extra-label">Extra Request</span>
                {d.poster?.extraRequest && <span style={{ fontSize: 11, color: "#fcd34d", marginLeft: 4 }}>⚡ Marked</span>}
              </div>
            </TaskCard>

            {/* ROUND 1 */}
            <TaskCard title="Round 1 (Abyarthana)" icon="1️⃣" status={d.round1?.status as SV} delay={160}>
              <p style={{ fontSize: 11, color: "var(--c-text3)", marginBottom: 10 }}>Squad work status for Round 1</p>
              <div className="status-row">
                {rnOpts.map(o => <SBtn key={o.val} val={o.val} label={o.label} current={d.round1?.status as SV} onChange={v => update("round1.status", v)} />)}
              </div>
            </TaskCard>

            {/* ROUND 2 */}
            <TaskCard title="Round 2" icon="2️⃣" status={d.round2?.status as SV} delay={200}>
              <p style={{ fontSize: 11, color: "var(--c-text3)", marginBottom: 10 }}>Squad work status for Round 2</p>
              <div className="status-row">
                {rnOpts.map(o => <SBtn key={o.val} val={o.val} label={o.label} current={d.round2?.status as SV} onChange={v => update("round2.status", v)} />)}
              </div>
            </TaskCard>

            {/* ROUND 3 */}
            <TaskCard title="Round 3" icon="3️⃣" status={d.round3?.status as SV} delay={230}>
              <p style={{ fontSize: 11, color: "var(--c-text3)", marginBottom: 10 }}>Squad work status for Round 3</p>
              <div className="status-row">
                {rnOpts.map(o => <SBtn key={o.val} val={o.val} label={o.label} current={d.round3?.status as SV} onChange={v => update("round3.status", v)} />)}
              </div>
            </TaskCard>

            {/* KUDUMBA YOGAM */}
            <TaskCard title="Kudumba Yogam" icon="📅" delay={260}>
              <input
                type="date"
                value={d.kudumbaYogamDate || ""}
                onChange={e => update("kudumbaYogamDate", e.target.value)}
                className="date-input"
              />
            </TaskCard>

            {/* EXPECTED LEAD */}
            <TaskCard title="Expected Lead" icon="📈" delay={280}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input
                  type="number"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={d.expectedLead || 0}
                  onChange={e => update("expectedLead", parseInt(e.target.value) || 0)}
                  className="date-input"
                  style={{ flex: 1, fontSize: 18, fontWeight: 700 }}
                  placeholder="0"
                />
                <div style={{ fontSize: 13, color: "var(--c-text3)", fontWeight: 700, paddingRight: 8 }}>VOTES</div>
                <button 
                  onClick={() => (document.activeElement as HTMLElement)?.blur()}
                  style={{ 
                    padding: "10px 14px", borderRadius: 10, background: "var(--c-surface3)", border: "1px solid var(--c-border)",
                    fontSize: 12, fontWeight: 700, color: "var(--c-text2)"
                  }}
                >Done</button>
              </div>
            </TaskCard>

            {/* ADMIN COMMENT */}
            <TaskCard title="Message to Admin" icon="💬" delay={300}>
               <textarea
                value={d.adminComment || ""}
                onChange={e => update("adminComment", e.target.value)}
                className="date-input"
                style={{ width: "100%", minHeight: "80px", fontSize: "14px", lineHeight: "1.5", resize: "none" }}
                placeholder="Type your message to admin here..."
              />
            </TaskCard>

            {d.lastUpdated && (
              <p style={{ fontSize: 11, color: "var(--c-text3)", textAlign: "center" }}>
                Last saved: {fmtDate(d.lastUpdated)} at {fmt(d.lastUpdated)}
              </p>
            )}
          </>
        )}
      </div>

      {/* Save bar */}
      <div className="save-bar">
        <button
          id="save-status-btn"
          className={`save-btn ${saved ? "save-btn-done" : ""}`}
          onClick={handleSave}
          disabled={saving || loading}
        >
          {saving
            ? <><span className="btn-spinner" /> Saving...</>
            : saved
              ? <>✓ Status Saved!</>
              : <>💾 Save Status Update</>
          }
        </button>
      </div>
    </div>
  );
}
