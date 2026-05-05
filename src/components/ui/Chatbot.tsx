"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { MessageCircle, X, Send, Loader2, ShieldCheck } from "lucide-react";

interface Message { role: "user" | "assistant"; content: string; }

const CONTACT_MARKER = "[CONTACT_FORM]";

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function formatInline(text: string): string {
  return escapeHtml(text)
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/`([^`]+)`/g, '<code style="background:#f1f5f9;padding:1px 4px;border-radius:3px;font-family:monospace;font-size:11px">$1</code>');
}

function renderMarkdown(raw: string): string {
  const lines = raw.trim().split("\n");
  let html = "";
  let inUl = false;
  let inOl = false;

  const closeList = () => {
    if (inUl) { html += "</ul>"; inUl = false; }
    if (inOl) { html += "</ol>"; inOl = false; }
  };

  for (const line of lines) {
    const ulMatch = line.match(/^[-*•]\s+(.+)/);
    const olMatch = line.match(/^\d+\.\s+(.+)/);
    const headingMatch = line.match(/^#{1,3}\s+(.+)/);

    if (ulMatch) {
      if (inOl) { html += "</ol>"; inOl = false; }
      if (!inUl) { html += '<ul style="padding-left:16px;margin:4px 0;list-style:disc">'; inUl = true; }
      html += `<li style="margin-bottom:2px">${formatInline(ulMatch[1])}</li>`;
    } else if (olMatch) {
      if (inUl) { html += "</ul>"; inUl = false; }
      if (!inOl) { html += '<ol style="padding-left:16px;margin:4px 0;list-style:decimal">'; inOl = true; }
      html += `<li style="margin-bottom:2px">${formatInline(olMatch[1])}</li>`;
    } else {
      closeList();
      if (headingMatch) {
        html += `<strong style="display:block;margin-top:8px;margin-bottom:2px">${formatInline(headingMatch[1])}</strong>`;
      } else if (line.trim() === "") {
        html += '<div style="height:6px"></div>';
      } else {
        html += `<span style="display:block">${formatInline(line)}</span>`;
      }
    }
  }
  closeList();
  return html;
}

export default function Chatbot() {
  const [open, setOpen]         = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hi! I'm CyberBot, CyberNova's AI assistant. How can I help you with cybersecurity today?" },
  ]);
  const [input, setInput]   = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    const next: Message[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next.map((m) => ({ role: m.role, content: m.content })) }),
      });
      const data = await res.json();
      setMessages([...next, { role: "assistant", content: data.reply }]);
    } catch {
      setMessages([...next, { role: "assistant", content: "Sorry, I couldn't connect. Please try again." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {open && (
        <div className="w-80 bg-white border border-border rounded-2xl shadow-xl flex flex-col overflow-hidden" style={{ height: 440 }}>
          <div className="bg-navy-900 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-nova-400" />
              <span className="text-white text-sm font-semibold">CyberBot</span>
              <span className="text-white/40 text-xs">AI Assistant</span>
            </div>
            <button onClick={() => setOpen(false)} className="text-white/60 hover:text-white transition-colors">
              <X size={16} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-surface">
            {messages.map((m, i) => {
              const hasContactLink = m.role === "assistant" && m.content.includes(CONTACT_MARKER);
              const displayContent = m.content.replace(CONTACT_MARKER, "").trim();
              return (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className="max-w-[85%] flex flex-col gap-2">
                    <div
                      className={`text-sm px-3 py-2 rounded-xl leading-relaxed ${
                        m.role === "user"
                          ? "bg-nova-500 text-white rounded-br-sm"
                          : "bg-white border border-border text-navy-900 rounded-bl-sm"
                      }`}
                    >
                      {m.role === "user" ? (
                        displayContent
                      ) : (
                        <div dangerouslySetInnerHTML={{ __html: renderMarkdown(displayContent) }} />
                      )}
                    </div>
                    {hasContactLink && (
                      <Link
                        href="/contact"
                        className="self-start text-xs font-semibold bg-nova-500 hover:bg-nova-400 text-white px-3 py-1.5 rounded-lg transition-colors"
                        onClick={() => setOpen(false)}
                      >
                        Contact Security Team →
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-border rounded-xl rounded-bl-sm px-3 py-2">
                  <Loader2 size={14} className="text-nova-500 animate-spin" />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="p-3 bg-white border-t border-border flex gap-2">
            <input
              className="flex-1 text-sm border border-border rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-nova-500"
              placeholder="Ask about cybersecurity…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              disabled={loading}
            />
            <button
              onClick={send}
              disabled={loading || !input.trim()}
              className="p-2 bg-nova-500 hover:bg-nova-400 disabled:opacity-50 text-white rounded-lg transition-colors"
            >
              <Send size={14} />
            </button>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen((v) => !v)}
        className="w-12 h-12 bg-navy-900 hover:bg-navy-700 text-white rounded-full shadow-lg flex items-center justify-center transition-colors"
        aria-label="Open AI chat"
      >
        {open ? <X size={20} /> : <MessageCircle size={20} />}
      </button>
    </div>
  );
}
