import { useState, useRef, useEffect } from "react";
import api from "../api/axios";

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hi! I'm the ShopMyUniform support assistant. Ask me about products, sizes, delivery, orders, or returns." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = { role: "user", content: input };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const history = newMessages.slice(1, -1).map((m) => ({ role: m.role, content: m.content }));
      const { data } = await api.post("/ai/chat", { message: userMsg.content, history });
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, I ran into an error reaching the support system. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-widget-container">
      {open && (
        <div className="chat-window">
          <div className="chat-header">
            <span>Support Assistant</span>
            <button className="link-btn" onClick={() => setOpen(false)}>✕</button>
          </div>
          <div className="chat-body" ref={scrollRef}>
            {messages.map((m, idx) => (
              <div key={idx} className={`chat-msg ${m.role}`}>{m.content}</div>
            ))}
            {loading && <div className="chat-msg assistant">Thinking...</div>}
          </div>
          <form className="chat-input-row" onSubmit={sendMessage}>
            <input
              placeholder="Ask about products, sizes, orders..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
            />
            <button type="submit" className="btn" disabled={loading}>Send</button>
          </form>
        </div>
      )}
      <button className="chat-fab" onClick={() => setOpen((o) => !o)}>
        {open ? "✕" : "💬"}
      </button>
    </div>
  );
}