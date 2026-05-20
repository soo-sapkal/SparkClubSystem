// frontend/src/pages/AIAssistantPage.jsx
import { useEffect, useState, useRef } from 'react';
import { aiAPI } from '../services/api';
import { Bot, Send, User, Sparkles, TrendingUp, HelpCircle } from 'lucide-react';

export default function AIAssistantPage() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hi there! I am SparkBot, your AI financial co-pilot. How can I help you optimize SparkClub\'s budgets or review transactions today?' }
  ]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(true);
  
  const bottomRef = useRef(null);

  async function loadSuggestions() {
    try {
      const { data } = await aiAPI.suggestions();
      setSuggestions(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingSuggestions(false);
    }
  }

  useEffect(() => {
    loadSuggestions();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  async function handleSend(e) {
    if (e) e.preventDefault();
    if (!input.trim() || sending) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setSending(true);

    try {
      // pass history except first greeting
      const history = messages.slice(1);
      const { data } = await aiAPI.chat(userMsg, history);
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I couldn\'t process that request right now. Please ensure the backend server has a valid Anthropic API key configured.' }]);
    } finally {
      setSending(false);
    }
  }

  function handleSuggestionClick(text) {
    setInput(text);
  }

  function getSuggestionColor(type) {
    switch (type) {
      case 'warning':      return 'border-red-900/60 bg-red-950/20 text-red-200';
      case 'optimize':     return 'border-blue-900/60 bg-blue-950/20 text-blue-200';
      case 'opportunity':  return 'border-emerald-900/60 bg-emerald-950/20 text-emerald-200';
      default:             return 'border-slate-800 bg-slate-900/40 text-slate-300';
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-3rem)] overflow-hidden">
      {/* Chat pane */}
      <div className="lg:col-span-2 card p-0 flex flex-col h-full bg-slate-900 border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 bg-spark-500/20 text-spark-400 rounded-xl flex items-center justify-center">
            <Bot size={22} />
          </div>
          <div>
            <h2 className="font-bold text-slate-200">SparkBot Copilot</h2>
            <p className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Claude AI Assistant Online
            </p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.map((m, i) => {
            const isBot = m.role === 'assistant';
            return (
              <div key={i} className={`flex gap-3 max-w-[85%] ${isBot ? '' : 'ml-auto flex-row-reverse'}`}>
                <div className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center text-xs font-bold ${
                  isBot ? 'bg-spark-500/20 text-spark-400' : 'bg-slate-800 text-slate-300'
                }`}>
                  {isBot ? <Bot size={16} /> : <User size={16} />}
                </div>
                <div className={`rounded-xl p-3.5 text-sm leading-relaxed ${
                  isBot ? 'bg-slate-950/60 border border-slate-800 text-slate-300' : 'bg-spark-600 text-white font-medium'
                }`}>
                  <p className="whitespace-pre-wrap">{m.content}</p>
                </div>
              </div>
            );
          })}
          {sending && (
            <div className="flex gap-3 max-w-[85%]">
              <div className="w-8 h-8 rounded-lg bg-spark-500/20 text-spark-400 flex items-center justify-center">
                <Bot size={16} />
              </div>
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5 text-sm text-slate-500 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" />
                <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="p-4 border-t border-slate-800/80 bg-slate-950/20 flex gap-2">
          <input
            type="text"
            className="input flex-1"
            placeholder="Ask about overspending, budget allocations, cash flow projections..."
            value={input}
            onChange={e => setInput(e.target.value)}
            disabled={sending}
          />
          <button type="submit" className="btn-primary p-2.5 rounded-lg flex items-center justify-center shrink-0" disabled={sending}>
            <Send size={18} />
          </button>
        </form>
      </div>

      {/* Side suggestions panel */}
      <div className="card flex flex-col h-full bg-slate-900 border-slate-800 overflow-hidden space-y-4 p-5">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
          <Sparkles className="text-yellow-400" size={18} />
          <h3 className="font-bold text-slate-200">Financial Insights</h3>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {loadingSuggestions ? (
            <div className="text-slate-500 text-sm py-4">Generating smart budget suggestions...</div>
          ) : suggestions.map((s, i) => (
            <div key={i} className={`p-4 border rounded-xl space-y-2 hover:border-slate-700 transition-colors ${getSuggestionColor(s.type)}`}>
              <h4 className="font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp size={12} />
                {s.title}
              </h4>
              <p className="text-xs leading-relaxed opacity-90">{s.suggestion}</p>
            </div>
          ))}

          {!loadingSuggestions && !suggestions.length && (
            <div className="text-slate-500 text-xs py-4 text-center">
              No immediate system warnings or optimization opportunities detected.
            </div>
          )}

          {/* Quick prompts */}
          <div className="pt-4 border-t border-slate-800/80 space-y-3">
            <h4 className="text-xs font-semibold text-slate-400">Quick Prompt Suggestions</h4>
            <div className="space-y-2">
              {[
                'How is our cash flow looking?',
                'Which categories are close to exceeding their budget?',
                'Are there any pending funding requests?'
              ].map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSuggestionClick(q)}
                  className="w-full text-left p-2.5 bg-slate-950/40 hover:bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-400 hover:text-slate-200 transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
