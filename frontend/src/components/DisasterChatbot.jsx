import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  User, 
  Send, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  X, 
  Mic, 
  MicOff, 
  Languages, 
  ChevronRight,
  Maximize2,
  Minimize2,
  Radio
} from 'lucide-react';
import { apiService } from '../services/api';

const VOICE_LANGUAGES = [
  { code: 'hi-IN', label: 'हिन्दी (Hindi)', langTag: 'hi' },
  { code: 'as-IN', label: 'অসমীয়া (Assamese)', langTag: 'as' },
  { code: 'bn-IN', label: 'বাংলা (Bengali)', langTag: 'bn' },
  { code: 'en-IN', label: 'English (India)', langTag: 'en' },
  { code: 'ne-NP', label: 'नेपाली (Nepali)', langTag: 'hi' }
];

const QUICK_PROMPTS = [
  "Is NH-10 to Gangtok open and safe?",
  "Status of NH-29 Dimapur ↔ Kohima",
  "I see a road crack on the highway. What to do?",
  "Emergency SDRF & NDRF helpline numbers",
  "Why do hills collapse in heavy rain?"
];

export default function DisasterChatbot({ 
  scenario = "cloudburst_monsoon", 
  isOpen, 
  onClose, 
  onNavigateTab,
  onOpenReportModal 
}) {
  const [messages, setMessages] = useState([
    {
      sender: "ai",
      title: "24/7 AI Voice Disaster Guide",
      text: "👋 **Hello! Namaste!**\n\nYou can **SPEAK in Hindi, Assamese, Bengali, or English** by tapping the microphone button below. I will listen to your voice and speak the safety instructions aloud.",
      suggested_actions: ["Check NH-10 Status", "Check NH-29 Status", "Emergency Contacts"],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [speakingIndex, setSpeakingIndex] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);

  // Voice Speech Recognition states
  const [isListening, setIsListening] = useState(false);
  const [selectedVoiceLang, setSelectedVoiceLang] = useState('hi-IN');
  const [speechSupported, setSpeechSupported] = useState(true);
  const recognitionRef = useRef(null);

  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Setup Web Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = selectedVoiceLang;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      if (transcript) {
        setInput(transcript);
        handleSend(transcript, true); // Auto-send and auto-speak answer!
      }
    };

    recognition.onerror = (err) => {
      console.warn("Speech recognition error:", err);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
  }, [selectedVoiceLang]);

  // Toggle Voice Recording
  const handleToggleVoice = () => {
    if (!recognitionRef.current) {
      alert("Voice recognition is not supported in this browser. Please use Chrome, Edge, or Brave.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      // Stop any existing speech synthesis before listening
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
      setSpeakingIndex(null);
      recognitionRef.current.lang = selectedVoiceLang;
      recognitionRef.current.start();
    }
  };

  // Speak AI answer aloud (TTS)
  const speakText = (text, langCode = 'hi-IN', messageIndex = null) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      if (speakingIndex === messageIndex && messageIndex !== null) {
        setSpeakingIndex(null);
        return;
      }

      // Strip markdown symbols for natural voice
      const cleanText = text.replace(/[*_#`~>]/g, '');
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = langCode || selectedVoiceLang;
      utterance.rate = 0.92; // Clear, deliberate pace for emergency clarity
      utterance.pitch = 1.0;

      utterance.onend = () => setSpeakingIndex(null);
      utterance.onerror = () => setSpeakingIndex(null);

      if (messageIndex !== null) setSpeakingIndex(messageIndex);
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSend = async (textToSend, autoSpeak = false) => {
    const query = textToSend || input;
    if (!query.trim()) return;

    const userMsg = {
      sender: "user",
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const res = await apiService.askChatbot(query, scenario);
      const aiMsg = {
        sender: "ai",
        title: res.title || "Voice Assistant",
        text: res.answer,
        lang: res.lang || "en",
        suggested_actions: res.suggested_actions || [],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      setMessages(prev => {
        const nextMsgs = [...prev, aiMsg];
        // If query came from voice microphone, automatically speak the answer aloud for illiterate users!
        if (autoSpeak) {
          const voiceLang = res.lang === 'hi' ? 'hi-IN' : res.lang === 'as' ? 'as-IN' : res.lang === 'bn' ? 'bn-IN' : 'en-IN';
          setTimeout(() => speakText(res.answer, voiceLang, nextMsgs.length - 1), 200);
        }
        return nextMsgs;
      });

    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleActionClick = (action) => {
    const a = action.toLowerCase();
    if (a.includes("bypass") || a.includes("route") || a.includes("evacuation")) {
      if (onNavigateTab) onNavigateTab("ROUTING");
      if (onClose) onClose();
    } else if (a.includes("report") || a.includes("crack") || a.includes("scanner") || a.includes("obstruction")) {
      if (onOpenReportModal) onOpenReportModal();
      if (onClose) onClose();
    } else if (a.includes("siren") || a.includes("alert") || a.includes("warning")) {
      if (onNavigateTab) onNavigateTab("ALERTS");
      if (onClose) onClose();
    } else if (a.includes("sms") || a.includes("terminal")) {
      if (onNavigateTab) onNavigateTab("OFFLINE");
      if (onClose) onClose();
    } else {
      handleSend(action);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed z-50 transition-all duration-300 ${
      isExpanded 
        ? 'inset-4 md:inset-10' 
        : 'bottom-4 right-4 w-[95vw] sm:w-[470px] h-[640px] max-h-[92vh]'
    } bg-slate-950/95 backdrop-blur-xl border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden`}>
      
      {/* Header */}
      <div className="p-3.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 via-indigo-500 to-red-500 p-0.5 flex items-center justify-center shadow-md">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Bot className="w-4 h-4 text-sky-400 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-bold text-xs text-white">24/7 Voice & Multilingual Assistant</h3>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            </div>
            <p className="text-[10px] text-slate-400">Speak in Hindi, Assamese, Bengali, or English</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Language Selector */}
          <div className="flex items-center gap-1 bg-slate-950 px-2 py-1 rounded-lg border border-slate-800 text-[11px]">
            <Languages className="w-3.5 h-3.5 text-sky-400" />
            <select
              value={selectedVoiceLang}
              onChange={(e) => setSelectedVoiceLang(e.target.value)}
              className="bg-transparent text-slate-200 font-semibold focus:outline-none cursor-pointer"
            >
              {VOICE_LANGUAGES.map(l => (
                <option key={l.code} value={l.code} className="bg-slate-900 text-slate-200">
                  {l.label}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
            title={isExpanded ? "Collapse" : "Expand"}
          >
            {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
          
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs font-sans">
        
        {messages.map((m, idx) => (
          <div 
            key={idx} 
            className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'} space-y-1`}
          >
            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 px-1">
              {m.sender === 'user' ? (
                <>
                  <span>You</span>
                  <span>•</span>
                  <span>{m.timestamp}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3 h-3 text-sky-400" />
                  <span className="font-bold text-sky-400">{m.title}</span>
                  <span>•</span>
                  <span>{m.timestamp}</span>
                </>
              )}
            </div>

            <div 
              className={`max-w-[90%] p-3.5 rounded-2xl ${
                m.sender === 'user'
                  ? 'bg-sky-600 text-white rounded-br-none shadow-md'
                  : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-none shadow-lg'
              }`}
            >
              <div className="whitespace-pre-line leading-relaxed text-[12px]">
                {m.text}
              </div>

              {/* AI Message Footer: Audio Voice Readout */}
              {m.sender === 'ai' && (
                <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => speakText(m.text, m.lang === 'hi' ? 'hi-IN' : m.lang === 'as' ? 'as-IN' : 'en-IN', idx)}
                      className="text-[11px] font-bold text-sky-400 hover:text-sky-300 flex items-center gap-1.5 bg-sky-950/60 px-2.5 py-1 rounded-lg border border-sky-500/30 transition-colors shadow-sm"
                    >
                      {speakingIndex === idx ? (
                        <>
                          <VolumeX className="w-3.5 h-3.5 text-red-400" /> Stop Voice
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3.5 h-3.5 text-sky-400" /> 🔊 Listen to Answer
                        </>
                      )}
                    </button>
                  </div>

                  {m.suggested_actions && m.suggested_actions.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {m.suggested_actions.map((act, i) => (
                        <button
                          key={i}
                          onClick={() => handleActionClick(act)}
                          className="px-2 py-1 rounded-md bg-slate-950 hover:bg-sky-950 border border-slate-800 hover:border-sky-500 text-[10px] font-semibold text-slate-300 hover:text-sky-200 flex items-center gap-1 transition-all"
                        >
                          <ChevronRight className="w-2.5 h-2.5 text-sky-400" />
                          {act}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-xs text-sky-400 bg-slate-900/80 border border-slate-800 p-3 rounded-2xl rounded-bl-none max-w-[75%] animate-pulse">
            <Bot className="w-4 h-4 animate-spin" />
            <span>Processing your question in {selectedVoiceLang}...</span>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Voice Listening Waveform Banner (Active when User is Speaking) */}
      {isListening && (
        <div className="bg-gradient-to-r from-red-600 to-indigo-600 px-4 py-2 flex items-center justify-between text-white text-xs font-bold animate-pulse">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 animate-ping" />
            <span>Listening to your voice... Speak your question now!</span>
          </div>
          <button
            onClick={handleToggleVoice}
            className="px-2 py-0.5 bg-black/40 rounded border border-white/40 text-[11px]"
          >
            Done Speaking
          </button>
        </div>
      )}

      {/* Suggested Quick Question Prompts */}
      <div className="px-3 py-2 bg-slate-900/60 border-t border-slate-800/80 shrink-0 overflow-x-auto">
        <div className="flex items-center gap-1.5 whitespace-nowrap">
          <span className="text-[10px] text-slate-500 uppercase font-bold shrink-0">Quick Queries:</span>
          {QUICK_PROMPTS.map((q, i) => (
            <button
              key={i}
              onClick={() => handleSend(q)}
              className="px-2.5 py-1 rounded-full bg-slate-950 border border-slate-800 hover:border-sky-500 text-[11px] text-slate-300 hover:text-sky-300 transition-all shrink-0"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Input Box with Voice Mic */}
      <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="p-3 bg-slate-900 border-t border-slate-800 flex items-center gap-2 shrink-0">
        
        {/* Big Voice Microphone Button */}
        <button
          type="button"
          onClick={handleToggleVoice}
          className={`p-2.5 rounded-xl text-white font-bold transition-all shadow-lg flex items-center justify-center shrink-0 ${
            isListening 
              ? 'bg-red-500 hover:bg-red-600 animate-bounce shadow-red-500/50 scale-110' 
              : 'bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-500 hover:to-sky-500 shadow-indigo-900/30'
          }`}
          title="Tap to Speak (Voice Input)"
        >
          {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>

        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={isListening ? "Listening... speak now" : "Speak into mic or type your question..."}
          className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
        />

        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="p-2.5 bg-sky-600 hover:bg-sky-500 disabled:opacity-40 disabled:hover:bg-sky-600 text-white rounded-xl shadow-lg shadow-sky-900/30 transition-all shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>

    </div>
  );
}
