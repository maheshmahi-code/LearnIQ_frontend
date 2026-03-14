import React, { useState, useRef, useEffect } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { streamDoubtSolver } from '../services/aiService';
import { aiAPI } from '../services/apiService';

export default function ChatBotUI({ conversationId, initialMessages = [] }) {
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState('');
  const [subject, setSubject] = useState('General');
  const [loading, setLoading] = useState(false);
  const [voiceActive, setVoiceActive] = useState(false);
  const bottomRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (initialMessages && initialMessages.length > 0) {
      setMessages(initialMessages);
    } else {
      setMessages([]);
    }
  }, [initialMessages, conversationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async () => {
    const q = input.trim();
    if (!q && !loading) return;

    setMessages((m) => [...m, { role: 'user', content: q }]);
    setInput('');
    setLoading(true);

    try {
      let full = '';
      await streamDoubtSolver(
        { question: q, subject, conversationId },
        (chunk) => {
          full += chunk;
          setMessages((m) => {
            const last = m[m.length - 1];
            if (last?.role === 'assistant') {
              return [...m.slice(0, -1), { ...last, content: full }];
            }
            return [...m, { role: 'assistant', content: full }];
          });
        }
      );
    } catch (e) {
      setMessages((m) => [...m, { role: 'assistant', content: e.message || 'Sorry, an error occurred. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  const startVoice = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('Voice input not supported');
      return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const rec = new SpeechRecognition();
    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = 'en-US';
    rec.onresult = (e) => {
      const t = e.results[0][0].transcript;
      setInput((i) => i + ' ' + t);
      setVoiceActive(false);
    };
    rec.onend = () => setVoiceActive(false);
    rec.start();
    setVoiceActive(true);
    recognitionRef.current = rec;
  };

  const renderContent = (content) => {
    if (!content) return null;
    const codeBlocks = content.match(/```[\s\S]*?```/g) || [];
    let rest = content;
    const parts = [];
    codeBlocks.forEach((block, i) => {
      const idx = rest.indexOf(block);
      if (idx > 0) parts.push({ type: 'text', value: rest.slice(0, idx) });
      parts.push({ type: 'code', value: block.replace(/```\w?\n?|\n?```/g, '') });
      rest = rest.slice(idx + block.length);
    });
    if (rest) parts.push({ type: 'text', value: rest });

    return parts.map((p, i) =>
      p.type === 'code' ? (
        <SyntaxHighlighter key={i} language="javascript" style={oneDark} className="rounded my-2 text-sm !bg-gray-800">
          {p.value}
        </SyntaxHighlighter>
      ) : (
        <p key={i} className="whitespace-pre-wrap">
          {p.value}
        </p>
      )
    );
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white text-xs font-black">AI</div>
          <div>
             <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Active Context</p>
             <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="bg-transparent font-bold text-gray-800 dark:text-white outline-none text-sm -ml-1 cursor-pointer hover:text-primary transition-colors"
              >
                {['Math', 'Science', 'English', 'Coding', 'History', 'General'].map((s) => (
                  <option key={s} value={s} className="dark:bg-gray-800">{s} Expert</option>
                ))}
              </select>
          </div>
        </div>
        <div className="flex gap-2 text-[10px] font-black uppercase text-gray-400">
           {conversationId ? 'Syncing Chat' : 'Fresh Session'}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl p-4 shadow-sm ${
                msg.role === 'user'
                  ? 'bg-primary text-white rounded-tr-none'
                  : 'bg-gray-100 dark:bg-gray-800 dark:text-gray-200 rounded-tl-none'
              }`}
            >
              {renderContent(msg.content)}
            </div>
          </div>
        ))}
        {loading && messages[messages.length - 1]?.role === 'user' && (
          <div className="flex justify-start">
            <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl px-6 py-3 animate-pulse text-gray-400">
               Assistant is thinking...
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="p-4 border-t dark:border-gray-800 bg-white dark:bg-gray-900 flex gap-3">
        <button
          onClick={startVoice}
          className={`p-3 rounded-xl transition-all ${voiceActive ? 'bg-red-500 text-white animate-pulse' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}
          title="Voice input"
        >
          🎤
        </button>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
          placeholder="Ask a question or explain your doubt..."
          className="flex-1 rounded-xl border-none bg-gray-100 dark:bg-gray-800 px-5 py-3 dark:text-white focus:ring-2 focus:ring-primary transition-all"
        />
        <button
          onClick={send}
          disabled={loading || !input.trim()}
          className="bg-primary text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
        >
          Send
        </button>
      </div>
    </div>
  );
}
