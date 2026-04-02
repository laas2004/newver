"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import styles from "./chat.module.css";

type Citation = {
  content: string;
  source: string;
};

type ChatResponse = {
  answer: string;
  domain: string;
  citations?: Citation[];
};

type Message = {
  role: "user" | "assistant";
  content: string;
  citations?: Citation[];
};

function generateUserId() {
  if (typeof window === "undefined") {
    return "anonymous";
  }

  const existing = window.localStorage.getItem("pragya_user_id");
  if (existing) return existing;

  const generated = crypto.randomUUID();
  window.localStorage.setItem("pragya_user_id", generated);
  return generated;
}

export default function ChatPage() {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const userId = useMemo(() => generateUserId(), []);

  const chatHistory = useMemo(
    () =>
      messages
        .filter((m) => m.role === "user")
        .map((m) => m.content.slice(0, 48)),
    [messages]
  );

  const sendMessage = async (message: string): Promise<ChatResponse> => {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-user-role": localStorage.getItem("userRole") || "",
        "x-user-domain": localStorage.getItem("userDomain") || "",
      },
      body: JSON.stringify({ message }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Request failed.");
    }

    return data;
  };

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!question.trim()) return;

    setIsLoading(true);
    setError("");

    const userMessage: Message = { role: "user", content: question };
    setMessages((prev) => [...prev, userMessage]);

    try {
      const payload = await sendMessage(userMessage.content);

      const assistantMessage: Message = {
        role: "assistant",
        content: `[Domain: ${payload.domain}]\n\n${payload.answer}`,
        citations: payload.citations || [],
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setQuestion("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Chat failed.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className={styles.shell}>
      <aside className={styles.rail}>
        <div className={styles.railHead}>
          <h2 className={styles.brand}>Pragya</h2>
          <Link href="/" className="ghost-btn">
            Exit
          </Link>
        </div>

        <button
          type="button"
          className={styles.newChat}
          onClick={() => setMessages([])}
        >
          + New chat
        </button>

        <div className={styles.history}>
          <p className={styles.historyLabel}>Recent prompts</p>
          {chatHistory.length === 0 && (
            <p className="muted">No prompts yet.</p>
          )}
          {chatHistory.map((item, i) => (
            <button
              key={i}
              type="button"
              className={styles.historyItem}
              onClick={() => setQuestion(item)}
            >
              {item}
            </button>
          ))}
        </div>
      </aside>

      <div className={styles.main}>
        <header className={styles.mainHead}>
          <h3>AI Assistant</h3>
          <p>Domain-routed answers from citizen, HR and company law</p>
        </header>

        <div className={styles.stream}>
          {messages.length === 0 && (
            <div className={styles.empty}>
              <h4>How can Pragya help today?</h4>
              <p>Ask a legal question.</p>
            </div>
          )}

          {messages.map((msg, i) => (
            <article
              key={i}
              className={`${styles.row} ${
                msg.role === "user"
                  ? styles.rowUser
                  : styles.rowAssistant
              }`}
            >
              <div className={styles.avatar}>
                {msg.role === "user" ? "U" : "P"}
              </div>
              <div className={styles.card}>
                <strong>{msg.role === "user" ? "You" : "Pragya"}</strong>
                <p>{msg.content}</p>

                {/* ✅ Citations UI */}
                {msg.role === "assistant" &&
                  msg.citations &&
                  msg.citations.length > 0 && (
                    <div className="mt-2 text-xs text-gray-500">
                      Sources:
                      {msg.citations.map((c, i) => (
                        <span
                          key={i}
                          className="ml-2 bg-gray-100 px-2 py-1 rounded"
                        >
                          {c.source || "Document"}
                        </span>
                      ))}
                    </div>
                  )}
              </div>
            </article>
          ))}
        </div>

        <form className={styles.compose} onSubmit={onSubmit}>
          <textarea
            className={styles.textarea}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Message Pragya"
            rows={3}
          />

          <div className={styles.bottom}>
            <button
              type="submit"
              disabled={isLoading}
              className={styles.send}
            >
              {isLoading ? "Thinking..." : "Send"}
            </button>
          </div>

          {error && <p className={styles.error}>{error}</p>}
        </form>
      </div>
    </section>
  );
}