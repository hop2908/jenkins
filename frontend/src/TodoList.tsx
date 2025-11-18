import React, { useEffect, useState } from "react";

export default function TodoList({ logout }: { logout: () => void }) {
  const [health, setHealth] = useState("checking...");
  const [items, setItems] = useState<{ id: number; title: string }[]>([]);
  const [title, setTitle] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");

  async function refresh() {
    const h = await fetch("http://13.210.56.18/api/health")
      .then((r) => r.json())
      .catch(() => ({ status: "fail" }));
    setHealth(h.status ?? "fail");

    const it = await fetch("http://13.210.56.18/api/items")
      .then((r) => r.json())
      .catch(() => ({ items: [] }));
    setItems(it.items || []);
  }

  async function addItem(e: React.FormEvent) {
      const startEdit = (id: number, currentTitle: string) => {
    setEditingId(id);
    setEditTitle(currentTitle);
  };

  const saveEdit = async (id: number) => {
    if (!editTitle.trim()) return alert("Tiêu đề không được trống!");
    await fetch(`http://13.210.56.18/api/items/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: editTitle }),
    });
    setEditingId(null);
    setEditTitle("");
    refresh();
  };
  // XÓA

// SỬA
const updateItem = async (id: number) => {
  const newTitle = prompt("sửa:");
  if (!newTitle) return;

  await fetch(`http://13.210.56.18/api/items/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title: newTitle }),
  });

  refresh();
};

  const cancelEdit = () => {
    setEditingId(null);
    setEditTitle("");
  };
  
  const deleteItem = async (id: number) => {
    if (!confirm("Xóa todo này?")) return;
    await fetch(`http://13.210.56.18/api/items/${id}`, { method: "DELETE" });
    refresh();
  };
    e.preventDefault();
    if (!localStorage.getItem("token")) {
      alert("Bạn phải đăng nhập mới thêm được!");
      return;
    }
    if (!title.trim()) return;

    await fetch("http://13.210.56.18/api/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });

    setTitle("");
    refresh();
  }

  useEffect(() => {
    refresh();
  }, []);

  return (
    <div
      style={{
        maxWidth: 600,
        margin: "40px auto",
        padding: 20,
        background: "#fff",
        borderRadius: 12,
        boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h1 style={{ color: "#1a73e8" }}>Todo List</h1>
        <button
          onClick={logout}
          style={{
            padding: "6px 12px",
            borderRadius: 8,
            border: "none",
            background: "#d32f2f",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          Logout
        </button>
      </div>

      <p>
        Backend health: <b>{health}</b>
      </p>

      <form onSubmit={addItem} style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        <input
          placeholder="New item title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{
            flex: 1,
            padding: 10,
            borderRadius: 8,
            border: "1px solid #d0d7de",
            outline: "none",
            fontSize: 15,
          }}
        />
        <button
          type="submit"
          style={{
            padding: "10px 20px",
            borderRadius: 8,
            border: "none",
            background: "#1a73e8",
            color: "#fff",
            fontSize: 15,
            cursor: "pointer",
          }}
        >
          Add
        </button>
      </form>

      <ul style={{ listStyle: "none", padding: 0 }}>
        {items.map((i) => (
          <li
            key={i.id}
            style={{
              padding: 12,
              marginBottom: 8,
              background: "#f3f6fc",
              borderRadius: 8,
              boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
            }}
          >
            <b>#{i.id}</b>: {i.title}
          </li>
        ))}
      </ul>
    </div>
  );
}
