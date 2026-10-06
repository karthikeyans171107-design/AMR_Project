import React, { useState, useRef, useEffect } from 'react';
import { useAMR } from '../context/AMRContext';
import { Bot, Send, Sparkles, User } from 'lucide-react';

export default function AIAssistant() {
  const { aiMessages, sendAICommand } = useAMR();
  const [inputText, setInputText] = useState('');
  const chatEndRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    sendAICommand(inputText);
    setInputText('');
  };

  const handleQuickChip = (commandText) => {
    sendAICommand(commandText);
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [aiMessages]);

  return (
    <div className="bg-white rounded-2xl p-5 shadow-soft border border-slate-100 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-cyan-50 border border-cyan-100 flex items-center justify-center text-cyan-600">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-semibold text-slate-800 text-base leading-tight">AI Assistant</h2>
            <p className="text-xs text-slate-500">Autonomous Smart Telemetry</p>
          </div>
        </div>
        <span className="text-[11px] font-semibold text-cyan-700 bg-cyan-50 border border-cyan-100 px-2.5 py-0.5 rounded-full flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
          Online
        </span>
      </div>

      {/* Messages Scroll View */}
      <div className="flex-1 overflow-y-auto max-h-[220px] pr-1 space-y-2.5 my-2">
        {aiMessages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-2.5 ${
              msg.sender === 'user' ? 'flex-row-reverse' : ''
            }`}
          >
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs shrink-0 ${
                msg.sender === 'user'
                  ? 'bg-slate-800 text-white'
                  : 'bg-cyan-100 text-cyan-700'
              }`}
            >
              {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div
              className={`max-w-[82%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-slate-800 text-white rounded-tr-none'
                  : 'bg-slate-50 text-slate-800 border border-slate-100 rounded-tl-none font-medium'
              }`}
            >
              <div>{msg.text}</div>
              <div
                className={`text-[9px] mt-1 text-right ${
                  msg.sender === 'user' ? 'text-slate-400' : 'text-slate-400'
                }`}
              >
                {msg.time}
              </div>
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* Quick Action Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto py-1 mb-2 scrollbar-none">
        <button
          onClick={() => handleQuickChip('Go to Station B')}
          className="text-[11px] bg-slate-100 hover:bg-cyan-50 hover:text-cyan-700 text-slate-600 px-2.5 py-1 rounded-full whitespace-nowrap transition font-medium border border-slate-200/60"
        >
          🤖 "Go to Station B"
        </button>
        <button
          onClick={() => handleQuickChip('Stop robot')}
          className="text-[11px] bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-600 px-2.5 py-1 rounded-full whitespace-nowrap transition font-medium border border-slate-200/60"
        >
          🛑 "Stop robot"
        </button>
        <button
          onClick={() => handleQuickChip('Check battery')}
          className="text-[11px] bg-slate-100 hover:bg-cyan-50 hover:text-cyan-700 text-slate-600 px-2.5 py-1 rounded-full whitespace-nowrap transition font-medium border border-slate-200/60"
        >
          🔋 "Check battery"
        </button>
      </div>

      {/* Text Input Form */}
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Ask the robot..."
          className="flex-1 bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-cyan-500 font-medium placeholder-slate-400"
        />
        <button
          type="submit"
          className="bg-cyan-600 hover:bg-cyan-700 text-white p-2.5 rounded-xl shadow-sm transition active:scale-95 flex items-center justify-center"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
