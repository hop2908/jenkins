import React, { useState } from "react";

export default function Login({
  goRegister,
  onSuccess,
}: {
  goRegister: () => void;
  onSuccess: () => void;
}) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    const res = await fetch("http://54.253.9.71/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (!res.ok) {
      setMsg("❌ Sai tài khoản hoặc mật khẩu!");
      return;
    }

    // Giả lập token
    localStorage.setItem("token", username + "_token");
    setMsg("✅ Đăng nhập thành công!");

    setTimeout(() => onSuccess(), 500);
  }

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "90vh",
        background: "#f3f6fc",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <div
        style={{
          width: 360,
          padding: "32px 28px",
          background: "#fff",
          borderRadius: 12,
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
        }}
      >
        <h2 style={{ textAlign: "center", marginBottom: 20, color: "#1a73e8" }}>
          Đăng nhập
        </h2>

        <form
          onSubmit={handleLogin}
          style={{ display: "flex", flexDirection: "column", gap: 14 }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <label style={{ fontSize: 14, fontWeight: 500 }}>Username</label>
            <input
              placeholder="Nhập username..."
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{
                padding: 10,
                borderRadius: 8,
                border: "1px solid #d0d7de",
                outline: "none",
                fontSize: 15,
              }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <label style={{ fontSize: 14, fontWeight: 500 }}>Password</label>
            <input
              type="password"
              placeholder="Nhập mật khẩu..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                padding: 10,
                borderRadius: 8,
                border: "1px solid #d0d7de",
                outline: "none",
                fontSize: 15,
              }}
            />
          </div>

          <button
            type="submit"
            style={{
              marginTop: 10,
              padding: "10px 0",
              background: "#1a73e8",
              color: "white",
              border: "none",
              borderRadius: 8,
              fontSize: 16,
              cursor: "pointer",
              transition: "0.2s",
            }}
          >
            Đăng nhập
          </button>
        </form>

        {msg && (
          <p style={{ marginTop: 12, textAlign: "center", color: "#d32f2f" }}>
            {msg}
          </p>
        )}

        <p style={{ marginTop: 16, textAlign: "center", fontSize: 14 }}>
          Chưa có tài khoản?{" "}
          <button
            onClick={goRegister}
            style={{
              background: "none",
              border: "none",
              color: "#1a73e8",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            Đăng ký ngay
          </button>
        </p>
      </div>
    </div>
  );
}
