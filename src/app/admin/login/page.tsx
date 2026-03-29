"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const auth = localStorage.getItem("admin_auth");
      if (auth === "true") router.push("/admin/dashboard");
    }
  }, [router]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (username.trim() === "admin" && password === "password") {
      setLoading(true);
      if (typeof window !== "undefined") localStorage.setItem("admin_auth", "true");
      router.push("/admin/dashboard");
    } else {
      setError("Invalid username or password");
    }
  };

  return (
    <div className="login-bg">
      <button
        onClick={() => router.push("/")}
        style={{ position: "absolute", top: 16, left: 16, background: "none", border: "1px solid var(--c-border)", color: "var(--c-text3)", padding: "6px 14px", borderRadius: 100, fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}
      >
        ← Back
      </button>

      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 14px", borderRadius: 100, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#fca5a5", fontSize: 11, fontWeight: 700, letterSpacing: 1, marginBottom: 20 }}>
          🔒 ADMIN ACCESS ONLY
        </div>
      </div>

      <div className="login-card">
        <div className="login-icon">🔐</div>
        <div className="login-title">Admin Portal</div>
        <div className="login-sub">UDF Booth Observation Management</div>

        <form className="login-form" onSubmit={handleLogin}>
          <div>
            <label className="field-label" htmlFor="admin-username">USERNAME</label>
            <input
              id="admin-username"
              type="text"
              autoComplete="username"
              className="login-input"
              placeholder="Enter username"
              value={username}
              onChange={e => { setUsername(e.target.value); setError(""); }}
            />
          </div>
          <div>
            <label className="field-label" htmlFor="admin-password">PASSWORD</label>
            <input
              id="admin-password"
              type="password"
              autoComplete="current-password"
              className="login-input"
              placeholder="Enter password"
              value={password}
              onChange={e => { setPassword(e.target.value); setError(""); }}
            />
          </div>
          {error && <div className="login-error">⚠ {error}</div>}
          <button id="admin-login-btn" type="submit" className="login-btn" disabled={loading}>
            {loading ? <span className="btn-spinner" /> : "Login to Admin Panel"}
          </button>
        </form>
      </div>

      <p style={{ fontSize: 11, color: "var(--c-text3)", marginTop: 24, textAlign: "center" }}>Authorized personnel only</p>
    </div>
  );
}
