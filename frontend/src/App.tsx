import React, { useState } from "react";
import Login from "./Login";
import Register from "./Register";
import TodoList from "./TodoList";

export default function App() {
  const [screen, setScreen] = useState<"login" | "register" | "todo">(
    localStorage.getItem("token") ? "todo" : "login"
  );

  function onLoginSuccess() {
    setScreen("todo");
  }

  return (
    <div style={{ maxWidth: 600, margin: "40px auto", fontFamily: "system-ui" }}>
      {screen === "login" && (
        <Login goRegister={() => setScreen("register")} onSuccess={onLoginSuccess} />
      )}

      {screen === "register" && (
        <Register goLogin={() => setScreen("login")} />
      )}

      {screen === "todo" && (
        <TodoList logout={() => {
          localStorage.removeItem("token");
          setScreen("login");
        }} />
      )}
    </div>
  );
}
