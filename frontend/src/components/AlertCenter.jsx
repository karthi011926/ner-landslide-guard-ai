import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, MessageSquare, Radio, Globe, BellRing, Play, Square, ShieldAlert } from 'lucide-react';
import { apiService } from '../services/api';

export default function AlertCenter({ targetLocation, severity = "SEVERE" }) {
  const [alertData, setAlertData] = useState(null);
  const [selectedLang, setSelectedLang] = useState('as'); // Assamese default for NER
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isSirenOn, setIsSirenOn] = useState(false);
  const [sirenAudioCtx, setSirenAudioCtx] = useState(null);

  // Fetch multilingual alert content
  useEffect(() => {
    const fetchAlert = async () => {
      try {
        const loc = targetLocation || "East Khasi Hills / NH-6 Corridor";
        const data = await apiService.getMultilingualAlert(loc, severity);
        setAlertData(data);
      } catch (e) {
        console.error(e);
      }
    };
    fetchAlert();
  }, [targetLocation, severity]);

  // Voice speech synthesis in browser
  const handlePlayVoice = (text, langCode) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      if (isPlayingAudio) {
        setIsPlayingAudio(false);
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = langCode || 'en-IN';
      utterance.rate = 0.95;
      utterance.pitch = 1.0;

      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);

      setIsPlayingAudio(true);
      window.speechSynthesis.speak(utterance);
    }
  };

  // Physical Siren Synthesizer using Web Audio API
  const handleToggleSiren = () => {
    if (isSirenOn && sirenAudioCtx) {
      sirenAudioCtx.close();
      setSirenAudioCtx(null);
      setIsSirenOn(false);
      return;
    }

    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      // Siren frequency modulation
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.5);
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 1.0);

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      setSirenAudioCtx(ctx);
      setIsSirenOn(true);

      // Auto stop siren after 4 seconds
      setTimeout(() => {
        if (ctx.state !== 'closed') {
          ctx.close();
          setSirenAudioCtx(null);
          setIsSirenOn(false);
        }
      }, 4000);
    } catch (e) {
      console.error(e);
    }
  };

  if (!alertData) return null;

  const currentMsg = alertData.translations[selectedLang] || alertData.translations['en'];

  return (
    <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-xl p-4 flex flex-col gap-3 text-slate-100 shadow-xl">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-100">Multilingual Early Warning & Siren Center</h3>
            <p className="text-[11px] text-slate-400">Broadcasting to 8 regional dialects across NER hill communities</p>
          </div>
        </div>

        {/* Physical Siren Trigger */}
        <button
          onClick={handleToggleSiren}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-md ${
            isSirenOn 
              ? 'bg-red-500 text-white animate-bounce' 
              : 'bg-slate-800 hover:bg-slate-700 text-red-400 border border-red-500/30'
          }`}
        >
          <BellRing className="w-3.5 h-3.5" />
          {isSirenOn ? "SIREN SOUNDING..." : "Test Village Siren"}
        </button>
      </div>

      {/* Language Dialect Tabs */}
      <div className="flex flex-wrap gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
        {Object.entries(alertData.translations).map(([code, item]) => (
          <button
            key={code}
            onClick={() => {
              setSelectedLang(code);
              if (isPlayingAudio) {
                window.speechSynthesis?.cancel();
                setIsPlayingAudio(false);
              }
            }}
            className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
              selectedLang === code
                ? 'bg-sky-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {item.language}
          </button>
        ))}
      </div>

      {/* Broadcast Message Preview Card */}
      <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <MessageSquare className="w-3.5 h-3.5 text-sky-400" />
            Active Dialect: <strong className="text-slate-200">{currentMsg.language}</strong>
          </span>
          <span className="text-[11px] font-mono text-slate-500">{currentMsg.sms_length} Chars (GSM Standard)</span>
        </div>

        <p className="text-sm font-medium text-slate-100 bg-slate-900/80 p-3 rounded-lg border border-slate-800 leading-relaxed font-sans">
          "{currentMsg.text}"
        </p>

        {/* Audio Speech Controls & Broadcast Channels */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          
          <button
            onClick={() => handlePlayVoice(currentMsg.text, currentMsg.lang_code)}
            className="px-3.5 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md active:scale-95"
          >
            {isPlayingAudio ? (
              <>
                <Square className="w-3.5 h-3.5" /> Stop Audio Broadcast
              </>
            ) : (
              <>
                <Volume2 className="w-3.5 h-3.5" /> Play Voice Alert (TTS)
              </>
            )}
          </button>

          <div className="flex items-center gap-1 text-[10px] text-slate-400">
            <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800">GSM SMS</span>
            <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800">IVR Voice</span>
            <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800">App Push</span>
            <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800">Panchayat Siren</span>
          </div>

        </div>
      </div>

    </div>
  );
}
