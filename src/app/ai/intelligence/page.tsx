'use client';

import React, { useState } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  Zap,
  CheckCircle2,
  ArrowRight,
  Search,
  Dna,
  FileText,
} from 'lucide-react';
import { ProvenanceBadge } from '@/components/provenance/ProvenanceBadge';

interface AgentMessage {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  timestamp: string;
  actionLinks?: Array<{ label: string; href: string }>;
  provenance?: 'AI_DERIVED' | 'INTERNAL_METRIC' | 'YOUTUBE_API';
}

const INITIAL_MESSAGES: AgentMessage[] = [
  {
    id: 'msg-1',
    sender: 'agent',
    text: 'I am VYRAL Intelligence. I can orchestrate channel research, detect baseline outliers, synthesize channel DNA, and draft content blueprints. How can I assist your channel today?',
    timestamp: 'Just now',
    actionLinks: [
      { label: 'Find Outliers in My Niche', href: '/discover/outliers' },
      { label: 'Analyze Competitor DNA', href: '/intelligence/channels' },
      { label: 'Generate 8 Video Concepts', href: '/create/ideas' },
    ],
  },
];

export default function VyralIntelligencePage() {
  const [messages, setMessages] = useState<AgentMessage[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg: AgentMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: input.trim(),
      timestamp: 'Just now',
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setThinking(true);

    setTimeout(() => {
      const agentMsg: AgentMessage = {
        id: `a-${Date.now()}`,
        sender: 'agent',
        text: `I analyzed the pattern for "${userMsg.text}". In this niche, videos that cold-open with an anomalous timestamp and use high-contrast monolithic thumbnails achieve an average 4.6× multiplier over the standard 30-day baseline. I have prepared an original content blueprint and 3 title candidates for you.`,
        timestamp: 'Just now',
        provenance: 'AI_DERIVED',
        actionLinks: [
          { label: 'Open in Script Studio', href: '/create/scripts' },
          { label: 'Evaluate Titles in Title Lab', href: '/optimize/titles' },
        ],
      };
      setMessages((prev) => [...prev, agentMsg]);
      setThinking(false);
    }, 1000);
  };

  return (
    <div className="space-y-6 pb-12 flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="bg-[#12141c] border border-zinc-800/80 rounded-2xl p-5 shadow-xl flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-600/20">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white flex items-center gap-2">
              <span>VYRAL Intelligence Co-Pilot</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                ACTIVE
              </span>
            </h1>
            <p className="text-xs text-zinc-400">
              Autonomous YouTube research, competitor surveillance, and content architecture agent
            </p>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 bg-[#12141c] border border-zinc-800/80 rounded-2xl p-5 shadow-xl overflow-y-auto space-y-4">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-2xl p-4 rounded-2xl text-xs leading-relaxed space-y-3 ${
                m.sender === 'user'
                  ? 'bg-indigo-600 text-white rounded-br-none'
                  : 'bg-[#0b0c12] border border-zinc-800 text-zinc-200 rounded-bl-none shadow-md'
              }`}
            >
              <div className="flex items-center justify-between gap-4">
                <span className="font-semibold text-[11px] text-zinc-400">
                  {m.sender === 'user' ? 'You' : 'VYRAL Intelligence'}
                </span>
                {m.provenance && <ProvenanceBadge provenance={m.provenance} />}
              </div>

              <p className="whitespace-pre-wrap">{m.text}</p>

              {m.actionLinks && (
                <div className="flex flex-wrap gap-2 pt-2 border-t border-zinc-800/80">
                  {m.actionLinks.map((link, idx) => (
                    <a
                      key={idx}
                      href={link.href}
                      className="px-2.5 py-1 bg-zinc-800/80 hover:bg-zinc-700 text-indigo-300 rounded font-medium text-[11px] inline-flex items-center space-x-1 transition-colors border border-zinc-700/60"
                    >
                      <span>{link.label}</span>
                      <ArrowRight className="w-3 h-3" />
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {thinking && (
          <div className="flex items-center space-x-2 text-xs text-indigo-400 p-2">
            <Sparkles className="w-4 h-4 animate-spin" />
            <span>VYRAL Intelligence is evaluating patterns across channel baselines...</span>
          </div>
        )}
      </div>

      {/* Input Bar */}
      <form onSubmit={handleSend} className="shrink-0 flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask VYRAL: 'Find 5 competitor outliers in true crime', 'What is the hook formula for @veritasium'..."
          className="flex-1 px-4 py-3 bg-[#12141c] border border-zinc-700/80 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-xl"
        />
        <button
          type="submit"
          disabled={thinking || !input.trim()}
          className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-medium flex items-center space-x-1.5 transition-all shadow-md shadow-indigo-600/20 disabled:opacity-50 cursor-pointer shrink-0"
        >
          <span>Send</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
}
